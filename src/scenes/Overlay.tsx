import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { INK } from "../kit/light";
import { eback, ramp } from "../kit/helpers";

// ON-SCREEN VISUALS: numbers, measurements, rules, tips, times, alerts, checklists, counters.
// They pop in when the narrator says the word (overlay.on) or at overlay.at seconds, bob gently,
// and fade out at the end of the scene. Same bold look as the day titles.

export type OverlayType = "stat" | "measure" | "time" | "rule" | "problem" | "tip" | "fact" | "alert" | "checklist" | "counter" | "question";
export type IconName = "drop" | "ruler" | "mountain" | "clock" | "warning" | "dog" | "glasses" | "mask" | "battery" | "phone" | "home" | "check" | "none";

export type Overlay = {
  type: OverlayType;
  text?: string;           // main text, e.g. "31 GALLONS" or "NEVER GO BACK OUTSIDE"
  label?: string;          // small top label, e.g. "RULE 2" (defaults per type)
  value?: number;          // measure: centimetres to fill the ruler to
  items?: string[];        // checklist / counter items (counter: "30 GAL|drop")
  icon?: IconName;
  on?: string;             // appear when this word is spoken
  at?: number;             // …or at this many seconds into the scene
  side?: "left" | "right" | "center";
};

const FONT = "Anton";
const COLORS: Record<OverlayType, { bg: string; fg: string; label: string; tag: string }> = {
  stat:      { bg: "#ffc83d", fg: INK, label: "", tag: "#ffffff" },
  measure:   { bg: "#ffffff", fg: INK, label: "", tag: "#ffc83d" },
  time:      { bg: INK, fg: "#ffffff", label: "", tag: "#ffc83d" },
  rule:      { bg: "#e5483b", fg: "#ffffff", label: "RULE", tag: "#ffffff" },
  problem:   { bg: INK, fg: "#ffffff", label: "PROBLEM", tag: "#ffc83d" },
  tip:       { bg: "#3fae5a", fg: "#ffffff", label: "SURVIVAL TIP", tag: "#ffffff" },
  fact:      { bg: "#ffffff", fg: INK, label: "FACT", tag: "#ffc83d" },
  alert:     { bg: "#2b2d38", fg: "#ffffff", label: "EMERGENCY ALERT", tag: "#ff5a4a" },
  checklist: { bg: "#ffffff", fg: INK, label: "", tag: "#3fae5a" },
  counter:   { bg: "#ffffff", fg: INK, label: "", tag: "#ffc83d" },
  question:  { bg: "#ffc83d", fg: INK, label: "", tag: "#ffffff" },
};

