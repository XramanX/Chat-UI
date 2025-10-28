import { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import { useAppSelector } from "../../store/hooks";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import useAutoScroll from "../../hooks/useAutoScroll";
import { FiMenu } from "react-icons/fi";
import "./ChatWindow.scss";

export default function ChatWindow({
  onOpenList,
}: {
  onOpenList?: () => void;
}) {
  const chats = useAppSelector((s) => s.chat.chats);
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);
  const chat = useMemo(
    () => chats.find((c) => c.id === activeChatId),
    [chats, activeChatId]
  );

  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputWrapperRef = useRef<HTMLDivElement | null>(null);
  const [inputHeight, setInputHeight] = useState<number>(0);

  useAutoScroll(messagesRef, [
    chat?.messages.length,
    activeChatId,
    inputHeight,
  ]);

  useLayoutEffect(() => {
    const msgs = messagesRef.current;
    const inputWrap = inputWrapperRef.current;
    if (!msgs || !inputWrap) return;

    const msgsEl = msgs as HTMLDivElement;
    const inputWrapEl = inputWrap as HTMLDivElement;

    function applyPadding() {
      const height = inputWrapEl.getBoundingClientRect().height;
      const gap = 12;
      const pad = Math.ceil(height + gap);
      msgsEl.style.paddingBottom = `${pad}px`;
      setInputHeight(height);
    }

    applyPadding();

    const ro = new ResizeObserver(() => applyPadding());
    ro.observe(inputWrapEl);
    window.addEventListener("resize", applyPadding);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applyPadding);
    };
  }, [chat?.messages.length, activeChatId]);

  const isMobileQuery =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(max-width: 900px)")
      : null;
  const [isMobile, setIsMobile] = useState<boolean>(
    !!(isMobileQuery && isMobileQuery.matches)
  );

  useEffect(() => {
    if (!isMobileQuery) return;
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    try {
      // modern
      isMobileQuery.addEventListener("change", handler);
    } catch {
      // fallback
      isMobileQuery.addListener(handler);
    }
    setIsMobile(isMobileQuery.matches);
    return () => {
      try {
        isMobileQuery.removeEventListener("change", handler);
      } catch {
        isMobileQuery.removeListener(handler);
      }
    };
  }, []);

  function initialsFromName(name?: string) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const messageCount = chat?.messages.length ?? 0;
  const lastMsgTime = useMemo(() => {
    const last = chat?.messages[chat.messages.length - 1];
    if (!last) return "";
    try {
      return new Date(last.createdAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [chat]);

  if (!chat) return <div className="chat-window empty">No chat selected</div>;

  const displayName = (chat as any).participantName ?? chat.title;
  const avatarInitials = initialsFromName(displayName);

  return (
    <div className="chat-window" data-chat-id={chat.id}>
      <header className="chat-header">
        <div className="left">
          {isMobile && (
            <button
              className="open-list"
              onClick={onOpenList}
              aria-label="Open chat list"
            >
              <FiMenu />
            </button>
          )}

          <div className="title-wrap">
            <div className="chat-avatar">{avatarInitials}</div>
            <div className="chat-title-info">
              <h2>{displayName}</h2>
              <div className="chat-meta">
                {messageCount} {messageCount === 1 ? "message" : "messages"}
                {lastMsgTime ? ` · ${lastMsgTime}` : ""}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="messages" ref={messagesRef} role="list">
        {chat.messages.length === 0 ? (
          <div className="empty-msg">Say hi 👋</div>
        ) : (
          chat.messages.map((m) => <MessageItem key={m.id} msg={m} />)
        )}
      </div>

      <div className="input-wrapper" ref={inputWrapperRef}>
        <MessageInput />
      </div>
    </div>
  );
}
