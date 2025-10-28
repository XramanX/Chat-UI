import React, { useMemo } from "react";
import type { Message } from "../../types";
import "./MessageItem.scss";

type Props = {
  msg: Message;
  // optional: showAvatar can be passed later to group messages visually
  showAvatar?: boolean;
};

function getInitials(senderId: string) {
  return senderId === "me" ? "You" : "B";
}

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

function MessageInner({ msg, showAvatar = true }: Props) {
  const isMe = msg.senderId === "me";
  const time = useMemo(() => formatTime(msg.createdAt), [msg.createdAt]);

  return (
    <article
      aria-label={`Message from ${isMe ? "you" : "bot"} at ${time}`}
      className={`message-item ${isMe ? "me" : "other"}`}
    >
      {!isMe && showAvatar && (
        <div className="avatar" aria-hidden>
          {getInitials(msg.senderId)}
        </div>
      )}

      <div className="content">
        {!isMe && <div className="sender">Bot</div>}
        <div className="bubble" role="group">
          <div className="text">{msg.content}</div>
        </div>
        <time className="time" dateTime={msg.createdAt}>
          {time}
        </time>
      </div>

      {/* {isMe && (
        <div className="me-meta">
          <time className="time" dateTime={msg.createdAt}>
            {time}
          </time>
        </div>
      )} */}
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
