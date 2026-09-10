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

Silent by design: reels autoplay muted, and leaving the audio track empty
lets trending audio be added inside Instagram, which is better for reach.
