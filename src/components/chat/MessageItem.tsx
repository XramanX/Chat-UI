import React, { useMemo } from "react";
import type { Message } from "../../types";
import { USERS } from "../../data/users";
import { useAppSelector } from "../../store/hooks";
import "./MessageItem.scss";

type Props = {
  msg: Message;
  showAvatar?: boolean;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getInitialsFromName(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function resolveSenderName(
  msg: Message,
  chats: { id: string; participantName?: string; title: string }[]
) {
  if (msg.senderId === "me") return "You";
  const byUser = USERS.find((u) => u.id === msg.senderId);
  if (byUser) return byUser.name;
  const chat = chats.find((c) => c.id === msg.chatId);
  if (chat) return chat.participantName ?? chat.title;
  return "Unknown";
}

function MessageInner({ msg, showAvatar = true }: Props) {
  const isMe = msg.senderId === "me";
  const time = useMemo(() => formatTime(msg.createdAt), [msg.createdAt]);
  const chats = useAppSelector((s) => s.chat.chats);
  const senderName = useMemo(() => resolveSenderName(msg, chats), [msg, chats]);
  const initials = useMemo(() => {
    if (msg.senderId === "me") return "You";
    const byUser = USERS.find((u) => u.id === msg.senderId);
    if (byUser) return getInitialsFromName(byUser.name);
    const chat = chats.find((c) => c.id === msg.chatId);
    return getInitialsFromName(chat?.participantName ?? chat?.title);
  }, [msg, chats]);

  return (
    <article
      aria-label={`Message from ${senderName} at ${time}`}
      className={`message-item ${isMe ? "me" : "other"}`}
    >
      {!isMe && showAvatar && (
        <div className="avatar" aria-hidden>
          {initials}
        </div>
      )}

      <div className="content">
        {!isMe && <div className="sender">{senderName}</div>}
        <div className="bubble" role="group">
          <div className="text">{msg.content}</div>
        </div>
        <time className="time" dateTime={msg.createdAt}>
          {time}
        </time>
      </div>
    </article>
  );
}

export default React.memo(
  MessageInner,
  (prev, next) =>
    prev.msg.id === next.msg.id &&
    prev.msg.content === next.msg.content &&
    prev.msg.createdAt === next.msg.createdAt
);
