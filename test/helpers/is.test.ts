import { describe, it, expect } from 'vitest'
import {
  isArray,
  isDate,
  isPlainObject,
  isFormData,
  isURLSearchParams,
  isFunction,
  isString,
  isNumber,
  isNil,
  isUndefined,
  isObject,
  isOxiosError,
} from '@/helpers/is'
import { createError } from '@/core/OxiosError'

describe('helpers:is', () => {
  it('isArray should validate arrays', () => {
    expect(isArray([])).toBeTruthy()
    expect(isArray('[]')).toBeFalsy()
    expect(isArray(document.all)).toBeFalsy()
    expect(isArray(null)).toBeFalsy()
    expect(isArray({})).toBeFalsy()
  })

  it('isDate should validate dates', () => {
    expect(isDate(new Date())).toBeTruthy()
    expect(isDate(Date.now())).toBeFalsy()
    expect(isDate({})).toBeFalsy()
  })

  it('isPlainObject should validate plain objects', () => {
    expect(isPlainObject({})).toBeTruthy()
    expect(isPlainObject(new Date())).toBeFalsy()
    expect(isPlainObject(Object.create(null))).toBeTruthy()
    expect(isPlainObject(Object.create(Object.create(null)))).toBeTruthy()
    expect(isPlainObject([])).toBeFalsy()
    expect(isPlainObject(null)).toBeFalsy()
  })

  it('isFormData should validate FormData', () => {
    expect(isFormData(new FormData())).toBeTruthy()
    expect(isFormData(void 0)).toBeFalsy()
    expect(isFormData({})).toBeFalsy()
    expect(isFormData([])).toBeFalsy()
  })

  it('isURLSearchParams should validate URLSearchParams', () => {
    expect(isURLSearchParams(new URLSearchParams())).toBeTruthy()
    expect(isURLSearchParams(void 0)).toBeFalsy()
    expect(isURLSearchParams('foo=1&bar=2')).toBeFalsy()
    expect(isURLSearchParams({})).toBeFalsy()
    expect(isURLSearchParams([])).toBeFalsy()
  })

  it('isFunction should validate functions', () => {
    expect(isFunction(() => { })).toBeTruthy()
    expect(isFunction({})).toBeFalsy()
    expect(isFunction([])).toBeFalsy()
    expect(isFunction(null)).toBeFalsy()
  })

  it('isString should validate strings', () => {
    expect(isString('foo')).toBeTruthy()
    expect(isString(1)).toBeFalsy()
    expect(isString({})).toBeFalsy()
    expect(isString([])).toBeFalsy()
  })

  it('isNumber should validate numbers', () => {
    expect(isNumber(1)).toBeTruthy()
    expect(isNumber('1')).toBeFalsy()
    expect(isNumber({})).toBeFalsy()
    expect(isNumber([])).toBeFalsy()
  })

  it('isNil should validate null and undefined', () => {
    expect(isNil(null)).toBeTruthy()
    expect(isNil(undefined)).toBeTruthy()
    expect(isNil(1)).toBeFalsy()
    expect(isNil({})).toBeFalsy()
  })

  it('isUndefined should validate undefined', () => {
    expect(isUndefined(undefined)).toBeTruthy()
    expect(isUndefined(null)).toBeFalsy()
  })

  it('isObject should validate objects', () => {
    expect(isObject({})).toBeTruthy()
    expect(isObject(new Date())).toBeTruthy()
    expect(isObject([])).toBeTruthy()
    expect(isObject(null)).toBeFalsy()
    expect(isObject(1)).toBeFalsy()
  })

  it('isOxiosError should validate OxiosError', () => {
    const customError = createError('foo', {}, null)
    expect(isOxiosError(customError)).toBeTruthy()
    expect(isOxiosError(new Error())).toBeFalsy()
    expect(isOxiosError({})).toBeFalsy()
  })
})
