import { useCallback, useMemo, useReducer } from 'react';
import { chatReducer, initialChatState, ChatActions } from '../state/chatReducer';
import { uid } from '../utils/id';
import { persistedState, saveState } from '../utils/storage';
import { createChatService } from '../services/chatService';

const STORAGE_KEY = 'app.chat.state';

// PUBLIC_INTERFACE
export function useChat() {
  /** Hook to manage chat conversation flow, persistence, and actions. */
  const persisted = useMemo(() => persistedState(STORAGE_KEY, initialChatState), []);
  const [state, dispatch] = useReducer(chatReducer, { ...initialChatState, ...persisted });
  const service = useMemo(() => createChatService(), []);

  const persist = useCallback(
    (next) => {
      saveState(STORAGE_KEY, next);
    },
    []
  );

  const sendMessage = useCallback(
    async (text) => {
      if (!text || state.pending) return;
      const userMsg = { id: uid('msg'), role: 'user', content: text };
      dispatch({ type: ChatActions.ADD_USER_MESSAGE, payload: userMsg });
      dispatch({ type: ChatActions.SET_PENDING, payload: true });
      persist({ ...state, messages: [...state.messages, userMsg], pending: true, error: null });

      try {
        const messages = [...state.messages, userMsg].map(({ role, content }) => ({ role, content }));
        const result = await service.createCompletion({ messages });

        const assistantMsg = { id: uid('msg'), role: 'assistant', content: result.content || '' };
        dispatch({ type: ChatActions.ADD_ASSISTANT_MESSAGE, payload: assistantMsg });
        const nextState = {
          ...state,
          messages: [...state.messages, userMsg, assistantMsg],
          pending: false,
          error: null,
        };
        dispatch({ type: ChatActions.SET_PENDING, payload: false });
        persist(nextState);
      } catch (err) {
        dispatch({ type: ChatActions.SET_PENDING, payload: false });
        dispatch({ type: ChatActions.SET_ERROR, payload: err.message || 'Failed to get response' });
        persist({ ...state, messages: [...state.messages, userMsg], pending: false, error: err.message || 'Failed' });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  const stop = useCallback(() => {
    service.stop();
    dispatch({ type: ChatActions.SET_PENDING, payload: false });
    persist({ ...state, pending: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const clear = useCallback(() => {
    dispatch({ type: ChatActions.CLEAR_CHAT });
    persist({ ...initialChatState });
  }, [persist]);

  return { state, sendMessage, stop, clear };
}

export default useChat;
