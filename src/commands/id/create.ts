import * as path from "path";

import { Command, flags } from "@oclif/command";
import { prompt } from "enquirer";
import hostedGitInfo from "hosted-git-info";
import chalk from "chalk";

import { toBase64 } from "../../crypto/util";
import { generateCrevId } from "../../id";
import { getIdsDirPath } from "../../paths";

export default class Create extends Command {
  static description = "create a new crev ID";

  static flags = {
    help: flags.help({ char: "h" }),
    url: flags.string({ char: "u", description: "URL of the associated Git repo" }),
    passphrase: flags.string({ char: "p", description: "passphrase to encrypt your private key" }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(Create);
    let url;

    if (flags.url) {
      url = flags.url;
    } else {
      this.log(
        "Every Crev ID is tied to a Git repo where you can publish your public key and proofs."
      );
      const response = await prompt<{ url: string }>({
        type: "input",
        message: "Git repo URL",
        name: "url",
      });
      url = response.url;
    }
    const gitInfo = hostedGitInfo.fromUrl(url, { noCommittish: true, noGitPlus: true });
    if (gitInfo) {
      url = gitInfo.https();
    }
    this.log(`Using URL ${url}.`);
    // TODO: clone repo and fail if not exists or if that ID already exists elsewhere in the DB

    let password;
    if (flags.passphrase) {
      password = flags.passphrase;
    } else {
      this.log("Your Crev ID will be protected by a passphrase.");
      this.log(
        chalk.underline("If you forget this passphrase, there is no way to recover your ID.")
      );
      let passwordsMatch = false;
      while (!passwordsMatch) {
        password = (
          await prompt<{ password: string }>({
            type: "password",
            name: "password",
            message: "Passphrase",
          })
        ).password;
        const passwordConfirmation = (
          await prompt<{ passwordConfirmation: string }>({
            type: "password",
            name: "passwordConfirmation",
            message: "Confirm passphrase",
          })
        ).passwordConfirmation;
        passwordsMatch = password === passwordConfirmation;
        if (!passwordsMatch) {
          this.log(chalk.red("Passphrases did not match; please try again."));
        }
      }
    }

    const { publicKey } = await generateCrevId(url, password as string);
    const publicKeyB64 = toBase64(publicKey);
    const idPath = path.join(getIdsDirPath(), `${publicKeyB64}.yaml`);
    this.log(`Your new ID, ${publicKeyB64}, was saved to ${idPath}.`);
  }
}
