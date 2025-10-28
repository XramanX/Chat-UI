import React, { useCallback, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendMessage, receiveMessage } from "../../store/chatSlice";
import { simulateIncomingReply } from "../../api/stub";
import { FiSend } from "react-icons/fi";
import "./MessageInput.scss";

export default function MessageInput() {
  const [text, setText] = useState("");
  const activeChatId = useAppSelector((s) => s.chat.activeChatId);
  const dispatch = useAppDispatch();
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(200, ta.scrollHeight) + "px";
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      resize();
    },
    [resize]
  );

  const doSend = useCallback(() => {
    if (!activeChatId) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg = {
      id: "m-" + Math.random().toString(36).slice(2, 9),
      chatId: activeChatId,
      senderId: "me" as const,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    dispatch(sendMessage(msg));
    setText("");
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.focus();
    }
    simulateIncomingReply(activeChatId, (m) => dispatch(receiveMessage(m)));
  }, [text, activeChatId, dispatch]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        doSend();
      }
    },
    [doSend]
  );

  return (
    <form
      className="message-input"
      onSubmit={(e) => {
        e.preventDefault();
        doSend();
      }}
      role="search"
      aria-label="Send message"
    >
      <textarea
        ref={taRef}
        className="message-textarea"
        placeholder="Type a message..."
        value={text}
        onChange={onChange}
        onInput={resize}
        onKeyDown={onKeyDown}
        rows={1}
        aria-label="Message input"
      />
      <button
        type="submit"
        className="send-btn"
        disabled={text.trim().length === 0}
        aria-label="Send"
      >
        <FiSend className="send-icon" aria-hidden="true" />
      </button>
    </form>
  );
}
