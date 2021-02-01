import { expect, test } from "@oclif/test";
import mockFs from "mock-fs";

import * as paths from "../../../src/paths";

import * as signatures from "../../../src/crypto/signatures";
import { fromBase64, toBase64 } from "../../../src/crypto/util";
import { readObjectFromYaml } from "../../../src/util";
import { CrevConfig } from "../../../src/types";
import { generateCrevId, updateCurrentIdConfig } from "../../../src/id";
import { mockCoreFolders } from "../../helpers";

const publicKey = fromBase64("oqkPkN6dhxH2OJTye06iLqIl3PbBcQwocyUHC6h28jw");
const privateKey = fromBase64("qLwZgCN4PzynEGB95_Yp-NFzFk6NFnLK0mFmnEpWNJo");

describe("id:use", () => {
  test
    .stub(signatures, "generateKeypair", () => ({ publicKey, privateKey }))
    .do(async () => {
      mockCoreFolders();
      await generateCrevId("https://url.com/repo.git", "loremipsum");
      await updateCurrentIdConfig(toBase64(publicKey));
      await generateCrevId("https://url.com/repo.git", "loremipsum");
    })
    .finally(() => {
      mockFs.restore();
    })
    .stdout()
    .command(["id:use", toBase64(publicKey)])
    .it("switches to a new ID", async () => {
      const config = await readObjectFromYaml<CrevConfig>(paths.getConfigFilePath());
      expect(config.currentId.id).to.equal(toBase64(publicKey));
    });
});
