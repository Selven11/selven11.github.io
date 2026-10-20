# Personal website: brief for the next session

## Current direction (2026-10-20, overrides anything below)

Ram: the instrumentation-first site ("I build the thing that measures the
thing") was not him. He builds things people interact with, to entertain them
or to help them. The site now leads with that:

- Hero: "I build things people play with, and things that help them", over a
  looping video of the TSA animatronics show (`media/show.mp4`).
- Five builds in order: animatronics show, Union County Community Hub (TSA
  website, live link), rocket night light, Mars rover + flipping book, walking
  stick (the honest failure). Then a "More builds" grid.
- AeroWatt and the ROV power board sit lower, in a cream "Lab" panel. Still
  present, no longer the identity.
- Dark warm palette (#0f0d0b, cream, amber), Fraunces + Instrument Sans,
  asymmetric grids, videos pause offscreen, reduced motion shows posters.
- The old night-light photo was dropped; the CAD render and printed body
  replace it. A lit, finished night-light photo would be the biggest upgrade.

The decisions below are from 2026-09-20 and are history where they conflict.

## Original brief (2026-09-20)

## What Ram asked for

A site on the level of Awwwards winners: very good scroll and animation,
as aesthetic as possible, **and not looking AI-generated**. He wants real depth:
3D and parallax effects where the layers visibly separate, with a repeatable
workflow for making them.

## Decisions already made

- **The work is the picture, the site is the frame.** Most award portfolios
  belong to designers whose only artifact is the site, so WebGL fills in for
  thin content. Ram has the opposite: real machines with footage. Borrow the
  Awwwards motion vocabulary, not their content strategy.
- **Looking human comes from the content, not the effects.** AI tells are
  uniform grids, equal cards, Inter, purple gradients and the same fade-up on
  everything. The fix is specificity and asymmetry: part numbers, real numbers,
  honest failures (the walking stick missing stairs belongs on the site), and
  the flagship project page 4x the length of the smallest.
- **One signature move, done perfectly.** Candidates, pick one:
  1. **Exploded PCB layers.** Copper, soldermask, silkscreen and drill are
     already separate z-planes in the KiCad export and come apart on scroll.
     It's unique to him. Applies to about 3 projects.
  2. **Depth-map photo displacement.** Photo → Depth Anything V2 (local, on the
     homeserver) → grayscale depth map → about 30 lines of GLSL that shift the
     image with the pointer. Clamp the shift so edge tears stay under about 2%
     of width. Cheaper, and applies to every project.
- **Depth technique:** real CSS 3D (`perspective` + `translateZ` + pointer
  `rotateX/Y`), never fake `translateY * factor` parallax, which reads as
  sliding paper.
- **Motion rules:** every animation must be specific to this content (if it
  would work on a law firm's site, delete it). Transitions act like camera
  moves, not fades. Animate transform and opacity only. 60fps on a mid-range
  phone. `prefers-reduced-motion` gets a real static design. No scrolljacking;
  Lenis is allowed because it keeps the native scrollbar.
- **Stack: Astro + GSAP 3 (ScrollTrigger, SplitText, Flip) + Lenis.** GSAP has
  been fully free since April 2025. CSS scroll-driven animations are only an
  enhancement (Firefox stable still has them behind a flag). WebGL goes only in
  the section that earns it, using OGL or plain three.js. The two chats
  disagreed on Astro vs plain Vite; **Astro wins** because this is 5-12 content
  pages in MDX and Astro ships zero JS by default. This repo gets a build step.
  The `life` no-build rule doesn't apply here.
- **Hosting:** Cloudflare Pages free tier rather than the homeserver, because
  the site is heavy on video.

## The rule that matters most

Ram's pattern is over-preparing and under-shipping, and a WebGL portfolio is
the ideal hiding place: it never looks finished and always feels productive.
So the build order is inverted:

1. **Assets first, not code.** Gather every photo, clip, PCB render, scope
   capture and competition photo. If footage is missing, that's a filming
   weekend.
2. **Day 3: the ugliest version is live at a real URL.** Plain HTML, system
   fonts, real copy, no motion.
3. Then add motion to the thing that already exists.

**It goes public before it's good, and it never comes down.**

## Still unanswered (ask these first)

1. Who is it for: a recruiter skimming for 45 seconds, or a craft piece?
2. How many projects? The recommendation is 5 deep, not 12 shallow.
3. What footage actually exists: animatronics running, turret tracking,
   the MuJoCo quadruped?
4. Domain name?
5. Realistic hours per week?

## Where the content is

- `C:\Users\ramsp\life\corpus\achievements\`: the approved facts. Every claim
  on the site comes from here.
- `C:\Users\ramsp\Portfolio\2 Projects\`: one folder per project with decks,
  code, CAD and parts lists (built 2026-09-27).
- `C:\Users\ramsp\life\.claude\skills\writing\`: Ram's voice profile for all
  copy.
- New since the first chat: the AeroWatt MILCOM paper was **accepted**
  (drafts in `Documents\Research\Stevens\`), and the ASL model is over 80%.
