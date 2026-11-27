import React from "react";
import { DogPose } from "../types";
import { INK } from "../kit/light";
import { blink } from "../kit/helpers";

// PEBBLE — small, scruffy brown dog with one floppy ear (left ear up, right ear flopped).
// Local origin: between the paws on the ground, facing right. Height ≈ 150 px at scale 1.

const FUR = "#a8703f";
const FUR_DARK = "#7d4f29";
const MUZZLE = "#ecd3b0";

export const Dog: React.FC<{ pose: DogPose; f: number; facing?: "left" | "right"; scale?: number }> = ({ pose, f, facing = "right", scale = 1 }) => {
  if (pose === "none") return null;
  const moving = pose === "walk" || pose === "run";
  const sp = pose === "run" ? 0.5 : 0.28;
  const ph = f * sp;
  const wag = Math.sin(f * (pose === "lie" ? 0.15 : 0.7)) * (pose === "lie" ? 6 : 22);
  const bob = moving ? -Math.abs(Math.sin(ph)) * (pose === "run" ? 10 : 4) : Math.sin(f * 0.1) * 1.2;
  const open = blink(f, 31);
  const sitting = pose === "sit" || pose === "window" || pose === "carried";
  const lying = pose === "lie";

  const leg = (x: number, phase: number, back: boolean) => {
    const swing = moving ? Math.sin(ph + phase) * (pose === "run" ? 34 : 22) : 0;
    const len = lying ? 0 : 46;
    if (lying) return null;
    return (
      <g key={x + "" + phase} transform={`translate(${x} ${-46}) rotate(${-swing})`}>
        <line x1={0} y1={0} x2={0} y2={len} stroke={INK} strokeWidth={17} strokeLinecap="round" />
        <line x1={0} y1={0} x2={0} y2={len} stroke={back ? FUR_DARK : FUR} strokeWidth={9} strokeLinecap="round" />
      </g>
    );
  };

  // body geometry
  const bodyY = lying ? -26 : sitting ? -62 : -66;
  const headX = sitting ? 34 : 62, headY = lying ? -52 : sitting ? -128 : -104;

  return (
    <g transform={`scale(${facing === "left" ? -scale : scale} ${scale}) translate(0 ${bob})`}>
      {!lying && pose !== "carried" && <ellipse cx={0} cy={4} rx={56} ry={8} fill="rgba(0,0,0,0.22)" />}
      {/* tail */}
      <path
        d={`M ${sitting ? -36 : -52} ${bodyY - 6} q -22 ${-20} ${-20 + wag * 0.3} ${-44}`}
        transform={`rotate(${wag} ${sitting ? -36 : -52} ${bodyY - 6})`}
        fill="none" stroke={INK} strokeWidth={16} strokeLinecap="round"
      />
      <path
        d={`M ${sitting ? -36 : -52} ${bodyY - 6} q -22 ${-20} ${-20 + wag * 0.3} ${-44}`}
        transform={`rotate(${wag} ${sitting ? -36 : -52} ${bodyY - 6})`}
        fill="none" stroke={FUR} strokeWidth={8} strokeLinecap="round"
      />
      {/* back legs */}
      {!sitting && leg(-34, Math.PI, true)}
      {!sitting && leg(30, 0, true)}
      {/* body */}
      {sitting ? (
        <g>
          <ellipse cx={-8} cy={-40} rx={42} ry={40} fill={FUR} stroke={INK} strokeWidth={6} />
          <ellipse cx={20} cy={-74} rx={28} ry={36} fill={FUR} stroke={INK} strokeWidth={6} />
          <ellipse cx={26} cy={-66} rx={14} ry={22} fill={MUZZLE} />
          {/* front paws */}
          <rect x={14} y={-40} width={16} height={40} rx={8} fill={FUR} stroke={INK} strokeWidth={5} />
          <rect x={34} y={-40} width={16} height={40} rx={8} fill={FUR} stroke={INK} strokeWidth={5} />
        </g>
      ) : (
        <g>
          <ellipse cx={0} cy={bodyY} rx={64} ry={lying ? 26 : 34} fill={FUR} stroke={INK} strokeWidth={6} />
          <ellipse cx={18} cy={bodyY + 8} rx={26} ry={14} fill={MUZZLE} opacity={0.7} />
          {/* scruffy tufts */}
          <path d={`M -30 ${bodyY - 30} l 8 -10 l 6 9 l 8 -11 l 6 10`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {lying && <path d={`M 30 ${bodyY + 14} l 40 6 M -40 ${bodyY + 16} l -30 4`} stroke={INK} strokeWidth={10} strokeLinecap="round" />}
        </g>
      )}
      {!sitting && leg(-26, 0, false)}
      {!sitting && leg(38, Math.PI, false)}
      {/* head */}
      <g transform={`translate(${headX} ${headY}) rotate(${lying ? 0 : Math.sin(f * 0.07) * 4})`}>
        {/* up ear (back) */}
        <path d="M -24 -20 L -30 -58 L -4 -32 Z" fill={FUR_DARK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={0} cy={0} r={34} fill={FUR} stroke={INK} strokeWidth={6} />
        {/* floppy ear */}
        <path d={`M 10 -28 Q 40 -30 ${38 + Math.sin(f * 0.2) * 2} ${2 + Math.sin(f * 0.2) * 3} Q 24 4 14 -14 Z`} fill={FUR_DARK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {/* muzzle + nose */}
        <ellipse cx={24} cy={12} rx={22} ry={16} fill={MUZZLE} stroke={INK} strokeWidth={5} />
        <ellipse cx={40} cy={6} rx={8} ry={6} fill={INK} />
        <path d="M 22 22 Q 30 28 38 20" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        {/* eye */}
        {pose === "lie" && Math.floor(f / 90) % 3 === 2 ? (
          <path d="M 2 -6 q 6 5 12 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
        ) : (
          <g>
            <ellipse cx={8} cy={-6} rx={6} ry={Math.max(1, 7 * open)} fill={INK} />
            {open > 0.4 && <circle cx={10} cy={-9} r={2.2} fill="#fff" />}
          </g>
        )}
        {/* little red collar */}
        <path d="M -26 22 Q 0 36 22 28" fill="none" stroke="#d83b3b" strokeWidth={8} strokeLinecap="round" />
        {/* the little metal tag: "If found, return to Quarry Ridge Ranger Station" */}
        <g transform={`rotate(${Math.sin(f * 0.25) * 8} 0 32)`}>
          <line x1={0} y1={32} x2={0} y2={38} stroke={INK} strokeWidth={2.5} />
          <circle cx={0} cy={44} r={7} fill="#c9ccd2" stroke={INK} strokeWidth={3} />
        </g>
      </g>
    </g>
  );
};
