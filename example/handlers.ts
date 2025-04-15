import { http, HttpResponse } from 'msw';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const handlers = [
  http.get('http://bar', async () => {
    await delay(1000);
    return HttpResponse.json(
      { id: 1, title: 'delectus aut autem', completed: false },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }),
  http.post('http://foo', async () => {
    await delay(1000);
    return HttpResponse.json(
      { id: 1, title: 'delectus aut autem', completed: false },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  })
];

