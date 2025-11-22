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

export interface AccessCardProps {
  isConnected: boolean;
  hasAccess: boolean;
  loading: boolean;
  message: string;
  onMint: () => void;
}

