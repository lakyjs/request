import type { Canceler, CancelExecutor, CancelTokenSource, CancelToken as ICancelToken } from '@/types';
import CancelError from './CancelError';

interface ResolvePromise {
  (reason: CancelError | PromiseLike<CancelError>): void
}

interface Listener {
  (reason?: CancelError): void
}

export default class CancelToken implements ICancelToken {
  promise: Promise<CancelError>;
  reason?: CancelError;

  private _listeners?: Array<Listener>;

  constructor(executor: CancelExecutor) {
    let ResolvePromise: ResolvePromise;

    this.promise = new Promise(resolve => {
      ResolvePromise = resolve;
    });

    this.promise.then(cancel => {
      if (!this._listeners)
        return;

      for (const listener of this._listeners) {
        listener(cancel);
      }

      this._listeners = void 0;
    });

    executor((message, config, request) => {
      if (this.reason)
        return;
      this.reason = new CancelError(message, config, request);
      ResolvePromise(this.reason);
    });
  }

  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }

  subscribe(listener: Listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners)
      this._listeners.push(listener);
    else this._listeners = [listener];
  }

  unsubscribe(listener: Listener) {
    if (!this._listeners)
      return;

    const idx = this._listeners.indexOf(listener);
    if (idx !== -1)
      this._listeners.splice(idx, 1);
  }

  static source(): CancelTokenSource {
    let cancel!: Canceler;
    const token = new CancelToken(c => cancel = c);

    return { cancel, token };
  }
}
