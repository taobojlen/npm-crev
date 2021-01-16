import * as path from "path";

import { expect, test } from "@oclif/test";
import tmp from "tmp";
import sinon from "sinon";

import * as paths from "../../../src/paths";
import { listFiles } from "../../helpers";

const sandbox = sinon.createSandbox();

describe("id:create", () => {
  const randomTmpDir = tmp.dirSync().name;
  beforeEach(() => {
    sandbox.stub(paths, "getIdsDirPath").returns(randomTmpDir);
    sandbox.stub(paths, "getConfigFilePath").returns(path.join(randomTmpDir, "config.yaml"));
  });
  afterEach(() => {
    sandbox.restore();
  });

  test
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
      expect(idDirFilenames.length).to.equal(2); // one is config file
    });
});
