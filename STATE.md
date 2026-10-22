# Site + resume critique pass (2026-10-22, chat in ~/life)

Next action (site SHIPPED 2026-10-22; remaining: resume v3 only) build, in order, then verify at 375 and 1440 (preview config personal-site, port 8766), push origin + pages:
1. Full videos: ffmpeg (work/media/ffmpeg.exe) 720p CRF 28 with AAC audio, controls, preload=none, poster. Sources: show/book full 83 s = ~/Documents/deep-search/media/animatronic-wooden-box-2025-videos/2025-06-29_idx2335_IMG_0492.MOV (h264); rover full 40 s = ~/Documents/deep-search/media/mars-rover-diorama-2024/IMG_1005.MOV; rover classroom 33 s = IMG_1245.MOV. Rotating TV: only the 26 s reel exists (media/rotating-tv.mp4); add audio if the reel has it. strip_meta each.
2. Copy: new h1 + lede (plain, what he does), drop 45/132 commits, drop night-light-print.jpg (keep render + four circuits), cut the stairs moral, contractions, one awards listing.
3. ROV schematic: DONE minified to assets/sch/{input,conversion,monitoring,mcu}.svg (31-89 KB, g.w paths + g.t texts) via work/scripts/minsch.py. Next: section with sheet tabs, GSAP stroke draw on g.w paths, texts fade in.
4. Resume link + email in nav/hero; Debugging log strip; Lab moved above the county site.
5. Resume v3 (copy of resume-google-hw.v2.html -> v3): site link, T2D2 embellishment cut, animatronics award line fixed, ECE. Do not overwrite v2.

Ram's asks (2026-10-22):
- Is the site linked on the resume? No: header has LinkedIn + GitHub only (local/applications/resume-google-hw.v2.html). Add selven11.github.io.
- Full videos instead of clips (rover, book, rotating TV, show).
- Drop the real-life night-light photo (img/night-light-print.jpg).
- Drop "I made 45 of the 132 commits" (reads boastful).
- Rewrite the hero opener; it does not sound natural.
- More visuals and motion graphics; research tools (GSAP, Rive, Theatre.js, Motion Canvas, Remotion) and critiques.
- Put the ROV X-19 power board schematic in (~/Purdue/X-19-Testbench-Power-Supply, 4 sheets; kicad-cli at ~/AppData/Local/Programs/KiCad/10.0/bin/kicad-cli.exe). Never commit in that repo.
- Expert/critic panels on site and resume; go beyond scope.
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
