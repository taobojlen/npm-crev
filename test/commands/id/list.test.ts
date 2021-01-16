import { expect, test } from "@oclif/test";
import { toBase64 } from "../../../src/crypto/util";

import { generateCrevId } from "../../../src/id";

describe("id:list", () => {
  test
    .stdout()
    .add("publicKey", async () => {
      const id = await generateCrevId("https://github.com/user/repo.git", "hello");
      return toBase64(id.publicKey);
    })
    .command(["id:list"])
    .it("lists own IDs", (ctx) => {
      expect(ctx.stdout).to.contain(ctx.publicKey);
    });
});
