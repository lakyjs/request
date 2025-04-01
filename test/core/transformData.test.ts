import type { OxiosRequestConfig, OxiosResponse, OxiosTransformer } from '@/types';
import { describe, expect, it, vi } from 'vitest';
import { transformData } from '../../lib/core/transformData';

describe('transformData', () => {
  it('should apply a single transformer function to the data', () => {
    const mockTransformer: OxiosTransformer = vi.fn(data => `${data}-transformed`);
    const config: OxiosRequestConfig = { headers: {}, data: 'test-data' } as OxiosRequestConfig;

    const result = transformData.call(config, mockTransformer);

    expect(mockTransformer).toHaveBeenCalledWith('test-data', {}, void 0);
    expect(result).toBe('test-data-transformed');
  });

  it('should apply multiple transformer functions to the data in sequence', () => {
    const mockTransformer1: OxiosTransformer = vi.fn(data => `${data}-step1`);
    const mockTransformer2: OxiosTransformer = vi.fn(data => `${data}-step2`);
    const config: OxiosRequestConfig = { headers: {}, data: 'test-data' } as OxiosRequestConfig;

    const result = transformData.call(config, [mockTransformer1, mockTransformer2]);

    expect(mockTransformer1).toHaveBeenCalledWith('test-data', {}, void 0);
    expect(mockTransformer2).toHaveBeenCalledWith('test-data-step1', {}, void 0);
    expect(result).toBe('test-data-step1-step2');
  });

  it('should use response data and status if response is provided', () => {
    const mockTransformer: OxiosTransformer = vi.fn((data, _headers, status) => `${data}-status-${status}`);
    const config: OxiosRequestConfig = { headers: {}, data: 'config-data' } as OxiosRequestConfig;
    const response: OxiosResponse = { data: 'response-data', status: 200 } as OxiosResponse;

    const result = transformData.call(config, mockTransformer, response);

    expect(mockTransformer).toHaveBeenCalledWith('response-data', {}, 200);
    expect(result).toBe('response-data-status-200');
  });

  it('should default to config data if response is not provided', () => {
    const mockTransformer: OxiosTransformer = vi.fn(data => `${data}-default`);
    const config: OxiosRequestConfig = { headers: {}, data: 'config-data' } as OxiosRequestConfig;

    const result = transformData.call(config, mockTransformer);

    expect(mockTransformer).toHaveBeenCalledWith('config-data', {}, void 0);
    expect(result).toBe('config-data-default');
  });

  it('should handle empty transformer array gracefully', () => {
    const config: OxiosRequestConfig = { headers: {}, data: 'test-data' } as OxiosRequestConfig;

    const result = transformData.call(config, []);

    expect(result).toBe('test-data');
  });

  it('should handle null or undefined data gracefully', () => {
    const mockTransformer: OxiosTransformer = vi.fn(data => data ? `${data}-transformed` : 'no-data');
    const config: OxiosRequestConfig = { headers: {}, data: null } as OxiosRequestConfig;

    const result = transformData.call(config, mockTransformer);

    expect(mockTransformer).toHaveBeenCalledWith(null, {}, void 0);
    expect(result).toBe('no-data');
  });

  it('should handle null or undefined transformer functions gracefully', () => {
    const config: OxiosRequestConfig = { headers: {}, data: 'test-data' } as OxiosRequestConfig;

    const result = transformData.call(config, null as unknown as OxiosTransformer);
    // eslint-disable-next-line no-useless-call
    const result2 = transformData.call(null, null as unknown as OxiosTransformer);

    expect(result).toBe(void 0);
    expect(result2).toBe(void 0);
  });

  it('should handle transformers that modify headers', () => {
    const mockTransformer: OxiosTransformer = vi.fn((data, headers) => {
      headers['X-Test-Header'] = 'test-value';
      return `${data}-with-header`;
    });
    const config: OxiosRequestConfig = { headers: {}, data: 'test-data' } as OxiosRequestConfig;

    const result = transformData.call(config, mockTransformer);

    expect(mockTransformer).toHaveBeenCalledWith('test-data', config.headers, void 0);
    expect(config.headers['X-Test-Header']).toBe('test-value');
    expect(result).toBe('test-data-with-header');
  });

  it('should handle transformers that return undefined', () => {
    const mockTransformer: OxiosTransformer = vi.fn(() => void 0);
    const config: OxiosRequestConfig = { headers: {}, data: 'test-data' } as OxiosRequestConfig;

    const result = transformData.call(config, mockTransformer);

    expect(mockTransformer).toHaveBeenCalledWith('test-data', {}, void 0);
    expect(result).toBeUndefined();
  });

  it('should handle transformers that throw errors', () => {
    const mockTransformer: OxiosTransformer = vi.fn(() => {
      throw new Error('Test error');
    });
    const config: OxiosRequestConfig = { headers: {}, data: 'test-data' } as OxiosRequestConfig;

    expect(() => transformData.call(config, mockTransformer)).toThrow('Test error');
    expect(mockTransformer).toHaveBeenCalledWith('test-data', {}, void 0);
  });
});
