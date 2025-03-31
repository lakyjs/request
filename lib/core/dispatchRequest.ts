import type { OxiosRequestConfig, OxiosResponse } from '@/types';
import type OxiosError from './OxiosError';
import adapters from '@/adapters';
import CancelError from '@/cancel/CancelError';
import isCancel from '@/cancel/isCancel';
import defaults from '@/defaults';
import { flattenHeaders } from '@/helpers';
import { transformData } from './transformData';

export default function dispatchRequest(config: OxiosRequestConfig) {
  throwIfCancellationRequested(config);
  processConfig(config);
  const adapter = adapters.getAdapter(config?.adapter || defaults.adapter);
  return adapter(config).then((res: OxiosResponse) => transformResponseData(res), (err: OxiosError) => {
    if (!isCancel(err))
      transformErrorData(config, err);
    return Promise.reject(err);
  });
}

function processConfig(config: OxiosRequestConfig) {
  config.headers = flattenHeaders(config.headers, config.method!);
  config.data = transformData.call(
    config,
    config.transformRequest!
  );
}

function transformResponseData(res: OxiosResponse) {
  const { config } = res;
  throwIfCancellationRequested(config);
  res.data = transformData.call(
    config,
    config.transformResponse!,
    res
  );
  return res;
}

function transformErrorData(config: OxiosRequestConfig, error: OxiosError) {
  throwIfCancellationRequested(config);
  if (error && error.response) {
    error.response.data = transformData.call(
      config,
      config.transformResponse!,
      error.response
    );
  }
}

function throwIfCancellationRequested(config: OxiosRequestConfig) {
  config?.cancelToken && config.cancelToken.throwIfRequested();
  if (config?.signal && config.signal.aborted) {
    throw new CancelError('canceled', config);
  }
}
