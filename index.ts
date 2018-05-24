import flatten = require('flat');
import _ = require('lodash');

export type Constructor = new (value: any) => any;

export interface DefinitionsSchema {
  [key: string]: Constructor;
}

const MONGODB_SPECIAL_OPERATORS = [
  '$and',
  '$or',
  '$in',
  '$nin',
];

/**
 *
 * @param {object} body
 * @param {DefinitionsSchema} schema
 * @returns {any}
 */
export function castDocument<T>(body: T, schema: DefinitionsSchema): T {
  const result: any = {};
  const paths = Object.keys(flatten(body, {
    safe: true,
  }));

  for (const path of paths) {
    const originalValue = _.get(body, path);
    const constructor = schema[path];

    if (!constructor) {
      _.set(result, path, originalValue);
    } else if (Array.isArray(originalValue)) {
      _.set(result, path, originalValue.map((item) => new constructor(item)));
    } else {
      _.set(result, path, new constructor(originalValue));
    }
  }

  return result;
}

/**
 *
 * @param {T} body
 * @param {DefinitionsSchema} schema
 * @returns {T}
 */
export function castFilter<T>(body: T, schema: DefinitionsSchema): T {
  const result: any = {};
  const paths = Object.keys(body);

  for (const path of paths) {
    if (MONGODB_SPECIAL_OPERATORS.includes(path)) {
      result[path] = (<any>body)[path].map((value: any) => castFilter(value, schema));

      continue;
    }

    const value = (<any>body)[path];
    const constructor = schema[path];

    if (!constructor) {
      result[path] = value;

      continue;
    }

    result[path] = castValue(value, constructor);
  }

  return result;
}

/**
 *
 * @param value
 * @param constructor
 * @returns {any}
 */
export function castValue(value: any, constructor: Constructor): any {
  if (Array.isArray(value)) {
    return value.map((item) => castValue(item, constructor));
  }

  if (typeof value === 'object') {
    return Object.entries(value).reduce((result: any, [key, value]) => {
      result[key] = castValue(value, constructor);

      return result;
    }, {});
  }

  return new constructor(value);
}
