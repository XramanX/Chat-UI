import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface UseVirtualListOptions<T> {
  items: T[];
  rowHeight: number;
  overscan?: number;
}

export interface UseVirtualListResult<T> {
  startIndex: number;
  endIndex: number;
  visibleItems: T[];
  topSpacer: number;
  bottomSpacer: number;
  onScroll: (scrollTop: number) => void;
  measureViewport: (height: number) => void;
}

export default function useVirtualList<T>({
  items,
  rowHeight,
  overscan = 5,
}: UseVirtualListOptions<T>): UseVirtualListResult<T> {
  const totalCount = items.length;
  const totalHeight = totalCount * rowHeight;

  const [viewportHeight, setViewportHeight] = useState(400);
  const [range, setRange] = useState({ start: 0, end: 10 });

  const scrollRef = useRef<number>(0);
  const frame = useRef<number | null>(null);

  const recalc = useCallback(() => {
    const st = scrollRef.current;
    const start = Math.max(0, Math.floor(st / rowHeight) - overscan);
    const end = Math.min(
      totalCount,
      Math.ceil((st + viewportHeight) / rowHeight) + overscan
    );
    setRange((prev) => {
      if (prev.start === start && prev.end === end) return prev;
      return { start, end };
    });
  }, [rowHeight, overscan, totalCount, viewportHeight]);

  const onScroll = useCallback(
    (st: number) => {
      scrollRef.current = st;
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
      }
      frame.current = requestAnimationFrame(() => {
        recalc();
        frame.current = null;
      });
    },
    [recalc]
  );

  const measureViewport = useCallback(
    (h: number) => {
      if (Math.abs(h - viewportHeight) > 2) {
        setViewportHeight(h);
        if (frame.current != null) cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          recalc();
          frame.current = null;
        });
      }
    },
    [viewportHeight, recalc]
  );

  const visibleItems = useMemo(
    () => items.slice(range.start, range.end),
    [items, range]
  );

  const topSpacer = range.start * rowHeight;
  const bottomSpacer = Math.max(
    0,
    totalHeight - topSpacer - visibleItems.length * rowHeight
  );

  // cleaning up on unmount
  useEffect(() => {
    return () => {
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, []);

  return {
    startIndex: range.start,
    endIndex: range.end,
    visibleItems,
    topSpacer,
    bottomSpacer,
    onScroll,
    measureViewport,
  };
}
