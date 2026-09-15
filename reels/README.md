# E4CA reels

Short-form vertical video for Instagram and YouTube Shorts.

## Why the boards are rendered, not AI-generated

Chess positions have to be exactly right. Video models morph pieces, lose
count and produce illegal positions — fine for b-roll, fatal for a chess
academy. Every board here is drawn deterministically from a real position,
so the position, the move and the tactic are all verifiable.

## How a reel is built

1. `<reel>/frame.html` renders one frame of the reel, chosen with `?f=N`.
   1080x1920, brand palette and typefaces taken from the website.
2. Headless Chrome screenshots each frame.
3. ffmpeg sequences the frames with per-scene hold times into an MP4.

Rebuild `fork-reel`:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for n in $(seq 0 12); do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --screenshot="frames/f$(printf %02d $n).png" --window-size=1080,1920 \
    --virtual-time-budget=9000 \
    "file://$PWD/reels/fork-reel/frame.html?f=$n"
done
ffmpeg -y -f concat -safe 0 -i concat.txt \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 -t 24.09 \
  -vf "fps=30,format=yuv420p" -c:v libx264 -profile:v high -preset slow -crf 20 \
  -c:a aac -b:a 128k -movflags +faststart out.mp4
```

## Reel 01 — What is a fork?

Position `r3k3/5ppp/8/1N6/8/8/5PPP/4K3`, White to play.
`1.Nc7+` forks the king on e8 and the rook on a8; after the king moves,
`2.Nxa8` wins the exchange. If `1...Kd8 2.Nxa8`, the knight is not trapped —
it comes back out via b6.

Two cuts are exported:

- `E4CA-Reel-01-Fork.mp4` — silent, 24s. Reels autoplay muted and the
  captions carry the whole lesson, so this cut lets trending audio be added
  inside Instagram, which is better for reach.
- `E4CA-Reel-01-Fork-VO.mp4` — narrated, 33.6s.

## Narration

`narration.json` holds one line per scene, written to mirror the on-screen
captions so what is heard and what is read agree.

Voiced with the macOS `say` command (`Rishi`, an Indian-English voice, at
rate 178) rather than a hosted model — it is free, offline and repeatable.
`voice-sample-*.m4a` are the alternatives: Aman and Tara are also
Indian-English, Daniel is British.

Sync is structural rather than hand-aligned: each scene gets an audio block
padded to exactly the scene's length (`scene-timings.json`), so the same
list drives both the frame hold times and the narration track and the two
cannot drift. The glide frames get real silence. The mix is normalised to
-16 LUFS, the usual target for social playback.

To change voice, rebuild with it as the argument — frames, narration,
timings and encode all regenerate:

```bash
./reels/build-reel.sh Tara      # or Rishi, Aman, Daniel
say -v '?' | grep en_IN         # the Indian-English voices
```

The hosted voice service (Higgsfield presets such as Fraser or Romy) needs
credits on the account; while the workspace balance is zero, every voice
there fails to submit regardless of which is chosen, so the local voices
are the working path.

## Reel 02 — Mate in two

Position `5r1k/1p4pp/7N/q7/8/1Q6/5PPP/6K1`, White to play. Black is up the
exchange; White gives the queen away and mates.

`1.Qg8+!! Rxg8` (forced — the king cannot take because the knight on h6
guards g8) `2.Nf7#`, a smothered mate.

Checked before building, not after: `verify-mate-in-2.py` generates every
legal move and confirms there is no mate in one, that `Qg8+` is the **only**
first move forcing mate in two, and that Black has exactly one legal reply.
Run it before publishing any change to the position.

```bash
python3 reels/verify-mate-in-2.py
./reels/build-reel.sh mate-in-2 Tara
```

