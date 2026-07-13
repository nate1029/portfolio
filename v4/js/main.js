const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- cursor-reactive grid background ---------- */

if (canHover && !reduced) {
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  document.body.classList.add("live-bg");

  const GAP = 36;
  const SEG = 12;
  const RADIUS = 150;
  const PUSH = 26;

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

  function warp(x, y) {
    const dx = x - soft.x;
    const dy = y - soft.y;
    const d = Math.hypot(dx, dy);
    if (d > RADIUS || d === 0) return [x, y];
    const k = (1 - d / RADIUS) ** 2 * PUSH;
    return [x + (dx / d) * k, y + (dy / d) * k];
  }

  function frame() {
    soft.x += (mouse.x - soft.x) * 0.12;
    soft.y += (mouse.y - soft.y) * 0.12;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(25, 24, 19, 0.09)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= W + GAP; x += GAP) {
      ctx.beginPath();
      for (let y = 0; y <= H + SEG; y += SEG) {
        const [px, py] = warp(x, y);
        y === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    for (let y = 0; y <= H + GAP; y += GAP) {
      ctx.beginPath();
      for (let x = 0; x <= W + SEG; x += SEG) {
        const [px, py] = warp(x, y);
        x === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    if (soft.x > -100) {
      ctx.fillStyle = "#1f2de6";
      ctx.beginPath();
      ctx.arc(soft.x, soft.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(31, 45, 230, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(soft.x, soft.y, 16, 0, Math.PI * 2);
      ctx.stroke();
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
  { threshold: 0.12 }
);
document.querySelectorAll(".dept, .ticker").forEach((el) => io.observe(el));

/* ---------- project filter ---------- */

const filters = document.querySelectorAll(".filter");
const workCards = document.querySelectorAll("#work-grid .card");

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

/* ---------- card & step tilt ---------- */

if (canHover && !reduced) {
  document.querySelectorAll(".card, .step").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-2px)`;
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
