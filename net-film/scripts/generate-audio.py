"""
NET Business Solutions — procedural score & sound design (royalty-free: everything is synthesised here).
Writes 48 kHz / 24-bit stereo WAV stems to public/assets/music and public/assets/sound-effects.

Tempo grid: 120 BPM -> 1 beat = 0.5 s = 15 frames @ 30 fps, so every hit lands exactly on a frame.
Requires: python3, numpy, scipy      Run: python3 scripts/generate-audio.py
"""
import os, wave
import numpy as np
from scipy.signal import butter, lfilter, sosfilt, fftconvolve

SR = 48000
BPM = 120
BEAT = 60 / BPM
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets")
rng = np.random.default_rng(7)

# ------------------------------------------------------------------ utils
def T(sec): return np.arange(int(sec * SR)) / SR
def st(x, pan=0.0):
    x = np.asarray(x, float)
    return np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)], 1) if x.ndim == 1 else x
def lp(x, fc, order=2):
    sos = butter(order, min(fc, SR * 0.45), 'low', fs=SR, output='sos'); return sosfilt(sos, x, axis=0)
def hp(x, fc, order=2):
    sos = butter(order, fc, 'high', fs=SR, output='sos'); return sosfilt(sos, x, axis=0)
def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, min(hi, SR * 0.45)], 'band', fs=SR, output='sos'); return sosfilt(sos, x, axis=0)
def sweep_lp(x, fc_curve):
    """time-varying one-pole LP, vectorised in blocks"""
    y = np.zeros_like(x); blk = 256; z = None
    for i in range(0, len(x), blk):
        fc = float(np.mean(fc_curve[i:i + blk]))
        b, a = butter(1, min(max(fc, 20), SR * 0.45), 'low', fs=SR)
        seg, z = lfilter(b, a, x[i:i + blk], zi=(z if z is not None else np.zeros(1) * x[0]))
        y[i:i + blk] = seg
    return y

_IR = {}
def reverb(x, sec=2.6, mix=0.3, damp=5000):
    key = (sec, damp)
    if key not in _IR:
        n = int(sec * SR); env = np.exp(-np.arange(n) / SR * (6.9 / sec))
        ir = np.stack([lp(rng.standard_normal(n), damp, 1) * env, lp(rng.standard_normal(n), damp, 1) * env], 1)
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
        _IR[key] = ir / np.sqrt(np.sum(ir ** 2, 0))
    ir = _IR[key]; x = st(x)
    wet = np.stack([fftconvolve(x[:, c], ir[:, c]) for c in range(2)], 1)
    out = np.zeros_like(wet); out[: len(x)] += x * (1 - mix); out += wet * mix * 0.9
    return out

def write(name, x, peak=0.89):
    x = st(x); m = np.max(np.abs(x)) or 1; x = x / m * peak
    pcm = (np.clip(x, -1, 1) * (2 ** 23 - 1)).astype('<i4')
    b = pcm.tobytes(); raw = bytearray()
    for i in range(0, len(b), 4): raw += b[i:i + 3]
    path = os.path.join(ROOT, name); os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(bytes(raw))
    print(f"  {name:38s} {len(x) / SR:6.2f}s")

def note(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, t, ph=0.0): return 2 * ((f * t + ph) % 1) - 1

# ------------------------------------------------------------------ SFX
def sfx_impact(sec=4.5, f0=64, f1=30, size=1.0):
    t = T(sec); f = f1 + (f0 - f1) * np.exp(-t * 9)
    body = np.tanh(2.2 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.2 / size))
    click = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 70)
    boom = lp(rng.standard_normal(len(t)), 220) * np.exp(-t * 3) * 1.4
    return reverb(body * 0.9 + click * 0.7 + boom, 3.2, 0.3, 2400)

def sfx_metal(sec=3.6):
    t = T(sec); out = np.zeros(len(t))
    for i, p in enumerate([523.0, 1312.7, 2081.4, 2794.0, 3611.2, 4790.5, 6012.0]):
        out += np.sin(2 * np.pi * p * t * (1 + 0.002 * np.sin(2 * np.pi * 3 * t))) * np.exp(-t * (1.3 + i * 0.55)) / (1 + i * 0.6)
    out += hp(rng.standard_normal(len(t)), 6000) * np.exp(-t * 2.2) * 0.15
    return reverb(out * np.minimum(1, t / 0.012), 3.5, 0.45, 9000)

def sfx_whoosh(sec=1.1, peak=0.6, lo=300, hi=5200, p0=-0.9, p1=0.9):
    t = T(sec); u = t / sec; shape = np.exp(-((u - peak) / 0.22) ** 2)
    n = rng.standard_normal(len(t)); x = sweep_lp(n, lo + (hi - lo) * shape) - lp(n, lo * 0.6, 1) * 0.5
    x *= shape; pan = p0 + (p1 - p0) * u
    return reverb(np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)], 1), 1.6, 0.25, 6000)

