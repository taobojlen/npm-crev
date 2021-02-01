import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import path from "path";
import { promises as fs } from "fs";
import sinon from "sinon";
import mockFs from "mock-fs";

import { fromBase64, toBase64 } from "../src/crypto/util";
import { unsealCrevId, generateCrevId } from "../src/id";
import * as paths from "../src/paths";
import * as cryptoUtil from "../src/crypto/util";
import * as cryptoSignatures from "../src/crypto/signatures";
import * as cryptoHashes from "../src/crypto/hashes";
import { mockCoreFolders } from "./helpers";

chai.use(chaiAsPromised);
const sandbox = sinon.createSandbox();

describe("unsealCrevId", async () => {
  beforeEach(() => {
    sandbox.stub(paths, "getIdsDirPath").returns("test/data/config/ids");
  });
  afterEach(() => {
    sandbox.restore();
  });

  it("reads a valid crev ID from cargo-crev", async () => {
    const publicKey = "Nuy3sbI8VGinIaM96OWFjO4j7ULL-iOzxRva123T1uA";
    const password = "hello";
    const id = await unsealCrevId(publicKey, password);
    expect(id).to.deep.equal({
      version: -1,
      url: "https://gitlab.com/tao_oat/crev-proofs.git",
      publicKey: fromBase64("Nuy3sbI8VGinIaM96OWFjO4j7ULL-iOzxRva123T1uA"),
      privateKey: fromBase64("01rL0TNHd7Rjwb5adv1wGy370DCyZFqLcoDgvYkOPos"),
    });
  });

  it("fails to read a cargo-crev ID with an invalid password", async () => {
    const publicKey = "Nuy3sbI8VGinIaM96OWFjO4j7ULL-iOzxRva123T1uA";
    const password = "wrongpassword";
    expect(unsealCrevId(publicKey, password)).to.be.rejectedWith(Error);
  });
});

describe("generateCrevId", async () => {
  beforeEach(() => {
    sandbox.stub(cryptoHashes, "getDefaultArgon2Options").returns({
      version: 19,
      variant: "argon2id",
      iterations: 3,
      memorySize: 4096,
      lanes: 4,
    });
    mockCoreFolders();
  });
  afterEach(() => {
    sandbox.restore();
    mockFs.restore();
  });

  it("generates a valid ID", async () => {
    // Stub crypto's random generators
    const publicKeyB64 = "geFF0hJAe-fhR2gd20tyXxVwvlmdmeBIgbRqpgSkZA4";
    const publicKey = fromBase64(publicKeyB64);
    const privateKey = fromBase64("A8PYe36ozA0PowFX2f-AC3q4ws_kHecD8p95b0dJqBI");
    const passwordSalt = fromBase64("wGhvTjN5_3yE1DpZ1jYQRg");
    const encryptionNonce = fromBase64("yHZ3lEKo2GU1vHiTieq7MrVOl4ZYmMNGous6nUf4yTA");
    sandbox.stub(cryptoSignatures, "generateKeypair").returns({ publicKey, privateKey });
    sandbox.stub(cryptoUtil, "generatePasswordSalt").resolves(passwordSalt);
    sandbox.stub(cryptoUtil, "getRandomBytes").returns(encryptionNonce);

    const url = "https://gitlab.com/tao_oat/crev-proofs.git";
    const password = "hello";
    const id = await generateCrevId(url, password);

    expect(id).to.deep.equal({
      version: -1,
      url,
      publicKey,
      privateKey,
    });
    const generatedId = await fs.readFile(path.join(paths.getIdsDirPath(), `${publicKeyB64}.yaml`));
    const expectedId = await fs.readFile(path.join("test/data/config/ids", `${publicKeyB64}.yaml`));
    expect(generatedId.toString()).to.equal(expectedId.toString());
  });

  it("reads an ID it generated itself", async () => {
    // Generate and save the ID
    const url = "https://github.com/username/crev-proofs.git";
    const password = "loremipsum";
    const originalId = await generateCrevId(url, password);

    // Unseal it again
    const publicKey = toBase64(originalId.publicKey);
    const unsealedId = await unsealCrevId(publicKey, password);

    expect(unsealedId).to.deep.equal(originalId);
  });
});
