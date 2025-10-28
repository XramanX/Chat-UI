import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Modal from "./Modal";
import Button from "../Button/Button";
import { USERS } from "../../../data/users";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userOrTitle: string) => void;
};

export default function NewChatModal({ isOpen, onClose, onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(USERS[0].id);
  const [highlight, setHighlight] = useState(0);
  const listRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOpen(true);
      setFilter("");
      setSelectedId(USERS[0].id);
      setHighlight(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setOpen(false);
    }
  }, [isOpen]);

  const visible = USERS.filter((u) =>
    u.name.toLowerCase().includes(filter.trim().toLowerCase())
  );

  useEffect(() => {
    if (highlight < 0) setHighlight(0);
    if (highlight >= visible.length)
      setHighlight(Math.max(0, visible.length - 1));
  }, [highlight, visible.length]);

  const onKeyDownList = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, visible.length - 1));
      scrollToHighlighted();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      scrollToHighlighted();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const u = visible[highlight];
      if (u) {
        setSelectedId(u.id);
        setFilter(u.name);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const scrollToHighlighted = () => {
    requestAnimationFrame(() => {
      const node = listRef.current?.children[highlight] as
        | HTMLElement
        | undefined;
      if (node) node.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  };

  const submit = useCallback(() => {
    const user = USERS.find((u) => u.id === selectedId) ?? null;
    if (!user) return;
    onCreate(user.name);
    setFilter("");
    setSelectedId(null);
  }, [onCreate, selectedId]);

  return (
    <Modal isOpen={open} onClose={onClose} title="Start chat with user">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 13, color: "#334155" }}>Select user</label>
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              borderRadius: 10,
              border: "1px solid rgba(15,23,35,0.08)",
              background: "#fff",
              boxSizing: "border-box",
              padding: 8,
            }}
            onKeyDown={onKeyDownList}
          >
            <input
              ref={inputRef}
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setHighlight(0);
              }}
              placeholder="Search or type to filter..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(15,23,35,0.06)",
                outline: "none",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
            <ul
              ref={listRef}
              role="listbox"
              aria-activedescendant={visible[highlight]?.id}
              style={{
                listStyle: "none",
                margin: 8,
                padding: 0,
                maxHeight: 180,
                overflowY: "auto",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(2,6,23,0.06)",
                background: "#ffffff",
              }}
            >
              {visible.length === 0 && (
                <li style={{ padding: 12, color: "#94a3b8" }}>No users</li>
              )}
              {visible.map((u, i) => {
                const isSel = u.id === selectedId;
                const isHi = i === highlight;
                return (
                  <li
                    id={u.id}
                    key={u.id}
                    role="option"
                    aria-selected={isSel}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      setSelectedId(u.id);
                      setFilter(u.name);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: isHi
                        ? "rgba(14,165,164,0.06)"
                        : "transparent",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "#eef2ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          color: "#334155",
                        }}
                      >
                        {u.name
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          User
                        </div>
                      </div>
                    </div>
                    {isSel && (
                      <div style={{ fontSize: 12, color: "#0ea5a4" }}>
                        Selected
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              submit();
              onClose();
            }}
          >
            Start Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
}
