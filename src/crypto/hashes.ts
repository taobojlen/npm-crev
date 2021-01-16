import os from "os";

import * as sodium from "sodium-native";
import argon2 from "argon2";

import { Argon2Options } from "../types";
import { maybeConvertBase64 } from "./util";

/**
 * Blake2b-256 hashing algorithm
 */
export const blake2bHash = (message: Buffer | string): Buffer => {
  if (typeof message === "string") {
    message = Buffer.from(message);
  }
  const output = Buffer.alloc(32);
  sodium.crypto_generichash(output, message);
  return output;
};

// This is a function rather than a constant for easier mocking in tests
export const getDefaultArgon2Options = (): Omit<Argon2Options, "salt"> => ({
  version: 19, // 19, i.e. 0x13, argon2 1.3
  variant: "argon2id",
  iterations: sodium.crypto_pwhash_OPSLIMIT_MODERATE,
  memorySize: 4096,
  lanes: os.cpus().length,
});

/**
 * Password-hashing function --  backwards compatible with cargo-crev.
 * Cargo-crev uses 32-byte salts in its argon2id passwords, whereas libsodium only works
 * with 16-byte ones. Hopefully we can move the crev ID format to be libsodium-compatible
 * in the future.
 */
export const cargoCrevArgon2Hash = async (
  password: string,
  options: Argon2Options
): Promise<Buffer> => {
  if (options.variant !== "argon2id") {
    throw new Error(`Unsupported argon2 variant: ${options.variant}`);
  }
  const salt = maybeConvertBase64(options.salt);
  // crev IDs store the memory cost in KB. Our argon2 library expects it in KiB.
  // const memoryCost = kiloByteToKibiByte(options.memorySize);
  // the & {raw: true} is a workaround for some weird types
  let parsedOptions: argon2.Options & { raw: true } = {
    version: options.version,
    type: argon2.argon2id,
    timeCost: options.iterations,
    memoryCost: options.memorySize,
    hashLength: 64,
    raw: true,
    salt,
  };
  if (options.lanes) {
    parsedOptions = { ...parsedOptions, parallelism: options.lanes };
  }
  return await argon2.hash(password, parsedOptions);
};

// const getHashIdentifier = (variant: string, version: number) => {
//   switch (`${variant}-${version}`) {
//     case "argon2id-19":
//       return sodium.crypto_pwhash_ALG_ARGON2ID13;
//     default:
//       throw new Error(`Unknown hash format: variant ${variant}, version ${version}`);
//   }
// };
/**
 * Argon2 hashing algorithm -- for passwords
 */
// export const argon2Hash = (password: string, options: Argon2Options): Buffer => {
//   const output = Buffer.alloc(64);
//   sodium.crypto_pwhash(
//     output,
//     Buffer.from(password),
//     fromBase64(options.salt),
//     options.iterations,
//     options.memorySize,
//     getHashIdentifier(options.variant, options.version)
//   );
//   return output;
// };
