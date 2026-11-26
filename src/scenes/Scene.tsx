import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { TimedScene, SceneData } from "../types";
import { PLACES } from "../places";
import { Stickman, FIGURE_HEIGHT, HEAD_Y } from "../characters/Stickman";
import { Dog } from "../characters/Dog";
import { Crowd } from "../extras/Zombie";
import { Falling, Fire, Smoke, PoliceLights, Lightning, Lahar, CarAway } from "../extras/Effects";
import { LOOKS, INK } from "../kit/light";
import { eio, eback, ramp, rnd } from "../kit/helpers";
import { OverlayView, overlayStart } from "./Overlay";

// Anton (SIL Open Font License) is kept in public/fonts so renders never need the internet.
export const TITLE_FONT = "Anton";
loadFont({ family: TITLE_FONT, url: staticFile("fonts/Anton-Regular.woff2"), weight: "400" });

// One scene = place + extras + character + dog, filmed with a camera move.
export const SceneView: React.FC<{ s: SceneData | TimedScene; frames: number }> = ({ s, frames }) => {
  const f = useCurrentFrame();
  const place = PLACES[s.place] ?? PLACES.living_room;
  const ex = s.extras ?? {};
  const ashCover = s.ash_cover ?? 0;
  const t = eio(ramp(f, 0, Math.max(1, frames - 1)));

  // character position (walks across if moving)
  const sc = place.scale;
  const moving = s.pose === "walking" || s.pose === "running" || s.pose === "carrying";
  const facing = s.facing ?? "right";
  const x0 = s.x ?? place.charX;
  const dirSign = facing === "left" ? -1 : 1;
  const x1 = s.x_to ?? (moving ? x0 + dirSign * (s.pose === "running" ? 520 : 260) * sc : x0);
  const cx = x0 + (x1 - x0) * ramp(f, 0, frames);
  const floor = s.y ?? place.floorY;

  // camera: shot size → zoom, focus on the character
  const figH = FIGURE_HEIGHT * sc;
  const headY = floor + HEAD_Y * sc;
  let z = 1, fx = 960, fy = 540;
  if (s.character === false) { z = s.shot === "wide" ? 1.06 : s.shot === "medium" ? 1.35 : 1.8; }
  else if (s.pose === "sleeping") { z = s.shot === "closeup" ? 2.2 : s.shot === "medium" ? 1.5 : 1.06; fx = cx; fy = floor - 140 * sc; }
  else if (s.shot === "medium") { z = Math.max(1.25, (1080 * 0.78) / figH); fx = cx; fy = floor - figH * 0.55; }
  else if (s.shot === "closeup") { z = 360 / (2 * 80 * sc); fx = cx + 10 * sc * dirSign; fy = headY + 20 * sc; }
  else { z = 1.06; fx = 960; fy = 540; }
  if (s.camera === "push_in") z *= 1 + 0.16 * t;
  if (s.camera === "still") z *= 1 + 0.03 * t;
  if (s.camera === "pan_left") fx += (1 - 2 * t) * (130 / z);
  if (s.camera === "pan_right") fx -= (1 - 2 * t) * (130 / z);
  // with an on-screen card (not centred), slide the camera so the character sits in the left third
  const hasSideOverlay = (Array.isArray(s.overlay) ? s.overlay : s.overlay ? [s.overlay] : []).some((o) => (o.side ?? "auto") !== "center" && o.type !== "question");
  if (hasSideOverlay && s.character !== false && s.shot !== "wide") fx += 330 / z;
  // keep the view inside the drawn world
  const hw = 960 / z, hh = 540 / z;
  fx = Math.min(2080 - hw, Math.max(-160 + hw, fx));
  fy = Math.min(1260 - hh, Math.max(-160 + hh, fy));
  let shx = 0, shy = 0;
  if (s.camera === "shake") { shx = (rnd(`sh${f}`) - 0.5) * 18; shy = (rnd(`shy${f}`) - 0.5) * 14; }
  const world = `translate(${960 + shx} ${540 + shy}) scale(${z}) translate(${-fx} ${-fy})`;

  const L = LOOKS[s.time_of_day];
  const lampsOff = !!ex.flashlight;
  const dogPose = s.dog ?? "none";
  const props = [...(s.props ?? [])];
  if (dogPose === "carried" && !props.includes("dog")) props.push("dog");
  const dogX = dogPose === "walk" || dogPose === "run" ? cx - dirSign * 190 * sc : place.dogX;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <g transform={world}>
          <g style={{ filter: `saturate(${1 - 0.8 * ashCover}) brightness(${1 - 0.08 * ashCover})` }}>
            <place.C tod={s.time_of_day} ash={ashCover} f={f} eruption={ex.eruption} lampsOff={lampsOff} />
          </g>
          {ex.smoke && <Smoke x={1500} y={floor - 40} f={f} dark />}
          {ex.fire && <Fire x={1500} y={floor} f={f} s={sc * 1.2} />}
          {ex.lahar && <Lahar f={f} y={place.floorY + (s.place === "hillside" ? 160 : 40)} frames={frames} maxX={s.character === false || s.place === "hillside" ? 2400 : cx - 170 * sc} />}
          {ex.car && <CarAway f={f} frames={frames} y={floor + 60} />}
          {(ex.zombies ?? 0) > 0 && <Crowd n={ex.zombies!} f={f} y={floor} x0={cx + 300} x1={1980} facing="left" />}
          {dogPose !== "none" && dogPose !== "carried" && (
            <g transform={`translate(${dogX} ${floor})`}>
              <Dog pose={dogPose === "window" ? "sit" : dogPose} f={f} facing={dogPose === "walk" || dogPose === "run" ? facing : "left"} scale={sc * 0.95} />
            </g>
          )}
          {s.character !== false && <g transform={`translate(${cx} ${floor})`}>
            <Stickman pose={s.pose} face={s.face} f={f} props={props} facing={facing} scale={sc} seed={s.id * 3 + 1} />
          </g>}
          {(ex.ash ?? 0) > 0 && place.outdoor && <Falling f={f} kind="ash" amount={ex.ash!} seed={`s${s.id}`} />}
          {ex.rain && <Falling f={f} kind="rain" amount={1} />}
          {ex.snow && <Falling f={f} kind="snow" amount={1} />}
        </g>
        {/* time-of-day light over everything */}
        <rect x={0} y={0} width={1920} height={1080} fill={L.tint} opacity={L.tintOpacity * (lampsOff && !place.outdoor ? 1.25 : 1)} style={{ mixBlendMode: "multiply" }} />
        {(ex.ash ?? 0) > 0 && !place.outdoor && <rect x={0} y={0} width={1920} height={1080} fill="#8a857e" opacity={0.06} style={{ mixBlendMode: "multiply" }} />}
        {ex.lightning && <Lightning f={f} seed={s.id} />}
        {ex.police_lights && <PoliceLights f={f} />}
        {/* soft vignette */}
        <defs>
          <radialGradient id="vig" cx="50%" cy="50%" r="75%">
            <stop offset="0.6" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.45} />
          </radialGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="url(#vig)" />
      </svg>
      {s.day_title && <DayTitle text={s.day_title} f={f} frames={frames} />}
      {(Array.isArray(s.overlay) ? s.overlay : s.overlay ? [s.overlay] : []).map((o, i) => (
        <OverlayView key={i} o={o} f={f} frames={frames} startFrame={overlayStart(o, s.text, frames)}
          charSide={s.character === false ? "left" : 960 + (cx - fx) * z > 960 ? "right" : "left"} />
      ))}
    </AbsoluteFill>
  );
};

// Big bold "DAY 1" title: white with a thick black outline, pops in, holds, fades.
export const DayTitle: React.FC<{ text: string; f: number; frames: number }> = ({ text, f, frames }) => {
  const hold = Math.min(frames - 6, 60);
  const pop = eback(ramp(f, 0, 9));
  const out = 1 - ramp(f, hold, hold + 10);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 70, opacity: out }}>
      <div
        style={{
          fontFamily: TITLE_FONT, fontSize: 200, color: "#fff", letterSpacing: 6,
          WebkitTextStroke: `16px ${INK}`, paintOrder: "stroke fill",
          transform: `scale(${interpolate(pop, [0, 1], [0.4, 1])}) rotate(-2deg)`,
          textShadow: "0 10px 0 rgba(0,0,0,0.35)",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
