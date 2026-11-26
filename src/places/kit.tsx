import React from "react";
import { TimeOfDay } from "../types";
import { INK, LOOKS, ASH_SKY_TOP, ASH_SKY_BOTTOM, mix } from "../kit/light";
import { rnd } from "../kit/helpers";

// Building blocks shared by all places: sky, mountain (with eruption), hills, houses, windows,
// doors, furniture. Flat comic style: flat fills, thick dark outlines, one shade colour.

export interface PlaceProps {
  tod: TimeOfDay;
  ash: number;        // 0..1 how much ash covers the world
  f: number;          // frame in scene
  eruption?: boolean;
  lampsOff?: boolean;
}

export const O = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
export const thin = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

export const skyColors = (tod: TimeOfDay, ash: number) => {
  const L = LOOKS[tod];
  const a = Math.min(1, ash * 1.2);
  const k = tod === "night" ? 0.35 : 1;
  return {
    top: mix(L.skyTop, mix(ASH_SKY_TOP, "#1a1a1e", 1 - k), a),
    bottom: mix(L.skyBottom, mix(ASH_SKY_BOTTOM, "#2a2a30", 1 - k), a),
  };
};

export const Sky: React.FC<{ tod: TimeOfDay; ash: number; id: string; h?: number }> = ({ tod, ash, id, h = 1080 }) => {
  const c = skyColors(tod, ash);
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="1" stopColor={c.bottom} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={h + 200} fill={`url(#sky-${id})`} />
      {tod === "night" && ash < 0.4 && [...Array(40)].map((_, i) => (
        <circle key={i} cx={rnd(`st-x${i}`) * 1920} cy={rnd(`st-y${i}`) * h * 0.55} r={1.5 + rnd(`st-r${i}`) * 2} fill="#fff" opacity={(0.4 + 0.5 * rnd(`st-o${i}`)) * (1 - ash * 2)} />
      ))}
      {(tod === "morning" || tod === "dusk") && ash < 0.5 && (
        <circle cx={tod === "morning" ? 1500 : 380} cy={h * 0.62} r={70} fill={LOOKS[tod].sun!} opacity={0.85 * (1 - ash * 2)} />
      )}
    </g>
  );
};

// Ash column above a crater: billowing grey puffs that rise and grow.
export const AshColumn: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g>
    {[...Array(16)].map((_, i) => {
      const t = ((f * 0.6 + i * 37) % 600) / 600; // 0..1 rise
      const px = x + Math.sin(i * 2.3 + f * 0.01) * 40 * s * (0.5 + t) + t * 260 * s;
      const py = y - t * 620 * s;
      const r = (50 + t * 150) * s * (0.7 + rnd(`ac${i}`) * 0.5);
      const g = Math.round(70 + rnd(`acg${i}`) * 40);
      return <circle key={i} cx={px} cy={py} r={r} fill={`rgb(${g},${g - 4},${g - 8})`} stroke={INK} strokeWidth={4} opacity={0.95} />;
    })}
  </g>
);

