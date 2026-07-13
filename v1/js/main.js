const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.25 }
);

document.querySelectorAll(".trace, .block").forEach((el) => io.observe(el));

const hudStage = document.getElementById("hud-stage");
const hudT = document.getElementById("hud-t");
const stages = [...document.querySelectorAll("[data-stage]")];

function updateHud() {
  const marker = window.innerHeight * 0.5;
  let current = stages[0];
  for (const stage of stages) {
    if (stage.getBoundingClientRect().top <= marker) current = stage;
  }
  hudStage.textContent = current.dataset.stage;

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const t = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
  hudT.textContent = `t = ${t}%`;
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      updateHud();
      ticking = false;
    });
  }
});

updateHud();
