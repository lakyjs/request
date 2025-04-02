import type { OxiosResponse } from '@/types';
import settle from '@/core/settle';
import { describe, expect, it, vi } from 'vitest';

describe('settle', () => {
  it('should resolve if validateStatus is true', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const response: OxiosResponse = {
      status: 200,
      statusText: 'OK',
      config: {
        validateStatus: (status: number) => status >= 200 && status < 300,
      },
      data: {},
      headers: {},
      request: new XMLHttpRequest(),
    };

    settle(resolve, reject, response);

    expect(resolve).toHaveBeenCalledWith(response);
    expect(reject).not.toHaveBeenCalled();
  });

  it('should resolve if response.status is falsy', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const response: OxiosResponse = {
      status: 0,
      statusText: 'OK',
      config: {
        validateStatus: (status: number) => status >= 200 && status < 300,
      },
      data: {},
      headers: {},
      request: new XMLHttpRequest(),
    };

    settle(resolve, reject, response);

    expect(resolve).toHaveBeenCalledWith(response);
    expect(reject).not.toHaveBeenCalled();
  });

  it('should reject if validateStatus is false', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const response: OxiosResponse = {
      status: 400,
      statusText: 'Bad Request',
      config: {
        validateStatus: (status: number) => status >= 200 && status < 300,
      },
      data: {},
      headers: {},
      request: new XMLHttpRequest(),
    };

    settle(resolve, reject, response);

    expect(reject).toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
  });

  it('should reject with ERR_BAD_RESPONSE for 5xx status codes', () => {
    const resolve = vi.fn();
    const reject = vi.fn();
    const response: OxiosResponse = {
      status: 500,
      statusText: 'Internal Server Error',
      config: {
        validateStatus: (status: number) => status >= 200 && status < 300,
      },
      data: {},
      headers: {},
      request: new XMLHttpRequest(),
    };

    settle(resolve, reject, response);

    expect(reject).toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
  });
});
