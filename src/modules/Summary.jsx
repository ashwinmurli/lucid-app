/* ═══════════════════════════════════════════════════════════════
   LUCID — Summary V3
   All sections always visible, no accordion. Lucy module at top.
   ═══════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { S, ease, colors, fonts, shadows, fontImports, globalStyles } from "../lib/tokens";
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
    blocks: [
      { label: "WALK INTO A ROOM", text: "Unhurried. They don't scan the room — they already seem to know where they're going." },
      { label: "HOW THEY SPEAK", text: "Short sentences, long pauses. They choose words the way other people choose wine." },
      { label: "WHAT LIGHTS THEM UP", text: "Process. How things are made. The moment someone explains the mechanics behind something beautiful." },
    ],
  },
  {
    key: "tensions", title: "Tension Pairs",
    blocks: [
      { quality: "Confident", excess: "arrogant" },
      { quality: "Warm", excess: "soft" },
      { quality: "Honest", excess: "blunt" },
    ],
  },
  {
    key: "purpose", title: "Purpose / Vision / Mission",
    blocks: [
      { label: "PURPOSE", text: "To prove that thoughtful work outperforms loud work." },
      { label: "VISION", text: "A world where quality is felt before it's explained." },
      { label: "MISSION", text: "We build brands as people — with character, conviction, and a voice that earns trust." },
    ],
  },
  {
    key: "values", title: "Core Values",
    blocks: [
      { label: "INTENTIONALITY", text: "We choose carefully — every decision, every detail, every word has a reason behind it." },
      { label: "CRAFT", text: "We care about the work behind the work — the details no one asked for but everyone feels." },
      { label: "HONESTY", text: "We tell the truth, even when it's uncomfortable — but always with care, never cruelty." },
    ],
  },
  {
    key: "tone", title: "Tone of Voice",
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
    blocks: [
      { label: "LEAD", claim: "We build brands as characters — not identities, not guidelines, but people you'd recognise in a room.", proof: "Every brand we deliver has a name, a personality profile, and a voice guide written as if the brand were a person." },
      { label: "SUPPORTING", claim: "The person who writes the strategy is the person who designs the output. No handoffs, no dilution.", proof: null },
      { label: "SUPPORTING", claim: "Our brand books are built to be used daily — not admired once and forgotten.", proof: null },
    ],
  },
  {
    key: "manifesto", title: "Brand Manifesto",
    blocks: [
      { text: "We believe that every detail speaks. That the way something is made matters as much as what it does. That restraint is a form of confidence, and silence can say more than noise ever will." },
      { text: "We don't chase trends. We don't raise our voice to be heard. We show up with intention — every word chosen, every decision deliberate." },
      { text: "We tell the truth, even when it's uncomfortable. We care deeply, but we won't lower our standards to prove it." },
      { text: "This is a brand built on craft, honesty, and quiet conviction. Not because it's easy, but because it's the only way we know how to work." },
    ],
  },
];

function buildSectionText(section) {
  if (section.key === "tensions") {
    return section.blocks.map((b) => `${b.quality}, but never ${b.excess}.`).join("\n");
  }
  if (section.key === "usps") {
    return section.blocks.map((b) => {
      let t = `${b.label}\n${b.claim}`;
      if (b.proof) t += `\nProof: ${b.proof}`;
      return t;
    }).join("\n\n");
  }
  return section.blocks.map((b) => b.label ? `${b.label}\n${b.text}` : b.text).join("\n\n");
}
function buildAllText() {
  return SECTIONS.map((s) => `${s.title.toUpperCase()}\n\n${buildSectionText(s)}`).join("\n\n───────────────\n\n");
}

/* ── Copy SVG Icon ── */
function CopyIcon({ size = 10, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M4 2h11v2H4zm0 18h11v2H4zM2 4h2v16H2zm13 0h2v16h-2zM7 6h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2z"/>
    </svg>
  );
}

