# ChatGPT Web Interface — Ocean Professional

This frontend is a lightweight React app that provides a clean, modern chat interface for interacting with a ChatGPT-compatible API. It follows the Ocean Professional theme with blue and amber accents, subtle gradients, and rounded surfaces. The UI comprises a sticky header, a scrollable chat window, a bottom message input, and a status bar.

## Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### Install
```bash
npm install
```

### Develop
```bash
# Ensure REACT_APP_API_BASE (or REACT_APP_BACKEND_URL) is set for API calls
npm start
# App runs at http://localhost:3000
```

### Test
```bash
npm test
```

### Build
```bash
npm run build
```

## Environment Configuration

This app reads configuration via React-style env variables (prefixed with REACT_APP_). Only variables used by the current codebase are listed as active; others are accepted for future compatibility.

Active variables in code:
- REACT_APP_API_BASE: Base URL for API requests. Used by getApiBase() as primary source.
- REACT_APP_BACKEND_URL: Fallback base URL if REACT_APP_API_BASE is not set.
- REACT_APP_FRONTEND_URL: Optional. Exposed via getFrontendUrl().
- REACT_APP_FEATURE_FLAGS: Optional JSON string of feature flags. Accessed via getFeatureFlags().
- REACT_APP_EXPERIMENTS_ENABLED: Optional boolean. Accessed via isExperimentsEnabled().
- REACT_APP_LOG_LEVEL: Optional, defaults to info. Controls apiClient logging verbosity (error, warn, info, debug).

Additional commonly provided variables (not currently read by code but safe to define):
- REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_NEXT_TELEMETRY_DISABLED, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_HEALTHCHECK_PATH

Example .env.development:
```
REACT_APP_API_BASE=http://localhost:8787
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_LOG_LEVEL=info
REACT_APP_FEATURE_FLAGS={"enableNewUI":true}
REACT_APP_EXPERIMENTS_ENABLED=false
```

## Architecture Overview

The app is intentionally minimal and framework-agnostic, using React and vanilla CSS.

- Entry
  - src/index.js mounts the App component under React.StrictMode.
  - src/App.js composes the main layout using custom hooks and components.

- State and Hooks
  - src/state/chatReducer.js defines the chat state shape and actions:
    - messages: array of { id, role: user|assistant|system, content }
    - pending: boolean for in-flight request
    - error: string|null
    - Actions include ADD_USER_MESSAGE, ADD_ASSISTANT_MESSAGE, APPEND_ASSISTANT_DELTA (reserved for streaming), SET_PENDING, SET_ERROR, CLEAR_CHAT
  - src/hooks/useChat.js orchestrates message flow:
    - Persists state to localStorage
    - Sends messages via chat service
    - Handles stop and clear actions
  - src/hooks/useTheme.js manages light/dark mode via a data-theme attribute and localStorage

- Services
  - src/services/apiClient.js provides apiFetch with:
    - Base URL resolution from env
    - JSON serialization
    - Timeout and AbortController support
    - Normalized error handling
    - Log level aware console output
  - src/services/chatService.js exposes createChatService():
    - createCompletion({ messages, model='gpt-4o-mini', temperature=0.7, stream=false })
    - stop() to abort in-flight requests

- Components
  - Header.jsx: Branded header with theme toggle
  - ChatWindow.jsx: Scrollable list of messages with auto-scroll on updates
  - MessageBubble.jsx: Message bubble styled per role
  - MessageInput.jsx: Multiline input with keyboard shortcuts
  - StatusBar.jsx: Pending indicator, error display, Stop and Clear buttons

- Utilities
  - utils/env.js: Environment resolution and parsing (bool/JSON)
  - utils/errors.js: Error normalization
  - utils/id.js: Unique ID generator
  - utils/storage.js: LocalStorage wrappers for persisted state

### Data Flow

1. User types in MessageInput and sends message.
2. useChat dispatches ADD_USER_MESSAGE, marks pending, persists state.
3. chatService.createCompletion posts to /v1/chat/completions via apiFetch.
4. On success, useChat dispatches ADD_ASSISTANT_MESSAGE and clears pending.
5. On error, useChat sets error message and clears pending.
6. StatusBar reflects pending/error; user may Stop (abort) or Clear chat.

## Theming and Styling

The app uses CSS variables and a data-theme attribute on the html element.

- Theme hook: useTheme() stores the current theme in localStorage under app.theme and toggles data-theme between light and dark.
- Colors: Defined in src/index.css and src/App.css with primary (#2563EB) and secondary (#F59E0B) accents per Ocean Professional.
- Light/Dark: Many variables change under [data-theme="dark"] to invert backgrounds and text.

To customize:
- Update variables in src/index.css and src/App.css for brand colors, shadows, radii.
- Extend components using the existing utility classes (btn, btn-primary, btn-secondary, btn-danger, btn-ghost).

## Keyboard Shortcuts

- Enter: Send message (when not holding Shift).
- Shift+Enter: Insert a newline in the message input.
- Cmd/Ctrl+K: Clear the current chat history.

These are implemented in MessageInput.jsx using native key handlers and a global listener for Cmd/Ctrl+K.

## Streaming Support Notes

The current implementation posts non-streaming requests to /v1/chat/completions and expects an OpenAI-style JSON response with choices[0].message.content.

- stop(): The Stop button triggers AbortController.abort(), cancelling any in-flight request. StatusBar disables Stop when not pending.
- Reserved for future streaming:
  - chatReducer includes APPEND_ASSISTANT_DELTA to support token-by-token updates.
  - createCompletion accepts a stream flag but currently uses non-streaming fetch. To enable streaming:
    - Introduce a streaming transport (e.g., Fetch with ReadableStream, EventSource, or WebSocket).
    - Dispatch APPEND_ASSISTANT_DELTA as chunks arrive, using a placeholder assistant message created on stream start.
    - Ensure service.stop() aborts the stream cleanly.

Backend expectations for streaming (if implemented later):
- SSE: Server emits data: lines with JSON deltas.
- WebSocket: Server pushes delta messages for the same request ID.

## Accessibility

- Semantic roles are set on main regions (banner, main, form, contentinfo).
- Live regions are used for empty state and status updates.
- Buttons have descriptive aria-labels.

## Scripts

- npm start: Start dev server.
- npm test: Run tests with React Testing Library and jest-dom.
- npm run build: Production bundle.

## Troubleshooting

- Blank responses: Verify REACT_APP_API_BASE or REACT_APP_BACKEND_URL points to a server that exposes POST /v1/chat/completions with OpenAI-compatible schema.
- CORS: Ensure the backend allows the frontend origin and includes appropriate CORS headers for POST requests.
- Timeouts: apiFetch defaults to a 60s timeout. Adjust client or server as needed.
- Logging: Set REACT_APP_LOG_LEVEL to debug to see more diagnostics in development.

## Project Structure

- src/App.js: Application composition
- src/components/: UI building blocks
- src/hooks/: Theme and chat hooks
- src/services/: API and chat services
- src/state/: Chat reducer and actions
- src/utils/: Environment, storage, errors, ids
- src/index.css and src/App.css: Global and app styles

## License

Proprietary — for internal use within the project workspace.
