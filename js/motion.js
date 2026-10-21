import { addMotionParts } from "./pcb.js";

const ramp = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const COND = { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 800px)" };

export function createMotion(env) {
  let mm = null;
  let pcbOn = false;
  let heroDone = false;
  let three = null;
  let paint = null;

  function hero() {
    const h1 = $(".hero h1");
    let tl = null, raf = 0;
    const skip = () => { if (tl) tl.progress(1); };
    const evs = ["wheel", "touchstart", "keydown"];
    evs.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }));
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        tl = gsap.timeline({ onComplete: () => { heroDone = true; } });
        if (!heroDone) {
          const split = SplitText.create(h1, { type: "lines", mask: "lines" });
          tl.from(split.lines, { yPercent: 100, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0);
          tl.from(".frame .ln", { strokeDashoffset: 1, duration: 0.6, ease: "power2.out", stagger: 0.03 }, 0.2);
          tl.from(".hero-box", { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power2.inOut" }, 0.5);
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      evs.forEach((e) => window.removeEventListener(e, skip));
    };
  }

  function facts() {
    gsap.from(".facts .rule", {
      scaleX: 0, duration: 0.5, ease: "power2.out", stagger: 0.06,
      scrollTrigger: { trigger: ".facts", start: "top 85%", once: true }
    });
  }

  function pcb(wide) {
    const parts = env.parts;
    if (!parts) return () => {};
    const stage = $("#pcb-stage");
    const svg = $("#pcb");
    const photo = $(".pcb-photo");
    stage.classList.add("stacked");
    const extra = addMotionParts(svg, env.data, parts);
    const isos = Object.values(parts.iso);
    const lifts = parts.lift;

    paint = (p) => {
      const ph = ramp(p, 114, 119);
      if (three) {
        const c = ramp(p, 40, 45);
        svg.style.opacity = String(1 - c);
        three.canvas.style.opacity = String(c * (1 - ph));
        three.setProgress(p);
      } else {
        svg.style.opacity = String(1 - ph);
      }
      photo.style.opacity = String(ph);
    };

    const EX = "power3.inOut";
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage, start: "top top", end: wide ? "+=360%" : "+=240%",
        pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true
      },
      onUpdate: () => paint && paint(tl.time())
    });

    tl.from(parts.outline, { strokeDashoffset: 1, duration: 10 }, 0)
      .from(parts.holes, { strokeDashoffset: 1, duration: 6, stagger: { amount: 4 } }, 0)
      .from(".pcb-title", { clipPath: "inset(0 100% 0 0)", duration: 10 }, 0)
      .from(parts.silk, { strokeDashoffset: 1, duration: 10, stagger: { amount: 5 } }, 10)
      .from(parts.labels, { opacity: 0, duration: 4, stagger: { amount: 6 } }, 12)
      .from(parts.pads, { scale: 0, transformOrigin: "50% 50%", duration: 6, stagger: { amount: 7 } }, 12)
      .from(parts.tracks, { strokeDashoffset: 1, duration: 4, stagger: { amount: 11 } }, 25)
      .from([parts.amber, parts.onG], { opacity: 0, duration: 4 }, 41)
      .fromTo(extra.ghost, { opacity: 0 }, { opacity: 1, duration: 6 }, 50)
      .fromTo(".pcb-ghost", { opacity: 0 }, { opacity: 1, duration: 6 }, 56)
      .to(isos, { rotation: 30, skewX: -30, scaleY: 0.86, svgOrigin: "0 0", duration: 22, ease: EX }, 50)
      .to(lifts.silk, { y: -22, duration: 22, ease: EX }, 50)
      .to(lifts.ghost, { y: -4, duration: 22, ease: EX }, 50)
      .to(lifts.bcu, { y: 14, duration: 22, ease: EX }, 50)
      .to(parts.cam, { scale: 0.7, svgOrigin: "0 0", duration: 22, ease: EX }, 50)
      .from(parts.callout, { opacity: 0, duration: 2 }, 72)
      .from(".states li", { opacity: 0.3, duration: 1, stagger: 6 }, 72)
      .from(".dots i", { opacity: 0.15, duration: 0.6, stagger: { amount: 28 } }, 73);

    extra.pulses.forEach((slot, k) => {
      const s0 = 72 + k * 6;
      for (const it of slot) {
        tl.set(it.p, { opacity: 1 }, s0)
          .fromTo(it.p, { strokeDashoffset: 3 }, { strokeDashoffset: () => -it.L, duration: 6, immediateRender: false }, s0)
          .set(it.p, { opacity: 0 }, s0 + 6);
      }
    });

    tl.to(isos, { rotation: 0, skewX: 0, scaleY: 1, svgOrigin: "0 0", duration: 8, ease: EX }, 102)
      .to([lifts.silk, lifts.ghost, lifts.bcu], { y: 0, duration: 8, ease: EX }, 102)
      .to(parts.cam, { scale: 1, svgOrigin: "0 0", duration: 8, ease: EX }, 102)
      .to(extra.ghost, { opacity: 0, duration: 4 }, 102)
      .fromTo([parts.callout, ".pcb-run", ".pcb-ghost"], { opacity: 1 }, { opacity: 0, duration: 4, immediateRender: false }, 110)
      .set({}, {}, 125);

    const lazy = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { lazy.disconnect(); extra.pulses.flat().forEach((it) => it.L); }
    }, { rootMargin: "1200px 0px" });
    lazy.observe(stage);

    if (wide) env.want3d(true);
    paint(tl.time());

    return () => {
      lazy.disconnect();
      if (wide) env.want3d(false);
      paint = null;
      extra.remove();
      stage.classList.remove("stacked");
      svg.style.opacity = "";
      photo.style.opacity = "";
    };
  }

  function seam(wide) {
    const fig = $("#seam");
    const pair = $(".seam-pair", fig);
    fig.classList.add("wipe");
    const line = document.createElement("div");
    line.className = "seam-line";
    line.setAttribute("aria-hidden", "true");
    pair.appendChild(line);
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: fig, start: "top 80%", end: "bottom 20%", scrub: wide ? true : 0.3, invalidateOnRefresh: true }
    });
    tl.fromTo(".s-print", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }, 0)
      .fromTo(line, { x: 0 }, { x: () => pair.offsetWidth }, 0);
    return () => {
      line.remove();
      fig.classList.remove("wipe");
    };
  }

  function tries() {
    const lis = $$("#tries li");
    const tl = gsap.timeline({ scrollTrigger: { trigger: "#tries", start: "top 70%", once: true } });
    lis.forEach((li, i) => {
      tl.from($$(".w", li), { strokeDashoffset: 1, duration: 0.8, ease: "power1.inOut" }, i * 0.4);
    });
    tl.from("#tries li:nth-child(3) .dead", { opacity: 0, duration: 0.2 }, 2 * 0.4 + 0.8)
      .from("#tries li:nth-child(4) .lit", { opacity: 0, duration: 0.12, ease: "power4.out", stagger: 0.03 }, 3 * 0.4 + 0.8);
  }

  function cane() {
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "#cane", start: "top 75%", end: "bottom 40%", scrub: true }
    })
      .from("#cane .floor", { strokeDashoffset: 1, duration: 1 })
      .from("#cane .stick", { strokeDashoffset: 1, duration: 1 })
      .from("#cane .cone", { strokeDashoffset: 1, duration: 1.4 })
      .from("#cane .box-hit", { opacity: 0, duration: 0.6 })
      .from("#cane .stair", { strokeDashoffset: 1, duration: 1 });
  }

  function rov() {
    gsap.from("#rov .rail", {
      strokeDashoffset: 1, duration: 1.2, ease: "power1.inOut", stagger: 0.2,
      scrollTrigger: { trigger: "#rov", start: "top 70%", once: true }
    });
  }

  return {
    start() {
      if (mm) return;
      mm = gsap.matchMedia();
      mm.add(COND, (ctx) => {
        const { motion, wide } = ctx.conditions;
        if (!motion) return;
        const offs = [hero()];
        facts();
        offs.push(seam(wide));
        tries();
        cane();
        rov();
        return () => offs.forEach((f) => f());
      });
      if (env.parts) this.pcb();
    },
    pcb() {
      if (!mm || pcbOn || !env.parts) return;
      pcbOn = true;
      mm.add(COND, (ctx) => {
        const { motion, wide } = ctx.conditions;
        if (!motion) return;
        const off = pcb(wide);
        return off;
      });
      ScrollTrigger.sort();
    },
    stop() {
      if (!mm) return;
      mm.revert();
      mm = null;
      pcbOn = false;
    },
    attach(t) {
      three = t;
      if (!t) {
        const svg = $("#pcb");
        if (svg && paint) svg.style.opacity = "";
      }
      const st = ScrollTrigger.getAll().find((s) => s.trigger === $("#pcb-stage") && s.pin);
      if (paint && st) paint(st.animation.time());
    }
  };
}
