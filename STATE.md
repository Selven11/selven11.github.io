# Motion rebuild (2026-10-21, chat in ~/life)

Next action (15:20, continued in a new chat): the first build agent died at 15:12 on the session limit before touching index.html/styles.css; research, vendor/, assets/fonts, assets/pcb/scene1.json and work/media cuts are done. Build agent relaunched from work/SPEC.md with Ram's rulings (in corpus commits fb5877b2, 81d6a6af, a0fe2369), no commit. Then 3 critics (motion, perf/a11y, content/facts) -> fix -> playwright verify desktop+375 -> commit+push both remotes.

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
