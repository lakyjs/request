import CancelError from '@/cancel/CancelError';
import isCancel from '@/cancel/isCancel';
import { createError } from '@/core/OxiosError';
import { describe, expect, it } from 'vitest';

describe('isCancel', () => {
  it('should return true if the value is a CancelError with __CANCEL__ set to true', () => {
    const cancelError = new CancelError('Request canceled');

    expect(isCancel(cancelError)).toBe(true);
  });

  it('should return false if the value is not an instance of OxiosError', () => {
    const notOxiosError = { __CANCEL__: true };

    expect(isCancel(notOxiosError)).toBe(false);
  });

  it('should return false if the value is an OxiosError but __CANCEL__ is not true', () => {
    const oxiosError = createError('Some error', {}, null);

    expect(isCancel(oxiosError)).toBe(false);
  });

  it('should return false if the value is null or undefined', () => {
    expect(isCancel(null)).toBe(false);
    expect(isCancel(void 0)).toBe(false);
  });

  it('should return false if the value is a primitive type', () => {
    expect(isCancel(42)).toBe(false);
    expect(isCancel('string')).toBe(false);
    expect(isCancel(true)).toBe(false);
  });
});
