import OxiosError from '@/core/OxiosError';
import { getPrototypeOf, kindOf } from './index';

const objToString = Object.prototype.toString;
const typeOfTest = (type: string) => (thing: unknown) => typeof thing === type;

export const isFunction = typeOfTest('function') as (thing: unknown) => thing is Function;

export const isString = typeOfTest('string') as (thing: unknown) => thing is string;

export const isNumber = typeOfTest('number') as (thing: unknown) => thing is number;

export const isUndefined = typeOfTest('undefined') as (thing: unknown) => thing is undefined;

export const isObject = (thing: unknown): thing is object => thing !== null && typeof thing === 'object';

export const isArray = <T = any>(thing: unknown): thing is T[] => Array.isArray(thing);

export const isNil = (thing: unknown): boolean => thing == null;

export function isDate(thing: unknown): thing is Date {
  return objToString.call(thing) === '[object Date]';
}

export function isFormData(thing: unknown): thing is FormData {
  return typeof thing !== 'undefined' && thing instanceof FormData;
}

export function isPlainObject(thing: unknown): boolean {
  if (kindOf(thing) !== 'object') {
    return false;
  }
  const prototype = getPrototypeOf(thing);
  return (
    (prototype === null
      || prototype === Object.prototype
      || Object.getPrototypeOf(prototype) === null)
    && !(Symbol.toStringTag in (thing as object))
    && !(Symbol.iterator in (thing as object))
  );
}

export function isURLSearchParams(thing: unknown): thing is URLSearchParams {
  return typeof thing !== 'undefined' && thing instanceof URLSearchParams;
}

export function isOxiosError(thing:unknown):thing is OxiosError {
  return isObject(thing) && thing instanceof OxiosError && thing?.isOxiosError === true;
}
