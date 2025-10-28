import React, { useCallback, useState } from "react";
import Modal from "./Modal";
import Button from "../Button/Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
};

export default function NewChatModal({ isOpen, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");

  const submit = useCallback(() => {
    const t = title.trim();
    if (!t) return;
    onCreate(t);
    setTitle("");
  }, [title, onCreate]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new chat">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chat title"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #e6eef8" }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Create</Button>
        </div>
      </div>
    </Modal>
  );
}
