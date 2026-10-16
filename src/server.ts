import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type RuntimeEnv = Record<string, string | undefined>;

function envValue(env: unknown, key: string) {
  return (env as RuntimeEnv)?.[key] ?? process.env[key];
}

async function handleCareApi(request: Request, env: unknown): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (path === '/api/bmoni/subscribe' && request.method === 'POST') {
    const apiKey = envValue(env, 'BMONI_API_KEY');
    const recipientId = envValue(env, 'BMONI_CARELINK_RECIPIENT_USER_ID');
    if (!apiKey || !recipientId) return Response.json({ error: 'BMONI billing is not configured yet.' }, { status: 503 });
    const body = await request.json().catch(() => null) as { userId?: unknown; walletId?: unknown } | null;
    const userId = typeof body?.userId === 'string' ? body.userId : '';
    const walletId = typeof body?.walletId === 'string' ? body.walletId : '';
    if (!userId || !walletId) return Response.json({ error: 'Enter your BMONI user and smart-wallet IDs.' }, { status: 400 });
    const base = (envValue(env, 'BMONI_BASE_URL') ?? 'https://embedded-dev.bmoni.com').replace(/\/$/, '');
    const payment = await fetch(`${base}/v1/users/${encodeURIComponent(userId)}/smart-wallets/${encodeURIComponent(walletId)}/proposals`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ proposal: { type: 'TRANSFER', toUserId: recipientId, amount: envValue(env, 'CARELINK_PLAN_AMOUNT') ?? '5000.00', currency: envValue(env, 'CARELINK_PLAN_CURRENCY') ?? 'CNGN', description: 'CareLink monthly care subscription' } }) });
    const result = await payment.json().catch(() => null) as { data?: { proposal?: { id?: string } } } | null;
    if (!payment.ok || !result?.data?.proposal?.id) return Response.json({ error: 'BMONI could not create the payment proposal.' }, { status: 502 });
    return Response.json({ proposalId: result.data.proposal.id, message: 'Payment proposal created. Approve and sign it in your BMONI wallet to complete payment.' });
  }
  if (path !== '/api/triage') return null;
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const apiKey = envValue(env, 'OPENAI_API_KEY');
  if (!apiKey) return Response.json({ error: 'The care assistant is not configured yet.' }, { status: 503 });
  const body = await request.json().catch(() => null) as { complaint?: unknown; answers?: unknown } | null;
  const complaint = typeof body?.complaint === 'string' ? body.complaint.trim() : '';
  if (complaint.length < 10 || complaint.length > 4000) return Response.json({ error: 'Please provide a valid concern.' }, { status: 400 });
  const answers = body?.answers && typeof body.answers === 'object' ? body.answers : {};
  const input = `You are a careful healthcare intake assistant. You do not diagnose, prescribe, or reassure away emergencies. Return JSON only with summary (neutral clinician context), urgency (routine, priority, or urgent), and questions (0-4 concise follow-up questions).\nConcern: ${complaint}\nAnswers: ${JSON.stringify(answers)}`;
  const upstream = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: envValue(env, 'OPENAI_MODEL') ?? 'gpt-5-mini', input, text: { format: { type: 'json_object' } } }) });
  if (!upstream.ok) return Response.json({ error: 'The care assistant could not process this request.' }, { status: 502 });
  const result = await upstream.json() as { output_text?: string };
  try {
    const parsed = JSON.parse(result.output_text ?? '{}') as { summary?: unknown; urgency?: unknown; questions?: unknown };
    return Response.json({ summary: typeof parsed.summary === 'string' ? parsed.summary : '', urgency: ['routine', 'priority', 'urgent'].includes(String(parsed.urgency)) ? parsed.urgency : 'routine', questions: Array.isArray(parsed.questions) ? parsed.questions.filter((q): q is string => typeof q === 'string').slice(0, 4) : [] });
  } catch { return Response.json({ error: 'The care assistant returned an invalid response.' }, { status: 502 }); }
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const careApiResponse = await handleCareApi(request, env);
      if (careApiResponse) return careApiResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
