#!/usr/bin/env python3
"""Stickman Survival pipeline. Run from the project folder:

  .venv/bin/python scripts/pipeline.py <command> <episode> [options]

Commands
  check N                       check scenes.json (places, poses, props, sfx, pacing)
  voice N --voice ID            make the narration with ElevenLabs, one WAV per scene  [costs credits]
        [--model eleven_v3] [--scenes 1,2,3]
  sound N                       build the soundtrack (voice + music bed + sound effects)
  still N SCENE                 render one still of a scene → episodes/epN/stills/scene_XXX.png
  sheet N SCENE SCENE ...       render a contact sheet of several scenes
  sample N --scenes 1,2,3       render a short test video of just those scenes (with sound)
  preview N [--seconds 20]      render the first 20 seconds → episodes/epN/preview.mp4
  render N                      render the full episode → episodes/epN/episode_N.mp4
  thumbnail N                   render the 1280x720 thumbnail from episodes/epN/thumbnail.json
"""
import argparse, glob, json, os, shutil, subprocess, sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import sound as S  # noqa: E402

FPS = 30
GAP = 0.2          # silence between scenes (s) — the rules say 0.15–0.3
LEAD = 0.08        # voice starts this long after the cut
SR = S.SR

PLACES = ["valley", "farmhouse", "road", "living_room", "kitchen", "back_yard", "hallway", "workshop", "bedroom",
          "bedroom_collapsed", "porch", "garden", "pantry", "front_door", "town_street", "riverbed", "hillside",
          "ranger_station", "ranger_inside", "ridge_top"]
POSES = ["standing", "walking", "running", "carrying", "crouching", "kneeling", "pointing", "holding", "arms_up", "sitting",
         "sleeping", "looking", "reaching", "hugging"]
FACES = ["worried", "scared", "determined", "happy", "tired", "neutral", "shocked"]
PROPS = ["flashlight", "bottle", "jug", "pot", "towel", "phone", "broom", "spray_bottle", "can", "backpack", "whistle",
         "map", "radio", "ruler", "dog", "spoon", "mask", "box", "note", "stone", "bucket", "batteries"]
EXTRAS = ["zombies", "fire", "smoke", "police_lights", "rain", "snow", "ash", "lightning", "eruption", "lahar", "car",
          "flashlight", "phone_glow"]
SHOTS, CAMS = ["wide", "medium", "closeup"], ["push_in", "pan_left", "pan_right", "shake", "still"]
TODS = ["morning", "day", "dusk", "night"]
OVERLAYS = ["stat", "measure", "time", "rule", "problem", "tip", "fact", "alert", "checklist", "counter", "question"]
ICONS = ["drop", "ruler", "mountain", "clock", "warning", "dog", "glasses", "mask", "battery", "phone", "home", "check", "none"]


def overlays(s):
    o = s.get("overlay")
    return o if isinstance(o, list) else ([o] if o else [])


def overlay_start(o, text, frames):
    """Same rule as src/scenes/Overlay.tsx → seconds into the scene."""
    if o.get("at") is not None:
        return float(o["at"])
    if o.get("on"):
        i = text.lower().find(o["on"].lower())
        if i >= 0:
            speech = max(0.3, frames / FPS - LEAD - 0.2)
            return max(2, round((LEAD + i / max(1, len(text)) * speech) * FPS) - 3) / FPS
    return 6 / FPS
DOGS = ["none", "sit", "stand", "walk", "run", "lie", "carried", "window"]


def ep_dir(n):
    return os.path.join(ROOT, "episodes", f"ep{n}")


def load(n):
    return json.load(open(os.path.join(ep_dir(n), "scenes.json")))


def say(msg):
    print(msg, flush=True)


def estimate(text):
    return max(1.6, len(text.split()) / 2.6)


