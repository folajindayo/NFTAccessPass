import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useDebouncedState } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('cancels pending debounce on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Component unmounted, value should remain initial
    expect(result.current).toBe('initial');
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'first', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('third');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('arg1');
    result.current('arg2');
    result.current('arg3');

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('provides cancel function', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('arg');
    result.current.cancel?.();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('provides flush function', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('arg');
    result.current.flush?.();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg');
  });
});

describe('useDebouncedState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns both immediate and debounced values', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    expect(result.current.value).toBe('initial');
    expect(result.current.debouncedValue).toBe('initial');
  });

  it('updates immediate value immediately', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.value).toBe('updated');
    expect(result.current.debouncedValue).toBe('initial');
  });

  it('debounces the debounced value', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    act(() => {
      result.current.setValue('updated');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.value).toBe('updated');
    expect(result.current.debouncedValue).toBe('updated');
  });

  it('indicates pending state', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isPending).toBe(false);
  });
});

