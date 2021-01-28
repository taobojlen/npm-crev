// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
export const levels = ["none", "low", "medium", "high"] as const;
export type Level = typeof levels[number];

export const ratings = ["strong", "positive", "neutral", "negative"] as const;
export type Rating = typeof ratings[number];

export const trustLevels = ["distrust", "none", "low", "medium", "high"] as const;
export type TrustLevel = typeof trustLevels[number];

export type ReviewType = "package review" | "trust";

/* Subtypes */
export interface User {
  idType: "crev";
  id: string;
  url: string;
}
export interface PackageDetails {
  source: string;
  name: string;
  version: string;
  revision?: string;
  digest: string;
}
export interface PackageReviewDetails {
  thoroughness: Level;
  understanding: Level;
  rating: Rating;
}

/* The base that both package reviews and trust proofs share */
interface ProofMetadata {
  kind: ReviewType;
  version: number;
  date: number;
  from: User;
  comment?: string;
}

export interface PackageReviewProof extends ProofMetadata {
  kind: "package review";
  package: PackageDetails;
  review: PackageReviewDetails;
  packageDiffBase?: any; // TODO
  alternatives?: any[]; // TODO
}
export interface TrustProof extends ProofMetadata {
  kind: "trust";
  ids: User[];
  trust: TrustLevel;
}

export type CrevProof = PackageReviewProof | TrustProof;

export type VerificationStatus = "pass" | "fail" | "none";
export interface Verification {
  status: VerificationStatus;
  reviewCount: number;
}

// This ugly type lets functions know what kind of proof
// is returned based on the a parameter
export type ProofType<T> = T extends "package review"
  ? PackageReviewProof
  : T extends "trust"
  ? TrustProof
  : never;

export interface Argon2Options {
  version: number;
  variant: string;
  iterations: number;
  memorySize: number;
  lanes?: number;
  salt: string;
}
export interface SealedCrevId {
  version: number;
  url: string;
  publicKey: string;
  sealedSecretKey: string;
  sealNonce: string;
  pass: Argon2Options;
}

export interface PublicCrevId {
  version: number;
  url: string;
  publicKey: Buffer;
}
export interface CrevId extends PublicCrevId {
  privateKey: Buffer;
}

export interface CrevConfig {
  version: number;
  currentId: {
    idType: "crev";
    id: string;
  };
  hostSalt: string;
}

// TODO: handle peer deps
export type DependencyType = "normal" | "dev";
export interface Dependency {
  name: string;
  version: string;
  type: DependencyType;
}
