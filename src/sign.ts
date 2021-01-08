import { sign } from "tweetnacl";

export const verifySignature = (
  rawProof: string,
  rawSignature: string,
  rawPublicKey: string
): boolean => {
  const message = Buffer.from(rawProof);
  const signature = Buffer.from(rawSignature, "base64");
  const publicKey = Buffer.from(rawPublicKey, "base64");
  return sign.detached.verify(message, signature, publicKey);
};
