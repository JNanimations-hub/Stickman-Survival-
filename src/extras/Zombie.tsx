import React from "react";
import { INK } from "../kit/light";
import { rnd } from "../kit/helpers";

// Zombie: same stick style, grey-green skin, arms forward, shuffling walk. Varied by seed
// (size, skin colour, shirt colour, lean, speed). No gore — just tired, torn clothes.

const SKINS = ["#9fb59a", "#a7b8a0", "#8fa392", "#b2bfa4", "#98a89f"];
const SHIRTS = ["#6b5a7a", "#5d7489", "#8a6a4f", "#5f7a5a", "#7a4f4f", "#4f5f7a"];

export const Zombie: React.FC<{ f: number; seed: number; scale?: number; facing?: "left" | "right" }> = ({ f, seed, scale = 1, facing = "right" }) => {
  const r = (k: string) => rnd(`z-${seed}-${k}`);
  const skin = SKINS[Math.floor(r("s") * SKINS.length)];
  const shirt = SHIRTS[Math.floor(r("c") * SHIRTS.length)];
  const sz = 0.85 + r("z") * 0.3;
  const speed = 0.12 + r("v") * 0.08;
  const p = f * speed + r("p") * 6;
  const s = Math.sin(p);
  const lean = 10 + r("l") * 10;
  const headR = 58;
  const hipY = -128;
  const neckY = hipY - 90;

  const leg = (sign: number) => {
    const a = (sign * 18 * s * Math.PI) / 180;
    const kx = Math.sin(a) * 64, ky = hipY + Math.cos(a) * 64;
    const fx = kx + Math.sin(a * 0.5) * 64, fy = ky + 64;
    return <path d={`M 0 ${hipY} L ${kx} ${ky} L ${fx} ${Math.min(0, fy)}`} fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />;
  };
  const arm = (dy: number, back: boolean) => (
    <g>
      <path d={`M 4 ${neckY + 22 + dy} L 70 ${neckY + 30 + dy + s * 6} L 124 ${neckY + 34 + dy + s * 8}`} fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
      <path d={`M 4 ${neckY + 22 + dy} L 70 ${neckY + 30 + dy + s * 6} L 124 ${neckY + 34 + dy + s * 8}`} fill="none" stroke={back ? "#5a5a5a" : shirt} strokeWidth={12} strokeLinecap="round" />
      <circle cx={126} cy={neckY + 34 + dy + s * 8} r={9} fill={skin} stroke={INK} strokeWidth={4} />
    </g>
  );

  return (
    <g transform={`scale(${(facing === "left" ? -1 : 1) * scale * sz} ${scale * sz}) translate(0 ${-Math.abs(Math.cos(p)) * 3})`}>
      <ellipse cx={0} cy={4} rx={54} ry={8} fill="rgba(0,0,0,0.2)" />
      <g transform={`rotate(${lean} 0 ${hipY})`}>
        {arm(10, true)}
        {leg(-1)}
        {leg(1)}
        <path d={`M -22 ${neckY} L 22 ${neckY} L 30 ${hipY + 10} L -30 ${hipY + 10} Z`} fill={shirt} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M -12 ${hipY + 10} l 6 -14 l 6 14 l 8 -10 l 4 10`} fill="none" stroke={INK} strokeWidth={3} />
        <g transform={`translate(8 ${neckY - headR + 12}) rotate(${12 + Math.sin(p * 0.5) * 6})`}>
          <circle cx={0} cy={0} r={headR} fill={skin} stroke={INK} strokeWidth={6} />
          {/* hollow tired eyes, no pupils */}
          <circle cx={14} cy={-6} r={10} fill="#e9ecd8" stroke={INK} strokeWidth={4} />
          <circle cx={-16} cy={-6} r={10} fill="#e9ecd8" stroke={INK} strokeWidth={4} />
          <path d="M -14 26 Q 0 18 18 28" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
        {arm(0, false)}
      </g>
    </g>
  );
};

// Crowd generator: n zombies spread across a strip, back rows smaller and hazier.
export const Crowd: React.FC<{ n: number; f: number; y: number; x0?: number; x1?: number; facing?: "left" | "right"; drift?: number }> = ({ n, f, y, x0 = 0, x1 = 1920, facing = "left", drift = 0.6 }) => {
  const items = [...Array(Math.min(40, n))].map((_, i) => {
    const row = Math.floor(rnd(`cr-row-${i}`) * 3);
    const sc = [0.5, 0.65, 0.8][row];
    const x = x0 + rnd(`cr-x-${i}`) * (x1 - x0) + (facing === "left" ? -1 : 1) * f * drift * sc;
    return { i, row, sc, x, yy: y - (2 - row) * 50 };
  }).sort((a, b) => a.row - b.row);
  return (
    <g>
      {items.map((z) => (
        <g key={z.i} transform={`translate(${z.x} ${z.yy})`} opacity={0.7 + z.row * 0.15}>
          <Zombie f={f} seed={z.i} scale={z.sc} facing={facing} />
        </g>
      ))}
    </g>
  );
};
