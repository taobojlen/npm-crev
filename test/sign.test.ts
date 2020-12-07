import { expect } from "chai";

import {
  badSignatureTrustProof,
  expectedPackageProofOne,
} from "../test/helpers";
import { verifySignature } from "../src/sign";

it("verifies a valid signature", () => {
  const signatureIsValid = verifySignature(expectedPackageProofOne);
  expect(signatureIsValid).to.be.true;
});

it("does not verify a bad signature", () => {
  const signatureIsValid = verifySignature(badSignatureTrustProof);
  expect(signatureIsValid).to.be.false;
});
