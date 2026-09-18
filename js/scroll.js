/* ============================================================
   SCROLL — nav polarity swap
   ============================================================ */

/* ---- Nav flips with the band underneath it ---------------- */

(function initPolaritySwap() {
  const nav = document.getElementById("nav");
  const inkBands = document.querySelectorAll(".band--ink, .footer");
  if (!nav || !inkBands.length) return;

  if (typeof MOTION_OK !== "undefined" && MOTION_OK && window.ScrollTrigger) {
    inkBands.forEach((band) => {
      ScrollTrigger.create({
        trigger: band,
        start: "top 64px",
        end: "bottom 64px",
        onToggle(self) {
          nav.classList.toggle("on-ink", self.isActive);
        },
      });
    });
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries.some((e) => e.isIntersecting);
        nav.classList.toggle("on-ink", active);
      },
      { rootMargin: "-64px 0px -85% 0px" }
    );
    inkBands.forEach((b) => observer.observe(b));
  }
})();

