#!/usr/bin/env python3
"""Verify the back-rank position used in reel 06.

The reel's whole point is that h6 does not save the king, so this checks
that Re8 is the only mate, and that removing the bishop on d3 breaks it.
If the bishop were not covering h7 the puzzle would have no solution, and
that is exactly the claim being made on screen.
"""
import contextlib, importlib.util, io, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("gen", ROOT / 'verify-mate-in-2.py')
v = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(v)

FEN = "6k1/5pp1/1q5p/8/8/3B4/1r3PPP/4R1K1 w - - 0 1"
NO_BISHOP = "6k1/5pp1/1q5p/8/8/8/1r3PPP/4R1K1 w - - 0 1"

def mates(fen):
    b = v.parse(fen)
    return [v.mv_name(b, m) for m in v.legal(b, 'w') if v.is_mate(v.apply(b, m), 'b')]

def main():
    b = v.parse(FEN)
    assert not v.in_check(b, 'w') and not v.in_check(b, 'b')
    ms = mates(FEN)
    print("mates in the position      :", ms)
    assert ms == ['Re1-e8'], "Re8 must be the only mate"

    # the claim the reel makes out loud
    print("mates without the d3 bishop:", mates(NO_BISHOP) or "NONE")
    assert not mates(NO_BISHOP), "the bishop covering h7 must be what makes it mate"

    after = v.apply(b, [m for m in v.legal(b, 'w') if v.is_mate(v.apply(b, m), 'b')][0])
    print("black replies after Re8    :", len(v.legal(after, 'b')))
    print("\nOK: Re8 is the only mate, and only because h7 is covered.")

if __name__ == '__main__':
    raise SystemExit(main())
