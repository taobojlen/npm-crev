import { promises as fs } from "fs";

import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import mockFs from "mock-fs";

import { DefaultMap, execPromise, fileExists, folderExists, readObjectFromYaml } from "../src/util";
import { mockCoreFolders } from "./helpers";

chai.use(chaiAsPromised);

describe("util", () => {
  before(() => {
    mockCoreFolders();
  });
  after(() => {
    mockFs.restore();
  });

  describe("execPromise", () => {
    it("resolves", async () => {
      return expect(execPromise("ls")).to.be.fulfilled;
    });

    it("rejects", async () => {
      return expect(execPromise("not-a-real-command")).to.be.rejected;
    });
  });

  describe("readObjectFromYaml", () => {
    it("reads valid YAML", async () => {
      const obj = await readObjectFromYaml("test/data/config/config.yaml");
      const expected = {
        version: -1,
        currentId: {
          idType: "crev",
          id: "geFF0hJAe-fhR2gd20tyXxVwvlmdmeBIgbRqpgSkZA4",
        },
        hostSalt: "3Ot9QsbXWGJ_vwzxgTECgWPCE7YXNMHbUqN5uVw2UjE",
      };
      expect(obj).to.deep.equal(expected);
    });
  });

  describe("fileExists", () => {
    it("returns true for existing files", async () => {
      await fs.writeFile("/file", "foo");
      return expect(fileExists("/file")).to.eventually.be.true;
    });

    it("returns false for nonexistent files", async () => {
      return expect(fileExists("/other")).to.eventually.be.false;
    });
  });

  describe("folderExists", () => {
    it("returns true for existing folders", async () => {
      await fs.mkdir("/folder");
      return expect(folderExists("/folder")).to.eventually.be.true;
    });

    it("returns false for nonexistent folders", async () => {
      return expect(folderExists("/other")).to.eventually.be.false;
    });
  });

  describe("DefaultMap", () => {
    it("handles getters", () => {
      const map = new DefaultMap<string, string[]>(() => []);
      expect(map.get("key")).to.deep.equal([]);
    });

    it("handles setters", () => {
      const map = new DefaultMap<string, string[]>(() => []);
      map.set("key", ["array"]);
      expect(map.get("key")).to.deep.equal(["array"]);
    });

    it("sets on a newly created key", () => {
      const map = new DefaultMap<string, string[]>(() => []);
      map.get("key").push("entry");
      expect(map.get("key")).to.deep.equal(["entry"]);
    });
  });
});
