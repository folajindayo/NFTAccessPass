import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipboard, useClipboardWithReset } from '@/hooks/useClipboard';

describe('useClipboard', () => {
  const mockClipboard = {
    writeText: vi.fn(),
    readText: vi.fn(),
  };

  beforeEach(() => {
    Object.assign(navigator, { clipboard: mockClipboard });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies text to clipboard', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result.current.copied).toBe(true);
  });

  it('returns value that was copied', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(result.current.value).toBe('test text');
  });

  it('handles copy failure', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Copy failed'));
    
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      try {
        await result.current.copy('test text');
      } catch (e) {
        // Expected error
      }
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('reads text from clipboard', async () => {
    mockClipboard.readText.mockResolvedValue('clipboard content');
    
    const { result } = renderHook(() => useClipboard());

    let readValue: string | undefined;
    await act(async () => {
      readValue = await result.current.read();
    });

    expect(readValue).toBe('clipboard content');
  });

  it('handles read failure', async () => {
    mockClipboard.readText.mockRejectedValue(new Error('Read failed'));
    
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      try {
        await result.current.read();
      } catch (e) {
        // Expected error
      }
    });

    expect(result.current.error).toBeTruthy();
  });

  it('clears error on successful copy', async () => {
    mockClipboard.writeText.mockRejectedValueOnce(new Error('First failed'));
    mockClipboard.writeText.mockResolvedValueOnce(undefined);
    
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      try {
        await result.current.copy('first');
      } catch (e) {
        // Expected
      }
    });

    expect(result.current.error).toBeTruthy();

    await act(async () => {
      await result.current.copy('second');
    });

    expect(result.current.error).toBeNull();
  });

  it('resets copied state', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.value).toBe('');
  });
});

describe('useClipboardWithReset', () => {
  const mockClipboard = {
    writeText: vi.fn(),
    readText: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    Object.assign(navigator, { clipboard: mockClipboard });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('automatically resets copied state after timeout', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClipboardWithReset(2000));

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('uses custom timeout', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClipboardWithReset(5000));

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('resets timer on new copy', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useClipboardWithReset(2000));

    await act(async () => {
      await result.current.copy('first');
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await result.current.copy('second');
    });

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Should still be copied because timer was reset
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.copied).toBe(false);
  });
});

