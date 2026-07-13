import * as THREE from "three";

/* ---------- boot & fallback ---------- */

const canvas = document.getElementById("stage");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = innerWidth < 720;

let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  if (!renderer.getContext()) throw new Error("no context");
} catch {
  document.body.classList.add("no-3d");
}

/* ---------- shape sampling ---------- */

const N = mobile ? 11000 : 25000;

function sampleCanvas(draw, w, h, scale, zJitter = 0.7) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  draw(ctx, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const pts = new Float32Array(N * 3);
  let i = 0;
  let guard = 0;
  while (i < N && guard < N * 600) {
    guard++;
    const x = (Math.random() * w) | 0;
    const y = (Math.random() * h) | 0;
    if (data[(y * w + x) * 4 + 3] > 128) {
      pts[i * 3] = (x - w / 2 + Math.random()) * scale;
      pts[i * 3 + 1] = -(y - h / 2 + Math.random()) * scale;
      pts[i * 3 + 2] = (Math.random() - 0.5) * zJitter;
      i++;
    }
  }
  return pts;
}

function drawName(ctx, w, h) {
  let size = 300;
  ctx.font = `900 ${size}px Archivo, sans-serif`;
  size = (size * (w * 0.92)) / ctx.measureText("NAITEEK").width;
  ctx.font = `900 ${size}px Archivo, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NAITEEK", w / 2, h / 2);
}

function drawPerson(ctx) {
  ctx.beginPath();
  ctx.arc(350, 190, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(165, 600);
  ctx.quadraticCurveTo(175, 392, 350, 368);
  ctx.quadraticCurveTo(525, 392, 535, 600);
  ctx.closePath();
  ctx.fill();
}

function drawPhone(ctx) {
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.roundRect(225, 90, 250, 520, 46);
  ctx.stroke();
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(315, 150);
  ctx.lineTo(385, 150);
  ctx.moveTo(315, 556);
  ctx.lineTo(385, 556);
  ctx.stroke();
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      ctx.arc(280 + i * 70, 240 + j * 90, 16, 0, Math.PI * 2);
      ctx.fill();
    }
}

function drawChip(ctx) {
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.rect(235, 235, 230, 230);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(285, 285, 14, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 6; i++) {
    const t = 262 + i * 36;
    ctx.fillRect(150, t, 72, 16);
    ctx.fillRect(478, t, 72, 16);
    ctx.fillRect(t, 150, 16, 72);
    ctx.fillRect(t, 478, 16, 72);
  }
}

function drawMic(ctx) {
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.roundRect(288, 110, 124, 230, 62);
  ctx.stroke();
  ctx.lineWidth = 10;
  for (let y = 160; y <= 290; y += 38) {
    ctx.beginPath();
    ctx.moveTo(300, y);
    ctx.lineTo(400, y);
    ctx.stroke();
  }
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(350, 300, 108, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(350, 408);
  ctx.lineTo(350, 505);
  ctx.moveTo(285, 505);
  ctx.lineTo(415, 505);
  ctx.stroke();
}

function drawBook(ctx) {
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(350, 230);
  ctx.quadraticCurveTo(255, 180, 150, 215);
  ctx.lineTo(150, 470);
  ctx.quadraticCurveTo(255, 435, 350, 485);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(350, 230);
  ctx.quadraticCurveTo(445, 180, 550, 215);
  ctx.lineTo(550, 470);
  ctx.quadraticCurveTo(445, 435, 350, 485);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 8;
  for (const dy of [70, 140]) {
    ctx.beginPath();
    ctx.moveTo(330, 250 + dy);
    ctx.quadraticCurveTo(255, 205 + dy, 180, 235 + dy);
    ctx.moveTo(370, 250 + dy);
    ctx.quadraticCurveTo(445, 205 + dy, 520, 235 + dy);
    ctx.stroke();
  }
}

function drawAt(ctx) {
  ctx.font = "900 520px Archivo, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("@", 350, 375);
}

function sampleBall(r) {
  const pts = new Float32Array(N * 3);
  const seam = Math.floor(N * 0.3);
  for (let i = 0; i < N; i++) {
    let x, y, z;
    if (i < seam) {
      const t = Math.random() * Math.PI * 2;
      const lat = 0.62 * Math.sin(2 * t);
      x = r * Math.cos(lat) * Math.cos(t) + (Math.random() - 0.5) * 0.3;
      y = r * Math.sin(lat) + (Math.random() - 0.5) * 0.3;
      z = r * Math.cos(lat) * Math.sin(t) + (Math.random() - 0.5) * 0.3;
    } else {
      const u = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      x = r * s * Math.cos(phi);
      y = r * u;
      z = r * s * Math.sin(phi);
    }
    pts[i * 3] = x;
    pts[i * 3 + 1] = y;
    pts[i * 3 + 2] = z;
  }
  return pts;
}

/* ---------- particle scene ---------- */

const INK = new THREE.Color("#191813");
const BLUE = new THREE.Color("#1f2de6");

if (renderer) init();

async function init() {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
  camera.position.z = 26;

  try {
    await Promise.race([
      document.fonts.load("900 300px Archivo"),
      new Promise((res) => setTimeout(res, 2500)),
    ]);
  } catch { /* fall back to system font sampling */ }

  const iconScale = mobile ? 0.017 : 0.021;
  const shapes = {
    name: sampleCanvas(drawName, 1600, 400, mobile ? 0.011 : 0.0143),
    person: sampleCanvas(drawPerson, 700, 700, iconScale),
    phone: sampleCanvas(drawPhone, 700, 700, iconScale),
    chip: sampleCanvas(drawChip, 700, 700, iconScale),
    mic: sampleCanvas(drawMic, 700, 700, iconScale),
    book: sampleCanvas(drawBook, 700, 700, iconScale),
    ball: sampleBall(mobile ? 4.4 : 5.6),
    at: sampleCanvas(drawAt, 700, 700, iconScale),
  };

  const cur = new Float32Array(N * 3);
  const draw = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const baseCol = new Float32Array(N * 3);
  const speed = new Float32Array(N);
  const phase = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u) * 18;
    cur[i * 3] = s * Math.cos(a);
    cur[i * 3 + 1] = u * 18;
    cur[i * 3 + 2] = s * Math.sin(a);
    speed[i] = reduced ? 0.5 : 0.025 + Math.random() * 0.055;
    phase[i] = Math.random() * Math.PI * 2;
    const c = Math.random() < 0.06 ? BLUE : INK;
    baseCol[i * 3] = c.r;
    baseCol[i * 3 + 1] = c.g;
    baseCol[i * 3 + 2] = c.b;
  }
  colors.set(baseCol);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(draw, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const dot = document.createElement("canvas");
  dot.width = dot.height = 64;
  const dctx = dot.getContext("2d");
  dctx.fillStyle = "#fff";
  dctx.beginPath();
  dctx.arc(32, 32, 28, 0, Math.PI * 2);
  dctx.fill();

  const mat = new THREE.PointsMaterial({
    size: mobile ? 0.14 : 0.11,
    map: new THREE.CanvasTexture(dot),
    vertexColors: true,
    transparent: true,
    alphaTest: 0.4,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene.add(group);

  /* ---------- state ---------- */

  let target = shapes.name;
  let shapeName = "name";
  let morphClock = 0;
  let offsetX = 0;
  const mouse = { x: 0, y: 0 };
  let spinY = 0;

  function setShape(name, ox) {
    if (!shapes[name] || name === shapeName) return;
    shapeName = name;
    target = shapes[name];
    morphClock = 0;
    offsetX = mobile ? 0 : ox;
  }

  addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  });

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  });

  /* ---------- section observer ---------- */

  const sections = [...document.querySelectorAll("[data-shape]")];
  const shapeIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setShape(e.target.dataset.shape, Number(e.target.dataset.ox || 0));
        }
      }
    },
    { threshold: 0.45 }
  );
  const offsets = { about: -4.5, freelance: 4.5, electronics: -4.5, podcast: 4.5, books: -5, tennis: 4.5 };
  sections.forEach((s) => {
    s.dataset.ox = offsets[s.id] || 0;
    shapeIO.observe(s);
  });

  /* ---------- animation ---------- */

  const clock = new THREE.Clock();
  let elapsed = 0;

  function tick(dt) {
    elapsed += dt;
    const t = elapsed;
    morphClock += dt;

    const wobble = reduced ? 0 : 0.05;
    const colorize = morphClock < 4;

    for (let i = 0; i < N; i++) {
      const k = 1 - Math.pow(1 - speed[i], dt * 60);
      const j = i * 3;
      cur[j] += (target[j] - cur[j]) * k;
      cur[j + 1] += (target[j + 1] - cur[j + 1]) * k;
      cur[j + 2] += (target[j + 2] - cur[j + 2]) * k;
      const w = Math.sin(t * 1.4 + phase[i]) * wobble;
      draw[j] = cur[j] + w;
      draw[j + 1] = cur[j + 1] + Math.cos(t * 1.1 + phase[i]) * wobble;
      draw[j + 2] = cur[j + 2] + w;

      if (colorize) {
        const dx = target[j] - cur[j];
        const dy = target[j + 1] - cur[j + 1];
        const f = Math.min(1, (dx * dx + dy * dy) * 0.55);
        colors[j] = baseCol[j] + (BLUE.r - baseCol[j]) * f;
        colors[j + 1] = baseCol[j + 1] + (BLUE.g - baseCol[j + 1]) * f;
        colors[j + 2] = baseCol[j + 2] + (BLUE.b - baseCol[j + 2]) * f;
      }
    }
    geo.attributes.position.needsUpdate = true;
    if (colorize) geo.attributes.color.needsUpdate = true;

    if (shapeName === "ball" && !reduced) {
      spinY += dt * 0.55;
    } else {
      spinY += (Math.round(spinY / (Math.PI * 2)) * Math.PI * 2 - spinY) * Math.min(1, dt * 2);
    }
    const breathe = reduced ? 0 : Math.sin(t * 0.2) * 0.05;
    group.rotation.y += (spinY + mouse.x * 0.22 + breathe - group.rotation.y) * Math.min(1, dt * 3);
    group.rotation.x += (-mouse.y * 0.1 - group.rotation.x) * Math.min(1, dt * 3);
    group.position.x += (offsetX - group.position.x) * Math.min(1, dt * 2.5);

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(() => tick(Math.min(clock.getDelta(), 0.05)));

  window.__particles = { renderer, setShape, shapes, tick };
}

/* ---------- panel reveal + hud (runs with or without WebGL) ---------- */

const panelIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        panelIO.unobserve(e.target);
      }
    }
  },
  { threshold: 0.2 }
);
document.querySelectorAll(".panel").forEach((el) => panelIO.observe(el));

const hudStage = document.getElementById("hud-stage");
const hudT = document.getElementById("hud-t");
const staged = [...document.querySelectorAll("[data-stage]")];

function updateHud() {
  const marker = innerHeight * 0.5;
  let current = staged[0];
  for (const s of staged) {
    if (s.getBoundingClientRect().top <= marker) current = s;
  }
  hudStage.textContent = current.dataset.stage;
  const max = document.documentElement.scrollHeight - innerHeight;
  hudT.textContent = `t = ${max > 0 ? Math.round((scrollY / max) * 100) : 0}%`;
}

let ticking = false;
addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      updateHud();
      ticking = false;
    });
  }
});
updateHud();
