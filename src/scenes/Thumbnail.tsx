import React from "react";
import { AbsoluteFill } from "remotion";
import { PLACES } from "../places";
import { Stickman } from "../characters/Stickman";
import { Mountain, Sky, Ground, House, Tree } from "../places/kit";
import { Falling, Lahar, Smoke } from "../extras/Effects";
import { Dog } from "../characters/Dog";
import { Crowd } from "../extras/Zombie";
import { FaceMood, TimeOfDay } from "../types";
import { INK, LOOKS } from "../kit/light";
import { TITLE_FONT } from "./Scene";

// 1280x720 thumbnail: huge day number top-left, the danger on the left, the stickman big on the right.
export type ThumbProps = {
  day: string;                 // e.g. "DAY 50"
  place: string;
  time_of_day: TimeOfDay;
  face: FaceMood;
  danger: "eruption" | "lahar" | "zombies" | "ridge" | "none";   // ridge = Pebble + the ranger station mystery
  ash_cover: number;
  dog: boolean;
  word?: string;               // optional small second line, e.g. "ASHFALL"
};

export const Thumbnail: React.FC<ThumbProps> = (p) => {
  const place = PLACES[p.place] ?? PLACES.farmhouse;
  const f = 40;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1280} height={720} viewBox="0 0 1920 1080">
        {p.danger === "ridge" ? (
          <g>
            {/* grey dusk sky, the ridge rising behind, the ranger station with smoke, circled in red */}
            <Sky tod="dusk" ash={0.55} id="thumb-r" />
            <rect x={0} y={0} width={1920} height={1080} fill="#ff7a3a" opacity={0.12} />
            <path d="M -50 1100 L -50 760 Q 500 640 900 520 Q 1150 430 1350 420 Q 1650 430 1980 520 L 1980 1100 Z" fill="#6f6b66" stroke={INK} strokeWidth={8} />
            <path d="M -50 1100 L -50 900 Q 600 820 1100 860 Q 1500 900 1980 860 L 1980 1100 Z" fill="#8d8882" stroke={INK} strokeWidth={8} />
            <g transform="translate(1180 430) scale(0.62)">
              <rect x={-300} y={-300} width={600} height={300} fill="#a8774d" stroke={INK} strokeWidth={10} />
              {[...Array(5)].map((_, i) => <line key={i} x1={-300} y1={-250 + i * 50} x2={300} y2={-250 + i * 50} stroke={INK} strokeWidth={5} />)}
              <rect x={110} y={-460} width={60} height={140} fill="#8a6a5a" stroke={INK} strokeWidth={10} />
              <path d="M -350 -300 L 0 -480 L 350 -300 Z" fill="#7a786f" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
              <rect x={-60} y={-200} width={120} height={200} fill="#5b3a26" stroke={INK} strokeWidth={8} />
              <rect x={140} y={-230} width={110} height={90} fill="#ffd77a" stroke={INK} strokeWidth={8} />
              <circle cx={195} cy={-185} r={150} fill="#ffcf6a" opacity={0.3} />
            </g>
            <g transform="translate(1265 160) scale(1.6)"><Smoke x={0} y={0} f={80} /></g>
            {/* hand-drawn red circle around the station */}
            <ellipse cx={1200} cy={300} rx={290} ry={215} fill="none" stroke="#e5262b" strokeWidth={16} transform="rotate(-6 1200 300)" />
            <path d="M 1490 250 q 20 -40 -10 -70" fill="none" stroke="#e5262b" strokeWidth={14} strokeLinecap="round" />
          </g>
        ) : p.danger === "eruption" ? (
          <g>
            {/* one huge erupting volcano: red sky, glow, lava, ash column */}
            <Sky tod="dusk" ash={0} id="thumb" />
            <rect x={0} y={0} width={1920} height={1080} fill="#ff4a1a" opacity={0.25} />
            <defs>
              <radialGradient id="tglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffb03a" stopOpacity={0.9} /><stop offset="1" stopColor="#ff4a1a" stopOpacity={0} /></radialGradient>
            </defs>
            <circle cx={600} cy={470} r={560} fill="url(#tglow)" />
            <Mountain x={600} base={1020} w={1500} h={560} f={150} eruption ash={0.15} tod="dusk" />
            {[[-1, 200], [1, 260], [-0.4, 330], [0.6, 380]].map(([d, l], i) => (
              <path key={i} d={`M ${600 + d * 40} 470 q ${d * 50} ${l * 0.4} ${d * 120} ${l * 0.8}`} stroke="#ffcf3a" strokeWidth={14 - i * 2} fill="none" strokeLinecap="round" />
            ))}
            {[[430, 380], [520, 300], [700, 330], [780, 410], [600, 260], [380, 450], [830, 300]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9 + (i % 3) * 5} fill="#ffb03a" stroke="#16161a" strokeWidth={3} />)}
            <Ground y={930} color="#7aa95c" ash={p.ash_cover} id="thumb-g" />
            <House x={230} y={960} w={260} h={170} wall="#f2e3c6" roof="#b4513f" ash={p.ash_cover} lit={1} />
            <Tree x={480} y={960} s={0.8} ash={p.ash_cover} />
          </g>
        ) : (
          <g style={{ filter: `saturate(${1 - 0.7 * p.ash_cover})` }}>
            <place.C tod={p.time_of_day} ash={p.ash_cover} f={f} />
          </g>
        )}
        {p.danger === "lahar" && <Lahar f={60} y={980} frames={100} />}
        {p.danger === "zombies" && <Crowd n={14} f={f} y={1060} x0={0} x1={900} facing="right" drift={0} />}
        <rect x={0} y={0} width={1920} height={1080} fill={LOOKS[p.time_of_day].tint} opacity={LOOKS[p.time_of_day].tintOpacity * 0.7} style={{ mixBlendMode: "multiply" }} />
        {p.ash_cover > 0 && <Falling f={f} kind="ash" amount={0.6} />}
        {p.danger === "ridge" ? (
          <g>
            {/* Pebble big at the front, looking up at the ridge; Nico on the right, worried */}
            <g transform="translate(470 1090)"><Dog pose="sit" f={20} facing="right" scale={3.4} /></g>
            <g transform="translate(1640 1160)"><Stickman pose="looking" face={p.face} f={60} facing="left" scale={1.95} /></g>
          </g>
        ) : (
          <g transform="translate(1420 1120)">
            <Stickman pose={p.dog ? "hugging" : "standing"} face={p.face} f={12} props={p.dog ? ["dog"] : []} scale={2.15} />
          </g>
        )}
        <defs>
          <radialGradient id="tv" cx="50%" cy="50%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.55} /></radialGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#tv)" />
      </svg>
      <div style={{ position: "absolute", left: 40, top: 10, fontFamily: TITLE_FONT, fontSize: 210, lineHeight: 1, color: INK, WebkitTextStroke: "14px #fff", paintOrder: "stroke fill", transform: "rotate(-3deg)" }}>
        {p.day}
      </div>
      {p.word && (
        <div style={{ position: "absolute", left: 52, top: 230, fontFamily: TITLE_FONT, fontSize: 84, color: "#ffc83d", WebkitTextStroke: `10px ${INK}`, paintOrder: "stroke fill", transform: "rotate(-3deg)" }}>
          {p.word}
        </div>
      )}
    </AbsoluteFill>
  );
};
