import mockFs from "mock-fs";
import { mockCoreFolders } from "../../helpers";

import { expect, test } from "@oclif/test";

import * as paths from "../../../src/paths";
import { listFiles } from "../../helpers";

describe("id:create", () => {
  test
    .do(() => {
      mockCoreFolders({
        "~/.config": mockFs.directory(),
      });
    })
    .finally(() => {
      mockFs.restore();
    })
    .stdout()
    .command([
      "id:create",
      "--url",
      "https://github.com/user/crev-proofs.git",
      "--passphrase",
      "hello",
    ])
    .it("creates a new ID", async (ctx) => {
      expect(ctx.stdout).to.contain("Your new ID");
      expect(ctx.stdout).to.contain("was saved to");
      const idDirFilenames = await listFiles(paths.getIdsDirPath());
      expect(idDirFilenames.length).to.equal(1);
    });
});
