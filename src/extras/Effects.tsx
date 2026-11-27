import React from "react";
import { INK } from "../kit/light";
import { rnd } from "../kit/helpers";

// Animated extras: falling ash, rain, snow, fire, smoke, police lights, lightning, the lahar
// (mudflow) and a car driving away. All pure functions of the frame.

export const Falling: React.FC<{ f: number; kind: "ash" | "rain" | "snow"; amount: number; seed?: string }> = ({ f, kind, amount, seed = "a" }) => {
  const n = Math.floor((kind === "rain" ? 140 : 110) * Math.min(1, amount));
  return (
    <g>
      {[...Array(n)].map((_, i) => {
        const r = (k: string) => rnd(`${seed}-${kind}-${k}-${i}`);
        const depth = 0.4 + r("d") * 0.9;
        const speed = kind === "rain" ? 26 * depth : kind === "snow" ? 2.2 * depth : 1.6 * depth;
        const x = ((r("x") * 2200 - 100 + (kind === "rain" ? f * 4 : Math.sin(f * 0.03 + i) * 30)) % 2200) - 100;
        const y = ((r("y") * 1300 + f * speed) % 1300) - 100;
        if (kind === "rain") return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 34 * depth} stroke="#cfe3ff" strokeWidth={2.5 * depth} opacity={0.6} />;
        const size = (kind === "snow" ? 6 : 3.5) * depth;
        return <circle key={i} cx={x} cy={y} r={size} fill={kind === "snow" ? "#ffffff" : "#d4cfc6"} opacity={kind === "ash" ? 0.55 + depth * 0.3 : 0.9} />;
      })}
    </g>
  );
};

export const Fire: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-60} r={180} fill="#ff9a3a" opacity={0.16 + Math.sin(f * 0.5) * 0.04} />
    {[0, 1, 2].map((i) => {
      const h = 120 + Math.sin(f * 0.6 + i * 2) * 22 - i * 25;
      const w = 70 - i * 18;
      const c = ["#ff5a1f", "#ff9a1f", "#ffe066"][i];
      return <path key={i} d={`M ${-w} 0 Q ${-w} ${-h * 0.6} ${Math.sin(f * 0.4 + i) * 12} ${-h} Q ${w} ${-h * 0.6} ${w} 0 Z`} fill={c} stroke={i === 0 ? INK : "none"} strokeWidth={5} />;
    })}
  </g>
);

export const Smoke: React.FC<{ x: number; y: number; f: number; dark?: boolean }> = ({ x, y, f, dark }) => (
  <g>
    {[...Array(10)].map((_, i) => {
      const t = ((f * 0.8 + i * 24) % 240) / 240;
      return dark
        ? <circle key={i} cx={x + Math.sin(i * 1.7 + t * 3) * 40 + t * 120} cy={y - t * 520} r={30 + t * 110} fill="#4a4744" opacity={(1 - t) * 0.7} />
        : <circle key={i} cx={x + Math.sin(i * 1.7 + t * 3) * 10 + t * 60} cy={y - t * 300} r={8 + t * 34} fill="#d9d4cc" opacity={(1 - t) * 0.8} />;
    })}
  </g>
);

export const PoliceLights: React.FC<{ f: number }> = ({ f }) => {
  const red = Math.floor(f / 8) % 2 === 0;
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <rect x={-200} y={-200} width={2400} height={1500} fill={red ? "#ff2a2a" : "#2a5cff"} opacity={0.18} />
      <circle cx={red ? 200 : 1720} cy={300} r={500} fill={red ? "#ff3b3b" : "#3b6bff"} opacity={0.25} />
    </g>
  );
};

// Lightning inside the ash cloud: a quick bolt and a white flash, about every 2.5 s.
export const Lightning: React.FC<{ f: number; seed?: number }> = ({ f, seed = 0 }) => {
  const period = 75;
  const p = (f + seed * 23) % period;
  if (p > 7) return null;
  const k = Math.floor((f + seed * 23) / period);
  const x = 300 + rnd(`lb-${k}`) * 1300;
  let d = `M ${x} -50`;
  let cx = x;
  for (let i = 1; i <= 7; i++) { cx += (rnd(`lb-${k}-${i}`) - 0.5) * 120; d += ` L ${cx} ${i * 70}`; }
  const a = p < 2 ? 1 : 1 - (p - 2) / 5;
  return (
    <g opacity={a}>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#e9e6ff" opacity={0.35} />
      <path d={d} stroke="#fffbe0" strokeWidth={12} fill="none" strokeLinejoin="round" />
      <path d={d} stroke="#a9a4ff" strokeWidth={24} fill="none" opacity={0.35} strokeLinejoin="round" />
    </g>
  );
};