def sfx_pulse(sec=1.4, f0=1760, sub=True):
    t = T(sec)
    tone = np.sin(2 * np.pi * (f0 * np.exp(-t * 3) + 220) * t) * np.exp(-t * 7)
    blip = np.sign(np.sin(2 * np.pi * 880 * t)) * np.exp(-t * 40) * 0.25
    s = np.sin(2 * np.pi * 48 * t) * np.exp(-t * 3.5) * (0.9 if sub else 0)
    return reverb(lp(tone + blip, 7000, 1) * 0.6 + s, 2.2, 0.4, 5000)

def sfx_tick(sec=0.8, f=2637):
    t = T(sec)
    x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 22)
    x += hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 60) * 0.3
    return reverb(x, 1.6, 0.35, 8000)

def sfx_riser(sec=2.0):
    t = T(sec); u = t / sec; n = rng.standard_normal(len(t))
    x = sweep_lp(n, 300 + 7000 * u ** 2) * u ** 2.2 + np.sin(2 * np.pi * (80 + 260 * u ** 2) * t) * u ** 2 * 0.35
    x *= np.minimum(1, (sec - t) / 0.03)
    return reverb(x, 1.8, 0.3)

def sfx_hit(sec=2.5):
    """title hit: tight bass thump + short tonal 'bloom'"""
    t = T(sec); f = 42 + 60 * np.exp(-t * 18)
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    tone = sum(np.sin(2 * np.pi * note(m) * t) for m in (50, 57, 62)) * np.exp(-t * 2.5) * 0.12
    return reverb(np.tanh(thump * 1.8) + lp(tone, 2500), 2.4, 0.3, 4000)

def sfx_stamp(sec=1.2):
    t = T(sec); x = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 35) * 1.4 + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 14)
    return reverb(x, 1.0, 0.2, 3000)

def sfx_swipe(sec=0.9):
    t = T(sec); u = t / sec
    g = np.sign(np.sin(2 * np.pi * (300 + 2600 * u) * t)) * np.exp(-((u - 0.45) / 0.25) ** 2) * 0.25
    n = bp(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-((u - 0.45) / 0.2) ** 2)
    gate = (np.floor(t * 48) % 2) * 0.6 + 0.4
    x = (g + n) * gate; pan = 0.9 - 1.8 * u
    return reverb(np.stack([x * np.sqrt((1 - pan) / 2), x * np.sqrt((1 + pan) / 2)], 1), 1.2, 0.25, 7000)

# ------------------------------------------------------------------ SCORE (45 s)
TOTAL = 45.0
# (start, end, chord midi notes, bass root) — chords change on scene boundaries
CHORDS = [
    (0.3, 2.0, [50, 57, 62, 64], 38),
    (2.0, 5.0, [46, 53, 57, 62, 69], 34),
    (5.0, 9.0, [46, 53, 58, 62, 65], 34),   # Bb
    (9.0, 13.0, [45, 53, 57, 60, 65], 41),  # F/A
    (13.0, 16.5, [43, 50, 55, 58, 62], 43), # Gm
    (16.5, 20.0, [50, 57, 60, 62, 65], 38), # Dm
    (20.0, 23.5, [46, 53, 58, 62, 69], 34), # Bb(add9)
    (23.5, 27.0, [48, 55, 60, 64, 67], 36), # C
    (27.0, 30.0, [50, 57, 62, 65, 69], 38), # Dm
    (30.0, 33.0, [46, 53, 58, 62, 65], 34), # Bb
    (33.0, 36.0, [43, 50, 55, 58, 62], 43), # Gm
    (36.0, 39.0, [45, 52, 57, 61, 64], 33), # A (tension)
    (39.0, 45.0, [50, 57, 62, 65, 69, 74], 38), # Dm — resolve
]
FINAL_HIT = 39.0 + 138 / 30  # 43.6 s, matches CUES.closing.finalHit
GROOVE = (5.0, FINAL_HIT)
BREATHS = [(26.4, 27.0), (38.4, 39.0)]  # drums drop before the big transitions

