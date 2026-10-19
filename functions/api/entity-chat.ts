// POST /api/entity-chat — conversational AI about a selected historical entity
// Follows the same AI-backend pattern as /api/summarize
/* eslint-disable @typescript-eslint/no-explicit-any */

interface ChatEnv {
  AI?: { run: (model: string, opts: object) => Promise<{ response?: string; generated_text?: string }> };
  ANTHROPIC_API_KEY?: string;
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

  if (it) return `Sei una guida storica esperta e narratrice appassionata.
L'utente ha selezionato: "${entity.title}" (${year}, categoria: ${entity.category}).
Contesto: ${entity.description}

Regole:
- Rispondi in italiano, in modo evocativo, specifico e coinvolgente (max 4 frasi)
- Aggiungi sempre dettagli storici precisi non ovvi
- Alla fine di ogni risposta proponi 3-4 entità storiche correlate da esplorare (possono essere di epoche diverse, purché tematicamente collegate)
- Rispondi SOLO con JSON valido: {"answer":"...","suggestions":["Nome1","Nome2","Nome3"]}`;

  return `You are an expert historical guide and passionate narrator.
The user selected: "${entity.title}" (${year}, category: ${entity.category}).
Context: ${entity.description}

Rules:
- Reply in English, evocatively and specifically (max 4 sentences)
- Add precise non-obvious historical details
- At the end of each reply suggest 3-4 related historical entities to explore (can be from different eras, thematically linked)
- Reply ONLY with valid JSON: {"answer":"...","suggestions":["Name1","Name2","Name3"]}`;
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
  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
    messages:   cfMessages,
    max_tokens: 800,
  });
  return result.response ?? result.generated_text ?? '';
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
  const model        = context.env.AI_MODEL ?? 'cloudflare-ai';

  let raw: string;
  try {
    raw = model === 'claude-haiku'
      ? await callClaudeHaiku(context.env, systemPrompt, history, question)
      : await callCloudflareAI(context.env, systemPrompt, history, question);
  } catch (err) {
    return jsonRes({ error: `AI call failed: ${err instanceof Error ? err.message : String(err)}` }, 502);
  }

  try {
    const parsed = extractChatJSON(raw);
    return jsonRes({ ok: true, model, data: parsed });
  } catch {
    return jsonRes({ error: 'AI returned invalid JSON', raw: raw.slice(0, 400) }, 502);
  }
};
