const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const root = document.documentElement;
const body = document.body;
body.classList.add("js-enabled");

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

const heroName = document.querySelector(".hero-name");
if (heroName) {
  const showHeroName = () => {
    heroName.classList.add("is-present");
  };

  const hideHeroName = () => {
    heroName.classList.remove("is-present", "is-active", "has-interacted");
  };

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
