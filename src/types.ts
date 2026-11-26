// Shared types for scenes.json. Every field here matches a field in episodes/epN/scenes.json.

export type TimeOfDay = "morning" | "day" | "dusk" | "night";
export type FaceMood = "worried" | "scared" | "determined" | "happy" | "tired" | "neutral" | "shocked" | "sleep";
export type Pose =
  | "standing" | "walking" | "running" | "carrying" | "crouching" | "kneeling"
  | "pointing" | "holding" | "arms_up" | "sitting" | "sleeping" | "looking" | "reaching" | "hugging";
export type Shot = "wide" | "medium" | "closeup";
export type CameraMove = "push_in" | "pan_left" | "pan_right" | "shake" | "still";
export type DogPose = "none" | "sit" | "stand" | "walk" | "run" | "lie" | "carried" | "window";

export interface Extras {
  zombies?: number;        // 0–40
  fire?: boolean;
  smoke?: boolean;
  police_lights?: boolean;
  rain?: boolean;
  snow?: boolean;
  ash?: number;            // falling ash, 0–1 (0 = none)
  lightning?: boolean;
  eruption?: boolean;      // glowing mountain top + ash column (places that show the mountain)
  lahar?: boolean;         // grey mudflow rushing through the scene
  car?: boolean;           // a car driving away
  flashlight?: boolean;    // flashlight beam from the character's hand
  phone_glow?: boolean;    // glowing phone screens / alert
}

export interface SceneData {
  id: number;
  text: string;
  place: string;
  time_of_day: TimeOfDay;
  pose: Pose;
  face: FaceMood;
  props: string[];
  shot: Shot;
  extras: Extras;
  camera: CameraMove;
  day_title: string | null;
  sfx: string[];
  // optional staging
  character?: boolean;     // false = scene without the main character (establishing shots)
  dog?: DogPose;
  x?: number;              // character x in the place (0–1920); default = the place's spot
  x_to?: number;           // walk/run to this x during the scene
  facing?: "left" | "right";
  ash_cover?: number;      // 0–1: how grey/buried the world looks
  // filled by the voice step
  duration?: number;       // seconds of narration for this scene
  audio?: string;
}

export interface TimedScene extends SceneData {
  from: number;            // start frame
  frames: number;          // length in frames
}

export type EpisodeData = {
  episode: number;
  title: string;
  fps: number;
  audio: string | null;    // path under public/, e.g. "ep1/mix.wav"
  scenes: TimedScene[];
};