export const Icon: React.FC<{ name: IconName; size?: number; color?: string }> = ({ name, size = 70, color = INK }) => {
  const s = { stroke: INK, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const body = (() => {
    switch (name) {
      case "drop": return <path d="M 35 6 C 52 30 60 42 60 52 A 25 25 0 0 1 10 52 C 10 42 18 30 35 6 Z" fill="#5aa9ff" {...s} />;
      case "ruler": return <g><rect x={8} y={24} width={54} height={22} fill="#f2d36b" {...s} />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={16 + i * 10} y1={24} x2={16 + i * 10} y2={i % 2 ? 32 : 36} stroke={INK} strokeWidth={3} />)}</g>;
      case "mountain": return <g><path d="M 4 62 L 30 14 L 40 30 L 48 22 L 66 62 Z" fill="#7d7882" {...s} /><path d="M 30 14 L 24 26 L 36 26 Z" fill="#fff" /></g>;
      case "clock": return <g><circle cx={35} cy={36} r={28} fill="#fff" {...s} /><path d="M 35 20 L 35 37 L 47 44" fill="none" {...s} /></g>;
      case "warning": return <g><path d="M 35 6 L 66 62 L 4 62 Z" fill="#ffc83d" {...s} /><path d="M 35 26 L 35 44" {...s} /><circle cx={35} cy={53} r={3.5} fill={INK} /></g>;
      case "dog": return <g><circle cx={35} cy={38} r={24} fill="#a8703f" {...s} /><path d="M 15 24 L 12 6 L 26 18 Z" fill="#7d4f29" {...s} /><path d="M 46 18 Q 64 18 60 40 Q 52 38 48 28 Z" fill="#7d4f29" {...s} /><ellipse cx={42} cy={46} rx={12} ry={9} fill="#ecd3b0" {...s} /><circle cx={50} cy={42} r={4} fill={INK} /><circle cx={30} cy={32} r={3.5} fill={INK} /></g>;
      case "glasses": return <g fill="#e8f3ff" {...s}><circle cx={20} cy={36} r={14} /><circle cx={50} cy={36} r={14} /><path d="M 34 34 Q 35 30 36 34" fill="none" /><path d="M 44 26 L 54 46" stroke="#e5483b" strokeWidth={4} /></g>;
      case "mask": return <g><path d="M 8 24 Q 35 14 62 24 L 56 50 Q 35 60 14 50 Z" fill="#f2f2ee" {...s} /><path d="M 18 36 L 52 36" stroke="#bbb" strokeWidth={3} /></g>;
      case "battery": return <g><rect x={8} y={20} width={50} height={30} rx={5} fill="#3a3f4a" {...s} /><rect x={58} y={28} width={6} height={14} fill={INK} /><rect x={14} y={26} width={28} height={18} fill="#6fdc6f" /></g>;
      case "phone": return <g><rect x={20} y={6} width={30} height={58} rx={6} fill="#222" {...s} /><rect x={25} y={14} width={20} height={40} fill="#ff5a4a" /></g>;
      case "home": return <g><path d="M 8 34 L 35 10 L 62 34 L 62 62 L 8 62 Z" fill="#f2e3c6" {...s} /><rect x={28} y={40} width={14} height={22} fill="#7b4a33" {...s} /></g>;
      case "check": return <g><circle cx={35} cy={35} r={26} fill="#3fae5a" {...s} /><path d="M 22 36 L 32 46 L 50 26" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></g>;
      default: return null;
    }
  })();
  if (!body) return null;
  return <svg width={size} height={size} viewBox="0 0 70 70" style={{ overflow: "visible", color }}>{body}</svg>;
};

// "31 GALLONS" → counts 0→31 while popping in
const countUp = (text: string, k: number) => {
  const m = text.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) return text;
  const n = parseFloat(m[1].replace(",", "."));
  const shown = Math.round(n * Math.min(1, k));
  return `${shown}${m[2]}`;
};

const card = (bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: bg, border: `7px solid ${INK}`, borderRadius: 18, boxShadow: `0 10px 0 rgba(0,0,0,0.35)`, ...extra,
});