# ------------------------------------------------------------------ check
def cmd_check(n, quiet=False):
    data = load(n)
    problems, warn = [], []
    t = 0.0
    for s in data["scenes"]:
        sid = s.get("id")
        for key, allowed in (("place", PLACES), ("pose", POSES), ("face", FACES), ("shot", SHOTS), ("camera", CAMS), ("time_of_day", TODS)):
            if s.get(key) not in allowed:
                problems.append(f"scene {sid}: {key} '{s.get(key)}' is not one of {allowed}")
        for p in s.get("props", []):
            if p not in PROPS:
                problems.append(f"scene {sid}: unknown prop '{p}'")
        for e in (s.get("extras") or {}):
            if e not in EXTRAS:
                problems.append(f"scene {sid}: unknown extra '{e}'")
        for o in overlays(s):
            if o.get("type") not in OVERLAYS:
                problems.append(f"scene {sid}: overlay type '{o.get('type')}' is not one of {OVERLAYS}")
            if o.get("icon") and o["icon"] not in ICONS:
                problems.append(f"scene {sid}: overlay icon '{o['icon']}' is not one of {ICONS}")
            if o.get("on") and o["on"].lower() not in s["text"].lower():
                problems.append(f"scene {sid}: overlay word '{o['on']}' is not in the narration")
            if s.get("day_title") and float(o.get("at", 0)) < 1.3:
                warn.append(f"scene {sid} has a day title AND an overlay: they may overlap")
        if s.get("dog", "none") not in DOGS:
            problems.append(f"scene {sid}: dog '{s.get('dog')}' is not one of {DOGS}")
        for fx in s.get("sfx", []):
            name = fx.split("@")[0]
            if name not in S.ALL_SFX and not find_user_sfx(name):
                problems.append(f"scene {sid}: no sound called '{name}' (built in: {', '.join(S.ALL_SFX)}; or drop sfx/{name}.wav)")
        if s.get("day_title") and s.get("shot") != "wide":
            warn.append(f"scene {sid} has a day title: use a wide shot so the title doesn't cover the face")
        d = s.get("duration") or estimate(s["text"])
        limit = 3.5 if t < 60 else 5.5
        if d > limit:
            warn.append(f"scene {sid} lasts {d:.1f}s at {t:.0f}s in (aim ≤ {limit - 0.5:.0f}s): consider splitting it")
        t += d + GAP
    if not quiet:
        for p in problems:
            say("  PROBLEM  " + p)
        for w in warn:
            say("  pacing   " + w)
        say(f"{len(data['scenes'])} scenes, about {t / 60:.1f} min. {len(problems)} problems, {len(warn)} pacing notes.")
    if problems:
        sys.exit(1)
    return data


# ------------------------------------------------------------------ timeline + props
def timeline(scenes):
    out, f = [], 0
    for s in scenes:
        d = s.get("duration") or estimate(s["text"])
        frames = max(30, int(round((LEAD + d + GAP) * FPS)))
        out.append({**s, "from": f, "frames": frames})
        f += frames
    return out, f


def write_props(n, scenes, audio_rel, name):
    data = load(n)
    timed, total = timeline(scenes)
    props = {"episode": n, "title": data.get("title", f"Episode {n}"), "fps": FPS, "audio": audio_rel, "scenes": timed}
    path = os.path.join(ep_dir(n), f"{name}.props.json")
    json.dump(props, open(path, "w"), indent=1, ensure_ascii=False)
    return path, timed, total


# ------------------------------------------------------------------ sound
def find_user_sfx(name):
    for ext in ("wav", "mp3", "ogg", "flac"):
        p = os.path.join(ROOT, "sfx", f"{name}.{ext}")
        if os.path.exists(p):
            return p
    return None


def read_audio(path):
    tmp = path + ".48k.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", str(SR), tmp], check=True)
    x, _ = sf.read(tmp, dtype="float64")
    os.remove(tmp)
    return x


def rms_db(x):
    x = x[np.abs(x) > 1e-4] if np.any(np.abs(x) > 1e-4) else x
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def set_rms(x, target_db):
    return x * 10 ** ((target_db - rms_db(x)) / 20)


