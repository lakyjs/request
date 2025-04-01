import type { ClientRequest } from 'node:http';
import type { OnionInterceptor } from 'onion-interceptor';
import type CancelErrorClass from './cancel/CancelError';
import type CancelTokenClass from './cancel/CancelToken';
import type OxiosInterceptorManagerClass from './core/InterceptorManager';
import type OxiosClass from './core/Oxios';

export type Method =
  'get' | 'GET' |
  'post' | 'POST' |
  'delete' | 'DELETE' |
  'put' | 'PUT' |
  'head' | 'HEAD' |
  'options' | 'OPTIONS' |
  'patch' | 'PATCH';

export type Params = Record<string, any>;
export type IHeaders = Record<string, any>;

export interface OxiosRequestConfig {
  method?: Method
  url?: string
  data?: unknown
  params?: Params
  headers?: IHeaders
  responseType?: XMLHttpRequestResponseType
  timeout?: number
  baseURL?: string

  adapter?: 'http' | 'xhr' | 'fetch' | ((config: OxiosRequestConfig) => OxiosPromise)

  transformRequest?: OxiosTransformer | OxiosTransformer[]
  transformResponse?: OxiosTransformer | OxiosTransformer[]

  cancelToken?: CancelTokenClass
  signal?: GenericAbortSignal

  withCredentials?: boolean

  xsrfCookieName?: string
  xsrfHeaderName?: string

  auth?: OxiosBasicCredentials

  validateStatus?: (status: number) => boolean

  paramsSerializer?: (params: Params) => string

  onDownloadProgress?: (progressEvent: ProgressEvent) => void
  onUploadProgress?: (progressEvent: ProgressEvent) => void

  [k: string]: any
}

export interface OxiosTransformer {
  (this: OxiosRequestConfig, data: any, headers?: IHeaders, status?: number): any
}

export interface GenericAbortSignal {
  readonly aborted: boolean
  onabort?: ((...args: any) => any) | null
  addEventListener?: (...args: any) => any
  removeEventListener?: (...args: any) => any
}
export interface OxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: IHeaders
  config: OxiosRequestConfig
  request: XMLHttpRequest | ClientRequest
}

export interface OxiosPromise<T = any> extends Promise<OxiosResponse<T>> { }

export type OxiosErrorCode =
  | 'ERR_BAD_OPTION_VALUE'
  | 'ERR_BAD_OPTION'
  | 'ECONNABORTED'
  | 'ETIMEDOUT'
  | 'ERR_NETWORK'
  | 'ERR_FR_TOO_MANY_REDIRECTS'
  | 'ERR_DEPRECATED'
  | 'ERR_BAD_RESPONSE'
  | 'ERR_BAD_REQUEST'
  | 'ERR_CANCELED'
  | 'ERR_NOT_SUPPORT'
  | 'ERR_INVALID_URL';

export interface OxiosError extends Error {
  isOxiosError: boolean
  config?: OxiosRequestConfig
  code?: OxiosErrorCode | null
  request?: XMLHttpRequest | ClientRequest
  response?: OxiosResponse
}

export interface OxiosInterceptor extends OnionInterceptor {
  request: OxiosInterceptorManagerClass<OxiosRequestConfig>
  response: OxiosInterceptorManagerClass<OxiosResponse>
}

export interface Oxios {
  defaults: OxiosRequestConfig

  interceptors: OxiosInterceptor

  getUri: (config?: OxiosRequestConfig) => string
  request: <T = any>(config: OxiosRequestConfig) => OxiosPromise<T>
}

export interface OxiosInstance extends Oxios {
  <T = any>(config: OxiosRequestConfig): OxiosPromise<T>
  <T = any>(url: string, config?: OxiosRequestConfig): OxiosPromise<T>

  get: <T = any>(url: string, config?: OxiosRequestConfig) => OxiosPromise<T>
  delete: <T = any>(url: string, config?: OxiosRequestConfig) => OxiosPromise<T>
  head: <T = any>(url: string, config?: OxiosRequestConfig) => OxiosPromise<T>
  options: <T = any>(url: string, config?: OxiosRequestConfig) => OxiosPromise<T>
  post: <T = any>(url: string, data?: unknown, config?: OxiosRequestConfig) => OxiosPromise<T>
  put: <T = any>(url: string, data?: unknown, config?: OxiosRequestConfig) => OxiosPromise<T>
  patch: <T = any>(url: string, data?: unknown, config?: OxiosRequestConfig) => OxiosPromise<T>

  postForm: <T = any>(url: string, data?: unknown, config?: OxiosRequestConfig) => OxiosPromise<T>
  putForm: <T = any>(url: string, data?: unknown, config?: OxiosRequestConfig) => OxiosPromise<T>
  patchForm: <T = any>(url: string, data?: unknown, config?: OxiosRequestConfig) => OxiosPromise<T>
}

export interface OxiosStatic extends OxiosInstance {
  create: (config?: OxiosRequestConfig) => OxiosInstance
  all: <T>(promises: Array<T | Promise<T>>) => Promise<T[]>
  spread: <T, R>(callback: (...args: T[]) => R) => (arr: T[]) => R
  isCancel: (val: unknown) => val is Cancel
  isOxiosError: (val: unknown) => val is OxiosError

  Oxios: typeof OxiosClass

  CancelToken: typeof CancelTokenClass
  CancelError: typeof CancelErrorClass

}

export interface OxiosInterceptorManager<T> {
  use: (resolved: ResolvedFn<T>, rejected?: RejectedFn) => number
  eject: (id: number) => void
}

export interface ResolvedFn<T> {
  (val: T): T | Promise<T>
}

export interface RejectedFn {
  (err: any): any
}

export interface CancelToken {
  promise: Promise<Cancel>
  reason?: Cancel

  throwIfRequested: () => void
}

export interface Canceler {
  (message: string, config?: OxiosRequestConfig, request?: XMLHttpRequest | ClientRequest): void
}

export interface CancelExecutor {
  (cancel: Canceler): void
}

export interface CancelTokenSource {
  token: CancelTokenClass
  cancel: Canceler
}

export interface Cancel {
  message?: string
}

export interface OxiosBasicCredentials {
  username: string
  password: string
}
