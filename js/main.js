import { build } from "./pcb.js?v=20261023a";
import { createMotion } from "./motion.js?v=20261023a";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const pauseBtn = document.getElementById("pause");
const videos = [...document.querySelectorAll("video[data-play]")];
const paused = () => sessionStorage.getItem("motion") === "off";
const still = () => reduce.matches || paused();

const visible = new Set();
function playVideos() {
  let n = 0;
  for (const v of videos) {
    if (!still() && visible.has(v) && n < 2) {
      n++;
      if (v.paused) {
        v.preload = "auto";
        const r = v.play();
        if (r && r.catch) r.catch(() => {});
      }
    } else {
      if (!v.paused) v.pause();
      if (still() && v.preload !== "none") v.preload = "none";
    }
  }
}
const vio = new IntersectionObserver((entries) => {
  for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
  playVideos();
}, { rootMargin: "300px" });
videos.forEach((v) => vio.observe(v));

const posters = [...document.querySelectorAll("video[data-poster]")];
const pio = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.poster = e.target.dataset.poster;
    pio.unobserve(e.target);
  }
}, { rootMargin: "600px 0px" });
posters.forEach((v) => pio.observe(v));

let rt = 0;
const settle = () => {
  clearTimeout(rt);
  rt = setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 150);
};
window.addEventListener("load", settle);
document.querySelectorAll("img[loading=lazy]").forEach((i) => {
  if (!i.complete) i.addEventListener("load", settle, { once: true });
});

const sheet = document.getElementById("sheet-n");
function sheets() {
  if (!sheet) return;
  document.querySelectorAll("[data-sheet]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: "top center", end: "bottom center",
      onToggle: (s) => { if (s.isActive) sheet.textContent = sec.dataset.sheet; }
    });
  });
}

function gate() {
  if (window.innerWidth < 800 || still()) return false;
  if ((navigator.hardwareConcurrency || 0) < 6) return false;
  const c = navigator.connection;
  if (c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || ""))) return false;
  try {
    const cv = document.createElement("canvas");
    const gl = cv.getContext("webgl2") || cv.getContext("webgl");
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
    return true;
  } catch {
    return false;
  }
}

async function init() {
  const svg = document.getElementById("pcb");
  const box = document.getElementById("pcb-box");
  const dataP = fetch("assets/pcb/scene1.json").then((r) => r.json());
  dataP.catch(() => {});
  let data = null, parts = null;
  const env = { data: null, parts: null, want3d: null };
  const motion = createMotion(env);

  let three = null, want = false, loading = false, broken = false, io = null;
  function drop() {
    if (io) { io.disconnect(); io = null; }
    if (three) { three.destroy(); three = null; }
    motion.attach(null);
  }
  function load() {
    if (loading || three || broken || !want || !gate()) return;
    loading = true;
    import("./pcb3d.js?v=20261023a").then((m) => {
      loading = false;
      if (!want || !gate()) return;
      three = m.mount(box, data, () => { three = null; broken = true; motion.attach(null); });
      motion.attach(three);
    }).catch(() => { loading = false; broken = true; });
  }
  env.want3d = (on) => {
    want = on;
    if (!on) { drop(); return; }
    if (!data || broken || !gate()) return;
    io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io && io.disconnect(); io = null; load(); }
    }, { rootMargin: "600px 0px" });
    io.observe(document.getElementById("b01"));
  };

  ScrollTrigger.config({ ignoreMobileResize: true });
  try { await document.fonts.ready; } catch {}
  await new Promise((r) => requestAnimationFrame(() => r()));
  sheets();

  function setBtn() {
    const off = paused() || reduce.matches;
    pauseBtn.setAttribute("aria-pressed", String(off));
    pauseBtn.textContent = off ? "Play motion" : "Pause motion";
    pauseBtn.disabled = reduce.matches;
  }
  let first = true;
  function apply() {
    setBtn();
    if (paused()) motion.stop(); else motion.start();
    playVideos();
    if (!first) ScrollTrigger.refresh();
  }
  pauseBtn.addEventListener("click", () => {
    if (paused()) sessionStorage.removeItem("motion"); else sessionStorage.setItem("motion", "off");
    apply();
  });
  reduce.addEventListener("change", () => { setBtn(); playVideos(); ScrollTrigger.refresh(); });
  apply();

  try {
    data = await dataP;
    env.data = data;
    parts = build(svg, data);
    env.parts = parts;
  } catch (e) {
    console.error(e);
    parts = null;
    env.parts = null;
  }
  first = false;
  if (!paused()) motion.pcb();
  ScrollTrigger.refresh();
}

init();
