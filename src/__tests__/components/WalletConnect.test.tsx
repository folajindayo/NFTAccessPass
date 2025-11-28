import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletConnect from '@/components/WalletConnect';

// Mock wagmi hooks
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: null,
    isConnected: false,
    isConnecting: false,
  }),
  useConnect: () => ({
    connect: mockConnect,
    connectors: [{ id: 'injected', name: 'MetaMask' }],
    isPending: false,
  }),
  useDisconnect: () => ({
    disconnect: mockDisconnect,
  }),
  useBalance: () => ({
    data: { formatted: '1.5', symbol: 'ETH' },
    isLoading: false,
  }),
}));

describe('WalletConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders connect button when not connected', () => {
    render(<WalletConnect />);
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument();
  });

  it('handles connect click', async () => {
    const user = userEvent.setup();
    render(<WalletConnect />);
    
    await user.click(screen.getByRole('button', { name: /connect/i }));
    
    expect(mockConnect).toHaveBeenCalled();
  });

  it('shows connecting state', () => {
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: null,
        isConnected: false,
        isConnecting: true,
      }),
      useConnect: () => ({
        connect: mockConnect,
        connectors: [],
        isPending: true,
      }),
      useDisconnect: () => ({
        disconnect: mockDisconnect,
      }),
    }));

    render(<WalletConnect />);
    expect(screen.getByText(/connecting/i)).toBeInTheDocument();
  });

  it('shows connected state with address', () => {
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
        isConnecting: false,
      }),
      useConnect: () => ({
        connect: mockConnect,
        connectors: [],
        isPending: false,
      }),
      useDisconnect: () => ({
        disconnect: mockDisconnect,
      }),
      useBalance: () => ({
        data: { formatted: '1.5', symbol: 'ETH' },
        isLoading: false,
      }),
    }));

    render(<WalletConnect />);
    expect(screen.getByText(/0x1234\.\.\.7890/)).toBeInTheDocument();
  });

  it('shows disconnect button when connected', () => {
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
        isConnecting: false,
      }),
      useConnect: () => ({
        connect: mockConnect,
        connectors: [],
        isPending: false,
      }),
      useDisconnect: () => ({
        disconnect: mockDisconnect,
      }),
    }));

    render(<WalletConnect />);
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument();
  });

  it('handles disconnect click', async () => {
    const user = userEvent.setup();
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
      }),
      useConnect: () => ({
        connect: mockConnect,
        connectors: [],
      }),
      useDisconnect: () => ({
        disconnect: mockDisconnect,
      }),
    }));

    render(<WalletConnect />);
    await user.click(screen.getByRole('button', { name: /disconnect/i }));
    
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('displays balance when connected', () => {
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
      }),
      useConnect: () => ({
        connect: mockConnect,
        connectors: [],
      }),
      useDisconnect: () => ({
        disconnect: mockDisconnect,
      }),
      useBalance: () => ({
        data: { formatted: '1.5', symbol: 'ETH' },
        isLoading: false,
      }),
    }));

    render(<WalletConnect />);
    expect(screen.getByText(/1\.5.*ETH/)).toBeInTheDocument();
  });

  it('shows wallet icon', () => {
    render(<WalletConnect />);
    expect(screen.getByTestId('wallet-icon')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    render(<WalletConnect variant="compact" />);
    expect(screen.getByTestId('wallet-connect')).toHaveClass('text-sm');
  });

  it('renders full variant with more details', () => {
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
      }),
      useConnect: () => ({
        connect: mockConnect,
        connectors: [],
      }),
      useDisconnect: () => ({
        disconnect: mockDisconnect,
      }),
      useBalance: () => ({
        data: { formatted: '1.5', symbol: 'ETH' },
        isLoading: false,
      }),
    }));

    render(<WalletConnect variant="full" />);
    expect(screen.getByText(/network/i)).toBeInTheDocument();
  });

  it('handles copy address click', async () => {
    const user = userEvent.setup();
    const mockClipboard = { writeText: vi.fn() };
    Object.assign(navigator, { clipboard: mockClipboard });

    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
      }),
      useConnect: () => ({
        connect: mockConnect,
        connectors: [],
      }),
      useDisconnect: () => ({
        disconnect: mockDisconnect,
      }),
    }));

    render(<WalletConnect />);
    await user.click(screen.getByRole('button', { name: /copy/i }));
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('0x1234567890123456789012345678901234567890');
  });
});

