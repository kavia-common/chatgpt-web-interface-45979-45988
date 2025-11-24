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
  const { theme } = useTheme('light'); // keep theme for global data-theme side-effects
  const { state, sendMessage, stop, clear } = useChat();

  // minimal heartbeat string to trigger hot-reload; safe, non-visual
  const __previewHeartbeat = 'v10';

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
