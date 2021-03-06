import { camelizeKeys } from "humps";
import * as yaml from "js-yaml";
import { verifySignature } from "./crypto/signatures";
import { SignatureError } from "./errors";
import { ProofType, ReviewType } from "./types";

interface ParsedProof {
  content: string;
  signature: string;
}
const parseProofs = (proofsString: string): ParsedProof[] => {
  const sectionRegex = new RegExp(
    "" +
      /----- ?BEGIN CREV PROOF ?-----\r?\n/.source + // Section start
      /(?<content>[\s\S]*?)\r?\n/.source + // Section content
      /----- ?SIGN CREV PROOF ?-----\r?\n/.source + // Signature start
      /(?<signature>[\s\S]*?)\r?\n/.source + // Signature
      /----- ?END CREV PROOF ?-----/.source, // Section end
    "g"
  );

  const output = [];
  const results = proofsString.matchAll(sectionRegex);
  for (const result of results) {
    if (!result.groups) {
      continue;
    }
    const { content, signature } = result.groups;
    output.push({ content: `${content}\n`, signature });
  }
  return output;
};

/**
 * Given a YAML document, returns valid proofs.
 * Will throw an error on encountering an invalid signature.
 *
 * @param proofsString the YAML document to parse (a string)
 * @param reviewType "package review" or "trust". Filters results to only the given type of proof
 */
export const getProofs = <T extends ReviewType>(
  proofsString: string,
  reviewType?: T
): ProofType<T>[] => {
  const proofs = parseProofs(proofsString).map(({ content, signature }) => {
    const reviewObj = yaml.load(content) as any;
    // Verify the proof
    const validSignature = verifySignature(content, signature, reviewObj.from.id);
    if (!validSignature) {
      let proofTarget;
      if (reviewObj.kind === "package review") {
        proofTarget = reviewObj.package.name;
      } else {
        proofTarget = reviewObj.ids.map((id: any) => id.id).join(", ");
      }
      throw new SignatureError(
        `Proof by ${reviewObj.from.id} of [${proofTarget}] has an invalid signature`
      );
    }

    // TODO: verify that all expected keys are in YAML
    return (camelizeKeys({
      ...reviewObj,
      date: Date.parse(reviewObj.date),
    }) as unknown) as ProofType<T>;
  });

  if (reviewType) {
    return proofs.filter((proof) => proof.kind === reviewType);
  } else {
    return proofs;
  }
};
