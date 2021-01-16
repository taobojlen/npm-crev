import * as miscreant from "miscreant";

import { maybeConvertBase64 } from "./util";

export const decrypt = async (
  key: Buffer | string,
  data: Buffer | string,
  nonce: Buffer | string
): Promise<Buffer> => {
  key = maybeConvertBase64(key);
  data = maybeConvertBase64(data);
  nonce = maybeConvertBase64(nonce);
  const decryptor = await miscreant.AEAD.importKey(
    key,
    "AES-SIV",
    new miscreant.PolyfillCryptoProvider()
  );
  const decrypted = await decryptor.open(data, nonce);
  return Buffer.from(decrypted);
};

export const encrypt = async (
  key: Buffer | string,
  data: Buffer | string,
  nonce: Buffer | string
): Promise<Buffer> => {
  key = maybeConvertBase64(key);
  nonce = maybeConvertBase64(nonce);
  if (typeof data === "string") {
    data = Buffer.from(data);
  }
  const encryptor = await miscreant.AEAD.importKey(
    key,
    "AES-SIV",
    new miscreant.PolyfillCryptoProvider()
  );
  const encrypted = await encryptor.seal(data, nonce);
  return Buffer.from(encrypted);
};
