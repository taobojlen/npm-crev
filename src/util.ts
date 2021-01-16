import { exec } from "child_process";
import * as path from "path";
import { promises as fs } from "fs";
import * as yaml from "js-yaml";
import { camelizeKeys, decamelizeKeys } from "humps";

export const execPromise = (command: string, cwd?: string): Promise<string> => {
  cwd = cwd || path.resolve(process.cwd());
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error || stderr);
      }
      resolve(stdout);
    });
  });
};

export const readObjectFromYaml = async <T>(yamlPath: string): Promise<T> => {
  const yamlString = (await fs.readFile(yamlPath)).toString();
  return (camelizeKeys(yaml.load(yamlString) as any) as unknown) as T;
};

export const writeObjectToYaml = async <T>(obj: T, yamlPath: string): Promise<void> => {
  const withDecamelizedKeys = decamelizeKeys(obj as any, { separator: "-" });
  const yamlString = yaml.dump(withDecamelizedKeys, { lineWidth: 120, quotingType: '"' } as any);
  await fs.mkdir(path.dirname(yamlPath), { recursive: true });
  await fs.writeFile(yamlPath, yamlString);
};

export const fileExists = async (path: string): Promise<boolean> => {
  try {
    const stat = await fs.stat(path);
    return stat.isFile();
  } catch (e) {
    if (e.code === "ENOENT") {
      return false;
    } else {
      throw e;
    }
  }
};

/**
 * A map similar to Python's defaultdict. Sets a default value
 * for non-existent keys.
 *
 * Example:
 * const dm = new DefaultMap<string, array>(() => [])
 * dm.get("newKey").push("one")
 * dm.get("newKey").push("two")
 * dm.get("newKey") // ["one", "two"]
 */
export class DefaultMap<K, V> extends Map<K, V> {
  private createDefaultValue: (key?: K) => V;

  constructor(createDefaultValue: (key?: K) => V) {
    super();

    if (typeof createDefaultValue !== "function") {
      throw new Error("DefaultMap constructor expects a function that returns a V");
    }
    this.createDefaultValue = createDefaultValue;
  }

  public get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.createDefaultValue(key));
    }
    return super.get(key) as V;
  }
}
