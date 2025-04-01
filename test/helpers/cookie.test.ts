import { cookie } from '@/helpers/cookie';

import { describe, expect, it } from 'vitest';

describe('helpers:cookie', () => {
  it('should read cookies', () => {
    document.cookie = 'foo=bar';
    expect(cookie.read('foo')).toEqual('bar');
  });

  it('should return null if cookie name is not found', () => {
    document.cookie = 'foo=bar';
    expect(cookie.read('baz')).toBeNull();
  });
});
