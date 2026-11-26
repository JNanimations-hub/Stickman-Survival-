"""Sound made in code: a calm music bed and a library of sound effects.

Everything is synthesised with numpy (noise + filters + tones), so it is free and can never get a
copyright claim. If you drop your own file in sfx/<name>.wav (or .mp3) it is used instead of the
synthesised one with the same name. A file in music/ (or music/epN.*) replaces the synth music bed.
"""
import numpy as np
from scipy import signal

SR = 48000
RNG_SEED = 1234


def _rng(name):
    return np.random.default_rng(sum(map(ord, name)) * 7919 + RNG_SEED)  # same sound every run


def _n(d):
    return max(1, int(d * SR))


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, hi, order=2):
    sos = signal.butter(order, hi, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def hp(x, lo, order=2):
    sos = signal.butter(order, lo, btype="high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def white(d, name):
    return _rng(name).standard_normal(_n(d))


def pink(d, name):
    w = white(d, name)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w) * 4


def brown(d, name):
    x = np.cumsum(white(d, name))
    x = hp(x, 15)
    return x / (np.max(np.abs(x)) + 1e-9)


def env_ad(n, a, d):
    """attack/decay envelope in seconds over n samples"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))
    return e


def fade(x, fi=0.05, fo=0.1):
    n = len(x)
    a, b = min(n, _n(fi)), min(n, _n(fo))
    x = x.copy()
    if a > 1:
        x[:a] *= np.linspace(0, 1, a)
    if b > 1:
        x[-b:] *= np.linspace(1, 0, b)
    return x


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)


def tone(freqs, d, wave="sine"):
    """freqs: array of instantaneous frequency (Hz) or scalar"""
    n = _n(d)
    f = np.full(n, freqs) if np.isscalar(freqs) else np.interp(np.arange(n), np.linspace(0, n - 1, len(freqs)), freqs)
    ph = 2 * np.pi * np.cumsum(f) / SR
    if wave == "saw":
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if wave == "square":
        return np.sign(np.sin(ph))
    return np.sin(ph)


# ---------------------------------------------------------------- ambient beds (length = scene)
def wind(d):
    x = bp(pink(d, "wind"), 180, 1400)
    t = np.arange(len(x)) / SR
    gust = 0.55 + 0.3 * np.sin(2 * np.pi * 0.09 * t) + 0.15 * np.sin(2 * np.pi * 0.23 * t + 1)
    return norm(x * gust)


def ash_hiss(d):
    # fine ash ticking on a roof: soft high noise plus tiny ticks
    x = bp(white(d, "ash"), 2500, 9000) * 0.35
    r = _rng("ashticks")
    n = len(x)
    for _ in range(int(d * 60)):
        i = r.integers(0, max(1, n - 400))
        x[i:i + 200] += r.uniform(0.2, 0.8) * np.exp(-np.arange(200) / 30) * r.standard_normal(200)
    return norm(hp(x, 1500))


def rumble(d):
    x = lp(brown(d, "rumble"), 110, 4) * 1.0
    t = np.arange(len(x)) / SR
    x += 0.5 * np.sin(2 * np.pi * 34 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t))
    return norm(x * np.minimum(1, t / 1.0))


def rain(d):
    x = hp(white(d, "rain"), 900) * 0.4
    r = _rng("drops")
    n = len(x)
    for _ in range(int(d * 120)):
        i = r.integers(0, max(1, n - 300))
        x[i:i + 300] += r.uniform(0.1, 0.5) * np.sin(2 * np.pi * r.uniform(2000, 5000) * np.arange(300) / SR) * np.exp(-np.arange(300) / 40)
    return norm(x)


def lahar_roar(d):
    x = lp(brown(d, "lahar"), 500, 2) + 0.4 * lp(white(d, "lahar2"), 900)
    t = np.arange(len(x)) / SR
    return norm(x * np.minimum(1, (t / max(0.5, d * 0.6)) ** 1.5 + 0.15))


def fire(d):
    x = lp(brown(d, "fire"), 300) * 0.6
    r = _rng("crackle")
    n = len(x)
    for _ in range(int(d * 25)):
        i = r.integers(0, max(1, n - 500))
        x[i:i + 500] += r.uniform(0.3, 1) * hp(r.standard_normal(500), 1500) * np.exp(-np.arange(500) / 60)
    return norm(x)


def crowd(d):
    # zombie crowd murmur: many low groans
    x = np.zeros(_n(d))
    r = _rng("crowd")
    for k in range(14):
        f0 = r.uniform(70, 140)
        g = tone(f0 * (1 + 0.05 * np.sin(np.linspace(0, r.uniform(3, 9), 200))), d, "saw")
        g = bp(g, 120, 900) * (0.5 + 0.5 * np.sin(2 * np.pi * r.uniform(0.1, 0.4) * np.arange(len(g)) / SR + k))
        x += g
    return norm(x)


def heartbeat(d):
    x = np.zeros(_n(d))
    beat = lp(white(0.12, "hb"), 90) * env_ad(_n(0.12), 0.005, 0.04)
    p = 0.0
    while p < d - 0.5:
        for off, g in ((0, 1.0), (0.22, 0.7)):
            i = _n(p + off)
            x[i:i + len(beat)] += g * beat[: max(0, len(x) - i)]
        p += 0.9
    return norm(x)


AMBIENT = {"wind": wind, "ash_hiss": ash_hiss, "rumble": rumble, "rain": rain, "lahar_roar": lahar_roar,
           "fire": fire, "crowd": crowd, "heartbeat": heartbeat}


# ---------------------------------------------------------------- one-shots
def footsteps(d=2.0):
    x = np.zeros(_n(d))
    r = _rng("steps")
    p = 0.05
    while p < d - 0.2:
        thump = lp(r.standard_normal(_n(0.09)), 380) * env_ad(_n(0.09), 0.003, 0.03)
        crunch = bp(r.standard_normal(_n(0.07)), 2500, 6000) * env_ad(_n(0.07), 0.002, 0.02) * 0.5
        i = _n(p)
        x[i:i + len(thump)] += thump[: len(x) - i]
        x[i:i + len(crunch)] += crunch[: len(x) - i]
        p += 0.46 + r.uniform(-0.03, 0.03)
    return norm(x)


def run_steps(d=2.0):
    x = np.zeros(_n(d))
    r = _rng("run")
    p = 0.02
    while p < d - 0.1:
        thump = lp(r.standard_normal(_n(0.07)), 450) * env_ad(_n(0.07), 0.002, 0.02)
        i = _n(p)
        x[i:i + len(thump)] += thump[: len(x) - i]
        p += 0.27
    return norm(x)


def creak(d=1.6):
    t = np.arange(_n(d)) / SR
    f = 140 + 40 * np.sin(2 * np.pi * 0.7 * t) + 12 * _rng("creak").standard_normal(len(t)).cumsum() / np.sqrt(len(t))
    x = tone(f, d, "saw")
    x = bp(x, 200, 1600) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.sin(np.pi * t / d)
    return norm(x)


def door(d=1.2):
    x = np.zeros(_n(d))
    c = creak(0.7) * 0.6
    x[: len(c)] += c
    th = lp(white(0.2, "door"), 200) * env_ad(_n(0.2), 0.002, 0.06)
    i = _n(0.75)
    x[i:i + len(th)] += th[: len(x) - i]
    return norm(x)


def door_slam(d=0.6):
    return norm(lp(white(d, "slam"), 260) * env_ad(_n(d), 0.002, 0.08))


def phone_alert(d=2.4):
    # several phones buzzing at once + a two-tone alert
    t = np.arange(_n(d)) / SR
    buzz = np.sign(np.sin(2 * np.pi * 165 * t)) * ((t % 0.5) < 0.32)
    buzz = lp(buzz, 900) * 0.5
    beep = np.zeros_like(t)
    for k, f0 in enumerate([880, 660, 880, 660]):
        m = (t >= k * 0.3) & (t < k * 0.3 + 0.24)
        beep[m] += np.sin(2 * np.pi * f0 * t[m])
    return norm(buzz + 0.5 * beep)


def car_away(d=4.0):
    t = np.arange(_n(d)) / SR
    f = 52 * (1 - 0.12 * t / d)
    eng = tone(f, d, "saw") + 0.5 * tone(f * 2, d, "saw")
    eng = lp(eng, 700) * np.exp(-t / (d * 0.45))
    slam = np.zeros_like(t)
    s = door_slam(0.4)
    slam[: len(s)] += s
    tyres = bp(white(d, "tyre"), 1500, 4000) * np.exp(-((t - 0.6) ** 2) / 0.05) * 0.6
    return norm(eng + 0.8 * slam + tyres)


def dog_bark(d=0.8):
    x = np.zeros(_n(d))
    for k in range(2):
        n = _n(0.16)
        tt = np.arange(n) / SR
        b = np.sin(2 * np.pi * np.cumsum(np.linspace(620, 380, n)) / SR) + 0.3 * bp(_rng(f"bark{k}").standard_normal(n), 400, 2500)
        b *= env_ad(n, 0.006, 0.05)
        i = _n(0.05 + k * 0.3)
        x[i:i + n] += b[: len(x) - i]
    return norm(x)


def dog_whine(d=1.4):
    t = np.arange(_n(d)) / SR
    f = np.interp(t, [0, d * 0.4, d], [720, 920, 640]) * (1 + 0.02 * np.sin(2 * np.pi * 6 * t))
    return norm(tone(f, d) * np.sin(np.pi * t / d) ** 0.7)


def squeak(d=0.35):
    t = np.arange(_n(d)) / SR
    x = bp(white(d, "sq"), 2000, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 40 * t)) + 0.3 * tone(np.linspace(2600, 3400, 50), d)
    return norm(x * np.sin(np.pi * t / d))


def pour(d=2.2):
    t = np.arange(_n(d)) / SR
    x = bp(white(d, "pour"), 400, 2600) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t + np.sin(2 * np.pi * 1.3 * t)))
    return norm(fade(x, 0.2, 0.4))


def rattle(d=1.5):
    x = np.zeros(_n(d))
    r = _rng("rattle")
    n = len(x)
    for _ in range(int(d * 30)):
        i = r.integers(0, max(1, n - 3000))
        f0 = r.uniform(1800, 4200)
        k = np.arange(3000)
        x[i:i + 3000] += r.uniform(0.3, 1) * np.sin(2 * np.pi * f0 * k / SR) * np.exp(-k / 400)
    return norm(x + 0.5 * rumble(d))


def wipe(d=1.2):
    t = np.arange(_n(d)) / SR
    return norm(bp(white(d, "wipe"), 800, 3500) * (0.3 + 0.7 * np.abs(np.sin(2 * np.pi * 2.2 * t))))


def thunder(d=3.5):
    t = np.arange(_n(d)) / SR
    crack = hp(white(d, "crack"), 800) * np.exp(-t / 0.08)
    boom = lp(brown(d, "boom"), 160) * np.exp(-t / 1.2) * np.minimum(1, t / 0.05)
    return norm(0.5 * crack + boom)


def whoosh(d=0.7):
    t = np.arange(_n(d)) / SR
    x = white(d, "whoosh")
    out = np.zeros_like(x)
    for k, (lo, hi) in enumerate([(200, 800), (600, 2000), (1500, 5000)]):
        out += bp(x, lo, hi) * np.exp(-((t - d * (0.3 + 0.2 * k)) ** 2) / 0.02)
    return norm(out)


def boom(d=2.5):
    t = np.arange(_n(d)) / SR
    return norm(lp(brown(d, "bigboom"), 120) * np.exp(-t / 0.8) * np.minimum(1, t / 0.02) + 0.6 * np.sin(2 * np.pi * 40 * t) * np.exp(-t / 0.6))


def click(d=0.2):
    return norm(hp(white(d, "click"), 2000) * env_ad(_n(d), 0.001, 0.008))


def power_down(d=1.5):
    t = np.arange(_n(d)) / SR
    hum = tone(np.linspace(120, 40, 100), d, "saw") * np.exp(-t / 0.6)
    th = np.zeros_like(t)
    c = click(0.2)
    th[: len(c)] += c
    return norm(lp(hum, 600) + th)


def splash(d=0.8):
    t = np.arange(_n(d)) / SR
    return norm(bp(white(d, "splash"), 500, 6000) * np.exp(-t / 0.15))


def lid(d=0.6):
    t = np.arange(_n(d)) / SR
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / dd) for f, dd in [(620, 0.15), (1240, 0.08), (1900, 0.05)])
    return norm(x + 0.5 * lp(white(d, "lid"), 300) * np.exp(-t / 0.03))


def sniff(d=0.8):
    x = np.zeros(_n(d))
    for k in range(3):
        n = _n(0.08)
        b = bp(_rng(f"sniff{k}").standard_normal(n), 2000, 6000) * np.sin(np.pi * np.arange(n) / n)
        i = _n(0.1 + k * 0.18)
        x[i:i + n] += b
    return norm(x)


ONESHOT = {
    "footsteps": footsteps, "run_steps": run_steps, "creak": creak, "door": door, "door_slam": door_slam,
    "phone_alert": phone_alert, "car_away": car_away, "dog_bark": dog_bark, "dog_whine": dog_whine,
    "squeak": squeak, "pour": pour, "rattle": rattle, "wipe": wipe, "thunder": thunder, "whoosh": whoosh,
    "boom": boom, "click": click, "power_down": power_down, "splash": splash, "lid": lid, "sniff": sniff,
}
ALL_SFX = sorted(list(AMBIENT) + list(ONESHOT))


# ---------------------------------------------------------------- music bed
def music_bed(d):
    """Slow, calm-but-tense minor pad (Am – F – Dm – E) with a low drone and sparse soft plucks."""
    n = _n(d)
    t = np.arange(n) / SR
    out = np.zeros(n)
    chords = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]]  # midi
    seg = 8.0
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for k in range(int(np.ceil(d / seg)) + 1):
        c = chords[k % 4]
        a, b = _n(k * seg), min(n, _n((k + 1) * seg + 2))
        if a >= n:
            break
        L = b - a
        tt = np.arange(L) / SR
        e = np.minimum(1, tt / 2.0) * np.minimum(1, np.maximum(0, (L / SR - tt)) / 2.0)
        chunk = np.zeros(L)
        for m in c:
            for det in (-0.08, 0.08):
                chunk += np.sin(2 * np.pi * hz(m) * (1 + det / 100) * tt) + 0.25 * np.sin(2 * np.pi * 2 * hz(m) * tt)
        out[a:b] += chunk * e * 0.12
        # soft plucks
        r = _rng(f"pluck{k}")
        for j in range(3):
            st = k * seg + r.uniform(0.5, seg - 1)
            m = c[r.integers(0, 3)] + 12
            i = _n(st)
            if i >= n:
                continue
            pl = np.sin(2 * np.pi * hz(m) * np.arange(_n(2.5)) / SR) * np.exp(-np.arange(_n(2.5)) / SR / 0.6)
            out[i:i + len(pl)] += 0.08 * pl[: n - i]
    out += 0.15 * np.sin(2 * np.pi * hz(33) * t) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.05 * t))
    out = lp(out, 2200)
    return norm(fade(out, 2.0, 3.0))
