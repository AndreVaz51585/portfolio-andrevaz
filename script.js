const root = document.documentElement;
const body = document.body;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

body.classList.add("js-enabled");

const intro = document.querySelector(".intro-screen");
const finishIntro = () => window.setTimeout(() => {
  intro?.classList.add("is-done");
  body.classList.add("hero-ready");
}, reducedMotion ? 0 : 1050);
if (document.readyState === "complete") finishIntro();
else window.addEventListener("load", finishIntro, { once: true });

const kineticNames = [...document.querySelectorAll(".kinetic-name")];
kineticNames.forEach((word) => {
  const label = word.textContent;
  word.textContent = "";
  [...label].forEach((character, index) => {
    const span = document.createElement("span");
    span.className = "name-char";
    span.style.setProperty("--char-index", index);
    span.textContent = character;
    word.append(span);
  });
});

if (finePointer && !reducedMotion) {
  const setNameState = (active) => kineticNames.forEach((word) => word.classList.toggle("is-active", active));
  kineticNames.forEach((word) => {
    word.addEventListener("pointerenter", () => setNameState(true));
    word.addEventListener("pointerleave", (event) => {
      if (!kineticNames.some((item) => item === event.relatedTarget || item.contains(event.relatedTarget))) setNameState(false);
    });
  });
}

const signalWord = document.querySelector(".signal-word");
if (signalWord && !reducedMotion) {
  const words = ["REASON", "DESIGN", "DEFEND"];
  let signalIndex = 0;
  window.setInterval(() => {
    signalWord.classList.add("is-changing");
    window.setTimeout(() => {
      signalIndex = (signalIndex + 1) % words.length;
      signalWord.textContent = words[signalIndex];
      signalWord.classList.remove("is-changing");
    }, 230);
  }, 2100);
}

const nav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".nav-center a")];
const trackedSections = [...document.querySelectorAll("header[id], main section[id]")];
const manifesto = document.querySelector(".manifesto");
const manifestoLines = [...document.querySelectorAll(".manifesto-lines p")];
const projectStory = document.querySelector(".project-story");
const projectScenes = [...document.querySelectorAll(".project-scene")];
const projectDots = [...document.querySelectorAll(".project-dots i")];
const projectCounter = document.querySelector(".project-counter");
const experienceStory = document.querySelector(".experience-story");
const experienceScenes = [...document.querySelectorAll(".experience-scene")];
const experienceStage = document.querySelector(".experience-stage");
const journeySteps = [...document.querySelectorAll("[data-journey]")];
const journeyNow = document.querySelector(".journey-now");
const heroTitle = document.querySelector(".hero-title-wrap");
const heroSignal = document.querySelector(".hero-signal");

if (heroSignal && finePointer && !reducedMotion) {
  heroSignal.addEventListener("pointerenter", () => heroSignal.classList.add("is-engaged"));
  heroSignal.addEventListener("pointermove", (event) => {
    const rect = heroSignal.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    heroSignal.style.setProperty("--signal-x", x.toFixed(3));
    heroSignal.style.setProperty("--signal-y", y.toFixed(3));
  });
  heroSignal.addEventListener("pointerleave", () => {
    heroSignal.classList.remove("is-engaged");
    heroSignal.style.setProperty("--signal-x", "0");
    heroSignal.style.setProperty("--signal-y", "0");
  });
}
let lastScrollY = window.scrollY;
let rafPending = false;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const sectionProgress = (element) => {
  if (!element) return 0;
  const rect = element.getBoundingClientRect();
  const distance = Math.max(element.offsetHeight - window.innerHeight, 1);
  return clamp(-rect.top / distance);
};

const updateManifesto = () => {
  const progress = sectionProgress(manifesto);
  const position = progress * Math.max(manifestoLines.length - 1, 1);
  const active = Math.round(position);
  manifestoLines.forEach((line, index) => {
    const delta = index - position;
    const distance = Math.abs(delta);
    const opacity = 1 - clamp((distance - .18) / .64);
    const translate = delta * 72;
    const scale = 1 - Math.min(distance, 1) * .045;
    line.style.opacity = opacity.toFixed(3);
    line.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    line.classList.toggle("is-active", index === active);
  });
  manifesto?.style.setProperty("--chapter", `${((active + 1) / manifestoLines.length) * 100}%`);
  const count = document.querySelector(".chapter-count span");
  if (count) count.textContent = String(active + 1).padStart(2, "0");
};

