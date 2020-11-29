import {camelCase, isObject} from 'lodash'

interface StringObject {
  [key: string]: any;
}

export const camelizeKeys = <T extends StringObject>(object: T): T => {
  return Object.keys(object).reduce((acc: any, key) => {
    const newKey = camelCase(key)
    let value = object[key]
    if (isObject(value)) {
      value = camelizeKeys(value)
    }
    acc[newKey] = value
    return acc
  }, {})
}
