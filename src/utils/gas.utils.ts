/**
 * Gas utility functions
 * Helpers for gas estimation and fee calculation
 */

export interface GasEstimate {
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: bigint;
}

export interface GasPrices {
  slow: bigint;
  standard: bigint;
  fast: bigint;
  instant: bigint;
}

export type GasSpeed = 'slow' | 'standard' | 'fast' | 'instant';

/**
 * Convert gwei to wei
 */
export function gweiToWei(gwei: number): bigint {
  return BigInt(Math.floor(gwei * 1e9));
}

/**
 * Convert wei to gwei
 */
export function weiToGwei(wei: bigint): number {
  return Number(wei) / 1e9;
}

/**
 * Format gas price for display
 */
export function formatGasPrice(wei: bigint, decimals: number = 2): string {
  const gwei = weiToGwei(wei);
  return `${gwei.toFixed(decimals)} Gwei`;
}

/**
 * Format gas cost in ETH
 */
export function formatGasCost(wei: bigint, decimals: number = 6): string {
  const eth = Number(wei) / 1e18;
  if (eth < 0.000001) {
    return '< 0.000001 ETH';
  }
  return `${eth.toFixed(decimals)} ETH`;
}

/**
 * Calculate total gas cost
 */
export function calculateGasCost(
  gasLimit: bigint,
  maxFeePerGas: bigint
): bigint {
  return gasLimit * maxFeePerGas;
}

/**
 * Calculate EIP-1559 gas parameters
 */
export function calculateEIP1559Gas(
  baseFee: bigint,
  priorityFee: bigint,
  multiplier: number = 1.5
): { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint } {
  const maxFeePerGas = BigInt(Math.floor(Number(baseFee) * multiplier)) + priorityFee;
  
  return {
    maxFeePerGas,
    maxPriorityFeePerGas: priorityFee,
  };
}

/**
 * Add buffer to gas limit
 */
export function addGasBuffer(
  gasLimit: bigint,
  bufferPercent: number = 20
): bigint {
  return gasLimit + (gasLimit * BigInt(bufferPercent)) / 100n;
}

/**
 * Get gas price for speed level
 */
export function getGasPriceForSpeed(
  prices: GasPrices,
  speed: GasSpeed
): bigint {
  return prices[speed];
}

/**
 * Estimate gas cost range
 */
export function estimateGasCostRange(
  gasLimit: bigint,
  prices: GasPrices
): { min: bigint; max: bigint } {
  return {
    min: gasLimit * prices.slow,
    max: gasLimit * prices.instant,
  };
}

/**
 * Default gas limits for common operations
 */
export const DEFAULT_GAS_LIMITS: Record<string, bigint> = {
  transfer: 21000n,
  erc20Transfer: 65000n,
  erc20Approve: 46000n,
  erc721Transfer: 85000n,
  erc721Mint: 150000n,
  erc721Approve: 50000n,
  erc1155Transfer: 90000n,
  contractInteraction: 200000n,
};

/**
 * Get default gas limit for operation type
 */
export function getDefaultGasLimit(operation: string): bigint {
  return DEFAULT_GAS_LIMITS[operation] || DEFAULT_GAS_LIMITS.contractInteraction;
}

/**
 * Calculate max transaction cost (worst case)
 */
export function calculateMaxCost(
  gasLimit: bigint,
  maxFeePerGas: bigint,
  value: bigint = 0n
): bigint {
  return (gasLimit * maxFeePerGas) + value;
}

/**
 * Check if user has enough balance
 */
export function hasEnoughBalance(
  balance: bigint,
  gasLimit: bigint,
  maxFeePerGas: bigint,
  value: bigint = 0n
): boolean {
  const maxCost = calculateMaxCost(gasLimit, maxFeePerGas, value);
  return balance >= maxCost;
}

/**
 * Calculate savings from lower gas price
 */
export function calculateGasSavings(
  gasLimit: bigint,
  currentPrice: bigint,
  targetPrice: bigint
): bigint {
  if (targetPrice >= currentPrice) return 0n;
  return gasLimit * (currentPrice - targetPrice);
}

/**
 * Suggest gas price based on urgency
 */
export function suggestGasPrice(
  baseFee: bigint,
  urgency: 'low' | 'medium' | 'high' | 'urgent'
): bigint {
  const multipliers: Record<string, number> = {
    low: 1.0,
    medium: 1.2,
    high: 1.5,
    urgent: 2.0,
  };

  const multiplier = multipliers[urgency];
  return BigInt(Math.floor(Number(baseFee) * multiplier));
}

/**
 * Parse gas from transaction data
 */
export function parseGasFromTx(tx: {
  gas?: bigint | string;
  gasLimit?: bigint | string;
  maxFeePerGas?: bigint | string;
  gasPrice?: bigint | string;
}): GasEstimate | null {
  const gasLimit = BigInt(tx.gas || tx.gasLimit || 0);
  const maxFeePerGas = BigInt(tx.maxFeePerGas || tx.gasPrice || 0);

  if (gasLimit === 0n || maxFeePerGas === 0n) {
    return null;
  }

  return {
    gasLimit,
    maxFeePerGas,
    maxPriorityFeePerGas: 0n,
    estimatedCost: gasLimit * maxFeePerGas,
  };
}

/**
 * Compare gas prices (returns -1, 0, or 1)
 */
export function compareGasPrice(a: bigint, b: bigint): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Get time estimate label for gas speed
 */
export function getSpeedTimeEstimate(speed: GasSpeed): string {
  const estimates: Record<GasSpeed, string> = {
    slow: '~5 min',
    standard: '~1 min',
    fast: '~30 sec',
    instant: '~15 sec',
  };
  return estimates[speed];
}

/**
 * Calculate priority fee from percentile
 */
export function calculatePriorityFee(
  recentPriorityFees: bigint[],
  percentile: number = 50
): bigint {
  if (recentPriorityFees.length === 0) {
    return gweiToWei(2); // Default 2 Gwei
  }

  const sorted = [...recentPriorityFees].sort((a, b) => 
    Number(a - b)
  );

  const index = Math.floor((percentile / 100) * sorted.length);
  return sorted[Math.min(index, sorted.length - 1)];
}

