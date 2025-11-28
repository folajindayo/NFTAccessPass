import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAccess } from '@/hooks/useAccess';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with hasAccess false when no address', () => {
    const { result } = renderHook(() => useAccess());

    expect(result.current.hasAccess).toBe(false);
  });

  it('does not fetch when no address provided', () => {
    renderHook(() => useAccess());

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches access status when address is provided', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ hasAccess: true }),
    });

    const { result } = renderHook(() => 
      useAccess('0x1234567890123456789012345678901234567890')
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/check?address=0x1234567890123456789012345678901234567890'
    );
  });

  it('returns false when user does not have access', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ hasAccess: false }),
    });

    const { result } = renderHook(() => 
      useAccess('0x1234567890123456789012345678901234567890')
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(false);
    });
  });

  it('handles fetch errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      useAccess('0x1234567890123456789012345678901234567890')
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(false);
    });
  });

  it('provides checkAccess function to manually refresh', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ hasAccess: true }),
    });

    const { result } = renderHook(() => 
      useAccess('0x1234567890123456789012345678901234567890')
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(true);
    });

    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ hasAccess: false }),
    });

    await act(async () => {
      await result.current.checkAccess();
    });

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(false);
    });
  });

  it('resets hasAccess when address changes to undefined', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ hasAccess: true }),
    });

    const { result, rerender } = renderHook(
      ({ address }) => useAccess(address),
      { initialProps: { address: '0x1234567890123456789012345678901234567890' } }
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(true);
    });

    rerender({ address: undefined });

    expect(result.current.hasAccess).toBe(false);
  });

  it('refetches when address changes', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ hasAccess: true }),
    });

    const { result, rerender } = renderHook(
      ({ address }) => useAccess(address),
      { initialProps: { address: '0x1111111111111111111111111111111111111111' } }
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender({ address: '0x2222222222222222222222222222222222222222' });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/check?address=0x2222222222222222222222222222222222222222'
    );
  });

  it('handles JSON parse errors gracefully', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.reject(new Error('Invalid JSON')),
    });

    const { result } = renderHook(() => 
      useAccess('0x1234567890123456789012345678901234567890')
    );

    await waitFor(() => {
      expect(result.current.hasAccess).toBe(false);
    });
  });
});

