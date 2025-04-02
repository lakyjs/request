/* eslint-disable max-lines */
/* eslint-disable no-restricted-globals */
import type { OxiosRequestConfig } from '@/types';
import xhr from '@/adapters/xhr';
import { describe, expect, it, vi } from 'vitest';

describe('xhr adapter', () => {
  it('should resolve with a successful response', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      responseText: '{"message":"success"}',
      getAllResponseHeaders: vi.fn(() => 'Content-Type: application/json'),
    };

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = mockResponse.status;
        this.statusText = mockResponse.statusText;
        this.responseText = mockResponse.responseText;
        this.getAllResponseHeaders = mockResponse.getAllResponseHeaders;
        this.onreadystatechange();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
    };

    const result = await xhr(config);
    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockResponse.responseText);
  });

  it('should reject on network error', async () => {
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function () {
        this.onerror();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
    };

    await expect(xhr(config)).rejects.toThrow('Network Error');
  });

  it('should reject on timeout', async () => {
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function () {
        this.ontimeout();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
    })) as any;

    // const original = ErrorCodes.ERR_TIMEOUT;
    // ErrorCodes.ERR_TIMEOUT = { value: 'error timeout' as any };
    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      timeout: 1000,
    };
    await expect(xhr(config)).rejects.toThrow('Timeout of 1000 ms exceeded');
    // ErrorCodes.ERR_TIMEOUT = original;
  });

  it('should handle cancellation', async () => {
    const cancelToken = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    } as any;

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      cancelToken,
    };

    const promise = xhr(config);
    cancelToken.subscribe.mock.calls[0][0](); // Trigger cancellation
    await expect(promise).rejects.toThrow('canceled');
  });

  it('should set headers correctly', async () => {
    const mockSetRequestHeader = vi.fn();
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange();
      }),
      setRequestHeader: mockSetRequestHeader,
      abort: vi.fn(),
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
      },
      data: JSON.stringify({ key: 'value' }),
    };

    await xhr(config);
    expect(mockSetRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    expect(mockSetRequestHeader).toHaveBeenCalledWith('Authorization', 'Bearer token');
  });

  it('should handle withCredentials option', async () => {
    const mockWithCredentials = vi.fn();
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
      withCredentials: mockWithCredentials,
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      withCredentials: true,
    };

    await xhr(config);
    expect(global.XMLHttpRequest).toHaveBeenCalled();
  });

  it('should handle responseType correctly', async () => {
    const mockResponse = {
      status: 200,
      response: { message: 'success' },
    };

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = mockResponse.status;
        this.response = mockResponse.response;
        this.onreadystatechange();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
      responseType: '',
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      responseType: 'json',
    };

    const result = await xhr(config);
    expect(result.data).toEqual(mockResponse.response);
  });

  it('should handle onDownloadProgress callback', async () => {
    const mockResponse = {
      status: 200,
      response: { message: 'success' },
    };

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = mockResponse.status;
        this.response = mockResponse.response;
        this.onreadystatechange();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
      responseType: '',
    })) as any;

    const config1: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      responseType: 'json',
    };

    const config2: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      responseType: 'json',
      onDownloadProgress: vi.fn(),
    };

    const result1 = await xhr(config1);
    expect((result1.request as XMLHttpRequest)?.onprogress).not.toBeDefined();
    const result2 = await xhr(config2);
    expect((result2.request as XMLHttpRequest)?.onprogress).toBeDefined();
  });

  it('should handle onUploadProgress callback', async () => {
    const mockResponse = {
      status: 200,
      response: { message: 'success' },
    };

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = mockResponse.status;
        this.response = mockResponse.response;
        this.onreadystatechange();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
      upload: {}, // Mock the upload property
      responseType: '',
    })) as any;

    const config1: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      responseType: 'json',
    };

    const config2: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      responseType: 'json',
      onUploadProgress: vi.fn(),
    };

    const result1 = await xhr(config1);
    expect((result1.request as XMLHttpRequest)?.upload?.onprogress).not.toBeDefined();

    const result2 = await xhr(config2);
    expect((result2.request as XMLHttpRequest)?.upload?.onprogress).toBeDefined();
  });

  it('should handle FormData correctly', async () => {
    const mockSetRequestHeader = vi.fn();
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange();
      }),
      setRequestHeader: mockSetRequestHeader,
      abort: vi.fn(),
    })) as any;

    const formData = new FormData();
    formData.append('key', 'value');

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: formData,
    };

    await xhr(config);
    expect(mockSetRequestHeader).not.toHaveBeenCalledWith('Content-Type', 'application/json');
  });

  it('should handle xsrfCookieName and xsrfHeaderName correctly', async () => {
    const mockHeader = {};
    const mockGetAllResponseHeaders = vi.fn(() => {
      let result = '';
      for (const key in mockHeader) {
        result += `${key}: ${mockHeader[key]}\n`;
      }
      return result;
    });

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = 200;
        this.getAllResponseHeaders = mockGetAllResponseHeaders;
        this.onreadystatechange();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
    })) as any;

    document.cookie = 'XSRF-TOKEN=tokenValue';
    const result = await xhr({
      url: '/test',
      method: 'GET',
      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',
      headers: mockHeader
    });

    expect(result.config.headers['X-XSRF-TOKEN']).toBe('tokenValue');
    expect(result.headers['x-xsrf-token']).toBe('tokenValue');
  });

  it('should handle auth correctly', async () => {
    const mockSetRequestHeader = vi.fn();
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange();
      }),
      setRequestHeader: mockSetRequestHeader,
      abort: vi.fn(),
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      auth: { username: 'user', password: 'pass' },
    };

    await xhr(config);
    expect(mockSetRequestHeader).toHaveBeenCalledWith('Authorization', `Basic ${btoa('user:pass')}`);
  });

  it('should remove content-type header if data is null', async () => {
    const mockSetRequestHeader = vi.fn();
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange();
      }),
      setRequestHeader: mockSetRequestHeader,
      abort: vi.fn(),
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: null,
    };

    await xhr(config);
    expect(mockSetRequestHeader).not.toHaveBeenCalledWith('Content-Type', 'application/json');
  });

  it('should handle signal abort correctly', async () => {
    const mockAbort = vi.fn();
    const mockAddEventListener = vi.fn((event, callback) => {
      if (event === 'abort') {
        callback();
      }
    });

    const signal = {
      aborted: false,
      addEventListener: mockAddEventListener,
    } as any;

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      abort: mockAbort,
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      signal,
    };

    const promise = xhr(config);
    signal.addEventListener('abort', () => signal.aborted = true); // Simulate abort
    await expect(promise).rejects.toThrow('canceled');
    expect(mockAbort).toHaveBeenCalled();
    expect(mockAddEventListener).toHaveBeenCalledWith('abort', expect.any(Function));
  });

  it('should handle already aborted signal', async () => {
    const mockAbort = vi.fn();

    const signal = {
      aborted: true,
      addEventListener: vi.fn(),
    } as any;

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      abort: mockAbort,
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      signal,
    };

    await expect(xhr(config)).rejects.toThrow('canceled');
    expect(mockAbort).toHaveBeenCalled();
    expect(signal.addEventListener).not.toHaveBeenCalled();
  });

  it('should remove abort event listener when signal is provided', async () => {
    const mockRemoveEventListener = vi.fn();
    const signal = {
      aborted: false,
      addEventListener: vi.fn(),
      removeEventListener: mockRemoveEventListener,
    } as any;

    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: XMLHttpRequest | any) {
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange();
      }),
      setRequestHeader: vi.fn(),
      abort: vi.fn(),
    })) as any;

    const config: OxiosRequestConfig = {
      url: '/test',
      method: 'GET',
      signal,
    };

    await xhr(config);
    expect(mockRemoveEventListener).toHaveBeenCalledWith('abort', expect.any(Function));
  });
});
