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

function buildSystemPrompt(entity: EntityContext, locale: string): string {
  const it   = locale === 'it';
  const year = fmtYear(entity.year, it);

  if (it) return `Sei una guida storica appassionata che svela connessioni inaspettate tra epoche, discipline e culture.
Entità selezionata: "${entity.title}" (${year}, ${entity.category}).
Contesto: ${entity.description}

Quando l'utente dice "ANALISI" segui questo schema preciso per ogni entità correlata che elenchi:
  1. NESSO: una o due frasi che spiegano CONCRETAMENTE come quell'entità è collegata a "${entity.title}". Deve rispondere alla domanda "cosa c'entra con ${entity.title}?". Esempio: "Lorenzo Ghiberti vinse il concorso del 1401 contro Brunelleschi grazie al sostegno dei Medici — senza quel mecenate non avrebbe mai completato le Porte del Paradiso." NON scrivere frasi generiche come "X era un artista del Rinascimento" senza spiegare il legame diretto.
  2. ENTITÀ: una frase che presenta l'entità con un dettaglio affascinante e non ovvio.
  3. INVITO: una frase suggestiva che stimola l'utente a esplorarla sulla mappa. Termina con qualcosa come "Cercala sulla mappa per scoprire dove..." o "Navigaci sopra per vedere..."

Non usare link Markdown ([testo](url)) né URL. Non usare frecce (→) come prefisso. Scrivi testo piano e fluente.
Adatta la lunghezza alla richiesta: sintetico per domande dirette, articolato per analisi.
Proponi 3-5 nomi di entità navigabili (già citate nel testo) nell'array suggestions.
Rispondi SOLO con JSON valido, nessun testo fuori: {"answer":"...","suggestions":["Nome1","Nome2"]}`;

  return `You are a passionate historical guide who unveils unexpected connections across eras, disciplines and cultures.
Selected entity: "${entity.title}" (${year}, ${entity.category}).
Context: ${entity.description}

When the user says "ANALYSIS" follow this exact schema for each correlated entity you list:
  1. LINK: one or two sentences that CONCRETELY explain how that entity connects to "${entity.title}". Must answer "what does it have to do with ${entity.title}?". Example: "Lorenzo Ghiberti won the 1401 competition against Brunelleschi thanks to Medici patronage — without that backer he would never have completed the Gates of Paradise." Do NOT write generic phrases like "X was a Renaissance artist" without explaining the direct link.
  2. ENTITY: one sentence introducing the entity with a fascinating, non-obvious detail.
  3. INVITATION: a suggestive sentence that encourages the user to explore it on the map. End with something like "Find it on the map to discover..." or "Navigate to it to see..."

Do not use Markdown links ([text](url)) or URLs. Do not use arrows (→) as prefixes. Write plain, flowing prose.
Adapt length to the request: concise for direct questions, detailed for analysis.
Propose 3-5 navigable entity names (already cited in the text) in the suggestions array.
Reply ONLY with valid JSON, no text outside: {"answer":"...","suggestions":["Name1","Name2"]}`;
}

function extractChatJSON(raw: string): ChatResponse {
  const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const match    = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found');
  let parsed: any;
  try { parsed = JSON.parse(match[0]); }
  catch { parsed = JSON.parse(match[0].replace(/,\s*([}\]])/g, '$1')); }
  return {
    answer:      String(parsed.answer ?? ''),
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
  };
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
      model:      'llama-3.3-70b-versatile',
      max_tokens: 800,
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

  const systemPrompt = buildSystemPrompt(entity, locale);
  // Default: groq (affidabile, free, OpenAI-compatible)
  // Override con AI_MODEL env var: 'groq' | 'claude-haiku' | 'cloudflare-ai'
  const model = context.env.AI_MODEL ?? 'groq';

  let raw: string;
  let usedModel = model;
  try {
    if (model === 'claude-haiku') {
      raw = await callClaudeHaiku(context.env, systemPrompt, history, question);
    } else if (model === 'cloudflare-ai') {
      raw = await callCloudflareAI(context.env, systemPrompt, history, question);
    } else {
      // Groq con fallback su Cloudflare AI se la chiave manca o il servizio è down
      try {
        raw = await callGroq(context.env, systemPrompt, history, question);
      } catch (groqErr) {
        if (!context.env.AI) throw groqErr; // nessun fallback disponibile
        raw = await callCloudflareAI(context.env, systemPrompt, history, question);
        usedModel = 'cloudflare-ai';
      }
    }
  } catch (err) {
    return jsonRes({ error: `AI call failed: ${err instanceof Error ? err.message : String(err)}` }, 502);
  }

  try {
    const parsed = extractChatJSON(raw);
    return jsonRes({ ok: true, model: usedModel, data: parsed });
  } catch {
    return jsonRes({ error: 'AI returned invalid JSON', raw: raw.slice(0, 400) }, 502);
  }
};
