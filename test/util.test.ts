import { expect } from "chai";
import { camelizeKeys } from "../src/util";

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
