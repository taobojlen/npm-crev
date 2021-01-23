import { promises as fs } from "fs";
import * as path from "path";

import {
  BEGIN_PROOF_STRING,
  BEGIN_SIGNATURE_STRING,
  CREV_REVIEW_FORMAT_VERSION,
  CREV_TRUST_FORMAT_VERSION,
  END_PROOF_STRING,
} from "./constants";
import { blake2bHash } from "./crypto/hashes";
import { signData } from "./crypto/signatures";
import { toBase64 } from "./crypto/util";
import { getProofsDirPath, hashUrlForFs } from "./paths";
import {
  CrevId,
  PackageDetails,
  Rating,
  TrustLevel,
  TrustProof,
  User,
  Level,
  PackageReviewProof,
} from "./types";
import { objectToYaml } from "./util";

const signAndSave = async (destination: string, entry: string, id: CrevId): Promise<void> => {
  const signature = signData(entry, id.privateKey);
  const proof = [
    BEGIN_PROOF_STRING,
    entry.trim(),
    BEGIN_SIGNATURE_STRING,
    toBase64(signature),
    END_PROOF_STRING,
  ].join("\n");

  const parentDir = path.parse(destination).dir;
  await fs.mkdir(parentDir, { recursive: true });
  await fs.writeFile(destination, proof + "\n"); // add trailing newline
};

/**
 * Create, sign, and save a trust proof. Returns a promise that resolves to the path
 * of the proof file.
 *
 * @param id unsealed crev ID
 * @param users array of users to trust
 * @param level how much to trust them
 * @param comment an optional comment
 */
export const createTrustProofs = async (
  id: CrevId,
  users: User[],
  level: TrustLevel,
  comment?: string
): Promise<string> => {
  // Create proof (with ISO string for date rather than UNIX timestamp)
  const proof: Omit<TrustProof, "date"> & { date: string } = {
    kind: "trust",
    version: CREV_TRUST_FORMAT_VERSION,
    date: new Date().toISOString(),
    from: {
      idType: "crev",
      id: toBase64(id.publicKey),
      url: id.url,
    },
    ids: users,
    trust: level,
    comment,
  };

  const proofYaml = objectToYaml(proof as any);
  const dateString = new Date().toISOString().replace(/T.*$/g, ""); // YYYY-MM-DD
  const proofDigest = toBase64(blake2bHash(proofYaml)).slice(0, 5);
  const destination = path.join(
    getProofsDirPath(),
    hashUrlForFs(id.url),
    toBase64(id.publicKey),
    "trust",
    `${dateString}-${proofDigest}.proof.crev`
  );
  await signAndSave(destination, proofYaml, id);
  return destination;
};

/**
 * Create, sign, and save a package review.
 * Returns a promise that resolves to the path of the proof file.
 * @param id unsealed crev ID
 * @param package the package that was reviewed
 * @param thoroughness a Level of thoroughness
 * @param understanding a Level of understanding of the code
 * @param rating final review rating
 * @param comment optional comment
 */
export const createPackageReview = async (
  id: CrevId,
  reviewedPackage: PackageDetails,
  thoroughness: Level,
  understanding: Level,
  rating: Rating,
  comment?: string
): Promise<string> => {
  // Create proof (with ISO string for date rather than UNIX timestamp)
  const proof: Omit<PackageReviewProof, "date"> & { date: string } = {
    kind: "package review",
    version: CREV_REVIEW_FORMAT_VERSION,
    date: new Date().toISOString(),
    from: {
      idType: "crev",
      id: toBase64(id.publicKey),
      url: id.url,
    },
    package: reviewedPackage,
    review: {
      thoroughness,
      understanding,
      rating,
    },
    comment: comment,
  };

  const proofYaml = objectToYaml(proof as any);
  const dateString = new Date().toISOString().replace(/T.*$/g, ""); // YYYY-MM-DD
  const proofDigest = toBase64(blake2bHash(proofYaml)).slice(0, 5);
  const destination = path.join(
    getProofsDirPath(),
    hashUrlForFs(id.url),
    toBase64(id.publicKey),
    "reviews",
    `${dateString}-package-${proofDigest}.proof.crev`
  );
  await signAndSave(destination, proofYaml, id);
  return destination;
};
