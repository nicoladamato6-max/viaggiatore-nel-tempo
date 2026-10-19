// POST /api/summarize — AI historical briefing for the Time Machine
// AI_MODEL env var controls the backend:
//   'cloudflare-ai' (default) → Workers AI Llama 3 (free, requires AI binding)
//   'claude-haiku'            → Anthropic claude-haiku-5-5 (requires ANTHROPIC_API_KEY)
//   'gpt-4o-mini'             → OpenAI gpt-4o-mini (requires OPENAI_API_KEY)
/* eslint-disable @typescript-eslint/no-explicit-any */

interface SummarizeEnv {
  AI?: { run: (model: string, opts: object) => Promise<{ response?: string; generated_text?: string }> };
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  AI_MODEL?: string;
}

interface EventSummary {
  title: string;
  year: number;
  category: string;
  description?: string;
}

interface PagesContext {
  request: Request;
  env: SummarizeEnv;
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

function fmtYear(year: number, it: boolean) {
  const abs = Math.abs(year);
  if (abs >= 1e9) return `${(abs / 1e9).toFixed(1)} ${it ? 'miliardi di anni fa' : 'billion years ago'}`;
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(0)} ${it ? 'milioni di anni fa' : 'million years ago'}`;
  const era = year < 0 ? (it ? 'a.C.' : 'BC') : (it ? 'd.C.' : 'AD');
  return `${abs.toLocaleString('it')} ${era}`;
}

function buildPrompt(year: number, events: EventSummary[], locale: string): string {
  const it = locale === 'it';
  const yearLabel = fmtYear(year, it);
  const ctx = events.slice(0, 30).map(e => {
    const y = fmtYear(e.year, it);
    return `- ${e.title} (${y}, ${e.category})${e.description ? ': ' + e.description.slice(0, 80) : ''}`;
  }).join('\n');

  return it
    ? `Sei un narratore storico appassionato. Un viaggiatore del tempo è appena atterrato nell'anno ${yearLabel}.

Contesto — eventi storici di quell'epoca (usa solo questi, non inventare):
${ctx}

Rispondi SOLO con un oggetto JSON valido, senza markdown, senza commenti:
{"dove":"2-3 frasi evocative in italiano su dove sei atterrato. Tono cinematografico, presente indicativo.","top5":["cosa da vedere/vivere 1 (max 20 parole)","cosa 2","cosa 3","cosa 4","cosa 5"],"connessioni":"2-3 frasi sorprendenti su come questi eventi hanno plasmato il futuro. Qualcosa di non ovvio."}`
    : `You are a passionate historical narrator. A time traveler just landed in the year ${yearLabel}.

Context — historical events of that era (use only these, don't invent):
${ctx}

Reply ONLY with valid JSON, no markdown, no comments:
{"dove":"2-3 evocative sentences in English about where you landed. Cinematic tone, present tense.","top5":["thing to see/experience 1 (max 20 words)","thing 2","thing 3","thing 4","thing 5"],"connessioni":"2-3 surprising sentences on how these events shaped the future. Something non-obvious."}`;
}

async function callCloudflareAI(env: SummarizeEnv, prompt: string): Promise<string> {
  if (!env.AI) throw new Error('AI binding not configured');
  const result = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
    messages: [
      { role: 'system', content: 'Respond only with valid JSON. No markdown. No explanation.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 700,
  });
  return result.response ?? result.generated_text ?? '';
}

async function callClaudeHaiku(env: SummarizeEnv, prompt: string): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-5-5',
      max_tokens: 700,
      system: 'Respond only with valid JSON. No markdown. No explanation.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json() as { content: Array<{ text: string }> };
  return data.content[0].text;
}

async function callGPT4oMini(env: SummarizeEnv, prompt: string): Promise<string> {
  if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 700,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Respond only with valid JSON. No markdown.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0].message.content;
}

function extractJSON(raw: string): Record<string, unknown> {
  // Estrae il primo oggetto JSON dal testo (alcuni modelli aggiungono testo prima/dopo)
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]);
}

export const onRequestOptions = async (): Promise<Response> => cors();

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  let body: { year?: number; events?: EventSummary[]; locale?: string };
  try {
    body = await context.request.json() as typeof body;
  } catch {
    return jsonRes({ error: 'Invalid JSON body' }, 400);
  }

  const { year, events = [], locale = 'it' } = body;
  if (year === undefined || !Number.isFinite(year)) {
    return jsonRes({ error: 'year is required' }, 400);
  }

  const prompt = buildPrompt(year, events, locale);
  const model  = context.env.AI_MODEL ?? 'cloudflare-ai';

  let raw: string;
  try {
    if (model === 'claude-haiku') {
      raw = await callClaudeHaiku(context.env, prompt);
    } else if (model === 'gpt-4o-mini') {
      raw = await callGPT4oMini(context.env, prompt);
    } else {
      raw = await callCloudflareAI(context.env, prompt);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonRes({ error: `AI call failed: ${msg}` }, 502);
  }

  try {
    const parsed = extractJSON(raw);
    return jsonRes({ ok: true, model, data: parsed });
  } catch {
    return jsonRes({ error: 'AI returned invalid JSON', raw: raw.slice(0, 400) }, 502);
  }
};
