import { execPromise } from "./util";

const getHeadBranch = async (repoPath: string) => {
  // TODO: don't assume that the remote is called origin
  const command = "git remote show origin";
  return execPromise(command, repoPath).then((remote) => {
    const matches = remote.matchAll(/\n\s+HEAD branch: (?<branchName>.+)\n/g);
    if (!matches) {
      throw new Error(`Could not parse output of "git remote show origin" in ${repoPath}`);
    }
    return matches.next().value[1].trim();
  });
};

const checkout = async (repoPath: string, branch: string): Promise<string> => {
  const command = `git checkout ${branch} --quiet`;
  return execPromise(command, repoPath);
};

/**
 * Clones a Git repo and checks out the remotes
 * HEAD branch (e.g. main or master)
 */
export const cloneRepo = async (url: string, destination: string): Promise<string | void> => {
  const cloneCommand = `git clone ${url} ${destination} --quiet`;
  return execPromise(cloneCommand)
    .then(() => getHeadBranch(destination))
    .then((branch) => checkout(destination, branch));
};

export const pullRepo = async (repoPath: string): Promise<string> => {
  const pullCommand = "git pull --no-rebase --quiet";
  return execPromise(pullCommand, repoPath);
};
