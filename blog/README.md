# The E4 Journal

A post publishes itself on its own date. Write the file, set the date, and
it appears that morning without anyone touching the site.

## Adding a post

Create `blog/posts/YYYY-MM-DD-slug.md`:

```markdown
---
title: "Your headline"
description: "One sentence. Used as the search result snippet and the card text."
date: 2026-11-09
tags: "Tactics, Beginner"
---

Body in Markdown. Headings, lists, bold, links, quotes and `code` all work.
Raw HTML passes straight through, which is how the board diagrams are done.
```

The filename date is only for sorting; the `date` in the front matter is what
publishes it. Keep dates on Mondays to hold the weekly rhythm.

## Building

```bash
python3 blog/build.py            # publish anything due
python3 blog/build.py --preview  # render future posts too, to check drafts
```

`--preview` writes scheduled posts to disk. Always run the plain build again
before committing, which prunes them; otherwise the whole queue goes live at
once.

No third-party packages, by design. A scheduled job that installs dependencies
is a job that eventually breaks on someone else's release.

## The weekly job

`.github/workflows/publish-blog.yml` runs every Monday at 09:00 IST, builds,
and commits whatever became due. Vercel deploys from that commit. If nothing
is due it does nothing. "Run workflow" on the Actions tab publishes by hand.

Because the build is driven by dates rather than by a queue it mutates, a run
that fires late, twice, or not at all is harmless.

## Board diagrams

Eight rows of eight `div`s, top rank first. `l`/`d` set the square colour,
`w`/`b` set the piece colour, and the glyph is the filled Unicode piece
(`&#9820;` rook, `&#9822;` knight, `&#9818;` king, `&#9819;` queen,
`&#9821;` bishop, `&#9823;` pawn) for both colours.

Remember a1 is dark and a8 is light. Verify any position before publishing:
`reels/verify-mate-in-2.py` has a legal move generator for checking claims.
