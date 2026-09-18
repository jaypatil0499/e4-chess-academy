#!/usr/bin/env python3
"""Verify the skewer position used in reel 05.

Checks what the reel says out loud: Bf4 is check, the king has exactly six
legal replies, and none of them saves the rook on b8. It also prints those
six squares, because the reel highlights them on screen and an earlier cut
highlighted two squares the king cannot legally reach.
"""
import contextlib, importlib.util, io, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("gen", ROOT / 'verify-mate-in-2.py')
v = importlib.util.module_from_spec(spec)
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(v)

FEN = "1r6/p4ppp/3k4/8/8/8/5PPP/2B3K1 w - - 0 1"
C1, F4, B8 = (2, 7), (5, 4), (1, 0)

def main():
    b = v.parse(FEN)
    assert not v.in_check(b, 'w') and not v.in_check(b, 'b')

    sk = [m for m in v.legal(b, 'w') if m[0] == C1 and m[1] == F4]
    assert sk, "Bf4 must be legal"
    after = v.apply(b, sk[0])
    assert v.in_check(after, 'b'), "Bf4 must give check"

    replies = v.legal(after, 'b')
    squares = sorted(v.sq_name(m[1]) for m in replies)
    print("Bf4+ gives check.")
    print("black's legal replies (%d): %s" % (len(replies), ', '.join(squares)))
    assert all(m[0] == (3, 2) for m in replies), "every reply should be a king move"

    saved = []
    for r in replies:
        pos = v.apply(after, r)
        takes = [m for m in v.legal(pos, 'w') if m[1] == B8]
        if not takes:
            saved.append(v.mv_name(after, r))
            continue
        post = v.apply(pos, takes[0])
        if [m for m in v.legal(post, 'b') if m[1] == B8]:
            saved.append(v.mv_name(after, r))
    print("replies that save the rook:", saved or "NONE")
    assert not saved, "the skewer must win the rook in every line"

    print("\nOK: six king moves, none of them saves the rook.")
    print("Highlight exactly these squares on screen:", ', '.join(squares))

if __name__ == '__main__':
    raise SystemExit(main())
