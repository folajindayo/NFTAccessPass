/**
 * Promise utility functions
 * Helpers for async operations and promise handling
 */

export interface PromiseWithCancel<T> extends Promise<T> {
  cancel: () => void;
  isCancelled: () => boolean;
}

/**
 * Create a promise that resolves after a delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a promise that rejects after a timeout
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

/**
 * Create a cancellable promise
 */
export function cancellable<T>(
  executor: (
    resolve: (value: T) => void,
    reject: (reason?: unknown) => void,
    signal: { cancelled: boolean }
  ) => void
): PromiseWithCancel<T> {
  let cancelled = false;
  const signal = { cancelled: false };

  const promise = new Promise<T>((resolve, reject) => {
    executor(
      (value) => {
        if (!cancelled) resolve(value);
      },
      (reason) => {
        if (!cancelled) reject(reason);
      },
      signal
    );
  }) as PromiseWithCancel<T>;

  promise.cancel = () => {
    cancelled = true;
    signal.cancelled = true;
  };

  promise.isCancelled = () => cancelled;

  return promise;
}

/**
 * Run promises in sequence
 */
export async function sequence<T>(
  tasks: Array<() => Promise<T>>
): Promise<T[]> {
  const results: T[] = [];
  
  for (const task of tasks) {
    results.push(await task());
  }
  
  return results;
}

/**
 * Run promises with concurrency limit
 */
export async function parallel<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    
    const promise = task().then(result => {
      results[i] = result;
    });
    
    const executingPromise = promise.then(() => {
      executing.splice(executing.indexOf(executingPromise), 1);
    });
    
    executing.push(executingPromise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  await Promise.all(executing);
  return results;
}

/**
 * Settle all promises and return results with status
 */
export async function settle<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }>> {
  return Promise.allSettled(promises);
}

/**
 * Filter async - filter array with async predicate
 */
export async function filterAsync<T>(
  array: T[],
  predicate: (item: T, index: number) => Promise<boolean>
): Promise<T[]> {
  const results = await Promise.all(
    array.map(async (item, index) => ({
      item,
      keep: await predicate(item, index),
    }))
  );
  
  return results.filter(r => r.keep).map(r => r.item);
}

/**
 * Map async - map array with async function
 */
export async function mapAsync<T, U>(
  array: T[],
  fn: (item: T, index: number) => Promise<U>
): Promise<U[]> {
  return Promise.all(array.map(fn));
}

/**
 * Find async - find first item matching async predicate
 */
export async function findAsync<T>(
  array: T[],
  predicate: (item: T, index: number) => Promise<boolean>
): Promise<T | undefined> {
  for (let i = 0; i < array.length; i++) {
    if (await predicate(array[i], i)) {
      return array[i];
    }
  }
  return undefined;
}

/**
 * Reduce async - reduce array with async function
 */
export async function reduceAsync<T, U>(
  array: T[],
  fn: (acc: U, item: T, index: number) => Promise<U>,
  initial: U
): Promise<U> {
  let acc = initial;
  
  for (let i = 0; i < array.length; i++) {
    acc = await fn(acc, array[i], i);
  }
  
  return acc;
}

/**
 * Create a deferred promise
 */
export function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return { promise, resolve, reject };
}

/**
 * Create a mutex for exclusive async access
 */
export function createMutex(): {
  acquire: () => Promise<() => void>;
  isLocked: () => boolean;
} {
  let locked = false;
  const waiting: Array<() => void> = [];

  return {
    acquire: (): Promise<() => void> => {
      return new Promise(resolve => {
        const release = () => {
          locked = false;
          const next = waiting.shift();
          if (next) {
            locked = true;
            next();
          }
        };

        if (!locked) {
          locked = true;
          resolve(release);
        } else {
          waiting.push(() => resolve(release));
        }
      });
    },
    isLocked: () => locked,
  };
}

/**
 * Poll until condition is met
 */
export async function poll<T>(
  fn: () => Promise<T>,
  condition: (result: T) => boolean,
  interval: number = 1000,
  maxAttempts: number = 10
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await fn();
    
    if (condition(result)) {
      return result;
    }
    
    if (i < maxAttempts - 1) {
      await delay(interval);
    }
  }
  
  throw new Error('Polling condition not met');
}

/**
 * Wrap promise to never reject (returns result or error)
 */
export async function safe<T>(
  promise: Promise<T>
): Promise<{ ok: true; value: T } | { ok: false; error: Error }> {
  try {
    const value = await promise;
    return { ok: true, value };
  } catch (error) {
    return { 
      ok: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
}

/**
 * Create a promise that resolves on next tick
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => {
    if (typeof queueMicrotask !== 'undefined') {
      queueMicrotask(resolve);
    } else {
      Promise.resolve().then(resolve);
    }
  });
}

/**
 * Create a promise that resolves on next animation frame
 */
export function nextFrame(): Promise<number> {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(resolve);
    } else {
      setTimeout(() => resolve(Date.now()), 16);
    }
  });
}

