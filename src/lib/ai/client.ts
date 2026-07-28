/**
 * Thin wrapper over the Anthropic Messages API. Returns null (rather than throwing) when
 * ANTHROPIC_API_KEY is unset, so every caller has an explicit, cheap way to fall back to
 * the template-based responses in risk-assistant.ts — the AI Risk Assistant works either
 * way, it just gets more fluent with a real key configured.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function askClaude(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }

  const body = (await res.json()) as { content: { type: string; text?: string }[] };
  return body.content.find((block) => block.type === 'text')?.text ?? null;
}
