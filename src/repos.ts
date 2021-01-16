import hostedGitInfo from "hosted-git-info";
import * as path from "path";
import * as fs from "fs";
import { proofsCachePath } from "./paths";
import { cloneRepo, pullRepo } from "./git";
import { getProofs } from "./parser";
import { ProofType, ReviewType } from "./types";
import { hashUrlForFs } from "./paths";

/**
 * Fetches a crev proof repo from the given URL.
 * The URL must be a GitHub/GitLab/Bitbucket URL,
 * or a direct link to a Git repo (i.e. ending in .git).
 *
 * Unencrypted (i.e. HTTP) URLs are not supported.
 *
 * Returns the path of the repo on the filesystem.
 */
export const fetchProofsFromUrl = async (url: string): Promise<string> => {
  const gitInfo = hostedGitInfo.fromUrl(url);
  const gitPath = (gitInfo && gitInfo.https({ noGitPlus: true })) || url;
  if (!gitPath || !gitPath.startsWith("https://") || !gitPath.endsWith(".git")) {
    throw new Error(`${url} does not appear to be a valid Git repo URL`);
  }

  const outputDir = path.join(proofsCachePath, hashUrlForFs(url));
  // See if we already have the repo, in which case we'll update it
  if (fs.existsSync(outputDir)) {
    await pullRepo(outputDir);
  } else {
    // We don't have the repo already so fetch it
    await cloneRepo(gitPath, outputDir);
  }

  return outputDir;
};

export const getProofsFromRepo = async <T extends ReviewType>(
  repoPath: string,
  reviewType: T
): Promise<ProofType<T>[]> => {
  // Top-level folders in the repo correspond to crev IDs
  const folders = [];
  for (const file of await fs.promises.readdir(repoPath)) {
    const filePath = path.resolve(repoPath, file);
    const fileStats = await fs.promises.stat(filePath);
    if (fileStats.isDirectory() && file !== ".git") {
      folders.push(file);
    }
  }

  let reviewFolderName;
  switch (reviewType) {
    case "package review":
      reviewFolderName = "reviews";
      break;
    case "trust":
      reviewFolderName = "trust";
      break;
    default:
      throw new Error(`${reviewType} is not a known review type`);
  }

  // For each crev ID in the repo, get proofs
  let proofs: ProofType<T>[] = [];
  for (const folder of folders) {
    const reviewFolder = path.resolve(repoPath, folder, reviewFolderName);
    // Proof files end in `.proof.crev`
    for (const file of await fs.promises.readdir(reviewFolder)) {
      if (!file.endsWith(".proof.crev")) {
        continue;
      }
      const filePath = path.resolve(reviewFolder, file);
      const fileContents = await fs.promises.readFile(filePath);
      // TODO: might be nice not to assume utf-8 encoding
      const currentProofs = await getProofs(fileContents.toString("utf8"), reviewType);
      proofs = proofs.concat(currentProofs);
    }
  }
  return proofs;
};
