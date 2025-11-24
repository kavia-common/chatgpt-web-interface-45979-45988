import React from 'react';
import './index.css'; // global styles (must load first)
import './App.css';   // app-scoped styles and minimal hot-reload marker
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import StatusBar from './components/StatusBar';
import useTheme from './hooks/useTheme';
import useChat from './hooks/useChat';

// PUBLIC_INTERFACE
function App() {
  /** Main application composing header, chat window, input and status bar.
   * Design reference image (for QA): /assets/20251124_105643_Screenshot_2025-11-24_153849.png
   */
  const { theme } = useTheme('light'); // keep theme for global data-theme side-effects
  const { state, sendMessage, stop, clear } = useChat();

  // no-op variable to ensure rebuilds detect file change during hot reload
  // bump this to force preview refresh validation
  const __previewHeartbeat = 'v6';

  return (
    <div
      className="container app"
      data-design-ref="/assets/20251124_105643_Screenshot_2025-11-24_153849.png"
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
