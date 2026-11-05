import { useState, useRef, useEffect } from 'react';
import { type HistoricalEvent, type Locale } from '../types';
import './AIPanel.css';

interface Props {
  event:   HistoricalEvent | null;
  locale:  Locale;
  onClose: () => void;
}

interface Msg { role: 'user' | 'ai'; text: string }

async function askEntity(
  event: HistoricalEvent,
  question: string,
  history: Msg[],
  locale: Locale,
): Promise<string> {
  const res = await fetch('/api/entity-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity: { title: event.title, description: event.description, year: event.year, category: event.category },
      question,
      history: history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
      locale,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { ok: boolean; data: { answer: string } };
  return json.data.answer;
}

export function AIPanel({ event, locale, onClose }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!event) { setMessages([]); return; }
    setMessages([{
      role: 'ai',
      text: locale === 'it'
        ? `Analisi di "${event.title}" in corso. Puoi chiedermi correlazioni storiche, confronti tra epoche, o relazioni interdisciplinari.`
        : `Analyzing "${event.title}". Ask me about historical correlations, cross-era comparisons, or interdisciplinary connections.`,
    }]);
  }, [event?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send() {
    if (!input.trim() || busy) return;
    const question = input.trim();
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', text: question }];
    setMessages(next);
    setBusy(true);
    try {
      const reply = event
        ? await askEntity(event, question, next, locale)
        : (locale === 'it' ? 'Seleziona prima un\'entità sulla mappa.' : 'Please select an entity on the map first.');
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: locale === 'it'
          ? 'Servizio AI momentaneamente non disponibile.'
          : 'AI service temporarily unavailable.',
      }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="aip">
      <div className="aip__hd">
        <span className="aip__hd-ic">⬡</span>
        <span className="aip__hd-title">ASSISTENTE AI</span>
        <button className="aip__close" onClick={onClose} aria-label="Chiudi">✕</button>
      </div>

      <div className="aip__body" ref={bodyRef}>
        {!event && messages.length === 0 && (
          <p className="aip__hint">
            {locale === 'it'
              ? 'Seleziona un\'entità sulla mappa per analisi e correlazioni automatiche.'
              : 'Select an entity on the map for automatic analysis and correlations.'}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`aip__msg aip__msg--${m.role}`}>
            {m.role === 'ai' && <span className="aip__msg-ic">⬡</span>}
            <span className="aip__msg-txt">{m.text}</span>
          </div>
        ))}
        {busy && (
          <div className="aip__msg aip__msg--ai">
            <span className="aip__msg-ic">⬡</span>
            <span className="aip__msg-txt aip__msg--thinking">◈ ◈ ◈</span>
          </div>
        )}
      </div>

      <div className="aip__inp-row">
        <div className="aip__inp-wrap">
          <input
            className="aip__inp"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={locale === 'it' ? 'Chiedimi qualcosa…' : 'Ask me something…'}
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
          />
        </div>
        <button
          className="aip__send"
          onClick={send}
          disabled={busy || !input.trim()}
          aria-label="Invia"
        >▷</button>
      </div>
    </div>
  );
}
