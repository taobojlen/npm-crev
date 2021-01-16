import { expect } from "chai";

import { hashUrlForFs } from "../src/paths";

describe("hashUrlForFs", () => {
  it("sanitizes a regular URL", () => {
    const url = "https://crates.io";
    const expected = "crates_io-yTEHLALL07ZuqIYj8EHFkg";
    const sanitizedUrl = hashUrlForFs(url);
    expect(sanitizedUrl).to.equal(expected);
  });

  it("handles Github repos", () => {
    const urlOne = "https://github.com/dpc/crev-proofs";
    const sanitizedUrlOne = hashUrlForFs(urlOne);
    expect(sanitizedUrlOne).to.equal("github_com_dpc_crev-proofs-zyAEeMRLjv__eDHGtrnPUA");

    const urlTwo = "https://github.com/taobojlen/crev-proofs";
    const sanitizedUrlTwo = hashUrlForFs(urlTwo);
    expect(sanitizedUrlTwo).to.equal("github_com_taobojlen_crev-proofs-sHRi-BaAd0i3S7nqSYjctg");
  });

  it("handles very long URLs", () => {
    const a48 = "a".repeat(48);
    const a2048 = "a".repeat(2048);
    const a2049 = "a".repeat(2049);

    expect(hashUrlForFs(a2048)).to.equal(`${a48}-4iupJgrBwxluPQ8DRmrnXg`);
    expect(hashUrlForFs(a2049)).to.equal(`${a48}-VMRqy6kfWHPoPp1iKIGt1A`);
  });
});
