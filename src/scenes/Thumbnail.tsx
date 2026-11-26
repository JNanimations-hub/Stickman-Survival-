import React from "react";
import { AbsoluteFill } from "remotion";
import { PLACES } from "../places";
import { Stickman } from "../characters/Stickman";
import { Mountain } from "../places/kit";
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
        <g style={{ filter: `saturate(${1 - 0.7 * p.ash_cover})` }}>
          <place.C tod={p.time_of_day} ash={p.ash_cover} f={f} eruption={p.danger === "eruption"} />
        </g>
        {p.danger === "eruption" && <Mountain x={560} base={1000} w={1300} h={820} f={f} eruption ash={p.ash_cover} tod={p.time_of_day} />}
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
