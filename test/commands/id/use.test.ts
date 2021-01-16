import * as path from "path";

import { expect, test } from "@oclif/test";
import sinon from "sinon";
import tmp from "tmp";

import * as paths from "../../../src/paths";

const sandbox = sinon.createSandbox();

import * as signatures from "../../../src/crypto/signatures";
import { fromBase64, toBase64 } from "../../../src/crypto/util";
import { readObjectFromYaml } from "../../../src/util";
import { CrevConfig } from "../../../src/types";
import { generateCrevId, updateCurrentIdConfig } from "../../../src/id";

const publicKey = fromBase64("oqkPkN6dhxH2OJTye06iLqIl3PbBcQwocyUHC6h28jw");
const privateKey = fromBase64("qLwZgCN4PzynEGB95_Yp-NFzFk6NFnLK0mFmnEpWNJo");

describe("id:use", async () => {
  const randomTmpDir = tmp.dirSync().name;
  beforeEach(() => {
    sandbox.stub(paths, "getConfigFilePath").returns(path.join(randomTmpDir, "config.yaml"));
    sandbox.stub(paths, "getIdsDirPath").returns(randomTmpDir);
  });
  afterEach(() => {
    sandbox.restore();
  });

  test
    .stdout()
    .do(async () => {
      await generateCrevId("https://url.com/repo.git", "loremipsum");
      await updateCurrentIdConfig(toBase64(publicKey));
    })
    .stub(signatures, "generateKeypair", () => ({ publicKey, privateKey }))
    .do(async () => {
      await generateCrevId("https://url.com/repo.git", "loremipsum");
    })
    .command(["id:use", toBase64(publicKey)])
    .it("switches to a new ID", async () => {
      const config = await readObjectFromYaml<CrevConfig>(paths.getConfigFilePath());
      expect(config.currentId.id).to.equal(toBase64(publicKey));
    });
});
