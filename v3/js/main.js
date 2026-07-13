const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- cycling headline word ---------- */

const cycleEl = document.getElementById("cycle");
const words = ["CIRCUITS", "APPS", "STORES", "SYSTEMS", "AUDIENCES"];
let wordIdx = 0;

setInterval(() => {
  wordIdx = (wordIdx + 1) % words.length;
  if (reduced) {
    cycleEl.textContent = words[wordIdx];
    return;
  }
  cycleEl.classList.add("swap");
  setTimeout(() => {
    cycleEl.textContent = words[wordIdx];
    cycleEl.classList.remove("swap");
  }, 180);
}, 2200);

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

/* ---------- card tilt ---------- */

const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canHover && !reduced) {
  document.querySelectorAll(".card").forEach((card) => {
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
