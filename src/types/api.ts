export interface MintResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

export interface CheckResponse {
  hasAccess: boolean;
  balance?: string;
  error?: string;
}

