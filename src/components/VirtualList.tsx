/**
 * VirtualList Component
 * Virtualized list for rendering large datasets efficiently
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  windowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

/**
 * Calculate visible range
 */
function getVisibleRange(
  scrollTop: number,
  windowHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(windowHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + 2 * overscan);
  
  return { start, end };
}

/**
 * Virtualized list component
 */
export function VirtualList<T>({
  items,
  itemHeight,
  windowHeight,
  renderItem,
  overscan = 3,
  className = '',
  keyExtractor,
  onEndReached,
  endReachedThreshold = 100,
}: VirtualListProps<T>): React.ReactElement {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCalledEndReached = useRef(false);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const { start, end } = useMemo(
    () => getVisibleRange(scrollTop, windowHeight, itemHeight, items.length, overscan),
    [scrollTop, windowHeight, itemHeight, items.length, overscan]
  );

  // Get visible items
  const visibleItems = useMemo(
    () => items.slice(start, end),
    [items, start, end]
  );

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop: newScrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setScrollTop(newScrollTop);

    // Check if end reached
    if (onEndReached) {
      const distanceToEnd = scrollHeight - scrollTop - clientHeight;
      
      if (distanceToEnd < endReachedThreshold && !hasCalledEndReached.current) {
        hasCalledEndReached.current = true;
        onEndReached();
      } else if (distanceToEnd >= endReachedThreshold) {
        hasCalledEndReached.current = false;
      }
    }
  }, [onEndReached, endReachedThreshold, scrollTop]);

  // Default key extractor
  const getKey = useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      return String(start + index);
    },
    [keyExtractor, start]
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: windowHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = start + index;
          const key = getKey(item, actualIndex);
          
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                left: 0,
                right: 0,
                height: itemHeight,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Virtual grid component for 2D virtualization
 */
export interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 0,
  className = '',
}: VirtualGridProps<T>): React.ReactElement {
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate columns
  const columns = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rows = Math.ceil(items.length / columns);
  const totalHeight = rows * (itemHeight + gap) - gap;

  // Calculate visible rows
  const startRow = Math.floor(scrollTop / (itemHeight + gap));
  const endRow = Math.min(rows, startRow + Math.ceil(containerHeight / (itemHeight + gap)) + 1);
  
  // Get visible items
  const visibleItems = useMemo(() => {
    const result: Array<{ item: T; index: number; row: number; col: number }> = [];
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          result.push({ item: items[index], index, row, col });
        }
      }
    }
    
    return result;
  }, [items, startRow, endRow, columns]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * (itemHeight + gap),
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;

