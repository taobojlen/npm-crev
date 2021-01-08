import { Command, flags } from "@oclif/command";
import * as path from "path";
import { get } from "lodash";
import cli from "cli-ux";
import { promises as fs } from "fs";
import * as semver from "semver";
import ProofDatabase from "../proofDatabase";

interface DependencyRow {
  dependency: string;
  version: string;
  status?: string;
  reviews: number;
}

export default class Verify extends Command {
  static description = "verify the trust levels of dependencies in the current project";

  // TODO: add flag to also verify transitive dependencies
  static flags = {
    help: flags.help({ char: "h" }),
  };

  // static args = [{ name: "file" }];

  async run(): Promise<void> {
    // const { flags } = this.parse(Verify);

    // TODO: support yarn.lock
    // Load project dependencies from lockfile
    const lockfilePath = path.resolve(process.cwd(), "./package-lock.json");
    const contents = (await fs.readFile(lockfilePath)).toString();
    const lockfile = JSON.parse(contents);
    if (lockfile.lockfileVersion !== 2) {
      throw new Error("crev requires npm lockfile version 2");
    }

    // The package indexed by the empty string in package-lock.json is the root project
    const dependencies = {
      ...lockfile.packages[""].dependencies,
      ...lockfile.packages[""].devDependencies,
    };

    const proofDb = new ProofDatabase();
    proofDb.initialize();

    const rows: DependencyRow[] = Object.entries(dependencies).map(([dependency, versionRange]) => {
      // Get resolved dependency version from lockfile
      const resolvedVersion = get(lockfile, ["dependencies", dependency, "version"]);

      // Verify that lockfile version matches given version range
      if (!semver.satisfies(resolvedVersion, versionRange as string)) {
        throw new Error(
          `${dependency} specifies version range ${versionRange}, but lockfile has ${resolvedVersion}`
        );
      }

      // TODO: compute the digest ourselves
      const digest = get(lockfile, ["dependencies", dependency, "integrity"]);
      const { status, reviewCount } = proofDb.verify(digest);

      return {
        dependency,
        version: resolvedVersion,
        status,
        reviews: reviewCount,
      };
    });

    cli.table(rows, {
      dependency: {},
      version: {},
      status: {},
      reviews: {},
    });
  }
}