export const Mountain: React.FC<{ x: number; base: number; w: number; h: number; f: number; eruption?: boolean; ash: number; tod: TimeOfDay }> = ({ x, base, w, h, f, eruption, ash, tod }) => {
  const top = base - h;
  const craterW = w * 0.14;
  const night = tod === "night";
  const rock = mix(night ? "#3b3f57" : "#6f6a77", "#4f4c4c", ash * 0.7);
  const shade = mix(night ? "#2c2f45" : "#575262", "#3c3a3a", ash * 0.7);
  const glow = 0.6 + 0.4 * Math.sin(f * 0.3);
  return (
    <g>
      {eruption && <circle cx={x} cy={top} r={w * 0.35} fill="#ff7a2a" opacity={0.25 * glow} />}
      <path d={`M ${x - w / 2} ${base} L ${x - craterW} ${top} Q ${x} ${top + 18} ${x + craterW} ${top} L ${x + w / 2} ${base} Z`} fill={rock} {...O} />
      <path d={`M ${x + craterW} ${top} L ${x + w / 2} ${base} L ${x + w * 0.12} ${base} Q ${x + w * 0.1} ${top + h * 0.4} ${x + craterW * 0.4} ${top + 8} Z`} fill={shade} />
      {/* snow cap, or glowing lava if erupting */}
      {eruption ? (
        <g>
          <path d={`M ${x - craterW} ${top} Q ${x} ${top - 16} ${x + craterW} ${top} Q ${x} ${top + 22} ${x - craterW} ${top} Z`} fill="#ffb02e" {...thin} />
          <path d={`M ${x - craterW * 0.4} ${top + 8} q -20 ${h * 0.2} -60 ${h * 0.34} M ${x + craterW * 0.5} ${top + 8} q 30 ${h * 0.15} 70 ${h * 0.28}`} stroke="#ff6a1a" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.9 * glow} />
          <AshColumn x={x} y={top} f={f} s={w / 900} />
        </g>
      ) : (
        <path d={`M ${x - craterW} ${top} L ${x - craterW - (w / 2 - craterW) * 0.24} ${top + h * 0.24} l ${w * 0.04} -14 l ${w * 0.04} 18 l ${w * 0.05} -16 l ${w * 0.05} 14 L ${x + craterW + (w / 2 - craterW) * 0.22} ${top + h * 0.22} L ${x + craterW} ${top} Q ${x} ${top + 18} ${x - craterW} ${top} Z`} fill={mix("#f4f6fb", "#9c9894", ash)} {...thin} />
      )}
    </g>
  );
};

// Rolling ground band with an ash layer on top.
export const Ground: React.FC<{ y: number; color: string; ash: number; id: string; h?: number; wave?: number }> = ({ y, color, ash, id, h = 1300, wave = 18 }) => {
  const d = `M -200 ${y} Q 300 ${y - wave} 700 ${y} T 1500 ${y} T 2300 ${y - wave / 2} L 2300 ${y + h} L -200 ${y + h} Z`;
  return (
    <g>
      <path d={d} fill={mix(color, "#8d8984", ash * 0.85)} {...O} />
      {ash > 0.05 && <path d={d} fill="none" stroke="#b9b5ae" strokeWidth={6 + ash * 26} opacity={Math.min(1, ash * 2)} transform={`translate(0 ${3 + ash * 8})`} key={id} />}
    </g>
  );
};

export const Tree: React.FC<{ x: number; y: number; s?: number; ash: number; dead?: boolean; f?: number }> = ({ x, y, s = 1, ash, dead, f = 0 }) => {
  const leaf = mix("#5d9b4f", "#8a8781", ash);
  const sway = Math.sin(f * 0.04 + x) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -10 0 L -8 -110 L 8 -110 L 10 0 Z" fill="#7a5233" {...O} />
      {dead ? (
        <path d="M 0 -100 l -40 -50 M 0 -90 l 36 -44 M -20 -125 l -6 -30" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      ) : (
        <g transform={`rotate(${sway} 0 -110)`}>
          <circle cx={0} cy={-170} r={70} fill={leaf} {...O} />
          <circle cx={-46} cy={-130} r={46} fill={leaf} {...O} />
          <circle cx={48} cy={-134} r={48} fill={leaf} {...O} />
          {ash > 0.1 && <path d="M -60 -220 Q 0 -260 60 -220" stroke="#c9c5be" strokeWidth={10 + ash * 14} fill="none" strokeLinecap="round" />}
        </g>
      )}
    </g>
  );
};

export const Fence: React.FC<{ x0: number; x1: number; y: number; ash: number }> = ({ x0, x1, y, ash }) => {
  const n = Math.floor((x1 - x0) / 70);
  const c = mix("#d9c39a", "#9c968e", ash * 0.7);
  return (
    <g>
      <rect x={x0} y={y - 70} width={x1 - x0} height={14} fill={c} {...thin} />
      <rect x={x0} y={y - 36} width={x1 - x0} height={14} fill={c} {...thin} />
      {[...Array(n + 1)].map((_, i) => (
        <path key={i} d={`M ${x0 + i * 70 - 10} ${y} L ${x0 + i * 70 - 10} ${y - 92} L ${x0 + i * 70} ${y - 104} L ${x0 + i * 70 + 10} ${y - 92} L ${x0 + i * 70 + 10} ${y} Z`} fill={c} {...thin} />
      ))}
    </g>
  );
};

