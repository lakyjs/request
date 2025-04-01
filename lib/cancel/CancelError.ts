import type { Cancel as ICancelError, OxiosRequestConfig } from '@/types';
import type { ClientRequest } from 'node:http';
import OxiosError, { ErrorCodes } from '@/core/OxiosError';
import { isNil } from '@/helpers';

export default class CancelError extends OxiosError implements ICancelError {
  __CANCEL__: boolean;
  constructor(message?: string | null, config?: OxiosRequestConfig, request?: XMLHttpRequest | ClientRequest) {
    super(isNil?.(message) ? 'canceled' : message as string, ErrorCodes.ERR_CANCELED.value, config, request);
    this.__CANCEL__ = true;
  }
}
