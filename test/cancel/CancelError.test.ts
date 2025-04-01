import CancelError from '@/cancel/CancelError';
import isCancel from '@/cancel/isCancel';
import { ErrorCodes } from '@/core/OxiosError';
import oxios from '@/index';
import { describe, expect, it } from 'vitest';

describe('cancelError', () => {
  it('should create an instance of CancelError with default message when no message is provided', () => {
    const error = new CancelError(null);
    expect(isCancel(error)).toBe(true);
    expect(oxios.isOxiosError(error)).toBe(true);
    expect(error.message).toBe('canceled');

    expect(error.code).toBe(ErrorCodes.ERR_CANCELED.value);
    expect(error.__CANCEL__).toBe(true);
  });

  it('should create an instance of CancelError with the provided message', () => {
    const message = 'Request was canceled';
    const error = new CancelError(message);
    expect(error.message).toBe(message);
    expect(error.code).toBe(ErrorCodes.ERR_CANCELED.value);
    expect(error.__CANCEL__).toBe(true);
  });

  it('should set the config and request properties if provided', () => {
    const config = { url: '/test' };
    const request = new XMLHttpRequest();
    const error = new CancelError('Request was canceled', config, request);
    expect(error.config).toBe(config);
    expect(error.request).toBe(request);
  });
});