// A house seen from outside. Windows glow when lamps are on.
export const House: React.FC<{ x: number; y: number; w: number; h: number; wall: string; roof: string; ash: number; lit: number; door?: boolean; s?: number; porch?: boolean }> = ({ x, y, w, h, wall, roof, ash, lit, door = true, s = 1, porch }) => {
  const rh = h * 0.55;
  const win = (wx: number, wy: number) => (
    <g key={wx}>
      <rect x={wx} y={wy} width={w * 0.18} height={h * 0.26} fill={lit > 0 ? mix("#2a3a5a", "#ffd77a", lit) : "#9fc4dd"} {...thin} />
      <path d={`M ${wx + w * 0.09} ${wy} V ${wy + h * 0.26} M ${wx} ${wy + h * 0.13} H ${wx + w * 0.18}`} {...thin} />
      {lit > 0 && <rect x={wx - 20} y={wy - 20} width={w * 0.18 + 40} height={h * 0.26 + 40} fill="#ffcf6a" opacity={0.18 * lit} rx={20} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={mix(wall, "#9b958d", ash * 0.6)} {...O} />
      <path d={`M ${-w / 2 - 30} ${-h} L 0 ${-h - rh} L ${w / 2 + 30} ${-h} Z`} fill={mix(roof, "#77726c", ash * 0.6)} {...O} />
      {ash > 0.05 && <path d={`M ${-w / 2 - 22} ${-h - 4} L 0 ${-h - rh + 6} L ${w / 2 + 22} ${-h - 4}`} fill="none" stroke="#c6c2bb" strokeWidth={8 + ash * 30} strokeLinejoin="round" />}
      <rect x={w * 0.2} y={-h - rh * 0.8} width={w * 0.1} height={rh * 0.5} fill="#8a5a46" {...thin} />
      {win(-w * 0.4, -h * 0.72)}
      {win(w * 0.22, -h * 0.72)}
      {door && <rect x={-w * 0.1} y={-h * 0.58} width={w * 0.2} height={h * 0.58} fill="#7b4a33" {...thin} />}
      {door && <circle cx={w * 0.06} cy={-h * 0.28} r={6} fill="#e8c35a" />}
      {porch && (
        <g>
          <rect x={-w * 0.5} y={-h * 0.04} width={w} height={h * 0.04 + 4} fill="#a87a50" {...thin} />
          <circle cx={-w * 0.16} cy={-h * 0.62} r={10} fill={lit > 0 ? "#ffe8a0" : "#ddd"} {...thin} />
          {lit > 0 && <circle cx={-w * 0.16} cy={-h * 0.62} r={70} fill="#ffd77a" opacity={0.25 * lit} />}
        </g>
      )}
    </g>
  );
};

// --- Interiors ---------------------------------------------------------------------------------
export const Room: React.FC<{ wall: string; floor: string; floorY: number; ash: number; id: string; children?: React.ReactNode }> = ({ wall, floor, floorY, ash, id, children }) => (
  <g>
    <rect x={-200} y={-200} width={2320} height={floorY + 200} fill={wall} />
    {/* wallpaper stripes */}
    {[...Array(26)].map((_, i) => <rect key={i} x={-200 + i * 96} y={-200} width={40} height={floorY + 200} fill="#000" opacity={0.035} />)}
    {children}
    <rect x={-200} y={floorY} width={2320} height={600} fill={floor} />
    {[...Array(12)].map((_, i) => <line key={i} x1={-200} y1={floorY + 26 + i * 34} x2={2120} y2={floorY + 26 + i * 34} stroke="#000" strokeOpacity={0.12} strokeWidth={3} />)}
    <rect x={-200} y={floorY - 22} width={2320} height={26} fill="#f4efe6" {...thin} />
    {ash > 0.15 && [...Array(Math.floor(ash * 30))].map((_, i) => (
      <ellipse key={`${id}${i}`} cx={rnd(`fa${id}${i}`) * 1920} cy={floorY + 20 + rnd(`fb${id}${i}`) * 140} rx={30 + rnd(`fc${i}`) * 50} ry={6} fill="#a19c94" opacity={0.5} />
    ))}
  </g>
);

// Window seen from inside: shows the sky (and falling ash) through the glass.
export const InWindow: React.FC<{ x: number; y: number; w: number; h: number; tod: TimeOfDay; ash: number; f: number; falling?: number; id: string; curtains?: boolean; ruler?: number }> = ({ x, y, w, h, tod, ash, f, falling = 0, id, curtains = true, ruler }) => {
  const c = skyColors(tod, ash);
  return (
    <g>
      <defs>
        <clipPath id={`win-${id}`}><rect x={x} y={y} width={w} height={h} /></clipPath>
        <linearGradient id={`wsky-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.top} /><stop offset="1" stopColor={c.bottom} /></linearGradient>
      </defs>
      <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} fill="#f4efe6" {...O} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#wsky-${id})`} {...thin} />
      <g clipPath={`url(#win-${id})`}>
        {/* distant hills and buried ground line */}
        <path d={`M ${x} ${y + h * 0.72} Q ${x + w * 0.3} ${y + h * 0.55} ${x + w * 0.6} ${y + h * 0.7} T ${x + w} ${y + h * 0.66} V ${y + h} H ${x} Z`} fill={mix("#6c9a5c", "#8e8a84", ash)} />
        {falling > 0 && [...Array(Math.floor(30 * falling))].map((_, i) => {
          const sx = x + rnd(`wf${id}${i}`) * w + Math.sin(f * 0.05 + i) * 8;
          const sy = y + ((rnd(`wy${id}${i}`) * h + f * (1.2 + rnd(`wv${i}`))) % h);
          return <circle key={i} cx={sx} cy={sy} r={2 + rnd(`wr${i}`) * 3} fill="#cfcac2" opacity={0.9} />;
        })}
        {ash > 0.05 && <rect x={x} y={y + h - 10 - ash * 60} width={w} height={ash * 60 + 10} fill="#b3aea6" />}
      </g>
      <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}`} stroke="#f4efe6" strokeWidth={12} />
      <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}`} {...thin} fill="none" />
      <rect x={x - 30} y={y + h + 14} width={w + 60} height={18} fill="#e8e0d2" {...thin} />
      {ruler !== undefined && (
        <g transform={`translate(${x + w * 0.78} ${y + h - 6})`}>
          <rect x={-10} y={-150} width={20} height={150} fill="#f2d36b" {...thin} />
          {[...Array(15)].map((_, i) => <line key={i} x1={-10} y1={-i * 10} x2={i % 5 === 0 ? 6 : -2} y2={-i * 10} stroke={INK} strokeWidth={2} />)}
          <rect x={-14} y={-ruler * 10} width={28} height={ruler * 10} fill="#b3aea6" opacity={0.95} />
        </g>
      )}
      {curtains && (
        <g>
          <path d={`M ${x - 40} ${y - 30} Q ${x + 10} ${y + h / 2} ${x - 30} ${y + h + 20} L ${x - 90} ${y + h + 20} L ${x - 90} ${y - 30} Z`} fill="#c0504d" {...thin} />
          <path d={`M ${x + w + 40} ${y - 30} Q ${x + w - 10} ${y + h / 2} ${x + w + 30} ${y + h + 20} L ${x + w + 90} ${y + h + 20} L ${x + w + 90} ${y - 30} Z`} fill="#c0504d" {...thin} />
          <rect x={x - 110} y={y - 44} width={w + 220} height={14} rx={7} fill="#7b4a33" {...thin} />
        </g>
      )}
    </g>
  );
};

