import {
  AmbientLight, Color, CylinderGeometry, DirectionalLight, ExtrudeGeometry, Group, InstancedMesh,
  LineMaterial, LineSegments2, LineSegmentsGeometry, MathUtils, Mesh, MeshBasicMaterial,
  MeshLambertMaterial, Object3D, Path, PerspectiveCamera, PlaneGeometry, Scene, Shape, Vector2, WebGLRenderer
} from "../vendor/three/three.pcb.min.js";
import { parse, route, bboxOf, PULSES } from "./pcb.js?v=20261023a";

const MUTE = new Color("#5a5041");
const AMBER = new Color("#ffb347");
const PAD = new Color("#6b604f");
const BOARD_T = 1.6;
const EASE = gsap.parseEase("power3.inOut");
const ramp = (p, a, b) => MathUtils.clamp((p - a) / (b - a), 0, 1);

function segs(pts, z) {
  const out = [];
  for (let i = 2; i < pts.length; i += 2) out.push(pts[i - 2], -pts[i - 1], z, pts[i], -pts[i + 1], z);
  return out;
}

export function mount(box, data, onLost) {
  const parsed = parse(data);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.opacity = "0";
  box.appendChild(canvas);

  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 1.6));
  const sun = new DirectionalLight(0xffffff, 1.4);
  sun.position.set(-30, 60, 90);
  scene.add(sun);

  const camera = new PerspectiveCamera(30, 72 / 58, 1, 600);
  const dist = 29 / Math.tan(MathUtils.degToRad(15));
  camera.position.set(0, 0, dist + BOARD_T);
  camera.lookAt(0, 0, 0);

  const rig = new Group();
  scene.add(rig);

  const o = data.outline[0];
  const shape = new Shape();
  shape.moveTo(o[0], -o[1]);
  for (let i = 2; i < o.length; i += 2) shape.lineTo(o[i], -o[i + 1]);
  for (const p of parsed.pads) {
    if (p.type !== "np_thru_hole") continue;
    const h = new Path();
    h.absarc(p.x, -p.y, (p.drill || p.w) / 2, 0, Math.PI * 2, true);
    shape.holes.push(h);
  }
  const boardGeo = new ExtrudeGeometry(shape, { depth: BOARD_T, bevelEnabled: false, curveSegments: 16 });
  const board = new Mesh(boardGeo, new MeshLambertMaterial({ color: 0x1d3b2a, transparent: true, opacity: 0.55, depthWrite: false }));
  rig.add(board);

  const copper = parsed.pads.filter((p) => p.type !== "np_thru_hole");
  const circ = copper.filter((p) => p.shape === "circle");
  const rect = copper.filter((p) => p.shape !== "circle");
  const dummy = new Object3D();
  const padMeshes = [];
  const lit = [];
  const cylGeo = new CylinderGeometry(0.5, 0.5, 0.08, 20);
  cylGeo.rotateX(Math.PI / 2);
  const rectGeo = new PlaneGeometry(1, 1);
  for (const [list, geo] of [[circ, cylGeo], [rect, rectGeo]]) {
    if (!list.length) continue;
    const m = new InstancedMesh(geo, new MeshBasicMaterial({ color: 0xffffff }), list.length);
    list.forEach((p, i) => {
      let w = p.w, h = p.h;
      if (p.rot === 90 || p.rot === 270) [w, h] = [h, w];
      dummy.position.set(p.x, -p.y, BOARD_T + 0.05);
      dummy.scale.set(w, h, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, PAD);
      if (parsed.netPads.has(p.ref + "." + p.num)) lit.push([m, i]);
    });
    m.instanceMatrix.needsUpdate = true;
    rig.add(m);
    padMeshes.push(m);
  }

  const res = new Vector2(1, 1);
  const traceMat = new LineMaterial({ color: MUTE.getHex(), linewidth: 1.2, worldUnits: true });
  traceMat.resolution = res;
  const tGeo = new LineSegmentsGeometry();
  tGeo.setPositions(data.bcu.flatMap(([x1, y1, x2, y2]) => [x1, -y1, 0, x2, -y2, 0]));
  const traces = new LineSegments2(tGeo, traceMat);
  const bcuLayer = new Group();
  bcuLayer.position.z = -0.05;
  bcuLayer.add(traces);
  rig.add(bcuLayer);

  const silkPos = [];
  for (const s of data.silk["F.SilkS"]) silkPos.push(...segs(s.p, 0));
  const silkMat = new LineMaterial({ color: 0xefe7da, linewidth: 0.18, worldUnits: true, transparent: true, opacity: 0.85 });
  silkMat.resolution = res;
  const sGeo = new LineSegmentsGeometry();
  sGeo.setPositions(silkPos);
  const silkLayer = new Group();
  silkLayer.position.z = BOARD_T + 0.1;
  silkLayer.add(new LineSegments2(sGeo, silkMat));
  rig.add(silkLayer);

  const hx = data.size[0] / 2, hy = data.size[1] / 2;
  const ghostMat = new LineMaterial({ color: 0xa39885, linewidth: 0.18, worldUnits: true, transparent: true, opacity: 0, depthWrite: false });
  ghostMat.resolution = res;
  const gGeo = new LineSegmentsGeometry();
  gGeo.setPositions([-hx, -hy, 0, hx, -hy, 0, hx, -hy, 0, hx, hy, 0, hx, hy, 0, -hx, hy, 0, -hx, hy, 0, -hx, -hy, 0]);
  const ghost = new LineSegments2(gGeo, ghostMat);
  ghost.position.z = BOARD_T + 0.1;
  rig.add(ghost);

  const pulses = PULSES.map((slot) => slot.map(([a, an, b, bn]) => {
    const pts = route(data, parsed, a, an, b, bn);
    if (!pts) return null;
    const g = new LineSegmentsGeometry();
    g.setPositions(segs(pts, 0.1));
    let L = 0;
    for (let i = 2; i < pts.length; i += 2) L += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
    const mat = new LineMaterial({ color: 0xfff3dd, linewidth: 1.4, worldUnits: true, dashed: true, dashSize: 3, gapSize: 200 });
    mat.resolution = res;
    const line = new LineSegments2(g, mat);
    line.computeLineDistances();
    line.visible = false;
    bcuLayer.add(line);
    return { line, mat, L };
  }).filter(Boolean));

  const leads = ["J6", "J8", "J7"].map((ref) => {
    const fp = data.footprints.find((x) => x.ref === ref);
    const div = document.createElement("div");
    div.className = "lead3d";
    div.setAttribute("aria-hidden", "true");
    div.textContent = `${ref} ${fp.val}`;
    div.style.opacity = "0";
    box.appendChild(div);
    return { div, x: bboxOf(fp, parsed)[2] + 2, y: -fp.y };
  });

  let p = 0, raf = 0, w = 0, h = 0, dead = false;
  const col = new Color();
  const v = new Object3D();

  function size() {
    const r = box.querySelector("svg").getBoundingClientRect();
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    res.set(w, h);
    schedule();
  }

  function draw() {
    raf = 0;
    if (dead) return;
    const t = ramp(p, 50, 72) * (1 - ramp(p, 102, 110));
    const e = EASE(t);
    rig.rotation.x = MathUtils.degToRad(-35) * e;
    rig.scale.setScalar(1 - 0.18 * e);
    silkLayer.position.z = BOARD_T + 0.1 + 26 * e;
    ghost.position.z = BOARD_T + 0.1 + 4 * e;
    ghostMat.opacity = 0.5 * e;
    bcuLayer.position.z = -0.05 - 18 * e;
    const a = ramp(p, 40, 45);
    traceMat.color.copy(col.copy(MUTE).lerp(AMBER, a));
    for (const [m, i] of lit) m.setColorAt(i, col.copy(PAD).lerp(AMBER, a));
    for (const m of padMeshes) if (m.instanceColor) m.instanceColor.needsUpdate = true;
    pulses.forEach((slot, k) => {
      const s0 = 72 + k * 6;
      const q = ramp(p, s0, s0 + 6);
      for (const it of slot) {
        it.line.visible = q > 0 && q < 1;
        it.mat.dashOffset = 3 - q * (it.L + 3);
      }
    });
    rig.updateMatrixWorld(true);
    for (const l of leads) {
      v.position.set(l.x, l.y, BOARD_T + 26 * e);
      v.updateMatrix();
      const pos = v.position.clone().applyMatrix4(rig.matrixWorld).project(camera);
      l.div.style.transform = `translate(${((pos.x + 1) / 2) * w}px,${((1 - pos.y) / 2) * h - 6}px)`;
      l.div.style.opacity = String(e);
    }
    renderer.render(scene, camera);
  }

  function schedule() {
    if (!raf && !dead) raf = requestAnimationFrame(draw);
  }

  const ro = new ResizeObserver(size);
  ro.observe(box);

  function lost(ev) {
    ev.preventDefault();
    api.destroy();
    onLost && onLost();
  }
  canvas.addEventListener("webglcontextlost", lost);

  const api = {
    canvas,
    setProgress(np) { p = np; schedule(); },
    destroy() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      scene.traverse((n) => {
        if (n.geometry) n.geometry.dispose();
        if (n.material) n.material.dispose();
      });
      renderer.dispose();
      canvas.remove();
      leads.forEach((l) => l.div.remove());
    }
  };
  size();
  return api;
}