def lufs(path):
    r = subprocess.run(["ffmpeg", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    import re
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)
    return float(m[-1]) if m else float("nan")


def build_sound(n, timed, total_frames, out_name):
    """Returns the path (relative to public/) of the mixed soundtrack."""
    total = total_frames / FPS + 0.5
    N = int(total * SR)
    voice = np.zeros(N); music = np.zeros(N); fx = np.zeros(N)
    have_voice = False
    for s in timed:
        if s.get("audio") and os.path.exists(os.path.join(ep_dir(n), s["audio"])):
            v, _ = sf.read(os.path.join(ep_dir(n), s["audio"]), dtype="float64")
            if v.ndim > 1:
                v = v.mean(axis=1)
            i = int((s["from"] / FPS + LEAD) * SR)
            voice[i:i + len(v)] += v[: max(0, N - i)]
            have_voice = True
    v_db = rms_db(voice) if have_voice else -20.0

    # music bed: a file in music/ wins, else the synth bed
    mfiles = sorted(glob.glob(os.path.join(ROOT, "music", f"ep{n}.*"))) or sorted(
        f for f in glob.glob(os.path.join(ROOT, "music", "*")) if f.rsplit(".", 1)[-1].lower() in ("mp3", "wav", "ogg", "flac", "m4a"))
    if mfiles:
        m = read_audio(mfiles[0])
        reps = int(np.ceil(N / len(m)))
        m = np.tile(m, reps)[:N]
        say(f"  music: {os.path.basename(mfiles[0])}")
    else:
        m = S.music_bed(total)[:N]
        say("  music: synth bed (drop a file in music/ to replace it)")
    music[: len(m)] = S.fade(m, 1.5, 3.0)
    music = set_rms(music, v_db - 20)

    # sound effects
    for s in timed:
        t0 = s["from"] / FPS
        dur = s["frames"] / FPS
        specs = list(s.get("sfx", [])) + [f"pop@{overlay_start(o, s['text'], s['frames']) + 0.05:.2f}" for o in overlays(s)]
        for spec in specs:
            name, _, off = spec.partition("@")
            off = float(off) if off else 0.12
            user = find_user_sfx(name)
            if user:
                x = read_audio(user)
                ambient = name in S.AMBIENT
            elif name in S.AMBIENT:
                x, ambient = S.AMBIENT[name](dur + 0.6), True
            elif name in S.ONESHOT:
                x, ambient = S.ONESHOT[name](), False
            else:
                say(f"  (skipping unknown sound '{name}' in scene {s['id']})")
                continue
            if ambient:
                L = int((dur + 0.4) * SR)
                x = np.tile(x, int(np.ceil(L / max(1, len(x)))))[:L]
                x = set_rms(S.fade(x, 0.3, 0.4), v_db - 21)
                i = int(t0 * SR)
            else:
                x = set_rms(x, v_db - 12)
                i = int((t0 + off) * SR)
            fx[i:i + len(x)] += x[: max(0, N - i)]

    # keep effects peaks ≥ 9 dB under the voice peaks
    if have_voice:
        vp, fp = np.max(np.abs(voice)), np.max(np.abs(fx)) if fx.any() else 0
        lim = vp * 10 ** (-9 / 20)
        if fp > lim:
            fx *= lim / fp
    mix = voice + music + fx
    mix /= max(1.0, np.max(np.abs(mix)) / 0.95)

    pub = os.path.join(ROOT, "public", f"ep{n}"); os.makedirs(pub, exist_ok=True)
    raw = os.path.join(pub, f"{out_name}.raw.wav")
    sf.write(raw, np.stack([mix, mix], axis=1), SR, subtype="PCM_24")
    final = os.path.join(pub, f"{out_name}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11", "-ar", str(SR), final], check=True)
    os.remove(raw)
    if have_voice:
        bg = os.path.join(pub, "_bg.wav"); vv = os.path.join(pub, "_v.wav")
        sf.write(bg, music + fx, SR); sf.write(vv, voice, SR)
        say(f"  loudness: final {lufs(final):.1f} LUFS; music+effects sit {lufs(vv) - lufs(bg):.1f} dB under the voice")
        os.remove(bg); os.remove(vv)
    else:
        say("  (no voice yet — soundtrack is music and effects only)")
    return f"ep{n}/{out_name}.wav"


# ------------------------------------------------------------------ remotion
def remotion(args):
    cmd = ["npx", "remotion", *args]
    r = subprocess.run(cmd, cwd=ROOT)
    if r.returncode:
        sys.exit("Remotion failed (see the message above).")


def cmd_still(n, sid):
    data = cmd_check(n, quiet=True)
    props, timed, _ = write_props(n, data["scenes"], None, "still")
    s = next((x for x in timed if x["id"] == sid), None)
    if not s:
        sys.exit(f"No scene {sid}")
    out = os.path.join(ep_dir(n), "stills", f"scene_{sid:03d}.png")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    remotion(["still", "src/index.ts", "Episode", out, f"--props={props}", f"--frame={s['from'] + s['frames'] // 2}"])
    say(out)
    return out


