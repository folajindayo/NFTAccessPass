import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AccessCard from '@/components/AccessCard';

// Mock hooks
vi.mock('@/hooks/useAccess', () => ({
  useAccess: (address?: string) => ({
    hasAccess: address === '0x1234567890123456789012345678901234567890',
    isLoading: false,
    error: null,
    checkAccess: vi.fn(),
  }),
}));

vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
}));

describe('AccessCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders card container', () => {
    render(<AccessCard />);
    expect(screen.getByTestId('access-card')).toBeInTheDocument();
  });

  it('displays access status title', () => {
    render(<AccessCard />);
    expect(screen.getByText(/access.*status/i)).toBeInTheDocument();
  });

  it('shows granted status when user has access', () => {
    render(<AccessCard />);
    expect(screen.getByText(/granted|unlocked/i)).toBeInTheDocument();
  });

  it('shows denied status when user does not have access', () => {
    vi.mock('@/hooks/useAccess', () => ({
      useAccess: () => ({
        hasAccess: false,
        isLoading: false,
        error: null,
        checkAccess: vi.fn(),
      }),
    }));

    render(<AccessCard />);
    expect(screen.getByText(/denied|locked/i)).toBeInTheDocument();
  });

  it('displays wallet address', () => {
    render(<AccessCard />);
    expect(screen.getByText(/0x1234\.\.\.7890/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mock('@/hooks/useAccess', () => ({
      useAccess: () => ({
        hasAccess: false,
        isLoading: true,
        error: null,
        checkAccess: vi.fn(),
      }),
    }));

    render(<AccessCard />);
    expect(screen.getByTestId('access-loading')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mock('@/hooks/useAccess', () => ({
      useAccess: () => ({
        hasAccess: false,
        isLoading: false,
        error: new Error('Failed to check'),
        checkAccess: vi.fn(),
      }),
    }));

    render(<AccessCard />);
    expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
  });

  it('displays refresh button', () => {
    render(<AccessCard />);
    expect(screen.getByRole('button', { name: /refresh|check/i })).toBeInTheDocument();
  });

  it('handles refresh click', async () => {
    const user = userEvent.setup();
    const checkAccess = vi.fn();

    vi.mock('@/hooks/useAccess', () => ({
      useAccess: () => ({
        hasAccess: true,
        isLoading: false,
        error: null,
        checkAccess,
      }),
    }));

    render(<AccessCard />);
    await user.click(screen.getByRole('button', { name: /refresh|check/i }));
    
    expect(checkAccess).toHaveBeenCalled();
  });

  it('displays connect prompt when not connected', () => {
    vi.mock('wagmi', () => ({
      useAccount: () => ({
        address: null,
        isConnected: false,
      }),
    }));

    render(<AccessCard />);
    expect(screen.getByText(/connect.*wallet/i)).toBeInTheDocument();
  });

  it('shows NFT badge when user has access', () => {
    render(<AccessCard />);
    expect(screen.getByTestId('nft-badge')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<AccessCard className="custom-class" />);
    expect(screen.getByTestId('access-card')).toHaveClass('custom-class');
  });

  it('displays lock icon when access denied', () => {
    vi.mock('@/hooks/useAccess', () => ({
      useAccess: () => ({
        hasAccess: false,
        isLoading: false,
        error: null,
        checkAccess: vi.fn(),
      }),
    }));

    render(<AccessCard />);
    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
  });

  it('displays unlock icon when access granted', () => {
    render(<AccessCard />);
    expect(screen.getByTestId('unlock-icon')).toBeInTheDocument();
  });
});

