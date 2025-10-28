# Chat Take-Home (Redux Toolkit + React + TypeScript)

## Run

1. `npm i`
2. `npm run dev`
3. Open `http://localhost:5173`

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

## Design decisions

- `RTK` chosen for centralized predictable state and easy extension to real-time systems.
- Minimal boilerplate to keep focus on UI and UX for the take-home evaluation.
