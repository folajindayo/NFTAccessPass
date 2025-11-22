import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState('');

  const checkAccess = async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/check?address=${address}`);
      const data = await res.json();
      setHasAccess(data.hasAccess);
    } catch (error) {
      console.error(error);
    }
  };

  const mintPass = async () => {
    if (!address) return;
    setLoading(true);
    setMessage('Minting...');
    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Minted successfully! Checking access...');
        await checkAccess();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Minting failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkAccess();
    } else {
      setHasAccess(false);
      setMessage('');
    }
  }, [isConnected, address]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">NFT Access Pass</h1>
      
      <div className="mb-8">
        <ConnectButton />
      </div>

      {isConnected ? (
        <div className="flex flex-col items-center gap-4">
          {hasAccess ? (
            <div className="p-6 bg-green-800 rounded-xl border border-green-600">
              <h2 className="text-2xl font-bold">Access Granted ✅</h2>
              <p>You hold the NFT Access Pass.</p>
            </div>
          ) : (
            <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 flex flex-col items-center gap-4">
              <h2 className="text-xl">No Access Pass Found</h2>
              <button
                onClick={mintPass}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Minting...' : 'Mint Access Pass'}
              </button>
            </div>
          )}
          {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
        </div>
      ) : (
        <p className="text-gray-400">Connect your wallet to check access.</p>
      )}
    </main>
  );
}
