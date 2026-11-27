# Stickman Survival — video pipeline

Faceless YouTube channel of animated stick-figure survival stories. This folder turns
`story_bible.md` into finished episodes (MP4, 1920x1080, 30 fps). The owner is not a coder:
do every install, file and fix yourself, explain each step in one plain sentence, and only ask
questions when you really need an answer. When they paste an error, fix it and say in one
sentence what was wrong.

## Setup (once per machine)
```bash
npm install
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
```
Needs Node 18+, Python 3 and ffmpeg. Voice uses ElevenLabs: on a Claude cloud session the
network proxy adds the key; on your own computer set `ELEVENLABS_API_KEY`.

## What the owner says → what you do
| They say | You do |
|---|---|
| **Write episode N** | Write `episodes/epN/script.md` from the bible: narrator talks to "you", present tense, cold open first, then day by day, one real survival lesson per beat (only from the bible's FACTS LIST), ending with a tease + comment question. Default length 3 min ≈ 450–500 words, or what they ask. |
| **Make the scenes** | Split the script into `episodes/epN/scenes.json` (format below). One scene = one sentence or two short ones. Then `pipeline.py check N`. |
| **Make five voice samples** | `voice.samples(...)` (see `scripts/voice.py`) with 5 calm male storytellers from the ElevenLabs voice list → `voice_samples/`. Send them; let the owner pick. |
| **Make the voice** | `.venv/bin/python scripts/pipeline.py voice N --voice <ID>` → one WAV per scene, durations written into scenes.json. Costs ElevenLabs credits (≈1 credit per character); say the cost first. |
| **Show me scene K** | `pipeline.py still N K` → `episodes/epN/stills/scene_K.png`. Look at it yourself first. |
| **Show me scenes A B C** | `pipeline.py sheet N A B C` → contact sheet. |
| **Build the video** | Always in this order: `pipeline.py sample N --scenes 1,2,3` (if not done) → `pipeline.py preview N --seconds 20` → look at frames → `pipeline.py render N` → `episodes/epN/episode_N.mp4`. |
| **Redo scene K** (+ what to change) | Edit only that scene in scenes.json (pose / place / camera / face / props…), `still N K` to check, then re-render. If the *text* changed, re-run `voice N --scenes K` for that one scene. |
| **Make the thumbnail** | Write `episodes/epN/thumbnail.json` (day, place, time_of_day, face, danger: eruption/lahar/zombies/none, ash_cover, dog, word) → `pipeline.py thumbnail N` → `thumbnail_N.png` (1280x720). |
| **Package it** | Write `episodes/epN/upload.md`: title in the bible's pattern (`[Disaster]: [N] [Hours/Days] Survival …`), a short description (story hook + "fictional story, real survival tips — not professional safety advice" + chapters if long), and 10 tags. |
| **Show me the character** | `npx remotion still src/index.ts Sheet out/sheet.png` (all poses) and `Sheet2` (faces, dog, zombies). |

## scenes.json
```json
{ "episode": 1, "title": "…", "voice": {"voice_id": "…", "model_id": "eleven_v3"},
  "scenes": [ {
    "id": 1, "text": "Narration for this scene.",
    "place": "riverbed", "time_of_day": "day",          // morning | day | dusk | night
    "pose": "running", "face": "scared",
    "props": ["flashlight"], "shot": "wide",            // wide | medium | closeup
    "extras": {"ash": 0.5, "lahar": true},              // zombies 0–40, fire, smoke (true, or [x,y] for thin chimney smoke), police_lights, rain, snow,
                                                        // ash 0–1, lightning, eruption, lahar, car, flashlight
    "camera": "shake",                                  // push_in | pan_left | pan_right | shake | still
    "day_title": "DAY 60",                              // or null; use a WIDE shot when set
    "sfx": ["rumble", "door@1.2"],                      // name or name@seconds-into-scene
    "dog": "run",                                       // none | sit | stand | walk | run | lie | carried | window
    "ash_cover": 0.8,                                   // 0–1, how grey the world is
    "x": 900, "x_to": 1300, "y": 760, "facing": "right", // optional staging (y = feet height, e.g. on a bed)
    "character": false,                                 // optional: shot without the main character
    "focus": "dog",                                     // optional: camera on the dog, or [x, y] = on a spot (e.g. a map)
    "cut": {"on": "word", "shot": "closeup"},           // optional: a 2nd picture inside a long line (voice unchanged)
    "under_table": true,                                // optional: big table drawn in front (hiding under it)
    "dog_x": 930, "dog_y": 576,                         // optional dog position (930/576 = living-room windowsill)
    "overlay": {"type": "stat", "text": "31 GALLONS", "icon": "drop", "on": "Thirty"},  // optional, or a list
    "duration": 2.41, "audio": "voice/scene_001.wav"    // written by the voice step
  } ] }
```
- **On-screen visuals (overlay)** — add one whenever the narrator says a number, measurement, time,
  rule, problem, tip or fact. Types: `stat` (big number that counts up), `measure` (`value` in cm →
  animated ruler), `time` ("6:12 PM"), `rule` / `problem` (`label` "RULE 2" + `text`), `tip`, `fact`,
  `alert` (phone emergency alert), `checklist` (`items`, ticks one by one), `counter` (`items` like
  `"30 GAL|drop"`), `question` (end-of-episode comment question, centred at the bottom).
  Icons: drop, ruler, mountain, clock, warning, dog, glasses, mask, battery, phone, home, check.
  `on` = the word that triggers it (must be in the text); or `at` = seconds into the scene.
  The camera automatically moves the character to the left third so the card never covers the face,
  and a soft "pop" sound plays when it appears. Keep card text short (≤ 5 words) and in CAPITALS.
- Handy spots: ranger-station chimney top = [1312, 420]; kitchen map = focus [880, 320].
- A day title followed by an overlay (e.g. the countdown chips with `"at": 1.4`) leaves early so they never overlap.
- Places: valley, farmhouse, road, living_room, kitchen, back_yard, hallway, workshop, bedroom,
  bedroom_collapsed, porch, garden, pantry, front_door, town_street, riverbed, hillside,
  ranger_station, ranger_inside, ridge_top. New places go in `src/places/index.tsx`.
- Poses: standing, looking, walking, running, carrying, crouching, kneeling, pointing, holding,
  reaching, arms_up, hugging, sitting, sleeping. Faces: worried, scared, determined, happy, tired,
  neutral, shocked.
- Props: flashlight, bottle, jug, pot, bucket, towel, phone, broom, spray_bottle, can, backpack,
  whistle, map, note, radio, ruler, dog, spoon, mask (on the face), box, stone, batteries.
- Sounds (made in code, `scripts/sound.py`): ambient — wind, ash_hiss, rumble, rain, lahar_roar,
  fire, crowd, heartbeat; one-shots — footsteps, run_steps, creak, door, door_slam, phone_alert,
  car_away, dog_bark, dog_whine, squeak, pour, rattle, wipe, thunder, whoosh, boom, click,
  power_down, splash, lid, sniff, pop, tick. A file `sfx/<name>.wav|mp3` overrides the built-in sound or adds
  a new one. A file in `music/` (or `music/epN.mp3`) replaces the synth music bed.

## Quality rules (check every episode)
- Voice first: every scene lasts exactly its narration (+0.2 s gap). No gap over 0.5 s; pauses
  inside a line are cut to 0.3 s by `scripts/voice.py`.
- Pacing: first minute a new picture every 2–3 s, then every 3–5 s (`check` warns). Before the voice,
  split long sentences into two scenes; after the voice, add a `cut` instead (no re-voicing needed).
- The character is always doing something; vary pose/shot/camera between neighbouring scenes.
- Arms never cross the head (the rig enforces it). Day titles only on wide shots.
- Every number, rule and tip the narrator says gets an on-screen overlay.
- Music ≈ 20 dB under the voice, loudest effect ≥ 9 dB under; master −14 LUFS. `sound` prints the
  measured numbers — report them.
- Survival tips must come from the bible's FACTS LIST. No gore, no real brands or people.
- Never copy other channels' stories, characters or sentences (see research notes in the bible).
- Test on a 3-scene sample and show a still before any full render.

## Code map
- `src/characters/` Stickman (rig, poses, faces, glasses, yellow raincoat), Dog (Pebble), Props
- `src/places/` kit.tsx (sky, mountain, houses, rooms, windows…) and index.tsx (the places library)
- `src/extras/` Zombie + Crowd, Effects (ash/rain/snow, fire, smoke, police lights, lightning, lahar, car)
- `src/scenes/` Scene (camera, lighting, day title), Episode (timeline + audio), Thumbnail, Sheet (test sheets)
- `scripts/` pipeline.py (all commands), voice.py (ElevenLabs + trimming), sound.py (music + effects)
- Rendered videos and `public/epN/` audio are not committed (re-render any time); scripts, scenes,
  voice WAVs and stills are.
