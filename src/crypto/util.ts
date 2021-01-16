import * as sodium from "sodium-native";

export const generatePasswordSalt = async (): Promise<Buffer> =>
  getRandomBytes(sodium.crypto_pwhash_SALTBYTES);

export const maybeConvertBase64 = (input: Buffer | string): Buffer => {
  if (Buffer.isBuffer(input)) {
    return input;
  } else if (typeof input === "string") {
    return fromBase64(input);
  } else {
    throw new Error(`Cannot convert type to Buffer: ${typeof input}`);
  }
};

export const getRandomBytes = (numBytes: number): Buffer => {
  const buf = Buffer.alloc(numBytes);
  sodium.randombytes_buf(buf);
  return buf;
};

/**
 * Converts a Buffer to a base64 string.
 */
export const toBase64 = (data: Buffer): string =>
  data.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

/**
 * Decodes a base64 string to a Buffer.
 */
// Note: Buffer.from(x, "base64") natively accepts URL- and filename-safe base64.
export const fromBase64 = (data: string): Buffer => Buffer.from(data, "base64");
