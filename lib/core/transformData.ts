import type { OxiosRequestConfig, OxiosResponse, OxiosTransformer } from '@/types';

import defaults from '@/defaults';
import { isArray } from '@/helpers/is';

export function transformData(this: OxiosRequestConfig, fns: OxiosTransformer | OxiosTransformer[], response?: OxiosResponse) {
  const config = this || defaults;
  const context = response || config;
  const headers = config.headers;

  let data = context.data;

  if (!isArray(fns))
    fns = [fns];

  fns.forEach(fn => data = fn.call(config, data, headers, response ? response.status : void 0));

  return data;
}
