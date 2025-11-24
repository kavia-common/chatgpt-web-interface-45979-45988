import React from 'react';
import './index.css'; // global styles (must load first, sets variables and resets)
import './App.css';   // app-scoped styles
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import StatusBar from './components/StatusBar';
import useTheme from './hooks/useTheme';
import useChat from './hooks/useChat';

// PUBLIC_INTERFACE
function App() {
  /**
   * Main application composing header, chat window, input and status bar.
   * Strict visual parity per provided screenshot.
   */
  const { theme, setTheme } = useTheme('dark'); // default to dark to match screenshot
  const { state, sendMessage, stop, clear } = useChat();

  // change preview heartbeat for visible hot-reload without UI markers
  const __previewHeartbeat = 'v11';

  // enforce dark theme initially once
  if (theme !== 'dark') {
    setTimeout(() => setTheme('dark'), 0);
  }

  return (
    <div
      className="container app"
      data-preview={__previewHeartbeat}
      data-theme-active={theme}
    >
      <Header />
      <ChatWindow messages={state.messages} />
      <MessageInput onSend={sendMessage} disabled={state.pending} onClear={clear} />
      <StatusBar pending={state.pending} error={state.error} onStop={stop} onClear={clear} />
    </div>
  );
}

export default App;
