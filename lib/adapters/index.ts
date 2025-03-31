import type { OxiosPromise, OxiosRequestConfig } from '@/types';
import { isArray, isFunction, isString } from '@/helpers/is';
import fetchAdapter from './fetch';
import httpAdapter from './http';
import xhrAdapter from './xhr';

const knownAdapters: Record<string, ((config: OxiosRequestConfig) => OxiosPromise) | false> = {
  http: httpAdapter,
  xhr: xhrAdapter,
  fetch: fetchAdapter
};

type Adapter = OxiosRequestConfig['adapter'];

export default {
  adapters: knownAdapters,
  getAdapter(adapters: Array<Adapter> | Adapter) {
    adapters = isArray(adapters) ? adapters : [adapters];
    const { length } = adapters;

    let nameOrAdapter: Adapter;
    let adapter: ((config: OxiosRequestConfig) => OxiosPromise) | false | undefined;

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      if (
        // eslint-disable-next-line no-cond-assign
        (adapter = isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)
      ) break;
    }

    if (!adapter) {
      if (adapter === false) {
        throw new Error(`Adapter ${nameOrAdapter} is not supported by the environment`);
      }

      throw new Error(
        `Unknown adapter '${nameOrAdapter}' is specified`
        + `\nWe know these adapters inside the environment: ${Object.keys(knownAdapters).join(', ')}`
      );
    }

    if (!isFunction(adapter)) {
      throw new TypeError('adapter is not a function');
    }
    return adapter;
  }
};

