import * as sodium from "sodium-native";

import { getRandomBytes, maybeConvertBase64 } from "./util";

interface KeyPair {
  publicKey: Buffer;
  privateKey: Buffer;
}
export const generateKeypair = (): KeyPair => {
  const seed = getRandomBytes(sodium.crypto_sign_SEEDBYTES);
  const publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
  const privateKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);

  // sodium.crypto_sign_keypair(publicKey, privateKey);
  sodium.crypto_sign_seed_keypair(publicKey, privateKey, seed);

  return { publicKey, privateKey: seed };
};

export const signData = (message: Buffer | string, secretKeySeed: Buffer | string): Buffer => {
  if (typeof message === "string") {
    message = Buffer.from(message);
  }
  secretKeySeed = maybeConvertBase64(secretKeySeed);
  const publicKey = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES);
  const secretKey = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES);
  sodium.crypto_sign_seed_keypair(publicKey, secretKey, secretKeySeed);
  const output = Buffer.alloc(sodium.crypto_sign_BYTES);
  sodium.crypto_sign_detached(output, message, secretKey);
  return output;
};

export const verifySignature = (
  message: Buffer | string,
  signature: Buffer | string,
  publicKey: Buffer | string
): boolean => {
  if (typeof message === "string") {
    message = Buffer.from(message);
  }
  signature = maybeConvertBase64(signature);
  publicKey = maybeConvertBase64(publicKey);
  return sodium.crypto_sign_verify_detached(signature, message, publicKey);
};
