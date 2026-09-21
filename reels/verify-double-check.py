#!/usr/bin/env python3
"""Verify the double-check position used in reel 07.

Checks that Bc6 is the only mate among the several checks available, that
it really is a double check, and that the b7 pawn can capture the bishop
yet capturing does not help. That last point is the lesson.
"""
import contextlib, importlib.util, io, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("gen", ROOT / 'verify-mate-in-2.py')
v = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(v)

FEN = "r1bqkbnr/pp3ppp/8/8/4B3/8/PPPP1PPP/RNBQR1K1 w - - 0 1"
E4, C6, B7, E8 = (4, 4), (2, 2), (1, 1), (4, 0)

def main():
    b = v.parse(FEN)
    assert not v.in_check(b, 'w') and not v.in_check(b, 'b')

    legal = v.legal(b, 'w')
    checks = [v.mv_name(b, m) for m in legal if v.in_check(v.apply(b, m), 'b')]
    ms = [v.mv_name(b, m) for m in legal if v.is_mate(v.apply(b, m), 'b')]
    print("checks available :", len(checks))
    print("mates            :", ms)
    assert ms == ['Be4-c6'], "Bc6 must be the only mate"

    after = v.apply(b, [m for m in legal if v.is_mate(v.apply(b, m), 'b')][0])

    # two separate pieces must be attacking the king for this to be a double check
    attackers = set()
    for m in v.gen(after, 'w'):
        if m[1] == E8:
            attackers.add(v.sq_name(m[0]))
    print("pieces giving check:", sorted(attackers))
    assert len(attackers) == 2, "must be a genuine double check"

    # the pawn can take the bishop, and it still loses
    can_take = any(m[0] == B7 and m[1] == C6 for m in v.gen(after, 'b'))
    is_legal = any(m[0] == B7 and m[1] == C6 for m in v.legal(after, 'b'))
    print("b7 pawn attacks the bishop:", can_take, "| capture legal:", is_legal)
    assert can_take and not is_legal, "the capture must exist but be illegal"

    print("black legal replies:", len(v.legal(after, 'b')))
    print("\nOK: only Bc6 mates, two pieces check at once, and taking the bishop is illegal.")

if __name__ == '__main__':
    raise SystemExit(main())
