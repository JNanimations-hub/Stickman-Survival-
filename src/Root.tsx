import React from "react";
import { Composition, Still } from "remotion";
import { Sheet, Sheet2 } from "./scenes/Sheet";
import { Episode, episodeMetadata } from "./scenes/Episode";
import { Thumbnail, ThumbProps } from "./scenes/Thumbnail";
import { EpisodeData } from "./types";
import { Avatar, Banner } from "./scenes/Brand";

// Default props only matter in the Studio preview; the pipeline always passes the real episode.
const demo: EpisodeData = {
  episode: 0, title: "Demo", fps: 30, audio: null,
  scenes: [{
    id: 1, text: "Demo scene", place: "farmhouse", time_of_day: "dusk", pose: "standing", face: "worried",
    props: [], shot: "wide", extras: { eruption: true, ash: 0.5 }, camera: "push_in", day_title: "DAY 1", sfx: [],
    dog: "sit", ash_cover: 0.2, from: 0, frames: 120,
  }],
};
const thumb: ThumbProps = { day: "DAY 50", place: "farmhouse", time_of_day: "dusk", face: "scared", danger: "eruption", ash_cover: 0.5, dog: true, word: "ASHFALL" };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Episode" component={Episode} width={1920} height={1080} fps={30} durationInFrames={120} defaultProps={demo} calculateMetadata={episodeMetadata} />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} defaultProps={thumb} />
    <Still id="Avatar" component={Avatar} width={800} height={800} />
    <Still id="Banner" component={Banner} width={2560} height={1440} />
    <Composition id="Sheet" component={Sheet} width={1920} height={1080} fps={30} durationInFrames={90} />
    <Composition id="Sheet2" component={Sheet2} width={1920} height={1080} fps={30} durationInFrames={90} />
  </>
);
