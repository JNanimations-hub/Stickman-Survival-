import React from "react";
import { FaceMood, Pose } from "../types";
import { INK } from "../kit/light";
import { blink, wobble } from "../kit/helpers";
import { Prop } from "./Props";

// THE main character. One rig, always identical:
// big round white head, thick black outline, dot eyes with highlights, eyebrows, mouth,
// round glasses (his weakness) and a bright yellow raincoat with the hood up (signature item).
//
// Local coordinates: (0,0) is the point between the feet on the ground, y goes down (SVG).
// Angles are in degrees, 0 = hanging straight down, positive = swinging forward (toward facing).

export const COAT = "#ffc83d";
export const COAT_SHADE = "#e0a420";
const SKIN = "#ffffff";
const PANTS = "#2b2d38";

export const RIG = {
  thigh: 72, shin: 70,
  torso: 104,
  upper: 60, fore: 58,
  headR: 80,
};
const HIP_Y = -(RIG.thigh + RIG.shin);            // -142
const NECK_Y = HIP_Y - RIG.torso;                   // -246
export const HEAD_Y = NECK_Y - RIG.headR + 12;      // head centre, overlaps neck a little
export const FIGURE_HEIGHT = -(HEAD_Y - RIG.headR); // ≈ 394

interface Limb { a: number; b: number } // a = joint at body (shoulder/hip), b = bend at elbow/knee (relative)

interface PoseFrame {
  lean: number;      // torso angle from vertical, + forward
  drop: number;      // how far the hips drop (crouch/sit), px
  bob: number;       // vertical bounce, px
  headTilt: number;
  armF: Limb; armB: Limb; // front arm / back arm
  legF: Limb; legB: Limb;
  lookX: number;     // pupils left/right, -1..1 (forward = +)
  rotate?: number;   // whole-body rotation (sleeping)
}

const deg = (d: number) => (d * Math.PI) / 180;
const dir = (angle: number, len: number) => [Math.sin(deg(angle)) * len, Math.cos(deg(angle)) * len];

