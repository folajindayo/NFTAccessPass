import React, { useMemo } from 'react';

import { RefreshIcon } from './icons/RefreshIcon';
import { InfoIcon } from './icons/InfoIcon';

export type GasSpeed = 'slow' | 'standard' | 'fast' | 'instant';

export interface GasEstimateData {
  gasLimit: bigint;
  baseFee: bigint;
  maxPriorityFee: bigint;
  maxFee: bigint;
  estimatedCostWei: bigint;
  estimatedCostUsd?: number;
}

export interface GasOption {
  speed: GasSpeed;
  label: string;
  timeEstimate: string;
  multiplier: number;
}

export interface GasEstimateProps {
  estimate: GasEstimateData;
  selectedSpeed: GasSpeed;
  onSpeedChange: (speed: GasSpeed) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  nativeCurrency?: string;
  showDetails?: boolean;
  className?: string;
}

const gasOptions: GasOption[] = [
  { speed: 'slow', label: 'Slow', timeEstimate: '~10 min', multiplier: 0.8 },
  { speed: 'standard', label: 'Standard', timeEstimate: '~3 min', multiplier: 1.0 },
  { speed: 'fast', label: 'Fast', timeEstimate: '~1 min', multiplier: 1.2 },
  { speed: 'instant', label: 'Instant', timeEstimate: '~15 sec', multiplier: 1.5 },
];

const speedColors: Record<GasSpeed, string> = {
  slow: 'bg-green-500',
  standard: 'bg-blue-500',
  fast: 'bg-orange-500',
  instant: 'bg-red-500',
};

/**
 * GasEstimate displays transaction fee estimates with speed options.
 * Shows gas breakdown and allows users to select transaction priority.
 */
export const GasEstimate: React.FC<GasEstimateProps> = ({
  estimate,
  selectedSpeed,
  onSpeedChange,
  onRefresh,
  isRefreshing = false,
  nativeCurrency = 'ETH',
  showDetails = false,
  className = '',
}) => {
  const formatGwei = (wei: bigint): string => {
    const gwei = Number(wei) / 1e9;
    if (gwei < 0.01) return '<0.01';
    if (gwei < 1) return gwei.toFixed(2);
    if (gwei < 100) return gwei.toFixed(1);
    return Math.round(gwei).toString();
  };

  const formatEth = (wei: bigint): string => {
    const eth = Number(wei) / 1e18;
    if (eth < 0.00001) return '<0.00001';
    if (eth < 0.001) return eth.toFixed(6);
    if (eth < 0.1) return eth.toFixed(5);
    return eth.toFixed(4);
  };

  const formatUsd = (amount: number): string => {
    if (amount < 0.01) return '<$0.01';
    return `$${amount.toFixed(2)}`;
  };

  const selectedOption = gasOptions.find(o => o.speed === selectedSpeed) || gasOptions[1];

  const adjustedEstimate = useMemo(() => {
    const multiplier = BigInt(Math.floor(selectedOption.multiplier * 100));
    return {
      ...estimate,
      maxPriorityFee: (estimate.maxPriorityFee * multiplier) / 100n,
      maxFee: (estimate.maxFee * multiplier) / 100n,
      estimatedCostWei: (estimate.estimatedCostWei * multiplier) / 100n,
      estimatedCostUsd: estimate.estimatedCostUsd 
        ? estimate.estimatedCostUsd * selectedOption.multiplier 
        : undefined,
    };
  }, [estimate, selectedOption.multiplier]);

  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Gas Estimate</h3>
          <div className="group relative">
            <InfoIcon className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
              <p>Gas fees are paid to network validators to process your transaction. Higher fees result in faster confirmation times.</p>
            </div>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh gas estimate"
          >
            <RefreshIcon className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {gasOptions.map((option) => {
          const isSelected = option.speed === selectedSpeed;
          const optionCost = (estimate.estimatedCostWei * BigInt(Math.floor(option.multiplier * 100))) / 100n;

          return (
            <button
              key={option.speed}
              onClick={() => onSpeedChange(option.speed)}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className={`w-2 h-2 rounded-full ${speedColors[option.speed]} mx-auto mb-2`} />
              <p className={`text-xs font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>
                {option.label}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {option.timeEstimate}
              </p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-1">
                {formatEth(optionCost)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Estimated Fee
          </span>
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">
              {formatEth(adjustedEstimate.estimatedCostWei)} {nativeCurrency}
            </p>
            {adjustedEstimate.estimatedCostUsd && (
              <p className="text-sm text-gray-500">
                {formatUsd(adjustedEstimate.estimatedCostUsd)}
              </p>
            )}
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Gas Limit</span>
            <span className="font-mono text-gray-600 dark:text-gray-400">
              {estimate.gasLimit.toString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Base Fee</span>
            <span className="font-mono text-gray-600 dark:text-gray-400">
              {formatGwei(estimate.baseFee)} Gwei
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Max Priority Fee</span>
            <span className="font-mono text-gray-600 dark:text-gray-400">
              {formatGwei(adjustedEstimate.maxPriorityFee)} Gwei
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Max Fee</span>
            <span className="font-mono text-gray-600 dark:text-gray-400">
              {formatGwei(adjustedEstimate.maxFee)} Gwei
            </span>
          </div>
        </div>
      )}

      <p className="mt-3 text-[10px] text-gray-400 text-center">
        Actual fee may vary based on network conditions
      </p>
    </div>
  );
};

export default GasEstimate;

