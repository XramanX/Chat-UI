import { useLayoutEffect, useMemo, useRef, useState } from "react";
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

  if (!chat) return <div className="chat-window empty">No chat selected</div>;

  return (
    <div className="chat-window" data-chat-id={chat.id}>
      <header className="chat-header">
        <div className="left">
          <button
            className="open-list"
            onClick={onOpenList}
            aria-label="Open chat list"
          >
            <FiMenu />
          </button>
          <h2>{chat.title}</h2>
        </div>
        {/* <div className="meta">
          {chat.messages.length}{" "}
          {chat.messages.length === 1 ? "message" : "messages"}
        </div> */}
        {/* {not looking good} */}
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