export const Lamp: React.FC<{ x: number; y: number; on: number; f: number }> = ({ x, y, on, f }) => (
  <g>
    {on > 0 && <circle cx={x} cy={y - 150} r={260} fill="#ffcf6a" opacity={(0.2 + Math.sin(f * 0.2) * 0.01) * on} style={{ mixBlendMode: "screen" }} />}
    <line x1={x} y1={y} x2={x} y2={y - 140} stroke={INK} strokeWidth={8} />
    <ellipse cx={x} cy={y} rx={36} ry={10} fill="#555" {...thin} />
    <path d={`M ${x - 50} ${y - 130} L ${x + 50} ${y - 130} L ${x + 34} ${y - 200} L ${x - 34} ${y - 200} Z`} fill={on > 0 ? "#ffe39a" : "#e9dcc0"} {...thin} />
  </g>
);

export const DoorIn: React.FC<{ x: number; y: number; open?: number; towel?: boolean; color?: string }> = ({ x, y, open = 0, towel, color = "#8a5a3c" }) => (
  <g>
    <rect x={x - 90} y={y - 330} width={180} height={330} fill="#3a2a22" {...O} />
    {open > 0 && <rect x={x - 90} y={y - 330} width={180 * open} height={330} fill="#9a958e" />}
    <rect x={x - 90 + 180 * open} y={y - 330} width={180 * (1 - open)} height={330} fill={color} {...O} />
    <rect x={x - 60 + 180 * open} y={y - 300} width={Math.max(0, 120 * (1 - open))} height={110} fill="#000" opacity={0.08} />
    <circle cx={x + 60} cy={y - 160} r={9} fill="#e8c35a" {...thin} opacity={open > 0.5 ? 0 : 1} />
    {towel && <path d={`M ${x - 96} ${y - 14} Q ${x} ${y - 30} ${x + 96} ${y - 14} L ${x + 96} ${y + 4} L ${x - 96} ${y + 4} Z`} fill="#e66b6b" {...thin} />}
  </g>
);

