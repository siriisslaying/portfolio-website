/* ============================================================
   MAIN — motion gate, Lenis, loader, nav, tabs, FAQ, contact form
   ============================================================ */

var MOTION_OK =
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  typeof gsap !== "undefined";

var DESKTOP = window.matchMedia("(min-width: 992px) and (pointer: fine)").matches;

if (MOTION_OK) document.documentElement.classList.add("motion-ok");

/* ---- Lenis smooth scroll (desktop only) ------------------- */

let lenis = null;
if (MOTION_OK && DESKTOP && typeof Lenis !== "undefined") {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on("scroll", () => {
    if (window.ScrollTrigger) ScrollTrigger.update();
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor links route through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64 });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

/* ---- Loader — split curtain ------------------------------ */

(function initLoader() {
  const loader = document.getElementById("loader");
  if (!loader) {
    window.__siteReady = true;
    document.dispatchEvent(new CustomEvent("site:ready"));
    return;
  }

  const dismiss = () => {
    if (window.__siteReady) return;
    window.__siteReady = true;
    loader.classList.add("is-done");
    document.body.style.overflow = "";
    loader.remove();
    document.dispatchEvent(new CustomEvent("site:ready"));
  };

  // Fail-safe auto dismiss after 1.2s max so screen is NEVER stuck
  const failsafe = setTimeout(dismiss, 1200);

  if (!MOTION_OK || typeof gsap === "undefined") {
    clearTimeout(failsafe);
    dismiss();
    return;
  }

  document.body.style.overflow = "hidden";

  try {
    const tl = gsap.timeline({
      onComplete() {
        clearTimeout(failsafe);
        dismiss();
      },
    });

    tl.to(".loader-top", {
      yPercent: -100,
      duration: 0.8,
      ease: "power4.inOut",
      delay: 0.3,
    })
    .to(".loader-bottom", {
      yPercent: 100,
      duration: 0.8,
      ease: "power4.inOut",
    }, "<");
  } catch (err) {
    clearTimeout(failsafe);
    dismiss();
  }
})();

/* ---- Nav scroll — intelligent hide/reveal + glass transition ---- */

(function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateNav = () => {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;

    // Glass backdrop activation
    if (currentScrollY > 20) {
      nav.classList.add("is-scrolled");
    } else {
      nav.classList.remove("is-scrolled");
      nav.classList.remove("nav--hidden");
    }

    // Directional hide / reveal logic
    if (currentScrollY > 90) {
      if (deltaY > 8) {
        // Scrolling down -> hide smoothly
        nav.classList.add("nav--hidden");
      } else if (deltaY < -6) {
        // Scrolling up -> reveal smoothly
        nav.classList.remove("nav--hidden");
      }
    } else {
      nav.classList.remove("nav--hidden");
    }

    lastScrollY = Math.max(0, currentScrollY);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNav);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateNav();
})();





/* ---- Back to top ------------------------------------------ */

(function initToTop() {
  const btn = document.getElementById("to-top");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("is-visible", window.scrollY > 600),
    { passive: true }
  );

  btn.addEventListener("click", () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
})();

/* ---- Contact form → pre-filled Gmail compose -------------- */

(function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const status = document.getElementById("form-status");
  const TO = "nandini.bhattacharyya@hotmail.com";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.elements["name"]?.value.trim();
    const email = form.elements["email"]?.value.trim();
    const msg = form.elements["message"]?.value.trim();

    if (!name || !email || !msg) {
      if (status) status.textContent = "Please fill in all required fields.";
      return;
    }

    const sub = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`);
    const mailto = `https://mail.google.com/mail/?view=cm&fs=1&to=${TO}&su=${sub}&body=${body}`;

    if (status) {
      status.style.color = "var(--accent)";
      status.textContent = "Opening Gmail compose window...";
    }

    window.open(mailto, "_blank", "noopener,noreferrer");
    form.reset();
  });
})();

