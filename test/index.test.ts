import type { OxiosError, OxiosResponse } from '@/index';
import oxios from '@/index';
import { http, HttpResponse } from 'msw';
import { server } from './mockServer'
import { describe, expect, it, vi } from 'vitest';


describe('requests', () => {

  it('should treat single string arg as url', () => {
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );
    oxios('http://foo').then(res => {
      expect(res.status).toBe(200);
      expect(res.data.msg).toBe('bar');
      expect(res.config.method).toBe('GET');
    });
  });

  it('should treat method value as lowercase string', () => {
    server.use(
      http.post('http://foo', ({ request }) => {
        expect(request.method).toBe('POST');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );
    oxios({
      url: 'http://foo',
      method: 'POST'
    }).then(res => {
      expect(res.status).toBe(200);
      expect(res.data.msg).toBe('bar');
      expect(res.config.method).toBe('POST');
    });
  });

  it('should reject on network error', () => {
    const resolveSpy = vi.fn((res: OxiosResponse) => res);
    const rejectSpy = vi.fn((err: OxiosError) => err);

    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.error();
      })
    );

    oxios('http://foo').then(resolveSpy).catch(rejectSpy).then((reason: OxiosError) => {
      expect(resolveSpy).not.toHaveBeenCalled();
      expect(rejectSpy).toHaveBeenCalled();
      expect(reason instanceof Error).toBeTruthy();
      expect(oxios.isOxiosError(reason)).toBeTruthy();
      expect(reason.message).toBe('Network Error');
      expect(reason.request).toEqual(expect.any(XMLHttpRequest))
    });
  });

  it('should reject when request timeout', () => {
    const resolveSpy = vi.fn((res: OxiosResponse) => res);
    const rejectSpy = vi.fn((err: OxiosError) => err);
    const timeout = 1000;
    server.use(
      http.get('http://foo', async ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        await new Promise(resolve => setTimeout(resolve, timeout + 100));
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );

    oxios({
      url: 'http://foo',
      method: 'GET',
      timeout
    }).then(resolveSpy).catch(rejectSpy).then((reason: OxiosError) => {
      expect(resolveSpy).not.toHaveBeenCalled();
      expect(rejectSpy).toHaveBeenCalled();
      expect(reason instanceof Error).toBeTruthy();
      expect(oxios.isOxiosError(reason)).toBeTruthy();
      expect(reason.message).toBe(`Timeout of ${timeout} ms exceeded`);
      expect(reason.code).toBe('ERR_TIMEOUT');
      expect(reason.request).toEqual(expect.any(XMLHttpRequest))
    })
  });

  it('should reject when validateStatus is false', () => {
    const resolveSpy = vi.fn((res: OxiosResponse) => res);
    const rejectSpy = vi.fn((err: OxiosError) => err);
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );
    oxios({
      url: 'http://foo',
      method: 'GET',
      validateStatus: (status) => status !== 200
    }).then(resolveSpy).catch(rejectSpy).then((reason: OxiosError) => {
      expect(resolveSpy).not.toHaveBeenCalled();
      expect(rejectSpy).toHaveBeenCalled();
      expect(reason instanceof Error).toBeTruthy();
      expect(oxios.isOxiosError(reason)).toBeTruthy();
      expect(reason.message).toBe('Request failed with status code 200');
    })
  })

  it('should resolve when validateStatus is true', () => {
    const resolveSpy = vi.fn((res: OxiosResponse) => res);
    const rejectSpy = vi.fn((err: OxiosError) => err);
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'bar' }, { status: 500 });
      })
    );

    oxios({
      url: 'http://foo',
      method: 'GET',
      validateStatus: (status) => status === 500
    }).then(resolveSpy).catch(rejectSpy).then((res: OxiosResponse) => {
      expect(resolveSpy).toHaveBeenCalled();
      expect(rejectSpy).not.toHaveBeenCalled();
      expect(res.status).toBe(500);
      expect(res.data.msg).toBe('bar');
    })
  })

  it('should return JSON when resolve', () => {
    const resolveSpy = vi.fn((res: OxiosResponse) => res);
    const rejectSpy = vi.fn((err: OxiosError) => err);
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.text('{"msg":"bar"}', { status: 200 });
      })
    );

    oxios('http://foo', {
      headers: {
        Accept: 'application/json'
      }
    }).then(resolveSpy).catch(rejectSpy).then((res: OxiosResponse) => {
      expect(resolveSpy).toHaveBeenCalled();
      expect(rejectSpy).not.toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.data.msg).toBe('bar');
    })
  })

  it('should support array buffer response', () => {
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.json(str2ab('Hello World'), { status: 200 });
      })
    )

    function str2ab(str: string) {
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return buf;
    }

    oxios('http://foo', { responseType: 'arraybuffer' }).then((res: OxiosResponse) => {
      expect(res.data).toBeInstanceOf(ArrayBuffer);
      expect(res.data.byteLength).toBe(2);
    })
  })

  it('should cancel a request', () => {
    const source = oxios.CancelToken.source();
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );

    const request = oxios.get('http://foo', {
      cancelToken: source.token,
    });

    source.cancel('Request canceled');

    request.catch((err: OxiosError) => {
      expect(oxios.isOxiosError(err)).toBeTruthy();
      expect(oxios.isCancel(err)).toBeTruthy();
      expect(err.message).toBe('Request canceled');
    });
  })

  it('should cancel one of multiple requests', () => {
    const source1 = oxios.CancelToken.source();
    const source2 = oxios.CancelToken.source();

    server.use(
      http.get('http://foo', () => {
        return HttpResponse.json({ msg: 'foo' }, { status: 200 });
      }),
      http.get('http://bar', () => {
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );

    const req1 = oxios.get('http://foo', { cancelToken: source1.token });
    const req2 = oxios.get('http://bar', { cancelToken: source2.token });

    source2.cancel('Request canceled');

    Promise.allSettled([req1, req2]).then(([res1, res2]) => {
      expect(res1.status).toBe('fulfilled');
      expect((res1 as PromiseFulfilledResult<OxiosResponse>).value.data.msg).toBe('foo');

      expect(res2.status).toBe('rejected');
      expect((res2 as PromiseRejectedResult).reason.message).toBe('Request canceled');
    });
  })

  it('should send custom headers', () => {
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.headers.get('X-Custom-Header')).toBe('CustomValue');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );

    oxios('http://foo', {
      headers: {
        'X-Custom-Header': 'CustomValue',
      },
    }).then((res: OxiosResponse) => {
      expect(res.status).toBe(200);
      expect(res.data.msg).toBe('bar');
    });
  })

  it('should send multipart/form-data', () => {
    server.use(
      http.post('http://foo', async ({ request }) => {
        const formData = await request.formData();
        expect(formData.get('key')).toBe('value');
        return HttpResponse.json({ success: true }, { status: 200 });
      })
    );

    const formData = new FormData();
    formData.append('key', 'value');

    oxios.post('http://foo', formData).then((res: OxiosResponse) => {
      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
    });
  });

  it('should handle request interceptors', () => {
    oxios.interceptors.request.use((config) => {
      config.headers['X-Intercepted'] = 'true';
      return config;
    });

    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.headers.get('X-Intercepted')).toBe('true');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );

    return oxios.get('http://foo').then((res: OxiosResponse) => {
      expect(res.status).toBe(200);
      expect(res.data.msg).toBe('bar');
    });
  });

  it('should handle response interceptors', () => {
    oxios.interceptors.response.use((response) => {
      response.data.val = 'intercepted';
      return response;
    });

    server.use(
      http.get('http://foo', () => {
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );

    oxios.get('http://foo').then((res: OxiosResponse) => {
      expect(res.status).toBe(200);
      expect(res.data.val).toBe('intercepted');
    });
  });


});

