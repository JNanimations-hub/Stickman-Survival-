import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, CalculateMetadataFunction } from "remotion";
import { EpisodeData } from "../types";
import { SceneView } from "./Scene";

// The whole episode: every scene plays for exactly its narration length, then the next one cuts in.
export const Episode: React.FC<EpisodeData> = ({ scenes, audio }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {scenes.map((s) => (
      <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={`${s.id}: ${s.text.slice(0, 40)}`}>
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
