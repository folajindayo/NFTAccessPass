/**
 * Library exports
 * Central export file for all library utilities
 */

// Prisma client (if needed)
export { prisma } from './prisma';

// Viem client utilities
export {
  createViemClient,
  createWalletClient as createViemWalletClient,
  getPublicClient,
  type ViemClient,
} from './viem';

// Query client configuration
export {
  queryClient,
  queryClientConfig,
  prefetchQuery,
} from './query';

