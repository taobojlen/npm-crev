import { expect } from "chai";

import { verifySignature } from "../src/sign";

it("verifies a valid signature", () => {
  const proof =
    'version: -1\ndate: "2018-12-18T23:10:21.111854021-08:00"\nfrom:\n  id-type: crev\n  id: FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE\n  url: "https://github.com/dpc/crev-proofs"\npackage:\n  source: "https://crates.io"\n  name: log\n  version: 0.4.6\n  digest: BhDmOOjfESqs8i3z9qsQANH8A39eKklgQKuVtrwN-Tw\nreview:\n  thoroughness: low\n  understanding: medium\n  rating: positive\n';
  const signature =
    "4R2WjtU-avpBznmJYAl44H1lOYgETu3RSNhCDcB4GpqhJbSRkd-eqnUuhHgDUs77OlhUf7BSA0dydxaALwx0Dg";
  const publicKey = "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE";
  const signatureIsValid = verifySignature(proof, signature, publicKey);
  expect(signatureIsValid).to.be.true;
});

it("does not verify a bad signature", () => {
  const proof =
    'version: -1\ndate: "2019-04-28T22:05:05.147481998-07:00"\nfrom:\n  id-type: crev\n  id: FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE\n  url: "https://github.com/dpc/crev-proofs"\nids:\n  - id-type: crev\n    id: YWfa4SGgcW87fIT88uCkkrsRgIbWiGOOYmBbA1AtnKA\n    url: "https://github.com/oherrala/crev-proofs"\ntrust: low\n';
  const signature =
    "jueGBe_uOHxZUPv9hypDdN0uHmWaXSiHEEQMVFXgYxbHst5ZfvqGn1RdeNsBkHnohL__nymXGa_2OSq0EIYdCA";
  const publicKey = "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE";
  const signatureIsValid = verifySignature(proof, signature, publicKey);
  expect(signatureIsValid).to.be.false;
});
