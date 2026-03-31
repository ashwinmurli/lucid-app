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
  action: string,
  brandState: Record<string, unknown>
): string {
  const base = CORE_IDENTITY + "\n\n";

  if (module === "personality") {
    if (action === "challenge") return base + `The user is answering questions about the brand as if it were a person. Find the vague or cliché part. What would make a cynical creative director raise an eyebrow? Push them to be more specific or unexpected. One sentence, sharp.`;
    if (action === "sharpen") return base + `The user wrote an answer about the brand personality. Make it sharper — tighter language, more vivid detail, less filler. Suggest one specific edit in 1-2 sentences.`;
    if (action === "deeper") return base + `The user answered a brand personality question. Ask one follow-up question that goes deeper — beneath the surface answer to the real feeling or detail underneath. One sharp question only.`;
    if (action === "rewrite") return base + `The user wants help rewriting their answer. Rewrite it in 1-2 sentences — keep their meaning but make it more vivid, specific, and alive. Write only the rewritten text.`;
    if (action === "starting_point") return base + `The user is staring at a blank page for a brand personality question. Give them a specific, vivid starting point — not a full answer, just enough to break the ice. One sentence that makes them think "yes, and...". Write only the starting text.`;
    return base + `The user is answering questions about the brand as if it were a person. React to their answer in 1-2 sentences.`;
  }

  if (module === "discovery") {
    if (action === "challenge") return base + `The user submitted a discovery/brief answer. What's missing? What would a strategist want to dig into? One sharp follow-up question or observation.`;
    if (action === "deeper") return base + `The user answered a discovery question. Ask one follow-up that pushes beneath the surface answer. One question only.`;
    return base + `The user is filling in a client brief. Give a one-sentence nudge about what makes a strong answer to this question.`;
  }

  if (module === "tensions") {
    const ctx = buildBrandContext(brandState, "minimal");
    if (action === "suggest") return base + `${ctx}\n\nSuggest one tension pair for this brand in the format "[Quality], but never [Excess]". Explain in one sentence why this tension is distinctive for this brand. Be specific — avoid generic premium brand tensions.`;
    if (action === "challenge_tensions") return base + `${ctx}\n\nThe user selected tension pairs. Are any generic? Could they apply to any premium brand? Push for the most distinctive vs. the one that feels like filler. Sharp, 1-2 sentences.`;
    return base + `${ctx}\n\nThe user is working on tension pairs. React in 1-2 sentences.`;
  }

  if (module === "values") {
    const ctx = buildBrandContext(brandState, "personality");
    if (action === "draft_definition") return base + `${ctx}\n\nWrite one sentence that defines what this value means for THIS specific brand — not a dictionary definition, not a generic corporate value statement. It should feel like something only this brand would say. Grounded, specific, human. One sentence only.`;
    if (action === "specific") return base + `${ctx}\n\nThe user's value definition is too broad. Make it more specific to THIS brand. What would make a competitor unable to claim the same definition? Rewrite in one sentence.`;
    if (action === "distinctive") return base + `${ctx}\n\nChallenge the value definition — could any premium brand say this? What makes it truly distinctive? Push the user in 1-2 sentences.`;
    if (action === "different_angle") return base + `${ctx}\n\nRewrite the value definition from a completely different angle. Same value word, fresh perspective. One sentence only.`;
    return base + `${ctx}\n\nRewrite the value definition incorporating the user's feedback. Keep it to one sentence. Make it more specific to this brand, not more generic.`;
  }

  if (module === "tone") {
    const ctx = buildBrandContext(brandState, "personality");
    if (action === "explain") return base + `${ctx}\n\nExplain why these tone positions make sense for this brand. Reference the personality work. Keep it to 2-3 sentences — grounded, not generic.`;
    if (action === "challenge_positions") return base + `${ctx}\n\nChallenge the tone positions. Are any too safe? Too expected? Where should this brand be bolder or more surprising? 1-2 sentences, sharp.`;
    if (action === "example_copy") return base + `${ctx}\n\nWrite 2-3 short example sentences that show how this brand would sound at these tone positions. Each sentence should feel distinctly like this brand.`;
    return base + `${ctx}\n\nIn one sentence, describe how this brand sounds at this position on the spectrum. Use a concrete metaphor or comparison.`;
  }

  if (module === "usps") {
    const ctx = buildBrandContext(brandState, "full");
    if (action === "expand_usp") return base + `${ctx}\n\nThe user wrote a USP claim. Write a one-sentence proof point — the evidence or reasoning behind why this claim is true. Be specific. Don't just rephrase the claim.`;
    if (action === "challenge_usp") return base + `${ctx}\n\nChallenge this USP — is it truly unique? Could a competitor say the same thing? What would make it sharper? 1-2 sentences.`;
    if (action === "suggest") return base + `${ctx}\n\nSuggest one USP for this brand based on all the brand work so far. Write the claim in one sentence. Then a one-sentence proof.`;
    return base + `${ctx}\n\nThe user is working on USPs. React in 1-2 sentences.`;
  }

  if (module === "manifesto") {
    const ctx = buildBrandContext(brandState, "full");
    if (action === "draft_manifesto") return base + `${ctx}\n\nYou are writing a brand manifesto.\n\nWrite a manifesto of 120-180 words. It should:\n- Sound like ONE voice (the brand's voice, based on the personality)\n- Never use "we believe" more than once\n- Open with something unexpected — not a mission statement\n- Build to a statement of conviction\n- End with an invitation, not a declaration\n- Feel like it was written by a person, not a committee\n\nDo NOT use: "In a world where...", "We're not just...", "At [brand name], we...", or any opening a LinkedIn post would use.\n\nWrite only the manifesto text. No preamble, no explanation.`;
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
  "personality:challenge": 150, "personality:sharpen": 150, "personality:deeper": 150,
  "personality:rewrite": 200, "personality:starting_point": 150,
  "discovery:challenge": 200, "discovery:deeper": 200, "discovery:guide_brief": 200,
  "tensions:suggest": 200, "tensions:challenge_tensions": 200,
  "values:draft_definition": 150, "values:refine_definition": 150,
  "values:specific": 150, "values:distinctive": 150, "values:different_angle": 150,
  "tone:explain": 250, "tone:challenge_positions": 200, "tone:example_copy": 250,
  "usps:expand_usp": 150, "usps:challenge_usp": 200, "usps:suggest": 200,
  "manifesto:draft_manifesto": 800, "manifesto:rewrite_manifesto": 800,
};

export async function POST(req: NextRequest) {
  const { module, action, userInput, brandState = {}, moduleState = {} } = await req.json();

  const systemPrompt = buildSystemPrompt(module, action, brandState);
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
