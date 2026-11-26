"""Voice step: ElevenLabs narration → one trimmed WAV per scene, durations written to scenes.json.

How it works
  1. Every scene's text is joined into one narration (so the voice flows naturally), split into
     chunks under the model's limit at scene boundaries.
  2. ElevenLabs "text-to-speech with timestamps" returns the audio AND the start/end time of every
     character, so we know exactly where each scene starts and ends. No guessing.
  3. Each scene clip is cut out, silence at the start/end is trimmed, any pause inside a line is
     shortened to 0.3 s, and it is saved as episodes/epN/voice/scene_XXX.wav.

The API key: on a cloud session the network proxy adds it automatically. On your own computer set
ELEVENLABS_API_KEY in your environment.
"""
import base64, json, os, subprocess, sys, tempfile, urllib.request
import numpy as np
import soundfile as sf

SR = 48000
API = "https://api.elevenlabs.io/v1"


def api_key():
    return os.environ.get("ELEVENLABS_API_KEY", "proxy-injects-the-key")


def tts_with_timestamps(text, voice_id, model_id, prev_text=None, next_text=None, stability=0.5):
    body = {"text": text, "model_id": model_id,
            "voice_settings": {"stability": stability, "similarity_boost": 0.8, "style": 0.15, "speed": 1.0}}
    if model_id not in ("eleven_v3", "eleven_v4", "eleven_v4_turbo"):
        if prev_text: body["previous_text"] = prev_text
        if next_text: body["next_text"] = next_text
    req = urllib.request.Request(
        f"{API}/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), method="POST",
        headers={"xi-api-key": api_key(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            d = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs refused the request ({e.code}): {e.read().decode()[:400]}")
    al = d.get("normalized_alignment") or d.get("alignment")
    if al and len(al["characters"]) != len(text):
        al = d.get("alignment") or al
    return base64.b64decode(d["audio_base64"]), al


def mp3_to_array(mp3_bytes):
    with tempfile.TemporaryDirectory() as tmp:
        a, b = os.path.join(tmp, "a.mp3"), os.path.join(tmp, "a.wav")
        open(a, "wb").write(mp3_bytes)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a, "-ac", "1", "-ar", str(SR), b], check=True)
        x, _ = sf.read(b, dtype="float32")
    return x


def tidy(x, max_pause=0.3, keep=0.04):
    """Trim silence at both ends and shorten any inner pause to max_pause seconds."""
    if len(x) == 0:
        return x
    hop = int(0.01 * SR)
    n = len(x) // hop
    if n == 0:
        return x
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    thr = max(-42, db.max() - 32)
    voiced = db > thr
    # ignore tiny blips (breaths, clicks) shorter than 80 ms
    i = 0
    while i < n:
        if voiced[i]:
            j = i
            while j < n and voiced[j]:
                j += 1
            if j - i < 8:
                voiced[i:j] = False
            i = j
        else:
            i += 1
    if not voiced.any():
        return x[:0]
    first, last = np.argmax(voiced), n - 1 - np.argmax(voiced[::-1])
    out, i = [], first
    while i <= last:
        if voiced[i]:
            j = i
            while j <= last and voiced[j]:
                j += 1
            out.append(x[i * hop: j * hop]); i = j
        else:
            j = i
            while j <= last and not voiced[j]:
                j += 1
            gap = (j - i) * hop
            keep_n = min(gap, int(max_pause * SR))
            # keep the edges of the pause so breaths/consonants are not clipped
            out.append(x[i * hop: i * hop + keep_n // 2]); out.append(x[j * hop - (keep_n - keep_n // 2): j * hop])
            i = j
    y = np.concatenate(out)
    k = int(keep * SR)
    pre = x[max(0, first * hop - k): first * hop]
    post = x[(last + 1) * hop: (last + 1) * hop + k]
    y = np.concatenate([pre, y, post])
    f = min(len(y), int(0.008 * SR))
    if f > 1:
        y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    return y


def chunk_scenes(scenes, limit):
    chunks, cur, size = [], [], 0
    for s in scenes:
        L = len(s["text"]) + 2
        if cur and size + L > limit:
            chunks.append(cur); cur, size = [], 0
        cur.append(s); size += L
    if cur:
        chunks.append(cur)
    return chunks


def make_voice(ep_dir, voice_id, model_id="eleven_v3", only_ids=None):
    sp = os.path.join(ep_dir, "scenes.json")
    data = json.load(open(sp))
    scenes = data["scenes"]
    todo = [s for s in scenes if (only_ids is None or s["id"] in only_ids)]
    out_dir = os.path.join(ep_dir, "voice"); os.makedirs(out_dir, exist_ok=True)
    limit = {"eleven_v3": 4500, "eleven_multilingual_v2": 9000}.get(model_id, 9000)
    chunks = chunk_scenes(todo, limit)
    total_chars = 0
    for ci, ch in enumerate(chunks):
        text, spans = "", []
        for s in ch:
            if text:
                text += "\n\n"
            a = len(text); text += s["text"].strip(); spans.append((s, a, len(text)))
        total_chars += len(text)
        prev_t = chunks[ci - 1][-1]["text"] if ci > 0 else None
        next_t = chunks[ci + 1][0]["text"] if ci + 1 < len(chunks) else None
        print(f"  voice chunk {ci + 1}/{len(chunks)}: {len(ch)} scenes, {len(text)} characters")
        mp3, al = tts_with_timestamps(text, voice_id, model_id, prev_t, next_t)
        open(os.path.join(out_dir, f"chunk_{ci + 1:02d}.mp3"), "wb").write(mp3)
        x = mp3_to_array(mp3)
        st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
        nchar = len(st)
        for k, (s, a, b) in enumerate(spans):
            a2, b2 = min(a, nchar - 1), min(b - 1, nchar - 1)
            t0 = st[a2]
            t1 = en[b2]
            # cut halfway into the silence around the scene so no word is clipped
            if k > 0:
                pb = min(spans[k - 1][2] - 1, nchar - 1); t0 = (en[pb] + t0) / 2
            else:
                t0 = max(0, t0 - 0.1)
            if k + 1 < len(spans):
                na = min(spans[k + 1][1], nchar - 1); t1 = (t1 + st[na]) / 2
            else:
                t1 = t1 + 0.3
            clip = tidy(x[int(t0 * SR): int(t1 * SR)])
            name = f"scene_{s['id']:03d}.wav"
            sf.write(os.path.join(out_dir, name), clip, SR, subtype="PCM_16")
            s["audio"] = f"voice/{name}"
            s["duration"] = round(len(clip) / SR, 3)
            print(f"    scene {s['id']:>3}: {s['duration']:5.2f}s  {s['text'][:60]}")
    data.setdefault("voice", {})
    data["voice"].update({"voice_id": voice_id, "model_id": model_id})
    json.dump(data, open(sp, "w"), indent=2, ensure_ascii=False)
    print(f"Done. {total_chars} characters sent to ElevenLabs.")


def samples(text, voices, model_id, out_dir):
    """Make one short sample per voice so the user can pick. voices: list of (voice_id, label)."""
    os.makedirs(out_dir, exist_ok=True)
    for i, (vid, label) in enumerate(voices, 1):
        mp3, _ = tts_with_timestamps(text, vid, model_id)
        x = mp3_to_array(mp3)
        path = os.path.join(out_dir, f"sample_{i}_{label}.wav")
        sf.write(path, tidy(x), SR, subtype="PCM_16")
        print(f"  {path}  ({len(x) / SR:.1f}s)")
