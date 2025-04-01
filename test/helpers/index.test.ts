import { describe, it, expect } from 'vitest'
import { toJSONObject, kindOf, extend, deepMerge, getPrototypeOf } from '@/helpers'

describe('helpers:index', () => {

  describe('toJSONObject', () => {
    it('should convert a plain object to a JSON-compatible object', () => {
      const obj = { foo: 'bar', baz: 42 };
      const result = toJSONObject(obj);
      expect(result).toEqual(obj);
    });

    it('should handle nested objects correctly', () => {
      const obj = { foo: { bar: { baz: 42 } } };
      const result = toJSONObject(obj);
      expect(result).toEqual(obj);
    });

    it('should handle arrays correctly', () => {
      const obj = { foo: [1, 2, 3] };
      const result = toJSONObject(obj);
      expect(result).toEqual(obj);
    });

    it('should avoid circular references', () => {
      const obj: any = { foo: 'bar' };
      obj.self = obj; // Circular reference
      const result = toJSONObject(obj);
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should respect objects with toJSON methods', () => {
      const obj = {
        foo: 'bar',
        toJSON() {
          return { foo: 'baz' };
        },
      };
      const result = toJSONObject(obj);
      expect(result).toEqual(obj); // Should not modify objects with toJSON
    });

    it('should return non-object values as-is', () => {
      expect(toJSONObject(42)).toBe(42);
      expect(toJSONObject('foo')).toBe('foo');
      expect(toJSONObject(null)).toBe(null);
      expect(toJSONObject(undefined)).toBe(undefined);
    });

    it('should handle deep nested objects with arrays', () => {
      const obj = { foo: [{ bar: { baz: 42 } }] };
      const result = toJSONObject(obj);
      expect(result).toEqual(obj);
    });

    it('should handle empty objects and arrays', () => {
      expect(toJSONObject({})).toEqual({});
      expect(toJSONObject([])).toEqual([]);
    });

    it('should handle objects with undefined values', () => {
      const obj = { foo: undefined, bar: 42 };
      const result = toJSONObject(obj);
      expect(result).toEqual({ bar: 42 }); // Undefined values should be omitted
    });

    it('should handle objects with symbols', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value', foo: 'bar' };
      const result = toJSONObject(obj);
      expect(result).toEqual({ foo: 'bar' }); // Symbols should be omitted
    });
  })

  describe('kindOf', () => {
    it('should return "array" for arrays', () => {
      expect(kindOf([])).toBe('array');
      expect(kindOf([1, 2, 3])).toBe('array');
    });

    it('should return "object" for plain objects', () => {
      expect(kindOf({})).toBe('object');
      expect(kindOf({ key: 'value' })).toBe('object');
    });

    it('should return "string" for strings', () => {
      expect(kindOf('')).toBe('string');
      expect(kindOf('hello')).toBe('string');
    });

    it('should return "number" for numbers', () => {
      expect(kindOf(0)).toBe('number');
      expect(kindOf(42)).toBe('number');
      expect(kindOf(NaN)).toBe('number');
    });

    it('should return "boolean" for booleans', () => {
      expect(kindOf(true)).toBe('boolean');
      expect(kindOf(false)).toBe('boolean');
    });

    it('should return "null" for null', () => {
      expect(kindOf(null)).toBe('null');
    });

    it('should return "undefined" for undefined', () => {
      expect(kindOf(undefined)).toBe('undefined');
    });

    it('should return "function" for functions', () => {
      expect(kindOf(() => { })).toBe('function');
      expect(kindOf(function test() { })).toBe('function');
    });

    it('should return "date" for Date objects', () => {
      expect(kindOf(new Date())).toBe('date');
    });

    it('should return "regexp" for RegExp objects', () => {
      expect(kindOf(/test/)).toBe('regexp');
      expect(kindOf(new RegExp('test'))).toBe('regexp');
    });

    it('should return "error" for Error objects', () => {
      expect(kindOf(new Error())).toBe('error');
    });

    it('should return "map" for Map objects', () => {
      expect(kindOf(new Map())).toBe('map');
    });

    it('should return "set" for Set objects', () => {
      expect(kindOf(new Set())).toBe('set');
    });

    it('should return "weakmap" for WeakMap objects', () => {
      expect(kindOf(new WeakMap())).toBe('weakmap');
    });

    it('should return "weakset" for WeakSet objects', () => {
      expect(kindOf(new WeakSet())).toBe('weakset');
    });

    it('should return "symbol" for symbols', () => {
      expect(kindOf(Symbol('test'))).toBe('symbol');
    });

    it('should return "bigint" for BigInt values', () => {
      expect(kindOf(BigInt(123))).toBe('bigint');
    });

    it('should return "arraybuffer" for ArrayBuffer objects', () => {
      expect(kindOf(new ArrayBuffer(10))).toBe('arraybuffer');
    });

    it('should return "dataview" for DataView objects', () => {
      expect(kindOf(new DataView(new ArrayBuffer(10)))).toBe('dataview');
    });

    it('should return "int8array" for Int8Array objects', () => {
      expect(kindOf(new Int8Array(10))).toBe('int8array');
    });

    it('should return "uint8array" for Uint8Array objects', () => {
      expect(kindOf(new Uint8Array(10))).toBe('uint8array');
    });

    it('should return "uint8clampedarray" for Uint8ClampedArray objects', () => {
      expect(kindOf(new Uint8ClampedArray(10))).toBe('uint8clampedarray');
    });

    it('should return "int16array" for Int16Array objects', () => {
      expect(kindOf(new Int16Array(10))).toBe('int16array');
    });

    it('should return "uint16array" for Uint16Array objects', () => {
      expect(kindOf(new Uint16Array(10))).toBe('uint16array');
    });

    it('should return "int32array" for Int32Array objects', () => {
      expect(kindOf(new Int32Array(10))).toBe('int32array');
    });

    it('should return "uint32array" for Uint32Array objects', () => {
      expect(kindOf(new Uint32Array(10))).toBe('uint32array');
    });

    it('should return "float32array" for Float32Array objects', () => {
      expect(kindOf(new Float32Array(10))).toBe('float32array');
    });

    it('should return "float64array" for Float64Array objects', () => {
      expect(kindOf(new Float64Array(10))).toBe('float64array');
    });

    it('should return "promise" for Promise objects', () => {
      expect(kindOf(Promise.resolve())).toBe('promise');
    });
  })

  describe('extend', () => {
    it('should copy properties from one object to another', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = extend(target, source);

      expect(result).toEqual({ a: 1, b: 2 });
      expect(result).toBe(target); // Ensure the target object is mutated
    });

    it('should overwrite existing properties in the target object', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = extend(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should bind functions to the provided thisArg', () => {
      const target = {};
      const source = {
        greet() {
          return `Hello, ${this.name}`;
        },
      };
      const thisArg = { name: 'World' };
      const result = extend(target, source, thisArg);

      expect(typeof result.greet).toBe('function');
      expect(result.greet()).toBe('Hello, World');
    });

    it('should handle empty source objects', () => {
      const target = { a: 1 };
      const source = {};
      const result = extend(target, source);

      expect(result).toEqual({ a: 1 });
    });

    it('should handle empty target objects', () => {
      const target = {};
      const source = { b: 2 };
      const result = extend(target, source);

      expect(result).toEqual({ b: 2 });
    });

    it('should handle multiple properties and types', () => {
      const target = { a: 1 };
      const source = { b: 'string', c: true, d: null, e: undefined };
      const result = extend(target, source);

      expect(result).toEqual({ a: 1, b: 'string', c: true, d: null, e: undefined });
    });
  });

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { b: { d: 3 }, e: 4 };
      const result = deepMerge(obj1, obj2);

      expect(result).toEqual({
        a: 1,
        b: { c: 2, d: 3 },
        e: 4,
      });
    });

    it('should handle multiple objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const obj3 = { c: 3 };
      const result = deepMerge(obj1, obj2, obj3);

      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 3,
      });
    });

    it('should overwrite primitive values', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const result = deepMerge(obj1, obj2);

      expect(result).toEqual({
        a: 1,
        b: 3,
        c: 4,
      });
    });

    it('should merge nested objects', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { d: 2 } } };
      const result = deepMerge(obj1, obj2);

      expect(result).toEqual({
        a: { b: { c: 1, d: 2 } },
      });
    });

    it('should handle arrays as values', () => {
      const obj1 = { a: [1, 2] };
      const obj2 = { a: [3, 4] };
      const result = deepMerge(obj1, obj2);

      expect(result).toEqual({
        a: [3, 4],
      });
    });

    it('should create a new object and not mutate inputs', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const result = deepMerge(obj1, obj2);

      expect(result).not.toBe(obj1);
      expect(result).not.toBe(obj2);
      expect(obj1).toEqual({ a: 1 });
      expect(obj2).toEqual({ b: 2 });
    });

    it('should handle empty objects', () => {
      const obj1 = {};
      const obj2 = { a: 1 };
      const result = deepMerge(obj1, obj2);

      expect(result).toEqual({ a: 1 });
    });

    it('should handle non-object values gracefully', () => {
      const obj1 = { a: 1 };
      const obj2 = null;
      const obj3 = undefined;
      const result = deepMerge(obj1, obj2, obj3);

      expect(result).toEqual({ a: 1 });
    });
  });

  describe('getPrototypeOf', () => {

    it('should return the prototype of an object', () => {
      const obj = { a: 1 };
      const proto = Object.getPrototypeOf(obj);

      expect(getPrototypeOf(obj)).toBe(proto);
    });

    it('should return null for objects with no prototype', () => {
      const obj = Object.create(null);

      expect(getPrototypeOf(obj)).toBe(null);
    });

  })
})
