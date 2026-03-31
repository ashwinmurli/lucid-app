/* ═══════════════════════════════════════════════════════════════
   LUCID — Lucy AI
   All AI calls go through /api/lucy (Next.js route → Anthropic).
   ═══════════════════════════════════════════════════════════════ */

/* ── Fallbacks (used if API call fails) ── */

export const FALLBACK_MANIFESTO = `We believe that every detail speaks. That the way something is made matters as much as what it does. That restraint is a form of confidence, and silence can say more than noise ever will.

We don't chase trends. We don't raise our voice to be heard. We show up with intention — every word chosen, every decision deliberate, every interaction designed to make people feel something real.

We tell the truth, even when it's uncomfortable. We care deeply, but we won't lower our standards to prove it. We'd rather be trusted than liked, respected than followed.

This is a brand built on craft, honesty, and quiet conviction. Not because it's easy, but because it's the only way we know how to work.`;

export const FALLBACK_QUESTIONS = [
  { id: 1, theme: "ORIGIN", q: "Why did the founders start this company — what was the original itch?", intent: "Uncovers authentic purpose vs. opportunistic positioning.", response: "" },
  { id: 2, theme: "ORIGIN", q: "What were they doing before, and what made them leave?", intent: "Reveals values and frustrations that shaped the brand's DNA.", response: "" },
  { id: 3, theme: "AUDIENCE", q: "Describe your best client — not the biggest, the best. Why them?", intent: "Surfaces ideal customer profile through emotional preference, not demographics.", response: "" },
  { id: 4, theme: "AUDIENCE", q: "What do your clients say about you when you're not in the room?", intent: "Tests whether perceived brand matches intended brand.", response: "" },
  { id: 5, theme: "COMPETITION", q: "Who do you lose to, and why? Be honest.", intent: "Identifies real competitive weaknesses, not the ones on the pitch deck.", response: "" },
  { id: 6, theme: "COMPETITION", q: "Is there a company you admire that isn't a direct competitor? What about them?", intent: "Uncovers aspirational positioning and brand values by proxy.", response: "" },
  { id: 7, theme: "CULTURE", q: "What would a new employee notice in their first week that isn't in the job description?", intent: "Reveals actual culture vs. stated culture.", response: "" },
  { id: 8, theme: "CULTURE", q: "What's a decision you made that was hard but right?", intent: "Values are revealed in trade-offs, not mission statements.", response: "" },
  { id: 9, theme: "FUTURE", q: "If everything goes right, what does the company look like in five years?", intent: "Tests whether vision is specific or generic.", response: "" },
  { id: 10, theme: "FUTURE", q: "What would you never do, no matter how profitable?", intent: "Defines boundaries — the negative space of the brand.", response: "" },
];

/* ── Core streaming helper ── */

/**
 * Stream a response from Lucy via /api/lucy.
 * @param {object} params - { module, action, userInput, brandState, moduleState }
 * @param {function} onChunk - called with the accumulated text on each chunk
 * @returns {Promise<string>} - the complete response
 */
export async function askLucyStream(params, onChunk) {
  const response = await fetch("/api/lucy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: params.module,
      action: params.action,
      userInput: params.userInput || "",
      brandState: params.brandState || {},
      moduleState: params.moduleState || {},
    }),
  });

  if (!response.ok) throw new Error(`Lucy unavailable (${response.status})`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onChunk?.(text);
  }

  return text;
}

/* ── Non-streaming helpers (Discovery question generation) ── */

async function callLucy(body) {
  try {
    const res = await fetch("/api/lucy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseLucyJSON(result) {
  if (!result) return null;
  try {
    const cleaned = result.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function generateDiscoveryQuestions(briefAnswers) {
  const briefText = briefAnswers.map((a) => `${a.q}\n${a.a}`).join("\n\n");
  const result = await callLucy({
    module: "discovery",
    action: "generate_questions",
    userInput: briefText,
    moduleState: { briefAnswers },
  });
  const parsed = parseLucyJSON(result);
  if (parsed && Array.isArray(parsed)) {
    return parsed.map((q, i) => ({ id: i + 1, ...q, response: "" }));
  }
  return FALLBACK_QUESTIONS;
}

export async function analyzeDiscoveryGaps(questions) {
  const qText = questions
    .map((q) => `[${q.theme}] ${q.q}\nResponse: ${q.response.trim() || "(no response)"}`)
    .join("\n\n");
  const result = await callLucy({
    module: "discovery",
    action: "analyze_gaps",
    userInput: qText,
    moduleState: { questions },
  });
  const parsed = parseLucyJSON(result);
  if (parsed && Array.isArray(parsed)) return parsed;

  // Fallback — check unanswered themes
  const themes = {};
  questions.forEach((q) => {
    if (!themes[q.theme]) themes[q.theme] = { total: 0, answered: 0 };
    themes[q.theme].total++;
    if (q.response.trim()) themes[q.theme].answered++;
  });
  const gaps = [];
  Object.entries(themes).forEach(([theme, { total, answered }]) => {
    if (answered === 0) gaps.push({ area: theme, note: `No responses captured for ${theme.toLowerCase()} questions.` });
    else if (answered < total) gaps.push({ area: theme, note: `Only ${answered} of ${total} ${theme.toLowerCase()} questions answered.` });
  });
  return gaps.length ? gaps : [{ area: "Depth", note: "All areas covered. Some responses could benefit from specific stories." }];
}
