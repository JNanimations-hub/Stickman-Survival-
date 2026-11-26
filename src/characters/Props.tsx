import React from "react";
import { Pose } from "../types";
import { INK } from "../kit/light";
import { Dog } from "./Dog";

// Objects the character holds. Each one is drawn at the front hand (and uses the back hand for
// two-handed things). "mask" is drawn on the face by Stickman; "backpack" sits on the back.

export const PROP_NAMES = [
  "flashlight", "bottle", "jug", "pot", "towel", "phone", "broom", "spray_bottle", "can", "backpack",
  "whistle", "map", "radio", "ruler", "dog", "spoon", "mask", "box", "note", "stone", "bucket", "batteries",
] as const;

const S = { stroke: INK, strokeWidth: 4.5, strokeLinejoin: "round" as const };

export const Prop: React.FC<{
  name: string; hand: [number, number]; hand2: [number, number]; f: number; pose: Pose; headC: [number, number];
}> = ({ name, hand, hand2, f }) => {
  const [x, y] = hand;
  const mid: [number, number] = [(hand[0] + hand2[0]) / 2, (hand[1] + hand2[1]) / 2];
  switch (name) {
    case "flashlight":
      return (
        <g transform={`translate(${x} ${y}) rotate(-8)`}>
          <polygon points="18,-4 900,-170 900,170 18,4" fill="url(#beam)" opacity={0.55 + Math.sin(f * 0.4) * 0.04} />
          <rect x={-14} y={-9} width={34} height={18} rx={4} fill="#4a4f5c" {...S} />
          <rect x={18} y={-12} width={10} height={24} rx={2} fill="#ffe9a8" {...S} />
          <defs>
            <linearGradient id="beam" x1="0" x2="1">
              <stop offset="0" stopColor="#fff6c8" stopOpacity={0.9} />
              <stop offset="1" stopColor="#fff6c8" stopOpacity={0} />
            </linearGradient>
          </defs>
        </g>
      );
    case "bottle":
      return (
        <g transform={`translate(${x} ${y - 30})`}>
          <rect x={-11} y={-6} width={22} height={52} rx={6} fill="#bfe6ff" {...S} />
          <rect x={-6} y={-18} width={12} height={14} rx={2} fill="#3e7fd1" {...S} />
          <rect x={-11} y={14} width={22} height={30} rx={4} fill="#6fb6ff" opacity={0.7} />
        </g>
      );
    case "jug":
      return (
        <g transform={`translate(${mid[0]} ${mid[1] - 20})`}>
          <path d="M -26 -30 L 26 -30 L 30 40 Q 0 50 -30 40 Z" fill="#dff1ff" {...S} />
          <path d="M -26 0 L 26 0 L 30 40 Q 0 50 -30 40 Z" fill="#7cc0ff" opacity={0.8} />
          <rect x={-10} y={-44} width={20} height={14} rx={3} fill="#e0503a" {...S} />
        </g>
      );
    case "pot":
    case "bucket":
      return (
        <g transform={`translate(${mid[0]} ${mid[1] + 6})`}>
          <path d="M -46 -24 L 46 -24 L 38 30 Q 0 40 -38 30 Z" fill={name === "pot" ? "#9aa3ad" : "#5b8fc7"} {...S} />
          <ellipse cx={0} cy={-24} rx={46} ry={10} fill="#5aa9ff" {...S} />
          <path d="M -46 -16 L -62 -20 M 46 -16 L 62 -20" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case "towel":
      return (
        <g transform={`translate(${x} ${y})`}>
          <path d={`M -8 -6 L 30 -10 Q ${36 + Math.sin(f * 0.3) * 4} 40 28 70 L -14 74 Q -6 30 -8 -6 Z`} fill="#e66b6b" {...S} />
          <path d="M -10 50 L 30 46" stroke="#fff" strokeWidth={5} />
        </g>
      );
    case "phone":
      return (
        <g transform={`translate(${x + 4} ${y - 26})`}>
          <rect x={-14} y={-24} width={28} height={50} rx={6} fill="#222" {...S} />
          <rect x={-10} y={-18} width={20} height={36} rx={2} fill={Math.floor(f / 8) % 2 ? "#ff5a4a" : "#ffd24a"} />
          <circle cx={0} cy={0} r={60} fill="#ffcf6a" opacity={0.15 + 0.1 * Math.sin(f * 0.8)} />
        </g>
      );
    case "broom":
      return (
        <g transform={`translate(${x} ${y}) rotate(${-30 + Math.sin(f * 0.25) * 12})`}>
          <line x1={0} y1={-120} x2={0} y2={120} stroke="#8b5a2b" strokeWidth={9} strokeLinecap="round" />
          <line x1={0} y1={-120} x2={0} y2={120} stroke={INK} strokeWidth={13} strokeLinecap="round" opacity={0.0} />
          <path d="M -30 118 L 30 118 L 40 170 L -40 170 Z" fill="#e2b85c" {...S} />
        </g>
      );
    case "spray_bottle":
      return (
        <g transform={`translate(${x} ${y - 20})`}>
          <rect x={-14} y={-10} width={28} height={50} rx={6} fill="#8fe0c4" {...S} />
          <path d="M -8 -10 L -8 -28 L 18 -28 L 18 -20" fill="#3b8f74" {...S} />
          {Math.floor(f / 6) % 3 === 0 && [0, 1, 2, 3].map((i) => <circle key={i} cx={30 + i * 10} cy={-26 + (i % 2) * 6} r={3} fill="#bfe9ff" />)}
        </g>
      );
    case "can":
      return (
        <g transform={`translate(${x} ${y - 18})`}>
          <rect x={-16} y={-20} width={32} height={40} rx={4} fill="#d64b3c" {...S} />
          <rect x={-16} y={-8} width={32} height={14} fill="#f4e6c4" />
        </g>
      );
    case "backpack":
      return null; // drawn on the character's back by Stickman
    case "whistle":
      return (
        <g transform={`translate(${x} ${y - 6})`}>
          <path d="M -10 -8 L 22 -8 L 22 8 L 2 8 A 12 12 0 1 1 -10 -8 Z" fill="#ff7a2f" {...S} />
        </g>
      );
    case "map":
    case "note":
      return (
        <g transform={`translate(${mid[0]} ${mid[1] - 20}) rotate(-4)`}>
          <rect x={-46} y={-34} width={92} height={68} fill={name === "map" ? "#f3e2b0" : "#fffbe8"} {...S} />
          {name === "map" ? <path d="M -36 10 Q -10 -20 10 4 T 36 -10" stroke="#3b7dd8" strokeWidth={4} fill="none" /> :
            [0, 1, 2].map((i) => <line key={i} x1={-34} y1={-16 + i * 14} x2={30 - i * 10} y2={-16 + i * 14} stroke="#555" strokeWidth={3} />)}
        </g>
      );
    case "radio":
      return (
        <g transform={`translate(${mid[0]} ${mid[1] - 22})`}>
          <rect x={-40} y={-26} width={80} height={52} rx={8} fill="#c94f3a" {...S} />
          <circle cx={-14} cy={0} r={14} fill="#333" {...S} />
          <rect x={6} y={-12} width={26} height={10} fill="#ffe39a" {...S} />
          <line x1={30} y1={-26} x2={44} y2={-70} stroke={INK} strokeWidth={4} />
        </g>
      );
    case "ruler":
      return (
        <g transform={`translate(${x} ${y - 40}) rotate(-80)`}>
          <rect x={-60} y={-10} width={120} height={20} fill="#f2d36b" {...S} />
          {[...Array(11)].map((_, i) => <line key={i} x1={-55 + i * 11} y1={-10} x2={-55 + i * 11} y2={i % 5 === 0 ? 2 : -3} stroke={INK} strokeWidth={2} />)}
        </g>
      );
    case "spoon":
      return (
        <g transform={`translate(${x} ${y}) rotate(-40)`}>
          <line x1={0} y1={0} x2={0} y2={-50} stroke="#b9bec7" strokeWidth={7} strokeLinecap="round" />
          <ellipse cx={0} cy={-58} rx={9} ry={13} fill="#b9bec7" {...S} />
        </g>
      );
    case "box":
      return (
        <g transform={`translate(${mid[0]} ${mid[1] - 10})`}>
          <rect x={-50} y={-38} width={100} height={70} fill="#c99a5b" {...S} />
          <path d="M -50 -38 L 0 -20 L 50 -38" fill="none" stroke={INK} strokeWidth={3} />
        </g>
      );
    case "stone":
      return <ellipse cx={mid[0]} cy={mid[1] - 10} rx={34} ry={24} fill="#8a8580" {...S} />;
    case "batteries":
      return (
        <g transform={`translate(${x} ${y - 10})`}>
          {[0, 1, 2].map((i) => <rect key={i} x={-20 + i * 14} y={-16} width={12} height={30} rx={3} fill="#3a3f4a" {...S} strokeWidth={3} />)}
        </g>
      );
    case "dog":
      return (
        <g transform={`translate(${mid[0] + 22} ${mid[1] + 92}) scale(0.8)`}>
          <Dog pose="carried" f={f} />
        </g>
      );
    default:
      return null;
  }
};
