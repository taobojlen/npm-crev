import { expect } from "chai";

import PackageLock2 from "../../src/lockfile/packageLock2";

describe("PackageLock2 (package-lock.json version 2)", () => {
  describe("check", () => {
    it("returns true for a valid lockfile", async () => {
      const lockfile = new PackageLock2("test/data/package-lock-2.json");
      const isPackageLockVersion2 = await lockfile.check();
      expect(isPackageLockVersion2).to.be.true;
    });

    it("returns false for a yarn lockfile", async () => {
      const lockfile = new PackageLock2("test/data/yarn.lock");
      const isPackageLockVersion2 = await lockfile.check();
      expect(isPackageLockVersion2).to.be.false;
    });
  });

  describe("getDependencies", () => {
    it("gets all dependencies", async () => {
      const lockfile = new PackageLock2("test/data/package-lock-2.json");
      const dependencies = await lockfile.getDependencies();
      const expectedDependencies = [
        { name: "lodash", version: "4.17.20", type: "normal" },
        { name: "tslib", version: "2.1.0", type: "normal" },
        { name: "@types/lodash", version: "4.14.167", type: "dev" },
      ];
      expect(dependencies.sort()).to.deep.equal(expectedDependencies.sort());
    });
  });
});
