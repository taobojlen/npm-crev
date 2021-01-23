import { spawn } from "child_process";
import path from "path";
import { promises as fs } from "fs";

import { Command, flags } from "@oclif/command";
import chalk from "chalk";

import { fetchNpmPackage, getNpmDownloadPath } from "../npm";
import { Level, PackageDetails, Rating } from "../types";
import inquirer from "inquirer";
import { createPackageReview } from "../proofs";
import recursiveDigest from "../recursiveDigest";
import { toBase64 } from "../crypto/util";
import { getUnsealedCrevId } from "../commandHelpers";

interface PackageAndVersion {
  packageName: string;
  version: string;
}
const LEVEL_CHOICES = [
  "high",
  "medium",
  "low",
  "none",
  new inquirer.Separator(),
  {
    name: "What do these options mean?",
    value: "help",
  },
];

export default class Review extends Command {
  static description = "review a package";

  static flags = {
    help: flags.help({ char: "h" }),
    version: flags.string({ char: "v", description: "the version to review" }),
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
    const packagePath = getNpmDownloadPath(
      process.env["CREV_PACKAGE"]!,
      process.env["CREV_PACKAGE_VERSION"]!
    );
    const id = await getUnsealedCrevId(this);
    const { packageName, version } = await this.readPackageJson();
    const digest = toBase64(await recursiveDigest(packagePath));
    const packageDetails: PackageDetails = {
      source: "npm",
      name: packageName,
      version,
      digest,
    };

    const thoroughness = await this.getThoroughness();
    const understanding = await this.getUnderstanding();
    const rating = await this.getRating();
    const comment = await this.getComment();
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

  private async readPackageJson(): Promise<PackageAndVersion> {
    const packageJsonPath = path.resolve(process.cwd(), "package.json");
    const packageJson = JSON.parse((await fs.readFile(packageJsonPath)).toString());
    return { packageName: packageJson.name, version: packageJson.version };
  }

  private async getThoroughness(): Promise<Level> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const responses = await inquirer.prompt([
        {
          name: "thoroughness",
          message: "How thoroughly did you review this package",
          type: "list",
          choices: LEVEL_CHOICES,
        },
      ]);
      if (responses.thoroughness === "help") {
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
        return responses.thoroughness;
      }
    }
  }

  private async getUnderstanding(): Promise<Level> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const responses = await inquirer.prompt([
        {
          name: "understanding",
          message: "How well did you understand the code",
          type: "list",
          choices: LEVEL_CHOICES,
        },
      ]);
      if (responses.understanding === "help") {
        this.log(chalk.bold("high"), "complete understanding");
        this.log(chalk.bold("medium"), "good understanding");
        this.log(chalk.bold("low"), "some parts are unclear");
        this.log(chalk.bold("none"), "lack of understanding");
      } else {
        return responses.understanding;
      }
    }
  }

  private async getRating(): Promise<Rating> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const responses = await inquirer.prompt([
        {
          name: "rating",
          message: "How do you rate this package",
          type: "list",
          choices: [
            "strong",
            "positive",
            "neutral",
            "negative",
            "dangerous",
            new inquirer.Separator(),
            {
              name: "What do these options mean?",
              value: "help",
            },
          ],
        },
      ]);
      if (responses.rating === "help") {
        this.log(chalk.bold("strong"), "secure and good in all respects, for all applications");
        this.log(chalk.bold("positive"), "secure and OK to use; possibly minor issues");
        this.log(chalk.bold("neutral"), "secure but with flaws");
        this.log(chalk.bold("negative"), "severe flaws and not OK for production usage");
        this.log(chalk.bold("dangerous"), "unsafe to use; severe flaws and/or possibly malicious");
      } else {
        return responses.rating;
      }
    }
  }

  private async getComment(): Promise<string | undefined> {
    return inquirer
      .prompt([
        {
          name: "addComment",
          message: "Do you want to add an optional comment to this package review?",
          type: "confirm",
        },
      ])
      .then(({ addComment }) => {
        if (addComment) {
          return inquirer.prompt([
            {
              name: "comment",
              message: "Enter your comment",
              type: "editor",
            },
          ]);
        }
      })
      .then((responses) => {
        if (responses && responses.comment) {
          return responses.comment.trim();
        }
      });
  }
}
