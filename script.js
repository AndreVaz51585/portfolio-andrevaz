const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = document.documentElement;
const body = document.body;
body.classList.add("js-enabled");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const supportsFineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const sections = [...document.querySelectorAll("header[id], section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a")];

let scrollTicking = false;

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  root.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const updateActiveNav = () => {
  const current = sections
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .pop();

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", current && link.hash === `#${current.id}`);
  });
};

const handleScroll = () => {
  if (scrollTicking) return;

  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollTicking = false;
    updateScrollProgress();
    updateActiveNav();
  });
};

const handleResize = () => {
  updateScrollProgress();
  updateActiveNav();
};

window.addEventListener("scroll", handleScroll, { passive: true });
window.addEventListener("resize", handleResize);
handleResize();

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

const majorRevealItems = [...document.querySelectorAll("#featured .featured-card, #major-projects .chatbot-card")];
majorRevealItems.forEach((item, index) => {
  item.classList.add("major-reveal");
  item.style.setProperty("--major-index", index);
  item.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 110}ms`);
});

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;

      if (entry.isIntersecting) {
        element.classList.add("is-visible", "was-visible");
        revealObserver.unobserve(element);
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
if (!prefersReducedMotion && supportsFineHover) hoverCards.forEach((card) => {
  let rect = null;
  let pointerX = 50;
  let pointerY = 50;
  let cardTicking = false;

  const paintCard = () => {
    cardTicking = false;
    card.style.setProperty("--card-x", `${pointerX}%`);
    card.style.setProperty("--card-y", `${pointerY}%`);

    if (!card.classList.contains("project-card")) return;
    card.style.setProperty("--tilt-x", `${(pointerX / 100 - 0.5) * 8}deg`);
    card.style.setProperty("--tilt-y", `${(pointerY / 100 - 0.5) * -8}deg`);
  };

  card.addEventListener("pointerenter", (event) => {
    rect = card.getBoundingClientRect();
    pointerX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    pointerY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
    paintCard();
  }, { passive: true });

  card.addEventListener("pointermove", (event) => {
    if (!rect) rect = card.getBoundingClientRect();
    pointerX = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    pointerY = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100);

    if (cardTicking) return;
    cardTicking = true;
    requestAnimationFrame(paintCard);
  }, { passive: true });

  card.addEventListener("pointerleave", () => {
    rect = null;
    card.style.removeProperty("--card-x");
    card.style.removeProperty("--card-y");
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
});

const heroName = document.querySelector(".hero-name");
if (heroName) {
  const setHeroNameMotion = (event) => {
    const rect = heroName.getBoundingClientRect();
    const localX = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const localY = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    heroName.style.setProperty("--hero-name-x", `${localX * 100}%`);
    heroName.style.setProperty("--hero-name-y", `${localY * 100}%`);
    heroName.style.setProperty("--name-lift", `${(0.5 - localY) * 8}px`);
    heroName.style.setProperty("--name-tilt-x", `${(0.5 - localY) * 10}deg`);
    heroName.style.setProperty("--name-tilt-y", `${(localX - 0.5) * 12}deg`);
  };

  const resetHeroNameMotion = () => {
    heroName.classList.remove("is-active");
    heroName.style.setProperty("--name-lift", "0px");
    heroName.style.setProperty("--name-tilt-x", "0deg");
    heroName.style.setProperty("--name-tilt-y", "0deg");
  };

  const showHeroName = () => {
    heroName.classList.add("is-present");
  };

  const hideHeroName = () => {
    heroName.classList.remove("is-present", "is-active", "has-interacted");
    resetHeroNameMotion();
  };

  if (!prefersReducedMotion && supportsFineHover) {
    heroName.addEventListener("pointerenter", (event) => {
      heroName.classList.add("is-active", "has-interacted");
      setHeroNameMotion(event);
    }, { passive: true });

    heroName.addEventListener("pointermove", setHeroNameMotion, { passive: true });
    heroName.addEventListener("pointerleave", resetHeroNameMotion, { passive: true });
  }

  const heroSection = document.querySelector(".hero");
  if ("IntersectionObserver" in window && heroSection) {
    const heroNameObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showHeroName();
        } else {
          hideHeroName();
        }
      });
    }, { threshold: 0.38 });

    heroNameObserver.observe(heroSection);
  } else {
    showHeroName();
  }
}

const profileCard = document.querySelector(".profile-card");
if (profileCard && !prefersReducedMotion && supportsFineHover) {
  const profileMotion = {
    bounds: null,
    raf: null,
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

  const needsProfileFrame = () => (
    Math.abs(profileMotion.targetTiltX - profileMotion.tiltX) > 0.01 ||
    Math.abs(profileMotion.targetTiltY - profileMotion.tiltY) > 0.01 ||
    Math.abs(profileMotion.targetLift - profileMotion.lift) > 0.01 ||
    Math.abs(profileMotion.targetShineX - profileMotion.shineX) > 0.1 ||
    Math.abs(profileMotion.targetShineY - profileMotion.shineY) > 0.1
  );

  const paintProfile = () => {
    profileMotion.raf = null;
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

    if (needsProfileFrame()) {
      profileMotion.raf = requestAnimationFrame(paintProfile);
    }
  };

  const queueProfilePaint = () => {
    if (!profileMotion.raf) {
      profileMotion.raf = requestAnimationFrame(paintProfile);
    }
  };

  profileCard.addEventListener("pointerenter", () => {
    profileMotion.bounds = profileCard.getBoundingClientRect();
    profileMotion.targetLift = -5;
    profileCard.classList.add("is-interacting");
    queueProfilePaint();
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
    queueProfilePaint();
  }, { passive: true });

  profileCard.addEventListener("pointerleave", () => {
    profileMotion.bounds = null;
    profileMotion.targetTiltX = 0;
    profileMotion.targetTiltY = 0;
    profileMotion.targetLift = 0;
    profileMotion.targetShineX = 50;
    profileMotion.targetShineY = 50;
    profileCard.classList.remove("is-interacting");
    queueProfilePaint();
  });
}
