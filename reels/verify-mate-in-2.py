"""Exhaustive mate-in-2 verifier. No castling/en-passant in the test position."""
import itertools

def parse(fen):
    board={}; rows=fen.split()[0].split('/')
    for r,row in enumerate(rows):
        f=0
        for ch in row:
            if ch.isdigit(): f+=int(ch)
            else:
                board[(f,r)]=('w' if ch.isupper() else 'b', ch.lower()); f+=1
    return board

def inside(f,r): return 0<=f<8 and 0<=r<8
N_OFF=[(1,2),(2,1),(2,-1),(1,-2),(-1,-2),(-2,-1),(-2,1),(-1,2)]
K_OFF=[(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1),(0,-1),(1,-1)]
SLIDE={'r':[(1,0),(-1,0),(0,1),(0,-1)],
       'b':[(1,1),(1,-1),(-1,1),(-1,-1)],
       'q':[(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]}

def gen(board,color):
    """Pseudo-legal moves as (from, to, promo)."""
    out=[]
    for (f,r),(c,p) in list(board.items()):
        if c!=color: continue
        if p=='p':
            d=-1 if c=='w' else 1
            start=6 if c=='w' else 1
            last=0 if c=='w' else 7
            if inside(f,r+d) and (f,r+d) not in board:
                out.append(((f,r),(f,r+d),'q' if r+d==last else None))
                if r==start and (f,r+2*d) not in board:
                    out.append(((f,r),(f,r+2*d),None))
            for df in (-1,1):
                t=(f+df,r+d)
                if inside(*t) and t in board and board[t][0]!=c:
                    out.append(((f,r),t,'q' if r+d==last else None))
        elif p=='n':
            for df,dr in N_OFF:
                t=(f+df,r+dr)
                if inside(*t) and (t not in board or board[t][0]!=c): out.append(((f,r),t,None))
        elif p=='k':
            for df,dr in K_OFF:
                t=(f+df,r+dr)
                if inside(*t) and (t not in board or board[t][0]!=c): out.append(((f,r),t,None))
        else:
            for df,dr in SLIDE[p]:
                nf,nr=f+df,r+dr
                while inside(nf,nr):
                    t=(nf,nr)
                    if t in board:
                        if board[t][0]!=c: out.append(((f,r),t,None))
                        break
                    out.append(((f,r),t,None)); nf+=df; nr+=dr
    return out

def apply(board,m):
    b=dict(board); (fr,to,promo)=m; c,p=b.pop(fr)
    b[to]=(c,promo if promo else p); return b

def king_sq(board,color):
    for s,(c,p) in board.items():
        if c==color and p=='k': return s
    return None

def attacked(board,sq,by):
    return any(m[1]==sq for m in gen(board,by))

def in_check(board,color):
    ks=king_sq(board,color)
    return ks is not None and attacked(board,ks,'b' if color=='w' else 'w')

def legal(board,color):
    return [m for m in gen(board,color) if not in_check(apply(board,m),color)]

def is_mate(board,color):
    return in_check(board,color) and not legal(board,color)

def sq_name(s): return "abcdefgh"[s[0]]+str(8-s[1])
def mv_name(board,m): 
    c,p=board[m[0]]
    return (p.upper() if p!='p' else '')+sq_name(m[0])+('x' if m[1] in board else '-')+sq_name(m[1])

def mate_in_2(board):
    """Return every White first move that forces mate in 2."""
    keys=[]
    for m1 in legal(board,'w'):
        b1=apply(board,m1)
        if is_mate(b1,'b'):        # mate in 1, not a mate in 2 key
            continue
        replies=legal(b1,'b')
        if not replies:            # stalemate
            continue
        if all(any(is_mate(apply(apply(b1,r),m2),'b') for m2 in legal(apply(b1,r),'w'))
               for r in replies):
            keys.append((m1,replies,b1))
    return keys

FEN="5r1k/1p4pp/7N/q7/8/1Q6/5PPP/6K1 w - - 0 1"
board=parse(FEN)
print("FEN:",FEN)
print("White in check at start:",in_check(board,'w'))
print("Black in check at start:",in_check(board,'b'))
print("White legal moves:",len(legal(board,'w')))
print("Immediate mates in 1:",[mv_name(board,m) for m in legal(board,'w') if is_mate(apply(board,m),'b')])
keys=mate_in_2(board)
print("\nMATE-IN-2 KEYS FOUND:",len(keys))
for m1,replies,b1 in keys:
    print("  KEY:",mv_name(board,m1),"| black replies:",len(replies))
    for r in replies:
        b2=apply(b1,r)
        mates=[mv_name(b2,m2) for m2 in legal(b2,'w') if is_mate(apply(b2,m2),'b')]
        print("    ",mv_name(b1,r),"-> mate:",mates)
