import mockFs from "mock-fs";
import { promises as fs } from "fs";
import path from "path";
import FileSystem from "mock-fs/lib/filesystem";
import { getConfigFilePath, getIdsDirPath, getProofsDirPath, proofsCachePath } from "../src/paths";
import { CrevId, User } from "../src/types";
import { toBase64 } from "../src/crypto/util";

export const listFiles = async (directoryPath: string): Promise<string[]> => {
  const files = await fs.readdir(directoryPath);
  const filenames = files.filter(async (file) => {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.stat(filePath);
    return stat.isFile();
  });
  return filenames;
};

export const mockCoreFolders = (
  dirs?: FileSystem.DirectoryItems,
  options?: FileSystem.Options
): void => {
  const mockfsConf = {
    "package.json": mockFs.load(path.resolve(__dirname, "../package.json")),
    "tsconfig.json": mockFs.load(path.resolve(__dirname, "../tsconfig.json")),
    src: mockFs.load(path.resolve(__dirname, "../src")),
    test: mockFs.load(path.resolve(__dirname, "../test")),
    node_modules: mockFs.load(path.resolve(__dirname, "../node_modules")),
    ".nyc_output": mockFs.load(path.resolve(__dirname, "../.nyc_output")),

    ...dirs,
  };

  mockFs(mockfsConf, { createCwd: false, ...options });
};

export const mockFoldersWithCrevId = (
  dirs?: FileSystem.DirectoryItems,
  options?: FileSystem.Options
): void => {
  const mockFsConf = {
    [path.join(proofsCachePath, "repo/id/trust/trust.proof.crev")]: mockFs.load(
      path.resolve(__dirname, "data/expected-trust.proof.crev")
    ),
    [getConfigFilePath()]: mockFs.load(path.resolve(__dirname, "data/config/config.yaml")),
    [path.join(getIdsDirPath(), "geFF0hJAe-fhR2gd20tyXxVwvlmdmeBIgbRqpgSkZA4.yaml")]: mockFs.load(
      path.resolve(__dirname, "data/config/ids/geFF0hJAe-fhR2gd20tyXxVwvlmdmeBIgbRqpgSkZA4.yaml")
    ),
    [path.join(
      getProofsDirPath(),
      "gitlab_com_tao_oat_crev-proofs_git-0x94ckWyx3R1t9aa8lBmrw/geFF0hJAe-fhR2gd20tyXxVwvlmdmeBIgbRqpgSkZA4/reviews"
    )]: mockFs.directory(),
    ...dirs,
  };

  mockCoreFolders(mockFsConf, options);
};

export const crevIdToUser = (id: CrevId): User => {
  return {
    idType: "crev",
    id: toBase64(id.publicKey),
    url: id.url,
  };
};
