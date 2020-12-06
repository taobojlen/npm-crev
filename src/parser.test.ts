import { getPackageProofs, getTrustProofs } from "./parser";
import { promises as fs } from "fs";
import {
  expectedPackageProofOne,
  expectedPackageProofTwo,
  expectedTrustProof,
} from "../test/helpers";

it("parses a single proof file", async () => {
  const proofYaml = (
    await fs.readFile("test/data/single-package.proof.crev")
  ).toString();
  const proofs = getPackageProofs(proofYaml);
  expect(proofs.length).toBe(1);
  expect(proofs[0]).toStrictEqual(expectedPackageProofOne);
});

it("parses a multiple proof file", async () => {
  const proofYaml = (
    await fs.readFile("test/data/multiple-packages.proof.crev")
  ).toString();
  const proofs = getPackageProofs(proofYaml);
  expect(proofs.length).toBe(2);
  expect(proofs.sort()).toStrictEqual(
    [expectedPackageProofOne, expectedPackageProofTwo].sort()
  );
});

it("parses a single trust proof", async () => {
  const proofYaml = (
    await fs.readFile("test/data/single-trust.proof.crev")
  ).toString();
  const proofs = getTrustProofs(proofYaml);
  expect(proofs.length).toBe(1);
  expect(proofs[0]).toStrictEqual(expectedTrustProof);
});