// --- Poses -------------------------------------------------------------------------------------
// Every pose is a function of the frame so the character is never frozen.
function poseAt(pose: Pose, f: number, seed: number): PoseFrame {
  const w = (s: number, sp = 1) => wobble(f, seed + s, sp);
  const idle = (): PoseFrame => ({
    lean: 2 + w(1, 0.5) * 1.5, drop: 0, bob: Math.sin(f * 0.09) * 1.6, headTilt: w(2, 0.4) * 3,
    armF: { a: 8 + w(3, 0.5) * 4, b: 12 }, armB: { a: -6 + w(4, 0.5) * 4, b: 10 },
    legF: { a: 4, b: -2 }, legB: { a: -4, b: -2 }, lookX: 0.3,
  });

  switch (pose) {
    case "standing": return idle();
    case "looking": {
      // turns head and eyes left and right, as if scanning the room
      const look = Math.sin(f * 0.05 + seed);
      const p = idle();
      return { ...p, lookX: look, headTilt: look * 6 };
    }
    case "walking":
    case "carrying": {
      const p = f * 0.21;
      const s = Math.sin(p);
      const carry = pose === "carrying";
      return {
        lean: 5, drop: 0, bob: -Math.abs(Math.cos(p)) * 6 + 3, headTilt: s * 2,
        armF: carry ? { a: 62, b: 70 } : { a: -24 * s + 6, b: 18 },
        armB: carry ? { a: 54, b: 76 } : { a: 24 * s + 6, b: 18 },
        legF: { a: 26 * s, b: -Math.max(0, 40 * Math.sin(p + 1.4)) },
        legB: { a: -26 * s, b: -Math.max(0, 40 * Math.sin(p + 1.4 + Math.PI)) },
        lookX: 0.6,
      };
    }
    case "running": {
      const p = f * 0.34;
      const s = Math.sin(p);
      return {
        lean: 14, drop: 6, bob: -Math.abs(Math.cos(p)) * 12 + 6, headTilt: 4,
        armF: { a: -48 * s + 12, b: 85 }, armB: { a: 48 * s + 12, b: 85 },
        legF: { a: 46 * s + 8, b: -Math.max(10, 75 * Math.sin(p + 1.3)) },
        legB: { a: -46 * s + 8, b: -Math.max(10, 75 * Math.sin(p + 1.3 + Math.PI)) },
        lookX: 0.8,
      };
    }
    case "crouching": {
      // squatting and working with the hands (digging, wiping, filling)
      const work = Math.sin(f * 0.25 + seed);
      return {
        lean: 32, drop: 58, bob: 0, headTilt: 6,
        armF: { a: 50 + work * 14, b: 20 }, armB: { a: 40 - work * 12, b: 26 },
        legF: { a: 88, b: -118 }, legB: { a: 70, b: -128 }, lookX: 0.6,
      };
    }
    case "kneeling": {
      const work = Math.sin(f * 0.22 + seed);
      return {
        lean: 18, drop: 62, bob: 0, headTilt: 8,
        armF: { a: 55 + work * 12, b: 25 }, armB: { a: 45 - work * 10, b: 30 },
        legF: { a: 85, b: -88 }, legB: { a: -5, b: -95 }, lookX: 0.7,
      };
    }
    case "pointing": {
      const p = idle();
      return { ...p, armF: { a: 92 + w(5, 0.6) * 3, b: 0 }, lookX: 1, lean: 4 };
    }
    case "reaching": {
      const r = Math.sin(f * 0.12 + seed);
      return { ...idle(), lean: 10, armF: { a: 100 + r * 6, b: 6 }, armB: { a: 30, b: 30 }, lookX: 1 };
    }
    case "arms_up": {
      // V-shape so the hands always stay clear of the big head
      const t = Math.sin(f * 0.3) * 5;
      return {
        ...idle(), lean: -2,
        armF: { a: 110 + t, b: 34 }, armB: { a: 84 - t, b: 60 }, lookX: 0.2,
      };
    }
    case "holding": {
      // holding something up in front of the chest to look at it (phone, jug, flashlight, map)
      const p = idle();
      return { ...p, armF: { a: 64 + Math.sin(f * 0.08) * 3, b: 86 }, armB: { a: 20, b: 30 }, lookX: 0.8, headTilt: 8 };
    }
    case "hugging": {
      // holding something close (the dog) — arms wrapped in front of the chest
      const p = idle();
      return { ...p, armF: { a: 58, b: 88 }, armB: { a: 46, b: 96 }, lookX: 0.4, headTilt: 6 + p.headTilt };
    }
    case "sitting": {
      // sitting on the floor, knees up, arms around the knees, gentle rocking
      const rock = Math.sin(f * 0.06 + seed) * 2;
      return {
        lean: 6 + rock, drop: 128, bob: 0, headTilt: rock,
        armF: { a: 62, b: 40 }, armB: { a: 52, b: 46 },
        legF: { a: 128, b: -142 }, legB: { a: 118, b: -138 }, lookX: 0.4,
      };
    }
    case "sleeping": {
      const breathe = Math.sin(f * 0.06) * 2;
      return {
        lean: 0, drop: 0, bob: breathe, headTilt: 0, rotate: -90,
        armF: { a: 20, b: 30 }, armB: { a: 10, b: 20 },
        legF: { a: 10, b: -10 }, legB: { a: 4, b: -6 }, lookX: 0,
      };
    }
  }
}

// Keeps a point outside the head circle (arms must never cross the head).
function keepOffHead(x: number, y: number, hx: number, hy: number, r: number): [number, number] {
  const dx = x - hx, dy = y - hy, d = Math.hypot(dx, dy);
  if (d >= r || d === 0) return [x, y];
  return [hx + (dx / d) * r, hy + (dy / d) * r];
}

