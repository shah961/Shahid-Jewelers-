/* ==========================================================================
   SHAHID JEWELLERS — main.js
   Shared navigation, motion, ticker and hero canvas logic for every page.
   Loaded with `defer`; GSAP/ScrollTrigger/Three.js are loaded from CDN
   before this file and are optional — every block below degrades safely
   if a library failed to load or the user prefers reduced motion.
   ========================================================================== */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasThree = typeof window.THREE !== "undefined";

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------------------------------ */
  /*  Mobile navigation                                                  */
  /* ------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        navToggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Scroll restoration — always land at the top on a fresh navigation  */
  /* ------------------------------------------------------------------ */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  /* ------------------------------------------------------------------ */
  /*  Live gold/silver rate ticker + calculator seed values              */
  /*  In production this reads from the store's pricing feed; here it   */
  /*  renders the last manually-confirmed desk rate plus a timestamp so  */
  /*  the page never fails to render a number.                          */
  /* ------------------------------------------------------------------ */
  const RATES = {
    updated: "13 September 2026, 11:00 AM PKT",
    perTola: { k24: 358900, k22: 329150, k21: 314040, k18: 269175 },
    perGram: { k24: 30767, k22: 28213, k21: 26932, k18: 23076 },
  };
  window.SHAHID_RATES = RATES;

  const tickerTrack = document.querySelector(".rate-ticker__track");
  if (tickerTrack) {
    const items = [
      `<span class="rate-ticker__item"><strong>24K</strong> Rs ${RATES.perTola.k24.toLocaleString("en-PK")} / tola</span>`,
      `<span class="rate-ticker__item"><strong>22K</strong> Rs ${RATES.perTola.k22.toLocaleString("en-PK")} / tola</span>`,
      `<span class="rate-ticker__item"><strong>21K</strong> Rs ${RATES.perTola.k21.toLocaleString("en-PK")} / tola</span>`,
      `<span class="rate-ticker__item"><strong>24K</strong> Rs ${RATES.perGram.k24.toLocaleString("en-PK")} / gram</span>`,
      `<span class="rate-ticker__item rate-ticker__stamp">Updated ${RATES.updated}</span>`,
    ].join("");
    tickerTrack.innerHTML = items + items; // duplicated for seamless marquee loop
  }

  /* ------------------------------------------------------------------ */
  /*  GSAP entrance + scroll reveals — one orchestrated moment per view  */
  /* ------------------------------------------------------------------ */
  if (hasGSAP && !prefersReducedMotion) {
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    const heroBadge = document.querySelector(".hero__badge, .page-hero__crumbs");
    const heroHeading = document.querySelector(".hero h1, .page-hero h1");
    const heroLede = document.querySelector(".hero__lede, .page-hero p");
    const heroActions = document.querySelector(".hero__actions");
    const heroStats = document.querySelector(".hero__stats");

    if (heroBadge) heroTimeline.from(heroBadge, { y: 16, opacity: 0, duration: 0.7 });
    if (heroHeading) heroTimeline.from(heroHeading, { y: 34, opacity: 0, duration: 0.9 }, "-=0.4");
    if (heroLede) heroTimeline.from(heroLede, { y: 24, opacity: 0, duration: 0.8 }, "-=0.55");
    if (heroActions) heroTimeline.from(heroActions.children, { y: 18, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.5");
    if (heroStats) heroTimeline.from(heroStats, { y: 18, opacity: 0, duration: 0.7 }, "-=0.4");

    // Section reveals: each [data-reveal] group animates once, as a group,
    // when it enters the viewport — a single deliberate moment, not a
    // per-card scatter of fades.
    document.querySelectorAll("[data-reveal]").forEach((group) => {
      const targets = group.querySelectorAll("[data-reveal-item]");
      if (!targets.length) return;
      gsap.set(targets, { y: 28, opacity: 0 });
      ScrollTrigger.create({
        trigger: group,
        start: "top 78%",
        once: true,
        onEnter: () => {
          gsap.to(targets, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.09 });
        },
      });
    });
  } else {
    // No GSAP or reduced motion: make sure reveal targets are simply visible.
    document.querySelectorAll("[data-reveal-item]").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Magnetic buttons — subtle pull toward the cursor on primary CTAs   */
  /* ------------------------------------------------------------------ */
  if (!prefersReducedMotion && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll(".btn-gold, .wa-float").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });

    /* Custom cursor follower */
    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    document.body.append(dot, ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        ring.style.width = "50px";
        ring.style.height = "50px";
        ring.style.borderColor = "var(--gold-bright)";
      });
      el.addEventListener("mouseleave", () => {
        ring.style.width = "34px";
        ring.style.height = "34px";
        ring.style.borderColor = "var(--gold)";
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Three.js hero canvas — a slow-turning faceted gold ring rendered   */
  /*  from procedural geometry (no external model download, so it never */
  /*  blocks LCP). Lazy-initialised via IntersectionObserver + idle time.*/
  /* ------------------------------------------------------------------ */
  const canvas = document.getElementById("hero-canvas");

  function initHeroScene() {
    if (!hasThree || !canvas || prefersReducedMotion) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const key = new THREE.PointLight(0xE6CA65, 18, 40);
    key.position.set(4, 3, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x2fae8f, 10, 40);
    rim.position.set(-5, -2, -3);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0x201a08, 1.1));

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 1,
      roughness: 0.22,
      emissive: 0x3a2a05,
      emissiveIntensity: 0.15,
    });

    const ringGroup = new THREE.Group();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.42, 64, 128), goldMaterial);
    ringGroup.add(torus);

    // Small faceted "gem" accents orbiting the band
    const gemMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a6a54,
      metalness: 0.3,
      roughness: 0.05,
      emissive: 0x0a6a54,
      emissiveIntensity: 0.4,
    });
    for (let i = 0; i < 5; i++) {
      const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), gemMaterial);
      const angle = (i / 5) * Math.PI * 2;
      gem.position.set(Math.cos(angle) * 1.7, Math.sin(angle) * 1.7, 0.42);
      ringGroup.add(gem);
    }

    ringGroup.rotation.x = 1.15;
    scene.add(ringGroup);

    // Slow drifting particle field for depth
    const particleCount = 160;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xE6CA65, size: 0.02, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let raf;
    let visible = true;
    const clock = new THREE.Clock();

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    window.addEventListener("resize", resize);

    function tick() {
      if (visible) {
        const t = clock.getElapsedTime();
        ringGroup.rotation.z = t * 0.18;
        ringGroup.rotation.y = Math.sin(t * 0.25) * 0.25;
        particles.rotation.y = t * 0.02;
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    canvas.classList.add("is-ready");

    // Pause rendering when the hero scrolls off-screen to save battery/CPU.
    const io = new IntersectionObserver(
      (entries) => { visible = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    io.observe(canvas);

    document.addEventListener("visibilitychange", () => {
      visible = !document.hidden && visible;
    });
  }

  if (canvas) {
    // Defer 3D init until the browser is idle so it never competes with
    // first paint / LCP of the text content sitting above it.
    const start = () => initHeroScene();
    if ("requestIdleCallback" in window) {
      requestIdleCallback(start, { timeout: 1500 });
    } else {
      setTimeout(start, 300);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  WhatsApp deep-link helper — used by CTA buttons across the site    */
  /* ------------------------------------------------------------------ */
  window.shahidWhatsApp = function (message) {
    const phone = "92912213876"; // +92-91-2213876, WhatsApp-formatted (no +, no dashes)
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message || "Assalam-o-Alaikum, I would like to inquire about your jewellery collection.")}`;
    window.open(url, "_blank", "noopener");
  };
  document.querySelectorAll("[data-wa-message]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.shahidWhatsApp(el.getAttribute("data-wa-message"));
    });
  });

  /* ------------------------------------------------------------------ */
  /*  Current year in footer                                            */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
