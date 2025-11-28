import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, useLocalStorageWithExpiry } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete mockStorage[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('returns initial value when key does not exist', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('returns stored value when key exists', () => {
    mockStorage['testKey'] = JSON.stringify('stored');
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));
    expect(result.current[0]).toBe('stored');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(mockStorage['testKey']).toBe(JSON.stringify('updated'));
  });

  it('handles function updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });

  it('removes value when set to undefined', () => {
    mockStorage['testKey'] = JSON.stringify('value');
    const { result } = renderHook(() => useLocalStorage<string | undefined>('testKey', undefined));

    act(() => {
      result.current[1](undefined);
    });

    expect(mockStorage['testKey']).toBeUndefined();
  });

  it('handles complex objects', () => {
    const complexValue = { name: 'test', data: [1, 2, 3] };
    const { result } = renderHook(() => useLocalStorage('complex', complexValue));

    expect(result.current[0]).toEqual(complexValue);

    const updatedValue = { name: 'updated', data: [4, 5, 6] };
    act(() => {
      result.current[1](updatedValue);
    });

    expect(result.current[0]).toEqual(updatedValue);
  });

  it('handles JSON parse errors gracefully', () => {
    mockStorage['invalid'] = 'not valid json';
    const { result } = renderHook(() => useLocalStorage('invalid', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('provides remove function', () => {
    mockStorage['testKey'] = JSON.stringify('value');
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[2](); // remove function
    });

    expect(mockStorage['testKey']).toBeUndefined();
    expect(result.current[0]).toBe('initial');
  });
});

describe('useLocalStorageWithExpiry', () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete mockStorage[key];
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('stores value with expiry timestamp', () => {
    const { result } = renderHook(() => 
      useLocalStorageWithExpiry('expiryKey', 'initial', 3600000)
    );

    act(() => {
      result.current[1]('value');
    });

    const stored = JSON.parse(mockStorage['expiryKey']);
    expect(stored.value).toBe('value');
    expect(stored.expiry).toBeDefined();
  });

  it('returns stored value before expiry', () => {
    const now = Date.now();
    mockStorage['expiryKey'] = JSON.stringify({
      value: 'stored',
      expiry: now + 3600000,
    });

    const { result } = renderHook(() =>
      useLocalStorageWithExpiry('expiryKey', 'initial', 3600000)
    );

    expect(result.current[0]).toBe('stored');
  });

  it('returns initial value after expiry', () => {
    const now = Date.now();
    mockStorage['expiryKey'] = JSON.stringify({
      value: 'expired',
      expiry: now - 1000, // Already expired
    });

    const { result } = renderHook(() =>
      useLocalStorageWithExpiry('expiryKey', 'initial', 3600000)
    );

    expect(result.current[0]).toBe('initial');
  });

  it('removes expired item from storage', () => {
    const now = Date.now();
    mockStorage['expiryKey'] = JSON.stringify({
      value: 'expired',
      expiry: now - 1000,
    });

    renderHook(() => useLocalStorageWithExpiry('expiryKey', 'initial', 3600000));

    expect(mockStorage['expiryKey']).toBeUndefined();
  });
});

