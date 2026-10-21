const NS = "http://www.w3.org/2000/svg";
const J8 = [13.48, -13.53];

export const PULSES = [
  [["J8", "1", "J6", "2"]],
  [["J8", "1", "J9", "2"]],
  [["J8", "1", "J5", "2"]],
  [["J6", "1", "J2", "8"], ["J9", "1", "J2", "7"]],
  [["J5", "1", "J2", "9"]]
];

const NETS = [
  ["J1.5", "J7.3"],
  ["J1.7", "J7.4", "J9.3"],
  ["J5.3", "J6.3", "J7.2", "J8.2"],
  ["J2.8", "J6.1"],
  ["J2.7", "J9.1"],
  ["J2.9", "J5.1"],
  ["J5.2", "J6.2", "J7.1", "J8.1", "J9.2"]
];

function el(tag, attrs, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
}

const f = (v) => +v.toFixed(3);

function circlePath(cx, cy, r) {
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
}

function padPath(p) {
  let w = p.w, h = p.h;
  if (p.rot === 90 || p.rot === 270) [w, h] = [h, w];
  let d;
  if (p.shape === "circle") d = circlePath(p.x, p.y, w / 2);
  else d = `M${f(p.x - w / 2)} ${f(p.y - h / 2)}h${f(w)}v${f(h)}h${f(-w)}Z`;
  if (p.drill) d += circlePath(p.x, p.y, p.drill / 2);
  return d;
}

function polyD(a, close) {
  let d = `M${f(a[0])} ${f(a[1])}`;
  for (let i = 2; i < a.length; i += 2) d += `L${f(a[i])} ${f(a[i + 1])}`;
  return close ? d + "Z" : d;
}

export function bboxOf(fp, parsed) {
  if (fp.bbox) return fp.bbox;
  const ps = parsed.pads.filter((p) => p.ref === fp.ref);
  if (!ps.length) return [fp.x - 1, fp.y - 1, fp.x + 1, fp.y + 1];
  return [
    Math.min(...ps.map((p) => p.x - p.w / 2)), Math.min(...ps.map((p) => p.y - p.h / 2)),
    Math.max(...ps.map((p) => p.x + p.w / 2)), Math.max(...ps.map((p) => p.y + p.h / 2))
  ];
}

export function parse(data) {
  const pads = data.pads.map((r) => {
    const o = {};
    data.padsKeys.forEach((k, i) => (o[k] = r[i]));
    return o;
  });
  const padMap = new Map(pads.map((p) => [p.ref + "." + p.num, p]));
  const netPads = new Set(NETS.flat());
  return { pads, padMap, netPads };
}

function graph(tracks) {
  const key = (x, y) => `${Math.round(x * 100)},${Math.round(y * 100)}`;
  const nodes = new Map();
  const add = (k, x, y) => {
    if (!nodes.has(k)) nodes.set(k, { x, y, adj: [] });
    return nodes.get(k);
  };
  for (const [x1, y1, x2, y2] of tracks) {
    const a = key(x1, y1), b = key(x2, y2);
    add(a, x1, y1).adj.push(b);
    add(b, x2, y2).adj.push(a);
  }
  return nodes;
}

function near(nodes, p) {
  const out = [];
  for (const [k, n] of nodes) if (Math.hypot(n.x - p.x, n.y - p.y) < 1.2) out.push(k);
  return out;
}

export function route(data, parsed, a, an, b, bn) {
  const nodes = graph(data.bcu);
  const pa = parsed.padMap.get(a + "." + an), pb = parsed.padMap.get(b + "." + bn);
  if (!pa || !pb) return null;
  const starts = near(nodes, pa), goals = new Set(near(nodes, pb));
  const prev = new Map(starts.map((s) => [s, null]));
  const q = [...starts];
  let hit = null;
  while (q.length) {
    const k = q.shift();
    if (goals.has(k)) { hit = k; break; }
    for (const n of nodes.get(k).adj) if (!prev.has(n)) { prev.set(n, k); q.push(n); }
  }
  if (!hit) return null;
  const pts = [];
  for (let k = hit; k; k = prev.get(k)) pts.unshift(nodes.get(k));
  const a2 = [pa.x, pa.y];
  for (const n of pts) a2.push(n.x, n.y);
  a2.push(pb.x, pb.y);
  return a2;
}

