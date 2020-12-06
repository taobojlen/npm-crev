import {
  badSignatureTrustProof,
  expectedPackageProofOne,
} from "../test/helpers";
import { verifySignature } from "./sign";

it("verifies a valid signature", () => {
  const signatureIsValid = verifySignature(expectedPackageProofOne);
  expect(signatureIsValid).toBeTruthy();
});

it("does not verify a bad signature", () => {
  const signatureIsValid = verifySignature(badSignatureTrustProof);
  expect(signatureIsValid).toBeFalsy();
});
