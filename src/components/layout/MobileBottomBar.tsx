import React from "react";
import Icon from "../common/Icon";
import "./MobileBottomBar.scss";

export default function MobileBottomBar({
  onOpenList,
}: {
  onOpenList?: () => void;
}) {
  return (
    <div className="mobile-bottom">
      <button className="mb-btn" onClick={onOpenList}>
        <Icon name="menu" />
      </button>
      <div style={{ flex: 1 }} />
      <button className="mb-btn">
        <Icon name="plus" />
      </button>
    </div>
  );
}