/* ---- Instagram Carousel Post Interactive Controller -------- */

(function initInstagramCarousels() {
  const carousels = document.querySelectorAll(".cc-carousel-media");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".ig-slide-track");
    const slides = carousel.querySelectorAll(".ig-slide");
    const dots = carousel.querySelectorAll(".ig-dot");
    const prevBtn = carousel.querySelector(".ig-nav-btn--prev");
    const nextBtn = carousel.querySelector(".ig-nav-btn--next");
    if (!track || !slides.length) return;

    let currentIndex = 0;
    const total = slides.length;

    const goTo = (index) => {
      currentIndex = (index + total) % total;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentIndex);
      });
      slides.forEach((slide, i) => {
        slide.classList.toggle("ig-slide--active", i === currentIndex);
      });
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(currentIndex + 1);
      });
    }

    // Interactive dot clicks
    dots.forEach((dot, i) => {
      dot.style.cursor = "pointer";
      dot.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(i);
      });
    });

    // Touch & swipe gestures
    let startX = 0;
    let isDown = false;

    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener("touchend", (e) => {
      const diffX = e.changedTouches[0].clientX - startX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
      }
    }, { passive: true });

    // Pointer / mouse drag swipe
    track.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      isDown = true;
    });

    window.addEventListener("mouseup", (e) => {
      if (!isDown) return;
      isDown = false;
      const diffX = e.clientX - startX;
      if (Math.abs(diffX) > 40) {
        if (diffX < 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
      }
    });

    // Subtle auto-peek animation on first view
    if (typeof ScrollTrigger !== "undefined" && typeof MOTION_OK !== "undefined" && MOTION_OK) {
      ScrollTrigger.create({
        trigger: carousel,
        start: "top 75%",
        once: true,
        onEnter() {
          gsap.to(track, {
            x: -25,
            duration: 0.35,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
            delay: 0.5,
          });
        },
      });
    }
  });
})();

/* ---- Instagram Reels Video Controller ---------------------- */

(function initInstagramReels() {
  const reelCards = document.querySelectorAll(".ig-reel-card");
  if (!reelCards.length) return;

  reelCards.forEach((card) => {
    const video = card.querySelector(".ig-reel-video");
    const soundBtn = card.querySelector(".ig-reel-sound-btn");
    const iconMuted = card.querySelector(".icon-muted");
    const iconUnmuted = card.querySelector(".icon-unmuted");
    const progressBar = card.querySelector(".ig-reel-progress-bar");
    if (!video) return;

    // Toggle play/pause on viewport click
    const togglePlay = () => {
      if (video.paused) {
        // Pause other reels first
        reelCards.forEach((otherCard) => {
          const otherVideo = otherCard.querySelector(".ig-reel-video");
          if (otherVideo && otherVideo !== video && !otherVideo.paused) {
            otherVideo.pause();
            otherCard.classList.remove("is-playing");
          }
        });

        video.play().then(() => {
          card.classList.add("is-playing");
        }).catch(() => {});
      } else {
        video.pause();
        card.classList.remove("is-playing");
      }
    };

    const viewport = card.querySelector(".ig-reel-viewport");
    if (viewport) {
      viewport.addEventListener("click", (e) => {
        if (e.target.closest(".ig-reel-sound-btn")) return;
        togglePlay();
      });
    }

    // Toggle sound
    if (soundBtn) {
      soundBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        if (iconMuted && iconUnmuted) {
          iconMuted.classList.toggle("is-hidden", !video.muted);
          iconUnmuted.classList.toggle("is-hidden", video.muted);
        }
      });
    }

    // Update progress bar
    video.addEventListener("timeupdate", () => {
      if (progressBar && video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${pct}%`;
      }
    });

    video.addEventListener("play", () => card.classList.add("is-playing"));
    video.addEventListener("pause", () => card.classList.remove("is-playing"));
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  });
})();

