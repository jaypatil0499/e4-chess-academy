"""Generate black, square brand marks from images/logo.png."""
from PIL import Image

LO, HI, MARGIN = 190, 248, 0.08   # alpha floor / ceiling, and edge breathing room

src = Image.open('images/logo.png').convert('RGBA')
lut = [0 if v <= LO else (255 if v >= HI else round((v - LO) / (HI - LO) * 255))
       for v in range(256)]
mark = Image.new('RGBA', src.size, (0, 0, 0, 0))
mark.putalpha(src.getchannel('A').point(lut))
mark = mark.crop(mark.getchannel('A').getbbox())

def square(img, size, bg=None):
    w, h = img.size
    inner = int(size * (1 - 2 * MARGIN))
    s = min(inner / w, inner / h)
    r = img.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    canvas = Image.new('RGBA', (size, size), bg or (0, 0, 0, 0))
    canvas.paste(r, ((size - r.width) // 2, (size - r.height) // 2), r)
    return canvas

for path, bg, size in [
    ('brand/e4ca-logo-black-1x1.png',          None,                 1024),
    ('brand/e4ca-logo-black-1x1-512.png',      None,                 512),
    ('brand/e4ca-logo-black-on-white-1x1.png', (255, 255, 255, 255), 1024),
]:
    square(mark, size, bg).save(path)
    print('wrote', path)
