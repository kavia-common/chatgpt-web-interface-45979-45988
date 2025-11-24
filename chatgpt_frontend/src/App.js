import React from 'react';
import './index.css';
import './App.css';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import StatusBar from './components/StatusBar';
import useTheme from './hooks/useTheme';
import useChat from './hooks/useChat';

// PUBLIC_INTERFACE
function App() {
  /** Main application composing header, chat window, input and status bar.
   * Design reference image (for QA): /assets/20251124_103045_Screenshot_2025-11-24_153849.png
   */
  const { theme, toggleTheme } = useTheme('light');
  const { state, sendMessage, stop, clear } = useChat();

  return (
    <div className="container app cache-bust" data-design-ref="/assets/20251124_103045_Screenshot_2025-11-24_153849.png">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <ChatWindow messages={state.messages} />
      <MessageInput onSend={sendMessage} disabled={state.pending} onClear={clear} />
      <StatusBar pending={state.pending} error={state.error} onStop={stop} onClear={clear} />
    </div>
  );
}

export default App;
