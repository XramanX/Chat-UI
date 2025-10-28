import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createChat,
  appendChat,
  deleteChat,
  setActive,
} from "../../store/chatSlice";
import NewChatModal from "../common/Modal/NewChatModal";
import ConfirmModal from "../common/Modal/ConfirmModal";
import type { Chat } from "../../types";
import { sampleChats } from "../../api/stub";
import useVirtualList from "../../hooks/useVirtualList";
import useDebounce from "../../hooks/useDebounce";
import "./ChatList.scss";

const ROW_HEIGHT = 72;
const LOAD_BATCH = 12;
const MAX_ITEMS = 4000;

const ChatRow = React.memo(function ChatRow({
  chat,
  active,
  onPick,
  onDelete,
  style,
}: {
  chat: Chat;
  active: boolean;
  onPick: (id: string) => void;
  onDelete: (c: Chat) => void;
  style?: React.CSSProperties;
}) {
  const preview = chat.messages.slice(-1)[0]?.content ?? "No messages";
  return (
    <li
      role="listitem"
      className={`chat-row ${active ? "active" : ""}`}
      onClick={() => onPick(chat.id)}
      tabIndex={0}
      style={style}
    >
      <div className="meta">
        <div className="title">{chat.title}</div>
        <div className="preview">{preview}</div>
      </div>
      <button
        className="del"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(chat);
        }}
        aria-label={`Delete ${chat.title}`}
        title="Delete chat"
      >
        <FiTrash2 size={16} />
      </button>
    </li>
  );
});

