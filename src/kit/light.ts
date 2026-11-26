import { TimeOfDay } from "../types";

// One lighting look per time of day. Places draw in plain "day" colours; the scene then lays
// a tint over everything (multiply) and adds light sources on top (screen).

export const INK = "#16161a";       // outline colour for everything
export const LINE = 6;              // default outline width

export interface Look {
  skyTop: string;
  skyBottom: string;
  tint: string;          // multiply colour over the whole scene
  tintOpacity: number;
  sun: string | null;    // colour of the low sun/haze glow, if any
  windowLight: string;   // what a window looks like from inside
  lampOn: number;        // 0..1: how strongly indoor lamps glow
}

export const LOOKS: Record<TimeOfDay, Look> = {
  morning: { skyTop: "#9fc4e8", skyBottom: "#f6d9b8", tint: "#ffe9cf", tintOpacity: 0.18, sun: "#ffd9a0", windowLight: "#e9f1f7", lampOn: 0 },
  day:     { skyTop: "#7fb4e6", skyBottom: "#d7ebf7", tint: "#ffffff", tintOpacity: 0, sun: null, windowLight: "#eaf4fb", lampOn: 0 },
  dusk:    { skyTop: "#4a4e8c", skyBottom: "#f29a63", tint: "#ff9a5c", tintOpacity: 0.28, sun: "#ffb070", windowLight: "#f4b98a", lampOn: 0.6 },
  night:   { skyTop: "#0d1430", skyBottom: "#2b3566", tint: "#2a3570", tintOpacity: 0.62, sun: null, windowLight: "#22305e", lampOn: 1 },
};

// Grey "ash sky" — the volcano story blends the sky toward this as ash_cover rises.
export const ASH_SKY_TOP = "#5d5b58";
export const ASH_SKY_BOTTOM = "#8f8a83";

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
