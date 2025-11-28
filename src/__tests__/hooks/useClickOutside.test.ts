import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside, useMultipleClickOutside } from '@/hooks/useClickOutside';

describe('useClickOutside', () => {
  let container: HTMLDivElement;
  let inside: HTMLDivElement;
  let outside: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    inside = document.createElement('div');
    inside.setAttribute('data-testid', 'inside');
    outside = document.createElement('div');
    outside.setAttribute('data-testid', 'outside');
    
    container.appendChild(inside);
    container.appendChild(outside);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('calls handler when clicking outside', () => {
    const handler = vi.fn();
    
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(inside);
      useClickOutside(ref, handler);
      return ref;
    });

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      outside.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when clicking inside', () => {
    const handler = vi.fn();
    
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(inside);
      useClickOutside(ref, handler);
      return ref;
    });

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      inside.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('removes listener on unmount', () => {
    const handler = vi.fn();
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(inside);
      useClickOutside(ref, handler);
      return ref;
    });

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('handles touch events when enabled', () => {
    const handler = vi.fn();
    
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(inside);
      useClickOutside(ref, handler, { listenToTouchEvents: true });
      return ref;
    });

    act(() => {
      const event = new TouchEvent('touchstart', { bubbles: true });
      outside.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('respects enabled option', () => {
    const handler = vi.fn();
    
    const { result, rerender } = renderHook(
      ({ enabled }) => {
        const ref = useRef<HTMLDivElement>(inside);
        useClickOutside(ref, handler, { enabled });
        return ref;
      },
      { initialProps: { enabled: false } }
    );

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      outside.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();

    rerender({ enabled: true });

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      outside.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles null ref gracefully', () => {
    const handler = vi.fn();
    
    renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      useClickOutside(ref, handler);
      return ref;
    });

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      outside.dispatchEvent(event);
    });

    // Should not throw and handler should be called
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('useMultipleClickOutside', () => {
  let container: HTMLDivElement;
  let inside1: HTMLDivElement;
  let inside2: HTMLDivElement;
  let outside: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    inside1 = document.createElement('div');
    inside2 = document.createElement('div');
    outside = document.createElement('div');
    
    container.appendChild(inside1);
    container.appendChild(inside2);
    container.appendChild(outside);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('calls handler when clicking outside all refs', () => {
    const handler = vi.fn();
    
    renderHook(() => {
      const ref1 = useRef<HTMLDivElement>(inside1);
      const ref2 = useRef<HTMLDivElement>(inside2);
      useMultipleClickOutside([ref1, ref2], handler);
      return { ref1, ref2 };
    });

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      outside.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when clicking inside any ref', () => {
    const handler = vi.fn();
    
    renderHook(() => {
      const ref1 = useRef<HTMLDivElement>(inside1);
      const ref2 = useRef<HTMLDivElement>(inside2);
      useMultipleClickOutside([ref1, ref2], handler);
      return { ref1, ref2 };
    });

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      inside1.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();

    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      inside2.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });
});

