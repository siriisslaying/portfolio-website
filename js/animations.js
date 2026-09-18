/* ============================================================
   ANIMATIONS — hero entrance, coordinated reveals, counters, subnav
   All gated behind MOTION_OK. Without motion, content is
   immediately visible and counters render final values.
   ============================================================ */

(function initAnimations() {
  // Static fallback: print final stat values, done.
  if (typeof MOTION_OK === "undefined" || !MOTION_OK) {
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("[data-count]").forEach((el) => {
        el.textContent = el.dataset.count + (el.dataset.suffix || "");
      });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Split hero name lines into chars (aria handled in HTML)
  document.querySelectorAll(".hero-name .line").forEach((line) => {
    line.innerHTML = line.textContent
      .split("")
      .map((c) =>
        `<span class="char" style="transform:translateY(110%)">${c === " " ? "&nbsp;" : c}</span>`
      )
      .join("");
  });

  // Hero entrance — waits for the loader curtain
  const playHeroEntrance = () => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(".hero-name .char", {
      y: 0,
      duration: 0.75,
      stagger: 0.02,
    }).to(
      ".hero .will-reveal",
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
      "-=0.35"
    );

    tl.eventCallback("onComplete", () => {
      document.dispatchEvent(new CustomEvent("hero:done"));

      // Letter hover — smooth, fluid lift on each character
      document.querySelectorAll(".hero-name .char").forEach((ch) => {
        if (!ch.textContent.trim()) return; // skip spaces
        ch.addEventListener("mouseenter", () => {
          gsap.to(ch, {
            y: "-0.08em",
            scale: 1.08,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
        ch.addEventListener("mouseleave", () => {
          gsap.to(ch, {
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      });
    });
  };

  if (window.__siteReady) {
    playHeroEntrance();
  } else {
    document.addEventListener("site:ready", playHeroEntrance, { once: true });
  }

  // Unified Section reveals — deduplicated & coordinated entrance
  const REVEAL_SELECTORS = [
    ".band > .band-head",
    ".will-reveal",
    ".stat",
    ".method-card",
    ".ai-workflow",
    ".stack-tile",
    ".contact-grid",
  ].join(", ");

  const rawElements = document.querySelectorAll(REVEAL_SELECTORS);
  const targetsSet = new Set();
  rawElements.forEach((el) => {
    // Exclude hero elements from scroll batch (handled by playHeroEntrance)
    if (!el.closest(".hero")) {
      targetsSet.add(el);
    }
  });

  const revealTargets = Array.from(targetsSet);
  gsap.set(revealTargets, { opacity: 0, y: 22 });

  ScrollTrigger.batch(revealTargets, {
    start: "top 88%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.05,
        ease: "power3.out",
        overwrite: "auto",
      });
    },
  });

  // Stat counters — precision counting with smooth formatting
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const isFloat = String(el.dataset.count).includes(".");
    const state = { n: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter() {
        gsap.to(state, {
          n: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate() {
            el.textContent = isFloat ? state.n.toFixed(2) + suffix : Math.round(state.n) + suffix;
          },
        });
      },
    });
  });
})();
