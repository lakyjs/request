import type { OxiosRequestConfig } from '@/types';
import { describe, expect, it } from 'vitest';
import mergeConfig from '../../lib/core/mergeConfig';

describe('mergeConfig', () => {
  it('should return config1 if config2 is not provided', () => {
    const config1: OxiosRequestConfig = { url: '/test', method: 'get' };
    const result = mergeConfig(config1);
    expect(result).toEqual(config1);
  });

  it('should merge two configurations with default strategy', () => {
    const config1: OxiosRequestConfig = { url: '/test', method: 'get' };
    const config2: OxiosRequestConfig = { method: 'post' };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({ url: '/test', method: 'post' });
  });

  it('should use fromVal2Strat for specific keys', () => {
    const config1: OxiosRequestConfig = { url: '/test', params: { a: 1 } };
    const config2: OxiosRequestConfig = { url: '/new-test', params: { b: 2 } };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({ url: '/new-test', params: { b: 2 } });
  });

  it('should use deepMergeStrat for deep mergeable keys', () => {
    const config1: OxiosRequestConfig = { headers: { common: { Accept: 'application/json' } } };
    const config2: OxiosRequestConfig = { headers: { common: { Authorization: 'Bearer token' } } };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({
      headers: {
        common: {
          Accept: 'application/json',
          Authorization: 'Bearer token',
        },
      },
    });
  });

  it('should handle nil values correctly', () => {
    const config1: OxiosRequestConfig = { url: '/test', method: 'get' };
    const config2: OxiosRequestConfig = { url: void 0, method: void 0 };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({ url: '/test', method: 'get' });
  });

  it('should merge all keys from both configs', () => {
    const config1: OxiosRequestConfig = { url: '/test', timeout: 1000 };
    const config2: OxiosRequestConfig = { method: 'post', headers: { 'Content-Type': 'application/json' } };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({
      url: '/test',
      timeout: 1000,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should return val1 if val2 is nil and val1 is not nil', () => {
    const config1: OxiosRequestConfig = { url: '/test', method: 'get' };
    const config2: OxiosRequestConfig = { url: void 0, method: void 0 };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({ url: '/test', method: 'get' });
  });

  it('should return val1 if val2 is nil and val1 is a plain object', () => {
    const config1: OxiosRequestConfig = { headers: { common: { Accept: 'application/json' } } };
    const config2: OxiosRequestConfig = { headers: void 0 };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({
      headers: {
        common: {
          Accept: 'application/json',
        },
      },
    });
  });

  it('should return val1 if val2 is nil and val1 is a primitive value', () => {
    const config1: OxiosRequestConfig = { timeout: 1000 };
    const config2: OxiosRequestConfig = { timeout: void 0 };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({ timeout: 1000 });
  });

  it('should return val1 if val2 is nil and val1 is not a plain object with deepMergeStrat', () => {
    const config1: any = { headers: 'nothing' };
    const config2: OxiosRequestConfig = { headers: void 0 };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({ headers: 'nothing' });
  });

  it('should return val2 if val2 is not nil and plain object with deepMergeStrat', () => {
    const config1: any = { headers: 'nothing' };
    const config2: any = { headers: 'noting too' };
    const result = mergeConfig(config1, config2);
    expect(result).toEqual({ headers: 'noting too' });
  });
});
