/* eslint-disable complexity */
import type { Cancel, OxiosPromise, OxiosRequestConfig, OxiosResponse } from '@/types';
import CancelError from '@/cancel/CancelError';
import buildFullPath from '@/core/buildFullPath';
import { createError, ErrorCodes } from '@/core/OxiosError';
import settle from '@/core/settle';
import { buildURL, cookie, isFormData, isURLSameOrigin, parseHeaders } from '@/helpers';

const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

export default isXHRAdapterSupported && function xhr(config: OxiosRequestConfig): OxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = null,
      baseURL,
      auth,
      timeout,
      headers,
      params,
      paramsSerializer,
      responseType,
      cancelToken,
      signal,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
    } = config;

    const request = new XMLHttpRequest();

    // ----- add Events start ----
    const onCancel = (reason?: Cancel) => {
      reject(reason ?? new CancelError('canceled', config, request));
      request.abort();
    };
    request.open(method.toUpperCase(), buildURL(buildFullPath(baseURL, url!), params, paramsSerializer), true);

    request.onreadystatechange = function () {
      if (request.readyState !== 4)
        return;
      if (request.status === 0)
        return;

      const responseHeaders = request.getAllResponseHeaders();
      const responseData = responseType && responseType !== 'text' ? request.response : request.responseText;
      const response: OxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: parseHeaders(responseHeaders),
        config,
        request,
      };

      const done = () => {
        if (cancelToken)
          cancelToken.unsubscribe(onCancel);

        if (signal)
          signal.removeEventListener?.('abort', onCancel);
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
        response
      );
    };

    request.onerror = function () {
      reject(createError('Network Error', config, null, request));
    };

    request.ontimeout = function handleTimeout() {
      reject(
        createError(
          `Timeout of ${timeout} ms exceeded`,
          config,
          ErrorCodes.ERR_TIMEOUT.value,
          request
        )
      );
    };

    if (onDownloadProgress) {
      request.onprogress = onDownloadProgress;
    }

    if (onUploadProgress) {
      request.upload.onprogress = onUploadProgress;
    }

    // ----- add Events end ----

    // ----- configure request start----
    if (responseType) {
      request.responseType = responseType;
    }

    if (timeout) {
      request.timeout = timeout;
    }

    if (withCredentials) {
      request.withCredentials = withCredentials;
    }
    // ----- configure request end----

    // ----- process cancel start----
    if (cancelToken || signal) {
      cancelToken && cancelToken.subscribe(onCancel);
      if (signal) {
        signal?.aborted ? onCancel() : signal?.addEventListener?.('abort', onCancel);
      }
    }
    // ----- process cancel end----

    // ----- process headers start----
    if (isFormData(data)) {
      delete headers!['Content-Type'];
    }

    if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
      const xsrfVal = cookie.read(xsrfCookieName);
      if (xsrfVal && xsrfHeaderName) {
        headers![xsrfHeaderName] = xsrfVal;
      }
    }

    if (auth) {
      headers!.Authorization = `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
    }

    Object.keys(headers!).forEach(name => {
      if (data === null && name.toLocaleLowerCase() === 'content-type') {
        delete headers![name];
      }
      else {
        request.setRequestHeader(name, headers![name]);
      }
    });
    // ----- process headers end----

    request.send(data as any);
  });
};
