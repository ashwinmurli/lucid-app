/* ═══════════════════════════════════════════════════════════════
   LUCID — Summary
   Expandable accordion cards with ghost edit/copy buttons.
   ═══════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { S, ease, colors, fonts, shadows } from "../lib/tokens";
import { PixelIcon } from "../components/ui";

const MODULE_COLORS = {
  personality: "#FF8C42",
  tensions: "#FF8C42",
  purpose: "#FF6B8A",
  values: "#14B8A6",
  tone: "#4AADFF",
  usps: "#B86EED",
  manifesto: "#6366F1",
};

const SECTIONS = [
  {
    key: "personality", title: "Brand Personality",
    preview: "Unhurried. Short sentences, long pauses. Process lights them up.",
    blocks: [
      { label: "WALK INTO A ROOM", text: "Unhurried. They don't scan the room — they already seem to know where they're going." },
      { label: "HOW THEY SPEAK", text: "Short sentences, long pauses. They choose words the way other people choose wine." },
      { label: "WHAT LIGHTS THEM UP", text: "Process. How things are made. The moment someone explains the mechanics behind something beautiful." },
    ],
  },
  {
    key: "tensions", title: "Tension Pairs",
    preview: "Confident / Warm / Honest — with clear boundaries.",
    blocks: [
      { text: "Confident, but never arrogant." },
      { text: "Warm, but never soft." },
      { text: "Honest, but never blunt." },
    ],
  },
  {
    key: "purpose", title: "Purpose / Vision / Mission",
    preview: "To prove that thoughtful work outperforms loud work.",
    blocks: [
      { label: "PURPOSE", text: "To prove that thoughtful work outperforms loud work." },
      { label: "VISION", text: "A world where quality is felt before it's explained." },
      { label: "MISSION", text: "We build brands as people — with character, conviction, and a voice that earns trust." },
    ],
  },
  {
    key: "values", title: "Core Values",
    preview: "Intentionality · Craft · Honesty",
    blocks: [
      { label: "INTENTIONALITY", text: "We choose carefully — every decision, every detail, every word has a reason behind it." },
      { label: "CRAFT", text: "We care about the work behind the work — the details no one asked for but everyone feels." },
      { label: "HONESTY", text: "We tell the truth, even when it's uncomfortable — but always with care, never cruelty." },
    ],
  },
  {
    key: "tone", title: "Tone of Voice",
    preview: "Formal, serious, respectful — every word feels chosen.",
    blocks: [
      { text: "If you met this brand at a dinner party, you'd notice they're more formal than casual, clearly serious, and more respectful than irreverent. They don't lean hard on direct or nuanced — they read the room. You'd trust them immediately." },
    ],
    tags: [
      { label: "Formal", strong: true },
      { label: "Serious", strong: true },
      { label: "Respectful", strong: true },
      { label: "Matter-of-fact", strong: false },
      { label: "Direct/Nuanced", strong: false },
    ],
  },
  {
    key: "usps", title: "USPs",
    preview: "Brands as characters. Strategy and execution from the same brain.",
    blocks: [
      { label: "LEAD", text: "We build brands as characters — not identities, not guidelines, but people you'd recognise in a room." },
      { label: "SUPPORTING", text: "The person who writes the strategy is the person who designs the output. No handoffs, no dilution." },
      { label: "SUPPORTING", text: "Our brand books are built to be used daily — not admired once and forgotten." },
    ],
  },
  {
    key: "manifesto", title: "Brand Manifesto",
    preview: "We believe that every detail speaks...",
    blocks: [
      { text: "We believe that every detail speaks. That the way something is made matters as much as what it does. That restraint is a form of confidence, and silence can say more than noise ever will." },
      { text: "We don't chase trends. We don't raise our voice to be heard. We show up with intention — every word chosen, every decision deliberate." },
      { text: "We tell the truth, even when it's uncomfortable. We care deeply, but we won't lower our standards to prove it." },
      { text: "This is a brand built on craft, honesty, and quiet conviction. Not because it's easy, but because it's the only way we know how to work." },
    ],
  },
];

function buildSectionText(section) {
  return section.blocks.map((b) => b.label ? `${b.label}\n${b.text}` : b.text).join("\n\n");
}
function buildAllText() {
  return SECTIONS.map((s) => `${s.title.toUpperCase()}\n\n${buildSectionText(s)}`).join("\n\n───────────────\n\n");
}

/* ── Summary Card ── */
function SummaryCard({ section, isExpanded, onToggle, copied, onCopy, onEdit, index }) {
  const [hover, setHover] = useState(false);
  const moduleColor = MODULE_COLORS[section.key] || colors.accent;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: S.card, borderRadius: 4,
        border: `1px solid ${isExpanded ? `${moduleColor}26` : "rgba(44,40,36,0.06)"}`,
        boxShadow: hover
          ? shadows.cardHover
          : S.raised,
        overflow: "hidden",
        transition: `all 0.2s ${ease}`,
        transform: hover && !isExpanded ? "translateY(-1px)" : "translateY(0)",
        animation: `promptIn 0.4s ${ease} ${index * 0.05}s both`,
      }}
    >
      {/* Header row — color bar + title left, button bar flush right */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Title area — clickable to expand */}
        <div onClick={onToggle} style={{
          flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10,
          padding: "0 16px", cursor: "pointer", userSelect: "none",
        }}>
          {/* Module color bar */}
          <div style={{
            width: 4, height: 16, borderRadius: 2, flexShrink: 0,
            background: moduleColor,
            opacity: isExpanded ? 1 : 0.5,
            transition: `opacity 0.2s ${ease}`,
          }} />
          {/* Chevron */}
          <span style={{
            fontSize: 14, color: isExpanded ? moduleColor : "rgba(44,40,36,0.35)",
            display: "inline-block", flexShrink: 0,
            fontFamily: fonts.primary,
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: `transform 0.25s ${ease}, color 0.2s ease`,
          }}>›</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: S.text, letterSpacing: "-0.01em" }}>{section.title}</span>

          {/* Collapsed tone tags */}
          {!isExpanded && section.tags && (
            <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
              {section.tags.filter(t => t.strong).map((t, j) => (
                <span key={j} style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "2px 6px", borderRadius: 3,
                  background: `${colors.tone}18`,
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  color: colors.tone,
                }}>{t.label}</span>
              ))}
            </div>
          )}
        </div>

        {/* Button bar — ghost style */}
        <div style={{ display: "flex", flexShrink: 0, gap: 2, alignItems: "center", padding: "0 8px" }}>
          <button onClick={onEdit} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "5px 10px",
            border: "1px solid rgba(44,40,36,0.08)", background: "transparent",
            borderRadius: 3, cursor: "pointer",
            fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "rgba(44,40,36,0.3)",
            transition: "color 0.15s ease", userSelect: "none",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = S.text}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(44,40,36,0.3)"}
          >EDIT</button>
          <button onClick={() => onCopy()} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            padding: "5px 10px",
            border: "1px solid rgba(44,40,36,0.08)", background: "transparent",
            borderRadius: 3, cursor: "pointer",
            fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
            color: copied ? S.lcdBright : "rgba(44,40,36,0.3)",
            transition: "all 0.15s ease", userSelect: "none",
          }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = S.accent; }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = copied ? S.lcdBright : "rgba(44,40,36,0.3)"; }}
          >
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: copied ? S.lcdBright : "currentColor" }} />
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>

      {/* Content — expandable */}
      <div style={{
        display: "grid",
        gridTemplateRows: isExpanded ? "1fr" : "0fr",
        transition: `grid-template-rows 0.35s ${ease}`,
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ height: 1, background: "rgba(44,40,36,0.04)" }} />
          <div style={{ padding: "14px 16px 16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {section.blocks.map((block, j) => (
                <div key={j}>
                  {block.label && (
                    <div style={{
                      fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: block.label === "LEAD" ? S.accent : "rgba(44,40,36,0.15)",
                      marginBottom: 4,
                    }}>{block.label}</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 400, color: S.text, lineHeight: 1.65, letterSpacing: "-0.01em" }}>{block.text}</div>
                </div>
              ))}
            </div>

            {section.tags && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
                {section.tags.map((t, j) => (
                  <div key={j} style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "4px 8px", borderRadius: 4,
                    background: t.strong ? `${colors.tone}18` : "rgba(44,40,36,0.04)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)",
                    fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: t.strong ? colors.tone : "rgba(44,40,36,0.25)",
                  }}>{t.label}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function Summary({ onBack } = {}) {
  const [expanded, setExpanded] = useState({ [SECTIONS[0].key]: true });
  const [copied, setCopied] = useState(null);

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const copy = (key, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: fonts.primary, color: S.text, position: "relative", background: "#D8D5CE" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
        @keyframes promptIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        * { box-sizing:border-box; margin:0; padding:0; }
        textarea:focus, input:focus { outline:none; }
        ::selection { background:rgba(229,166,50,0.12); }
        textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.25); }
        .summary-scroll::-webkit-scrollbar { width:3px; }
        .summary-scroll::-webkit-scrollbar-track { background:transparent; }
        .summary-scroll::-webkit-scrollbar-thumb { background:rgba(44,40,36,0.06); border-radius:3px; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #EDEAE4 0%, #E5E2DB 100%)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "6px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${S.border}`, background: S.panel, boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, background: S.text, color: "#EDEAE4", boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer" }}>LUCID</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 10px", borderRadius: 4, height: 24, background: "rgba(44,40,36,0.04)", boxShadow: "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(44,40,36,0.35)" }}>Summary</span>
            </div>
          </div>
        </div>

        {/* Scrollable canvas */}
        <div className="summary-scroll" style={{ flex: 1, overflowY: "auto", padding: "40px 24px 80px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SECTIONS.map((section, i) => (
                <SummaryCard
                  key={section.key}
                  section={section}
                  index={i}
                  isExpanded={!!expanded[section.key]}
                  onToggle={() => toggle(section.key)}
                  copied={copied === section.key}
                  onCopy={() => copy(section.key, buildSectionText(section))}
                  onEdit={() => { /* In production: navigate to module */ alert(`Navigate to: ${section.title}`); }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Fixed footer bar — Copy All + Lucy */}
        <div style={{
          flexShrink: 0,
          padding: "8px 20px",
          borderTop: `1px solid ${S.border}`,
          background: S.panel,
          boxShadow: "0 -1px 0 rgba(255,255,255,0.4) inset, 0 -1px 3px rgba(0,0,0,0.02)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Lucy completion badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
              borderRadius: 3, background: S.screen,
              boxShadow: "0 1px 3px rgba(0,0,0,0.15) inset, 0 1px 0 rgba(255,255,255,0.04)",
            }}>
              <PixelIcon icon="approves" color={S.lcdBright} size={14} />
              <span style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 9, color: S.lcdBright }}>BRAND COMPLETE</span>
              <span style={{ fontFamily: "'DotGothic16', monospace", letterSpacing: "0.08em", fontSize: 9, color: S.lcdDim, marginLeft: 2 }}>{SECTIONS.length} modules</span>
            </div>
          </div>

          {/* Copy all button */}
          <button onClick={() => copy("all", buildAllText())} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
            borderRadius: 4, border: "none", cursor: "pointer",
            fontFamily: fonts.primary, fontSize: 10, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: copied === "all" ? S.lcdBright : S.text,
            background: copied === "all" ? "rgba(229,166,50,0.08)" : `linear-gradient(180deg, #F0ECE5 0%, ${S.card} 100%)`,
            boxShadow: copied === "all"
              ? "0 1px 2px rgba(0,0,0,0.03) inset, 0 1px 0 rgba(255,255,255,0.5)"
              : S.raised,
            transition: "all 0.15s ease", userSelect: "none",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: copied === "all" ? S.lcdBright : S.accent }} />
            {copied === "all" ? "COPIED" : "COPY ALL"}
          </button>
        </div>
      </div>
    </div>
  );
}
