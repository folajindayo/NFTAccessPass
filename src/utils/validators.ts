import { isAddress } from 'viem';

export const isValidAddress = (address: string): boolean => {
  return isAddress(address);
};

