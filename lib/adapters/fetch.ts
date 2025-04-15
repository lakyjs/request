import type { Cancel, OxiosPromise, OxiosRequestConfig, OxiosResponse } from '@/types';
import CancelError from '@/cancel/CancelError';
import buildFullPath from '@/core/buildFullPath';
import { createError, ErrorCodes } from '@/core/OxiosError';
import settle from '@/core/settle';
import { buildURL } from '@/helpers';
import { isFunction } from '@/helpers/is';

const isFetchAdapterSupported = typeof fetch !== 'undefined' && isFunction(fetch);

export default isFetchAdapterSupported && function fetchAdapter(config: OxiosRequestConfig): OxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url,
      baseURL,
      params,
      paramsSerializer,
      method = 'GET',
      data = null,
      responseType,
      headers = {},
      timeout,
      cancelToken,
      signal,
      onDownloadProgress,
    } = config;

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
      method: method.toUpperCase(),
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

    fetch(buildURL(buildFullPath(baseURL, url!), params, paramsSerializer), fetchOptions)
      .then(async response => {
        const _data = await response[responseType ?? 'json']?.();
        const oxiosResponse: OxiosResponse = {
          data: _data,
          status: response.status,
          statusText: response.statusText,
          headers: headers ?? {},
          config,
          request: response as any,
        };

        if(onDownloadProgress){
          const contentLength = response.headers.get('Content-Length');
          const totalBytes = contentLength ? parseInt(contentLength, 10) : void 0;
          let loadedBytes = 0;
          const reader = response.body?.getReader();

          const stream = new ReadableStream({
            start(controller) {
              function push(){
                reader?.read().then(({ done, value }) => {
                  if(done){
                    controller.close();
                    return;
                  }

                  loadedBytes += value.byteLength;
                  const progress = totalBytes ? (loadedBytes / totalBytes) * 100 : void 0;
                  const progressEvent = {
                    loaded: loadedBytes,
                    total: totalBytes,
                    progress,
                    bytes: value,
                    config
                  } as any;

                  onDownloadProgress?.(progressEvent as ProgressEvent);
                  controller.enqueue(value);
                  push();
                })
              }
              push()
            }
          })

          oxiosResponse.data = stream as any;
        }


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
