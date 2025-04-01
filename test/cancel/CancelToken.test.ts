import { describe, it, expect, vi } from 'vitest';
import CancelToken from '@/cancel/CancelToken';
import isCancel from '@/cancel/isCancel';

describe('CancelToken', () => {
  it('should resolve the promise when canceled', async () => {
    const executor = vi.fn();
    const token = new CancelToken(executor);

    expect(token.reason).toBeUndefined();

    executor.mock.calls[0][0]('Operation canceled');
    expect(token.reason).not.toBeUndefined();
    expect((await token.promise).__CANCEL__).toBe(true);
    expect((await token.promise).message).toBe('Operation canceled');
  });

  it('should throw if throwIfRequested is called after cancellation', () => {
    const token = new CancelToken(cancel => cancel('Operation canceled'));

    try {
      token.throwIfRequested();
    } catch (error) {
      expect(isCancel(error)).toBe(true);
      expect(error.message).toBe('Operation canceled');
    }

    const token2 = new CancelToken(() => { });
    const listener = vi.fn();

    try {
      token2.throwIfRequested();
    } catch (error) {
      listener(error);
    }

    expect(listener).not.toHaveBeenCalled();
  });

  it('should call subscribed listeners when canceled', async () => {
    let cancel;
    const token = new CancelToken(c => cancel = c);
    const listener1 = vi.fn();
    const listener2 = vi.fn();


    token.subscribe(listener1);
    token.subscribe(listener2);

    cancel()
    await token.promise;
    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should unsubscribe listeners correctly', () => {
    const token = new CancelToken(() => { });
    const listener = vi.fn();

    token.subscribe(listener);
    token.unsubscribe(listener);

    expect(listener).not.toHaveBeenCalled();
  });

  it('should create a CancelTokenSource', () => {
    const source = CancelToken.source();

    expect(source).toHaveProperty('cancel');
    expect(source).toHaveProperty('token');
    expect(source.token).toBeInstanceOf(CancelToken);

    source.cancel('Operation canceled');

    expect(isCancel(source.token.reason)).toBe(true);
    expect(source.token.reason?.message).toBe('Operation canceled');
  });

  it('should immediately call the listener if already canceled', () => {
    const token = new CancelToken(cancel => cancel('Operation canceled'));
    const listener = vi.fn();

    token.subscribe(listener);

    expect(listener).toHaveBeenCalledWith(token.reason);
  });

  it('should not throw if unsubscribe is called with no listeners', () => {
    const token = new CancelToken(() => { });
    const listener = vi.fn();

    expect(() => token.unsubscribe(listener)).not.toThrow();
  });

  it('should remove the listener from the list when unsubscribe is called', () => {
    const token = new CancelToken(() => { });
    const listener = vi.fn();

    token.subscribe(listener);
    token.unsubscribe(listener);

    // Simulate cancellation
    const cancelError = new Error('Operation canceled') as any;
    token['_listeners']?.forEach(l => l(cancelError));

    expect(listener).not.toHaveBeenCalled();
  });

  it('should only remove the specified listener when unsubscribe is called', () => {
    const token = new CancelToken(() => { });
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    token.subscribe(listener1);
    token.subscribe(listener2);
    token.unsubscribe(listener1);

    // Simulate cancellation
    const cancelError = new Error('Operation canceled') as any;
    token['_listeners']?.forEach(l => l(cancelError));

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledWith(cancelError);
  });

  it('should initialize with a promise and resolve it when canceled', async () => {
    const executor = vi.fn();
    const token = new CancelToken(executor);

    expect(token.promise).toBeInstanceOf(Promise);
    expect(token.reason).toBeUndefined();

    executor.mock.calls[0][0]('Operation canceled');
    expect(token.reason).not.toBeUndefined();
    expect(token.reason?.message).toBe('Operation canceled');
    expect((await token.promise).message).toBe('Operation canceled');
  });

  it('should notify all listeners when canceled', async () => {
    const executor = vi.fn();
    const token = new CancelToken(executor);
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    token.subscribe(listener1);
    token.subscribe(listener2);

    executor.mock.calls[0][0]('Operation canceled');

    await token.promise;

    expect(listener1).toHaveBeenCalledWith(token.reason);
    expect(listener2).toHaveBeenCalledWith(token.reason);
  });

  it('should clear listeners after notifying them', async () => {
    const executor = vi.fn();
    const token = new CancelToken(executor);
    const listener = vi.fn();

    token.subscribe(listener);

    executor.mock.calls[0][0]('Operation canceled');

    await token.promise;

    expect(token['_listeners']).toBeUndefined();
  });

  it('should not notify listeners if already canceled', async () => {
    let cancel;
    const token = new CancelToken(c => cancel = c);
    const listener = vi.fn();

    token.subscribe(listener);
    cancel('Operation canceled');
    await token.promise;

    expect(listener).toHaveBeenCalled();

    cancel('Operation canceled again');

    setTimeout(() => {
      expect(listener).toBeCalledTimes(1)
      expect(token.reason.message).toBe('Operation canceled')
    })
  });

  it('should not resolve the promise if not canceled', () => {
    const executor = vi.fn();
    const token = new CancelToken(executor);

    expect(token.reason).toBeUndefined();
    expect(token.promise).toBeInstanceOf(Promise);
  });

});
