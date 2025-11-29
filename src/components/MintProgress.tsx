import React from 'react';

import { CheckIcon } from './icons/CheckIcon';
import { LoadingIcon } from './icons/LoadingIcon';
import { XIcon } from './icons/XIcon';

export type MintStep = 
  | 'idle'
  | 'approval'
  | 'confirming'
  | 'pending'
  | 'success'
  | 'error';

export interface MintStepInfo {
  id: MintStep;
  label: string;
  description?: string;
}

export interface MintProgressProps {
  currentStep: MintStep;
  txHash?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onViewTransaction?: (hash: string) => void;
  className?: string;
}

const steps: MintStepInfo[] = [
  { id: 'approval', label: 'Wallet Approval', description: 'Confirm transaction in your wallet' },
  { id: 'confirming', label: 'Confirming', description: 'Transaction is being confirmed' },
  { id: 'pending', label: 'Processing', description: 'Waiting for blockchain confirmation' },
  { id: 'success', label: 'Complete', description: 'NFT successfully minted!' },
];

const stepOrder: Record<MintStep, number> = {
  idle: -1,
  approval: 0,
  confirming: 1,
  pending: 2,
  success: 3,
  error: -1,
};

/**
 * MintProgress displays a stepper showing the current state of an NFT minting transaction.
 * Shows progress through wallet approval, confirmation, and completion states.
 */
export const MintProgress: React.FC<MintProgressProps> = ({
  currentStep,
  txHash,
  errorMessage,
  onRetry,
  onViewTransaction,
  className = '',
}) => {
  const currentStepIndex = stepOrder[currentStep];
  const isError = currentStep === 'error';
  const isIdle = currentStep === 'idle';

  const getStepStatus = (stepIndex: number): 'complete' | 'current' | 'pending' => {
    if (isError) return 'pending';
    if (stepIndex < currentStepIndex) return 'complete';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const formatTxHash = (hash: string): string => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  if (isIdle) {
    return null;
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {isError ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <XIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-800 dark:text-red-200">
                Transaction Failed
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errorMessage || 'An error occurred during the minting process'}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-3 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="relative flex items-start pb-8 last:pb-0">
                  {!isLast && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-full -ml-px ${
                        status === 'complete' 
                          ? 'bg-green-500' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                  
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        status === 'complete'
                          ? 'bg-green-500 text-white'
                          : status === 'current'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {status === 'complete' ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : status === 'current' ? (
                        <LoadingIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        status === 'complete'
                          ? 'text-green-600 dark:text-green-400'
                          : status === 'current'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {txHash && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Transaction Hash
              </p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {formatTxHash(txHash)}
                </code>
                {onViewTransaction && (
                  <button
                    onClick={() => onViewTransaction(txHash)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View on Explorer
                  </button>
                )}
              </div>
            </div>
          )}

          {currentStep === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Minting Complete!
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your NFT Access Pass has been minted successfully
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MintProgress;