export function build(svg, data) {
  const parsed = parse(data);
  svg.textContent = "";
  const cam = el("g", { class: "cam" }, svg);
  const lift = {};
  const iso = {};
  for (const name of ["bcu", "board", "ghost", "silk"]) {
    lift[name] = el("g", { class: "lift", "data-layer": name }, cam);
    iso[name] = el("g", { class: "iso" }, lift[name]);
  }

  const outline = el("path", { class: "outline draw", d: data.outline.map((o) => polyD(o, true)).join(""), pathLength: 1 }, iso.board);

  const holes = el("g", { id: "holes" }, iso.board);
  for (const p of parsed.pads) {
    if (p.type === "np_thru_hole") el("circle", { class: "hole draw", cx: p.x, cy: p.y, r: (p.drill || p.w) / 2, pathLength: 1 }, holes);
  }

  const trkG = el("g", { id: "bcu" }, iso.bcu);
  const tracks = [...data.bcu].sort((s, t) => {
    const ds = Math.hypot((s[0] + s[2]) / 2 - J8[0], (s[1] + s[3]) / 2 - J8[1]);
    const dt = Math.hypot((t[0] + t[2]) / 2 - J8[0], (t[1] + t[3]) / 2 - J8[1]);
    return ds - dt;
  });
  for (const [x1, y1, x2, y2, w] of tracks) {
    el("path", { class: "trk draw", d: `M${x1} ${y1}L${x2} ${y2}`, "stroke-width": w, pathLength: 1 }, trkG);
  }
  const amber = el("path", { id: "amber", class: "amb", d: data.bcu.map(([x1, y1, x2, y2]) => `M${x1} ${y1}L${x2} ${y2}`).join("") }, iso.bcu);
  const pulseG = el("g", { id: "pulses" }, iso.bcu);

  const padG = el("g", { id: "pads" }, iso.board);
  const onG = el("g", { id: "padsOn" }, iso.board);
  const pads = [];
  for (const p of parsed.pads) {
    if (p.type === "np_thru_hole") continue;
    const d = padPath(p);
    pads.push(el("path", { class: "pad", d }, padG));
    if (parsed.netPads.has(p.ref + "." + p.num)) el("path", { class: "padOn", d }, onG);
  }

  const silkG = el("g", { id: "silk" }, iso.silk);
  for (const s of data.silk["F.SilkS"]) {
    el("path", { class: "silk draw", d: polyD(s.p, false), "stroke-width": Math.max(s.w, 0.15), pathLength: 1 }, silkG);
  }
  const lblG = el("g", { id: "labels" }, iso.silk);
  const labels = [];
  for (const fp of data.footprints) {
    if (fp.ref.startsWith("MH")) continue;
    const b = bboxOf(fp, parsed);
    const t = el("text", { class: "lbl", x: f((b[0] + b[2]) / 2), y: f(b[1] - 0.6), "text-anchor": "middle" }, lblG);
    t.textContent = fp.ref;
    labels.push(t);
  }
  const j6 = data.footprints.find((x) => x.ref === "J6");
  const callout = el("text", { class: "callout", x: f(j6.bbox[0]), y: f(j6.bbox[3] + 2.8) }, iso.silk);
  callout.textContent = "J6 launchmotor";

  const dotsBox = document.querySelector(".dots");
  if (dotsBox && !dotsBox.children.length) for (let i = 0; i < 32; i++) dotsBox.appendChild(document.createElement("i"));

  return {
    parsed, cam, lift, iso, outline, holes: [...holes.children], tracks: [...trkG.children],
    amber, onG, pulseG, pads, silk: [...silkG.children], labels, callout
  };
}

export function addMotionParts(svg, data, parts) {
  const ghost = el("rect", {
    class: "ghost", x: -data.size[0] / 2, y: -data.size[1] / 2, width: data.size[0], height: data.size[1], rx: 1
  }, parts.iso.ghost);
  const pulses = PULSES.map((slot) => slot.map(([a, an, b, bn]) => {
    const pts = route(data, parts.parsed, a, an, b, bn);
    if (!pts) return null;
    const p = el("path", { class: "pulse", d: polyD(pts, false) }, parts.pulseG);
    p.style.strokeDashoffset = 3;
    p.style.opacity = 0;
    let len = -1;
    return { p, get L() { if (len < 0) len = p.getTotalLength(); return len; } };
  }).filter(Boolean));
  return { ghost, pulses, remove() { ghost.remove(); parts.pulseG.textContent = ""; } };
}
