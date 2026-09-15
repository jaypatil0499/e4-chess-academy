#!/usr/bin/env bash
# Rebuild the fork reel with a chosen narration voice.
#   ./reels/build-reel.sh fork-reel Tara   -> narrated cut using macOS voice "Tara"
#   ./reels/build-reel.sh mate-in-2 Tara
#   say -v '?' | grep en_IN                -> list the Indian-English voices
set -euo pipefail

NAME="${1:-fork-reel}"
VOICE="${2:-Tara}"
RATE="${3:-178}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REEL="$ROOT/reels/$NAME"
[ -f "$REEL/frame.html" ] || { echo "No reel at $REEL"; exit 1; }
FRAMES=$(python3 -c "import json;print(max(int(k) for k in json.load(open('$REEL/narration.json')))+1)")
WORK="$(mktemp -d)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
trap 'rm -rf "$WORK"' EXIT

echo "Rendering frames..."
mkdir -p "$WORK/frames"
for n in $(seq 0 $((FRAMES-1))); do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --screenshot="$WORK/frames/f$(printf %02d "$n").png" --window-size=1080,1920 \
    --virtual-time-budget=9000 "file://$REEL/frame.html?f=$n" >/dev/null 2>&1
done

echo "Narrating with $VOICE..."
VOICE="$VOICE" RATE="$RATE" WORK="$WORK" REEL="$REEL" python3 "$ROOT/reels/assemble.py"

echo "Encoding..."
OUT="$REEL/$(basename "$REEL").mp4"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$WORK/aconcat.txt" -c copy "$WORK/vo.wav"
DUR=$(cat "$WORK/duration.txt")
ffmpeg -y -loglevel error \
  -f concat -safe 0 -i "$WORK/concat.txt" -i "$WORK/vo.wav" -t "$DUR" \
  -vf "fps=30,format=yuv420p" \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100" \
  -c:v libx264 -profile:v high -level 4.1 -preset slow -crf 20 \
  -c:a aac -b:a 160k -movflags +faststart "$OUT"

echo "Done: $OUT  ($(printf '%.1f' "$DUR")s, voice $VOICE)"