let activeProject = -1;
const updateProjects = () => {
  if (!projectStory) return;
  const rect = projectStory.getBoundingClientRect();
  projectStory.classList.toggle("is-in-view", rect.top < window.innerHeight && rect.bottom > 0);
  const progress = sectionProgress(projectStory);
  const next = Math.min(Math.floor(progress * projectScenes.length), projectScenes.length - 1);
  if (next === activeProject) return;
  activeProject = next;
  projectScenes.forEach((scene, index) => scene.classList.toggle("is-active", index === activeProject));
  projectDots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeProject));
  if (projectCounter) projectCounter.textContent = String(activeProject + 1).padStart(2, "0");
  const ambient = document.querySelector(".project-ambient");
  const backgrounds = [
    "radial-gradient(circle at 72% 48%, rgba(47,149,255,.19), transparent 30%), radial-gradient(circle at 28% 80%, rgba(143,124,255,.1), transparent 30%)",
    "radial-gradient(circle at 70% 48%, rgba(104,216,255,.2), transparent 31%), radial-gradient(circle at 28% 78%, rgba(143,124,255,.12), transparent 30%)",
    "radial-gradient(circle at 72% 48%, rgba(61,220,170,.17), transparent 32%), radial-gradient(circle at 25% 75%, rgba(47,149,255,.1), transparent 30%)",
    "radial-gradient(circle at 72% 48%, rgba(129,90,255,.22), transparent 31%), radial-gradient(circle at 22% 80%, rgba(255,66,129,.08), transparent 30%)"
  ];
  if (ambient) ambient.style.background = backgrounds[activeProject];
};

let activeExperience = -1;
const updateExperience = () => {
  if (!experienceStory) return;
  const rect = experienceStory.getBoundingClientRect();
  experienceStory.classList.toggle("is-in-view", rect.top < window.innerHeight && rect.bottom > 0);
  const progress = sectionProgress(experienceStory);
  const next = Math.min(Math.floor(progress * experienceScenes.length), experienceScenes.length - 1);
  if (next !== activeExperience) {
    activeExperience = next;
    experienceScenes.forEach((scene, index) => scene.classList.toggle("is-active", index === activeExperience));
    journeySteps.forEach((step, index) => step.classList.toggle("is-active", index <= activeExperience));
    journeyNow?.classList.toggle("is-active", activeExperience === experienceScenes.length - 1);
  }
  experienceStage?.style.setProperty("--experience-progress", `${progress * 100}%`);
  experienceStage?.style.setProperty("--ey-shift", progress.toFixed(3));
};

const updateHero = () => {
  const progress = clamp(window.scrollY / Math.max(window.innerHeight * .82, 1));
  if (heroTitle) {
    heroTitle.style.opacity = String(1 - progress * .92);
    heroTitle.style.transform = `translate3d(0, ${(-45 - progress * 18).toFixed(2)}%, 0) scale(${(1 - progress * .055).toFixed(3)})`;
  }
  if (heroSignal) {
    heroSignal.style.opacity = String(.8 * (1 - progress));
    heroSignal.style.transform = `translate3d(0, ${(-progress * 70).toFixed(1)}px, 0) rotate(${(progress * 8).toFixed(1)}deg)`;
  }
};

const updateScroll = () => {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  root.style.setProperty("--progress", clamp(window.scrollY / maxScroll).toFixed(4));
  updateManifesto();
  updateProjects();
  updateExperience();
  updateHero();

  const current = trackedSections.filter((section) => section.getBoundingClientRect().top <= 160).pop();
  navLinks.forEach((link) => link.classList.toggle("is-active", Boolean(current && link.hash === `#${current.id}`)));
  const movingDown = window.scrollY > lastScrollY;
  nav?.classList.toggle("is-hidden", movingDown && window.scrollY > 520 && !body.classList.contains("menu-open"));
  lastScrollY = window.scrollY;
  rafPending = false;
};

