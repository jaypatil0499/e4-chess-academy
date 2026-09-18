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

## Reel 03 - Mate in one

Position `r3k2r/pp5p/2P3PB/4N3/8/8/8/4R1K1`, White to play.

`Nf7#` is a discovered check: the knight steps off the e-file and the rook
on e1 delivers the mate. The king cannot capture the knight because the g6
pawn defends it, and c6, h6 and the rook cover every other square.

Hard because six checks are available and five of them fail. Verified with
`verify-mate-in-1.py`, which asserts the key is unique and that decoy checks
exist, so a change to the position that quietly makes it trivial is caught.

```bash
python3 reels/verify-mate-in-1.py
./reels/build-reel.sh mate-in-1 Tara
```

## Reel 04 - The pin

Position `r1bqkbnr/p4ppp/1pn5/1B1pp3/8/5N2/PPPP1PPP/RNBQK2R`, White to play.

The knight on c6 is absolutely pinned by the bishop on b5, so it has no
legal move at all. It appears to defend e5, and `Nxe5` shows that it does
not: there is no recapture.

Verified with `verify-the-pin.py`. It checks the knight is fully pinned and
that nothing recaptures, and also that Black has no check in reply, because
a reel claiming White simply wins a pawn is wrong if a counter-check is
waiting. An earlier version of the position failed exactly that test:
Black had `Qa5+` forking the king and the bishop. Moving the black b-pawn
to b6 blocks the queen's route and removes the defender of c6 at the same
time.

```bash
python3 reels/verify-the-pin.py
./reels/build-reel.sh the-pin Tara
```

## Reel 05 - The skewer

Position `1r6/p4ppp/3k4/8/8/8/5PPP/2B3K1`, White to play.

`Bf4+` puts the king in front and the rook behind it on the same diagonal.
The king has six squares, none of them on the diagonal and none of them
useful, and `Bxb8` follows.

Paired deliberately with reel 04: a pin freezes a piece, a skewer forces it
to run, same line in the opposite order. The closing card says exactly that.

`verify-the-skewer.py` asserts the check, that every reply is a king move,
and that no reply saves the rook. It also prints the six legal squares,
because the reel highlights them: the first cut highlighted c7 and e5,
which sit on the bishop's own diagonal and are therefore illegal.

```bash
python3 reels/verify-the-skewer.py
./reels/build-reel.sh the-skewer Tara
```

