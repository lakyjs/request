import type { OxiosInterceptorManager, RejectedFn, ResolvedFn } from '@/types';
import { isNil } from '@/helpers/is';

interface Interceptor<T> {
  resolved: ResolvedFn<T>
  rejected?: RejectedFn
}

export default class InterceptorManager<T> implements OxiosInterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null>;
  constructor() {
    this.interceptors = [];
  }

  use(resolved: ResolvedFn<T>, rejected?: RejectedFn): number {
    this.interceptors.push({ resolved, rejected });
    return this.interceptors.length - 1;
  }

  eject(id: number) {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }

  forEach(cb: (interceptor: Interceptor<T>) => void) {
    this.interceptors.forEach(interceptor => {
      if (!isNil(interceptor)) {
        cb(interceptor!);
      }
    });
  }
}
