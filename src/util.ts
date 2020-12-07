import { camelCase, isArray, isObject } from "lodash";

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
