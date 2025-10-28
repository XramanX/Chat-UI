# Chat Take-Home (Redux Toolkit + React + TypeScript)

## Run

1. `npm create vite@latest chat-redux -- --template react-ts`
2. `cd chat-redux`
3. `npm install`
4. `npm install @reduxjs/toolkit react-redux`
5. Replace `src/` with provided files
6. `npm run dev`
7. Open `http://localhost:5173`

## Tech stack

- React 18 + TypeScript
- Vite (dev server)
- Redux Toolkit + react-redux
- SCSS (global)

## Features

- Create / delete chats
- Send messages (Enter to send, Shift+Enter newline)
- Message shows sender, timestamp, content
- Simulated incoming replies (API stub)
- Auto-scroll to latest message
- In-memory state (resets on reload)

## Scalability notes

- Uses Redux Toolkit `createSlice` — ready for async thunks & middleware (WebSocket, persistence).
- Messages are currently denormalized inside chats for simplicity. For production with high-volume messages:
  - Migrate to RTK Entity Adapter with normalized entities
  - Add pagination / virtualization (e.g., react-window) for message lists
  - Add WebSocket middleware to dispatch `receiveMessage`
- Typed hooks (`useAppDispatch`, `useAppSelector`) preserve types across the app.

## Design decisions

- `RTK` chosen for centralized predictable state and easy extension to real-time systems.
- Minimal boilerplate to keep focus on UI and UX for the take-home evaluation.
