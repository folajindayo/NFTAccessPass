/**
 * MintProgress Component
 * Display minting transaction progress with states
 */

import React, { useMemo } from 'react';

export type MintStage = 
  | 'idle'
  | 'approving'
  | 'approved'
  | 'minting'
  | 'confirming'
  | 'success'
  | 'error';

export interface MintProgressProps {
  stage: MintStage;
  transactionHash?: string;
  tokenId?: string;
  error?: string;
  estimatedTime?: number;
  blockConfirmations?: number;
  requiredConfirmations?: number;
  onRetry?: () => void;
  onViewTransaction?: () => void;
  className?: string;
}

interface StageInfo {
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const MintProgress: React.FC<MintProgressProps> = ({
  stage,
  transactionHash,
  tokenId,
  error,
  estimatedTime,
  blockConfirmations = 0,
  requiredConfirmations = 1,
  onRetry,
  onViewTransaction,
  className = '',
}) => {
  const stages: Record<MintStage, StageInfo> = useMemo(() => ({
    idle: {
      label: 'Ready to Mint',
      description: 'Click mint to begin',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
    },
    approving: {
      label: 'Requesting Approval',
      description: 'Please confirm in your wallet',
      icon: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
    },
    approved: {
      label: 'Approved',
      description: 'Proceeding to mint',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    minting: {
      label: 'Minting NFT',
      description: 'Transaction submitted',
      icon: (
        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    confirming: {
      label: 'Confirming',
      description: `${blockConfirmations}/${requiredConfirmations} confirmations`,
      icon: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ),
    },
    success: {
      label: 'Mint Complete!',
      description: tokenId ? `Token ID: #${tokenId}` : 'NFT minted successfully',
      icon: (
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    error: {
      label: 'Mint Failed',
      description: error || 'An error occurred',
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }), [blockConfirmations, requiredConfirmations, tokenId, error]);

  const currentStage = stages[stage];
  const stageOrder: MintStage[] = ['idle', 'approving', 'approved', 'minting', 'confirming', 'success'];
  const currentIndex = stageOrder.indexOf(stage);

  const getStageStatus = (index: number) => {
    if (stage === 'error') return index === 0 ? 'error' : 'pending';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl ${className}`}>
      {/* Main Status */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-full ${
          stage === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
          stage === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
          'bg-indigo-100 dark:bg-indigo-900/30'
        }`}>
          {currentStage.icon}
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${
            stage === 'success' ? 'text-green-600 dark:text-green-400' :
            stage === 'error' ? 'text-red-600 dark:text-red-400' :
            'text-gray-900 dark:text-white'
          }`}>
            {currentStage.label}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentStage.description}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative mb-6">
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700" />
        <div 
          className="absolute top-4 left-4 h-0.5 bg-indigo-600 transition-all duration-500"
          style={{ 
            width: `${Math.max(0, (currentIndex / (stageOrder.length - 1)) * 100)}%`,
            opacity: stage === 'error' ? 0.5 : 1,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {stageOrder.filter(s => s !== 'approved').map((s, index) => {
            const status = getStageStatus(stageOrder.indexOf(s));
            return (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  status === 'completed' ? 'bg-indigo-600 text-white' :
                  status === 'active' ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900' :
                  status === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {s === 'idle' ? 'Start' : s}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Hash */}
      {transactionHash && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaction Hash</p>
          <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
            {transactionHash}
          </p>
        </div>
      )}

      {/* Estimated Time */}
      {estimatedTime && stage !== 'success' && stage !== 'error' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Estimated time: ~{estimatedTime} seconds
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {stage === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        )}
        {transactionHash && onViewTransaction && (
          <button
            onClick={onViewTransaction}
            className="flex-1 py-2 px-4 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            View on Explorer
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(MintProgress);
