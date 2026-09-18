#!/usr/bin/env python3
"""Verify the pin position used in reel 04.

Asserts the three claims the reel makes out loud: the c6 knight has no legal
move at all, nothing can recapture on e5 after Nxe5, and Black has no check
in reply. That last one matters because a reel that says "White just wins a
pawn" is wrong if Black has a counter-check waiting.
"""
import contextlib, importlib.util, io, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("gen", ROOT / 'verify-mate-in-2.py')
v = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(v)

FEN = "r1bqkbnr/p4ppp/1pn5/1B1pp3/8/5N2/PPPP1PPP/RNBQK2R w - - 0 1"
C6, E5, F3 = (2, 2), (4, 3), (5, 5)

def main():
    b = v.parse(FEN)
    assert not v.in_check(b, 'w') and not v.in_check(b, 'b'), "nobody should be in check"

    knight = [v.mv_name(b, m) for m in v.legal(b, 'b') if m[0] == C6]
    print("knight on c6, legal moves :", knight or "NONE - absolutely pinned")
    assert not knight, "the knight must be completely pinned"

    nxe5 = [m for m in v.legal(b, 'w') if m[0] == F3 and m[1] == E5]
    assert nxe5, "Nxe5 must be legal"
    after = v.apply(b, nxe5[0])

    recaps = [v.mv_name(after, m) for m in v.legal(after, 'b') if m[1] == E5]
    checks = [v.mv_name(after, m) for m in v.legal(after, 'b')
              if v.in_check(v.apply(after, m), 'w')]
    print("recaptures on e5          :", recaps or "NONE")
    print("black checks in reply     :", checks or "none")
    assert not recaps, "nothing may recapture, or the pawn is not really won"
    assert not checks, "a counter-check would refute the whole point"

    print("\nOK: the knight cannot move, cannot recapture, and Black has no counter-check.")

if __name__ == '__main__':
    raise SystemExit(main())
