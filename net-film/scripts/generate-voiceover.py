"""
Voice-over pipeline for the NET film — produces public/assets/voiceover/vo-01.wav … vo-07.wav and
src/voiceover.json (which the film reads). Re-render afterwards; no code changes needed.

Engines
  edge        Free. Microsoft neural Saudi male voice "ar-SA-HamedNeural" (needs internet; pip install edge-tts)
  elevenlabs  ElevenLabs API (free tier works with your own key). env: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID
  files       Import real studio recordings: a folder containing vo-01.* … vo-07.* (wav/mp3/m4a/aif)

Examples
  python3 scripts/generate-voiceover.py --engine edge
  ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... python3 scripts/generate-voiceover.py --engine elevenlabs
  python3 scripts/generate-voiceover.py --engine files --input ~/Desktop/narrator-takes

Every take is: converted to 48 kHz stereo, silence-trimmed, gently EQ'd for warmth, loudness-normalised
to -16 LUFS, and — only if it is longer than its slot — time-compressed by at most 12 % (a warning is
printed if even that is not enough, so you can re-record that line slightly faster).
Requires ffmpeg + ffprobe on PATH.
"""
import argparse, asyncio, json, os, re, shutil, subprocess, sys, tempfile, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
OUT_DIR = os.path.join(PROJ, "public", "assets", "voiceover")
STATUS = os.path.join(PROJ, "src", "voiceover.json")
FPS = 30

def read_lines():
    src = open(os.path.join(PROJ, "src", "audioManifest.js"), encoding="utf-8").read()
    lines = re.findall(r"id: '(vo-\d\d)'.*?max: (\d+),\s*text: '([^']+)'", src)
    if len(lines) != 7: sys.exit(f"Expected 7 VO lines in audioManifest.js, found {len(lines)}")
    return [(i, int(m), t) for i, m, t in lines]

def sh(*cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit(f"Command failed: {' '.join(cmd)}\n{r.stderr[-2000:]}")
    return r.stdout

def duration(path):
    return float(sh("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path).strip())

def finish(raw, vid, max_frames):
    out = os.path.join(OUT_DIR, f"{vid}.wav")
    tmp = out + ".tmp.wav"
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse"
    sh("ffmpeg", "-y", "-v", "error", "-i", raw, "-af",
       f"{trim},highpass=f=70,equalizer=f=140:t=q:w=1.1:g=2,equalizer=f=3200:t=q:w=1.5:g=1.5,loudnorm=I=-16:TP=-1.5:LRA=7",
       "-ar", "48000", "-ac", "2", tmp)
    d = duration(tmp); limit = max_frames / FPS
    if d > limit:
        tempo = min(1.12, d / limit)
        sh("ffmpeg", "-y", "-v", "error", "-i", tmp, "-af", f"atempo={tempo:.4f}", "-ar", "48000", out); os.remove(tmp)
        d2 = duration(out)
        warn = "  ⚠ still too long — please re-record faster" if d2 > limit + 0.05 else ""
        print(f"  {vid}: {d:.2f}s → {d2:.2f}s (×{tempo:.3f}) slot {limit:.2f}s{warn}"); d = d2
    else:
        shutil.move(tmp, out); print(f"  {vid}: {d:.2f}s (slot {limit:.2f}s)")
    return {"ready": True, "seconds": round(d, 3), "frames": int(round(d * FPS))}

async def edge_tts_line(text, path, voice, rate, pitch):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(path)

def eleven_line(text, path):
    key, voice = os.environ.get("ELEVENLABS_API_KEY"), os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not voice: sys.exit("Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (pick a deep Saudi/Gulf male voice in the Voice Library).")
    body = json.dumps({"text": text, "model_id": os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2"),
                       "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.25, "use_speaker_boost": True}}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192", data=body,
                                 headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as f: f.write(r.read())

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--engine", choices=["edge", "elevenlabs", "files"], required=True)
    ap.add_argument("--input", help="folder with vo-01.* … vo-07.* (engine=files)")
    ap.add_argument("--voice", default="ar-SA-HamedNeural")
    ap.add_argument("--rate", default="-6%", help="edge: speaking rate (e.g. -6%% for a calmer, deeper read)")
    ap.add_argument("--pitch", default="-4Hz", help="edge: pitch offset for a deeper timbre")
    ap.add_argument("--only", nargs="*", help="process only these ids, e.g. vo-04")
    a = ap.parse_args()
    for tool in ("ffmpeg", "ffprobe"):
        if not shutil.which(tool): sys.exit(f"{tool} not found — install ffmpeg (https://ffmpeg.org/download.html)")
    os.makedirs(OUT_DIR, exist_ok=True)
    status = json.load(open(STATUS, encoding="utf-8")) if os.path.exists(STATUS) else {}
    with tempfile.TemporaryDirectory() as td:
        for vid, max_frames, text in read_lines():
            if a.only and vid not in a.only: continue
            if a.engine == "files":
                if not a.input: sys.exit("--input <folder> is required for engine=files")
                cands = [f for f in os.listdir(a.input) if f.lower().startswith(vid)]
                if not cands: print(f"  {vid}: no file found in {a.input} — skipped"); continue
                raw = os.path.join(a.input, sorted(cands)[0])
            else:
                raw = os.path.join(td, f"{vid}.mp3")
                if a.engine == "edge": asyncio.run(edge_tts_line(text, raw, a.voice, a.rate, a.pitch))
                else: eleven_line(text, raw)
            status[vid] = finish(raw, vid, max_frames)
    json.dump(status, open(STATUS, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(f"Updated {os.path.relpath(STATUS, PROJ)} — re-render to hear the narration.")

if __name__ == "__main__":
    main()
