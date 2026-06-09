/* =========================================
   NICOLÁS HELLMAN — PORTFOLIO JAVASCRIPT
   ========================================= */

'use strict';

// =====================================
// THEME TOGGLE — DARK / LIGHT
// =====================================
(function() {
  const html        = document.documentElement;
  const btn         = document.getElementById('theme-toggle');
  const label       = document.getElementById('theme-label');
  const STORAGE_KEY = 'nh-portfolio-theme';

  // Preferred theme: saved → system preference → dark
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
  applyTheme(initialTheme, false);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    localStorage.setItem(STORAGE_KEY, next);
  });

  function applyTheme(theme, animate) {
    if (animate) {
      // Flash ripple effect from toggle position
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'theme-ripple';
      ripple.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top:  ${rect.top  + rect.height / 2}px;
        width: 4px; height: 4px;
        border-radius: 50%;
        background: ${theme === 'light'
          ? 'rgba(240,244,248,0.95)'
          : 'rgba(7,11,20,0.95)'};
        transform: translate(-50%, -50%) scale(0);
        z-index: 9998;
        pointer-events: none;
        transition: transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.65s ease;
      `;
      document.body.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'translate(-50%, -50%) scale(600)';
        ripple.style.opacity   = '0';
      });
      setTimeout(() => ripple.remove(), 700);
    }

    html.setAttribute('data-theme', theme);
    if (label) {
      label.textContent = theme === 'dark' ? 'Modo Día' : 'Modo Noche';
    }
    btn.setAttribute('aria-label', theme === 'dark'
      ? 'Cambiar a modo claro'
      : 'Cambiar a modo oscuro');
  }
})();



// =====================================
// CUSTOM CURSOR
// =====================================
const cursorDot  = document.getElementById('cursor-dot');
const cursorGlow = document.getElementById('cursor-glow');

let mouseX = 0, mouseY = 0;
let glowX  = 0, glowY  = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

function animateCursor() {
  glowX += (mouseX - glowX) * 0.1;
  glowY += (mouseY - glowY) * 0.1;
  cursorGlow.style.left = glowX + 'px';
  cursorGlow.style.top  = glowY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();


// =====================================
// HERO CANVAS — PARTICLE NETWORK
// =====================================
(function() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], RAF;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  const DARK_COLORS  = ['0, 212, 255', '79, 142, 247', '139, 92, 246'];
  const LIGHT_COLORS = ['0, 119, 204', '59, 91, 219', '112, 72, 232'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.alpha = Math.random() * 0.45 + 0.08;
      this.life  = Math.random() * 400 + 200;
      this.age   = init ? Math.random() * this.life : 0;
      this.colorIdx = Math.floor(Math.random() * 3);
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.age++;
      if (this.age >= this.life || this.y < -10) this.reset(false);
    }
    draw() {
      const palette = getTheme() === 'dark' ? DARK_COLORS : LIGHT_COLORS;
      const fade = Math.min(this.age / 60, 1) * Math.min((this.life - this.age) / 60, 1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${palette[this.colorIdx]}, ${this.alpha * fade})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor(W / 10), 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawConnections() {
    const isLight = getTheme() === 'light';
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const alpha = (1 - d / maxDist) * (isLight ? 0.08 : 0.12);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isLight
            ? `rgba(0, 119, 204, ${alpha})`
            : `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function drawGrid() {
    const isLight = getTheme() === 'light';
    const gSize = 60;
    ctx.strokeStyle = isLight
      ? 'rgba(14, 63, 120, 0.04)'
      : 'rgba(0, 212, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += gSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function loop() {
    const isLight = getTheme() === 'light';
    ctx.clearRect(0, 0, W, H);

    // Adaptive gradient bg
    const grad = ctx.createLinearGradient(0, 0, W, H);
    if (isLight) {
      grad.addColorStop(0,   '#eef3fa');
      grad.addColorStop(0.5, '#e8eef6');
      grad.addColorStop(1,   '#edf2f9');
    } else {
      grad.addColorStop(0,   '#070b14');
      grad.addColorStop(0.5, '#080d1a');
      grad.addColorStop(1,   '#070b14');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });

    RAF = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  loop();
})();