window.addEventListener("scroll", () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(updateScroll);
}, { passive: true });
window.addEventListener("resize", updateScroll);
updateScroll();

const menuToggle = document.querySelector(".menu-toggle");
const primaryMenu = document.querySelector("#primary-menu");
const closeMenu = () => {
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation");
  primaryMenu?.classList.remove("is-open");
  body.classList.remove("menu-open");
};
menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!open));
  menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
  primaryMenu?.classList.toggle("is-open", !open);
  body.classList.toggle("menu-open", !open);
});
navLinks.forEach((link) => link.addEventListener("click", closeMenu));
window.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

const cursor = document.querySelector(".cursor-core");
const pointer = { x: innerWidth * .72, y: innerHeight * .42, tx: innerWidth * .72, ty: innerHeight * .42, seen: false };

if (finePointer && !reducedMotion) {
  window.addEventListener("pointermove", (event) => {
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    pointer.seen = true;
    body.classList.add("has-pointer");
  }, { passive: true });
  document.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("pointerenter", () => body.classList.add("link-hover"));
    item.addEventListener("pointerleave", () => body.classList.remove("link-hover"));
  });
}

const canvas = document.querySelector("#signal-field");
const context = canvas?.getContext("2d");
let width = innerWidth;
let height = innerHeight;
let dpr = 1;
let trail = [];
let lastTrailPoint = { x: pointer.x, y: pointer.y };

const resizeCanvas = () => {
  if (!canvas || !context) return;
  width = innerWidth;
  height = innerHeight;
  dpr = Math.min(devicePixelRatio || 1, 1.75);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
};
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const drawHex = (x, y, radius, alpha) => {
  context.beginPath();
  for (let side = 0; side < 6; side += 1) {
    const angle = Math.PI / 3 * side + Math.PI / 6;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (side === 0) context.moveTo(px, py); else context.lineTo(px, py);
  }
  context.closePath();
  context.strokeStyle = `rgba(255,255,255,${alpha * 1.35})`;
  context.lineWidth = .7;
  context.stroke();
};

const animatePointer = () => {
  pointer.x += (pointer.tx - pointer.x) * .17;
  pointer.y += (pointer.ty - pointer.y) * .17;
  if (cursor) cursor.style.transform = `translate3d(${pointer.x - 4.5}px, ${pointer.y - 4.5}px, 0)`;

  if (context && finePointer && !reducedMotion && pointer.seen) {
    context.clearRect(0, 0, width, height);
    const dx = pointer.tx - lastTrailPoint.x;
    const dy = pointer.ty - lastTrailPoint.y;
    if (Math.hypot(dx, dy) > 9) {
      trail.push({ x: pointer.tx, y: pointer.ty, life: 1, size: 1.5 + Math.random() * 1.8 });
      lastTrailPoint = { x: pointer.tx, y: pointer.ty };
    }
    trail = trail.filter((point) => point.life > .02).slice(-38);
    trail.forEach((point) => {
      point.life *= .925;
      context.beginPath();
      context.arc(point.x, point.y, point.size * point.life, 0, Math.PI * 2);
      context.fillStyle = `rgba(255,255,255,${point.life * .88})`;
      context.fill();
    });

    const hexRadius = 28;
    const horizontal = Math.sqrt(3) * hexRadius;
    const vertical = 1.5 * hexRadius;
    const startCol = Math.floor((pointer.tx - 170) / horizontal) - 1;
    const endCol = Math.ceil((pointer.tx + 170) / horizontal) + 1;
    const startRow = Math.floor((pointer.ty - 170) / vertical) - 1;
    const endRow = Math.ceil((pointer.ty + 170) / vertical) + 1;
    for (let col = startCol; col <= endCol; col += 1) {
      for (let row = startRow; row <= endRow; row += 1) {
        const hx = col * horizontal + (row % 2 ? horizontal / 2 : 0);
        const hy = row * vertical;
        const distance = Math.hypot(hx - pointer.tx, hy - pointer.ty);
        if (distance < 175) drawHex(hx, hy, hexRadius, (1 - distance / 175) * .13);
      }
    }
  }
  requestAnimationFrame(animatePointer);
};
if (finePointer && !reducedMotion) animatePointer();

