import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getFeatureFlags } from '../utils/env';

/**
 * Thin helpers to discover browser APIs across vendors.
 */
function getSpeechRecognition() {
  /* Safari uses webkitSpeechRecognition */
  const w = typeof window !== 'undefined' ? window : {};
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function hasSpeechSynthesis() {
  const w = typeof window !== 'undefined' ? window : {};
  return !!w.speechSynthesis;
}

// PUBLIC_INTERFACE
export function useSpeech() {
  /**
   * Speech utilities for Recognition and Synthesis with feature flag gating.
   * Feature flags: { voice_input: boolean, voice_output: boolean, auto_tts: boolean }
   */
  const flags = useMemo(() => {
    const f = getFeatureFlags() || {};
    return {
      voice_input: !!f.voice_input,
      voice_output: !!f.voice_output,
      auto_tts: !!f.auto_tts,
    };
  }, []);

  // ---- Recognition ----
  const RecognitionCtor = useMemo(() => (flags.voice_input ? getSpeechRecognition() : null), [flags.voice_input]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSupportedInput, setIsSupportedInput] = useState(!!RecognitionCtor);
  const recognitionRef = useRef(null);
  const [recError, setRecError] = useState(null);

  const startRecording = useCallback(
    ({ lang = 'en-US', interimResults = false } = {}) => {
      if (!RecognitionCtor) {
        setIsSupportedInput(false);
        setRecError('Voice input is not supported in this browser.');
        return Promise.reject(new Error('SpeechRecognition unsupported'));
      }
      // Create per-start instance to avoid stale event handlers
      const rec = new RecognitionCtor();
      recognitionRef.current = rec;

      try {
        rec.lang = lang;
      } catch {
        // ignore
      }
      rec.interimResults = !!interimResults;
      rec.continuous = false;

      const promise = new Promise((resolve, reject) => {
        let transcript = '';

        rec.onstart = () => {
          setIsRecording(true);
          setRecError(null);
        };
        rec.onerror = (e) => {
          setIsRecording(false);
          const msg = e?.error === 'no-speech'
            ? 'No speech detected. Try again.'
            : e?.message || e?.error || 'Microphone error';
          setRecError(msg);
          reject(new Error(msg));
        };
        rec.onend = () => {
          setIsRecording(false);
          resolve(transcript.trim());
        };
        rec.onresult = (event) => {
          try {
            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const res = event.results[i];
              if (res.isFinal || interimResults) {
                transcript += res[0]?.transcript || '';
              }
            }
          } catch {
            // ignore
          }
        };
      });

      try {
        rec.start();
      } catch (e) {
        setIsRecording(false);
        setRecError(e?.message || 'Failed to start recognition');
        return Promise.reject(e);
      }
      return promise;
    },
    [RecognitionCtor]
  );

  const stopRecording = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  // ---- Synthesis ----
  const canSpeak = useMemo(() => flags.voice_output && hasSpeechSynthesis(), [flags.voice_output]);
  const [speaking, setSpeaking] = useState(false);
  const synthesisUtteranceRef = useRef(null);
  const [ttsError, setTtsError] = useState(null);
  const [autoTts, setAutoTts] = useState(flags.auto_tts);

  useEffect(() => {
    // keep updated if feature flags change dynamically; simple env read means it's static
    setAutoTts(flags.auto_tts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = useCallback((text, { lang = 'en-US', rate = 1, pitch = 1, volume = 1 } = {}) => {
    if (!canSpeak) {
      setTtsError('Voice output is not supported in this browser.');
      return;
    }
    if (!text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = volume;
      u.onstart = () => {
        setSpeaking(true);
        setTtsError(null);
      };
      u.onend = () => {
        setSpeaking(false);
      };
      u.onerror = (e) => {
        setSpeaking(false);
        setTtsError(e?.message || 'Speech synthesis error');
      };
      synthesisUtteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } catch (e) {
      setSpeaking(false);
      setTtsError(e?.message || 'Speech synthesis error');
    }
  }, [canSpeak]);

  const cancelSpeak = useCallback(() => {
    if (hasSpeechSynthesis()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      } finally {
        setSpeaking(false);
      }
    }
  }, []);

  return {
    // recognition
    isSupportedInput,
    isRecording,
    startRecording,
    stopRecording,
    recError,

    // synthesis
    canSpeak,
    speaking,
    speak,
    cancelSpeak,
    ttsError,

    // global
    autoTts,
    setAutoTts,
  };
}

export default useSpeech;
