"""
NET Business Solutions — procedural sound design (royalty-free, generated from code).
Outputs 48 kHz / 24-bit stereo WAV stems into public/assets/.
Tempo grid: 120 BPM  ->  1 beat = 0.5 s = 15 frames @ 30fps (all hits land on the frame grid).
Run:  python3 scripts/generate-audio.py
"""
import numpy as np, wave, os, sys

SR = 48000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets")
rng = np.random.default_rng(7)

def t_(sec): return np.arange(int(sec * SR)) / SR

def write(path, x):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1: x = np.stack([x, x], 1)
    peak = np.max(np.abs(x)) or 1
    x = x / peak * 0.89  # -1 dBFS ceiling
    data = (x * (2**23 - 1)).astype(np.int32)
    b = bytearray()
    raw = data.astype('<i4').tobytes()
    for i in range(0, len(raw), 4): b += raw[i:i+3]
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(bytes(b))
    print("wrote", os.path.relpath(path, ROOT), f"{len(x)/SR:.2f}s")

def onepole_lp(x, fc):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = np.exp(-2*np.pi*fc/SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s = (1-a[i])*x[i] + a[i]*s; y[i] = s
    return y

def lp(x, fc, n=2):
    for _ in range(n): x = onepole_lp(x, fc)
    return x

def hp(x, fc): return x - lp(x, fc, 1)

def reverb(x, sec=2.5, mix=0.35, damp=4000):
    n = int(sec*SR)
    ir = rng.standard_normal((n, 2)) * np.exp(-np.arange(n)/SR*(6.9/sec))[:, None]
    ir[:, 0] = lp(ir[:, 0], damp, 1); ir[:, 1] = lp(ir[:, 1], damp, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    L = len(x) + n; N = 1 << int(np.ceil(np.log2(L)))
    wet = np.stack([np.fft.irfft(np.fft.rfft(x[:, c], N)*np.fft.rfft(ir[:, c], N), N)[:L] for c in range(2)], 1)
    wet /= (np.max(np.abs(wet)) or 1); wet *= np.max(np.abs(x))
    out = np.zeros((L, 2)); out[:len(x)] += x*(1-mix); out += wet*mix
    return out

def env_adsr(n, a, d, s_lvl, r):
    e = np.ones(n)*s_lvl; A, D, R = int(a*SR), int(d*SR), int(r*SR)
    e[:A] = np.linspace(0, 1, A); e[A:A+D] = np.linspace(1, s_lvl, len(e[A:A+D]))
    if R: e[-R:] *= np.linspace(1, 0, R)
    return e

# ---------------------------------------------------------------- SFX
def sub_impact(sec=4.0, f0=62, f1=31):
    t = t_(sec); f = f1 + (f0-f1)*np.exp(-t*9)
    body = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*1.25)
    click = lp(rng.standard_normal(len(t)), 2500) * np.exp(-t*70) * 0.9
    thump = np.tanh(body*2.2)*0.9
    return reverb(thump + click, 3.0, 0.28, 2500)

def metallic_reveal(sec=3.2):
    t = t_(sec); out = np.zeros(len(t))
    partials = [523.0, 1312.7, 2081.4, 2794.0, 3611.2, 4790.5, 6012.0]
    for i, p in enumerate(partials):
        out += np.sin(2*np.pi*p*t*(1+0.002*np.sin(2*np.pi*3*t))) * np.exp(-t*(1.3+i*0.55)) / (1+i*0.6)
    shimmer = hp(rng.standard_normal(len(t)), 6000) * np.exp(-t*2.2) * 0.15
    atk = np.minimum(1, t/0.012)
    return reverb((out+shimmer)*atk, 3.5, 0.45, 9000)

def whoosh(sec=1.1, peak=0.55, f_lo=300, f_hi=5200, pan_from=-1, pan_to=1):
    t = t_(sec); u = t/sec
    shape = np.exp(-((u-peak)/0.22)**2)
    fc = f_lo + (f_hi-f_lo)*shape
    n = rng.standard_normal(len(t))
    band = lp(n, fc, 2) - lp(n, fc*0.25, 1)
    x = band*shape
    pan = pan_from + (pan_to-pan_from)*u
    st = np.stack([x*np.sqrt((1-pan)/2), x*np.sqrt((1+pan)/2)], 1)
    return reverb(st, 1.6, 0.25, 6000)

def digital_pulse(sec=1.4):
    t = t_(sec)
    tone = np.sin(2*np.pi*(1760*np.exp(-t*3)+220)*t) * np.exp(-t*7)
    blip = np.sign(np.sin(2*np.pi*880*t)) * np.exp(-t*40) * 0.25
    sub = np.sin(2*np.pi*48*t) * np.exp(-t*3.5) * 0.9
    return reverb(lp(tone+blip, 7000, 1)*0.6 + sub, 2.2, 0.4, 5000)

def riser(sec=2.0):
    t = t_(sec); u = t/sec
    n = rng.standard_normal(len(t))
    x = (lp(n, 400+6000*u**2, 2)) * u**2.2
    x += np.sin(2*np.pi*(80+220*u**2)*t)*u**2*0.3
    x *= np.minimum(1, (sec-t)/0.03)
    return reverb(x, 1.8, 0.3)

# ---------------------------------------------------------------- MUSIC (opening section, 0–6 s)
def note(f): return 440*2**((f-69)/12)

def pad_chord(midis, sec, a=1.2, r=1.5, bright=1800):
    t = t_(sec); out = np.zeros((len(t), 2))
    for m in midis:
        for d, pan in [(-0.11, -0.7), (0.0, 0.0), (0.12, 0.7)]:
            f = note(m+d*0.1) * (1+d*0.003)
            ph = rng.uniform(0, 1)
            saw = 2*((f*t+ph) % 1)-1
            s = lp(saw, bright, 2) * env_adsr(len(t), a, 0.5, 0.85, r)
            out[:, 0] += s*np.sqrt((1-pan)/2); out[:, 1] += s*np.sqrt((1+pan)/2)
    return out/len(midis)

def build_opening_music(total=6.0):
    out = np.zeros((int(total*SR)+SR*4, 2))
    def put(x, at, g=1.0):
        if x.ndim == 1: x = np.stack([x, x], 1)
        i = int(at*SR); out[i:i+len(x)] += x[:len(out)-i]*g
    # low drone bed from the first pulse
    t = t_(total); drone = np.sin(2*np.pi*note(26)*t)*0.5 + np.sin(2*np.pi*note(38)*t)*0.25
    drone *= np.minimum(1, np.maximum(0, (t-0.27)/1.5))
    put(lp(drone, 300, 1), 0, 0.55)
    # dark cinematic pad: Dm(add9) -> Bb maj7 colour on the reveal
    put(reverb(pad_chord([50, 57, 62, 64], 2.2, a=1.4, r=0.6, bright=900), 2.5, 0.5), 0.3, 0.5)
    put(reverb(pad_chord([46, 53, 57, 62, 69], 4.5, a=0.05, r=1.8, bright=2600), 3.0, 0.45), 2.0, 0.6)
    # 16th-note electronic pulse (120 BPM) entering after the reveal, filtered open
    step = 0.125; arp = [62, 69, 74, 69, 65, 69, 77, 69]
    k = 0; tt = 3.0
    while tt < total:
        n_ = arp[k % len(arp)]; d = t_(0.11)
        s = (2*((note(n_)*d) % 1)-1)
        cut = 900 + 2400*min(1, (tt-3.0)/2.0)
        s = lp(s, cut, 2)*np.exp(-d*28)
        pan = 0.35 if k % 2 else -0.35
        put(np.stack([s*np.sqrt((1-pan)/2), s*np.sqrt((1+pan)/2)], 1), tt, 0.22*min(1, (tt-2.9)/0.8))
        tt += step; k += 1
    # soft kick on the beat after the reveal
    for b in np.arange(3.0, total, 0.5):
        kt = t_(0.35); kick = np.sin(2*np.pi*np.cumsum(45+90*np.exp(-kt*30))/SR)*np.exp(-kt*9)
        put(kick, b, 0.35)
    out = out[:int(total*SR)]
    fade = np.minimum(1, (total - t_(total))/0.4)[:, None]
    return out*fade

if __name__ == "__main__":
    fx = os.path.join(ROOT, "sound-effects"); mu = os.path.join(ROOT, "music")
    os.makedirs(fx, exist_ok=True); os.makedirs(mu, exist_ok=True)
    write(os.path.join(fx, "digital-pulse.wav"), digital_pulse())
    write(os.path.join(fx, "whoosh-a.wav"), whoosh(1.1, 0.6, pan_from=-0.9, pan_to=0.9))
    write(os.path.join(fx, "whoosh-b.wav"), whoosh(0.9, 0.5, 400, 7000, 0.9, -0.9))
    write(os.path.join(fx, "riser.wav"), riser(1.4))
    write(os.path.join(fx, "deep-impact.wav"), sub_impact())
    write(os.path.join(fx, "metallic-reveal.wav"), metallic_reveal())
    write(os.path.join(mu, "opening-music.wav"), build_opening_music(6.0))
