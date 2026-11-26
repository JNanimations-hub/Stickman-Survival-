import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stickman } from "../characters/Stickman";
import { Dog } from "../characters/Dog";
import { Zombie } from "../extras/Zombie";
import { FaceMood, Pose, DogPose } from "../types";

// Test sheet: every pose, every face, the dog and a zombie. Render with "show me the character".
const POSES: Pose[] = ["standing", "walking", "running", "carrying", "crouching", "kneeling", "pointing", "arms_up", "sitting", "sleeping", "reaching", "hugging"];
const FACES: FaceMood[] = ["worried", "scared", "determined", "happy", "tired", "shocked"];
const DOGS: DogPose[] = ["sit", "stand", "walk", "run", "lie"];

export const Sheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#dfe6ec" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {POSES.map((p, i) => (
          <g key={p} transform={`translate(${110 + (i % 6) * 300} ${i < 6 ? 470 : 1000}) scale(0.95)`}>
            <Stickman pose={p} face={FACES[i % FACES.length]} f={f + i * 7} props={p === "carrying" ? ["jug"] : p === "pointing" ? ["flashlight"] : p === "hugging" ? ["dog"] : p === "crouching" ? ["towel"] : []} />
            <text x={0} y={46} textAnchor="middle" fontSize={26} fontFamily="sans-serif" fontWeight={700}>{p} / {FACES[i % FACES.length]}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const Sheet2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#dfe6ec" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {FACES.map((m, i) => (
          <g key={m} transform={`translate(${170 + i * 310} 520) scale(1.25)`}>
            <Stickman pose="standing" face={m} f={f + 20} props={i === 4 ? ["mask"] : []} />
            <text x={0} y={40} textAnchor="middle" fontSize={22} fontFamily="sans-serif" fontWeight={700}>{m}{i === 4 ? " + mask" : ""}</text>
          </g>
        ))}
        {DOGS.map((d, i) => (
          <g key={d} transform={`translate(${150 + i * 260} 960)`}>
            <Dog pose={d} f={f + i * 5} />
            <text x={0} y={40} textAnchor="middle" fontSize={22} fontFamily="sans-serif" fontWeight={700}>dog: {d}</text>
          </g>
        ))}
        <g transform="translate(1600 1000)"><Zombie f={f} seed={3} /></g>
        <g transform="translate(1800 1000)"><Zombie f={f} seed={8} scale={0.8} /></g>
      </svg>
    </AbsoluteFill>
  );
};
