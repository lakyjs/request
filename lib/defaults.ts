import type { OxiosRequestConfig } from './types';
import { processHeaders } from './helpers/headers';
import { transformRequest, transformResponse } from './helpers/transform';

export default {
  timeout: 0,
  method: 'GET',
  adapter: 'xhr',
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  },
  transformRequest: [
    function (data, headers) {
      processHeaders(headers!, data);
      return transformRequest(data);
    }
  ],
  transformResponse: [
    function (data) {
      return transformResponse(data);
    }
  ],
  validateStatus(status: number) {
    return status >= 200 && status < 300;
  }
} as OxiosRequestConfig;
