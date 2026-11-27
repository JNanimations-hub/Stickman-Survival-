import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, CalculateMetadataFunction } from "remotion";
import { EpisodeData, TimedScene } from "../types";
import { SceneView } from "./Scene";
import { overlayStart, Overlay } from "./Overlay";

// A long line can carry two pictures: scene.cut = { on: "word" | at: seconds, ...fields to change }.
// The voice is untouched; the picture cuts to the second angle when that word is spoken.
const splitScene = (s: TimedScene): TimedScene[] => {
  if (!s.cut) return [s];
  const { on, at, ...changes } = s.cut;
  const cutF = Math.max(20, Math.min(s.frames - 20, overlayStart({ type: "tip", on, at } as Overlay, s.text, s.frames) + 3));
  const ovs = Array.isArray(s.overlay) ? s.overlay : s.overlay ? [s.overlay] : [];
  const starts = ovs.map((o) => overlayStart(o, s.text, s.frames));
  const a: TimedScene = { ...s, frames: cutF, overlay: ovs.filter((_, i) => starts[i] < cutF), cut: undefined };
  const b: TimedScene = {
    ...s, ...changes, from: s.from + cutF, frames: s.frames - cutF, day_title: null, cut: undefined,
    overlay: ovs.flatMap((o, i) => (starts[i] >= cutF ? [{ ...o, on: undefined, at: (starts[i] - cutF) / 30 }] : [])),
  } as TimedScene;
  return [a, b];
};

// The whole episode: every scene plays for exactly its narration length, then the next one cuts in.
export const Episode: React.FC<EpisodeData> = ({ scenes, audio }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {scenes.flatMap(splitScene).map((s, k) => (
      <Sequence key={`${s.id}-${k}`} from={s.from} durationInFrames={s.frames} name={`${s.id}: ${s.text.slice(0, 40)}`}>
        <SceneView s={s} frames={s.frames} />
      </Sequence>
    ))}
    {audio && <Audio src={staticFile(audio)} />}
  </AbsoluteFill>
);

export const episodeMetadata: CalculateMetadataFunction<EpisodeData> = ({ props }) => {
  const last = props.scenes[props.scenes.length - 1];
  return { durationInFrames: last ? last.from + last.frames : 30, fps: props.fps || 30 };
};
