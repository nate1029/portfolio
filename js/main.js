const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- theme toggle ---------- */

const rootEl = document.documentElement;
const readCSS = (v, fb) =>
  getComputedStyle(document.body).getPropertyValue(v).trim() || fb;
let gridStroke = readCSS("--grid-line", "rgba(25, 24, 19, 0.09)");
let warpDir = parseFloat(readCSS("--warp-dir", "1")) || 1;

const themeBtn = document.getElementById("theme-toggle");
if (themeBtn) {
  const label = () => (rootEl.dataset.theme === "dark" ? "light" : "dark");
  themeBtn.textContent = label();
  themeBtn.addEventListener("click", () => {
    rootEl.dataset.theme = rootEl.dataset.theme === "dark" ? "light" : "dark";
    localStorage.theme = rootEl.dataset.theme;
    themeBtn.textContent = label();
    gridStroke = readCSS("--grid-line", "rgba(25, 24, 19, 0.09)");
    warpDir = parseFloat(readCSS("--warp-dir", "1")) || 1;
  });
}

/* ---------- cursor-reactive grid background ---------- */

if (canHover && !reduced) {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  document.body.classList.add("live-bg");

  const GAP = 36;
  const SEG = 9;
  const RADIUS = 160;
  const PUSH = 24;

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
    ctx.strokeStyle = gridStroke;
    ctx.lineWidth = 1;

    for (let x = 0; x <= W + GAP; x += GAP) {
      const pts = [];
      for (let y = 0; y <= H + SEG; y += SEG) pts.push(warpX(x, y));
      smoothLine(pts);
    }
    for (let y = 0; y <= H + GAP; y += GAP) {
      const pts = [];
      for (let x = 0; x <= W + SEG; x += SEG) pts.push(warpX(x, y));
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

/* ---------- draggable cover stickers ---------- */

if (canHover) {
  document.querySelectorAll(".cover .sticker").forEach((st) => {
    let startX, startY, origX, origY, dragging = false;
    st.addEventListener("pointerdown", (e) => {
      dragging = true;
      st.setPointerCapture(e.pointerId);
      const r = st.getBoundingClientRect();
      const pr = st.parentElement.getBoundingClientRect();
      origX = r.left - pr.left;
      origY = r.top - pr.top;
      startX = e.clientX;
      startY = e.clientY;
      st.style.left = origX + "px";
      st.style.top = origY + "px";
      st.style.right = "auto";
      st.style.zIndex = 6;
    });
    st.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      st.style.left = origX + (e.clientX - startX) + "px";
      st.style.top = origY + (e.clientY - startY) + "px";
    });
    st.addEventListener("pointerup", () => { dragging = false; st.style.zIndex = 5; });
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
