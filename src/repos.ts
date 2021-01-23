import hostedGitInfo from "hosted-git-info";
import * as path from "path";
import { promises as fs } from "fs";
import { proofsCachePath } from "./paths";
import { cloneRepo, pullRepo } from "./git";
import { getProofs } from "./parser";
import { ProofType, ReviewType } from "./types";
import { hashUrlForFs } from "./paths";
import { folderExists } from "./util";

/**
 * Fetches a crev proof repo from the given URL.
 * The URL must be a GitHub/GitLab/Bitbucket URL,
 * or a direct link to a Git repo.
 *
 * Unencrypted (i.e. HTTP) URLs are not supported.
 *
 * Returns the path of the repo on the filesystem.
 */
export const fetchProofsFromUrl = async (url: string): Promise<string> => {
  const gitInfo = hostedGitInfo.fromUrl(url);
  const gitPath = gitInfo ? gitInfo.https({ noGitPlus: true, noCommittish: true }) : url;
  if (!gitPath || !gitPath.startsWith("https://")) {
    throw new Error(`${url} does not appear to be a valid Git repo URL`);
  }

  const outputDir = path.join(proofsCachePath, hashUrlForFs(url));
  // See if we already have the repo, in which case we'll update it
  if (await folderExists(outputDir)) {
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
  for (const file of await fs.readdir(repoPath)) {
    const filePath = path.resolve(repoPath, file);
    const fileStats = await fs.stat(filePath);
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
    if (!(await folderExists(reviewFolder))) {
      return [];
    }
    // Proof files end in `.proof.crev`
    for (const file of await fs.readdir(reviewFolder)) {
      if (!file.endsWith(".proof.crev")) {
        continue;
      }
      const filePath = path.resolve(reviewFolder, file);
      const fileContents = await fs.readFile(filePath);
      // TODO: might be nice not to assume utf-8 encoding
      const currentProofs = getProofs(fileContents.toString("utf8"), reviewType);
      proofs = proofs.concat(currentProofs);
    }
  }
  return proofs;
};