def score():
    n = int((TOTAL + 4) * SR); out = np.zeros((n, 2))
    def put(x, at, g=1.0):
        x = st(x); i = int(at * SR); j = min(n, i + len(x)); out[i:j] += x[: j - i] * g
    in_breath = lambda tt: any(a <= tt < b for a, b in BREATHS)

    # pads (detuned saws, slow attack, filtered) per chord
    for (a, b, notes, root) in CHORDS:
        dur = b - a + 1.2; t = T(dur); pad = np.zeros((len(t), 2))
        for m in notes:
            for d, pan in ((-0.08, -0.6), (0.0, 0.0), (0.09, 0.6)):
                s = saw(note(m) * (1 + d * 0.01), t, rng.uniform())
                pad += st(s, pan)
        env = np.minimum(1, t / 0.9) * np.minimum(1, np.maximum(0, (dur - t) / 1.2))
        bright = 900 if a < 5 else (1500 + 900 * (a - 5) / 34)
        pad = lp(pad, bright, 2) * env[:, None] / len(notes)
        put(reverb(pad, 3.0, 0.45), a, 0.55)
        # sub bass
        sub = np.sin(2 * np.pi * note(root) * t) + 0.3 * np.sin(2 * np.pi * note(root + 12) * t)
        put(lp(sub * env, 220), a, 0.32 if a >= 5 else 0.18)

    # 16th arpeggio from 3.0 s to final hit, notes follow the active chord
    tt = 3.0; k = 0
    while tt < FINAL_HIT - 0.01:
        ch = next(c for c in CHORDS if c[0] <= tt < c[1])[2]
        pattern = [ch[1], ch[3], ch[-1] + 12, ch[3], ch[2], ch[3], ch[-1] + 12 if k % 16 < 8 else ch[-2] + 12, ch[3]]
        m = pattern[k % 8]; d = T(0.12); s = saw(note(m), d)
        cut = 900 + 2600 * min(1, (tt - 3) / 30)
        s = lp(s, cut, 2) * np.exp(-d * 26)
        g = 0.2 * min(1, (tt - 2.9) / 0.8) * (0.35 if in_breath(tt) else 1)
        put(reverb(st(s, 0.35 if k % 2 else -0.35), 1.2, 0.2), tt, g)
        tt += BEAT / 4; k += 1

    # drums
    for b in np.arange(3.0, FINAL_HIT, BEAT):
        if in_breath(b): continue
        kt = T(0.4); kick = np.sin(2 * np.pi * np.cumsum(45 + 95 * np.exp(-kt * 32)) / SR) * np.exp(-kt * 8)
        put(kick, b, 0.42 if b >= GROOVE[0] else 0.28)
        if b >= GROOVE[0]:
            ht = T(0.08); hat = hp(rng.standard_normal(len(ht)), 7000) * np.exp(-ht * 70)
            put(st(hat, 0.3), b + BEAT / 2, 0.10)
        if b >= 33.0 and int(round(b / BEAT)) % 2 == 1:   # industrial: low toms on 2 & 4
            tt2 = T(0.6); tom = np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-tt2 * 12)) / SR) * np.exp(-tt2 * 6)
            put(reverb(tom, 1.4, 0.3, 2500), b, 0.3)
    # clap / snap on 2 & 4 during groove
    for b in np.arange(GROOVE[0] + BEAT, FINAL_HIT, BEAT * 2):
        if in_breath(b): continue
        ct = T(0.25); clap = bp(rng.standard_normal(len(ct)), 900, 5000) * np.exp(-ct * 30)
        put(reverb(clap, 1.2, 0.35, 6000), b, 0.1)

    # closing swell + ring-out after the final hit
    t = T(TOTAL - FINAL_HIT + 3); ring = np.zeros((len(t), 2))
    for m in (38, 50, 57, 62, 65, 69):
        ring += st(lp(saw(note(m), t, rng.uniform()), 1800), rng.uniform(-0.6, 0.6))
    ring *= (np.exp(-t * 0.9))[:, None] / 6
    put(reverb(ring, 3.5, 0.5), FINAL_HIT, 0.7)

    out = out[: int(TOTAL * SR)]
    fade = np.minimum(1, (TOTAL - T(TOTAL)) / 0.6)[:, None]
    return out * fade

if __name__ == "__main__":
    print("SFX:")
    write("sound-effects/deep-impact.wav", sfx_impact())
    write("sound-effects/impact-soft.wav", sfx_impact(3.0, 80, 40, 0.6))
    write("sound-effects/metallic-reveal.wav", sfx_metal())
    write("sound-effects/whoosh-a.wav", sfx_whoosh(1.1, 0.6))
    write("sound-effects/whoosh-b.wav", sfx_whoosh(0.9, 0.5, 400, 7000, 0.9, -0.9))
    write("sound-effects/whoosh-fast.wav", sfx_whoosh(0.6, 0.55, 500, 9000, 0.8, -0.8))
    write("sound-effects/digital-pulse.wav", sfx_pulse())
    write("sound-effects/confirm-blip.wav", sfx_pulse(0.9, 2400, sub=False))
    write("sound-effects/ui-tick.wav", sfx_tick())
    write("sound-effects/riser.wav", sfx_riser(1.4))
    write("sound-effects/riser-short.wav", sfx_riser(0.6))
    write("sound-effects/title-hit.wav", sfx_hit())
    write("sound-effects/stamp.wav", sfx_stamp())
    write("sound-effects/digital-swipe.wav", sfx_swipe())
    print("Music:")
    write("music/score-45s.wav", score(), peak=0.8)