if (finePointer && !reducedMotion) {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `rotateY(${(-5 + x * 7).toFixed(2)}deg) rotateX(${(2 - y * 5).toFixed(2)}deg) translateZ(0)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = "rotateY(-5deg) rotateX(2deg)"; });
  });

  document.querySelectorAll(".magnetic").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate3d(${x * .12}px, ${y * .12}px, 0)`;
    });
    item.addEventListener("pointerleave", () => { item.style.transform = "translate3d(0,0,0)"; });
  });
}

document.querySelectorAll(".project-visual-switch").forEach((stage) => {
  const architecture = stage.querySelector(".project-architecture-overlay");
  const setArchitecture = (active) => {
    stage.classList.toggle("is-architecture", active);
    architecture?.setAttribute("aria-hidden", String(!active));
  };

  if (finePointer && !reducedMotion) {
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      const position = (event.clientX - rect.left) / rect.width;
      if (position > .56) setArchitecture(true);
      else if (position < .44) setArchitecture(false);
    });
    stage.addEventListener("pointerleave", () => setArchitecture(false));
  } else {
    stage.addEventListener("click", () => setArchitecture(!stage.classList.contains("is-architecture")));
  }

  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") setArchitecture(true);
    if (event.key === "ArrowLeft" || event.key === "Escape") setArchitecture(false);
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setArchitecture(!stage.classList.contains("is-architecture"));
    }
  });
});

document.querySelectorAll("[data-word-reveal]").forEach((element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode.textContent.trim()) textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }

  let wordIndex = 0;
  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    textNode.textContent.split(/(\s+)/).forEach((part) => {
      if (!part.trim()) {
        fragment.append(document.createTextNode(part));
        return;
      }
      const mask = document.createElement("span");
      const word = document.createElement("span");
      mask.className = "word-mask";
      word.className = "word";
      word.style.setProperty("--word-index", wordIndex);
      word.textContent = part;
      mask.append(word);
      fragment.append(mask);
      wordIndex += 1;
    });
    textNode.replaceWith(fragment);
  });
});

const splitAnimatedText = (element, mode = "observed") => {
  if (!element || element.classList.contains("stagger-text")) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();
  while (node) {
    if (node.textContent.trim() && !node.parentElement?.closest(".word-mask")) textNodes.push(node);
    node = walker.nextNode();
  }

  let wordIndex = 0;
  textNodes.forEach((textNode) => {
    const fragment = document.createDocumentFragment();
    textNode.textContent.split(/(\s+)/).forEach((part) => {
      if (!part.trim()) {
        fragment.append(document.createTextNode(part));
        return;
      }
      const mask = document.createElement("span");
      const word = document.createElement("span");
      mask.className = "motion-word-mask";
      word.className = "motion-word";
      word.style.setProperty("--motion-index", wordIndex);
      word.textContent = part;
      mask.append(word);
      fragment.append(mask);
      wordIndex += 1;
    });
    textNode.replaceWith(fragment);
  });
  element.classList.add("stagger-text", `stagger-${mode}`);
  if (mode === "observed") element.classList.add("reveal");
};

document.querySelectorAll(".depth-copy h3, .depth-copy > p, .education-card h3, .education-card > p, .certification-card h3, .certification-card > p, .about-copy > p:not(.section-kicker), .archive-item h3").forEach((element) => splitAnimatedText(element));
document.querySelectorAll(".project-copy h3, .project-one-liner").forEach((element) => splitAnimatedText(element, "project"));
document.querySelectorAll(".experience-scene h3, .experience-scene > p:not(.experience-date)").forEach((element) => splitAnimatedText(element, "experience"));

const revealItems = [...document.querySelectorAll(".reveal")];
if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = String(new Date().getFullYear()); });
