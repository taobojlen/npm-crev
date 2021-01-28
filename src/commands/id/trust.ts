import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import { prompt } from "enquirer";

import { getUnsealedCrevId } from "../../commandHelpers";
import { TrustLevel, User } from "../../types";
import ProofDatabase from "../../proofDatabase";
import { toBase64 } from "../../crypto/util";
import { createTrustProofs } from "../../proofs";

export default class Trust extends Command {
  static description = "publicly trust another crev ID";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  // It's a bit ugly to use a comma-separated list rather than space-separated, but
  // oclif doesn't have good support for the latter
  // https://github.com/oclif/oclif/issues/234
  static args = [
    { name: "ids", description: "comma-separated list of IDs to trust", required: true },
  ];

  async run(): Promise<void> {
    const id = await getUnsealedCrevId(this);
    const { args } = this.parse(Trust);

    // Make sure we know of the IDs we're trying to trust
    const publicKey = toBase64(id.publicKey);
    const proofDb = new ProofDatabase(publicKey);
    await proofDb.initialize();
    const users: User[] = args.ids.split(",").forEach((id: string) => {
      const user = proofDb.getUser(id);
      if (!user) {
        this.error(
          `Unknown ID ${id}. Make sure to fetch their repo first, e.g. ${chalk.blue(
            "crev id:fetch https://gitlab.com/user/crev-proofs.git"
          )}`
        );
      }
      return user;
    });

    const trustLevel = await this.getTrustLevel();
    const comment = await this.getComment();
    await createTrustProofs(id, users, trustLevel, comment);

    const pluralizedUsers = users.length > 1 ? "users" : "user";
    this.log(
      `Successfully trusted ${
        users.length
      } ${pluralizedUsers}. Make sure to share your trust proofs with the world by running ${chalk.blue(
        "crev repo:publish"
      )}`
    );
  }

  private async getTrustLevel(): Promise<TrustLevel> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { trust } = await prompt<{ trust: string }>({
        name: "trust",
        message: "How much do you trust this ID",
        type: "select",
        choices: [
          { name: "high" },
          { name: "medium" },
          { name: "low" },
          { name: "none" },
          {
            name: "----",
            role: "separator",
          },
          {
            name: "help",
            message: "What do these options mean?",
          },
        ] as any[],
      });
      if (trust === "help") {
        this.log(
          chalk.bold("high"),
          chalk.italic("'I trust this ID as much or more than myself.'"),
          "E.g. my own ID, a reputable expert, or a close colleague."
        );
        this.log(chalk.bold("medium"), "a typical, normal level of trust.");
        this.log(
          chalk.bold("low"),
          chalk.italic("'I have some reservations about trusting this ID.'")
        );
        this.log(
          chalk.bold("none"),
          chalk.italic("'I don't actually trust this ID.'"),
          "Use this to revoke trust or distrust."
        );
        this.log(chalk.bold("distrust"), chalk.italic("'I distrust this ID and so should you.'\n"));
      } else {
        return trust as TrustLevel;
      }
    }
  }

  private async getComment(): Promise<string | undefined> {
    const { addComment } = await prompt<{ addComment: boolean }>({
      name: "addComment",
      message: "Do you want to add an optional comment to this package review?",
      type: "confirm",
    });
    if (addComment) {
      const { comment } = await prompt<{ comment: string }>({
        name: "comment",
        message: "Enter your comment",
        type: "input",
      });
      return comment.trim();
    }
  }
}
