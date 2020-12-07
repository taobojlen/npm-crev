import { Command, flags } from "@oclif/command";
import * as path from "path";
import { promises as fs } from "fs";

export default class Verify extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  // static args = [{ name: "file" }];

  async run() {
    // const { args, flags } = this.parse(Verify);
    const packageJsonPath = path.resolve(process.cwd(), "./package.json");
    const contents = (await fs.readFile(packageJsonPath)).toString();
    const packageJson = JSON.parse(contents);
    const dependencies = packageJson["dependencies"] || {};
    const devDependencies = packageJson["devDependencies"] || {};
    this.log(dependencies);
    this.log(devDependencies);
  }
}
