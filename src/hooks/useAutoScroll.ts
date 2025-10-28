import { useEffect } from "react";
import type { RefObject } from "react";

export default function useAutoScroll(
  listRef: RefObject<HTMLElement | null>,
  deps: any[] = []
) {
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    // ensure DOM painted
    requestAnimationFrame(() => {
      try {
        // deterministic instant jump to bottom
        el.scrollTop = el.scrollHeight;
      } catch (e) {
        // ignore
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