export default function ChatList({ onNavigate }: { onNavigate?: () => void }) {
  const chats = useAppSelector((s) => s.chat.chats);
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);
  const dispatch = useAppDispatch();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchIconRef = useRef<HTMLDivElement | null>(null);

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Chat | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 250);
  const [searchAnchor, setSearchAnchor] = useState<DOMRect | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const loadingRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const autoScrollRef = useRef(false);

  const filteredChats = useMemo(() => {
    if (!debouncedQuery) return chats;
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return chats;
    return chats.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [chats, debouncedQuery]);

  const itemsForVirtual = filteredChats;

  const { visibleItems, topSpacer, bottomSpacer, onScroll, measureViewport } =
    useVirtualList<Chat>({
      items: itemsForVirtual,
      rowHeight: ROW_HEIGHT,
      overscan: 6,
    });

  useEffect(() => {
    if (debouncedQuery && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [debouncedQuery]);

  const measureAnchor = useCallback(() => {
    const el = searchIconRef.current;
    if (!el) return setSearchAnchor(null);
    const header = el.closest(".list-header") as HTMLElement | null;
    const rect = header
      ? header.getBoundingClientRect()
      : el.getBoundingClientRect();
    setSearchAnchor(rect);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      measureAnchor();
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 60);
    }
  }, [searchOpen, measureAnchor]);

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
      raf = requestAnimationFrame(() => {
        onScroll(el.scrollTop);
        if (!hasUserScrolledRef.current && el.scrollTop > 4) {
          hasUserScrolledRef.current = true;
        }
        if (autoScrollRef.current) {
          autoScrollRef.current = false;
        }
      });
    };
    el.addEventListener("scroll", onLocalScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onLocalScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onScroll]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    if (chats.length >= MAX_ITEMS) return;

    const root = containerRef.current;
    const BOTTOM_THRESHOLD = 48;
    const wasAtBottom =
      !!root &&
      root.scrollTop + root.clientHeight >=
        root.scrollHeight - BOTTOM_THRESHOLD;

    autoScrollRef.current = !!wasAtBottom;
    loadingRef.current = true;

    const batch = sampleChats(LOAD_BATCH).map((c) => {
      const suffix = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const newId = `${c.id}-${suffix}`;
      const messages = c.messages.map((m) => ({
        ...m,
        id: `${m.id}-${suffix}`,
        chatId: newId,
      }));
      return { ...c, id: newId, messages };
    });

    for (const c of batch) {
      dispatch(appendChat(c));
    }

    await new Promise((res) => setTimeout(res, 120));

    if (autoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }

    autoScrollRef.current = false;
    loadingRef.current = false;
  }, [dispatch, chats.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = containerRef.current;
    if (!sentinel || !root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;

          if (!hasUserScrolledRef.current) {
            const nearBottom =
              root.scrollTop + root.clientHeight >= root.scrollHeight - 2;
            if (!nearBottom) {
              return;
            }
          }

          obs.unobserve(sentinel);

          loadMore().finally(() => {
            setTimeout(() => {
              if (sentinel.isConnected && chats.length < MAX_ITEMS) {
                obs.observe(sentinel);
              }
            }, 140);
          });

          break;
        }
      },
      { root, threshold: 0.1 }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loadMore, chats.length]);

  const onPick = useCallback(
    (id: string) => {
      dispatch(setActive({ id }));
      onNavigate?.();
    },
    [dispatch, onNavigate]
  );

  const openNew = () => setNewChatOpen(true);
  const closeNew = () => setNewChatOpen(false);

  const askDelete = (c: Chat) => {
    setToDelete(c);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };

  const onCreate = (title: string) => {
    const id = "chat-" + Math.random().toString(36).slice(2, 9);
    dispatch(createChat({ id, title }));
    closeNew();
    onNavigate?.();
  };

  const onConfirmDelete = () => {
    if (!toDelete) return;
    dispatch(deleteChat({ id: toDelete.id }));
    closeConfirm();
  };

  const rowStyle: React.CSSProperties = {
    height: ROW_HEIGHT,
    boxSizing: "border-box",
    overflow: "hidden",
    flexShrink: 0,
  };

  useEffect(() => {
    const onDocClick = (e: Event) => {
      const target = e.target as Node | null;
      if (!target) return;
      const icon = searchIconRef.current;
      if (!icon) return;
      const header = icon.closest(".list-header") as HTMLElement | null;
      if (header && !header.contains(target)) setSearchOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="chat-list-panel" role="region" aria-label="Chat list">
      <div className="list-header">
        <div className="header-left">
          <h3>Chats</h3>
        </div>

        <div className="header-right">
          <div
            className="search-icon-wrap"
            ref={searchIconRef}
            onClick={() => {
              setSearchOpen((p) => !p);
              if (!searchOpen) measureAnchor();
            }}
          >
            <FiSearch className="search-icon" />
          </div>
          <button className="btn" onClick={openNew}>
            <FiPlus size={14} /> New
          </button>
        </div>
      </div>

      <div className="chat-list" ref={containerRef}>
        <div style={{ height: topSpacer, flex: "none" }} />

        {visibleItems.map((c) => (
          <ChatRow
            key={c.id}
            chat={c}
            active={c.id === activeChatId}
            onPick={onPick}
            onDelete={askDelete}
            style={rowStyle}
          />
        ))}

        <div style={{ height: bottomSpacer, flex: "none" }} />

        <div ref={sentinelRef} style={{ height: 1, width: "100%" }} />

        {loadingRef.current && <div className="loading-more">Loading...</div>}
      </div>

      {searchAnchor && (
        <div
          className={`search-overlay ${searchOpen ? "open" : ""}`}
          style={{
            top: searchAnchor.top + window.scrollY,
            left: searchAnchor.left + window.scrollX,
            width: searchAnchor.width,
            height: searchAnchor.height,
          }}
        >
          <div className="overlay-inner">
            <input
              ref={searchInputRef}
              autoFocus={searchOpen}
              className="overlay-input"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <NewChatModal
        isOpen={newChatOpen}
        onClose={closeNew}
        onCreate={onCreate}
      />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={closeConfirm}
        onConfirm={onConfirmDelete}
        title="Delete chat"
        description={
          toDelete ? `Delete "${toDelete.title}"? This cannot be undone.` : ""
        }
        confirmLabel="Delete"
      />
    </div>
  );
}
