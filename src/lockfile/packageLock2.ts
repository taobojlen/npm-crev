import { promises as fs } from "fs";

import { get } from "lodash";

import BaseLockfile from "./baseLockfile";
import { Dependency } from "../types";

export default class PackageLock2 implements BaseLockfile {
  private lockfilePath: string;

  constructor(lockfilePath: string) {
    this.lockfilePath = lockfilePath;
  }

  async check(): Promise<boolean> {
    const contents = (await fs.readFile(this.lockfilePath)).toString();
    try {
      const lockfile = JSON.parse(contents);
      return lockfile.lockfileVersion === 2;
    } catch {
      return false;
    }
  }

  async getDependencies(): Promise<Dependency[]> {
    const contents = (await fs.readFile(this.lockfilePath)).toString();
    const lockfile = JSON.parse(contents);
    // The package indexed by the empty string in package-lock.json is the root project
    const dependencies = {
      ...lockfile.packages[""].dependencies,
      ...lockfile.packages[""].devDependencies,
    };
    return Object.entries(dependencies).map(([dependency]) => {
      const details = get(lockfile, ["dependencies", dependency]);
      return {
        name: dependency,
        version: details.version,
        type: details.dev ? "dev" : "normal",
      };
    });
  }
}
