/* ============================================================
   CURSOR & MAGNETIC INTERACTIONS
   Desktop fine pointers only.
   - High-resolution live negative / x-ray text inversion with mix-blend-mode: difference
   - Perfectly smooth antialiased circular boundary (downsampled from 48px vector base)
   - Ultra-responsive quickTo interpolation (zero perceived lag)
   - Subtle magnetic attraction on interactive targets (5–8px)
   - Refined press feedback and window enter/leave visibility
   ============================================================ */

(function initCursorSystem() {
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (!fine || typeof MOTION_OK === "undefined" || !MOTION_OK) return;

  const blend = document.getElementById("cursor-blend");
  const label = document.getElementById("cursor-label");
  if (!blend || !label) return;

  // Ultra-responsive quickTo interpolators for instant tracking
  const bX = gsap.quickTo(blend, "x", { duration: 0.04, ease: "power3.out" });
  const bY = gsap.quickTo(blend, "y", { duration: 0.04, ease: "power3.out" });
  const lX = gsap.quickTo(label, "x", { duration: 0.14, ease: "power3.out" });
  const lY = gsap.quickTo(label, "y", { duration: 0.14, ease: "power3.out" });

  // Base scale corresponds to 10px dot from 48px base element
  const SCALE_IDLE = 0.2083;
  const SCALE_TEXT = 1.0;
  const SCALE_HERO = 1.25;
  const SCALE_BUTTON = 0.75;

  let isHoveringText = false;
  let isHoveringHero = false;
  let isHoveringButton = false;
  let isPressed = false;
  let isCursorVisible = false;

  const updateCursorScale = () => {
    let targetScale = SCALE_IDLE;
    if (isHoveringHero) targetScale = SCALE_HERO;
    else if (isHoveringText) targetScale = SCALE_TEXT;
    else if (isHoveringButton) targetScale = SCALE_BUTTON;

    if (isPressed) targetScale *= 0.85;

    gsap.to(blend, {
      scale: targetScale,
      duration: 0.22,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  // Track mouse coordinates
  window.addEventListener(
    "pointermove",
    (e) => {
      if (!isCursorVisible) {
        isCursorVisible = true;
        blend.classList.add("is-visible");
      }
      bX(e.clientX);
      bY(e.clientY);
      lX(e.clientX);
      lY(e.clientY);
    },
    { passive: true }
  );

  // Window enter / leave handling
  document.addEventListener("mouseleave", () => {
    isCursorVisible = false;
    blend.classList.remove("is-visible");
    label.classList.remove("is-on");
  });

  document.addEventListener("mouseenter", () => {
    isCursorVisible = true;
    blend.classList.add("is-visible");
  });

  // Pointer down/up press compression
  window.addEventListener("pointerdown", () => {
    isPressed = true;
    updateCursorScale();
  });

  window.addEventListener("pointerup", () => {
    isPressed = false;
    updateCursorScale();
  });

  // ---- 1. Text Inversion Spotlight Effect ----
  // Negative / x-ray lens over typography
  const textSelectors = [
    ".hero-name",
    ".hero-name .char",
    ".hero-role",
    ".hero-badge",
    "h1, h2, h3, h4, h5, h6",
    ".title",
    ".subhead",
    ".eyebrow",
    ".about-lede",
    ".prose",
    ".stat-num",
    ".stat-label",
    ".method-title",
    ".method-desc",
    ".footer-reach",
    ".footer-name",
    ".footer-blurb",
    ".nav-mark",
    ".nav-links a",
  ].join(", ");

  const textElements = document.querySelectorAll(textSelectors);
  textElements.forEach((el) => {
    el.addEventListener("pointerenter", () => {
      if (el.closest(".hero-name")) {
        isHoveringHero = true;
      } else {
        isHoveringText = true;
      }
      updateCursorScale();
    });
    el.addEventListener("pointerleave", () => {
      isHoveringHero = false;
      isHoveringText = false;
      updateCursorScale();
    });
  });

  // ---- 2. Data-Cursor Editorial Labels ----
  const labeledElements = document.querySelectorAll("[data-cursor]");
  labeledElements.forEach((el) => {
    el.addEventListener("pointerenter", () => {
      label.textContent = el.dataset.cursor;
      label.classList.add("is-on");
      isHoveringButton = true;
      updateCursorScale();
    });
    el.addEventListener("pointerleave", () => {
      label.classList.remove("is-on");
      isHoveringButton = false;
      updateCursorScale();
    });
  });

  // ---- 3. Buttons & Action Elements ----
  const actionElements = document.querySelectorAll("a, button, [role='button'], input[type='submit']");
  actionElements.forEach((el) => {
    if (!el.hasAttribute("data-cursor")) {
      el.addEventListener("pointerenter", () => {
        isHoveringButton = true;
        updateCursorScale();
      });
      el.addEventListener("pointerleave", () => {
        isHoveringButton = false;
        updateCursorScale();
      });
    }
  });

  // ---- 4. Subtle Magnetic Interactions (5–8px max) ----
  const magneticSelectors = [
    ".btn",
    ".nav-mark",
    ".nav-links a",
    ".to-top",
    ".stack-tile",
    ".footer-reach",
    ".footer-social a",
    ".smm-media img",
    ".method-card",
    ".cc-carousel-media",
    ".ig-post-ui--single",
  ].join(", ");

  const magneticElements = document.querySelectorAll(magneticSelectors);
  magneticElements.forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);

      // Subtle displacement capped at 6-8px
      const pullX = Math.max(-8, Math.min(8, relX * 0.22));
      const pullY = Math.max(-8, Math.min(8, relY * 0.22));

      gsap.to(el, {
        x: pullX,
        y: pullY,
        duration: 0.18,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    el.addEventListener("pointerleave", () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
    });
  });
})();

