import type { OxiosRequestConfig } from '@/types';
import { deepMerge, isNil, isPlainObject } from '@/helpers';

interface StratFn {
  (val1: unknown, val2: unknown): any
}

const defaultStrat: StratFn = (val1, val2) => {
  return val2 ?? val1;
};

const fromVal2Strat: StratFn = (_val1, val2) => {
  if (!isNil(val2))
    return val2;
};

const deepMergeStrat: StratFn = (val1, val2) => {
  if (isPlainObject(val2))
    return deepMerge(val1, val2);

  if (!isNil(val2))
    return val2;

  if (isPlainObject(val1))
    return deepMerge(val1);

  if (!isNil(val1))
    return val1;
};

const stratMap = new Map<string, StratFn>([
  ['url', fromVal2Strat],
  ['params', fromVal2Strat],
  ['data', fromVal2Strat],
  ['headers', deepMergeStrat],
  ['auth', deepMergeStrat],
]);

export default function mergeConfig(
  config1: OxiosRequestConfig,
  config2?: OxiosRequestConfig
): OxiosRequestConfig {
  if (!config2)
    config2 = {};

  const result = Object.create(null);

  const mergeField = (key: string): void => {
    const strat = stratMap.get(key) ?? defaultStrat;
    result[key] = strat(config1[key], config2[key]);
  };

  for (const key in Object.assign({}, config1, config2)) {
    mergeField(key);
  }

  return result;
}

