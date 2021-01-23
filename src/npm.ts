import { pipeline } from "stream";
import { promisify } from "util";
import path from "path";

import fetch from "node-fetch";
import { get } from "lodash";
import tar from "tar-fs";
import gunzip from "gunzip-maybe";

import { NPM_REGISTRY_URL } from "./constants";
import { getNpmCachePath } from "./paths";
import { folderExists } from "./util";

interface PathAndVersion {
  downloadPath: string;
  version: string;
}

export const getNpmDownloadPath = (packageName: string, version: string): string => {
  const folderName = `${packageName}-${version}`;
  const sanitized = folderName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 48);
  return path.join(getNpmCachePath(), sanitized);
};

export const fetchNpmPackage = async (
  packageName: string,
  version?: string
): Promise<PathAndVersion> => {
  if (version) {
    const downloadPath = getNpmDownloadPath(packageName, version);
    if (await folderExists(downloadPath)) {
      return { downloadPath, version };
    }
  }

  const metadata = await fetch(`${NPM_REGISTRY_URL}/${packageName}`).then((resp) => resp.json());
  if (!version) {
    version = metadata["dist-tags"]?.latest;
  }
  if (!version) {
    throw new Error(`Could not parse npm response for ${packageName}`);
  }

  const downloadPath = getNpmDownloadPath(packageName, version);
  const { tarball: tarballUrl } = get(metadata, ["versions", version, "dist"]);

  const streamPipeline = promisify(pipeline);
  const tarballResponse = await fetch(tarballUrl);
  if (!tarballResponse.ok) throw new Error(`Unexpected response ${tarballResponse.statusText}`);

  await streamPipeline(
    tarballResponse.body,
    gunzip(),
    tar.extract(downloadPath, {
      map(header) {
        // tarballs from npm return a single "package" folder
        // just get the contents of this folder
        header.name = header.name.replace(/^package\//, "");
        return header;
      },
    })
  );

  return { downloadPath, version };
};
