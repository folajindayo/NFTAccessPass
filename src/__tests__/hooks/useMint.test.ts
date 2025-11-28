import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMint } from '@/hooks/useMint';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useMint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with default state', () => {
    const { result } = renderHook(() => useMint());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeNull();
    expect(result.current.tokenId).toBeNull();
  });

  it('provides mint function', () => {
    const { result } = renderHook(() => useMint());

    expect(typeof result.current.mint).toBe('function');
  });

  it('handles successful mint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        txHash: '0xabc123',
        tokenId: 1,
      }),
    });

    const { result } = renderHook(() => useMint());

    await act(async () => {
      await result.current.mint('0x1234567890123456789012345678901234567890');
    });

    await waitFor(() => {
      expect(result.current.txHash).toBe('0xabc123');
    });

    expect(result.current.tokenId).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets loading state during mint', async () => {
    let resolvePromise: (value: unknown) => void;
    mockFetch.mockImplementation(() => 
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() => useMint());

    act(() => {
      result.current.mint('0x1234567890123456789012345678901234567890');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ success: true, txHash: '0x123', tokenId: 1 }),
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles mint error from API', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({
        error: 'Mint failed: user already has NFT',
      }),
    });

    const { result } = renderHook(() => useMint());

    await act(async () => {
      try {
        await result.current.mint('0x1234567890123456789012345678901234567890');
      } catch (e) {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Mint failed: user already has NFT');
    });

    expect(result.current.txHash).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMint());

    await act(async () => {
      try {
        await result.current.mint('0x1234567890123456789012345678901234567890');
      } catch (e) {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it('sends correct request body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, txHash: '0x123', tokenId: 1 }),
    });

    const { result } = renderHook(() => useMint());

    await act(async () => {
      await result.current.mint('0x1234567890123456789012345678901234567890');
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/mint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: '0x1234567890123456789012345678901234567890',
      }),
    });
  });

  it('provides reset function', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, txHash: '0x123', tokenId: 1 }),
    });

    const { result } = renderHook(() => useMint());

    await act(async () => {
      await result.current.mint('0x1234567890123456789012345678901234567890');
    });

    expect(result.current.txHash).toBe('0x123');

    act(() => {
      result.current.reset();
    });

    expect(result.current.txHash).toBeNull();
    expect(result.current.tokenId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('validates address before minting', async () => {
    const { result } = renderHook(() => useMint());

    await act(async () => {
      try {
        await result.current.mint('invalid-address');
      } catch (e) {
        // Expected
      }
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, txHash: '0x123', tokenId: 1 }),
    });

    const { result } = renderHook(() => useMint({ onSuccess }));

    await act(async () => {
      await result.current.mint('0x1234567890123456789012345678901234567890');
    });

    expect(onSuccess).toHaveBeenCalledWith({ txHash: '0x123', tokenId: 1 });
  });

  it('calls onError callback', async () => {
    const onError = vi.fn();
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMint({ onError }));

    await act(async () => {
      try {
        await result.current.mint('0x1234567890123456789012345678901234567890');
      } catch (e) {
        // Expected
      }
    });

    expect(onError).toHaveBeenCalled();
  });
});

