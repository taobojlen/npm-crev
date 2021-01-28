import path from "path";

import { expect, test } from "@oclif/test";
import mockFs from "mock-fs";
import { getNpmCachePath, getProofsDirPath } from "../../src/paths";

import { listFiles, mockFoldersWithCrevId } from "../helpers";

const PACKAGE_PATH = path.join(getNpmCachePath(), "_crev_cli-1_0_0");

describe("review", () => {
  test
    .do(() => {
      mockFoldersWithCrevId({
        [PACKAGE_PATH]: mockFs.directory(),
        [path.join(getProofsDirPath(), "reviews")]: mockFs.directory(),
      });
    })
    .finally(() => {
      mockFs.restore();
    })
    .env({
      CREV_PACKAGE: "@crev/cli", // pretend we're in the review shell
      CREV_PACKAGE_VERSION: "1.0.0",
    })
    .stdin("hello\n") // password for the current crev ID
    .stdout()
    .command([
      "review",
      "--thoroughness",
      "high",
      "--understanding",
      "medium",
      "--rating",
      "neutral",
      "--skip-comment",
    ])
    .it("trusts an ID", async (ctx) => {
      expect(ctx.stdout).to.contain("Saved your review of @crev/cli@1.0.0.");
      const reviewsDir = path.join(
        getProofsDirPath(),
        "gitlab_com_tao_oat_crev-proofs_git-0x94ckWyx3R1t9aa8lBmrw/geFF0hJAe-fhR2gd20tyXxVwvlmdmeBIgbRqpgSkZA4/reviews"
      );
      const reviewFilenames = await listFiles(reviewsDir);
      expect(reviewFilenames.length).to.equal(1);
    });
});
