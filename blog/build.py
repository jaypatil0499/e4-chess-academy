#!/usr/bin/env python3
"""Build the E4CA blog from Markdown files in blog/posts/.

A post publishes itself on its own date: anything dated today or earlier is
rendered, anything later is left alone. The weekly job just runs this and
commits whatever changed, so scheduling a post means writing a date, and
re-running is always safe.

Deliberately no third-party dependencies. A scheduled build that installs
packages is a scheduled build that eventually breaks on a bad release, and
this one has to keep working unattended.

    python3 blog/build.py            # publish anything due
    python3 blog/build.py --preview  # include future posts, for checking drafts
"""

import datetime as dt
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / 'blog' / 'posts'
OUT = ROOT / 'blog'
SITE = 'https://www.e4chessacademy.com'
LOGIN = 'https://classroom.e4chessacademy.com/login'
GA = 'G-34JMV8X5WG'


# ---------------------------------------------------------------- markdown
def inline(t):
    """Inline formatting. Text is escaped first, so posts cannot break the page."""
    t = html.escape(t, quote=False)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\w)\*([^*]+)\*(?!\w)', r'<em>\1</em>', t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    return t


def render(md):
    """A deliberately small Markdown subset: headings, lists, quotes, rules,
    paragraphs, and raw HTML passthrough for anything richer."""
    out, para, lst = [], [], None

    def flush_para():
        if para:
            out.append('<p>%s</p>' % inline(' '.join(para)))
            para.clear()

    def flush_list():
        nonlocal lst
        if lst:
            tag = 'ol' if lst[0] else 'ul'
            items = ''.join('<li>%s</li>' % inline(i) for i in lst[1])
            out.append('<%s>%s</%s>' % (tag, items, tag))
            lst = None

    for raw in md.split('\n'):
        line = raw.rstrip()
        if not line.strip():
            flush_para(); flush_list(); continue
        if line.lstrip().startswith('<'):          # raw HTML block, passed through
            flush_para(); flush_list(); out.append(line); continue
        m = re.match(r'(#{2,4})\s+(.*)', line)
        if m:
            flush_para(); flush_list()
            lvl = len(m.group(1))
            out.append('<h%d>%s</h%d>' % (lvl, inline(m.group(2)), lvl)); continue
        if line.strip() in ('---', '***'):
            flush_para(); flush_list(); out.append('<hr>'); continue
        if line.startswith('> '):
            flush_para(); flush_list()
            out.append('<blockquote>%s</blockquote>' % inline(line[2:])); continue
        m = re.match(r'\s*([-*])\s+(.*)', line)
        if m:
            flush_para()
            if not lst or lst[0]:
                flush_list(); lst = (False, [])
            lst[1].append(m.group(2)); continue
        m = re.match(r'\s*\d+\.\s+(.*)', line)
        if m:
            flush_para()
            if not lst or not lst[0]:
                flush_list(); lst = (True, [])
            lst[1].append(m.group(1)); continue
        para.append(line.strip())

    flush_para(); flush_list()
    return '\n'.join(out)


def parse(path):
    text = path.read_text(encoding='utf-8')
    if not text.startswith('---'):
        raise SystemExit('%s: missing front matter' % path.name)
    _, fm, body = text.split('---', 2)
    meta = {}
    for line in fm.strip().split('\n'):
        if ':' not in line:
            continue
        k, v = line.split(':', 1)
        meta[k.strip()] = v.strip().strip('"')
    for key in ('title', 'description', 'date'):
        if key not in meta:
            raise SystemExit('%s: front matter needs %s' % (path.name, key))
    meta['date'] = dt.date.fromisoformat(meta['date'])
    meta['slug'] = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', path.stem)
    meta['body'] = body.strip()
    meta['minutes'] = max(2, round(len(body.split()) / 200))
    return meta


# ---------------------------------------------------------------- templates
def head(title, description, canonical, extra=''):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<!-- Google tag (gtag.js) -->
<link rel="preconnect" href="https://www.googletagmanager.com">
<script async src="https://www.googletagmanager.com/gtag/js?id={GA}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', '{GA}');
</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description)}">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="article">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(description)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="shortcut icon" href="../favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="blog.css">
{extra}
</head>
<body>"""


NAV = f"""<nav>
  <a href="../index.html" class="nav-logo">
    <div class="nav-logo-mark"><img src="../images/logo.png" alt="E4 Chess Academy" width="44" height="44"></div>
    <div>
      <div class="nav-logo-text">E4 Chess Academy</div>
      <div class="nav-logo-sub">Where Champions Begin</div>
    </div>
  </a>
  <div class="nav-right">
    <a href="index.html" class="nav-back">All Articles</a>
    <a href="{LOGIN}" class="nav-login" target="_blank" rel="noopener">Login</a>
    <a href="../index.html#demo" class="nav-cta"><span class="cta-full">Book Free Demo →</span><span class="cta-short">Demo →</span></a>
  </div>
</nav>"""


def footer():
    return f"""<footer>
  <div class="foot-inner">
    <div class="foot-cta">
      <div class="foot-cta-title">Want your child taught this properly?</div>
      <p>Every article here comes out of what we teach. A free 30-minute demo shows you how a coach works with your child, with no commitment.</p>
      <a href="../index.html#demo" class="foot-btn">Book a free demo →</a>
    </div>
    <div class="foot-links">
      <a href="../index.html">Home</a>
      <a href="../beginner.html">Beginner</a>
      <a href="../intermediate.html">Intermediate</a>
      <a href="../advanced.html">Advanced</a>
      <a href="index.html">Blog</a>
      <a href="https://www.instagram.com/e4.chess_academy" target="_blank" rel="noopener">Instagram</a>
    </div>
    <div class="foot-legal">© {dt.date.today().year} E4 Chess Academy</div>
  </div>
