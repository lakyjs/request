import type { Cancel, OxiosPromise, OxiosRequestConfig, OxiosResponse } from '@/types';
import CancelError from '@/cancel/CancelError';
import { createError, ErrorCodes } from '@/core/OxiosError';
import settle from '@/core/settle';
import { isFunction } from '@/helpers/is';

const isFetchAdapterSupported = typeof fetch !== 'undefined' && isFunction(fetch);

export default isFetchAdapterSupported && function fetchAdapter(config: OxiosRequestConfig): OxiosPromise {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = null, headers = {}, timeout, cancelToken, signal } = config;

    const controller = new AbortController();
    const fetchSignal = controller.signal;

    const onCancel = (reason?: Cancel) => {
      reject(reason ?? new CancelError('canceled', config));
      controller.abort();
    };

    const done = () => {
      if (cancelToken) {
        cancelToken.unsubscribe(onCancel);
      }
      if (signal) {
        signal.removeEventListener?.('abort', onCancel);
      }
    };

    const fetchOptions: RequestInit = {
      method,
      headers: (headers as any),
      body: (data as any),
      signal: fetchSignal,
    };

    if (timeout) {
      setTimeout(() => {
        controller.abort();
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, ErrorCodes.ERR_TIMEOUT.value));
      }, timeout);
    }

    if (cancelToken || signal) {
      cancelToken && cancelToken.subscribe(onCancel);
      if (signal) {
        signal?.aborted ? onCancel() : signal?.addEventListener?.('abort', onCancel);
      }
    }

    fetch(url!, fetchOptions)
      .then(response => {
        const oxiosResponse: OxiosResponse = {
          data: response.json(),
          status: response.status,
          statusText: response.statusText,
          headers: headers ?? {},
          config,
          request: response as any,
        };

        settle(
          val => {
            resolve(val);
            done();
          },
          err => {
            reject(err);
            done();
          },
          oxiosResponse
        );
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          reject(createError('Request aborted', config, ErrorCodes.ERR_ABORTED.value));
        }
        else {
          reject(createError('Network Error', config, null));
        }
      });
  });
};
