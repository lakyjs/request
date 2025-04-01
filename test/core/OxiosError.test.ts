import { describe, it, expect } from 'vitest';
import OxiosError from '@/core/OxiosError';
import type { OxiosRequestConfig, OxiosResponse, OxiosErrorCode } from '@/types';

describe('OxiosError', () => {
  it('should create an instance of OxiosError with the correct properties', () => {
    const message = 'Test error message';
    const code = 'ERR_TEST_CODE' as OxiosErrorCode;
    const config: OxiosRequestConfig = { url: '/test' };
    const request = new XMLHttpRequest();
    const response: OxiosResponse = { status: 404, statusText: 'Not Found', data: null, headers: {}, config: {}, request: new XMLHttpRequest() };

    const error = new OxiosError(message, code, config, request, response);
    const error2 = new OxiosError(message, code, config, request);

    expect(error).toBeInstanceOf(OxiosError);
    expect(error.message).toBe(message);
    expect(error.code).toBe(code);
    expect(error.config).toBe(config);
    expect(error.request).toBe(request);
    expect(error.response).toBe(response);
    expect(error.isOxiosError).toBe(true);
    expect(error.stack).toBeDefined();

    expect(error2.toJSON().status).toBeNull();
  });

  it('should set the stack trace correctly in Node.js environment', () => {
    const message = 'Node.js stack trace test';
    const error = new OxiosError(message, null);

    expect(error.stack).toContain(message);
  });

  it('should serialize to JSON correctly', () => {
    const message = 'Serialization test';
    const code = 'ERR_SERIALIZATION' as OxiosErrorCode;
    const config: OxiosRequestConfig = { url: '/serialize' };
    const response: OxiosResponse = { status: 500, statusText: 'Internal Server Error', data: null, headers: {}, config: {}, request: new XMLHttpRequest() };

    const error = new OxiosError(message, code, config, undefined, response);
    const json = error.toJSON();

    expect(json).toEqual({
      message,
      name: 'Error',
      stack: error.stack,
      code,
      status: response.status,
      config: JSON.parse(JSON.stringify(config))
    });
  });

  it('should handle null or undefined optional parameters', () => {
    const message = 'Optional parameters test';
    const error = new OxiosError(message, null);

    expect(error.message).toBe(message);
    expect(error.code).toBeNull();
    expect(error.config).toBeUndefined();
    expect(error.request).toBeUndefined();
    expect(error.response).toBeUndefined();
  });
});
