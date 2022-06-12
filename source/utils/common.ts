import {isNumber, isString} from '@abhijithvijayan/ts-utils';

export const NOOP = (_args?: unknown): void => {};

// removes http(s) protocol from URL
export const removeProtocol = (url: string): string => {
  return url.replace(/^https?:\/\//, '');
};

export const sanitizeURL = (url: string): string => {
  // eslint-disable-next-line no-useless-escape
  return url.replace(/\/$/, '').replace(/([^:\/])[\/]+/g, '$1/');
};

// eslint-disable-next-line @typescript-eslint/ban-types
type NonFunctional<T> = T extends Function ? never : T;

/**
 *  Helper to produce an array of enum values.
 *  @param enumeration Enumeration object.
 */
export function enumToArray<T>(enumeration: any): NonFunctional<T[keyof T]>[] {
  return Object.keys(enumeration)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => enumeration[key])
    .filter((val) => isNumber(val) || isString(val));
}
