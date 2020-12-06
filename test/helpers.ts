import { PackageReviewProof, TrustProof } from "../src/types";

export const expectedPackageProofOne: PackageReviewProof = {
  version: -1,
  date: Date.parse("2018-12-18T23:10:21.111854021-08:00"),
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs",
  },
  package: {
    source: "https://crates.io",
    name: "log",
    version: "0.4.6",
    digest: "BhDmOOjfESqs8i3z9qsQANH8A39eKklgQKuVtrwN-Tw",
  },
  review: {
    thoroughness: "low",
    understanding: "medium",
    rating: "positive",
  },
  signature:
    "4R2WjtU-avpBznmJYAl44H1lOYgETu3RSNhCDcB4GpqhJbSRkd-eqnUuhHgDUs77OlhUf7BSA0dydxaALwx0Dg",
  raw:
    'version: -1\ndate: "2018-12-18T23:10:21.111854021-08:00"\nfrom:\n  id-type: crev\n  id: FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE\n  url: "https://github.com/dpc/crev-proofs"\npackage:\n  source: "https://crates.io"\n  name: log\n  version: 0.4.6\n  digest: BhDmOOjfESqs8i3z9qsQANH8A39eKklgQKuVtrwN-Tw\nreview:\n  thoroughness: low\n  understanding: medium\n  rating: positive\n',
};

export const expectedPackageProofTwo: PackageReviewProof = {
  version: -1,
  date: Date.parse("2018-12-27T15:03:34.189335776-08:00"),
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs",
  },
  package: {
    source: "https://crates.io",
    name: "crates_io_api",
    version: "0.3.0",
    revision: "734324f1bb29c094dc0749efce3dab8ca6822f45",
    digest: "XWZhBHowu-uzuWl_rXm5jDcCfoiLvZT87do09OtS4aQ",
  },
  review: {
    thoroughness: "low",
    understanding: "high",
    rating: "positive",
  },
  comment: "LGTM",
  signature:
    "jueGBe_uOHxZUPv9hypDdN0uHmWaXSiHEEQMVFXgYxbHst5ZfvqGn1RdeNsBkHnohL__nymXGa_2OSq0EIYdCA",
  raw:
    'version: -1\ndate: "2018-12-27T15:03:34.189335776-08:00"\nfrom:\n  id-type: crev\n  id: FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE\n  url: "https://github.com/dpc/crev-proofs"\npackage:\n  source: "https://crates.io"\n  name: crates_io_api\n  version: 0.3.0\n  revision: 734324f1bb29c094dc0749efce3dab8ca6822f45\n  digest: XWZhBHowu-uzuWl_rXm5jDcCfoiLvZT87do09OtS4aQ\nreview:\n  thoroughness: low\n  understanding: high\n  rating: positive\ncomment: LGTM\n',
};

export const expectedTrustProof: TrustProof = {
  version: -1,
  date: Date.parse("2019-04-28T22:05:05.147481998-07:00"),
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs",
  },
  ids: [
    {
      idType: "crev",
      id: "YWfa4SGgcW87fIT88uCkkrsRgIbWiGOOYmBbA1AtnKA",
      url: "https://github.com/oherrala/crev-proofs",
    },
  ],
  trust: "low",
  signature:
    "02BF0i1K0O7uR8T5UHzymqTo65P9R7JDuvfowZuHb3ubW8kd2-Fbl4jSv0n08ZdSU9P_E2YLWvEJrVQDYfjVCg",
  raw:
    'version: -1\ndate: "2019-04-28T22:05:05.147481998-07:00"\nfrom:\n  id-type: crev\n  id: FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE\n  url: "https://github.com/dpc/crev-proofs"\nids:\n  - id-type: crev\n    id: YWfa4SGgcW87fIT88uCkkrsRgIbWiGOOYmBbA1AtnKA\n    url: "https://github.com/oherrala/crev-proofs"\ntrust: low\n',
};

export const badSignatureTrustProof: TrustProof = {
  version: -1,
  date: Date.parse("2019-04-28T22:05:05.147481998-07:00"),
  from: {
    idType: "crev",
    id: "FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE",
    url: "https://github.com/dpc/crev-proofs",
  },
  ids: [
    {
      idType: "crev",
      id: "YWfa4SGgcW87fIT88uCkkrsRgIbWiGOOYmBbA1AtnKA",
      url: "https://github.com/oherrala/crev-proofs",
    },
  ],
  trust: "low",
  signature:
    "jueGBe_uOHxZUPv9hypDdN0uHmWaXSiHEEQMVFXgYxbHst5ZfvqGn1RdeNsBkHnohL__nymXGa_2OSq0EIYdCA",
  raw:
    'version: -1\ndate: "2019-04-28T22:05:05.147481998-07:00"\nfrom:\n  id-type: crev\n  id: FYlr8YoYGVvDwHQxqEIs89reKKDy-oWisoO0qXXEfHE\n  url: "https://github.com/dpc/crev-proofs"\nids:\n  - id-type: crev\n    id: YWfa4SGgcW87fIT88uCkkrsRgIbWiGOOYmBbA1AtnKA\n    url: "https://github.com/oherrala/crev-proofs"\ntrust: low\n',
};
