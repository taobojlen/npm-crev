/**
 * Functions related to the user's own crev ID
 */

import * as path from "path";
import { promises as fs } from "fs";

import { CrevConfig, CrevId, PublicCrevId, SealedCrevId } from "./types";
import { getConfigFilePath, getIdsDirPath } from "./paths";
import { fileExists, readObjectFromYaml, writeObjectToYaml } from "./util";
import { CREV_ID_FORMAT_VERSION } from "./constants";
import { generateKeypair } from "./crypto/signatures";
import { fromBase64, generatePasswordSalt, getRandomBytes, toBase64 } from "./crypto/util";
import { cargoCrevArgon2Hash, getDefaultArgon2Options } from "./crypto/hashes";
import { decrypt, encrypt } from "./crypto/encryption";

const createCrevConfig = async (id: string): Promise<void> => {
  const configPath = getConfigFilePath();
  const hostSalt = toBase64(getRandomBytes(32));
  const config: CrevConfig = {
    version: -1,
    currentId: {
      idType: "crev",
      id,
    },
    hostSalt,
  };
  await writeObjectToYaml(config, configPath);
};

/**
 * Generates a new CrevID, locks it, and saves it to disk.
 */
export const generateCrevId = async (url: string, password: string): Promise<CrevId> => {
  const { privateKey, publicKey } = generateKeypair();
  const passwordSalt = await generatePasswordSalt();
  const argon2Options = {
    ...getDefaultArgon2Options(),
    salt: toBase64(passwordSalt),
  };
  const passwordHash = await cargoCrevArgon2Hash(password, argon2Options);
  const sealNonce = getRandomBytes(32);
  const sealedSecretKey = await encrypt(passwordHash, privateKey, sealNonce);

  const id: SealedCrevId = {
    version: CREV_ID_FORMAT_VERSION,
    url,
    publicKey: toBase64(publicKey),
    sealedSecretKey: toBase64(sealedSecretKey),
    sealNonce: toBase64(sealNonce),
    pass: argon2Options,
  };
  const idPath = path.join(getIdsDirPath(), `${toBase64(publicKey)}.yaml`);
  await writeObjectToYaml(id, idPath);
  await updateCurrentIdConfig(toBase64(publicKey));
  return {
    version: id.version,
    url: id.url,
    publicKey,
    privateKey,
  };
};

/**
 * Given a crev ID (i.e. the public key) and password, finds that ID on disk returns it, unlocked.
 */
export const unsealCrevId = async (id: string, password: string): Promise<CrevId> => {
  const idPath = path.join(getIdsDirPath(), `${id}.yaml`);
  const parsed = await readObjectFromYaml<SealedCrevId>(idPath);
  const argon2Options = parsed.pass;
  const passwordHash = await cargoCrevArgon2Hash(password, argon2Options);
  const secretKey = await decrypt(passwordHash!, parsed.sealedSecretKey, parsed.sealNonce);
  return {
    version: parsed.version,
    url: parsed.url,
    publicKey: fromBase64(parsed.publicKey),
    privateKey: secretKey,
  };
};

export const getCurrentCrevId = async (): Promise<PublicCrevId | undefined> => {
  const configPath = getConfigFilePath();
  let config;
  // If there's no config, just return undefined
  try {
    config = await readObjectFromYaml<CrevConfig>(configPath);
  } catch (e) {
    if (e.code === "ENOENT") {
      return undefined;
    } else {
      throw e;
    }
  }

  const idPath = path.join(getIdsDirPath(), `${config.currentId.id}.yaml`);
  try {
    const id = await readObjectFromYaml<SealedCrevId>(idPath);
    return {
      version: id.version,
      url: id.url,
      publicKey: fromBase64(id.publicKey),
    };
  } catch (e) {
    if (e.code === "ENOENT") {
      throw new Error(`Couldn't find an ID at ${idPath}`);
    } else {
      throw e;
    }
  }
};

/**
 * Switches the current crev ID to the one given.
 */
export const updateCurrentIdConfig = async (id: string): Promise<void> => {
  const configPath = getConfigFilePath();
  const configExists = await fileExists(configPath);
  if (!configExists) {
    await createCrevConfig(id);
  } else {
    const config = await readObjectFromYaml<CrevConfig>(configPath);
    const newConfig = {
      ...config,
      currentId: {
        ...config.currentId,
        id,
      },
    };
    await writeObjectToYaml(newConfig, configPath);
  }
};

export const listIds = async (): Promise<PublicCrevId[]> => {
  const idsPath = getIdsDirPath();
  const filenames = (await fs.readdir(idsPath)).filter(async (file) => {
    const filePath = path.join(idsPath, file);
    const stat = await fs.stat(filePath);
    return stat.isFile();
  });
  const ids = await Promise.all(
    filenames.map(async (file) => {
      const idPath = path.join(idsPath, file);
      const id = await readObjectFromYaml<SealedCrevId>(idPath);
      return {
        version: id.version,
        url: id.url,
        publicKey: fromBase64(id.publicKey),
      };
    })
  );
  return ids;
};
