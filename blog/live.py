#!/usr/bin/env python3
"""Build the two pages that carry live data: world rankings and a news roundup.

Kept separate from build.py because these pages depend on the network, and the
weekly article publish must not fail just because FIDE is slow. Each section is
written only if its fetch succeeded; on failure the previous page is left in
place, which is the right outcome for a job nobody is watching.

Standard library only, for the same reason as build.py.

    python3 blog/live.py
"""

import datetime as dt
import html
import pathlib
import re
import sys
import urllib.error
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import build  # noqa: E402  (shared head/nav/footer, so the blog stays one design)

OUT = build.OUT
UA = 'Mozilla/5.0 (compatible; E4CAChessBlog/1.0; +https://www.e4chessacademy.com)'
FIDE_URL = 'https://ratings.fide.com/'

FEEDS = [
    ('Chess.com', 'https://www.chess.com/rss/news'),
    ('ChessBase', 'https://en.chessbase.com/feed'),
    ('Lichess',   'https://lichess.org/blog.atom'),
]


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode('utf-8', 'replace')


def strip(t):
    return html.unescape(re.sub(r'<[^>]+>', '', t)).replace('&nbsp;', ' ').strip()


# ---------------------------------------------------------------- rankings
def parse_fide(page):
    """FIDE renders the leaders server-side on its homepage, one table per time
    control. Returns {time_control: [(category, player, federation, rating)]}."""
    out = {}
    for block in re.findall(r'<table class="front_top".*?</table>', page, re.S):
        hdr = re.search(r'td_top_header[^>]*>(.*?)</td>', block, re.S)
        name = strip(hdr.group(1)) if hdr else ''
        if name.lower().startswith('top federations') or not name:
            continue
        rows = []
        for tr in re.findall(r'<tr>(?!\s*<td colspan)(.*?)</tr>', block, re.S):
            tds = re.findall(r'<td[^>]*>(.*?)</td>', tr, re.S)
            if len(tds) < 4:
                continue
            cat, player, fed, rating = (strip(x) for x in tds[:4])
            if cat and player and rating.isdigit():
                rows.append((cat, player, fed, rating))
        if rows:
            out[name] = rows
    return out


def rankings_html(data, stamp):
    tables = []
    for tc in ('Standard', 'Rapid', 'Blitz'):
        rows = data.get(tc)
        if not rows:
            continue
        body = ''.join(
            '<tr><td class="cat">%s</td><td class="who">%s</td>'
            '<td class="fed">%s</td><td class="elo">%s</td></tr>'
            % (html.escape(c.replace('Top ', '')), html.escape(p),
               html.escape(f), html.escape(r))
            for c, p, f, r in rows)
        tables.append(
            '<div class="rank-block"><h2>%s</h2><table class="rank">'
            '<thead><tr><th>Category</th><th>Leader</th><th>Fed</th><th>Rating</th></tr>'
            '</thead><tbody>%s</tbody></table></div>' % (tc, body))

    return '\n'.join([
        build.head('World Chess Rankings: Open, Women and Juniors | E4 Chess Academy',
                   'The current world number one in Open, Women, Juniors and Girls '
                   'chess across Standard, Rapid and Blitz, from the official FIDE '
                   'rating list. Updated weekly.',
                   build.SITE + '/blog/rankings.html'),
        build.NAV,
        '<main class="blog-main">',
        '<div class="blog-hero"><span class="eyebrow">World rankings</span>'
        '<h1>Who is <em>number one</em> right now?</h1>'
        '<p>The current leader in each FIDE category, across all three time '
        'controls. Updated every week from the official rating list.</p></div>',
        '<div class="rank-grid">%s</div>' % ''.join(tables),
        '<p class="source">Source: <a href="https://ratings.fide.com/" target="_blank" '
        'rel="noopener">FIDE rating list</a>. Ratings change monthly when FIDE '
        'publishes a new list. Last checked %s.</p>' % stamp,
        '</main>',
        build.footer(),
    ])


# ---------------------------------------------------------------- news
def parse_feed(xml, source):
    """Headlines and links only. The article text belongs to its publisher; this
    page points at them rather than reproducing anything."""
    items = re.findall(r'<(?:item|entry)>(.*?)</(?:item|entry)>', xml, re.S)
    out = []
    for it in items:
        t = re.search(r'<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>', it, re.S)
        if not t:
            continue
        link = re.search(r'<link[^>]*href="([^"]+)"', it) or \
               re.search(r'<link>(.*?)</link>', it, re.S)
        date = re.search(r'<(?:pubDate|published|updated)>(.*?)</', it, re.S)
        out.append({
            'title': strip(t.group(1)),
            'link': strip(link.group(1)) if link else '',
            'date': strip(date.group(1))[:16] if date else '',
            'source': source,
        })
    return out


def news_html(items, stamp):
    cards = ''.join(
        '<a class="news-item" href="%s" target="_blank" rel="noopener">'
        '<span class="news-src">%s</span><span class="news-title">%s</span>'
        '<span class="news-date">%s</span></a>'
        % (html.escape(i['link']), html.escape(i['source']),
           html.escape(i['title']), html.escape(i['date']))
        for i in items)

    return '\n'.join([
        build.head('Chess News This Week | E4 Chess Academy',
                   'What is happening in the chess world this week: headlines from '
                   'Chess.com, ChessBase and Lichess, updated every Monday.',
                   build.SITE + '/blog/chess-news.html'),
        build.NAV,
        '<main class="blog-main">',
        '<div class="blog-hero"><span class="eyebrow">Chess news</span>'
        '<h1>What is happening <em>this week</em>.</h1>'
        '<p>Headlines from around the chess world, refreshed every Monday. '
        'Each one opens on the site that published it.</p></div>',
        '<div class="news-list">%s</div>' % cards,
        '<p class="source">Headlines are linked to their publishers and belong to '
        'them. Last refreshed %s.</p>' % stamp,
        '</main>',
        build.footer(),
    ])


# ---------------------------------------------------------------- run
def main():
    stamp = dt.date.today().strftime('%d %B %Y')
    ok = True

    try:
        data = parse_fide(fetch(FIDE_URL))
        if not data:
            raise ValueError('no ranking tables found; FIDE markup may have changed')
        OUT.joinpath('rankings.html').write_text(rankings_html(data, stamp), encoding='utf-8')
        print('rankings: %s' % ', '.join('%s (%d)' % (k, len(v)) for k, v in data.items()))
    except Exception as e:                                   # noqa: BLE001
        print('rankings: SKIPPED, keeping previous page (%s)' % e)
        ok = False

    items = []
    for source, url in FEEDS:
        try:
            got = parse_feed(fetch(url), source)[:6]
            items += got
            print('news: %-10s %d headlines' % (source, len(got)))
        except Exception as e:                               # noqa: BLE001
            print('news: %-10s unavailable (%s)' % (source, e))

    if items:
        OUT.joinpath('chess-news.html').write_text(news_html(items, stamp), encoding='utf-8')
        print('news: wrote %d headlines' % len(items))
    else:
        print('news: SKIPPED, keeping previous page (no feed responded)')
        ok = False

    # Never fail the workflow: a missing update is not worth a red build, and
    # the previous page is still on the site.
    return 0 if ok else 0


if __name__ == '__main__':
    raise SystemExit(main())
