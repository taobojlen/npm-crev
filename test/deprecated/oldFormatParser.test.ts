import { promises as fs } from "fs";
import { expect } from "chai";

import { getPackageProofs, getTrustProofs } from "../../src/deprecated/oldFormatParser";
import {
  expectedOldPackageProofOne,
  expectedOldPackageProofTwo,
  expectedOldTrustProof,
} from "./helpers";

it("parses a single proof file", async () => {
  const proofYaml = (
    await fs.readFile("test/deprecated/data/single-package-old-format.proof.crev")
  ).toString();
  const proofs = getPackageProofs(proofYaml);
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedOldPackageProofOne);
});

it("parses a multiple proof file", async () => {
  const proofYaml = (
    await fs.readFile("test/deprecated/data/multiple-packages-old-format.proof.crev")
  ).toString();
  const proofs = getPackageProofs(proofYaml);
  expect(proofs).to.have.lengthOf(2);
  expect(proofs.sort()).to.deep.equal(
    [expectedOldPackageProofOne, expectedOldPackageProofTwo].sort()
  );
});

it("parses a single trust proof", async () => {
  const proofYaml = (
    await fs.readFile("test/deprecated/data/single-trust-old-format.proof.crev")
  ).toString();
  const proofs = getTrustProofs(proofYaml);
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedOldTrustProof);
});
