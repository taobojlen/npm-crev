import { expect } from "chai";

import { toBase64, fromBase64 } from "../../src/crypto/util";

describe("base64", () => {
  it("handles padding as per RFC4648", () => {
    const ioPairs = [
      ["", ""],
      ["f", "Zg"],
      ["fo", "Zm8"],
      ["foo", "Zm9v"],
      ["foob", "Zm9vYg"],
      ["fooba", "Zm9vYmE"],
      ["foobar", "Zm9vYmFy"],
    ];
    ioPairs.forEach(([input, output]) => {
      const buf = Buffer.from(input);
      expect(toBase64(buf)).to.equal(output);
    });
  });

  it("works with its own output", () => {
    const testStrings = ["", "npm-crev: code review for npm", "a".repeat(1024)];
    testStrings.forEach((testString) => {
      const buf = Buffer.from(testString);
      const b64 = toBase64(buf);
      const processed = fromBase64(b64).toString();
      expect(processed).to.equal(testString);
    });
  });
});
