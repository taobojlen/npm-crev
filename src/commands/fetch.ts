import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import chalk from "chalk";
import { uniqBy } from "lodash";

import ProofDatabase from "../proofDatabase";
import { fetchProofsFromUrl, getProofsFromRepo } from "../repos";

export default class Fetch extends Command {
  static description = "fetch proofs from other users";

  // TODO: move this to subcommand of ID
  static flags = {
    help: flags.help({ char: "h" }),
    url: flags.string({ description: "URL of a git repo" }),
    update: flags.boolean({ description: "update proofs from trusted users" }),
    all: flags.boolean({ description: "fetch all repos we know of" }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Fetch);
    if (flags.url && flags.update) {
      this.error("--url and --update cannot be used together");
    } else if (!flags.url && !flags.update && !flags.all) {
      this.error("Please specify either --url or --update");
    }

    if (flags.url) {
      cli.action.start(`Fetching ${flags.url}`);
      const repoPath = await fetchProofsFromUrl(flags.url);
      // Fetched the repo; now parse it for package/trust proofs
      cli.action.stop();
      const packageReviews = await getProofsFromRepo(repoPath, "package review");
      const trustProofs = await getProofsFromRepo(repoPath, "trust");
      this.log(
        `Found ${packageReviews.length} package reviews and ${trustProofs.length} trust proofs`
      );
    }

    if (flags.update) {
      this.error("not implemented"); // TODO
    }

    if (flags.all) {
      cli.action.start("Fetching repos");
      const proofDb = new ProofDatabase();
      await proofDb.initialize();
      const users = uniqBy(
        proofDb.listUsers().filter((user) => !!user.url),
        ({ url }) => url
      );
      let count = 0;
      for (const user of users) {
        try {
          count += 1;
          cli.action.status = `(${count}/${users.length}) ${user.url}`;
          await fetchProofsFromUrl(user.url);
        } catch (e) {
          this.log(chalk.red(`Could not fetch ${user.url}`));
        }
      }
      await proofDb.initialize();
      cli.action.stop();
      this.log(`Found ${proofDb.listUsers().length - users.length} new users`);
    }
  }
}
