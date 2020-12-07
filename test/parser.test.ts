import { promises as fs } from "fs";
import { expect } from "chai";

import { getPackageProofs, getTrustProofs } from "../src/parser";
import {
  expectedPackageProofOne,
  expectedPackageProofTwo,
  expectedTrustProof,
} from "./helpers";

it("parses a single proof file", async () => {
  const proofYaml = (
    await fs.readFile("test/data/single-package.proof.crev")
  ).toString();
  const proofs = getPackageProofs(proofYaml);
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedPackageProofOne);
});

it("parses a multiple proof file", async () => {
  const proofYaml = (
    await fs.readFile("test/data/multiple-packages.proof.crev")
  ).toString();
  const proofs = getPackageProofs(proofYaml);
  expect(proofs).to.have.lengthOf(2);
  expect(proofs.sort()).to.deep.equal(
    [expectedPackageProofOne, expectedPackageProofTwo].sort()
  );
});

it("parses a single trust proof", async () => {
  const proofYaml = (
    await fs.readFile("test/data/single-trust.proof.crev")
  ).toString();
  const proofs = getTrustProofs(proofYaml);
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedTrustProof);
});