export const Shelf: React.FC<{ x: number; y: number; w: number; items: string[]; f: number; rattle?: number }> = ({ x, y, w, items, f, rattle = 0 }) => (
  <g>
    <rect x={x} y={y} width={w} height={16} fill="#9b6a43" {...thin} />
    {items.map((it, i) => {
      const ix = x + 30 + i * ((w - 60) / Math.max(1, items.length - 1 || 1));
      const jit = rattle * Math.sin(f * 2.3 + i * 1.7) * 4;
      return (
        <g key={i} transform={`translate(${ix + jit} ${y}) rotate(${jit * 2})`}>
          {it === "plate" && <ellipse cx={0} cy={-36} rx={14} ry={36} fill="#f3f1ea" {...thin} />}
          {it === "jar" && <rect x={-18} y={-50} width={36} height={50} rx={6} fill="#e2a64a" {...thin} />}
          {it === "can" && <rect x={-16} y={-40} width={32} height={40} rx={3} fill="#d64b3c" {...thin} />}
          {it === "cup" && <path d="M -16 -34 L 16 -34 L 12 0 L -12 0 Z" fill="#6aa7d8" {...thin} />}
          {it === "book" && <rect x={-10} y={-60} width={20} height={60} fill={["#4f7a4a", "#3b5f99", "#a34a3a"][i % 3]} {...thin} />}
          {it === "box" && <rect x={-30} y={-40} width={60} height={40} fill="#c99a5b" {...thin} />}
        </g>
      );
    })}
  </g>
);

export const Table: React.FC<{ x: number; y: number; w?: number }> = ({ x, y, w = 300 }) => (
  <g>
    <rect x={x - w / 2} y={y - 150} width={w} height={20} fill="#a8774d" {...O} />
    <rect x={x - w / 2 + 16} y={y - 130} width={16} height={130} fill="#8a5d39" {...thin} />
    <rect x={x + w / 2 - 32} y={y - 130} width={16} height={130} fill="#8a5d39" {...thin} />
  </g>
);
