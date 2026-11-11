const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- theme toggle ---------- */

const rootEl = document.documentElement;
const readCSS = (v, fb) =>
  getComputedStyle(document.body).getPropertyValue(v).trim() || fb;
let gridStroke = readCSS("--grid-line", "rgba(25, 24, 19, 0.09)");
let warpDir = parseFloat(readCSS("--warp-dir", "1")) || 1;
let gridGap = parseFloat(readCSS("--gap", "36")) || 36;
let gridGlow = readCSS("--grid-glow", ""); // dark theme only: lines light up near cursor

const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  const label = () => (rootEl.dataset.theme === "dark" ? "paper" : "mat");
  themeBtn.textContent = label();
  themeBtn.addEventListener("click", () => {
    rootEl.dataset.theme = rootEl.dataset.theme === "dark" ? "light" : "dark";
    localStorage.theme = rootEl.dataset.theme;
    themeBtn.textContent = label();
    gridStroke = readCSS("--grid-line", "rgba(25, 24, 19, 0.09)");
    warpDir = parseFloat(readCSS("--warp-dir", "1")) || 1;
    gridGlow = readCSS("--grid-glow", "");
    gridGap = parseFloat(readCSS("--gap", "36")) || 36;
  });
}

/* ---------- project blueprints on the mat ---------- */
// Four per page, rotated by page so each tab shows a different set.
// Shown only in mat theme (CSS). [file, link, width px]
// Order alternates project drawing / general electronics so every page mixes both.
const BLUEPRINTS = [
  ["helmet", "work.html#sos-helmet", 400],
  ["esp32", "work.html#impulse", 220],
  ["schematic", "work.html#sos-helmet", 360],
  ["i2c", "work.html#sos-helmet", 340],
  ["board", "work.html#impulse", 340],
  ["opamp", "work.html", 290],
  ["pose", "work.html#yoga-mat", 250],
  ["imu", "work.html#sos-helmet", 240],
];
const pageIdx = Math.max(0, [...document.querySelectorAll(".topbar nav a")]
  .findIndex((a) => a.classList.contains("active")));
["bp-bottom", "bp-left", "bp-top", "bp-mid"].forEach((slot, k) => {
  const [name, href, w] = BLUEPRINTS[(pageIdx * 2 + k) % BLUEPRINTS.length];
  const a = document.createElement("a");
  a.className = "bp " + slot;
  a.href = href;
  a.tabIndex = -1; // decorative duplicate of links already on the page
  a.setAttribute("aria-hidden", "true");
  a.style.setProperty("--w", w + "px");
  a.innerHTML = `<img src="images/bp-${name}.svg" alt="">`;
  document.body.append(a);
});

/* ---------- cursor-reactive grid background ---------- */

if (canHover && !reduced) {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  document.body.classList.add("live-bg");

  const SEG = 9;
  const RADIUS = 160;
  const PUSH = 24;
  const GLOW_RADIUS = 320;

  let W, H, dpr;
  const mouse = { x: -9999, y: -9999 };
  const soft = { x: -9999, y: -9999 };

  function resize() {
    dpr = Math.min(devicePixelRatio, 2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener("resize", resize);

  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function warpX(x, y) {
    const dx = x - soft.x;
    const dy = y - soft.y;
    const d = Math.hypot(dx, dy);
    if (d > RADIUS || d === 0) return [x, y];
    const t = 1 - d / RADIUS;
    const k = t * t * (3 - 2 * t) * PUSH * warpDir;
    return [x + (dx / d) * k, y + (dy / d) * k];
  }

  function smoothLine(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);
    ctx.stroke();
  }

  function frame() {
    soft.x += (mouse.x - soft.x) * 0.14;
    soft.y += (mouse.y - soft.y) * 0.14;

    ctx.clearRect(0, 0, W, H);
    if (gridGlow) {
      const g = ctx.createRadialGradient(soft.x, soft.y, 0, soft.x, soft.y, GLOW_RADIUS);
      g.addColorStop(0, gridGlow);
      g.addColorStop(1, gridStroke);
      ctx.strokeStyle = g;
    } else {
      ctx.strokeStyle = gridStroke;
    }
    ctx.lineWidth = 1;

    // every 5th line heavier, same as the static CSS grid
    const GAP = gridGap;
    for (let x = 0, i = 0; x <= W + GAP; x += GAP, i++) {
      const pts = [];
      for (let y = 0; y <= H + SEG; y += SEG) pts.push(warpX(x, y));
      ctx.lineWidth = i % 5 ? 1 : 2;
      smoothLine(pts);
    }
    for (let y = 0, i = 0; y <= H + GAP; y += GAP, i++) {
      const pts = [];
      for (let x = 0; x <= W + SEG; x += SEG) pts.push(warpX(x, y));
      ctx.lineWidth = i % 5 ? 1 : 2;
      smoothLine(pts);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- section reveal ---------- */

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in-view");
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.08 }
);
document.querySelectorAll(".dept, .ticker").forEach((el) => io.observe(el));

/* ---------- work filter ---------- */

const filters = document.querySelectorAll(".filter");
if (filters.length) {
  const workCards = document.querySelectorAll("#work-grid .cs");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      workCards.forEach((card) => {
        const show = f === "all" || (card.dataset.tags || "").split(" ").includes(f);
        card.classList.toggle("hidden", !show);
      });
    });
  });
}

/* ---------- card tilt ---------- */

if (canHover && !reduced) {
  document.querySelectorAll(".proof, .cs").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-2px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

/* ---------- image fade-in (handles cached + pending) ---------- */

document.querySelectorAll(".shot").forEach((img) => {
  if (img.complete) {
    img.naturalWidth ? img.classList.add("loaded") : img.remove();
  } else {
    img.addEventListener("load", () => img.classList.add("loaded"));
  }
});

/* ---------- resume print ---------- */

const printBtn = document.getElementById("print-btn");
if (printBtn) printBtn.addEventListener("click", () => window.print());

// ponytail: phone only exists in the printed PDF; split so naive scrapers
// don't find it in source. A determined one still can — drop it here if that matters.
const phoneEl = document.getElementById("r-phone");
if (phoneEl) addEventListener("beforeprint", () => {
  phoneEl.textContent = ["+91", "81529", "22909"].join(" ");
});
