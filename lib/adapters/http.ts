import type { OxiosPromise, OxiosRequestConfig } from '@/types';
import { kindOf } from '@/helpers';

// eslint-disable-next-line node/prefer-global/process
const isHttpAdapterSupported = typeof process !== 'undefined' && kindOf(process) === 'process';

export default isHttpAdapterSupported && function httpAdapter(_config: OxiosRequestConfig): OxiosPromise {
  return new Promise((_resolve, _reject) => {
  });
};
