import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for boolean toggle state
 * @param initialValue - Initial toggle state
 * @returns [value, toggle, setters]
 */
export function useToggle(initialValue: boolean = false): [
  boolean,
  () => void,
  { on: () => void; off: () => void; set: (value: boolean) => void }
] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const set = useCallback((v: boolean) => setValue(v), []);

  const setters = useMemo(() => ({ on, off, set }), [on, off, set]);

  return [value, toggle, setters];
}

/**
 * Hook for managing multiple toggle states
 * @param initial - Initial state object
 * @returns State and toggle functions
 */
export function useMultiToggle<T extends Record<string, boolean>>(
  initial: T
): {
  state: T;
  toggle: (key: keyof T) => void;
  setOn: (key: keyof T) => void;
  setOff: (key: keyof T) => void;
  set: (key: keyof T, value: boolean) => void;
  reset: () => void;
} {
  const [state, setState] = useState<T>(initial);

  const toggle = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setOn = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: true }));
  }, []);

  const setOff = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: false }));
  }, []);

  const set = useCallback((key: keyof T, value: boolean) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setState(initial);
  }, [initial]);

  return { state, toggle, setOn, setOff, set, reset };
}

/**
 * Hook for boolean state with confirmation pattern
 */
export function useConfirmToggle(
  initialValue: boolean = false,
  onConfirm?: () => void
): {
  value: boolean;
  pending: boolean;
  request: () => void;
  confirm: () => void;
  cancel: () => void;
} {
  const [value, setValue] = useState(initialValue);
  const [pending, setPending] = useState(false);

  const request = useCallback(() => {
    setPending(true);
  }, []);

  const confirm = useCallback(() => {
    setValue(v => !v);
    setPending(false);
    onConfirm?.();
  }, [onConfirm]);

  const cancel = useCallback(() => {
    setPending(false);
  }, []);

  return { value, pending, request, confirm, cancel };
}

export default useToggle;

