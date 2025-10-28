import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./Modal.scss";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
};

const modalRoot =
  document.getElementById("modal-root") ??
  (() => {
    const el = document.createElement("div");
    el.id = "modal-root";
    document.body.appendChild(el);
    return el;
  })();

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal-backdrop"
      onClick={() => closeOnBackdrop && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Modal"}
    >
      <div
        className={`modal-panel ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          {title && <h3>{title}</h3>}
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    modalRoot
  );
}
