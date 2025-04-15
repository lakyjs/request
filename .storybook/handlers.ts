import { http, HttpResponse } from 'msw';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let count = 0;

export const handlers = [
  http.get('https://foo/get', async ctx => {
    count++;
    await delay(1000);
    return HttpResponse.json(
      { id: count, title: `mock get: ${count}`, booleanVal: false, ctx },
      { status: 200 }
    );
  }),
  http.post('https://foo/post', async ctx => {
    count++;
    await delay(1000);
    return HttpResponse.json(
      { id: count, title: `mock post: ${count}`, booleanVal: false, ctx },
      { status: 200 }
    );
  }),
  http.put('https://foo/put', async ctx => {
    count++;
    await delay(1000);
    return HttpResponse.json(
      { id: count, title: `mock put: ${count}`, booleanVal: false, ctx },
      { status: 200 }
    );
  }),
  http.patch('https://foo/patch', async ctx => {
    count++;
    await delay(1000);
    return HttpResponse.json(
      { id: count, title: `mock patch: ${count}`, booleanVal: false, ctx },
      { status: 200 }
    );
  }),
  http.delete('https://foo/delete', async ctx => {
    count++;
    await delay(1000);
    return HttpResponse.json(
      { id: count, title: `mock delete: ${count}`, booleanVal: false, ctx },
      { status: 200 }
    );
  }),
];

