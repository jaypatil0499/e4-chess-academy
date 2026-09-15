"""Narrate each scene and pad it to that scene's length, so one timing list
drives both the frame hold times and the audio and the two cannot drift."""
import json, os, pathlib, subprocess

WORK = pathlib.Path(os.environ['WORK'])
REEL = pathlib.Path(os.environ['REEL'])
VOICE, RATE = os.environ['VOICE'], os.environ['RATE']

VO = {int(k): v for k, v in json.loads((REEL / 'narration.json').read_text()).items()}
LEAD, TAIL, GLIDE = 0.12, 0.38, 0.13
ORDER = list(range(max(VO) + 1))
GLIDES = [n for n in ORDER if n not in VO]   # frames with no line are motion beats

def dur(p):
    return float(subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)],
        capture_output=True, text=True).stdout.strip())

(WORK / 'vo').mkdir(exist_ok=True)
lengths = {}
for i, text in VO.items():
    aiff, wav = WORK / 'vo' / f's{i:02d}.aiff', WORK / 'vo' / f's{i:02d}.wav'
    subprocess.run(['say', '-v', VOICE, '-r', RATE, '-o', str(aiff), text], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(aiff),
                    '-ar', '44100', '-ac', '2', str(wav)], check=True)
    lengths[i] = dur(wav)

LAST = ORDER[-1]
scene = {n: (GLIDE if n in GLIDES
             else round(LEAD + lengths[n] + (0.62 if n == LAST else TAIL), 3))
         for n in ORDER}

video, audio = [], []
for n in ORDER:
    video += [f"file '{WORK}/frames/f{n:02d}.png'", f"duration {scene[n]}"]
    blk = WORK / 'vo' / f'blk{n:02d}.wav'
    if n in GLIDES:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i',
                        'anullsrc=channel_layout=stereo:sample_rate=44100',
                        '-t', str(scene[n]), str(blk)], check=True)
    else:
        ms = int(LEAD * 1000)
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(WORK / 'vo' / f's{n:02d}.wav'),
                        '-af', f'adelay={ms}|{ms},apad', '-t', str(scene[n]),
                        '-ar', '44100', '-ac', '2', str(blk)], check=True)
    audio.append(f"file '{blk}'")
video.append(f"file '{WORK}/frames/f{ORDER[-1]:02d}.png'")

(WORK / 'concat.txt').write_text('\n'.join(video) + '\n')
(WORK / 'aconcat.txt').write_text('\n'.join(audio) + '\n')
(WORK / 'duration.txt').write_text(str(round(sum(scene.values()), 3)))
(REEL / 'scene-timings.json').write_text(json.dumps({'voice': VOICE, 'scene': scene,
                                                     'total': round(sum(scene.values()), 3)}, indent=1))
print(f"  {sum(scene.values()):.2f}s total")
