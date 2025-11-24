import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { getFeatureFlags } from '../utils/env';
import { uid } from '../utils/id';

// PUBLIC_INTERFACE
export default function MessageInput({ onSend, disabled, onClear }) {
  /**
   * Multiline input with Enter to send, Shift+Enter for newline.
   * Cmd/Ctrl+K to clear chat.
   * Voice input via Web Speech API when available.
   * Image attachments: allows selecting multiple images, previewing, removing, and sending with the message.
   * Emoji picker: accessible button opens a panel, selected emoji inserts at caret.
   */
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState([]); // [{id,name,type,size,url,dataUrl }]
  const [showEmoji, setShowEmoji] = useState(false);
  const [caretPos, setCaretPos] = useState(0);
  const textareaRef = useRef(null);
  const emojiBtnRef = useRef(null);
  const emojiPanelRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    isSupportedInput,
    isRecording,
    startRecording,
    stopRecording,
    recError,
  } = useSpeech();

  const flags = getFeatureFlags();
  const voiceInputEnabled = !!flags.voice_input;

  const acceptTypes = 'image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp,image/svg+xml';

  // Auto-grow textarea within min/max height
  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const min = 54;
    const max = 240;
    el.style.height = 'auto';
    const next = Math.max(min, Math.min(max, el.scrollHeight));
    el.style.height = `${next}px`;
  }, []);

  // Insert text (emoji or newline) at current caret position
  const insertAtCaret = useCallback((text) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? caretPos;
    const end = el.selectionEnd ?? caretPos;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const next = `${before}${text}${after}`;
    setValue(next);
    const newPos = start + text.length;
    // restore caret after state update
    requestAnimationFrame(() => {
      try {
        el.focus();
        el.selectionStart = el.selectionEnd = newPos;
        setCaretPos(newPos);
        autoGrow();
      } catch {
        // ignore
      }
    });
  }, [value, caretPos, autoGrow]);

  const handleSend = useCallback(() => {
    const text = value.trimEnd(); // preserve internal newlines but remove trailing whitespace
    if ((!text && attachments.length === 0) || disabled) return;
    onSend(text, attachments);
    setValue('');
    // revoke blobs
    attachments.forEach((a) => {
      if (a.url && a.url.startsWith('blob:')) {
        try { URL.revokeObjectURL(a.url); } catch { /* ignore */ }
      }
    });
    setAttachments([]);
    // Reset textarea height
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '';
        autoGrow();
        textareaRef.current.focus();
      }
    });
  }, [value, attachments, disabled, onSend, autoGrow]);

  // Keyboard handling: Enter to send, Shift+Enter newline
  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // newline insert
        e.preventDefault();
        insertAtCaret('\n');
        return;
      }
      // send
      e.preventDefault();
      handleSend();
    }
  };

  const onSelectUpdateCaret = () => {
    const el = textareaRef.current;
    if (!el) return;
    setCaretPos(el.selectionStart || 0);
  };

  useEffect(() => {
    const handler = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClear && onClear();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClear]);

  // Close emoji panel on outside click or Escape
  useEffect(() => {
    if (!showEmoji) return;
    const onDocClick = (e) => {
      if (
        emojiPanelRef.current &&
        !emojiPanelRef.current.contains(e.target) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        setShowEmoji(false);
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [showEmoji]);

  const onClickMic = async () => {
    if (!voiceInputEnabled) {
      alert('Voice input is disabled by feature flags.');
      return;
    }
    if (!isSupportedInput) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    try {
      if (!isRecording) {
        const text = await startRecording({ lang: 'en-US' });
        if (text) {
          // add a space if needed
          setValue((v) => {
            const spacer = v && !/\s$/.test(v) ? ' ' : '';
            return `${v}${spacer}${text}`;
          });
          requestAnimationFrame(() => {
            textareaRef.current?.focus();
            autoGrow();
          });
        }
      } else {
        stopRecording();
      }
    } catch (e) {
      alert(e?.message || 'Voice input error');
    }
  };

  const pickFiles = () => {
    fileInputRef.current?.click();
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const next = [];
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i];
      if (!file || !file.type?.startsWith('image/')) continue;
      const objectUrl = URL.createObjectURL(file);
      let dataUrl = '';
      try { dataUrl = await readFileAsDataUrl(file); } catch { /* ignore */ }
      next.push({
        id: uid('att'),
        name: file.name,
        type: file.type,
        size: file.size,
        url: objectUrl,
        dataUrl,
      });
    }
    setAttachments((prev) => [...prev, ...next]);
  };

  const onFileChange = async (e) => {
    const files = e.target.files;
    await handleFiles(files);
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => {
      const toRemove = prev.find((a) => a.id === id);
      if (toRemove?.url?.startsWith('blob:')) {
        try { URL.revokeObjectURL(toRemove.url); } catch { /* ignore */ }
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const canSend = useMemo(() => {
    return (!!value.trim() || attachments.length > 0) && !disabled;
  }, [value, attachments.length, disabled]);

  // Basic emoji list to avoid external dependencies
  const emojis = useMemo(() => [
    '😀','😄','😁','😊','😍','😎','🤔','🤗','😉','😭',
    '👍','👎','🙏','👏','🔥','🌟','✨','💡','💬','📎',
    '🎉','🥳','🤖','🧠','⚡','✅','❌','📝','📌','⌛'
  ], []);

  // Toggle emoji panel, keep focus/aria
  const toggleEmoji = () => {
    setShowEmoji((s) => {
      const next = !s;
      if (next) {
        // open -> move focus into panel after paint
        requestAnimationFrame(() => {
          const first = emojiPanelRef.current?.querySelector('button');
          if (first) first.focus();
        });
      } else {
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
      return next;
    });
  };

  const onPickEmoji = (ch) => {
    insertAtCaret(ch);
    // keep panel open for multiple picks, but announce insertion
    try {
      const live = emojiPanelRef.current?.querySelector('[role="status"]');
      if (live) live.textContent = `${ch} inserted`;
    } catch { /* ignore */ }
  };

  // Ensure auto-grow reacts to content changes
  useEffect(() => { autoGrow(); }, [value, autoGrow]);

  return (
    <div className="message-input" role="form" aria-label="Send a message">
      <div className="input-with-emoji" style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          className="input"
          placeholder="Type your message…  Enter to send · Shift+Enter for newline"
          aria-label="Message input"
          value={value}
          disabled={disabled}
          rows={3}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onClick={onSelectUpdateCaret}
          onKeyUp={onSelectUpdateCaret}
          onFocus={onSelectUpdateCaret}
          style={{ overflow: 'hidden', resize: 'none' }}
        />
        <button
          ref={emojiBtnRef}
          className="btn btn-ghost emoji-btn"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={showEmoji}
          aria-controls="emoji-panel"
          aria-label="Insert emoji"
          title="Insert emoji"
          onClick={toggleEmoji}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            height: 30,
            minWidth: 36,
            padding: '0 8px'
          }}
        >
          😊
        </button>

        {showEmoji ? (
          <div
            ref={emojiPanelRef}
            id="emoji-panel"
            role="dialog"
            aria-label="Emoji picker"
            className="emoji-panel"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 'calc(100% + 8px)',
              width: 260,
              padding: 8,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 30
            }}
          >
            <div
              className="emoji-grid"
              role="grid"
              aria-label="Emoji grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 6
              }}
            >
              {emojis.map((eChar, idx) => (
                <button
                  key={`${eChar}-${idx}`}
                  type="button"
                  role="gridcell"
                  className="emoji-cell"
                  onClick={() => onPickEmoji(eChar)}
                  aria-label={`Insert ${eChar}`}
                  style={{
                    height: 30,
                    width: 30,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  {eChar}
                </button>
              ))}
            </div>
            <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} />
          </div>
        ) : null}
      </div>

      <div className="input-actions">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          multiple
          aria-label="Choose image files to attach"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />

        <button
          className="btn btn-ghost"
          type="button"
          onClick={pickFiles}
          disabled={disabled}
          aria-label="Attach images"
          title="Attach images"
          style={{ height: 'var(--btn-height)', minWidth: 40, padding: '0 10px' }}
        >
          📎
        </button>

        {voiceInputEnabled ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onClickMic}
            aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
            title={isRecording ? 'Stop' : (isSupportedInput ? 'Speak' : 'Voice not supported')}
            style={{ height: 'var(--btn-height)', minWidth: 40, padding: '0 10px' }}
          >
            {isRecording ? '⏺️' : '🎤'}
          </button>
        ) : null}

        <button
          className="btn btn-primary"
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          title="Send"
          style={{ minWidth: 92, height: 'var(--btn-height)' }}
        >
          Send
        </button>
      </div>

      {attachments.length > 0 ? (
        <div
          className="attachments-previews"
          role="group"
          aria-label="Selected image attachments"
          style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
          {attachments.map((att) => {
            const src = att.url || att.dataUrl;
            return (
              <div
                key={att.id}
                className="attachment-chip"
                style={{
                  position: 'relative',
                  width: 92,
                  height: 92,
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid #1f2a3f',
                  background: '#0b1220',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)'
                }}
              >
                <img
                  src={src}
                  alt={att.name || 'Selected image'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  aria-label={`Remove ${att.name || 'image'}`}
                  title="Remove"
                  onClick={() => removeAttachment(att.id)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    height: 26,
                    minWidth: 26,
                    padding: 0,
                    borderRadius: 999,
                    background: 'rgba(0,0,0,0.5)',
                    borderColor: 'rgba(0,0,0,0)',
                    color: '#e5e7eb'
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {voiceInputEnabled && isRecording ? (
        <div className="status" style={{ marginTop: 6 }}>
          <span className="dot dot-pending" aria-label="Recording" />
          <span className="status-text">Listening… click mic to stop</span>
        </div>
      ) : null}

      {voiceInputEnabled && recError ? (
        <div className="status-error" role="alert" style={{ marginTop: 6 }}>
          {recError}
        </div>
      ) : null}
    </div>
  );
}
