const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = document.documentElement;
const body = document.body;
body.classList.add("js-enabled");

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  root.style.setProperty("--scroll-progress", `${progress}%`);
};

const updateActiveNav = () => {
  const sections = [...document.querySelectorAll("header[id], section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const current = sections
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .pop();

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", current && link.hash === `#${current.id}`);
  });
};

const handleScroll = () => {
  updateScrollProgress();
  updateActiveNav();
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", handleScroll);
handleScroll();

if (!prefersReducedMotion) {
  const pointer = {
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  };

  const paintPointerField = () => {
    pointer.x += (pointer.targetX - pointer.x) * 0.11;
    pointer.y += (pointer.targetY - pointer.y) * 0.11;

    const pctX = (pointer.x / window.innerWidth) * 100;
    const pctY = (pointer.y / window.innerHeight) * 100;
    const panX = (pctX - 50) * -0.48;
    const panY = (pctY - 50) * -0.38;

    root.style.setProperty("--mouse-x", `${pointer.x}px`);
    root.style.setProperty("--mouse-y", `${pointer.y}px`);
    root.style.setProperty("--mouse-x-pct", `${pctX}%`);
    root.style.setProperty("--mouse-y-pct", `${pctY}%`);
    root.style.setProperty("--bg-pan-x", `${panX}px`);
    root.style.setProperty("--bg-pan-y", `${panY}px`);
    root.style.setProperty("--bg-pan-x-inverse", `${-panX}px`);
    root.style.setProperty("--bg-pan-y-inverse", `${-panY}px`);
    root.style.setProperty("--aurora-angle", `${(pctX * 1.8 + pctY * 1.2) % 360}deg`);

    requestAnimationFrame(paintPointerField);
  };

  window.addEventListener("pointermove", (event) => {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
  }, { passive: true });

  window.addEventListener("resize", () => {
    pointer.targetX = Math.min(pointer.targetX, window.innerWidth);
    pointer.targetY = Math.min(pointer.targetY, window.innerHeight);
  });

  requestAnimationFrame(paintPointerField);
}

const revealSelectors = [
  ".section-header",
  ".about-text",
  ".about-card",
  ".skill-card",
  ".featured-card",
  ".chatbot-card",
  ".category-header",
  ".project-card",
  ".footer-inner"
].join(",");

const revealItems = [...document.querySelectorAll(revealSelectors)];
revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
});

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;

      if (entry.isIntersecting) {
        element.classList.add("is-visible", "was-visible");
      } else if (element.classList.contains("was-visible")) {
        element.classList.remove("is-visible");
      }
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const statNums = [...document.querySelectorAll(".stat-num[data-count]")];
const animateStat = (element) => {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = 900;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${Math.round(target * eased)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const statObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateStat(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.55 });

  statNums.forEach((stat) => statObserver.observe(stat));
} else {
  statNums.forEach((stat) => {
    stat.textContent = `${stat.dataset.count}${stat.dataset.suffix || ""}`;
  });
}

const hoverCards = [...document.querySelectorAll(".about-card, .skill-card, .featured-card, .chatbot-card, .project-card")];
hoverCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--card-x", `${x}%`);
    card.style.setProperty("--card-y", `${y}%`);

    if (!card.classList.contains("project-card") || prefersReducedMotion) return;
    const tiltX = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const tiltY = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    card.style.setProperty("--tilt-x", `${tiltX}deg`);
    card.style.setProperty("--tilt-y", `${tiltY}deg`);
  }, { passive: true });

  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--card-x");
    card.style.removeProperty("--card-y");
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
});

const profileCard = document.querySelector(".profile-card");
if (profileCard && !prefersReducedMotion) {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const profileMotion = {
    bounds: null,
    targetTiltX: 0,
    targetTiltY: 0,
    tiltX: 0,
    tiltY: 0,
    targetLift: 0,
    lift: 0,
    targetShineX: 50,
    targetShineY: 50,
    shineX: 50,
    shineY: 50
  };

  const paintProfile = () => {
    profileMotion.tiltX += (profileMotion.targetTiltX - profileMotion.tiltX) * 0.16;
    profileMotion.tiltY += (profileMotion.targetTiltY - profileMotion.tiltY) * 0.16;
    profileMotion.lift += (profileMotion.targetLift - profileMotion.lift) * 0.16;
    profileMotion.shineX += (profileMotion.targetShineX - profileMotion.shineX) * 0.14;
    profileMotion.shineY += (profileMotion.targetShineY - profileMotion.shineY) * 0.14;

    profileCard.style.setProperty("--profile-tilt-x", `${profileMotion.tiltX}deg`);
    profileCard.style.setProperty("--profile-tilt-y", `${profileMotion.tiltY}deg`);
    profileCard.style.setProperty("--profile-lift", `${profileMotion.lift}px`);
    profileCard.style.setProperty("--profile-shine-x", `${profileMotion.shineX}%`);
    profileCard.style.setProperty("--profile-shine-y", `${profileMotion.shineY}%`);

    requestAnimationFrame(paintProfile);
  };

  profileCard.addEventListener("pointerenter", () => {
    profileMotion.bounds = profileCard.getBoundingClientRect();
    profileMotion.targetLift = -5;
    profileCard.classList.add("is-interacting");
  });

  profileCard.addEventListener("pointermove", (event) => {
    const rect = profileMotion.bounds || profileCard.getBoundingClientRect();
    const localX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const localY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    profileMotion.targetTiltX = (localX - 0.5) * 8;
    profileMotion.targetTiltY = (localY - 0.5) * -6;
    profileMotion.targetLift = -5;
    profileMotion.targetShineX = localX * 100;
    profileMotion.targetShineY = localY * 100;
  }, { passive: true });

  profileCard.addEventListener("pointerleave", () => {
    profileMotion.bounds = null;
    profileMotion.targetTiltX = 0;
    profileMotion.targetTiltY = 0;
    profileMotion.targetLift = 0;
    profileMotion.targetShineX = 50;
    profileMotion.targetShineY = 50;
    profileCard.classList.remove("is-interacting");
  });

  requestAnimationFrame(paintProfile);
}
