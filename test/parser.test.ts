import { promises as fs } from "fs";
import { expect } from "chai";

import { getProofs } from "../src/parser";
import { PackageReviewProof, TrustProof } from "../src/types";

const expectedReviewOne: PackageReviewProof = {
  kind: "package review",
  version: -1,
  date: 1603666838983,
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs",
  },
  package: {
    source: "https://crates.io",
    name: "cargo-chef",
    version: "0.1.4",
    revision: "e65d082227f2b3a33903bf41861cceb9c5a5a97c",
    digest: "0r_ecxB74L2sRgBr2SWnxUD5fecvVQn4xygDu6nqyJQ",
  },
  review: {
    thoroughness: "low",
    understanding: "medium",
    rating: "positive",
  },
};
const expectedReviewTwo: PackageReviewProof = {
  kind: "package review",
  version: -1,
  date: 1582590219773,
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs",
  },
  package: {
    source: "https://crates.io",
    name: "attohttpc",
    version: "0.11.1",
    revision: "f7a0d0f5a1fdb94fd0db8891297445b5c43bc31d",
    digest: "JxgK9VEJN-tci8pnwlvl3abmjhXnV18lW49URxW6gB8",
  },
  packageDiffBase: {
    source: "https://crates.io",
    name: "attohttpc",
    version: "0.10.0",
    revision: "ebd722069f5c1969e65c38fca49515e422ae1423",
    digest: "kF9h8LZTNrTJipGZ4uJidnsICtBlwTKRBsqvDtraFkU",
  },
  review: {
    thoroughness: "low",
    understanding: "medium",
    rating: "positive",
  },
  alternatives: [
    { source: "https://crates.io", name: "reqwest" },
    { source: "https://crates.io", name: "ureq" },
  ],
};

const expectedTrustOne: TrustProof = {
  kind: "trust",
  version: -1,
  date: 1588781087659,
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs",
  },
  ids: [
    {
      idType: "crev",
      id: "W-RXYmWCrsXJWinxMMdjCjR9ywGlH9srvMi0cmYL2rI",
      url: "https://gitlab.com/chrysn/auto-crev-proofs",
    },
  ],
  trust: "none",
};

it("parses a single package proof file", async () => {
  const proofYaml = (await fs.readFile("test/data/single-package.proof.crev")).toString();
  const proofs = getProofs(proofYaml);
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedReviewOne);
});

it("parses a multiple proof file", async () => {
  const proofYaml = (await fs.readFile("test/data/multiple-packages.proof.crev")).toString();
  const proofs = getProofs(proofYaml);
  expect(proofs).to.have.lengthOf(2);
  expect(proofs).to.have.deep.members([expectedReviewOne, expectedReviewTwo]);
});

it("parses a single trust proof", async () => {
  const proofYaml = (await fs.readFile("test/data/single-trust.proof.crev")).toString();
  const proofs = getProofs(proofYaml);
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedTrustOne);
});

it("handles file with multiple proof types", async () => {
  const proofYaml = (await fs.readFile("test/data/mixed-types.proof.crev")).toString();
  const proofs = getProofs(proofYaml);
  expect(proofs).to.have.lengthOf(2);
  expect(proofs).to.have.deep.members([expectedTrustOne, expectedReviewOne]);
});

it("filters to only package reviews", async () => {
  const proofYaml = (await fs.readFile("test/data/mixed-types.proof.crev")).toString();
  const proofs = getProofs(proofYaml, "package review");
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedReviewOne);
});

it("filters to only trust proofs", async () => {
  const proofYaml = (await fs.readFile("test/data/mixed-types.proof.crev")).toString();
  const proofs = getProofs(proofYaml, "trust");
  expect(proofs).to.have.lengthOf(1);
  expect(proofs[0]).to.deep.equal(expectedTrustOne);
});
