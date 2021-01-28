import { spawn } from "child_process";

import { Command, flags } from "@oclif/command";
import chalk from "chalk";

import { fetchNpmPackage, getNpmDownloadPath } from "../npm";
import { Level, levels, PackageDetails, Rating, ratings } from "../types";
import { prompt } from "enquirer";
import { createPackageReview } from "../proofs";
import recursiveDigest from "../recursiveDigest";
import { toBase64 } from "../crypto/util";
import { getUnsealedCrevId } from "../commandHelpers";

const LEVEL_CHOICES = [
  { name: "high" },
  { name: "medium" },
  { name: "low" },
  { name: "none" },
  {
    name: "----",
    role: "separator",
  },
  {
    message: "What do these options mean?",
    name: "help",
  },
];

export default class Review extends Command {
  static description = "review a package";

  static flags = {
    help: flags.help({ char: "h" }),
    version: flags.string({ char: "v", description: "the version to review" }),
    thoroughness: flags.string({
      description: "how thoroughly you reviewed the package",
      options: [...levels],
    }),
    understanding: flags.string({
      description: "how well you understood the code",
      options: [...levels],
    }),
    rating: flags.string({ description: "your rating of the package", options: [...ratings] }),
    comment: flags.string({ description: "an optional comment for your package review" }),
    "skip-comment": flags.boolean({
      description: "don't prompt for a comment if one isn't passed",
    }),
  };

  static args = [{ name: "package", description: "the name of the package to review" }];

  async run(): Promise<void> {
    const { args, flags } = this.parse(Review);
    if (!args.package) {
      // Find out if we're in a package review shell
      if (!process.env["CREV_PACKAGE"] || !process.env["CREV_PACKAGE_VERSION"]) {
        this.error(
          `Please pass the name of the package you want to review, e.g. ${chalk.blue(
            "crev review lodash"
          )}`
        );
      }
      await this.finalizePackageReview();
      return;
    }

    const { downloadPath, version } = await fetchNpmPackage(args.package, flags.version);
    this.log(`Opening shell in ${downloadPath}`);
    this.log(`Use ${chalk.blue("exit")} or Ctrl-D to return to the original project.`);
    this.log(`Use ${chalk.blue("crev review")} without any arguments to review this package.`);
    this.spawnShell(args.package, version, downloadPath);
  }

  /**
   * If we're inside a review shell,
   * actually create the review
   */
  private async finalizePackageReview() {
    const { flags } = this.parse(Review);

    const packageName = process.env["CREV_PACKAGE"]!;
    const version = process.env["CREV_PACKAGE_VERSION"]!;

    const packagePath = getNpmDownloadPath(packageName, version);
    const id = await getUnsealedCrevId(this);
    const digest = toBase64(await recursiveDigest(packagePath));
    const packageDetails: PackageDetails = {
      source: "npm",
      name: packageName,
      version,
      digest,
    };

    const thoroughness = (flags.thoroughness as Level) || (await this.getThoroughness());
    const understanding = (flags.understanding as Level) || (await this.getUnderstanding());
    const rating = (flags.rating as Rating) || (await this.getRating());
    let comment;
    if (flags.comment) {
      comment = flags.comment;
    } else if (flags["skip-comment"]) {
      // do nothing
    } else {
      comment = await this.getComment();
    }
    await createPackageReview(id, packageDetails, thoroughness, understanding, rating, comment);
    this.log(`Saved your review of ${packageName}@${version}.`);
    this.log(`Make sure to share your reviews by running ${chalk.blue("crev repo:publish")}`);
  }

  private async spawnShell(packageName: string, version: string, cwd: string) {
    const userShell = process.env["SHELL"] || "/bin/sh";
    spawn(userShell, [], {
      cwd,
      env: {
        ...process.env,
        CREV_PACKAGE: packageName,
        CREV_PACKAGE_VERSION: version,
      },
      stdio: "inherit",
    });
  }

  private async getThoroughness(): Promise<Level> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { thoroughness } = await prompt<{ thoroughness: string }>([
        {
          name: "thoroughness",
          message: "How thoroughly did you review this package",
          type: "select",
          choices: LEVEL_CHOICES,
        },
      ]);
      if (thoroughness === "help") {
        this.log(
          chalk.bold("high"),
          "long, deep, focused review, possibly as part of a formal security review"
        );
        this.log(
          chalk.bold("medium"),
          "a standard focused code review of a decent depth",
          chalk.italic("~15 minutes per file")
        );
        this.log(chalk.bold("low"), "low intensity review;", chalk.italic("~2 minutes per file"));
        this.log(
          chalk.bold("none"),
          "no review, or just skimming",
          chalk.italic("seconds per file")
        );
      } else {
        return thoroughness as Level;
      }
    }
  }

  private async getUnderstanding(): Promise<Level> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { understanding } = await prompt<{ understanding: string }>([
        {
          name: "understanding",
          message: "How well did you understand the code",
          type: "select",
          choices: LEVEL_CHOICES,
        },
      ]);
      if (understanding === "help") {
        this.log(chalk.bold("high"), "complete understanding");
        this.log(chalk.bold("medium"), "good understanding");
        this.log(chalk.bold("low"), "some parts are unclear");
        this.log(chalk.bold("none"), "lack of understanding");
      } else {
        return understanding as Level;
      }
    }
  }

  private async getRating(): Promise<Rating> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { rating } = await prompt<{ rating: string }>([
        {
          name: "rating",
          message: "How do you rate this package",
          type: "select",
          choices: [
            { name: "strong" },
            { name: "positive" },
            { name: "neutral" },
            { name: "negative" },
            { name: "dangerous" },
            { name: "----", role: "separator" } as any,
            {
              name: "help",
              message: "What do these options mean?",
            },
          ],
        },
      ]);
      if (rating === "help") {
        this.log(chalk.bold("strong"), "secure and good in all respects, for all applications");
        this.log(chalk.bold("positive"), "secure and OK to use; possibly minor issues");
        this.log(chalk.bold("neutral"), "secure but with flaws");
        this.log(chalk.bold("negative"), "severe flaws and not OK for production usage");
        this.log(chalk.bold("dangerous"), "unsafe to use; severe flaws and/or possibly malicious");
      } else {
        return rating as Rating;
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
