import { getEnv } from '@/utils/env';

describe('getEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns value for existing key', () => {
    process.env.TEST_KEY = 'test_value';
    expect(getEnv('TEST_KEY')).toBe('test_value');
  });

  it('returns empty string and warns for missing key', () => {
    console.warn = jest.fn();
    expect(getEnv('MISSING_KEY')).toBe('');
    expect(console.warn).toHaveBeenCalledWith('Environment variable MISSING_KEY is missing');
  });
});

