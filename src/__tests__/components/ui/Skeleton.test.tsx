import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonCircle, 
  SkeletonCard 
} from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('renders with custom width and height', () => {
    render(<Skeleton width="200px" height="50px" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });

  it('renders with rounded corners', () => {
    render(<Skeleton rounded />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders with custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('renders as circle variant', () => {
    render(<Skeleton variant="circle" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders as text variant', () => {
    render(<Skeleton variant="text" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded');
  });

  it('renders as rectangular variant', () => {
    render(<Skeleton variant="rectangular" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-lg');
  });
});

describe('SkeletonText', () => {
  it('renders multiple lines', () => {
    render(<SkeletonText lines={3} />);
    const lines = screen.getAllByTestId('skeleton-line');
    expect(lines).toHaveLength(3);
  });

  it('renders with default of 3 lines', () => {
    render(<SkeletonText />);
    const lines = screen.getAllByTestId('skeleton-line');
    expect(lines).toHaveLength(3);
  });

  it('applies spacing between lines', () => {
    const { container } = render(<SkeletonText lines={2} spacing={4} />);
    expect(container.firstChild).toHaveClass('space-y-4');
  });

  it('renders last line shorter', () => {
    render(<SkeletonText lines={3} />);
    const lines = screen.getAllByTestId('skeleton-line');
    const lastLine = lines[lines.length - 1];
    expect(lastLine).toHaveClass('w-3/4');
  });
});

describe('SkeletonCircle', () => {
  it('renders as circle', () => {
    render(<SkeletonCircle />);
    const circle = screen.getByTestId('skeleton-circle');
    expect(circle).toHaveClass('rounded-full');
  });

  it('renders with default size', () => {
    render(<SkeletonCircle />);
    const circle = screen.getByTestId('skeleton-circle');
    expect(circle).toHaveClass('w-10', 'h-10');
  });

  it('renders with custom size', () => {
    render(<SkeletonCircle size={60} />);
    const circle = screen.getByTestId('skeleton-circle');
    expect(circle).toHaveStyle({ width: '60px', height: '60px' });
  });
});

describe('SkeletonCard', () => {
  it('renders card skeleton with all parts', () => {
    render(<SkeletonCard />);
    
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-card-image')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-card-title')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-card-content')).toBeInTheDocument();
  });

  it('renders without image when showImage is false', () => {
    render(<SkeletonCard showImage={false} />);
    
    expect(screen.queryByTestId('skeleton-card-image')).not.toBeInTheDocument();
  });

  it('renders with custom number of content lines', () => {
    render(<SkeletonCard contentLines={5} />);
    
    const content = screen.getByTestId('skeleton-card-content');
    const lines = content.querySelectorAll('[data-testid="skeleton-line"]');
    expect(lines).toHaveLength(5);
  });

  it('applies custom className', () => {
    render(<SkeletonCard className="custom-card-skeleton" />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toHaveClass('custom-card-skeleton');
  });
});

