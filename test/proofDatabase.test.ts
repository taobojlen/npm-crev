// import { expect } from "chai";
// import sinon from "sinon";
// import tmp from "tmp";

// import ProofDatabase from "../src/proofDatabase";
// import * as paths from "../src/paths";

// const tmpDir = tmp.dirSync({ unsafeCleanup: true }).name;

// describe("proofDatabase", () => {
//   beforeEach(() => {
//     sinon.stub(paths, "getProofsDirPath").returns(`${tmpDir}/proofs`);
//     sinon.stub(paths, "getConfigFilePath").returns("test/data/config/config.yaml");
//     sinon.stub(paths, "getIdsDirPath").returns("test/data/config/ids");
//   });
//   afterEach(() => {
//     sinon.restore();
//   });

//   // it("does nothing on instance creation", async () => {
//   //   const proofDb = new ProofDatabase();
//   //   const users = proofDb.listUsers();
//   //   const verified = proofDb.verify("deadbeed");

//   //   expect(users).to.be.empty;
//   //   expect(verified).to.equal({ status: "none", reviewCount: 0 });
//   // });

//   // it("loads users from disk", async () => {});
// });
