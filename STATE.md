# Motion rebuild (2026-10-21, chat in ~/life)

Shipped 2026-10-21: commit 2bac2c3, live at https://selven11.github.io/ (Pages run 39666310256, zero console errors). Exploded PCB from the scene1 KiCad file in three.js on desktop (lazy, near #b01) and SVG on mobile and reduced motion; GSAP hero, scene state machine, pulses, lazy video posters.

Next action: cut the longest load task at 375 with 4x CPU throttle (1106 ms, was 1865 ms). Trace with chrome-lab; likely SplitText plus ScrollTrigger setup on first paint.

Open questions for Ram:
- Settled 2026-10-21 (Ram): the scene1 shield went in the rotating TV; the LED board photo was unrelated and is removed.
- Is the build-lid clip the book?
- Keep the 68.58 x 53.34 mm board size label?

SPEC acceptance beats in work/SPEC.md predate the 125-unit timeline (pulses 72+k*6, photo 114-119, pin +=360% wide, +=240% mobile).

Plan decided:
- Keep no-build static site on GitHub Pages (BRIEF's Astro/Cloudflare is history: one page, already live). Vendor GSAP+ScrollTrigger+SplitText, Lenis, three.js as local files in vendor/, no CDN.
- Signature move: exploded PCB from Ram's real KiCad file (Portfolio/2 Projects/Mars rover and animatronics (2024-26)/Animatronics/annimatronicsschematicssheilds/scene1shieldarduino/*.kicad_pcb) -> layer JSON -> three.js layers that separate on scroll in the animatronics section.
- Motion graphics in-browser (GSAP timelines: hero title sequence, scene state machine diagram Intro->Launch->Explosion->Movement->Final animated, LED strip counter), not rendered video; rendered mp4 only if it earns a place.
- Reduced motion = real static design. Facts only from ~/life/corpus/achievements. No comments in code. No em dashes.

# Redesign state (2026-10-20)

Next action: get better photos. A lit night light in a dark room, the show scenes from the front, and a person using a build would each beat what is on the site now. Drop them in img/, run strip_meta, swap the src.

Shipped 2026-10-20: the redesign around builds people interact with (see BRIEF.md "Current direction"). Live at https://selven11.github.io/.

Remotes: origin = Selven11/PersonalWebsite, pages = Selven11/selven11.github.io. Push both.
Local preview: `personal-site` config in ~/life/.claude/launch.json (port 8766).
