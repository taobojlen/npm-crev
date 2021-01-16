import { promises as fs } from "fs";
import * as path from "path";

export const listFiles = async (directoryPath: string): Promise<string[]> => {
  const files = await fs.readdir(directoryPath);
  const filenames = files.filter(async (file) => {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.stat(filePath);
    return stat.isFile();
  });
  return filenames;
};
