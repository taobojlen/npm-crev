import { Command, flags } from "@oclif/command";
import chalk from "chalk";
import { cli } from "cli-ux";
import { toBase64 } from "../../crypto/util";
import { getCurrentCrevId, listIds } from "../../id";
import ProofDatabase from "../../proofDatabase";
import { TrustLevel } from "../../types";

interface IdTableRow {
  current: boolean;
  publicKey: string;
  trust: TrustLevel;
  url: string;
}

export default class List extends Command {
  static description = "list crev IDs";
  static aliases = ["id:show"];

  static flags = {
    ...cli.table.flags(),
    help: flags.help({ char: "h" }),
    all: flags.boolean({ char: "a", description: "list all known crev IDs" }),
  };

  async run(): Promise<void> {
    const { flags } = this.parse(List);

    // Get own IDs
    const currentId = await getCurrentCrevId();
    let currentPublicKey = "";
    if (currentId) {
      currentPublicKey = toBase64(currentId.publicKey);
    }

    let ids: IdTableRow[] = [];
    const ownIds: IdTableRow[] = (await listIds()).map((ownId) => ({
      current: toBase64(ownId.publicKey) === currentPublicKey,
      publicKey: toBase64(ownId.publicKey),
      trust: "high",
      url: ownId.url,
    }));
    ids = ids.concat(ownIds);

    if (flags.all) {
      // List all known IDs
      const proofDb = new ProofDatabase();
      proofDb.listUsers().forEach((user) => {
        if (!ids.map((id) => id.publicKey).includes(user.id)) {
          ids.push({
            current: false,
            publicKey: user.id,
            trust: "none",
            url: user.url,
          });
        }
      });
    }

    cli.table(
      ids,
      {
        current: {
          header: "Current",
          get: (row) => (row.current ? chalk.green("✓") : ""),
        },
        publicKey: {
          header: "ID",
        },
        trust: {},
        url: {
          header: "URL",
        },
      },
      {
        ...flags,
      }
    );
  }
}
