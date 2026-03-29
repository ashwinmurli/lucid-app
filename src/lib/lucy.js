/* ═══════════════════════════════════════════════════════════════
   LUCID — Lucy AI
   System prompts, API helper, and all AI interaction logic.
   In production: these calls go through the Anthropic API.
   In sandbox: fallbacks kick in after 15s timeout.
   ═══════════════════════════════════════════════════════════════ */

export const LUCY_SYSTEM = `You are Lucy, a senior brand strategist and creative director. You are opinionated, warm but direct, and you write with craft — no filler, no corporate language. You challenge weak thinking and reward specificity. You never use bullet points in prose. You never say "leverage", "synergy", "innovative", or any corporate cliché.`;

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

/**
 * Send a prompt to Lucy via the Anthropic API.
 * Returns the response text, or null on failure.
 * 15s timeout ensures the UI never hangs.
 */
export async function askLucy(prompt, systemExtra = "") {
  const sys = LUCY_SYSTEM + (systemExtra ? "\n\n" + systemExtra : "");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: sys,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch (e) {
    return null;
  }
}

/**
 * Parse a JSON response from Lucy, stripping markdown fences.
 * Returns parsed object or null.
 */
export function parseLucyJSON(result) {
  if (!result) return null;
  try {
    const cleaned = result.replace(/```json\n?|```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

/* ── AI Actions ── */

export async function generateDiscoveryQuestions(briefAnswers) {
  const briefText = briefAnswers.map((a) => `${a.q}\n${a.a}`).join("\n\n");
  const result = await askLucy(
    `Based on this client brief, generate 8 tailored discovery questions to ask in a client interview. Group them by theme (ORIGIN, AUDIENCE, COMPETITION, CULTURE, FUTURE). For each question, include the strategic intent.\n\nClient brief:\n${briefText}\n\nRespond ONLY with a JSON array, no backticks: [{"theme":"ORIGIN","q":"question text","intent":"what this uncovers"}]`,
    "Generate discovery questions for brand strategy interviews. Be specific to this client. Always return valid JSON only."
  );
  const parsed = parseLucyJSON(result);
  if (parsed && Array.isArray(parsed)) {
    return parsed.map((q, i) => ({ id: i + 1, ...q, response: "" }));
  }
  return FALLBACK_QUESTIONS;
}

export async function analyzeDiscoveryGaps(questions) {
  const qText = questions.map((q) => `[${q.theme}] ${q.q}\nResponse: ${q.response.trim() || "(no response)"}`).join("\n\n");
  const result = await askLucy(
    `Review these discovery interview responses and identify 2-4 gaps.\n\n${qText}\n\nRespond ONLY with a JSON array: [{"area":"theme name","note":"specific actionable note"}]`,
    "Analyze discovery responses for brand strategy gaps. Be specific and actionable."
  );
  const parsed = parseLucyJSON(result);
  if (parsed && Array.isArray(parsed)) return parsed;

  // Smart fallback — check which themes have no responses
  const themes = {};
  questions.forEach((q) => {
    if (!themes[q.theme]) themes[q.theme] = { total: 0, answered: 0 };
    themes[q.theme].total++;
    if (q.response.trim()) themes[q.theme].answered++;
  });
  const gaps = [];
  Object.entries(themes).forEach(([theme, { total, answered }]) => {
    if (answered === 0) gaps.push({ area: theme, note: `No responses captured for ${theme.toLowerCase()} questions. This area needs follow-up.` });
    else if (answered < total) gaps.push({ area: theme, note: `Only ${answered} of ${total} ${theme.toLowerCase()} questions answered. The gaps could weaken positioning work.` });
  });
  return gaps.length ? gaps : [{ area: "Depth", note: "All areas covered, but some responses could benefit from specific stories and examples." }];
}

export async function composeManifesto(briefAnswers, questions) {
  const briefText = briefAnswers.map((a) => `${a.q}: ${a.a}`).join("\n");
  const discoveryText = questions.filter((q) => q.response.trim()).map((q) => `${q.q}: ${q.response}`).join("\n");
  const result = await askLucy(
    `Write a brand manifesto. 3-4 paragraphs. Sound like the brand speaking — a quiet declaration of belief.\n\nClient brief:\n${briefText}\n\nDiscovery responses:\n${discoveryText}`,
    "Write brand manifestos. Sharp, warm, crafted. Every word chosen. Write in the brand's voice. Avoid clichés."
  );
  return result || FALLBACK_MANIFESTO;
}

export async function rewriteManifesto(currentText, notes, generalDirection) {
  const notesText = notes?.length ? `\n\nSpecific notes:\n${notes.map((n) => `"${n.selected}" → ${n.note}`).join("\n")}` : "";
  const directionText = generalDirection ? `\n\nGeneral direction: ${generalDirection}` : "";
  const result = await askLucy(
    `Rewrite this brand manifesto. Keep 3-4 paragraphs. Address the feedback.${notesText}${directionText}\n\nCurrent manifesto:\n${currentText}`,
    "Rewrite based on editorial feedback. Address each note. Keep the voice consistent. Just write the new version."
  );
  return result || null;
}