// --- Face --------------------------------------------------------------------------------------
export const Face: React.FC<{ mood: FaceMood; f: number; seed: number; lookX: number; r?: number; mask?: boolean }> = ({ mood, f, seed, lookX, r = RIG.headR, mask }) => {
  const k = r / 80;
  const scared = mood === "scared" || mood === "shocked";
  let open = blink(f, seed);
  if (mood === "tired") open *= 0.45;
  const closed = mood === "sleep";
  const eyeR = (scared ? 11 : 9) * k;
  const ex = 26 * k, ey = -6 * k, fx = 10 * k + lookX * 4 * k; // fx = face shifted toward facing
  const px = lookX * 3 * k;

  // eyebrows: [inner y, outer y] offsets per mood (negative = up)
  const brows: Record<FaceMood, [number, number]> = {
    worried: [-14, -4], scared: [-20, -8], determined: [4, -10], happy: [-10, -12],
    tired: [-2, 2], neutral: [-6, -6], shocked: [-22, -18], sleep: [-4, -4],
  };
  const [bi, bo] = brows[mood];
  const browY = ey - 34 * k;
  const shake = scared ? Math.sin(f * 2.1) * 0.8 : 0;

  const mouthY = 34 * k;
  const mouth = (() => {
    const m = fx;
    switch (mood) {
      case "happy": return <path d={`M ${m - 20 * k} ${mouthY - 4 * k} Q ${m} ${mouthY + 20 * k} ${m + 20 * k} ${mouthY - 4 * k} Z`} fill="#7a1f2b" stroke={INK} strokeWidth={4 * k} strokeLinejoin="round" />;
      case "scared": return <ellipse cx={m} cy={mouthY + 2 * k} rx={9 * k} ry={12 * k} fill="#5a1520" stroke={INK} strokeWidth={4 * k} />;
      case "shocked": return <ellipse cx={m} cy={mouthY + 4 * k} rx={13 * k} ry={17 * k} fill="#5a1520" stroke={INK} strokeWidth={4 * k} />;
      case "worried": return <path d={`M ${m - 16 * k} ${mouthY + 6 * k} Q ${m - 8 * k} ${mouthY - 2 * k} ${m} ${mouthY + 3 * k} T ${m + 16 * k} ${mouthY + 2 * k}`} fill="none" stroke={INK} strokeWidth={5 * k} strokeLinecap="round" />;
      case "determined": return <path d={`M ${m - 16 * k} ${mouthY + 2 * k} L ${m + 16 * k} ${mouthY}`} fill="none" stroke={INK} strokeWidth={6 * k} strokeLinecap="round" />;
      case "tired": return <path d={`M ${m - 14 * k} ${mouthY + 4 * k} Q ${m} ${mouthY - 2 * k} ${m + 14 * k} ${mouthY + 4 * k}`} fill="none" stroke={INK} strokeWidth={5 * k} strokeLinecap="round" />;
      case "sleep": return <ellipse cx={m} cy={mouthY + 2 * k} rx={5 * k} ry={4 * k} fill="#5a1520" />;
      default: return <path d={`M ${m - 14 * k} ${mouthY} Q ${m} ${mouthY + 8 * k} ${m + 14 * k} ${mouthY}`} fill="none" stroke={INK} strokeWidth={5 * k} strokeLinecap="round" />;
    }
  })();

  const eye = (x: number) =>
    closed ? (
      <path key={x} d={`M ${x - 9 * k} ${ey} Q ${x} ${ey + 7 * k} ${x + 9 * k} ${ey}`} fill="none" stroke={INK} strokeWidth={4 * k} strokeLinecap="round" />
    ) : (
      <g key={x}>
        <ellipse cx={x + px} cy={ey} rx={eyeR} ry={Math.max(1.2, eyeR * 1.2 * open)} fill={INK} />
        {open > 0.4 && <circle cx={x + px + eyeR * 0.35} cy={ey - eyeR * 0.45} r={eyeR * 0.36} fill="#fff" />}
      </g>
    );

  return (
    <g transform={`translate(${shake} 0)`}>
      {[fx - ex, fx + ex].map(eye)}
      {/* round glasses */}
      <g fill="none" stroke={INK} strokeWidth={4.5 * k}>
        <circle cx={fx - ex} cy={ey} r={21 * k} fill="rgba(200,230,255,0.18)" />
        <circle cx={fx + ex} cy={ey} r={21 * k} fill="rgba(200,230,255,0.18)" />
        <path d={`M ${fx - ex + 21 * k} ${ey - 2 * k} Q ${fx} ${ey - 9 * k} ${fx + ex - 21 * k} ${ey - 2 * k}`} />
        <path d={`M ${fx - ex - 21 * k} ${ey - 3 * k} L ${-r + 6 * k} ${ey - 8 * k}`} />
      </g>
      {/* lens glint */}
      <path d={`M ${fx + ex + 6 * k} ${ey - 14 * k} l ${6 * k} ${6 * k}`} stroke="#fff" strokeWidth={3 * k} strokeLinecap="round" opacity={0.8} />
      {/* eyebrows */}
      <g stroke={INK} strokeWidth={6 * k} strokeLinecap="round">
        <line x1={fx - ex - 14 * k} y1={browY + bo * k} x2={fx - ex + 12 * k} y2={browY + bi * k} />
        <line x1={fx + ex - 12 * k} y1={browY + bi * k} x2={fx + ex + 14 * k} y2={browY + bo * k} />
      </g>
      {mask ? (
        <g>
          <path d={`M ${fx - 34 * k} ${14 * k} Q ${fx} ${4 * k} ${fx + 34 * k} ${14 * k} L ${fx + 28 * k} ${48 * k} Q ${fx} ${60 * k} ${fx - 28 * k} ${48 * k} Z`} fill="#f2f2ee" stroke={INK} strokeWidth={4 * k} strokeLinejoin="round" />
          <path d={`M ${fx - 20 * k} ${30 * k} L ${fx + 20 * k} ${30 * k}`} stroke="#bdbdb5" strokeWidth={3 * k} />
        </g>
      ) : mouth}
      {/* sweat drop when scared */}
      {scared && (
        <path d={`M ${fx + ex + 30 * k} ${ey - 30 * k + ((f * 1.5) % 30) * k} q ${-7 * k} ${12 * k} 0 ${16 * k} q ${7 * k} ${-4 * k} 0 ${-16 * k} Z`} fill="#8fd3ff" stroke={INK} strokeWidth={2.5 * k} />
      )}
    </g>
  );
};

