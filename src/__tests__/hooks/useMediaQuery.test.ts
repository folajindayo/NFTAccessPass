import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop, 
  usePrefersDarkMode,
  usePrefersReducedMotion 
} from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let listeners: Map<string, Set<(e: MediaQueryListEvent) => void>>;

  beforeEach(() => {
    listeners = new Map();
    
    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        if (!listeners.has(query)) {
          listeners.set(query, new Set());
        }
        listeners.get(query)?.add(handler);
      }),
      removeEventListener: vi.fn((event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners.get(query)?.delete(handler);
      }),
      dispatchEvent: vi.fn(),
    }));

    window.matchMedia = mockMatchMedia as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial match state', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false for non-matching query', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(min-width: 1024px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('updates when media query changes', () => {
    let changeHandler: ((e: MediaQueryListEvent) => void) | null = null;

    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(min-width: 768px)',
      addEventListener: vi.fn((event, handler) => {
        changeHandler = handler;
      }),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => {
      changeHandler?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const removeEventListener = vi.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(min-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener,
    });

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    unmount();

    expect(removeEventListener).toHaveBeenCalled();
  });
});

describe('useIsMobile', () => {
  it('returns true for mobile viewport', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false for desktop viewport', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  it('returns true for tablet viewport', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });
});

describe('useIsDesktop', () => {
  it('returns true for desktop viewport', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});

describe('usePrefersDarkMode', () => {
  it('returns true when user prefers dark mode', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(true);
  });

  it('returns false when user prefers light mode', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => usePrefersDarkMode());
    expect(result.current).toBe(false);
  });
});

describe('usePrefersReducedMotion', () => {
  it('returns true when user prefers reduced motion', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });
});

