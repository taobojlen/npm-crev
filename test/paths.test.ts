import { expect } from "chai";

import { sanitizeUrlForFs } from "../src/paths";

describe("sanitizeUrlForFs", () => {
  it("sanitizes a regular URL", () => {
    const url = "https://crates.io";
    const expected = "crates_io-yTEHLALL07ZuqIYj8EHFkg";
    const sanitizedUrl = sanitizeUrlForFs(url);
    expect(sanitizedUrl).to.equal(expected);
  });

  it("handles Github repos", () => {
    const urlOne = "https://github.com/dpc/crev-proofs";
    const sanitizedUrlOne = sanitizeUrlForFs(urlOne);
    expect(sanitizedUrlOne).to.equal("github_com_dpc_crev-proofs-zyAEeMRLjv__eDHGtrnPUA");

    const urlTwo = "https://github.com/taobojlen/crev-proofs";
    const sanitizedUrlTwo = sanitizeUrlForFs(urlTwo);
    expect(sanitizedUrlTwo).to.equal("github_com_taobojlen_crev-proofs-sHRi-BaAd0i3S7nqSYjctg");
  });

  it("handles very long URLs", () => {
    const a48 = "a".repeat(48);
    const a2048 = "a".repeat(2048);
    const a2049 = "a".repeat(2049);

    expect(sanitizeUrlForFs(a2048)).to.equal(`${a48}-4iupJgrBwxluPQ8DRmrnXg`);
    expect(sanitizeUrlForFs(a2049)).to.equal(`${a48}-VMRqy6kfWHPoPp1iKIGt1A`);
  });
});
