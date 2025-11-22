import { createMocks } from 'node-mocks-http';
import { sendSuccess, sendError } from '@/utils/api-helpers';

describe('API Helpers', () => {
  it('sendSuccess sends 200 and data', () => {
    const { res } = createMocks();
    sendSuccess(res, { foo: 'bar' });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toBe('{"foo":"bar"}');
  });

  it('sendError sends 500 and error message by default', () => {
    const { res } = createMocks();
    sendError(res, 'Something went wrong');
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toBe('{"error":"Something went wrong"}');
  });

  it('sendError sends custom status code', () => {
    const { res } = createMocks();
    sendError(res, 'Not Found', 404);
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toBe('{"error":"Not Found"}');
  });
});

