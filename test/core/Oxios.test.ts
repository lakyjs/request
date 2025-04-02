import type { OxiosInstance, OxiosRequestConfig } from '@/types';
import Oxios from '@/core/Oxios';
import defaults from '@/defaults';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '../mockServer';

const BASE_URL = 'baseURL';

const mockConfig: OxiosRequestConfig = {
  baseURL: BASE_URL,
  ...defaults,
};

describe('oxiosClass', () => {
  it('should initialize with default config', () => {
    const oxios = new Oxios(mockConfig);
    expect(oxios.defaults).toEqual(mockConfig);
    expect(oxios.interceptors.request).toBeDefined();
    expect(oxios.interceptors.response).toBeDefined();
  });

  it('should merge configs and make a request', async () => {
    server.use(
      http.get(`${BASE_URL}/test1`, () => {
        return HttpResponse.json({ data: 'response' }, { status: 200 });
      })
    );
    const oxios = new Oxios(mockConfig);
    const res = await oxios.request('/test1', {
      method: 'GET',
      headers: {
        'custom-header': 'custom-value'
      }
    });
    expect(res.config.headers['custom-header']).toBe('custom-value');
    expect(res.data).toEqual({ data: 'response' });
  });

  it('should generate correct URI with getUri', () => {
    const oxios = new Oxios(mockConfig);
    const uri = oxios.getUri({ url: '/test', params: { q: 'search' } });
    expect(uri).toBe(`${BASE_URL}/test?q=search`);
  });

  it('should support HTTP methods without data', async () => {
    server.use(
      http.get(`${BASE_URL}/test2`, () => {
        return HttpResponse.json({ data: 'response' }, { status: 200 });
      })
    );

    const oxios = new Oxios(mockConfig) as unknown as OxiosInstance;

    const res = await oxios.get('/test2');
    expect(res.data).toEqual({ data: 'response' });
  });

  it('should support HTTP methods with data', async () => {
    server.use(
      http.post(`${BASE_URL}/test3`, () => {
        return HttpResponse.json({ data: 'response' }, { status: 200 });
      })
    );
    const oxios = new Oxios(mockConfig) as unknown as OxiosInstance;

    const res = await oxios.post('/test3', { key: 'value' });
    expect(res.data).toEqual({ data: 'response' });
  });

  it('should support form data methods', async () => {
    server.use(
      http.post(`${BASE_URL}/test4`, () => {
        return HttpResponse.json({ data: 'response' }, { status: 200 });
      })
    );
    const oxios = new Oxios(mockConfig) as unknown as OxiosInstance;

    const res = await oxios.postForm('/test4', { key: 'value' });
    expect(res.data).toEqual({ data: 'response' });
  });
});
