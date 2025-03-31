import type { Cancel as ICancelError, OxiosRequestConfig } from '@/types';
import type { ClientRequest } from 'node:http';
import OxiosError, { ErrorCodes } from '@/core/OxiosError';

export default class CancelError extends OxiosError implements ICancelError {
  __CANCEL__: boolean;
  constructor(public message: string, config: OxiosRequestConfig, request?: XMLHttpRequest | ClientRequest) {
    super(message ?? 'canceled', ErrorCodes.ERR_CANCELED.value, config, request);
    this.__CANCEL__ = true;
  }
}
