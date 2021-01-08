import * as envPaths from "env-paths";
import * as path from "path";
import * as blake2 from "blake2";

import { binaryToBase64 } from "./util";

// env-paths will append "-nodejs" if the directory already exists
// We want to be compatible with cargo-crev so disable this suffix
const crevPaths = envPaths("crev", { suffix: "" });

export const npmCachePath = path.join(crevPaths.cache, "npm");
export const proofsCachePath = path.join(crevPaths.cache, "remotes");
export const configPath = crevPaths.config;

/**
 * Matches the format used by cargo-crev
 * i.e. https://github.com/crev-dev/cargo-crev/blob/04c6d46c7f7ba5eebbc563214b45a400e8d800b4/crev-common/src/lib.rs#L119
 */
export const sanitizeUrlForFs = (url: string): string => {
  const trimmed = url.trim();

  // Strip protocol
  let stripped = trimmed;
  if (trimmed.startsWith("http://")) {
    stripped = trimmed.slice("http://".length);
  } else if (trimmed.startsWith("https://")) {
    stripped = trimmed.slice("https://".length);
  }

  const hasher = blake2.createHash("blake2b", { digestLength: 32 }); // blake2b-256
  hasher.update(Buffer.from(trimmed));
  const rawDigest = hasher.digest("binary").slice(0, 16);
  const digest = binaryToBase64(rawDigest);

  const sanitized = stripped.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 48);
  return `${sanitized}-${digest}`;
};
