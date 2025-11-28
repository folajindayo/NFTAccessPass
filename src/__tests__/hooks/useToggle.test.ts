import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle, useMultiToggle, useConfirmToggle } from '@/hooks/useToggle';

describe('useToggle', () => {
  it('starts with default value false', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('starts with provided initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle());

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(false);
  });

  it('sets value to true', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(true);
  });

  it('sets value to false', () => {
    const { result } = renderHook(() => useToggle(true));

    act(() => {
      result.current[3]();
    });

    expect(result.current[0]).toBe(false);
  });

  it('accepts explicit value in toggle', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);

    act(() => {
      result.current[1](false);
    });

    expect(result.current[0]).toBe(false);
  });
});

describe('useMultiToggle', () => {
  it('starts with empty object', () => {
    const { result } = renderHook(() => useMultiToggle<string>());
    expect(result.current.values).toEqual({});
  });

  it('starts with initial values', () => {
    const { result } = renderHook(() => 
      useMultiToggle<string>({ a: true, b: false })
    );
    expect(result.current.values).toEqual({ a: true, b: false });
  });

  it('toggles individual key', () => {
    const { result } = renderHook(() => useMultiToggle<string>());

    act(() => {
      result.current.toggle('key1');
    });

    expect(result.current.values.key1).toBe(true);

    act(() => {
      result.current.toggle('key1');
    });

    expect(result.current.values.key1).toBe(false);
  });

  it('sets specific key to value', () => {
    const { result } = renderHook(() => useMultiToggle<string>());

    act(() => {
      result.current.setKey('key1', true);
    });

    expect(result.current.values.key1).toBe(true);

    act(() => {
      result.current.setKey('key1', false);
    });

    expect(result.current.values.key1).toBe(false);
  });

  it('checks if key is active', () => {
    const { result } = renderHook(() => 
      useMultiToggle<string>({ active: true, inactive: false })
    );

    expect(result.current.isActive('active')).toBe(true);
    expect(result.current.isActive('inactive')).toBe(false);
    expect(result.current.isActive('nonexistent')).toBe(false);
  });

  it('resets all values', () => {
    const { result } = renderHook(() => 
      useMultiToggle<string>({ a: true, b: true, c: true })
    );

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual({});
  });

  it('gets all active keys', () => {
    const { result } = renderHook(() => 
      useMultiToggle<string>({ a: true, b: false, c: true })
    );

    expect(result.current.activeKeys).toEqual(['a', 'c']);
  });
});

describe('useConfirmToggle', () => {
  it('starts with initial value', () => {
    const { result } = renderHook(() => useConfirmToggle(false));
    expect(result.current.value).toBe(false);
    expect(result.current.pendingValue).toBeNull();
  });

  it('sets pending value without confirming', () => {
    const { result } = renderHook(() => useConfirmToggle(false));

    act(() => {
      result.current.requestChange(true);
    });

    expect(result.current.value).toBe(false);
    expect(result.current.pendingValue).toBe(true);
    expect(result.current.isPending).toBe(true);
  });

  it('confirms pending change', () => {
    const { result } = renderHook(() => useConfirmToggle(false));

    act(() => {
      result.current.requestChange(true);
    });

    act(() => {
      result.current.confirm();
    });

    expect(result.current.value).toBe(true);
    expect(result.current.pendingValue).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('cancels pending change', () => {
    const { result } = renderHook(() => useConfirmToggle(false));

    act(() => {
      result.current.requestChange(true);
    });

    act(() => {
      result.current.cancel();
    });

    expect(result.current.value).toBe(false);
    expect(result.current.pendingValue).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('calls onConfirm callback', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmToggle(false, { onConfirm }));

    act(() => {
      result.current.requestChange(true);
    });

    act(() => {
      result.current.confirm();
    });

    expect(onConfirm).toHaveBeenCalledWith(true);
  });

  it('calls onCancel callback', () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() => useConfirmToggle(false, { onCancel }));

    act(() => {
      result.current.requestChange(true);
    });

    act(() => {
      result.current.cancel();
    });

    expect(onCancel).toHaveBeenCalled();
  });
});

