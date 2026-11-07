// POST /api/entity-chat — conversational AI about a selected historical entity
// Follows the same AI-backend pattern as /api/summarize
/* eslint-disable @typescript-eslint/no-explicit-any */

interface ChatEnv {
  AI?: { run: (model: string, opts: object) => Promise<{ response?: string; generated_text?: string }> };
  ANTHROPIC_API_KEY?: string;
  GROQ_API_KEY?: string;
  AI_MODEL?: string;
}

interface EntityContext {
  title:       string;
  description: string;
  year:        number;
  category:    string;
}

interface ChatMessage {
  role:    'user' | 'assistant';
  content: string;
}

interface RequestBody {
  entity:   EntityContext;
  question: string;
  history:  ChatMessage[];
  locale:   'it' | 'en';
}

interface ChatResponse {
  answer:      string;
  suggestions: string[];
}

function cors(status = 200) {
  return new Response(null, {
    status,
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}
function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function fmtYear(year: number, it: boolean): string {
  const abs = Math.abs(year);
  if (abs >= 1e9) return `${(abs / 1e9).toFixed(1)} ${it ? 'miliardi di anni fa' : 'billion years ago'}`;
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(0)} ${it ? 'milioni di anni fa' : 'million years ago'}`;
  return `${abs.toLocaleString('it')} ${year < 0 ? (it ? 'a.C.' : 'BC') : (it ? 'd.C.' : 'AD')}`;
}

function decodeHtml(s: string): string {
  return s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function cleanDescription(desc: string): string {
  const d = decodeHtml(desc).trim();
  if (/^Disambiguazione|^Disambiguation/i.test(d)) return '';
  return d;
}

/** System prompt for the INITIAL analysis — plain text, no JSON required */
function buildAnalysisPrompt(entity: EntityContext, locale: string): string {
  const it   = locale === 'it';
  const year = fmtYear(entity.year, it);
  const desc = cleanDescription(entity.description);

  if (it) return `Sei una guida storica appassionata che svela connessioni tra epoche, discipline e culture.
Entità: "${entity.title}" (${year}, ${entity.category}).${desc ? `\nContesto: ${desc}` : ''}

Scrivi un'analisi narrativa in prosa libera (niente elenchi puntati, niente JSON, niente frecce). Struttura:
1. Apertura (2 frasi): un dettaglio sorprendente su "${entity.title}" che cattura l'attenzione.
2. Per ognuna delle 5 entità correlate scrivi un paragrafo così:
   — Prima: spiega CONCRETAMENTE il nesso con "${entity.title}". Non basta dire che entrambe appartengono allo stesso periodo. Vuoi rispondere a: cosa c'entra quell'entità con "${entity.title}"? C'è stata una commissione, un incontro, un'influenza diretta, un contrasto illuminante? Scrivi: "[entità] e ${entity.title} si incrociarono quando..." oppure "${entity.title} rese possibile [entità] perché..." oppure "Mentre ${entity.title} faceva X, [entità] stava..."
   — Poi: presenta l'entità con un dettaglio affascinante e non ovvio.
   — Infine: una frase suggestiva che invita a esplorarla sulla mappa.
Tono: narratore storico appassionato. Solo testo piano, niente link Markdown né URL.`;

  return `You are a passionate historical guide who unveils connections across eras, disciplines and cultures.
Entity: "${entity.title}" (${year}, ${entity.category}).${desc ? `\nContext: ${desc}` : ''}

Write a narrative analysis in free prose (no bullet lists, no JSON, no arrows). Structure:
1. Opening (2 sentences): a surprising detail about "${entity.title}" that grabs attention.
2. For each of the 5 correlated entities write a paragraph:
   — First: explain CONCRETELY how that entity connects to "${entity.title}". It is not enough to say both belong to the same period. Answer: what does that entity have to do with "${entity.title}"? Was there a commission, an encounter, a direct influence, an illuminating contrast? Write: "[entity] and ${entity.title} crossed paths when..." or "${entity.title} made [entity] possible because..." or "While ${entity.title} was doing X, [entity] was..."
   — Then: introduce the entity with a fascinating, non-obvious detail.
   — Finally: a suggestive sentence inviting the user to explore it on the map.
Tone: passionate historical narrator. Plain text only, no Markdown links or URLs.`;
}

/** System prompt for FOLLOW-UP questions — JSON output */
function buildSystemPrompt(entity: EntityContext, locale: string): string {
  const it   = locale === 'it';
  const year = fmtYear(entity.year, it);
  const desc = cleanDescription(entity.description);

  if (it) return `Sei una guida storica appassionata. Entità selezionata: "${entity.title}" (${year}).${desc ? `\nContesto: ${desc}` : ''}
Rispondi in italiano in modo evocativo e coinvolgente. Aggiungi dettagli storici precisi e non ovvi.
Proponi 3-5 entità storiche navigabili già citate nel testo come suggerimenti.
Non usare link Markdown né URL. Rispondi SOLO con JSON valido: {"answer":"...","suggestions":["Nome1","Nome2"]}`;

  return `You are a passionate historical guide. Selected entity: "${entity.title}" (${year}).${desc ? `\nContext: ${desc}` : ''}
Reply in English evocatively and engagingly. Add precise, non-obvious historical details.
Propose 3-5 navigable historical entities already cited in the text as suggestions.
No Markdown links or URLs. Reply ONLY with valid JSON: {"answer":"...","suggestions":["Name1","Name2"]}`;
}

function extractChatJSON(raw: string): ChatResponse {
  const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

  // Try full JSON parse first
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    for (const candidate of [match[0], match[0].replace(/,\s*([}\]])/g, '$1')]) {
      try {
        const parsed = JSON.parse(candidate) as Record<string, unknown>;
        return {
          answer:      String(parsed.answer ?? ''),
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
        };
      } catch { /* try next */ }
    }
  }

  // Fallback: extract "answer" value via regex even if JSON is truncated
  const answerMatch = stripped.match(/"answer"\s*:\s*"([\s\S]*)/);
  if (answerMatch) {
    // The answer value may be unterminated — take everything up to the last complete sentence
    let text = answerMatch[1];
    // Remove trailing partial content after last sentence-ending punctuation
    const lastPunct = Math.max(text.lastIndexOf('.'), text.lastIndexOf('!'), text.lastIndexOf('?'));
    if (lastPunct > 50) text = text.slice(0, lastPunct + 1);
    // Extract suggestions if present
    const sugMatch = stripped.match(/"suggestions"\s*:\s*\[([\s\S]*?)\]/);
    const suggestions: string[] = [];
    if (sugMatch) {
      const names = sugMatch[1].match(/"([^"]+)"/g);
      if (names) suggestions.push(...names.map(n => n.replace(/"/g, '')));
    }
    return { answer: text.trim(), suggestions };
  }

  throw new Error('No JSON or answer field found');
}

async function callCloudflareAI(
  env: ChatEnv, systemPrompt: string, messages: ChatMessage[], question: string
): Promise<string> {
  if (!env.AI) throw new Error('AI binding not configured');
  const cfMessages = [
    { role: 'system', content: systemPrompt },
    // Last 6 messages of history (3 turns) to stay within context
    ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];
  const result = await env.AI.run('@cf/deepseek-ai/deepseek-v4.1-flash-1017', {
    messages:   cfMessages,
    max_tokens: 800,
  });
  return result.response ?? result.generated_text ?? '';
}

// Groq — OpenAI-compatible, free tier, molto affidabile
async function callGroq(
  env: ChatEnv, systemPrompt: string, messages: ChatMessage[], question: string
): Promise<string> {
  if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');
  const apiKey = env.GROQ_API_KEY.trim(); // rimuove eventuali \n dalla UI Cloudflare
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:      'openai/gpt-oss-120b',
      max_tokens: 2000,
      messages:   groqMessages,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

async function callClaudeHaiku(
  env: ChatEnv, systemPrompt: string, messages: ChatMessage[], question: string
): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
  const cfMessages = [
    ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-5-5',
      max_tokens: 600,
      system:     systemPrompt,
      messages:   cfMessages,
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json() as { content: Array<{ text: string }> };
  return data.content[0].text;
}

export const onRequestOptions = async (): Promise<Response> => cors();

export const onRequestPost = async (context: { request: Request; env: ChatEnv }): Promise<Response> => {
  let body: RequestBody;
  try {
    body = await context.request.json() as RequestBody;
  } catch {
    return jsonRes({ error: 'Invalid JSON body' }, 400);
  }

  const { entity, question, history = [], locale = 'it' } = body;
  if (!entity?.title || !question?.trim()) {
    return jsonRes({ error: 'entity and question are required' }, 400);
  }

  // Initial auto-analysis uses plain-text prompt (no JSON required → no parse failures)
  const isAnalysis = /^ANALISI\b|^ANALYSIS\b/i.test(question.trim());
  const systemPrompt = isAnalysis ? buildAnalysisPrompt(entity, locale) : buildSystemPrompt(entity, locale);
  const model = context.env.AI_MODEL ?? 'groq';

  let raw: string;
  let usedModel = model;
  try {
    if (model === 'claude-haiku') {
      raw = await callClaudeHaiku(context.env, systemPrompt, history, question);
    } else if (model === 'cloudflare-ai') {
      raw = await callCloudflareAI(context.env, systemPrompt, history, question);
    } else {
      try {
        raw = await callGroq(context.env, systemPrompt, history, question);
      } catch (groqErr) {
        if (!context.env.AI) throw groqErr;
        raw = await callCloudflareAI(context.env, systemPrompt, history, question);
        usedModel = 'cloudflare-ai';
      }
    }
  } catch (err) {
    return jsonRes({ error: `AI call failed: ${err instanceof Error ? err.message : String(err)}` }, 502);
  }

  // Plain-text path: return prose directly without JSON parsing
  if (isAnalysis) {
    return jsonRes({ ok: true, model: usedModel, data: { answer: raw.trim(), suggestions: [] } });
  }

  try {
    const parsed = extractChatJSON(raw);
    return jsonRes({ ok: true, model: usedModel, data: parsed });
  } catch {
    return jsonRes({ error: 'AI returned invalid JSON', raw: raw.slice(0, 600), model: usedModel }, 502);
  }
};
