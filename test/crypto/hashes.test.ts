import { expect } from "chai";

import { toBase64 } from "../../src/crypto/util";
import { blake2bHash } from "../../src/crypto/hashes";

describe("hashing", async () => {
  it("correctly hashes with blake2b", () => {
    const testPairs = [
      ["", "DldRwCblQ7Loqy6wYJnaodHl30d3j3eH-qtFzfEv46g"],
      ["npm-crev: code review for npm", "UbnTwKnLvBXCcaLj1ueLm6RjwLBkdxR-JtzI6M4hhNU"],
      ["a".repeat(1024), "QpqNpLRBhG13qVKxap1L705AxzsQNsj4SjEnnRPsGqo"],
    ];
    testPairs.forEach(([input, output]) => {
      const buf = Buffer.from(input);
      const hashed = blake2bHash(buf);
      expect(toBase64(hashed)).to.equal(output);
    });
  });

  // TODO: argon2 test -- for various options and for backwards-compatible fallback
});
