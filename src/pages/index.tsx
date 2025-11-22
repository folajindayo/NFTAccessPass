import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      checkAccess(address);
    } else {
      setHasAccess(null);
      setMessage('');
    }
  }, [isConnected, address]);

  const checkAccess = async (addr: string) => {
    try {
      const res = await fetch(`/api/check?address=${addr}`);
      const data = await res.json();
      setHasAccess(data.hasAccess);
    } catch (error) {
      console.error("Check access error:", error);
    }
  };

  const mintAccessPass = async () => {
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
      
      if (res.ok) {
        setMessage(`Success! Tx: ${data.txHash}`);
        await checkAccess(address); // Refresh access status
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Minting failed unexpectedly.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <Head>
        <title>NFT Access Pass</title>
      </Head>

      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          NFT Access Pass
        </h1>

        <div className="flex justify-center mb-8">
          <ConnectButton />
        </div>

        {isConnected ? (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${hasAccess ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
              <h2 className="text-xl font-semibold mb-2 text-center">Access Status</h2>
              <p className="text-center text-lg">
                {hasAccess ? (
                  <span className="text-green-400 flex items-center justify-center gap-2">
                    ✅ Access Granted
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center justify-center gap-2">
                    ❌ No Access Pass
                  </span>
                )}
              </p>
            </div>

            {!hasAccess && (
              <button
                onClick={mintAccessPass}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition-all ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                }`}
              >
                {loading ? 'Minting...' : 'Mint Access Pass (Free)'}
              </button>
            )}

            {message && (
              <div className="mt-4 p-3 rounded bg-gray-700 text-sm break-words text-center">
                {message}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            Connect your wallet to check access or mint a pass.
          </p>
        )}
      </div>
    </div>
  );
}
