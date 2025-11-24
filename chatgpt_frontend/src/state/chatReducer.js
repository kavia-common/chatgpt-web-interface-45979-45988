export const initialChatState = {
  messages: [], // {id, role: 'user'|'assistant'|'system', content}
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
};

export function chatReducer(state, action) {
  switch (action.type) {
    case ChatActions.ADD_USER_MESSAGE: {
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };
    }
    case ChatActions.ADD_ASSISTANT_MESSAGE: {
      return {
        ...state,
        messages: [...state.messages, action.payload],
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
    default:
      return state;
  }
}
