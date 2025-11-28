import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Layout from '@/components/layout/Layout';

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890123456789012345678901234567890',
    isConnected: true,
  }),
}));

describe('Layout', () => {
  it('renders children', () => {
    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('displays app title', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByText(/NFT Access Pass/i)).toBeInTheDocument();
  });

  it('includes wallet connect in header', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByText(/0x1234\.\.\.7890/)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Layout className="custom-layout">
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByTestId('layout')).toHaveClass('custom-layout');
  });

  it('renders without header when hideHeader is true', () => {
    render(
      <Layout hideHeader>
        <div>Content</div>
      </Layout>
    );
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('renders without footer when hideFooter is true', () => {
    render(
      <Layout hideFooter>
        <div>Content</div>
      </Layout>
    );
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('renders with full width when fullWidth is true', () => {
    render(
      <Layout fullWidth>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByRole('main')).not.toHaveClass('max-w-7xl');
  });

  it('renders with centered content by default', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByRole('main')).toHaveClass('max-w-7xl', 'mx-auto');
  });

  it('renders with custom title', () => {
    render(
      <Layout title="Custom Title">
        <div>Content</div>
      </Layout>
    );
    expect(document.title).toBe('Custom Title | NFT Access Pass');
  });

  it('renders skip link for accessibility', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByText(/skip to.*content/i)).toBeInTheDocument();
  });

  it('renders with background pattern', () => {
    render(
      <Layout showBackground>
        <div>Content</div>
      </Layout>
    );
    expect(screen.getByTestId('background-pattern')).toBeInTheDocument();
  });
});

