/* =========================================================
   PORTFÓLIO CARLOS AUGUSTO — JAVASCRIPT REVISADO
========================================================= */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktopPointer = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1001px)").matches;

  // Loader: não deixa a tela presa caso o evento load já tenha ocorrido.
  const loader = $("#loader");
  const hideLoader = () => window.setTimeout(() => loader?.classList.add("hide"), 350);
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader, { once: true });
  window.setTimeout(() => loader?.classList.add("hide"), 3000);

  // Tema claro/escuro.
  const themeBtn = $("#themeBtn");
  let savedTheme = "dark";
  try { savedTheme = localStorage.getItem("theme") || "dark"; } catch (_) {}
  if (savedTheme === "light") document.body.classList.add("light");

  const updateThemeIcon = () => {
    if (!themeBtn) return;
    const light = document.body.classList.contains("light");
    themeBtn.innerHTML = light
      ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    themeBtn.setAttribute("aria-label", light ? "Ativar tema escuro" : "Ativar tema claro");
  };
  updateThemeIcon();
  themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const theme = document.body.classList.contains("light") ? "light" : "dark";
    try { localStorage.setItem("theme", theme); } catch (_) {}
    updateThemeIcon();
  });

  // Menu mobile acessível.
  const menuBtn = $("#menuBtn");
  const nav = $("#nav");
  const closeMenu = () => {
    menuBtn?.classList.remove("open");
    nav?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    menuBtn?.setAttribute("aria-label", "Abrir menu");
  };
  menuBtn?.addEventListener("click", () => {
    const open = !nav?.classList.contains("open");
    nav?.classList.toggle("open", open);
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  $$(".nav-link").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("open") && !nav.contains(event.target) && !menuBtn?.contains(event.target)) closeMenu();
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 800) closeMenu(); }, { passive: true });

  // Cabeçalho e botão de voltar ao topo com um único listener.
  const header = $("#header");
  const backTop = $("#backTop");
  let scrollQueued = false;
  const updateOnScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      header?.classList.toggle("scrolled", window.scrollY > 30);
      backTop?.classList.toggle("show", window.scrollY > 500);
      scrollQueued = false;
    });
  };
  window.addEventListener("scroll", updateOnScroll, { passive: true });
  updateOnScroll();
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  // Texto digitado.
  const typingElement = $("#typing");
  const words = ["estudante de tecnologia.", "desenvolvedor web.", "entusiasta de hardware.", "criador de projetos."];
  let wordIndex = 0, charIndex = 0, deleting = false, typingTimer;
  const typeEffect = () => {
    if (!typingElement) return;
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    typingElement.textContent = word.slice(0, charIndex);
    let delay = deleting ? 38 : 75;
    if (!deleting && charIndex >= word.length) { deleting = true; delay = 1500; }
    else if (deleting && charIndex <= 0) { deleting = false; wordIndex = (wordIndex + 1) % words.length; delay = 300; }
    typingTimer = window.setTimeout(typeEffect, reducedMotion ? 1800 : delay);
  };
  if (typingElement) typeEffect();

  // Reveal com fallback para navegadores sem IntersectionObserver.
  const revealElements = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealElements.forEach(element => revealObserver.observe(element));
  } else revealElements.forEach(element => element.classList.add("show"));

  // Link ativo na navegação.
  const navLinks = $$(".nav-link");
  const sections = $$("main section[id]");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Partículas em quantidade menor em telas menores e sem movimento reduzido.
  const particlesContainer = $("#particles");
  if (particlesContainer && !reducedMotion) {
    const count = window.innerWidth < 480 ? 7 : window.innerWidth < 800 ? 12 : 24;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${12 + Math.random() * 12}s`;
      particle.style.animationDelay = `${Math.random() * -18}s`;
      fragment.appendChild(particle);
    }
    particlesContainer.appendChild(fragment);
  }

  // Formulário Web3Forms.
  const contactForm = $("#contactForm");
  const formMessage = $("#formMessage");
  contactForm?.addEventListener("submit", async event => {
    event.preventDefault();
    const button = $(".send-btn", contactForm);
    if (!button) return;
    const originalHTML = button.innerHTML;
    button.disabled = true;
    button.innerHTML = 'Enviando... <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
    if (formMessage) formMessage.textContent = "";

    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(contactForm) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Não foi possível enviar.");
      if (formMessage) {
        formMessage.textContent = "Mensagem enviada com sucesso!";
        formMessage.style.color = "#00c875";
      }
      contactForm.reset();
    } catch (error) {
      console.error("Falha no formulário:", error);
      if (formMessage) {
        formMessage.textContent = "Não foi possível enviar agora. Confira sua conexão e tente novamente.";
        formMessage.style.color = "#ff3030";
      }
    } finally {
      button.disabled = false;
      button.innerHTML = originalHTML;
    }
  });

  // Efeitos de mouse somente em desktop com mouse; sem loops desnecessários em touch.
  if (isDesktopPointer && !reducedMotion) {
    document.body.classList.add("custom-cursor");
    const glow = document.createElement("div");
    const follower = document.createElement("div");
    glow.className = "mouse-glow";
    follower.className = "mouse-follower";
    document.body.append(glow, follower);
    let x = innerWidth / 2, y = innerHeight / 2, fx = x, fy = y, gx = x, gy = y, started = false;
    document.addEventListener("mousemove", event => {
      x = event.clientX; y = event.clientY;
      document.documentElement.style.setProperty("--mouse-x", `${x}px`);
      document.documentElement.style.setProperty("--mouse-y", `${y}px`);
      if (!started) { started = true; glow.classList.add("active"); follower.classList.add("active"); }
    }, { passive: true });
    const animateMouse = () => {
      fx += (x - fx) * .18; fy += (y - fy) * .18;
      gx += (x - gx) * .07; gy += (y - gy) * .07;
      follower.style.transform = `translate3d(${fx}px,${fy}px,0) translate(-50%,-50%)`;
      glow.style.transform = `translate3d(${gx}px,${gy}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(animateMouse);
    };
    animateMouse();
    $$("a,button,.skill-card,.project-card").forEach(element => {
      element.addEventListener("mouseenter", () => follower.classList.add("hover"));
      element.addEventListener("mouseleave", () => follower.classList.remove("hover"));
    });
    document.addEventListener("mouseleave", () => { glow.classList.remove("active"); follower.classList.remove("active"); });
    document.addEventListener("mouseenter", () => { if (started) { glow.classList.add("active"); follower.classList.add("active"); } });
  }

  // Parallax leve apenas em desktop e com movimento permitido.
  const heroVisual = $(".hero-visual");
  if (heroVisual && window.innerWidth > 1100 && !reducedMotion && isDesktopPointer) {
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0, framePending = false;
    document.addEventListener("mousemove", event => {
      targetX = (innerWidth / 2 - event.clientX) / 130;
      targetY = (innerHeight / 2 - event.clientY) / 130;
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        currentX += (targetX - currentX) * .05;
        currentY += (targetY - currentY) * .05;
        heroVisual.style.translate = `${currentX}px ${currentY}px`;
        framePending = false;
      });
    }, { passive: true });
  }

  // Carrossel: mede a posição real de cada card, incluindo margens e responsividade.
  const track = $("#projectsTrack");
  const prev = $("#projectPrev");
  const next = $("#projectNext");
  const dotsContainer = $("#projectDots");
  const dots = dotsContainer ? $$("button", dotsContainer) : [];
  let currentProject = 0;
  const cards = () => track ? $$(".project-card", track) : [];
  const updateCarousel = (smooth = true) => {
    const allCards = cards();
    if (!track || !allCards.length) return;
    currentProject = Math.max(0, Math.min(currentProject, allCards.length - 1));
    const card = allCards[currentProject];
    track.scrollTo({ left: card.offsetLeft - allCards[0].offsetLeft, behavior: (smooth && !reducedMotion) ? "smooth" : "auto" });
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentProject);
      dot.setAttribute("aria-current", index === currentProject ? "true" : "false");
    });
  };
  next?.addEventListener("click", () => { const allCards = cards(); if (!allCards.length) return; currentProject = (currentProject + 1) % allCards.length; updateCarousel(); });
  prev?.addEventListener("click", () => { const allCards = cards(); if (!allCards.length) return; currentProject = (currentProject - 1 + allCards.length) % allCards.length; updateCarousel(); });
  dots.forEach((dot, index) => dot.addEventListener("click", () => { currentProject = index; updateCarousel(); }));
  let touchStartX = 0;
  track?.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  track?.addEventListener("touchend", event => {
    const delta = touchStartX - event.changedTouches[0].clientX;
    if (Math.abs(delta) < 45) return;
    const allCards = cards();
    if (!allCards.length) return;
    currentProject = delta > 0 ? (currentProject + 1) % allCards.length : (currentProject - 1 + allCards.length) % allCards.length;
    updateCarousel();
  }, { passive: true });
  window.addEventListener("resize", () => updateCarousel(false), { passive: true });

  console.log("%c Carlos Augusto ", "background:#ff1e1e;color:#fff;font-size:16px;font-weight:bold;padding:6px;");
  console.log("%c Desenvolvedor • Tecnologia • Hardware ", "color:#ff3030;font-size:12px;font-weight:bold;");
});
