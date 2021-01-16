import { TextDecoder } from "util";

import { expect } from "chai";

import { encrypt, decrypt } from "../../src/crypto/encryption";
import { getRandomBytes } from "../../src/crypto/util";

describe("encryption", async () => {
  it("encrypts and decrypts", async () => {
    const key = getRandomBytes(32);
    const nonce = getRandomBytes(32);
    const plaintext = "npm-crev: code review for npm";
    const ciphertext = await encrypt(key, plaintext, nonce);
    expect(ciphertext).to.not.equal(plaintext);
    const decrypted = await decrypt(key, ciphertext, nonce);
    const textDecoder = new TextDecoder("utf-8");
    expect(textDecoder.decode(decrypted)).to.equal(plaintext);
  });
});