// =====================================
// NAVBAR SCROLL BEHAVIOR
// =====================================
const navbar  = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  // Scrolled class
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active nav link
  let current = '';
  sections.forEach(s => {
    const top = s.offsetTop - 100;
    if (window.scrollY >= top) current = s.getAttribute('id');
  });
  navLinks.forEach(l => {
    l.classList.remove('active');
    if (l.getAttribute('href') === '#' + current) l.classList.add('active');
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


// =====================================
// MOBILE NAV TOGGLE
// =====================================
const navToggle = document.getElementById('nav-toggle');
const navLinksEl = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navLinksEl.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinksEl.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinksEl.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});


// =====================================
// TYPED TEXT EFFECT
// =====================================
(function() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const words = ['Full-Stack', 'Independiente', 'DevOps', 'RPA', 'SaaS'];
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];
    if (deleting) {
      el.textContent = word.slice(0, ci--);
      if (ci < 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 500); return; }
      setTimeout(type, 60);
    } else {
      el.textContent = word.slice(0, ci++);
      if (ci > word.length) { deleting = true; setTimeout(type, 1800); return; }
      setTimeout(type, 100);
    }
  }
  setTimeout(type, 800);
})();


// =====================================
// COUNTER ANIMATION
// =====================================
function animateCounter(el) {
  const target = +el.dataset.target;
  const dur = 1800;
  const step = dur / target;
  let count = 0;
  const timer = setInterval(() => {
    count++;
    el.textContent = count + '+';
    if (count >= target) { el.textContent = target + '+'; clearInterval(timer); }
  }, step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObserver.observe(el));


// =====================================
// SKILL BARS ANIMATION
// =====================================
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
        setTimeout(() => bar.classList.add('animated'), i * 100);
      });
      skillObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skills-cat').forEach(el => skillObserver.observe(el));


// =====================================
// SCROLL REVEAL
// =====================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      e.target.style.transitionDelay = (i % 3) * 0.08 + 's';
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

const revealEls = [
  ...document.querySelectorAll('.project-card'),
  ...document.querySelectorAll('.service-card'),
  ...document.querySelectorAll('.skills-cat'),
  ...document.querySelectorAll('.contact-channel'),
  ...document.querySelectorAll('.about-highlights .highlight-item'),
  document.querySelector('.about-visual'),
  document.querySelector('.about-content'),
  document.querySelector('.contact-info'),
  document.querySelector('.contact-form'),
].filter(Boolean);

revealEls.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});


// =====================================
// CONTACT FORM
// =====================================
const form     = document.getElementById('contact-form');
const feedback = document.getElementById('form-feedback');
const submitBtn = document.getElementById('contact-submit-btn');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email-input').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showFeedback('Por favor, completa todos los campos requeridos.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('Por favor, ingresa un email válido.', 'error');
      return;
    }

    // Simulate send
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar mensaje';
      showFeedback('✅ ¡Mensaje enviado! Te contactaré pronto.', 'success');
      form.reset();
    }, 1800);
  });
}

function showFeedback(msg, type) {
  feedback.textContent = msg;
  feedback.className = 'form-feedback ' + type;
  setTimeout(() => { feedback.className = 'form-feedback'; feedback.textContent = ''; }, 5000);
}


// =====================================
// FOOTER YEAR
// =====================================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// =====================================
// PROJECT CARD TILT EFFECT
// =====================================
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const rx = ((e.clientY - cy) / (rect.height / 2)) * 4;
    const ry = ((e.clientX - cx) / (rect.width  / 2)) * -4;
    card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transformStyle = '';
  });
});


// =====================================
// SMOOTH ANCHOR OFFSET
// =====================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// =====================================
// TECH PILL HOVER RIPPLE
// =====================================
document.querySelectorAll('.tech-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    pill.style.transform = 'scale(0.95)';
    setTimeout(() => { pill.style.transform = ''; }, 150);
  });
});
