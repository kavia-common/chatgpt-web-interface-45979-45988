import { apiFetch } from './apiClient';

// PUBLIC_INTERFACE
export function createChatService() {
  /**
   * Provides chat API interaction with stop capability via AbortController.
   * Returns { createCompletion, stop }.
   */
  let inflightController = null;

  const createCompletion = async ({ messages, model = 'gpt-4o-mini', temperature = 0.7, stream = false }) => {
    if (inflightController) {
      // if previous exists, let it continue. Caller should call stop() first.
    }
    inflightController = new AbortController();
    try {
      const data = await apiFetch('/v1/chat/completions', {
        method: 'POST',
        signal: inflightController.signal,
        body: { messages, model, temperature, stream },
      });

      // Expect OpenAI-style JSON (non-stream): choices[0].message.content
      const text = data?.choices?.[0]?.message?.content ?? '';
      return { id: data?.id, content: text, raw: data };
    } finally {
      inflightController = null;
    }
  };

  const stop = () => {
    if (inflightController) {
      try {
        inflightController.abort('Stopped by user');
      } catch {
        // ignore
      } finally {
        inflightController = null;
      }
    }
  };

  return { createCompletion, stop };
}
