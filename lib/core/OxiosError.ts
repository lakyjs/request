import type { OxiosError as IOxiosError, OxiosErrorCode, OxiosRequestConfig, OxiosResponse } from '@/types';
import type { ClientRequest } from 'node:http';

import { isFunction, toJSONObject } from '@/helpers';

export default class OxiosError extends Error implements IOxiosError {
  isOxiosError: boolean;

  // eslint-disable-next-line max-params
  constructor(
    message: string,
    public code: OxiosErrorCode | null,
    public config?: OxiosRequestConfig,
    public request?: XMLHttpRequest | ClientRequest,
    public response?: OxiosResponse
  ) {
    super(message);

    // Nodejs 环境下，可以使用 Error.captureStackTrace 方法
    if (Error?.captureStackTrace && isFunction?.(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor);
    }
    // 浏览器环境
    else {
      this.stack = new Error(message).stack;
    }

    this.isOxiosError = true;
    Object.setPrototypeOf(this, OxiosError.prototype);
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      stack: this.stack,
      code: this.code,
      status: (this.response && this.response.status) ?? null,
      config: toJSONObject(this.config)
    };
  }
}

const descriptors: Record<string, { value: OxiosErrorCode }> = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL'
].forEach(code => {
  descriptors[code as OxiosErrorCode] = { value: code as OxiosErrorCode };
});

Object.defineProperties(OxiosError, descriptors);

// eslint-disable-next-line max-params
function createError(
  message: string,
  config: OxiosRequestConfig,
  code: OxiosErrorCode | null,
  request?: XMLHttpRequest | ClientRequest,
  response?: OxiosResponse
): OxiosError {
  return new OxiosError(message, code, config, request, response);
}

export { createError, descriptors as ErrorCodes };
