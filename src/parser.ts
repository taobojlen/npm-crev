import * as yaml from "js-yaml";
import { PackageReviewProof, TrustProof } from "./types";
import { camelizeKeys } from "./util";

interface ParsedProof {
  section: string;
  content: string;
  signature: string;
}
const parseProofs = (proofsString: string): ParsedProof[] => {
  const sectionRegex = new RegExp(
    "" +
      /----- ?BEGIN CREV (?<section>[A-Z ]+) ?-----\r?\n/.source + // Section start
      /(?<content>[\s\S]*?)\r?\n/.source + // Section content
      /----- ?BEGIN CREV \k<section> SIGNATURE ?-----\r?\n/.source + // Signature start
      /(?<signature>[\s\S]*?)\r?\n/.source + // Signature
      /----- ?END CREV \k<section> ?-----/.source, // Section end
    "g"
  );

  const output = [];
  const results = proofsString.matchAll(sectionRegex);
  for (const result of results) {
    if (!result.groups) {
      continue;
    }
    const { section, content, signature } = result.groups;
    output.push({ section, content: `${content}\n`, signature });
  }
  return output;
};

const getProofs = (proofsString: string, sectionName: string) =>
  parseProofs(proofsString).map(({ section, content, signature }) => {
    if (section !== sectionName) {
      throw new Error(`Unexpected section: ${section}`);
    }
    const reviewObj = yaml.safeLoad(content) as any;
    // TODO: verify that all expected keys are in YAML
    return camelizeKeys({
      ...reviewObj,
      date: Date.parse(reviewObj.date),
      raw: content,
      signature,
    });
  });

export const getPackageProofs = (proofsString: string): PackageReviewProof[] =>
  getProofs(proofsString, "PACKAGE REVIEW");

export const getTrustProofs = (proofsString: string): TrustProof[] =>
  getProofs(proofsString, "TRUST");
