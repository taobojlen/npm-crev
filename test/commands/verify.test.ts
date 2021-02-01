import { promises as fs } from "fs";

import { expect, test } from "@oclif/test";
import mockFs from "mock-fs";
import sinon from "sinon";

import { fromBase64, toBase64 } from "../../src/crypto/util";
import { generateCrevId, updateCurrentIdConfig } from "../../src/id";
import { createPackageReview, createTrustProofs } from "../../src/proofs";
import { PackageDetails } from "../../src/types";
import { crevIdToUser, mockFoldersWithCrevId } from "../helpers";
import { getProofsDirPath, proofsCachePath } from "../../src/paths";
import * as recursiveDigest from "../../src/recursiveDigest";

describe("verify", () => {
  before(async () => {
    sinon
      .stub(recursiveDigest, "recursiveDigest")
      .resolves(
        fromBase64(
          "F-XqOd1JqyktmXd9yEXOAfqlKRLWoXmlVg2IE2hVltTTkIjlqANfa6FDT3pJbPrEoL6mA_9E-vUvPDa8xFExrQ"
        )
      );

    mockFoldersWithCrevId({
      "/package-lock.json": mockFs.load("test/data/package-lock-2.json"),
    });
    // Setup: create small web of trust
    // (Alice)-[TRUSTS]->(Bob)
    // (Bob)-[TRUSTS]->(Carol)
    // (Bob)-[DISTRUSTS]->(Eve)
    const alice = await generateCrevId("https://alice.com", "alice");
    const bob = await generateCrevId("https://bob.com", "bob");
    const carol = await generateCrevId("https://carol.com", "carol");
    const eve = await generateCrevId("https://eve.com", "eve");

    await createTrustProofs(alice, [crevIdToUser(bob)], "high");
    await createTrustProofs(bob, [crevIdToUser(carol)], "high");
    await createTrustProofs(bob, [crevIdToUser(eve)], "distrust");

    // Carol reviews a package defined in our package-lock
    const packageDetails: PackageDetails = {
      source: "npm",
      name: "lodash",
      version: "4.17.20",
      digest:
        "F-XqOd1JqyktmXd9yEXOAfqlKRLWoXmlVg2IE2hVltTTkIjlqANfa6FDT3pJbPrEoL6mA_9E-vUvPDa8xFExrQ",
    };
    await createPackageReview(carol, packageDetails, "medium", "medium", "positive");

    // Put us in the shoes of Alice
    await updateCurrentIdConfig(toBase64(alice.publicKey));

    // Move the created reviews / trust proofs to the folder where our DB will load them
    await fs.rm(proofsCachePath, { recursive: true, force: true });
    await fs.rename(getProofsDirPath(), proofsCachePath);
  });
  after(() => {
    mockFs.restore();
    sinon.restore();
  });

  test
    .stdout()
    .command(["verify", "/package-lock.json", "--sort=name"])
    .it("runs hello", (ctx) => {
      const lines = ctx.stdout
        .split("\n")
        .map((line) => line.split(/\s+/).filter((item) => !!item));
      const lodashLine = lines[2]; // lodash is on the first line
      expect(lodashLine).to.deep.equal(["lodash", "4.17.20", "normal", "pass", "1"]);
    });
});
