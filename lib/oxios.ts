import type { OxiosInstance, OxiosRequestConfig, OxiosStatic } from './types';

import CancelError from './cancel/CancelError';
import CancelToken from './cancel/CancelToken';
import isCancel from './cancel/isCancel';
import mergeConfig from './core/mergeConfig';
import Oxios from './core/Oxios';
import defaults from './defaults';
import { extend, isOxiosError } from './helpers';

function createInstance(config: OxiosRequestConfig) {
  const context = new Oxios(config);
  const instance = Oxios.prototype.request.bind(context);

  extend(instance, Oxios.prototype, context);
  extend(instance, context);

  return instance as OxiosInstance;
}

const oxios = createInstance(defaults) as OxiosStatic;

oxios.create = function create(config) {
  return createInstance(mergeConfig(defaults, config));
};

oxios.all = function all(promises) {
  return Promise.all(promises);
};

oxios.spread = function spread(callback) {
  return function wrap(arr) {
    // eslint-disable-next-line prefer-spread
    return callback.apply(null, arr);
  };
};

oxios.CancelToken = CancelToken;
oxios.CancelError = CancelError;
oxios.isCancel = isCancel;
oxios.isOxiosError = isOxiosError;

oxios.Oxios = Oxios;

export default oxios;
