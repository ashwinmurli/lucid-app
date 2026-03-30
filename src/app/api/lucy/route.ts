import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CORE_IDENTITY = `You are Lucy, the AI strategist inside Lucid — a brand strategy tool for small creative agencies and freelance creative directors.

You are not a chatbot. You are a senior brand strategist with strong opinions, a sharp eye for clichés, and zero tolerance for vague thinking. You speak like someone who has built dozens of brands and knows what separates good from great.

Your voice:
- Concise. Never more than 2-3 sentences unless explicitly asked.
- Specific. Name the exact problem, not the category.
- Opinionated. Take a position. "This works because..." or "This doesn't work because..."
- Warm but direct. You care about the work, which is why you push.
- Never use: "Great question!", "I love that!", "That's interesting!", buzzwords, corporate jargon, or filler phrases.
- Write the way a thoughtful creative director speaks over coffee — short sentences, clear thinking, occasionally poetic.`;

function buildBrandContext(brandState: Record<string, unknown>, level: "minimal" | "personality" | "full"): string {
  const name = (brandState?.name as string) || "this brand";
  if (level === "minimal") return `Brand: ${name}`;

  const personality = brandState?.personality as Record<string, string> | undefined;
  const personalitySummary = personality
    ? Object.values(personality).filter(Boolean).slice(0, 3).join(". ")
    : "not defined yet";

  const tensions = brandState?.tensions as string[] | undefined;
  const tensionsSummary = tensions?.length ? tensions.join(", ") : "not defined yet";

  if (level === "personality") {
    return `Brand: ${name}\nPersonality: ${personalitySummary}\nTensions: ${tensionsSummary}`;
  }

  const values = brandState?.values as Array<{ word: string; definition: string }> | undefined;
  const valuesSummary = values?.length
    ? values.map((v) => `${v.word}: ${v.definition}`).join("; ")
    : "not defined yet";

  const tone = brandState?.tone as Record<string, unknown> | undefined;
  const toneSummary = tone ? JSON.stringify(tone) : "not calibrated yet";

  const usps = brandState?.usps as Array<{ claim: string }> | undefined;
  const uspsSummary = usps?.length ? usps.map((u) => u.claim).join("; ") : "not defined yet";

  const purpose = (brandState?.purpose as string) || "not defined yet";

  return `Brand: ${name}\nPersonality: ${personalitySummary}\nTensions: ${tensionsSummary}\nValues: ${valuesSummary}\nTone: ${toneSummary}\nUSPs: ${uspsSummary}\nPurpose: ${purpose}`;
}

function buildSystemPrompt(
  module: string,
  mode: string,
  action: string,
  brandState: Record<string, unknown>
): string {
  const base = CORE_IDENTITY + "\n\n";

  if (module === "personality") {
    if (mode === "support") {
      return base + `You have two modes — right now you are in SUPPORT mode.\n\nThe user is answering questions about the brand as if it were a person. Help them go deeper. What detail could make their answer more vivid and specific? Don't rewrite their answer — ask one sharp question that pushes them toward specificity.`;
    }
    return base + `You have two modes — right now you are in CHALLENGE mode.\n\nThe user is answering questions about the brand as if it were a person. Find the vague or cliché part. What would make a cynical creative director raise an eyebrow? Push them to be more specific or unexpected. One sentence, sharp.`;
  }

  if (module === "discovery") {
    if (action === "guide_brief") {
      return base + `You have two modes — right now you are in SUPPORT mode.\n\nThe user is filling in a client brief for brand strategy work. Give them a one-sentence nudge about what makes a strong answer to this specific question — what detail would be most useful for the strategy work ahead.`;
    }
    return base + `You have two modes — right now you are in CHALLENGE mode.\n\nThe user submitted a brief answer. What's missing? What would a strategist want to dig into? One sharp follow-up question or observation.`;
  }

  if (module === "tensions") {
    const ctx = buildBrandContext(brandState, "minimal");
    if (mode === "support") {
      return base + `${ctx}\n\nYou have two modes — right now you are in SUPPORT mode.\n\nThe user is choosing tension pairs that define the brand's personality. Format: "[Quality], but never [Excess]". Guide them — do the selected pairs create a coherent character? Is anything redundant or contradictory? Keep it to 2-3 sentences.`;
    }
    return base + `${ctx}\n\nYou have two modes — right now you are in CHALLENGE mode.\n\nThe user selected tension pairs. Are any generic? Could they apply to any premium brand? Push for the most distinctive vs. the one that feels like filler. Sharp, 1-2 sentences.`;
  }

  if (module === "values") {
    const ctx = buildBrandContext(brandState, "personality");
    if (action === "draft_definition") {
      return base + `${ctx}\n\nWrite one sentence that defines what this value means for THIS specific brand — not a dictionary definition, not a generic corporate value statement. It should feel like something only this brand would say. Grounded, specific, human. One sentence only.`;
    }
    return base + `${ctx}\n\nRewrite the value definition incorporating the user's feedback. Keep it to one sentence. Make it more specific to this brand, not more generic.`;
  }

  if (module === "tone") {
    const ctx = buildBrandContext(brandState, "personality");
    return base + `${ctx}\n\nIn one sentence, describe how this brand sounds at this position on the spectrum. Use a concrete metaphor or comparison — not abstract adjectives. Then give one "We say: ..." and one "We don't say: ..." example.`;
  }

  if (module === "usps") {
    const ctx = buildBrandContext(brandState, "full");
    return base + `${ctx}\n\nThe user wrote a USP claim. Write a one-sentence proof point — the evidence or reasoning behind why this claim is true. Be specific. If the claim is vague, the proof should sharpen it. Don't just rephrase the claim.`;
  }

  if (module === "manifesto") {
    const ctx = buildBrandContext(brandState, "full");
    if (action === "draft_manifesto") {
      return base + `${ctx}\n\nYou are writing a brand manifesto.\n\nWrite a manifesto of 120-180 words. It should:\n- Sound like ONE voice (the brand's voice, based on the personality)\n- Never use "we believe" more than once\n- Open with something unexpected — not a mission statement\n- Build to a statement of conviction\n- End with an invitation, not a declaration\n- Feel like it was written by a person, not a committee\n\nDo NOT use: "In a world where...", "We're not just...", "At [brand name], we...", or any opening a LinkedIn post would use.\n\nWrite only the manifesto text. No preamble, no explanation.`;
    }
    return base + `${ctx}\n\nRewrite the manifesto incorporating the user's feedback. Keep the same approximate length (120-180 words). Maintain the brand's voice. The feedback is a creative direction, not a line edit — interpret the spirit, not just the letter.\n\nWrite only the manifesto text. No preamble, no explanation.`;
  }

  return base;
}

