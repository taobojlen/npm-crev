import { expect } from "chai";
import { binaryToBase64, camelizeKeys } from "../src/util";

describe("camelizeKeys()", () => {
  it("camelizes object keys", () => {
    const input = {
      "my-key": 1,
      other: 2,
    };
    const expected = {
      myKey: 1,
      other: 2,
    };
    expect(camelizeKeys(input)).to.deep.equal(expected);
  });

  it("handles nested objects", () => {
    const input = {
      "my-key": {
        "more-keys": 1,
      },
    };
    const expected = {
      myKey: {
        moreKeys: 1,
      },
    };
    expect(camelizeKeys(input)).to.deep.equal(expected);
  });

  it("handles objects with arrays", () => {
    const input = {
      "my-key": [1, 2, 3],
    };
    const expected = {
      myKey: [1, 2, 3],
    };
    expect(camelizeKeys(input)).to.deep.equal(expected);
  });

  it("handles string values", () => {
    const input = {
      "my-key": "kebab-case-value",
    };
    const expected = {
      myKey: "kebab-case-value",
    };
    expect(camelizeKeys(input)).to.deep.equal(expected);
  });
});

describe("binaryToBase64", () => {
  it("converts strings to base64", () => {
    const originalString = "test string";
    const b64String = Buffer.from(originalString, "utf-8").toString("base64").replace("=", "");
    expect(binaryToBase64(originalString)).to.equal(b64String);
  });

  it("converts binary data to base64", () => {
    const binaryData = Buffer.from(
      "64bf4972305719d922fe3b7a108218b2e0caaa7184b0fbd8fd418152aa1ad9d9b1fd6970238abc12f8ade8aaad54e4c1d89ab5589326af63ed04571ca1612217",
      "hex"
    ).toString("binary");
    const expected =
      "ZL9JcjBXGdki_jt6EIIYsuDKqnGEsPvY_UGBUqoa2dmx_WlwI4q8Evit6KqtVOTB2Jq1WJMmr2PtBFccoWEiFw";
    expect(binaryToBase64(binaryData)).to.equal(expected);
  });

  it("handles empty strings", () => {
    expect(binaryToBase64("")).to.equal("");
  });
});
