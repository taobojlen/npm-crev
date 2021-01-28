import { expect, test } from "@oclif/test";
import mockFs from "mock-fs";

import { mockFoldersWithCrevId } from "../../helpers";

describe("id:trust", () => {
  test
    .do(() => {
      mockFoldersWithCrevId();
    })
    .finally(() => {
      mockFs.restore();
    })
    .stdin("hello\n") // password for the current crev ID
    .stdout()
    .command(["id:trust", "--level", "high", "--comment", "'lorem ipsum'", "abc1"])
    .it("trusts an ID", (ctx) => {
      expect(ctx.stdout).to.contain("Successfully trusted 1 user");
    });

  test
    .do(() => {
      mockFoldersWithCrevId();
    })
    .finally(() => {
      mockFs.restore();
    })
    .stdin("hello\n") // password for the current crev ID
    .stdout()
    .command(["id:trust", "--level", "high", "--comment", "'lorem ipsum'", "abc1,abc2"])
    .it("trusts multiple IDs", (ctx) => {
      expect(ctx.stdout).to.contain("Successfully trusted 2 users");
    });
});