describe('oxios object', () => {
  it('should create instance', () => {
    const instance = oxios.create({
      baseURL: 'http://foo',
      timeout: 1000
    })
    expect(instance.defaults.baseURL).toBe('http://foo');
    expect(instance.defaults.timeout).toBe(1000);

    expect(instance.get).toBeDefined()
    expect(instance.post).toBeDefined()
    expect(instance.put).toBeDefined()
    expect(instance.delete).toBeDefined()
    expect(instance.postForm).toBeDefined()
    expect(instance.putForm).toBeDefined()
  })

  it('should have default config', () => {
    expect(oxios.defaults.timeout).toBe(0);
    expect(oxios.defaults.method).toBe('GET');
    expect(oxios.defaults.xsrfCookieName).toBe('XSRF-TOKEN');
    expect(oxios.defaults.xsrfHeaderName).toBe('X-XSRF-TOKEN');
  })

  it('should have static methods', () => {
    expect(oxios.isOxiosError).toBeDefined();
    expect(oxios.CancelToken).toBeDefined();
    expect(oxios.isCancel).toBeDefined();
    expect(oxios.all).toBeDefined();
    expect(oxios.spread).toBeDefined();
  })

  it('should support all', () => {
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );
    server.use(
      http.get('http://bar', ({ request }) => {
        expect(request.url).toBe('http://bar/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'baz' }, { status: 200 });
      })
    );
    const p1 = oxios('http://foo');
    const p2 = oxios('http://bar');
    oxios.all([p1, p2]).then((res: OxiosResponse[]) => {
      expect(res[0].data.msg).toBe('bar');
      expect(res[1].data.msg).toBe('baz');
    })
  })

  it('should support spread', () => {
    server.use(
      http.get('http://foo', ({ request }) => {
        expect(request.url).toBe('http://foo/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'bar' }, { status: 200 });
      })
    );
    server.use(
      http.get('http://bar', ({ request }) => {
        expect(request.url).toBe('http://bar/');
        expect(request.method).toBe('GET');
        return HttpResponse.json({ msg: 'baz' }, { status: 200 });
      })
    );

    const p1 = oxios('http://foo');
    const p2 = oxios('http://bar');
    oxios.all([p1, p2]).then(oxios.spread((res1: OxiosResponse, res2: OxiosResponse) => {
      expect(res1.data.msg).toBe('bar');
      expect(res2.data.msg).toBe('baz');
    }))
  })

})