export const OverlayView: React.FC<{ o: Overlay; f: number; startFrame: number; frames: number; charSide: "left" | "right" }> = ({ o, f, startFrame, frames, charSide }) => {
  const lf = f - startFrame;
  if (lf < 0) return null;
  const C = COLORS[o.type];
  const pop = eback(ramp(lf, 0, 9));
  const out = 1 - ramp(f, frames - 6, frames);
  const bob = Math.sin(lf * 0.12) * 4;
  const side = o.side ?? (o.type === "question" ? "center" : charSide === "right" ? "left" : "right");
  const label = o.label ?? C.label;
  const pos: React.CSSProperties =
    side === "center" ? { alignItems: "center", justifyContent: o.type === "question" ? "flex-end" : "flex-start", paddingTop: 90, paddingBottom: 90 }
      : { alignItems: side === "left" ? "flex-start" : "flex-end", justifyContent: "flex-start", padding: "90px 90px" };
  const wrap: React.CSSProperties = {
    transform: `translateY(${bob}px) scale(${interpolate(pop, [0, 1], [0.3, 1])}) rotate(${side === "left" ? -2.5 : side === "right" ? 2.5 : -1.5}deg)`,
    opacity: out, fontFamily: FONT, color: C.fg, letterSpacing: 2,
  };
  const tag = label ? (
    <div style={{ display: "inline-block", background: C.tag, color: INK, border: `5px solid ${INK}`, borderRadius: 10, padding: "2px 16px", fontSize: 34, marginBottom: -16, marginLeft: 18, position: "relative", zIndex: 2 }}>{label}</div>
  ) : null;

  let content: React.ReactNode = null;
  switch (o.type) {
    case "stat":
    case "fact":
    case "tip":
    case "rule":
    case "problem":
    case "time": {
      const big = o.type === "stat" || o.type === "time";
      const txt = o.type === "stat" ? countUp(o.text ?? "", ramp(lf, 0, 14)) : o.text;
      content = (
        <div>
          {tag}
          <div style={card(C.bg, { display: "flex", alignItems: "center", gap: 18, padding: big ? "14px 34px" : "20px 30px", maxWidth: 660 })}>
            {o.icon && o.icon !== "none" && <Icon name={o.icon} size={big ? 92 : 70} />}
            {o.type === "time" && !o.icon && <Icon name="clock" size={84} />}
            <div style={{ fontSize: big ? 104 : 62, lineHeight: 1.02, WebkitTextStroke: C.fg === "#ffffff" ? `0px` : undefined }}>{txt}</div>
          </div>
        </div>
      );
      break;
    }
    case "measure": {
      const v = o.value ?? 0;
      const fill = Math.min(1, ramp(lf, 4, 22));
      const max = Math.max(10, Math.ceil(v / 5) * 5 + 5);
      const H = 420;
      content = (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22 }}>
          <svg width={110} height={H + 20} viewBox={`0 0 110 ${H + 20}`} style={{ overflow: "visible" }}>
            <rect x={20} y={10} width={70} height={H} fill="#f2d36b" stroke={INK} strokeWidth={7} rx={6} />
            {[...Array(max + 1)].map((_, i) => (
              <line key={i} x1={20} y1={10 + H - (i / max) * H} x2={i % 5 === 0 ? 62 : 44} y2={10 + H - (i / max) * H} stroke={INK} strokeWidth={i % 5 === 0 ? 5 : 3} />
            ))}
            <rect x={24} y={10 + H - (v / max) * H * fill} width={62} height={(v / max) * H * fill} fill="#9d978e" opacity={0.92} />
            <line x1={6} x2={104} y1={10 + H - (v / max) * H * fill} y2={10 + H - (v / max) * H * fill} stroke="#e5483b" strokeWidth={6} />
          </svg>
          <div style={card(C.bg, { padding: "10px 26px", fontSize: 96, marginBottom: 20 + (v / max) * H * fill - 60 })}>
            {Math.round(v * fill)} CM
          </div>
        </div>
      );
      break;
    }
    case "alert": {
      content = (
        <div style={{ width: 640 }}>
          <div style={card(C.bg, { padding: "18px 26px", borderRadius: 26 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 38, color: "#ff5a4a" }}>
              <Icon name="warning" size={56} /> {label}
            </div>
            <div style={{ fontSize: 58, lineHeight: 1.05, marginTop: 6 }}>{o.text}</div>
          </div>
        </div>
      );
      break;
    }
    case "checklist": {
      const items = o.items ?? [];
      content = (
        <div style={card(C.bg, { padding: "20px 30px" })}>
          {items.map((it, i) => {
            const k = eback(ramp(lf, 6 + i * 12, 14 + i * 12));
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 56, opacity: ramp(lf, i * 12, 4 + i * 12) }}>
                <div style={{ transform: `scale(${k})` }}><Icon name="check" size={58} /></div>{it}
              </div>
            );
          })}
        </div>
      );
      break;
    }
    case "counter": {
      const items = o.items ?? [];
      content = (
        <div style={{ display: "flex", gap: 22 }}>
          {items.map((it, i) => {
            const [t, ic] = it.split("|");
            const k = eback(ramp(lf, i * 14, 9 + i * 14));
            return (
              <div key={i} style={{ ...card(C.bg, { padding: "10px 22px", display: "flex", alignItems: "center", gap: 12, fontSize: 64 }), transform: `scale(${k})` }}>
                {ic && <Icon name={ic as IconName} size={64} />}{t}
              </div>
            );
          })}
        </div>
      );
      break;
    }
    case "question": {
      content = <div style={card(C.bg, { padding: "18px 40px", fontSize: 78, maxWidth: 1500, textAlign: "center" })}>{o.text}</div>;
      break;
    }
  }
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...pos }}>
      <div style={wrap}>{content}</div>
    </AbsoluteFill>
  );
};

// When should the overlay appear? On the spoken word (estimated from its position in the line),
// or at a fixed time.
export const overlayStart = (o: Overlay, text: string, frames: number, fps = 30, lead = 0.08) => {
  if (o.at !== undefined) return Math.round(o.at * fps);
  if (o.on) {
    const i = text.toLowerCase().indexOf(o.on.toLowerCase());
    if (i >= 0) {
      const speech = Math.max(0.3, frames / fps - lead - 0.2);
      return Math.max(2, Math.round((lead + (i / Math.max(1, text.length)) * speech) * fps) - 3);
    }
  }
  return 6;
};