def cmd_sheet(n, ids):
    data = cmd_check(n, quiet=True)
    props, timed, _ = write_props(n, data["scenes"], None, "still")
    outs = []
    d = os.path.join(ep_dir(n), "stills"); os.makedirs(d, exist_ok=True)
    frames = []
    for sid in ids:
        s = next(x for x in timed if x["id"] == sid)
        frames.append(str(s["from"] + s["frames"] // 2))
    for sid, fr in zip(ids, frames):
        o = os.path.join(d, f"scene_{sid:03d}.png")
        remotion(["still", "src/index.ts", "Episode", o, f"--props={props}", f"--frame={fr}", "--scale=0.5"])
        outs.append(o)
    cols = 3
    inputs = sum([["-i", o] for o in outs], [])
    layout = "|".join(f"{(i % cols) * 960}_{(i // cols) * 540}" for i in range(len(outs)))
    sheet = os.path.join(d, "sheet.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex",
                    f"{''.join(f'[{i}]' for i in range(len(outs)))}xstack=inputs={len(outs)}:layout={layout}:fill=black",
                    sheet], check=True)
    say(sheet)


def render_video(n, scenes, name, out_path, frames_range=None):
    timed0, total0 = timeline(scenes)
    audio = build_sound(n, timed0, total0, name)
    props, timed, total = write_props(n, scenes, audio, name)
    args = ["render", "src/index.ts", "Episode", out_path, f"--props={props}", "--codec=h264", "--pixel-format=yuv420p",
            "--crf=20", "--concurrency=4"]
    if frames_range:
        args.append(f"--frames={frames_range[0]}-{min(frames_range[1], total - 1)}")
    remotion(args)
    say(out_path)


def cmd_sample(n, ids):
    data = cmd_check(n, quiet=True)
    scenes = [s for s in data["scenes"] if s["id"] in ids]
    render_video(n, scenes, "sample", os.path.join(ep_dir(n), "sample.mp4"))


def cmd_preview(n, seconds):
    data = cmd_check(n, quiet=True)
    render_video(n, data["scenes"], "mix", os.path.join(ep_dir(n), "preview.mp4"), (0, int(seconds * FPS) - 1))


def cmd_render(n):
    data = cmd_check(n, quiet=True)
    missing = [s["id"] for s in data["scenes"] if not s.get("duration")]
    if missing:
        say(f"  note: scenes {missing[:8]}{'…' if len(missing) > 8 else ''} have no voice yet; using estimated lengths")
    render_video(n, data["scenes"], "mix", os.path.join(ep_dir(n), f"episode_{n}.mp4"))


def cmd_sound(n):
    data = cmd_check(n, quiet=True)
    timed, total = timeline(data["scenes"])
    say(build_sound(n, timed, total, "mix"))


def cmd_thumbnail(n):
    p = os.path.join(ep_dir(n), "thumbnail.json")
    if not os.path.exists(p):
        sys.exit(f"Write {p} first (day, place, time_of_day, face, danger, ash_cover, dog, word).")
    out = os.path.join(ep_dir(n), f"thumbnail_{n}.png")
    remotion(["still", "src/index.ts", "Thumbnail", out, f"--props={p}"])
    say(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("command")
    ap.add_argument("episode", type=int)
    ap.add_argument("rest", nargs="*")
    ap.add_argument("--voice")
    ap.add_argument("--model", default="eleven_v3")
    ap.add_argument("--scenes")
    ap.add_argument("--seconds", type=float, default=20)
    a = ap.parse_args()
    ids = [int(x) for x in a.scenes.split(",")] if a.scenes else None
    c, n = a.command, a.episode
    if c == "check":
        cmd_check(n)
    elif c == "voice":
        import voice as V
        vid = a.voice or load(n).get("voice", {}).get("voice_id")
        if not vid:
            sys.exit("Give --voice VOICE_ID (pick one from the voice samples first).")
        V.make_voice(ep_dir(n), vid, a.model, ids)
    elif c == "sound":
        cmd_sound(n)
    elif c == "still":
        cmd_still(n, int(a.rest[0]))
    elif c == "sheet":
        cmd_sheet(n, [int(x) for x in a.rest])
    elif c == "sample":
        cmd_sample(n, ids or [1, 2, 3])
    elif c == "preview":
        cmd_preview(n, a.seconds)
    elif c == "render":
        cmd_render(n)
    elif c == "thumbnail":
        cmd_thumbnail(n)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
