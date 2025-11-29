/**
 * LazyImage Component
 * Optimized image loading with lazy loading and placeholder
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * Generate placeholder gradient
 */
function generatePlaceholder(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 20%, 30%), hsl(${(hue + 60) % 360}, 20%, 20%))`;
}

/**
 * Lazy loaded image component with intersection observer
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  blurDataURL,
  onLoad,
  onError,
  priority = false,
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate placeholder if not provided
  const placeholderStyle = useMemo(() => {
    if (blurDataURL) {
      return { backgroundImage: `url(${blurDataURL})` };
    }
    if (placeholder) {
      return { backgroundImage: `url(${placeholder})` };
    }
    return { background: generatePlaceholder(src) };
  }, [src, placeholder, blurDataURL]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const objectFitClass = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }[objectFit];

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      <div
        className={`
          absolute inset-0 
          transition-opacity duration-300
          ${isLoaded ? 'opacity-0' : 'opacity-100'}
        `}
        style={placeholderStyle}
      />

      {/* Actual image */}
      {(isInView || priority) && !hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`
            w-full h-full 
            ${objectFitClass}
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
          <span className="text-foreground/50 text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;

