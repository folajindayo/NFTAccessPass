export interface AccessCardProps {
  isConnected: boolean;
  hasAccess: boolean;
  loading: boolean;
  message: string;
  onMint: () => void;
}

