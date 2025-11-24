import React from 'react';
import './index.css'; // must load first (variables/reset)
import './App.css';   // app-scoped styles
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import StatusBar from './components/StatusBar';
import useTheme from './hooks/useTheme';
import useChat from './hooks/useChat';
import useSpeech from './hooks/useSpeech';
import { getFeatureFlags } from './utils/env';

// PUBLIC_INTERFACE
function App() {
  /**
   * Main application composing header, chat window, input and status bar.
   * Strict visual parity per provided screenshot.
   */
  const { theme, setTheme } = useTheme('dark'); // default to dark to match screenshot
  const { state, sendMessage, stop, clear } = useChat();
  const speech = useSpeech();
  const flags = React.useMemo(() => getFeatureFlags() || {}, []);

  // enforce dark theme initially once (without causing extra re-render loops)
  React.useEffect(() => {
    if (theme !== 'dark') setTheme('dark');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto speak latest assistant message if enabled
  React.useEffect(() => {
    if (!flags.voice_output) return;
    if (!speech || !speech.canSpeak || !speech.autoTts) return;
    const msgs = state.messages;
    if (!Array.isArray(msgs) || msgs.length === 0) return;
    const last = msgs[msgs.length - 1];
    if (last.role === 'assistant' && last.content) {
      try {
        speech.speak(last.content);
      } catch {
        // ignore synthesis errors here
      }
    }
    // we only want to trigger when messages change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages]);

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
