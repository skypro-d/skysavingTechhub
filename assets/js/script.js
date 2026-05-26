const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

document.addEventListener("DOMContentLoaded", () => {
  const loader = $("#loader");
  const header = $("#site-header");
  const menuBtn = $("#menu-btn");
  const nav = $("#nav-links");
  const backTop = $("#back-top");
  const themeToggle = $("#theme-toggle");
  const canvas = $("#hero-canvas");

  setTimeout(() => loader?.classList.add("hide"), 600);
  setTimeout(() => loader?.remove(), 1200);

  const savedTheme = localStorage.getItem("skysavings-theme");
  if (savedTheme === "light") document.body.classList.add("light");
  updateThemeIcon();

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    localStorage.setItem("skysavings-theme", document.body.classList.contains("light") ? "light" : "dark");
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const icon = themeToggle?.querySelector("i");
    if (!icon) return;
    icon.className = document.body.classList.contains("light") ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }

  menuBtn?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  $$("#nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuBtn?.setAttribute("aria-expanded", "false");
    });
  });

  const onScroll = () => {
    header?.classList.toggle("scrolled", window.scrollY > 20);
    backTop?.classList.toggle("show", window.scrollY > 600);
    activateNavLink();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  function activateNavLink() {
    const sections = $$("main section[id]");
    const current = sections.findLast((section) => section.offsetTop <= window.scrollY + 160);
    if (!current) return;
    $$("#nav-links a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.7 });
  $$("[data-count]").forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = Number(el.dataset.count || 0);
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(target * eased)}+`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  $$(".price-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.priceTab;
      $$(".price-tabs button").forEach((btn) => btn.classList.toggle("active", btn === button));
      $$(".price-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.pricePanel === name));
    });
  });

  $$(".faq-list button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest("article");
      $$(".faq-list article").forEach((article) => {
        if (article !== item) article.classList.remove("open");
      });
      item.classList.toggle("open");
    });
  });

  const track = $("#testimonial-track");
  const prev = $("#prev-testimonial");
  const next = $("#next-testimonial");
  let slide = 0;
  const updateSlider = () => {
    if (!track) return;
    const max = $$(".testimonial-card", track).length - 1;
    slide = Math.max(0, Math.min(slide, max));
    track.style.transform = `translateX(-${slide * 100}%)`;
  };
  prev?.addEventListener("click", () => { slide -= 1; updateSlider(); });
  next?.addEventListener("click", () => {
    const max = $$(".testimonial-card", track).length - 1;
    slide = slide >= max ? 0 : slide + 1;
    updateSlider();
  });
  setInterval(() => next?.click(), 6500);

  $("#contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = [
      "Hello SkySavings TechHub, I want to discuss a project.",
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "Not provided"}`,
      `Service: ${data.get("service")}`,
      `Message: ${data.get("message")}`
    ].join("\n");
    window.open(`https://wa.me/2347081306993?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });

  if (canvas) initCanvas(canvas);
});

function initCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  let points = [];

  const resize = () => {
    const hero = document.querySelector(".hero");
    canvas.width = window.innerWidth;
    canvas.height = hero?.offsetHeight || window.innerHeight;
    points = Array.from({ length: Math.min(80, Math.floor(canvas.width / 18)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: Math.random() * 0.35 - 0.175,
      vy: Math.random() * 0.35 - 0.175,
      r: Math.random() * 1.8 + 0.6
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(56, 189, 248, .45)";
    points.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
}
