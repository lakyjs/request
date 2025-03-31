import type { Oxios as IOxios, Method, OxiosInterceptor, OxiosPromise, OxiosRequestConfig, OxiosResponse, RejectedFn, ResolvedFn } from '@/types';
import type { Context, Next } from 'onion-interceptor';

import { buildURL } from '@/helpers';
import { createInterceptor } from 'onion-interceptor';
import buildFullPath from './buildFullPath';
import dispatchRequest from './dispatchRequest';
import InterceptorManager from './InterceptorManager';
import mergeConfig from './mergeConfig';

interface PromiseChainNode<T> {
  resolved: ResolvedFn<T> | ((config: OxiosRequestConfig) => OxiosPromise)
  rejected?: RejectedFn
}

type PromiseChain<T> = PromiseChainNode<T>[];

export default class Oxios implements IOxios {
  defaults: OxiosRequestConfig;
  interceptors: OxiosInterceptor;
  // oIntercepters: OnionInterceptor;
  constructor(initConfig: OxiosRequestConfig) {
    this.defaults = initConfig;
    this.interceptors = createInterceptor() as OxiosInterceptor;
    this.interceptors.request = new InterceptorManager<OxiosRequestConfig>();
    this.interceptors.response = new InterceptorManager<OxiosResponse>();
    this._eachMethodNoData();
    this._eachMethodWithData();
  }

  request(url: string | OxiosRequestConfig, config: OxiosRequestConfig = {}): OxiosPromise {
    if (typeof url === 'string') {
      config.url = url;
    }
    else {
      config = url;
    }
    config = mergeConfig(this.defaults, config);

    const chain: PromiseChain<any> = [{
      resolved: async (_config: OxiosRequestConfig) => {
        const ctx = { args: { ..._config }, cfg: this.defaults };
        return (await this.interceptors.handle(
          ctx as Context,
          async (_ctx: Context, next: Next) =>
            await dispatchRequest(_config)
              .then(res => {
                _ctx.res = res as Context['res'];
                return res;
              })
              .catch(err => {
                _ctx.res = err?.response ?? err;
                return Promise.reject(err);
              })
              .finally(next)
        ));
      },
      rejected: void 0
    }];

    this.interceptors.request.forEach(interceptor => chain.unshift(interceptor));
    this.interceptors.response.forEach(interceptor => chain.push(interceptor));

    let promise = Promise.resolve(config) as OxiosPromise<OxiosRequestConfig>;

    while (chain.length) {
      const { resolved, rejected } = chain.shift()!;
      promise = promise.then(resolved, rejected);
    }

    return promise;
  }

  getUri(config?: OxiosRequestConfig) {
    const { baseURL, url, params, paramsSerializer } = mergeConfig(this.defaults, config);
    return buildURL(buildFullPath(baseURL, url!), params, paramsSerializer);
  }

  private _eachMethodNoData() {
    (['get', 'delete', 'head', 'options'] as Method[]).forEach(method => {
      (Oxios.prototype as Record<string, any>)[method] = (
        url: string,
        config: OxiosRequestConfig
      ) => this.request(mergeConfig(config || {}, { method, url }));
    });
  }

  private _eachMethodWithData() {
    (['post', 'put', 'patch'] as Method[]).forEach(method => {
      const genHttpMethod = (isForm: boolean) => (
        url: string,
        data: unknown,
        config: OxiosRequestConfig
      ) => this.request(mergeConfig(config || {}, {
        method,
        url,
        data,
        headers: isForm
          ? {
            'Content-Type': 'multipart/form-data'
          }
          : {}
      }));
      (Oxios.prototype as Record<string, any>)[method] = genHttpMethod(false);
      (Oxios.prototype as Record<string, any>)[`${method}Form`] = genHttpMethod(true);
    });
  }
}

