/**
 * Props for the AccessCard component.
 */
export interface AccessCardProps {
  /** Whether the user's wallet is connected */
  isConnected: boolean;
  /** Whether the user holds the required NFT */
  hasAccess: boolean;
  /** Loading state for checking access or minting */
  loading: boolean;
  /** Status or error message to display */
  message: string;
  /** Callback function to trigger minting */
  onMint: () => void;
}


