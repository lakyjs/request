import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

export const server = setupServer();

// 所有测试之前启动 mock server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
// 所有测试之后关闭 mock server
afterAll(() => server.close());
// 所有测试之后重置 mock server
afterEach(() => server.resetHandlers());
