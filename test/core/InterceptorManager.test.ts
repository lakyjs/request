import type { ResolvedFn } from '@/index';
import InterceptorManager from '@/core/InterceptorManager';
import { describe, expect, it, vi } from 'vitest';

describe('interceptorManager', () => {
  it('should add an interceptor using use() and return its id', () => {
    const manager = new InterceptorManager<string>();
    const resolvedFn = vi.fn();
    const rejectedFn = vi.fn();

    const id = manager.use(resolvedFn, rejectedFn);

    expect(id).toBe(0);
  });

  it('should remove an interceptor using eject()', () => {
    const manager = new InterceptorManager<string>();
    const resolvedFn = vi.fn();

    const id = manager.use(resolvedFn);
    manager.eject(id);

    let called = false;
    manager.forEach(() => {
      called = true;
    });

    expect(called).toBe(false);
  });

  it('should iterate over interceptors using forEach()', () => {
    const manager = new InterceptorManager<string>();
    const resolvedFn1 = vi.fn();
    const resolvedFn2 = vi.fn();

    manager.use(resolvedFn1);
    manager.use(resolvedFn2);

    const callbacks: Array<ResolvedFn<any>> = [];
    manager.forEach(interceptor => {
      callbacks.push(interceptor.resolved);
    });

    expect(callbacks).toHaveLength(2);
    expect(callbacks[0]).toBe(resolvedFn1);
    expect(callbacks[1]).toBe(resolvedFn2);
  });

  it('should not call forEach callback for ejected interceptors', () => {
    const manager = new InterceptorManager<string>();
    const resolvedFn1 = vi.fn();
    const resolvedFn2 = vi.fn();

    const id1 = manager.use(resolvedFn1);
    manager.use(resolvedFn2);

    manager.eject(id1);

    const callbacks: Array<ResolvedFn<any>> = [];
    manager.forEach(interceptor => {
      callbacks.push(interceptor.resolved);
    });

    expect(callbacks).toHaveLength(1);
    expect(callbacks[0]).toBe(resolvedFn2);
  });
});