// --- Stickman ----------------------------------------------------------------------------------
export interface StickmanProps {
  pose: Pose;
  face: FaceMood;
  f: number;            // frame inside the scene
  props?: string[];
  facing?: "left" | "right";
  scale?: number;
  seed?: number;
  hood?: boolean;
}

export const Stickman: React.FC<StickmanProps> = ({ pose, face, f, props = [], facing = "right", scale = 1, seed = 7, hood = true }) => {
  const P = poseAt(pose, f, seed);
  const mood: FaceMood = pose === "sleeping" ? "sleep" : face;
  const tremble = face === "scared" && pose !== "sleeping" ? Math.sin(f * 1.7) * 1.6 : 0;

  // hip & neck
  const hipY = HIP_Y + P.drop + P.bob;
  const [nx, ny] = (() => { const [dx, dy] = dir(180 - P.lean, RIG.torso); return [dx, hipY + dy]; })();
  const shoulder: [number, number] = [nx * 0.94, ny + 18];
  const headC: [number, number] = [nx + Math.sin(deg(P.lean)) * (RIG.headR - 12), ny - (RIG.headR - 12)];

  const limb = (from: [number, number], L1: number, L2: number, l: Limb, isArm: boolean) => {
    const [ax, ay] = dir(l.a, L1);
    let j: [number, number] = [from[0] + ax, from[1] + ay];
    const [bx, by] = dir(l.a + l.b, L2);
    let e: [number, number] = [j[0] + bx, j[1] + by];
    if (isArm) {
      j = keepOffHead(j[0], j[1], headC[0], headC[1], RIG.headR + 14);
      e = keepOffHead(e[0], e[1], headC[0], headC[1], RIG.headR + 18);
    }
    return { j, e };
  };

  const hip: [number, number] = [0, hipY];
  const legF = limb(hip, RIG.thigh, RIG.shin, P.legF, false);
  const legB = limb(hip, RIG.thigh, RIG.shin, P.legB, false);
  const armF = limb(shoulder, RIG.upper, RIG.fore, P.armF, true);
  const armB = limb(shoulder, RIG.upper, RIG.fore, P.armB, true);

  const path = (a: [number, number], b: [number, number], c: [number, number]) => `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`;

  const leg = (l: { j: [number, number]; e: [number, number] }, back: boolean) => (
    <g>
      <path d={path(hip, l.j, l.e)} fill="none" stroke={INK} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(hip, l.j, l.e)} fill="none" stroke={back ? "#1f2029" : PANTS} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      {/* boot */}
      <ellipse cx={l.e[0] + 9} cy={l.e[1] + 2} rx={18} ry={10} fill={back ? "#202020" : "#2a2a2a"} stroke={INK} strokeWidth={4} />
    </g>
  );
  const arm = (a: { j: [number, number]; e: [number, number] }, back: boolean) => (
    <g>
      <path d={path(shoulder, a.j, a.e)} fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(shoulder, a.j, a.e)} fill="none" stroke={back ? COAT_SHADE : COAT} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={a.e[0]} cy={a.e[1]} r={10} fill={SKIN} stroke={INK} strokeWidth={4.5} />
    </g>
  );

  // raincoat: a rounded A-line shape along the torso
  const coat = (() => {
    const L = P.lean;
    const top = 26, bottom = 46, len = RIG.torso + 34;
    return (
      <g transform={`translate(0 ${hipY}) rotate(${L})`}>
        <path
          d={`M ${-top} ${-RIG.torso + 4} Q 0 ${-RIG.torso - 12} ${top} ${-RIG.torso + 4} L ${bottom} ${len - RIG.torso + 14} Q 0 ${len - RIG.torso + 24} ${-bottom} ${len - RIG.torso + 14} Z`}
          transform={`translate(0 ${-0})`}
          fill={COAT} stroke={INK} strokeWidth={6} strokeLinejoin="round"
        />
        {/* zip + pocket + toggles */}
        <line x1={4} y1={-RIG.torso + 2} x2={6} y2={len - RIG.torso + 18} stroke={COAT_SHADE} strokeWidth={4} />
        <rect x={14} y={-20} width={20} height={14} rx={3} fill={COAT_SHADE} stroke={INK} strokeWidth={3} />
      </g>
    );
  })();

  const prop = (name: string, i: number) => <Prop key={name + i} name={name} hand={armF.e} hand2={armB.e} f={f} pose={pose} headC={headC} />;
  const backProps = props.filter((p) => p === "backpack");
  const handProps = props.filter((p) => p !== "backpack" && p !== "mask");
  const mask = props.includes("mask");

  return (
    <g transform={`translate(${tremble} 0) scale(${facing === "left" ? -scale : scale} ${scale})`}>
      <g transform={P.rotate ? `translate(150 ${-RIG.headR + 6}) rotate(${P.rotate} 0 ${-20})` : undefined}>
        {/* contact shadow */}
        {!P.rotate && <ellipse cx={0} cy={4} rx={70} ry={10} fill="rgba(0,0,0,0.22)" />}
        {backProps.length > 0 && (
          <g transform={`translate(${shoulder[0] - 34} ${shoulder[1] + 10}) rotate(${P.lean})`}>
            <rect x={-30} y={0} width={46} height={84} rx={12} fill="#4f7a4a" stroke={INK} strokeWidth={6} />
            <rect x={-26} y={40} width={36} height={28} rx={6} fill="#3e6139" stroke={INK} strokeWidth={4} />
          </g>
        )}
        {arm(armB, true)}
        {leg(legB, true)}
        {leg(legF, false)}
        {coat}
        {/* hood behind the head */}
        {hood && <circle cx={headC[0] - 10} cy={headC[1] - 4} r={RIG.headR + 16} fill={COAT} stroke={INK} strokeWidth={6} />}
        {/* head */}
        <g transform={`rotate(${P.headTilt} ${headC[0]} ${headC[1] + 40})`}>
          <circle cx={headC[0]} cy={headC[1]} r={RIG.headR} fill={SKIN} stroke={INK} strokeWidth={7} />
          {/* hood rim over the forehead */}
          {hood && <path d={`M ${headC[0] - RIG.headR - 4} ${headC[1] + 6} A ${RIG.headR + 6} ${RIG.headR + 6} 0 0 1 ${headC[0] + RIG.headR + 4} ${headC[1] - 6}`} fill="none" stroke={INK} strokeWidth={6} />}
          <g transform={`translate(${headC[0]} ${headC[1] + 4})`}>
            <Face mood={mood} f={f} seed={seed} lookX={P.lookX} mask={mask} />
          </g>
        </g>
        {handProps.map(prop)}
        {arm(armF, false)}
        {/* sleeping: a little Zzz */}
        {pose === "sleeping" && (
          <text x={headC[0] + 60} y={headC[1] - 90 - (f % 60) * 0.6} fontSize={46} fontWeight={900} fill="#fff" stroke={INK} strokeWidth={3} opacity={0.9} transform={`rotate(90 ${headC[0] + 60} ${headC[1] - 90})`}>z</text>
        )}
      </g>
    </g>
  );
};
