import type { IHeaders, Method } from '@/types';
import { deepMerge } from './index';
import { isPlainObject } from './is';

const ignoreDuplicateOf = new Set([
  'age',
  'authorization',
  'content-length',
  'content-type',
  'etag',
  'expires',
  'from',
  'host',
  'if-modified-since',
  'if-unmodified-since',
  'last-modified',
  'location',
  'max-forwards',
  'proxy-authorization',
  'referer',
  'retry-after',
  'user-agent'
])

export function parseHeaders(rawHeaders: string): IHeaders {
  let result = Object.create(null);
  if (!rawHeaders) return result;

  rawHeaders.split('\n').forEach(line=>{
    let [key, ...vals] = line.split(':')
    key = key.trim().toLowerCase()

    if (!key || (result[key] && ignoreDuplicateOf.has(key))) {
      return
    }
    const val = vals.join(':').trim()

    if (key === 'set-cookie') {
      if (result[key]) {
        result[key].push(val)
      } else {
        result[key] = [val]
      }
    } else {
      result[key] = result[key] ? result[key] + ', ' + val : val
    }
  })

  return result
}

export function processHeaders(
  headers: IHeaders | void | null,
  data: unknown
) {
  normalizeHeaderName(headers, 'Content-Type')
  if(isPlainObject(data)){
    if(headers && !headers['Content-Type']){
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

function normalizeHeaderName(headers: IHeaders | void | null , normalizedName: string) {
  if(!headers) return
  Object.keys(headers).forEach(name => {
    if(name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()){
      headers[normalizedName] = headers[name];
      delete headers[name];
    }
  })
}

export function flattenHeaders(
  headers: IHeaders | undefined ,
  method: Method
) {
  if (!headers)
    return headers;

  headers = deepMerge(headers.common, headers[method], headers);

  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common'];
  methodsToDelete.forEach(method => {
    delete headers![method];
  });

  return headers;
}
