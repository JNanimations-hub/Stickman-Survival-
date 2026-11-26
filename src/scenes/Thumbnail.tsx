import React from "react";
import { AbsoluteFill } from "remotion";
import { PLACES } from "../places";
import { Stickman } from "../characters/Stickman";
import { Mountain, Sky, Ground, House, Tree } from "../places/kit";
import { Falling, Lahar } from "../extras/Effects";
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
  danger: "eruption" | "lahar" | "zombies" | "none";
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
        {p.danger === "eruption" ? (
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
        <g transform="translate(1420 1120)">
          <Stickman pose={p.dog ? "hugging" : "standing"} face={p.face} f={12} props={p.dog ? ["dog"] : []} scale={2.15} />
        </g>
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
