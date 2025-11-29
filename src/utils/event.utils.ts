/**
 * Event utility functions
 * Helpers for event handling and event emitter patterns
 */

export type EventCallback<T = unknown> = (data: T) => void;
export type UnsubscribeFn = () => void;

/**
 * Simple event emitter class
 */
export class EventEmitter<Events extends Record<string, unknown>> {
  private listeners: Map<keyof Events, Set<EventCallback>> = new Map();
  private onceListeners: Map<keyof Events, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on<K extends keyof Events>(
    event: K,
    callback: EventCallback<Events[K]>
  ): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback);

    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   */
  once<K extends keyof Events>(
    event: K,
    callback: EventCallback<Events[K]>
  ): UnsubscribeFn {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(callback as EventCallback);

    return () => {
      this.onceListeners.get(event)?.delete(callback as EventCallback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof Events>(
    event: K,
    callback: EventCallback<Events[K]>
  ): void {
    this.listeners.get(event)?.delete(callback as EventCallback);
    this.onceListeners.get(event)?.delete(callback as EventCallback);
  }

  /**
   * Emit an event
   */
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    // Regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event listener error for "${String(event)}":`, error);
        }
      });
    }

    // Once listeners
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Once listener error for "${String(event)}":`, error);
        }
      });
      this.onceListeners.delete(event);
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: keyof Events): number {
    const regular = this.listeners.get(event)?.size || 0;
    const once = this.onceListeners.get(event)?.size || 0;
    return regular + once;
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(event?: keyof Events): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event: keyof Events): boolean {
    return this.listenerCount(event) > 0;
  }
}

/**
 * Create a typed event emitter
 */
export function createEventEmitter<Events extends Record<string, unknown>>(): EventEmitter<Events> {
  return new EventEmitter<Events>();
}

/**
 * Create a single-event subscription
 */
export function createSubscription<T>(): {
  subscribe: (callback: EventCallback<T>) => UnsubscribeFn;
  notify: (data: T) => void;
  getSubscriberCount: () => number;
} {
  const subscribers = new Set<EventCallback<T>>();

  return {
    subscribe: (callback: EventCallback<T>): UnsubscribeFn => {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    notify: (data: T): void => {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscription callback error:', error);
        }
      });
    },
    getSubscriberCount: (): number => subscribers.size,
  };
}

/**
 * Wait for an event to be emitted
 */
export function waitForEvent<Events extends Record<string, unknown>, K extends keyof Events>(
  emitter: EventEmitter<Events>,
  event: K,
  timeout?: number
): Promise<Events[K]> {
  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = emitter.once(event, (data) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve(data);
    });

    if (timeout) {
      timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Timeout waiting for event: ${String(event)}`));
      }, timeout);
    }
  });
}

/**
 * Create an event handler that prevents default
 */
export function preventDefault<E extends { preventDefault: () => void }>(
  handler?: (event: E) => void
): (event: E) => void {
  return (event: E) => {
    event.preventDefault();
    handler?.(event);
  };
}

/**
 * Create an event handler that stops propagation
 */
export function stopPropagation<E extends { stopPropagation: () => void }>(
  handler?: (event: E) => void
): (event: E) => void {
  return (event: E) => {
    event.stopPropagation();
    handler?.(event);
  };
}

/**
 * Create a keyboard event handler for specific keys
 */
export function onKey(
  keys: string | string[],
  handler: (event: KeyboardEvent) => void
): (event: KeyboardEvent) => void {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  
  return (event: KeyboardEvent) => {
    if (keyArray.includes(event.key)) {
      handler(event);
    }
  };
}

/**
 * Create a handler for Enter key
 */
export function onEnter(
  handler: (event: KeyboardEvent) => void
): (event: KeyboardEvent) => void {
  return onKey('Enter', handler);
}

/**
 * Create a handler for Escape key
 */
export function onEscape(
  handler: (event: KeyboardEvent) => void
): (event: KeyboardEvent) => void {
  return onKey('Escape', handler);
}

/**
 * Compose multiple event handlers
 */
export function composeHandlers<E>(
  ...handlers: Array<((event: E) => void) | undefined>
): (event: E) => void {
  return (event: E) => {
    handlers.forEach(handler => {
      handler?.(event);
    });
  };
}

/**
 * Create a click outside handler
 */
export function createClickOutsideHandler(
  elementRef: { current: HTMLElement | null },
  handler: () => void
): (event: MouseEvent) => void {
  return (event: MouseEvent) => {
    if (
      elementRef.current &&
      !elementRef.current.contains(event.target as Node)
    ) {
      handler();
    }
  };
}

/**
 * Add event listener with cleanup
 */
export function addEventListenerWithCleanup<K extends keyof WindowEventMap>(
  target: Window | HTMLElement | Document,
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): UnsubscribeFn {
  target.addEventListener(event, handler as EventListener, options);
  
  return () => {
    target.removeEventListener(event, handler as EventListener, options);
  };
}