/* ── Section Card ── */
function SectionCard({ section, copied, onCopy, onEdit, index }) {
  const moduleColor = MODULE_COLORS[section.key] || colors.accent;
  const isTensions = section.key === "tensions";
  const isTone = section.key === "tone";
  const isManifesto = section.key === "manifesto";
  const isUsps = section.key === "usps";

  const manifestoText = isManifesto ? section.blocks.map(b => b.text).join("\n\n") : "";
  const manifestoWordCount = isManifesto ? manifestoText.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div
      style={{
        background: S.card,
        borderRadius: 6,
        border: `1px solid rgba(44,40,36,0.06)`,
        boxShadow: shadows.raised,
        overflow: "hidden",
        animation: `promptIn 0.4s ${ease} ${index * 0.05}s both`,
      }}
    >
      {/* Header — color bar + title + Edit / Copy */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Color bar */}
          <div style={{
            width: 3, height: 18, borderRadius: 2, flexShrink: 0,
            background: moduleColor,
          }} />
          {/* Title in DotGothic16 */}
          <span style={{
            fontFamily: fonts.pixel, letterSpacing: "0.08em",
            fontSize: 16,
            transform: "scale(0.5)",
            transformOrigin: "left center",
            whiteSpace: "nowrap",
            color: S.text,
            letterSpacing: "0.04em",
          }}>{section.title}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Edit — text button */}
          <button onClick={onEdit} style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: fonts.pixel, letterSpacing: "0.08em",
            fontSize: 16,
            transform: "scale(0.5)",
            transformOrigin: "right center",
            color: "rgba(44,40,36,0.3)",
            transition: "color 0.15s ease",
            padding: 0, userSelect: "none",
            letterSpacing: "0.04em",
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = S.text}
            onMouseLeave={(e) => e.currentTarget.style.color = "rgba(44,40,36,0.3)"}
          >Edit</button>

          {/* Copy — pill with icon */}
          <button onClick={() => onCopy()} style={{
            display: "flex", alignItems: "center", gap: 4,
            background: copied ? "rgba(229,166,50,0.08)" : "rgba(44,40,36,0.04)",
            border: "1px solid rgba(44,40,36,0.06)",
            borderRadius: 10, cursor: "pointer",
            padding: "3px 8px 3px 6px",
            color: copied ? colors.lcd : "rgba(44,40,36,0.3)",
            transition: "all 0.15s ease", userSelect: "none",
          }}
            onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = S.text; }}
            onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = "rgba(44,40,36,0.3)"; }}
          >
            <CopyIcon size={10} />
            <span style={{
              fontFamily: fonts.pixel, letterSpacing: "0.08em",
              fontSize: 16,
              transform: "scale(0.5)",
              transformOrigin: "left center",
              whiteSpace: "nowrap",
              letterSpacing: "0.04em",
            }}>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(44,40,36,0.04)", margin: "0 14px" }} />

      {/* Content */}
      <div style={{ padding: "12px 14px 16px" }}>

        {/* ── Tension Pairs ── */}
        {isTensions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {section.blocks.map((b, j) => (
              <div key={j} style={{ fontSize: 14, lineHeight: 1.65, letterSpacing: "-0.01em" }}>
                <span style={{ fontWeight: 600, color: S.text }}>{b.quality}</span>
                <span style={{ color: "rgba(44,40,36,0.25)", fontWeight: 400 }}>{" "}but never{" "}</span>
                <span style={{ fontWeight: 400, color: "rgba(44,40,36,0.5)" }}>{b.excess}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Tone of Voice ── */}
        {isTone && (
          <>
            <div style={{ fontSize: 13, fontWeight: 400, color: S.text, lineHeight: 1.65, letterSpacing: "-0.01em" }}>
              {section.blocks[0].text}
            </div>
            {section.tags && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                {section.tags.map((t, j) => (
                  <div key={j} style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "4px 8px", borderRadius: 4,
                    background: t.strong ? "rgba(74,173,255,0.08)" : "rgba(74,173,255,0.04)",
                    fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: t.strong ? "#2A7CC9" : "rgba(74,173,255,0.35)",
                  }}>{t.label}</div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── USPs ── */}
        {isUsps && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {section.blocks.map((b, j) => (
              <div key={j}>
                {/* Badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "2px 6px", borderRadius: 3, marginBottom: 4,
                  background: b.label === "LEAD" ? "rgba(229,166,50,0.08)" : "rgba(44,40,36,0.04)",
                  fontFamily: fonts.pixel, letterSpacing: "0.08em",
                  fontSize: 16,
                  transform: "scale(0.5)",
                  transformOrigin: "left center",
                  letterSpacing: "0.06em",
                  color: b.label === "LEAD" ? "#C48B1E" : "rgba(44,40,36,0.2)",
                }}>{b.label}</div>
                {/* Claim */}
                <div style={{ fontSize: 13, fontWeight: 400, color: S.text, lineHeight: 1.65, letterSpacing: "-0.01em" }}>
                  {b.claim}
                </div>
                {/* Proof */}
                {b.proof && (
                  <div style={{ fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.45)", lineHeight: 1.55, marginTop: 4, letterSpacing: "-0.01em" }}>
                    {b.proof}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Manifesto ── */}
        {isManifesto && (
          <>
            <div style={{ fontSize: 15, fontWeight: 400, color: S.text, lineHeight: 1.85, letterSpacing: "-0.01em" }}>
              {section.blocks.map((b, j) => (
                <span key={j}>
                  {j > 0 && <><br /><br /></>}
                  {b.text}
                </span>
              ))}
            </div>
            <div style={{
              marginTop: 10,
              fontFamily: fonts.pixel, letterSpacing: "0.08em",
              fontSize: 16,
              transform: "scale(0.5)",
              transformOrigin: "left center",
              color: "rgba(44,40,36,0.2)",
              letterSpacing: "0.04em",
            }}>{manifestoWordCount} words</div>
          </>
        )}

        {/* ── Default blocks (personality, purpose, values) ── */}
        {!isTensions && !isTone && !isUsps && !isManifesto && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {section.blocks.map((block, j) => (
              <div key={j}>
                {block.label && (
                  <div style={{
                    fontFamily: fonts.pixel, letterSpacing: "0.08em",
                    fontSize: 16,
                    transform: "scale(0.5)",
                    transformOrigin: "left center",
                    letterSpacing: "0.06em",
                    color: "rgba(44,40,36,0.2)",
                    marginBottom: 3,
                  }}>{block.label}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 400, color: S.text, lineHeight: 1.65, letterSpacing: "-0.01em" }}>
                  {block.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function Summary({ onBack } = {}) {
  const [copied, setCopied] = useState(null);

  const copy = (key, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden", fontFamily: fonts.primary, color: S.text, position: "relative", background: colors.rootBg }}>
      <style>{`
        ${fontImports}
        ${globalStyles}
        .summary-scroll::-webkit-scrollbar { width:3px; }
        .summary-scroll::-webkit-scrollbar-track { background:transparent; }
        .summary-scroll::-webkit-scrollbar-thumb { background:rgba(44,40,36,0.06); border-radius:3px; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${colors.gradientTop} 0%, ${colors.gradientBottom} 100%)`, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* ── Header ── */}
        <div style={{
          padding: "6px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: `1px solid ${S.border}`,
          background: S.panel,
          boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 1px 3px rgba(0,0,0,0.02)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => onBack?.()} style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "3px 8px", borderRadius: 2,
              background: S.text, color: colors.gradientTop,
              boxShadow: "0 1px 2px rgba(0,0,0,0.12)", cursor: "pointer",
            }}>LUCID</div>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "rgba(44,40,36,0.35)",
            }}>Summary</span>
          </div>
        </div>

        {/* ── Scrollable canvas ── */}
        <div className="summary-scroll" style={{ flex: 1, overflowY: "auto", padding: "40px 24px 60px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            {/* ── Page title ── */}
            <div style={{ marginBottom: 32, animation: `fadeIn 0.4s ${ease} both` }}>
              <h1 style={{
                fontSize: 24, fontWeight: 600, color: S.text,
                letterSpacing: "-0.02em", lineHeight: 1.2, margin: 0,
              }}>Aether Studios</h1>
              <p style={{
                fontSize: 12, fontWeight: 400, color: "rgba(44,40,36,0.4)",
                marginTop: 4, letterSpacing: "-0.01em",
              }}>Brand strategy &middot; {SECTIONS.length} modules complete</p>
            </div>

            {/* ── Lucy module ── */}
            <div style={{
              background: colors.lucySurface,
              backgroundImage: colors.lucyGrain,
              borderRadius: 6,
              border: `1px solid ${colors.lucyBorder}`,
              boxShadow: colors.lucyShadow,
              padding: 16,
              marginBottom: 20,
              animation: `promptIn 0.4s ${ease} both`,
            }}>
              {/* Lucy status row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <PixelIcon icon="approves" color={colors.lucyAmberText} size={14} />
                <span style={{
                  fontFamily: fonts.pixel, letterSpacing: "0.08em",
                  fontSize: 16,
                  transform: "scale(0.5)",
                  transformOrigin: "left center",
                  color: colors.lucyStatusText,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}>LUCY</span>
              </div>

              {/* Lucy message */}
              <p style={{
                fontSize: 13, fontWeight: 400, color: colors.lucyBodyText,
                lineHeight: 1.6, letterSpacing: "-0.01em", marginBottom: 14,
              }}>
                This is strong, considered work. The personality holds together, the tensions are tight, and the manifesto reads like it was written by one voice. You've built something worth protecting.
              </p>

              {/* E-ink action cards */}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Export brand book", icon: "push" },
                  { label: "Start Visual Identity", icon: "spark" },
                ].map((action, i) => (
                  <button key={i} style={{
                    flex: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "8px 12px",
                    background: colors.eink,
                    border: `1px solid ${colors.einkBorder}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: fonts.pixel, letterSpacing: "0.08em",
                    fontSize: 16,
                    transform: "scale(0.5)",
                    transformOrigin: "center center",
                    color: colors.ink,
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    transition: `all 0.15s ${ease}`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#C4BFB0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.eink; }}
                  >
                    <PixelIcon icon={action.icon} color={colors.ink} size={12} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Section cards ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SECTIONS.map((section, i) => (
                <SectionCard
                  key={section.key}
                  section={section}
                  index={i}
                  copied={copied === section.key}
                  onCopy={() => copy(section.key, buildSectionText(section))}
                  onEdit={() => { alert(`Navigate to: ${section.title}`); }}
                />
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
