import envPaths from "env-paths";
import * as path from "path";
import { blake2bHash } from "./crypto/hashes";
import { toBase64 } from "./crypto/util";

// env-paths will append "-nodejs" if the directory already exists
// We want to be compatible with cargo-crev so disable this suffix
const crevPaths = envPaths("crev", { suffix: "" });

export const proofsCachePath = path.join(crevPaths.cache, "remotes");
const configPath = crevPaths.config;

/* These could be simple constants, but are functions to make stubbing easier in tests*/
export function getIdsDirPath(): string {
  return path.join(configPath, "ids");
}
export function getConfigFilePath(): string {
  return path.join(configPath, "config.yaml");
}

/**
 * Matches the format used by cargo-crev
 * i.e. https://github.com/crev-dev/cargo-crev/blob/04c6d46c7f7ba5eebbc563214b45a400e8d800b4/crev-common/src/lib.rs#L119
 */
export const hashUrlForFs = (url: string): string => {
  const trimmed = url.trim();

  // Strip protocol
  let stripped = trimmed;
  if (trimmed.startsWith("http://")) {
    stripped = trimmed.slice("http://".length);
  } else if (trimmed.startsWith("https://")) {
    stripped = trimmed.slice("https://".length);
  }

  const hash = blake2bHash(url).slice(0, 16);
  const digest = toBase64(hash);
  const sanitized = stripped.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 48);
  return `${sanitized}-${digest}`;
};