// Lahar: a churning wall of grey mud and debris sweeping left → right across the floor line.
export const Lahar: React.FC<{ f: number; y: number; frames: number; maxX?: number }> = ({ f, y, frames, maxX = 2400 }) => {
  // the front surges in fast, then stays just behind maxX (right behind the character)
  const front = Math.min(maxX, -400 + (f / Math.max(1, frames)) * 2600) + Math.sin(f * 0.3) * 12;
  const top = (x: number) => y - 140 + Math.sin(x * 0.012 + f * 0.25) * 22 + Math.sin(x * 0.031 - f * 0.4) * 10;
  let d = `M -400 ${y + 400} L -400 ${top(-400)}`;
  for (let x = -400; x <= front; x += 40) d += ` L ${x} ${top(x)}`;
  d += ` Q ${front + 120} ${y - 200} ${front + 60} ${y + 10} L ${front} ${y + 400} Z`;
  return (
    <g>
      <path d={d} fill="#6e665c" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[...Array(14)].map((_, i) => {
        const x = front - rnd(`lh${i}`) * 1600;
        if (x < -400) return null;
        return (
          <g key={i} transform={`translate(${x} ${top(x) + 30 + rnd(`lhy${i}`) * 60}) rotate(${(f * (2 + i)) % 360})`}>
            {i % 3 === 0 ? <rect x={-50} y={-8} width={100} height={16} fill="#7a5233" stroke={INK} strokeWidth={4} /> : <ellipse cx={0} cy={0} rx={22} ry={16} fill="#5a544c" stroke={INK} strokeWidth={4} />}
          </g>
        );
      })}
      {[...Array(8)].map((_, i) => {
        const x = front - 40 - i * 40;
        return <circle key={`s${i}`} cx={x} cy={top(x) - 20 - ((f * 3 + i * 20) % 80)} r={14 + i * 3} fill="#9b948a" opacity={0.6 - i * 0.06} />;
      })}
    </g>
  );
};

// A car driving away to the right and shrinking into the distance.
export const CarAway: React.FC<{ f: number; frames: number; y: number }> = ({ f, frames, y }) => {
  const t = Math.min(1, f / Math.max(1, frames * 0.9));
  const x = 900 + t * 1300;
  const s = 1 - t * 0.35;
  const shake = Math.sin(f * 1.3) * 2;
  return (
    <g transform={`translate(${x} ${y + shake}) scale(${s})`}>
      {[...Array(6)].map((_, i) => <circle key={i} cx={-220 - i * 60} cy={-20 - i * 6} r={20 + i * 8} fill="#a39e96" opacity={0.5 - i * 0.07} />)}
      <rect x={-180} y={-100} width={360} height={80} rx={22} fill="#c94f3a" stroke={INK} strokeWidth={6} />
      <path d="M -110 -100 L -60 -160 L 80 -160 L 130 -100 Z" fill="#c94f3a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -90 -104 L -52 -148 L 0 -148 L 0 -104 Z M 16 -104 L 16 -148 L 72 -148 L 106 -104 Z" fill="#9fc4dd" stroke={INK} strokeWidth={4} />
      {/* bags tied on the roof */}
      <rect x={-60} y={-196} width={120} height={36} rx={8} fill="#6b5a7a" stroke={INK} strokeWidth={4} />
      <circle cx={-100} cy={-20} r={34} fill="#222" stroke={INK} strokeWidth={5} />
      <circle cx={100} cy={-20} r={34} fill="#222" stroke={INK} strokeWidth={5} />
      <rect x={-186} y={-80} width={16} height={20} fill="#ff4a3a" stroke={INK} strokeWidth={3} />
    </g>
  );
};
