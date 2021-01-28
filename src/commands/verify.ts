import path from "path";

import { Command, flags } from "@oclif/command";
import cli from "cli-ux";
import chalk from "chalk";

import ProofDatabase from "../proofDatabase";
import { fileExists, folderExists } from "../util";
import PackageLock2 from "../lockfile/packageLock2";
import recursiveDigest from "../recursiveDigest";
import { toBase64 } from "../crypto/util";
import { assertCrevIdExists } from "../commandHelpers";
import { DependencyType } from "../types";

interface DependencyRow {
  dependency: string;
  type: DependencyType;
  version: string;
  status?: string;
  reviews: number;
}

export default class Verify extends Command {
  static description = "verify your project's dependencies";

  // TODO: add flag to also verify transitive dependencies
  static flags = {
    help: flags.help({ char: "h" }),
  };

  static args = [{ name: "lockfile", description: "path to a npm lockfile" }];

  async run(): Promise<void> {
    const currentId = await assertCrevIdExists(this);

    const { args } = this.parse(Verify);
    let lockfilePaths;
    if (args.lockfile) {
      lockfilePaths = [args.lockfile];
    } else {
      lockfilePaths = [
        "package-lock.json",
        "package-shrinkwrap.json",
        // "yarn.lock" // TODO
      ].map((l) => path.join(process.cwd(), l));
    }

    // Load project dependencies from lockfile
    const lockfileExistence = await Promise.all(
      lockfilePaths.map(async (lockfile) => {
        const exists = await fileExists(lockfile);
        return { lockfile, exists };
      })
    );
    const foundLockfiles = lockfileExistence
      .filter(({ exists }) => exists)
      .map(({ lockfile }) => lockfile);
    let lockfilePath;
    if (foundLockfiles.length > 1) {
      this.error(
        `Found more than one lockfile in the current directory. Please choose one to verify, e.g. ${chalk.blue(
          "crev verify package-lock.json"
        )}.`
      );
    } else if (foundLockfiles.length === 0) {
      this.error(
        `Couldn't find a lockfile. Try passing one with e.g. ${chalk.blue(
          "crev verify /path/to/package-lock.json"
        )}`
      );
    } else {
      lockfilePath = foundLockfiles[0];
    }

    // Parse the lockfile
    const parsedLockfiles = await Promise.all(
      [new PackageLock2(lockfilePath)].map(async (l) => {
        const isValid = await l.check();
        return {
          parsed: l,
          isValid,
        };
      })
    );
    const lockfile = parsedLockfiles
      .filter(({ isValid }) => isValid)
      .map(({ parsed }) => parsed)[0];
    const dependencies = await lockfile.getDependencies();

    const proofDb = new ProofDatabase(toBase64(currentId.publicKey));
    proofDb.initialize();

    const rows: DependencyRow[] = await Promise.all(
      dependencies.map(async ({ name, version, type }) => {
        const dependencyPath = path.join("node_modules", name);
        let digest;
        if (await folderExists(dependencyPath)) {
          digest = toBase64(await recursiveDigest(dependencyPath));
        } else {
          this.error(
            `Couldn't find files for ${name} in node_modules. Please install dependencies before verifying.`
          );
        }
        const { status, reviewCount } = proofDb.verify(digest);

        return {
          dependency: name,
          version,
          type,
          status,
          reviews: reviewCount,
        };
      })
    );

    cli.table(
      rows,
      {
        dependency: {},
        version: {},
        type: {},
        status: {},
        reviews: {},
      },
      {
        sort: "-type,name",
      }
    );
  }
}
