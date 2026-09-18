#!/usr/bin/env python3
"""Verify the mate-in-one used in reel 03.

Reuses the move generator written for the mate-in-two reel. Checks three
things before the reel is built: White is not already in check, exactly one
move mates, and several other checks exist that do not (which is what makes
the puzzle hard rather than obvious).
"""
import contextlib, importlib.util, io, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("gen", ROOT / 'verify-mate-in-2.py')
v = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(v)

FEN = "r3k2r/pp5p/2P3PB/4N3/8/8/8/4R1K1 w - - 0 1"

def main():
    b = v.parse(FEN)
    assert not v.in_check(b, 'w'), "White is already in check"
    legal = v.legal(b, 'w')
    checks = [m for m in legal if v.in_check(v.apply(b, m), 'b')]
    mates = [m for m in legal if v.is_mate(v.apply(b, m), 'b')]

    print("FEN:", FEN)
    print("legal moves : %d" % len(legal))
    print("checks      : %d  %s" % (len(checks), [v.mv_name(b, m) for m in checks]))
    print("mates       : %d  %s" % (len(mates), [v.mv_name(b, m) for m in mates]))
    assert len(mates) == 1, "the key must be unique"
    assert len(checks) > 1, "a mate in one with only one check is not a puzzle"

    after = v.apply(b, mates[0])
    print("\nafter %s: black has %d legal moves, in check = %s"
          % (v.mv_name(b, mates[0]), len(v.legal(after, 'b')), v.in_check(after, 'b')))
    assert v.is_mate(after, 'b')
    print("\nOK: %s is the only mate, with %d decoy checks."
          % (v.mv_name(b, mates[0]), len(checks) - 1))

if __name__ == '__main__':
    raise SystemExit(main())
