import type { OxiosPromise, OxiosRequestConfig, OxiosResponse } from '@/types';

import isCancel from '@/cancel/isCancel';
import dispatchRequest from '@/core/dispatchRequest';
import defaults from '@/defaults';
import { describe, expect, it, vi } from 'vitest';

function adapter(config: OxiosRequestConfig) {
  return new Promise(resolve => {
    const response: OxiosResponse = {
      data: 'response-data',
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: new XMLHttpRequest()
    };
    resolve(response);
  });
}

describe('dispatchRequest', () => {
  it('should call the adapter and return a response', async () => {
    const config = { ...defaults, url: '/test', adapter } as OxiosRequestConfig;
    const response = await dispatchRequest(config);
    expect(response.data).toBe('response-data');
    expect(response.status).toBe(200);
  });

  it('should throw cancel error if config.signal is aborted', () => {
    const controller = new AbortController();
    const config = {
      ...defaults,
      adapter,
      url: '/test',
      signal: controller.signal
    } as OxiosRequestConfig;

    controller.abort();

    try {
      dispatchRequest(config);
    }
    catch (error) {
      expect(isCancel(error)).toBe(true);
      expect(error.message).toBe('canceled');
    }
  });

  it('should use the default adapter if config.adapter is nil', async () => {
    const config = { ...defaults, adapter: void 0, url: '/test' } as OxiosRequestConfig;
    const hook = vi.fn();
    const defaultAdapter = defaults.adapter as (config: OxiosRequestConfig) => OxiosPromise;
    defaults.adapter = (config: OxiosRequestConfig) => {
      hook();
      return adapter(config) as OxiosPromise;
    };

    await dispatchRequest(config);

    expect(hook).toHaveBeenCalled();
    defaults.adapter = defaultAdapter; // Restore the original adapter
  });
});
