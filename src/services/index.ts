/**
 * Service exports
 * Central export file for all services
 */

// Services
export { createAlchemyService, AlchemyService } from './alchemy.service';
export type { AlchemyConfig, NFTMetadata as AlchemyNFTMetadata, OwnedNFT, NFTCollection as AlchemyNFTCollection, TransferEvent } from './alchemy.service';

export { analyticsService, AnalyticsService } from './analytics.service';
export type { EventCategory, AnalyticsEvent, UserProperties, PageView, AnalyticsConfig } from './analytics.service';

export { cacheService, CacheService, createCacheKey } from './cache.service';
export type { CacheEntry, CacheConfig, CacheStats } from './cache.service';

export {
  NFT_ACCESS_PASS_ABI,
  SUPPORTED_CHAINS,
  CHAIN_BY_ID,
  getChainConfig,
  getContractAddress,
  getRpcUrl,
  createPublicClientInstance,
  createWalletClientInstance,
  getNFTContract,
  createContractInstance,
  withRetry,
  readContractWithRetry,
  writeContractWithRetry,
  estimateGasWithBuffer,
  isContract,
  CONTRACT_ABI,
  publicClient,
  walletClient,
  getContractInstance,
} from './contract.service';
export type { RetryConfig, ContractError, TransactionError as ContractTransactionError } from './contract.service';

export { createIndexer, IndexerService } from './indexer.service';
export type { IndexedEvent, IndexerState, EventFilter, IndexerConfig } from './indexer.service';

export { ipfsService, IpfsService, IPFS_GATEWAYS } from './ipfs.service';
export type { IpfsConfig, IpfsUploadResult, IpfsMetadata } from './ipfs.service';

export { nftService, NftService } from './nft.service';

export { notificationService, NotificationService } from './notification.service';
export type { Notification, NotificationType, NotificationPosition, NotificationConfig } from './notification.service';

export { priceService, PriceService } from './price.service';
export type { TokenPrice, GasPrice as PriceGasInfo, PriceConfig } from './price.service';

export { queueService, QueueService } from './queue.service';
export type { QueuedTransaction, TransactionStatus as QueueTransactionStatus, TransactionExecutor, QueueConfig } from './queue.service';

export { rateLimitService, RateLimitService, RateLimitPresets } from './rate-limit.service';
export type { RateLimitConfig, RateLimitResult } from './rate-limit.service';

export {
  truncateAddress,
  formatWeiToEther,
  parseEtherToWei,
  getFormattedBalance,
  isValidEthereumAddress,
  toChecksumAddress as walletToChecksum,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getExplorerTokenUrl,
  getExplorerBlockUrl,
  addressEquals,
  getShortChainName,
  getChainName,
  formatTokenBalance,
  createWalletInfo,
  getEmptyWalletInfo,
  CHAIN_CONFIGS,
  getNativeCurrencySymbol,
  isTestnet,
} from './wallet.service';
export type { WalletInfo, WalletBalance, ConnectionStatus, ChainConfig as WalletChainConfig } from './wallet.service';

