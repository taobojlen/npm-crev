import { promises as fs } from "fs";
import path from "path";

import chai, { expect } from "chai";
import chaiBytes from "chai-bytes";
import mockFs from "mock-fs";

import { blake2bHash } from "../src/crypto/hashes";
import { recursiveDigest } from "../src/recursiveDigest";

chai.use(chaiBytes);

describe("recursiveDigest", async () => {
  before(() => {
    mockFs(
      {
        "/test/a/foo": "foo",
        "/test/b": "foo",
        "/test2/a/b/c/d/e/f/g": {
          /* empty directory */
        },
      },
      { createCwd: false }
    );
  });
  after(() => {
    mockFs.restore();
  });

  it("computes digest for single files", async () => {
    const standaloneFileHash = blake2bHash(Buffer.from("Ffoo"), 64);
    const knownHash =
      "e41c3b6ac2b512af3a14eb11faed1486f693ce3bd3606afbe458e183ae4e1080a4209f44ada1c186920f541d41a192eaa654fee6792a6ac008f44f783a59176d";
    const computedHash = await recursiveDigest("/test/b");

    expect(computedHash).to.equalBytes(standaloneFileHash);
    expect(computedHash.toString("hex")).to.equal(knownHash);
  });

  it("computes digest for directories", async () => {
    const manualInput = Buffer.concat([
      Buffer.from("D"),
      Buffer.from(
        "ca002330e69d3e6b84a46a56a6533fd79d51d97a3bb7cad6c2ff43b354185d6dc1e723fb3db4ae0737e120378424c714bb982d9dc5bbd7a0ab318240ddd18f8d",
        "hex"
      ), // digest of file name
      Buffer.from(
        "e41c3b6ac2b512af3a14eb11faed1486f693ce3bd3606afbe458e183ae4e1080a4209f44ada1c186920f541d41a192eaa654fee6792a6ac008f44f783a59176d",
        "hex"
      ), // digest of file contents
    ]);
    const standaloneHash = blake2bHash(manualInput, 64);
    const computedHash = await recursiveDigest("/test/a");

    expect(computedHash).to.equalBytes(standaloneHash);
  });

  it("computes digest for directories with symlinks", async () => {
    const targetDir = "/test2/a/b/c/d/e/f/g";
    await fs.symlink("../../a", path.join(targetDir, "h"));
    const computedHash = await recursiveDigest("/test2/a");

    expect(computedHash.toString("hex")).to.equal(
      "bc97399633e1228a563d57adecf98810364526a8e7bfc24b89985c5607e77605575d10989d5954b762af45c498129854dca603688fd63bd580bbf952c650b735"
    );
  });
});
