import { useState, useCallback } from 'react';

export type TransactionState = 
  | 'idle'
  | 'preparing'
  | 'awaiting_signature'
  | 'pending'
  | 'success'
  | 'error';

export interface ContractWriteConfig {
  address: string;
  abi: readonly unknown[];
  functionName: string;
  chainId?: number;
}

export interface WriteOptions {
  args?: unknown[];
  value?: bigint;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

export interface TransactionResult {
  hash: string;
  chainId: number;
  from: string;
  to: string;
  value: bigint;
  gasLimit: bigint;
}

export interface ContractWriteResult {
  state: TransactionState;
  hash: string | null;
  transaction: TransactionResult | null;
  loading: boolean;
  error: Error | null;
  write: (options?: WriteOptions) => Promise<TransactionResult | null>;
  writeAsync: (options?: WriteOptions) => Promise<TransactionResult>;
  reset: () => void;
}

/**
 * Generic hook for writing to a smart contract.
 * Handles transaction lifecycle from preparation to confirmation.
 */
export function useContractWrite({
  address,
  abi,
  functionName,
  chainId = 1,
}: ContractWriteConfig): ContractWriteResult {
  const [state, setState] = useState<TransactionState>('idle');
  const [hash, setHash] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setHash(null);
    setTransaction(null);
    setError(null);
  }, []);

  const writeAsync = useCallback(async (options: WriteOptions = {}): Promise<TransactionResult> => {
    setState('preparing');
    setError(null);

    try {
      // Prepare transaction
      const preparedTx = await prepareTransaction({
        address,
        abi,
        functionName,
        chainId,
        ...options,
      });

      setState('awaiting_signature');

      // Request signature from wallet
      const signedTx = await signTransaction(preparedTx);

      setState('pending');
      setHash(signedTx.hash);

      // Wait for transaction to be mined
      const receipt = await waitForTransaction(signedTx.hash, chainId);

      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted');
      }

      const result: TransactionResult = {
        hash: signedTx.hash,
        chainId,
        from: signedTx.from,
        to: address,
        value: options.value || 0n,
        gasLimit: options.gasLimit || 0n,
      };

      setTransaction(result);
      setState('success');

      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Transaction failed');
      setError(errorObj);
      setState('error');
      throw errorObj;
    }
  }, [address, abi, functionName, chainId]);

  const write = useCallback(async (options?: WriteOptions): Promise<TransactionResult | null> => {
    try {
      return await writeAsync(options);
    } catch {
      return null;
    }
  }, [writeAsync]);

  return {
    state,
    hash,
    transaction,
    loading: state === 'preparing' || state === 'awaiting_signature' || state === 'pending',
    error,
    write,
    writeAsync,
    reset,
  };
}

interface PrepareTransactionParams {
  address: string;
  abi: readonly unknown[];
  functionName: string;
  chainId: number;
  args?: unknown[];
  value?: bigint;
  gasLimit?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

interface PreparedTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit: string;
  chainId: number;
}

async function prepareTransaction(params: PrepareTransactionParams): Promise<PreparedTransaction> {
  const response = await fetch('/api/contract/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      value: params.value?.toString(),
      gasLimit: params.gasLimit?.toString(),
      maxFeePerGas: params.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: params.maxPriorityFeePerGas?.toString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to prepare transaction');
  }

  return response.json();
}

interface SignedTransaction {
  hash: string;
  from: string;
}

async function signTransaction(preparedTx: PreparedTransaction): Promise<SignedTransaction> {
  if (typeof window === 'undefined') {
    throw new Error('No window object');
  }

  const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  if (!ethereum) {
    throw new Error('No wallet provider found');
  }

  const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
  if (accounts.length === 0) {
    throw new Error('No account connected');
  }

  const hash = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: accounts[0],
      to: preparedTx.to,
      data: preparedTx.data,
      value: preparedTx.value,
      gas: preparedTx.gasLimit,
    }],
  }) as string;

  return { hash, from: accounts[0] };
}

interface TransactionReceipt {
  status: 'success' | 'reverted';
  blockNumber: number;
}

async function waitForTransaction(hash: string, chainId: number): Promise<TransactionReceipt> {
  const maxAttempts = 60;
  const interval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `/api/transaction/receipt?hash=${hash}&chainId=${chainId}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.receipt) {
        return {
          status: data.receipt.status === 1 ? 'success' : 'reverted',
          blockNumber: data.receipt.blockNumber,
        };
      }
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Transaction confirmation timeout');
}

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export default useContractWrite;

