import adaptersExport from '@/adapters/index';
import { describe, expect, it } from 'vitest';

const { adapters, getAdapter } = adaptersExport;

describe('adapters', () => {
  it('should have known adapters', () => {
    expect(Object.keys(adapters)).toEqual(['http', 'xhr', 'fetch']);
    expect(typeof adapters.http).toBe('function');
    expect(typeof adapters.xhr).toBe('function');
    expect(typeof adapters.fetch).toBe('function');
  });

  it('should return the correct adapter by name', () => {
    expect(getAdapter('http')).toBe(adapters.http);
    expect(getAdapter('xhr')).toBe(adapters.xhr);
    expect(getAdapter('fetch')).toBe(adapters.fetch);
  });

  it('should throw an error for unsupported adapter', () => {
    expect(() => getAdapter('unknown' as any)).toThrowError(
      'Unknown adapter \'unknown\' is specified\nWe know these adapters inside the environment: http, xhr, fetch'
    );
  });

  it('should handle array of adapters and return the first valid one', () => {
    expect(getAdapter(['unknown' as any, 'http'])).toBe(adapters.http);
    expect(getAdapter(['xhr', 'fetch'])).toBe(adapters.xhr);
  });

  it('should throw an error if no valid adapter is found in the array', () => {
    expect(() => getAdapter(['unknown' as any, 'invalid'])).toThrowError(
      'Unknown adapter \'invalid\' is specified\nWe know these adapters inside the environment: http, xhr, fetch'
    );
  });
});
