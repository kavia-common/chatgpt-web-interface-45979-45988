import { useCallback, useMemo, useReducer } from 'react';
import { chatReducer, initialChatState, ChatActions } from '../state/chatReducer';
import { uid } from '../utils/id';
import { persistedState, saveState } from '../utils/storage';
import { createChatService } from '../services/chatService';
import { getFeatureFlags } from '../utils/env';

const STORAGE_KEY = 'app.chat.state';

// PUBLIC_INTERFACE
export function useChat() {
  /** Hook to manage chat conversation flow, persistence, and actions. */
  const persisted = useMemo(() => persistedState(STORAGE_KEY, initialChatState), []);
  const [state, dispatch] = useReducer(chatReducer, { ...initialChatState, ...persisted });
  const service = useMemo(() => createChatService(), []);
  const flags = useMemo(() => getFeatureFlags() || {}, []);

  const persist = useCallback(
    (next) => {
      saveState(STORAGE_KEY, next);
    },
    []
  );

  /**
   * PUBLIC_INTERFACE
   * sendMessage(text: string, attachments?: Array<{id,name,type,size,url,dataUrl}>)
   * Sends a user message with optional in-memory attachments.
   */
  const sendMessage = useCallback(
    async (text, attachments = []) => {
      if (!text?.trim() || state.pending) return;
      const safeAttachments = Array.isArray(attachments) ? attachments : [];
      const userMsg = { id: uid('msg'), role: 'user', content: text.trim(), attachments: safeAttachments.length ? safeAttachments : undefined, reactions: { counts: {}, userReacted: {} } };

      dispatch({ type: ChatActions.ADD_USER_MESSAGE, payload: userMsg });
      dispatch({ type: ChatActions.SET_PENDING, payload: true });
      persist({ ...state, messages: [...state.messages, userMsg], pending: true, error: null });

      try {
        // Build payload messages – forward-compatible placeholder for attachments gated by feature flag
        const enableAttachmentPayload = !!flags.attachments_backend;
        const messages = [...state.messages, userMsg].map(({ role, content, attachments: atts }) => {
          const base = { role, content };
          if (enableAttachmentPayload && atts && atts.length) {
            base.attachments = atts.map(({ id, name, type, size, dataUrl, url }) => ({
              id, name, type, size, dataUrl, url
            }));
          }
          return base;
        });

        const result = await service.createCompletion({ messages });

        const assistantMsg = { id: uid('msg'), role: 'assistant', content: result.content || '', reactions: { counts: {}, userReacted: {} } };
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
    [state, flags.attachments_backend]
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

  /**
   * PUBLIC_INTERFACE
   * toggleReaction(messageId: string, reaction: string)
   * Toggle a reaction for the current user. If the same reaction is active, remove it; if a different one is active, switch.
   */
  const toggleReaction = useCallback((messageId, reaction) => {
    dispatch({ type: ChatActions.TOGGLE_REACTION, payload: { messageId, reaction } });
    // persist with updated state approximation
    const next = {
      ...state,
      messages: state.messages.map((m) => {
        if (m.id !== messageId) return m;
        // local approximation mirrors reducer logic (for persistence immediacy)
        const counts = { ...(m.reactions?.counts || {}) };
        const userReacted = { ...(m.reactions?.userReacted || {}) };
        const prev = Object.keys(userReacted).find((k) => userReacted[k]);
        const isSame = prev === reaction;
        if (isSame) {
          userReacted[reaction] = false;
          counts[reaction] = Math.max(0, (counts[reaction] || 0) - 1);
        } else {
          if (prev) {
            userReacted[prev] = false;
            counts[prev] = Math.max(0, (counts[prev] || 0) - 1);
          }
          userReacted[reaction] = true;
          counts[reaction] = (counts[reaction] || 0) + 1;
        }
        return { ...m, reactions: { counts, userReacted } };
      })
    };
    saveState(STORAGE_KEY, next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return { state, sendMessage, stop, clear, toggleReaction };
}

export default useChat;
