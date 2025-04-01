import buildFullPath from '@/core/buildFullPath';
import { describe, expect, it } from 'vitest';

describe('buildFullPath', () => {
  it('should return the requestedURL if it is an absolute URL', () => {
    const baseURL = 'http://example.com';
    const requestedURL = 'https://another.com/path';
    expect(buildFullPath(baseURL, requestedURL)).toBe(requestedURL);
  });

  it('should combine baseURL and requestedURL if requestedURL is not absolute', () => {
    const baseURL = 'http://example.com';
    const requestedURL = 'path/to/resource';
    expect(buildFullPath(baseURL, requestedURL)).toBe('http://example.com/path/to/resource');
  });

  it('should return the requestedURL if baseURL is undefined', () => {
    const baseURL = void 0;
    const requestedURL = '/path/to/resource';
    expect(buildFullPath(baseURL, requestedURL)).toBe(requestedURL);
  });

  it('should return the requestedURL if baseURL is empty', () => {
    const baseURL = '';
    const requestedURL = '/path/to/resource';
    expect(buildFullPath(baseURL, requestedURL)).toBe(requestedURL);
  });
});
