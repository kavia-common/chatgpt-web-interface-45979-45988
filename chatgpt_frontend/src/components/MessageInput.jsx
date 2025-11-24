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
   */
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState([]); // [{id,name,type,size,url,dataUrl, file? }]
  const ref = useRef(null);
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

  const handleSend = useCallback(() => {
    const text = value.trim();
    if ((!text && attachments.length === 0) || disabled) return;
    // Send with attachments (in-memory URLs)
    onSend(text, attachments);
    setValue('');
    // Revoke object URLs to avoid leaks; keep dataUrl strings as-is
    attachments.forEach((a) => {
      if (a.url && a.url.startsWith('blob:')) {
        try { URL.revokeObjectURL(a.url); } catch { /* ignore */ }
      }
    });
    setAttachments([]);
  }, [value, attachments, disabled, onSend]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
        if (text) setValue((v) => (v ? `${v} ${text}` : text));
      } else {
        stopRecording();
      }
    } catch (e) {
      // already handled via recError state; surface minimally
      // eslint-disable-next-line no-alert
      alert(e?.message || 'Voice input error');
    }
  };

  const pickFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      // For forward compatibility, we include a small dataUrl for preview (already in-memory)
      let dataUrl = '';
      try {
        dataUrl = await readFileAsDataUrl(file);
      } catch {
        // Fallback to blob URL only
      }
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
    // reset value to allow re-adding the same file name
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

  return (
    <div className="message-input" role="form" aria-label="Send a message">
      <textarea
        ref={ref}
        className="input"
        placeholder="Type your message…  Enter to send · Shift+Enter for newline"
        aria-label="Message input"
        value={value}
        disabled={disabled}
        rows={3}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />

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
