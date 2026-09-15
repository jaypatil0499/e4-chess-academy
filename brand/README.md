# E4CA brand marks

Black, square (1:1) versions of the academy logo, generated from
`images/logo.png`.

| File | Size | Background |
|---|---|---|
| `e4ca-logo-black-1x1.png` | 1024x1024 | transparent |
| `e4ca-logo-black-1x1-512.png` | 512x512 | transparent |
| `e4ca-logo-black-on-white-1x1.png` | 1024x1024 | white |

The source PNG carries a baked-in drop shadow — 13.7% of its pixels sit at
partial alpha — which recolours to a grey halo around a black mark. The
alpha is remapped (everything under 190 cleared, 190-248 ramped) so the
shadow is removed and only the mark's own anti-aliased edge survives, now
0.6% of pixels. Use the transparent file unless a flattened background is
required; it sits correctly on any colour.

Regenerate with `python3 brand/make-marks.py`.