function buildUserMessage(
  module: string,
  action: string,
  userInput: string,
  moduleState: Record<string, unknown>
): string {
  if (module === "personality") {
    return `The question was: "${moduleState.question}"\n\nThe user answered: "${userInput}"`;
  }

  if (module === "discovery") {
    if (action === "guide_brief") {
      return `The current brief question is: "${moduleState.question}"`;
    }
    return `The brief question was: "${moduleState.question}"\nThe user answered: "${userInput}"`;
  }

  if (module === "tensions") {
    const pairs = (moduleState.selectedPairs as string[])?.join(", ") || "none yet";
    return `Currently selected tension pairs: ${pairs}\n\nThe user just toggled: "${userInput}"`;
  }

  if (module === "values") {
    if (action === "draft_definition") {
      return `Value: "${moduleState.value}"\nWhy this value resonates for this brand: "${moduleState.reason}"`;
    }
    return `Value: "${moduleState.value}"\nCurrent definition: "${moduleState.currentDefinition}"\nUser's feedback: "${userInput}"`;
  }

  if (module === "tone") {
    const pos = moduleState.position as number;
    const steps = ["0", "1", "2", "3", "4"];
    const posStr = steps[Math.round(pos * 4)] ?? String(Math.round(pos * 4));
    return `Spectrum: "${moduleState.left}" ←→ "${moduleState.right}"\nPosition: ${posStr}/4 (where 0 = fully ${moduleState.left}, 4 = fully ${moduleState.right})`;
  }

  if (module === "usps") {
    return `USP claim: "${userInput}"`;
  }

  if (module === "manifesto") {
    if (action === "rewrite_manifesto") {
      return `Current manifesto:\n"${moduleState.currentManifesto}"\n\nUser's feedback: "${userInput}"`;
    }
    return "Draft the manifesto now.";
  }

  return userInput;
}

const MAX_TOKENS: Record<string, number> = {
  "personality:react_to_answer": 150,
  "discovery:guide_brief": 200,
  "discovery:react_to_brief": 200,
  "tensions:react_to_selection": 200,
  "values:draft_definition": 150,
  "values:refine_definition": 150,
  "tone:explain_position": 200,
  "usps:expand_usp": 150,
  "manifesto:draft_manifesto": 800,
  "manifesto:rewrite_manifesto": 800,
};

export async function POST(req: NextRequest) {
  const { module, mode, action, userInput, brandState = {}, moduleState = {} } = await req.json();

  const systemPrompt = buildSystemPrompt(module, mode, action, brandState);
  const userMessage = buildUserMessage(module, action, userInput, moduleState);
  const maxTokens = MAX_TOKENS[`${module}:${action}`] ?? 300;

  const stream = await anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