</footer>
</body>
</html>"""


def post_page(p):
    schema = {
        "@context": "https://schema.org", "@type": "BlogPosting",
        "headline": p['title'], "description": p['description'],
        "datePublished": p['date'].isoformat(),
        "author": {"@type": "Organization", "name": "E4 Chess Academy"},
        "publisher": {"@type": "Organization", "name": "E4 Chess Academy",
                      "logo": {"@type": "ImageObject", "url": SITE + "/images/logo.png"}},
        "mainEntityOfPage": "%s/blog/%s.html" % (SITE, p['slug']),
    }
    extra = '<script type="application/ld+json">%s</script>' % json.dumps(schema)
    tags = ''.join('<span class="tag">%s</span>' % html.escape(t.strip())
                   for t in p.get('tags', '').split(',') if t.strip())
    return '\n'.join([
        head('%s | E4 Chess Academy' % p['title'], p['description'],
             '%s/blog/%s.html' % (SITE, p['slug']), extra),
        NAV,
        '<article class="post">',
        '  <div class="post-head">',
        '    <div class="post-meta">%s &middot; %d min read</div>' % (
            p['date'].strftime('%d %B %Y'), p['minutes']),
        '    <h1>%s</h1>' % html.escape(p['title']),
        '    <p class="post-standfirst">%s</p>' % html.escape(p['description']),
        '    <div class="tags">%s</div>' % tags,
        '  </div>',
        '  <div class="post-body">',
        render(p['body']),
        '  </div>',
        '</article>',
        footer(),
    ])


def index_page(posts):
    cards = []
    for p in posts:
        cards.append(
            '<a class="card" href="%s.html">'
            '<div class="card-meta">%s &middot; %d min read</div>'
            '<h2>%s</h2><p>%s</p><span class="card-more">Read article →</span></a>'
            % (p['slug'], p['date'].strftime('%d %B %Y'), p['minutes'],
               html.escape(p['title']), html.escape(p['description'])))
    body = ('<div class="blog-hero"><span class="eyebrow">The E4 Journal</span>'
            '<h1>Chess, explained <em>clearly</em>.</h1>'
            '<p>Tactics, openings and honest advice for chess parents. '
            'A new article every Monday.</p></div>'
            '<div class="cards">%s</div>' % ''.join(cards)) if cards else \
           ('<div class="blog-hero"><h1>The E4 Journal</h1>'
            '<p>First article coming soon.</p></div>')
    return '\n'.join([
        head('Chess Blog for Parents and Young Players | E4 Chess Academy',
             'Chess tactics, openings and practical advice for parents and young '
             'players, from the coaches at E4 Chess Academy. A new article every Monday.',
             SITE + '/blog/'),
        NAV, '<main class="blog-main">', body, '</main>', footer(),
    ])


def write_sitemap(live):
    """Search engines need to be told the new pages exist; a stale sitemap is
    the most common reason fresh posts sit unindexed for weeks."""
    pages = [(SITE + '/', '1.0'), (SITE + '/blog/', '0.9'),
             (SITE + '/beginner.html', '0.8'), (SITE + '/intermediate.html', '0.8'),
             (SITE + '/advanced.html', '0.8')]
    rows = ''.join(
        '  <url><loc>%s</loc><priority>%s</priority></url>\n' % (u, pr)
        for u, pr in pages)
    rows += ''.join(
        '  <url><loc>%s/blog/%s.html</loc><lastmod>%s</lastmod>'
        '<priority>0.7</priority></url>\n' % (SITE, p['slug'], p['date'].isoformat())
        for p in live)
    (ROOT / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s</urlset>\n' % rows,
        encoding='utf-8')


# ---------------------------------------------------------------- build
def main():
    preview = '--preview' in sys.argv
    today = dt.date.today()
    posts = sorted((parse(f) for f in POSTS.glob('*.md')),
                   key=lambda p: p['date'], reverse=True)
    live = [p for p in posts if preview or p['date'] <= today]
    future = [p for p in posts if p['date'] > today]

    OUT.mkdir(exist_ok=True)
    for p in live:
        (OUT / ('%s.html' % p['slug'])).write_text(post_page(p), encoding='utf-8')
    (OUT / 'index.html').write_text(index_page(live), encoding='utf-8')

    # Remove pages for posts that are no longer live. Without this a --preview
    # run would leave scheduled posts sitting on disk, and the next commit would
    # publish the whole queue at once.
    keep = {'index.html'} | {'%s.html' % p['slug'] for p in live}
    for stale in OUT.glob('*.html'):
        if stale.name not in keep:
            stale.unlink()
            print('  removed   %s (not due yet)' % stale.name)

    write_sitemap(live)

    print('published %d post(s); %d scheduled' % (len(live), len(future)))
    for p in live:
        print('  live      %s  %s' % (p['date'], p['slug']))
    for p in sorted(future, key=lambda x: x['date']):
        print('  scheduled %s  %s' % (p['date'], p['slug']))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
