import React from 'react';
import './index.css'; // must load first (variables/reset)
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

  // enforce dark theme initially once (without causing extra re-render loops)
  React.useEffect(() => {
    if (theme !== 'dark') setTheme('dark');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container app" data-theme-active={theme}>
      <Header />
      <ChatWindow messages={state.messages} />
      <MessageInput onSend={sendMessage} disabled={state.pending} onClear={clear} />
      <StatusBar pending={state.pending} error={state.error} onStop={stop} onClear={clear} />
    </div>
  );
}

export default App;
