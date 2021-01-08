import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import { fetchProofsFromUrl, getProofsFromRepo } from "../repos";

export default class Fetch extends Command {
  static description = "fetch remote proofs";

  static flags = {
    help: flags.help({ char: "h" }),
    url: flags.string({ description: "URl of a git repo" }),
    update: flags.boolean({ description: "update proofs from trusted users" }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Fetch);
    if (flags.url && flags.update) {
      this.error("--url and --update cannot be used together");
      return;
    } else if (!flags.url && !flags.update) {
      this.error("Please specify either --url or --update");
      return;
    }

    cli.action.start(`Fetching ${flags.url}`);
    if (flags.url) {
      const repoPath = await fetchProofsFromUrl(flags.url);
      // Fetched the repo; now parse it for package/trust proofs
      cli.action.stop();
      const packageReviews = await getProofsFromRepo(repoPath, "package review");
      const trustProofs = await getProofsFromRepo(repoPath, "trust");
      this.log(
        `Found ${packageReviews.length} package reviews and ${trustProofs.length} trust proofs`
      );
    }
  }
}
