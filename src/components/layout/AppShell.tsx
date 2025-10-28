import React, { useCallback, useState } from "react";
import ChatList from "../chat/ChatList";
import ChatWindow from "../chat/ChatWindow";

import "./AppShell.scss";

export default function AppShell() {
  const [showList, setShowList] = useState(false);
  const openList = useCallback(() => setShowList(true), []);
  const closeList = useCallback(() => setShowList(false), []);

  return (
    <div className={`app-shell ${showList ? "list-open" : ""}`}>
      <aside
        className={`left-panel ${showList ? "open" : ""}`}
        aria-hidden={!showList}
      >
        <div className="left-inner">
          <ChatList onNavigate={closeList} />
        </div>
      </aside>

      <div
        className={`slide-backdrop ${showList ? "visible" : ""}`}
        onClick={closeList}
      />

      <main className="main-panel">
        <div className="main-container">
          <ChatWindow onOpenList={openList} />
        </div>
      </main>
    </div>
  );
}
