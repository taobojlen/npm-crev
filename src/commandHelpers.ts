/**
 * This module contains various helpers functions that should only be used
 * directly from commands.
 */

import Command from "@oclif/command";
import { prompt } from "enquirer";

import { getCurrentCrevId, unsealCrevId } from "./id";
import { CrevId, PublicCrevId } from "./types";
import { toBase64 } from "./crypto/util";

/**
 * Makes sure that the current crev ID specified in config.yaml exists.
 * Fail if it doesn't.
 * @param command the oclif Command calling this function
 */
export const assertCrevIdExists = async (command: Command): Promise<PublicCrevId> => {
  const currentId = await getCurrentCrevId();
  if (!currentId) {
    command.error("Couldn't find a crev ID. Run `crev id:create` to create one.");
  }
  return currentId;
};

// TODO: add ability to pass passphrase via command line flag
export const getUnsealedCrevId = async (command: Command): Promise<CrevId> => {
  const publicId = await assertCrevIdExists(command);
  const publicKey = toBase64(publicId.publicKey);
  const { password } = await prompt<{ password: string }>({
    type: "password",
    message: "Enter the passphrase for your crev ID",
    name: "password",
  });
  try {
    const id = await unsealCrevId(publicKey, password);
    return id;
  } catch (e) {
    if (e.message === "AES-SIV: ciphertext verification failure!") {
      command.error("Invalid passphrase.");
    } else {
      throw e;
    }
  }
};
