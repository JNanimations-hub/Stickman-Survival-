import React from "react";
import { AbsoluteFill } from "remotion";
import { Stickman } from "../characters/Stickman";
import { Dog } from "../characters/Dog";
import { PLACES } from "../places";
import { INK } from "../kit/light";
import { TITLE_FONT } from "./Scene";

// Channel branding for "Stick & Pebble": avatar (800x800, shown as a circle) and banner (2560x1440).

export const CHANNEL_NAME = "STICK & PEBBLE";

// AVATAR — Nico and Pebble, close, on a deep teal disc with a warm volcano glow behind.
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ background: "#173a45" }}>
    <svg width={800} height={800} viewBox="0 0 800 800">
      <defs>
        <radialGradient id="av-glow" cx="0.5" cy="0.62" r="0.6">
          <stop offset="0" stopColor="#ff9a3a" stopOpacity={0.95} />
          <stop offset="0.55" stopColor="#e0502a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#173a45" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={800} height={800} fill="#173a45" />
      <circle cx={400} cy={470} r={420} fill="url(#av-glow)" />
      {/* volcano silhouette */}
      <path d="M 40 800 L 300 470 Q 400 450 500 470 L 760 800 Z" fill="#2a2528" opacity={0.85} />
      {[...Array(18)].map((_, i) => (
        <circle key={i} cx={60 + ((i * 137) % 680)} cy={60 + ((i * 89) % 420)} r={3 + (i % 3)} fill="#d8d2c8" opacity={0.7} />
      ))}
      <g transform="translate(330 1010) scale(2.05)">
        <Stickman pose="hugging" face="determined" f={14} props={["dog"]} />
      </g>
    </svg>
  </AbsoluteFill>
);

// BANNER — 2560x1440. Everything important sits in the centre safe area (1546x423) that every
// device shows; the rest is scenery that only TVs and desktops see.
export const Banner: React.FC = () => {
  const R = PLACES.ridge_top;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={2560} height={1440} viewBox="0 0 2560 1440">
        <g transform="scale(1.3334)" style={{ filter: "saturate(0.85)" }}>
          <R.C tod="dusk" ash={0.25} f={150} eruption />
        </g>
        {/* darken behind the title for contrast */}
        <defs>
          <linearGradient id="bn-dark" x1="0" x2="1">
            <stop offset="0" stopColor="#000" stopOpacity={0} />
            <stop offset="0.35" stopColor="#000" stopOpacity={0.35} />
            <stop offset="0.75" stopColor="#000" stopOpacity={0.35} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={0} y={508} width={2560} height={423} fill="url(#bn-dark)" />
        {/* Nico and Pebble on the left of the safe area */}
        <g transform="translate(700 925) scale(1.0)">
          <Stickman pose="standing" face="determined" f={20} props={["backpack"]} facing="right" />
        </g>
        <g transform="translate(860 925) scale(0.95)">
          <Dog pose="sit" f={30} facing="right" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 960, top: 585, width: 1090, textAlign: "center", fontFamily: TITLE_FONT, whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 168, lineHeight: 1, color: "#fff", WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill", letterSpacing: 4, textShadow: "0 12px 0 rgba(0,0,0,0.4)" }}>
          STICK <span style={{ color: "#ffc83d" }}>&amp;</span> PEBBLE
        </div>
        <div style={{ marginTop: 18, display: "inline-block", background: "#ffc83d", color: INK, border: `7px solid ${INK}`, borderRadius: 16, padding: "4px 34px", fontSize: 60, letterSpacing: 2 }}>
          ANIMATED SURVIVAL STORIES
        </div>
      </div>
    </AbsoluteFill>
  );
};
