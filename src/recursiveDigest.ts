import { promises as fs } from "fs";
import * as path from "path";

import { blake2bHash } from "./crypto/hashes";

const statFileOrSymlink = async (pathToStat: string): Promise<any> => {
  let stat;
  try {
    stat = await fs.stat(pathToStat);
  } catch (e) {
    if (e.code === "ENOENT") {
      stat = await fs.lstat(pathToStat);
    } else {
      throw e;
    }
  }
  return stat;
};

const hashWithPrefix = (prefix: string, contents: Buffer): Buffer => {
  const prefixedContents = Buffer.concat([Buffer.from(prefix), contents]);
  return blake2bHash(prefixedContents, 64);
};

const hashFile = async (filePath: string): Promise<Buffer> => {
  const contents = await fs.readFile(filePath);
  return hashWithPrefix("F", contents);
};

const hashSymlink = async (symlinkPath: string): Promise<Buffer> => {
  const linkTarget = await fs.readlink(symlinkPath);
  return hashWithPrefix("L", Buffer.from(linkTarget));
};

const hashDirectory = async (dirPath: string): Promise<Buffer> => {
  const dirContents = await fs.readdir(dirPath);
  const dirContentHashes = await Promise.all(
    dirContents.sort().map(async (entry) => {
      const entryPath = path.join(dirPath, entry);
      const stat = await statFileOrSymlink(entryPath);
      const nameHash = blake2bHash(entry, 64);
      let contentsHash;
      if (stat.isFile()) {
        contentsHash = await hashFile(entryPath);
      } else if (stat.isDirectory()) {
        contentsHash = await hashDirectory(entryPath);
      } else if (stat.isSymbolicLink()) {
        contentsHash = await hashSymlink(entryPath);
      } else {
        throw new Error(`${entryPath} is neither a file, directory, or symlink`);
      }
      return Buffer.concat([nameHash, contentsHash]);
    })
  );
  return hashWithPrefix("D", Buffer.concat(dirContentHashes));
};

export default async (pathToHash: string): Promise<Buffer> => {
  const stat = await statFileOrSymlink(pathToHash);
  if (stat.isFile()) {
    return hashFile(pathToHash);
  } else if (stat.isDirectory()) {
    return hashDirectory(pathToHash);
  } else if (stat.isSymbolicLink()) {
    return hashSymlink(pathToHash);
  } else {
    throw new Error("Can only compute digest for files, folders, and symbolic links");
  }
};
