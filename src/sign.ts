import { sign } from "tweetnacl";
import { PackageReviewProof, TrustProof } from "./types";

export const verifySignature = (
  proof: PackageReviewProof | TrustProof
): boolean => {
  const message = Buffer.from(proof.raw);
  const signature = Buffer.from(proof.signature, "base64");
  const publicKey = Buffer.from(proof.from.id, "base64");
  return sign.detached.verify(message, signature, publicKey);
};
