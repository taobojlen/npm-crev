import { camelCase, isArray, isObject } from "lodash";
import { exec } from "child_process";
import * as path from "path";

interface StringObject {
  [key: string]: any;
}

export const camelizeKeys = <T extends StringObject>(object: T): T => {
  if (!isArray(object) && !isObject(object)) {
    return object;
  }
  return Object.keys(object).reduce((acc: any, key) => {
    const newKey = camelCase(key);
    let value = object[key];
    if (isArray(value)) {
      value = value.map((item) => camelizeKeys(item));
    } else if (isObject(value)) {
      value = camelizeKeys(value);
    }
    acc[newKey] = value;
    return acc;
  }, {});
};

/**
 * Given a binary string, returns it as URL-safe base64.
 */
export const binaryToBase64 = (input: string): string => {
  const buffer = Buffer.from(input, "binary");
  return buffer.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
};

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
