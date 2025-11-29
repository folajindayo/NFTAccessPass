/**
 * Hook exports
 * Central export file for all custom hooks
 */

// Core hooks
export { useAccess } from './useAccess';
export { useAsync } from './useAsync';
export { useChainId } from './useChainId';
export { useClickOutside } from './useClickOutside';
export { useClipboard } from './useClipboard';
export { useContract } from './useContract';
export { useContractRead } from './useContractRead';
export { useContractWrite } from './useContractWrite';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useEnsName } from './useEnsName';
export { useGasPrice } from './useGasPrice';
export { useInterval } from './useInterval';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery } from './useMediaQuery';
export { useMint } from './useMint';
export { useNetworkStatus } from './useNetworkStatus';
export { useNFTApproval } from './useNFTApproval';
export { useNFTMetadata } from './useNFTMetadata';
export { useNFTOwnership } from './useNFTOwnership';
export { usePrevious } from './usePrevious';
export { useToggle } from './useToggle';
export { useTokenGating } from './useTokenGating';
export { useTokenMetadata } from './useTokenMetadata';
export { useTransactionReceipt } from './useTransactionReceipt';
export { useTranslation } from './useTranslation';
export { useWalletBalance } from './useWalletBalance';
export { useWalletConnection } from './useWalletConnection';
export { useWalletEvents } from './useWalletEvents';

// Performance hooks
export {
  useMemoizedCallback,
  useDeepMemo,
  useStableCallback,
  useEventCallback,
  useShallowMemo,
  useDebouncedCallback as useMemoizedDebouncedCallback,
  useThrottledCallback,
} from './useMemoizedCallback';

export {
  usePrefetch,
  usePrefetchOnHover,
  usePrefetchOnFocus,
  clearAllPrefetchCache,
  getPrefetchCacheStats,
} from './usePrefetch';
export type { PrefetchOptions, PrefetchResult } from './usePrefetch';

export {
  useRenderCount,
  useWhyDidYouUpdate,
  useUpdateEffect,
  useDeferredState,
  useBatchedState,
  useStableState,
  useForceUpdate,
  useAsyncMemo,
  useSelector,
} from './useOptimizedRender';

// Re-export types from hooks
export type { UseAsyncReturn, UseAsyncOptions } from './useAsync';
export type { UseClipboardReturn } from './useClipboard';
export type { UseToggleReturn } from './useToggle';

