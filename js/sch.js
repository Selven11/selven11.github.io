const root = document.getElementById("rov-sch");
const sheet = document.getElementById("sch-sheet");
const tabs = [...root.querySelectorAll("[role=tab]")];
const notes = [...root.querySelectorAll(".sch-notes [data-for]")];
const cache = new Map();
let tl = null;
let home = "";
let seq = 0;

sheet.addEventListener("click", (e) => {
  const svg = sheet.querySelector("svg");
  if (!svg) return;
  if (sheet.classList.toggle("zoomed")) {
    const [x, y, w, h] = home.split(" ").map(Number);
    const r = sheet.getBoundingClientRect();
    const cx = x + ((e.clientX - r.left) / r.width) * w;
    const cy = y + ((e.clientY - r.top) / r.height) * h;
    const zw = w / 3, zh = h / 3;
    const nx = Math.min(Math.max(cx - zw / 2, x), x + w - zw);
    const ny = Math.min(Math.max(cy - zh / 2, y), y + h - zh);
    svg.setAttribute("viewBox", `${nx} ${ny} ${zw} ${zh}`);
  } else {
    svg.setAttribute("viewBox", home);
  }
});

const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || sessionStorage.getItem("motion") === "off";

async function load(name) {
  if (!cache.has(name)) cache.set(name, fetch(`assets/sch/${name}.svg`).then((r) => r.text()));
  return cache.get(name);
}

function draw(svg) {
  if (tl) tl.kill();
  const paths = [...svg.querySelectorAll(".w path")];
  const dots = svg.querySelectorAll(".w circle");
  const texts = svg.querySelectorAll(".t text");
  if (still() || !window.gsap) return;
  paths.forEach((p) => {
    p.setAttribute("pathLength", "1");
    p.style.strokeDasharray = "1";
  });
  paths.sort((a, b) => a.getBBox().x - b.getBBox().x);
  tl = gsap.timeline();
  tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "power1.out", stagger: { amount: 1.6 } }, 0)
    .from(dots, { opacity: 0, duration: 0.2, stagger: { amount: 0.4 } }, 1.2)
    .from(texts, { opacity: 0, duration: 0.4, stagger: { amount: 0.6 } }, 1.0);
}

async function show(name) {
  const id = ++seq;
  tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.sheet === name)));
  notes.forEach((n) => n.classList.toggle("on", n.dataset.for === name));
  const tab = tabs.find((t) => t.dataset.sheet === name);
  sheet.setAttribute("aria-label", `Schematic sheet: ${tab.textContent.replace(/^\d/, "")}`);
  const text = await load(name);
  if (id !== seq) return;
  sheet.innerHTML = text;
  const svg = sheet.querySelector("svg");
  const bb = svg.getBBox();
  const pad = 6;
  svg.setAttribute("viewBox", `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`);
  sheet.style.aspectRatio = `${bb.width + pad * 2} / ${bb.height + pad * 2}`;
  svg.querySelectorAll(".w circle").forEach((c) => { if (+c.getAttribute("r") > 0.6) c.classList.add("o"); });
  home = svg.getAttribute("viewBox");
  sheet.classList.remove("zoomed");
  draw(svg);
}

tabs.forEach((t, i) => {
  t.addEventListener("click", () => show(t.dataset.sheet));
  t.addEventListener("keydown", (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    const n = tabs[(i + d + tabs.length) % tabs.length];
    n.focus();
    show(n.dataset.sheet);
  });
});
notes.forEach((n) => n.classList.toggle("on", n.dataset.for === "input"));

const io = new IntersectionObserver((es) => {
  if (!es.some((e) => e.isIntersecting)) return;
  io.disconnect();
  show("input");
}, { rootMargin: "0px 0px -25% 0px" });
io.observe(sheet);
