export const initialChatState = {
  // messages: array of:
  // { id, role: 'user'|'assistant'|'system', content, attachments?: [{ id, name, type, size, url, dataUrl }],
  //   reactions?: { counts: Record<string, number>, userReacted?: Record<string, boolean> } }
  messages: [],
  pending: false,
  error: null
};

export const ChatActions = {
  ADD_USER_MESSAGE: 'ADD_USER_MESSAGE',
  ADD_ASSISTANT_MESSAGE: 'ADD_ASSISTANT_MESSAGE',
  APPEND_ASSISTANT_DELTA: 'APPEND_ASSISTANT_DELTA',
  SET_PENDING: 'SET_PENDING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_CHAT: 'CLEAR_CHAT',
  // Reactions
  TOGGLE_REACTION: 'TOGGLE_REACTION',
};

function ensureReactions(m) {
  // Initialize reactions shape if absent
  if (!m.reactions) {
    return { ...m, reactions: { counts: {}, userReacted: {} } };
  }
  const counts = m.reactions.counts || {};
  const userReacted = m.reactions.userReacted || {};
  return { ...m, reactions: { counts: { ...counts }, userReacted: { ...userReacted } } };
}

export function chatReducer(state, action) {
  switch (action.type) {
    case ChatActions.ADD_USER_MESSAGE: {
      const msg = action.payload?.reactions ? action.payload : { ...action.payload, reactions: { counts: {}, userReacted: {} } };
      return {
        ...state,
        messages: [...state.messages, msg],
        error: null,
      };
    }
    case ChatActions.ADD_ASSISTANT_MESSAGE: {
      const msg = action.payload?.reactions ? action.payload : { ...action.payload, reactions: { counts: {}, userReacted: {} } };
      return {
        ...state,
        messages: [...state.messages, msg],
        error: null,
      };
    }
    case ChatActions.APPEND_ASSISTANT_DELTA: {
      const { id, delta } = action.payload;
      const messages = state.messages.map((m) =>
        m.id === id ? { ...m, content: (m.content || '') + delta } : m
      );
      return { ...state, messages };
    }
    case ChatActions.SET_PENDING: {
      return { ...state, pending: action.payload };
    }
    case ChatActions.SET_ERROR: {
      return { ...state, error: action.payload };
    }
    case ChatActions.CLEAR_CHAT: {
      return { ...initialChatState };
    }
    case ChatActions.TOGGLE_REACTION: {
      const { messageId, reaction } = action.payload;
      const messages = state.messages.map((m) => {
        if (m.id !== messageId) return m;
        // initialize reactions structs
        let next = ensureReactions(m);
        const counts = { ...next.reactions.counts };
        const user = { ...next.reactions.userReacted };
        const prevActive = Object.keys(user).find((k) => user[k]);
        const isSame = prevActive === reaction;

        if (isSame) {
          // remove same reaction
          user[reaction] = false;
          counts[reaction] = Math.max(0, (counts[reaction] || 0) - 1);
        } else {
          // switch/add
          if (prevActive) {
            user[prevActive] = false;
            counts[prevActive] = Math.max(0, (counts[prevActive] || 0) - 1);
          }
          user[reaction] = true;
          counts[reaction] = (counts[reaction] || 0) + 1;
        }
        next = { ...next, reactions: { counts, userReacted: user } };
        return next;
      });
      return { ...state, messages };
    }
    default:
      return state;
  }
}
