import React, { useCallback, useEffect, useRef } from "react";
import useVirtualList from "../../../hooks/useVirtualList";

type VirtualListProps<T> = {
  items: T[];
  rowHeight: number;
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
  hasMore?: boolean;
  isLoading?: boolean;
  loadMore?: () => Promise<void> | void;
  renderItem: (
    item: T,
    index: number,
    style: React.CSSProperties
  ) => React.ReactNode;
  loadingPlaceholder?: React.ReactNode;
};

export default function VirtualList<T>(props: VirtualListProps<T>) {
  const {
    items,
    rowHeight,
    overscan,
    className,
    style,
    hasMore = false,
    isLoading = false,
    loadMore,
    renderItem,
    loadingPlaceholder,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    visibleItems,
    topSpacer,
    bottomSpacer,
    onScroll,
    measureViewport,
    startIndex,
  } = useVirtualList<T>({ items, rowHeight, overscan });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureViewport(el.clientHeight));
    ro.observe(el);
    measureViewport(el.clientHeight);
    return () => ro.disconnect();
  }, [measureViewport]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    const onLocalScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => onScroll(el.scrollTop));
    };
    el.addEventListener("scroll", onLocalScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onLocalScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onScroll]);

  useEffect(() => {
    if (!hasMore || !loadMore) return;
    const sentinel = sentinelRef.current;
    const root = containerRef.current;
    if (!sentinel || !root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // call loadMore; user should guard with isLoading
            loadMore();
            break;
          }
        }
      },
      { root, threshold: 0.1 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflowY: "auto", height: "100%", minHeight: 0, ...style }}
    >
      <div style={{ height: topSpacer }} />

      {visibleItems.map((it, i) => {
        const index = startIndex + i;
        const itemStyle: React.CSSProperties = { height: rowHeight };
        return (
          <div
            key={index}
            style={itemStyle}
            role="listitem"
            aria-posinset={index + 1}
          >
            {renderItem(it, index, itemStyle)}
          </div>
        );
      })}

      <div style={{ height: bottomSpacer }} />

      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}

      {isLoading && (
        <div style={{ padding: 12, textAlign: "center" }}>
          {loadingPlaceholder ?? "Loading..."}
        </div>
      )}
    </div>
  );
}
