import { promises as fs } from "fs";

import { expect } from "chai";
import sinon from "sinon";
import tmp from "tmp";

import { PackageDetails, User } from "../src/types";
import * as paths from "../src/paths";
import { createTrustProofs, createPackageReview } from "../src/proofs";
import { getCurrentCrevId, unsealCrevId } from "../src/id";
import { toBase64 } from "../src/crypto/util";

const clock = new Date("2021-01-18T18:42:14.956Z");
const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;

describe("proofs", () => {
  beforeEach(() => {
    sinon.stub(paths, "getProofsDirPath").returns(`${tmpDir}/proofs`);
    sinon.stub(paths, "getConfigFilePath").returns("test/data/config/config.yaml");
    sinon.stub(paths, "getIdsDirPath").returns("test/data/config/ids");
    sinon.useFakeTimers(clock.getTime());
  });
  afterEach(() => {
    sinon.restore();
  });

  describe("createTrustProofs", () => {
    it("creates a valid trust proof", async () => {
      const publicId = await getCurrentCrevId();
      const id = await unsealCrevId(toBase64(publicId!.publicKey), "hello");
      const users: User[] = [
        { idType: "crev", id: "abc1", url: "https://url1.com/repo.git" },
        { idType: "crev", id: "abc2", url: "https://url2.com/repo.git" },
      ];
      const proofPath = await createTrustProofs(id, users, "high", "a comment");
      const proof = (await fs.readFile(proofPath)).toString();
      const expectedProof = (await fs.readFile("test/data/expected-trust.proof.crev")).toString();

      expect(proof).to.equal(expectedProof);
    });
  });

  describe("createPackageReview", () => {
    it("creates a valid package review", async () => {
      const publicId = await getCurrentCrevId();
      const id = await unsealCrevId(toBase64(publicId!.publicKey), "hello");
      const reviewedPackage: PackageDetails = {
        source: "https://www.npmjs.com",
        name: "testpackage",
        version: "1.0.0",
        revision: "a90921afb4d9a637caa791f923cbf4cdf3171aa5",
        digest: "BqzlvkHFaR2SKTnaRSAiRwWN4V8Ct0MmO3GVJ4v-K_M",
      };
      const proofPath = await createPackageReview(
        id,
        reviewedPackage,
        "low",
        "medium",
        "positive",
        "a comment"
      );
      const proof = (await fs.readFile(proofPath)).toString();
      const expectedProof = (await fs.readFile("test/data/expected-review.proof.crev")).toString();

      expect(proof).to.equal(expectedProof);
    });
  });
});
