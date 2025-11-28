import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Avatar, AvatarGroup } from '@/components/ui/Avatar';

describe('Avatar', () => {
  it('renders with default props', () => {
    render(<Avatar />);
    const avatar = screen.getByRole('img', { hidden: true });
    expect(avatar).toBeInTheDocument();
  });

  it('renders with src and alt', () => {
    render(<Avatar src="/test.jpg" alt="Test User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test User');
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<Avatar size="xs" />);
    expect(container.firstChild).toHaveClass('w-6');

    rerender(<Avatar size="sm" />);
    expect(container.firstChild).toHaveClass('w-8');

    rerender(<Avatar size="md" />);
    expect(container.firstChild).toHaveClass('w-10');

    rerender(<Avatar size="lg" />);
    expect(container.firstChild).toHaveClass('w-12');

    rerender(<Avatar size="xl" />);
    expect(container.firstChild).toHaveClass('w-16');
  });

  it('renders with different shapes', () => {
    const { rerender, container } = render(<Avatar shape="circle" />);
    expect(container.firstChild).toHaveClass('rounded-full');

    rerender(<Avatar shape="square" />);
    expect(container.firstChild).toHaveClass('rounded-lg');
  });

  it('renders fallback text when no src provided', () => {
    render(<Avatar fallbackText="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders online status indicator', () => {
    const { container } = render(<Avatar showStatus status="online" />);
    const statusIndicator = container.querySelector('.bg-green-500');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('renders offline status indicator', () => {
    const { container } = render(<Avatar showStatus status="offline" />);
    const statusIndicator = container.querySelector('.bg-gray-400');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('renders busy status indicator', () => {
    const { container } = render(<Avatar showStatus status="busy" />);
    const statusIndicator = container.querySelector('.bg-red-500');
    expect(statusIndicator).toBeInTheDocument();
  });

  it('handles image error and shows fallback', async () => {
    render(<Avatar src="/broken.jpg" fallbackText="FB" />);
    const img = screen.getByRole('img');
    
    fireEvent.error(img);
    
    await waitFor(() => {
      expect(screen.getByText('FB')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('AvatarGroup', () => {
  const avatars = [
    { src: '/user1.jpg', alt: 'User 1' },
    { src: '/user2.jpg', alt: 'User 2' },
    { src: '/user3.jpg', alt: 'User 3' },
    { src: '/user4.jpg', alt: 'User 4' },
  ];

  it('renders multiple avatars', () => {
    render(<AvatarGroup avatars={avatars} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
  });

  it('limits avatars and shows overflow count', () => {
    render(<AvatarGroup avatars={avatars} max={2} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('applies custom spacing', () => {
    const { container } = render(<AvatarGroup avatars={avatars} spacing={-4} />);
    const avatarElements = container.querySelectorAll('[class*="rounded"]');
    expect(avatarElements.length).toBeGreaterThan(0);
  });
});

