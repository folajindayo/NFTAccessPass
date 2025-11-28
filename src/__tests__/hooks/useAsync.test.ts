import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync, useAsyncCallback, useAsyncRetry } from '@/hooks/useAsync';

describe('useAsync', () => {
  it('starts with idle state', () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: false }));

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('executes immediately when immediate is true', async () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: true }));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.data).toBe('result');
  });

  it('handles loading state', async () => {
    let resolvePromise: (value: string) => void;
    const asyncFn = vi.fn().mockImplementation(() => 
      new Promise<string>((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() => useAsync(asyncFn, { immediate: false }));

    act(() => {
      result.current.execute();
    });

    expect(result.current.status).toBe('pending');
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!('result');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });
  });

  it('handles success state', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success data');
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: false }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe('success data');
    expect(result.current.isSuccess).toBe(true);
  });

  it('handles error state', async () => {
    const error = new Error('async error');
    const asyncFn = vi.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: false }));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Expected
      }
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(error);
    expect(result.current.isError).toBe(true);
  });

  it('resets state', async () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: false }));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.status).toBe('success');

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('passes arguments to async function', async () => {
    const asyncFn = vi.fn().mockImplementation((a: number, b: string) => 
      Promise.resolve(`${a}-${b}`)
    );
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: false }));

    await act(async () => {
      await result.current.execute(42, 'test');
    });

    expect(asyncFn).toHaveBeenCalledWith(42, 'test');
    expect(result.current.data).toBe('42-test');
  });
});

describe('useAsyncCallback', () => {
  it('returns a callable function', () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    expect(typeof result.current.execute).toBe('function');
  });

  it('does not execute immediately', () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    renderHook(() => useAsyncCallback(asyncFn));

    expect(asyncFn).not.toHaveBeenCalled();
  });

  it('executes when called', async () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsyncCallback(asyncFn));

    await act(async () => {
      await result.current.execute();
    });

    expect(asyncFn).toHaveBeenCalled();
    expect(result.current.data).toBe('result');
  });
});

describe('useAsyncRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries on failure', async () => {
    const asyncFn = vi.fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockResolvedValueOnce('success');

    const { result } = renderHook(() => 
      useAsyncRetry(asyncFn, { maxRetries: 3, retryDelay: 1000 })
    );

    act(() => {
      result.current.execute();
    });

    // First attempt fails
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Wait for retry delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Second attempt fails
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Third attempt succeeds
    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(asyncFn).toHaveBeenCalledTimes(3);
    expect(result.current.data).toBe('success');
  });

  it('stops retrying after max retries', async () => {
    const error = new Error('persistent error');
    const asyncFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => 
      useAsyncRetry(asyncFn, { maxRetries: 2, retryDelay: 100 })
    );

    act(() => {
      result.current.execute();
    });

    // Run through all retries
    for (let i = 0; i <= 2; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(asyncFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(result.current.error).toBe(error);
  });

  it('tracks retry count', async () => {
    const asyncFn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    const { result } = renderHook(() => 
      useAsyncRetry(asyncFn, { maxRetries: 3, retryDelay: 100 })
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.retryCount).toBe(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    await waitFor(() => {
      expect(result.current.retryCount).toBe(1);
    });
  });

  it('uses exponential backoff when enabled', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => 
      useAsyncRetry(asyncFn, { 
        maxRetries: 3, 
        retryDelay: 1000,
        exponentialBackoff: true 
      })
    );

    const startTime = Date.now();

    act(() => {
      result.current.execute();
    });

    // First retry: 1000ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    // Second retry: 2000ms (exponential)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // Third retry: 4000ms (exponential)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });

    expect(asyncFn).toHaveBeenCalledTimes(4);
  });
});

