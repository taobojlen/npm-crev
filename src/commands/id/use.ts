import { prompt } from "enquirer";
import { Command, flags } from "@oclif/command";

import { toBase64 } from "../../crypto/util";

import { listIds, updateCurrentIdConfig } from "../../id";

export default class Use extends Command {
  static description = "switch the current crev ID";
  static alisaes = ["id:switch"];

  static flags = {
    help: flags.help({ char: "h" }),
  };

  static args = [{ name: "id" }];

  async run(): Promise<void> {
    const { args } = this.parse(Use);

    let selectedId;
    if (!args.id) {
      const ownIds = await listIds();
      selectedId = await prompt<{ id: string }>({
        name: "id",
        message: "Select an ID",
        type: "select",
        choices: ownIds.map((id) => ({
          name: toBase64(id.publicKey),
          hint: id.url,
          value: toBase64(id.publicKey),
        })),
      });
      selectedId = selectedId.id;
    } else {
      selectedId = args.id;
    }

    await updateCurrentIdConfig(selectedId);
  }
}
