import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;

function setupPreloader() {
  const loader = document.querySelector<HTMLElement>('[data-preloader]');
  if (!loader) return;
  let seen = false;
  try { seen = sessionStorage.getItem('noctem-intro-seen') === '1'; } catch {}
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const isReload = navigation?.type === 'reload';
  if (seen && !isReload) {
    loader.remove();
    document.documentElement.classList.remove('is-loading');
    document.body.classList.add('intro-complete');
    return;
  }
  const startedAt = performance.now();
  const minimumVisible = 2850;
  const meter = loader.querySelector<HTMLElement>('[data-preloader-progress]');
  const bar = loader.querySelector<HTMLElement>('[data-preloader-bar]');
  let finished = false;
  let finishScheduled = false;

  const setProgress = (value: number) => {
    const safe = Math.min(100, Math.max(0, Math.round(value)));
    if (meter) meter.textContent = String(safe).padStart(2, '0');
    if (bar) bar.style.transform = `scaleX(${safe / 100})`;
  };
  const finish = () => {
    if (finished || finishScheduled) return;
    finishScheduled = true;
    const remaining = Math.max(0, minimumVisible - (performance.now() - startedAt));
    setTimeout(() => {
      if (finished) return;
      finished = true;
      setProgress(100);
      try {
        sessionStorage.setItem('noctem-intro-seen', '1');
      } catch {}
      requestAnimationFrame(() => requestAnimationFrame(() => {
        loader.classList.add('is-complete');
        document.documentElement.classList.remove('is-loading');
        document.body.classList.add('intro-complete');
        setTimeout(() => loader.remove(), reduced ? 120 : 950);
      }));
    }, remaining);
  };

  if (reduced) {
    setProgress(100);
    requestAnimationFrame(finish);
    return;
  }

  document.documentElement.classList.add('is-loading');
  setProgress(0);
  const criticalImages = Array.from(document.querySelectorAll<HTMLImageElement>('img')).filter((image) => image.loading !== 'lazy').slice(0, 4);
  const tasks: Promise<unknown>[] = criticalImages.map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined));
  if ('fonts' in document) tasks.push(document.fonts.ready);
  if (!tasks.length) tasks.push(Promise.resolve());
  let loaded = 0;
  tasks.forEach((task) => task.finally(() => {
    loaded += 1;
    setProgress((loaded / tasks.length) * 88);
    if (loaded === tasks.length) finish();
  }));
  setTimeout(finish, 2500);
  loader.querySelector('[data-skip-intro]')?.addEventListener('click', finish);
}

function setupSignalCanvas() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-signal-canvas]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  const pointer = { x: innerWidth * 0.68, y: innerHeight * 0.32, tx: innerWidth * 0.68, ty: innerHeight * 0.32 };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let active = true;
  let lastFrame = 0;

  const resize = () => {
    width = innerWidth;
    height = innerHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = (time: number) => {
    if (!active) return;
    requestAnimationFrame(draw);
    if (!reduced && time - lastFrame < 32) return;
    lastFrame = time;
    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    const scrollRatio = Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - height));
    context.clearRect(0, 0, width, height);

    const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(width, height) * 0.55);
    glow.addColorStop(0, `rgba(130,46,255,${0.12 + scrollRatio * 0.05})`);
    glow.addColorStop(0.42, 'rgba(52,59,210,0.055)');
    glow.addColorStop(1, 'rgba(7,7,10,0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    for (let line = 0; line < 3; line += 1) {
      const phase = time * (0.00014 + line * 0.000025) + line * 1.8 + scrollRatio * 2.4;
      const startY = height * (0.25 + line * 0.24);
      const endY = height * (0.2 + ((line + 1) % 3) * 0.25);
      context.beginPath();
      context.moveTo(-80, startY);
      context.bezierCurveTo(width * 0.28, startY + Math.sin(phase) * 90, pointer.x - 120, pointer.y + Math.cos(phase) * 110, width + 80, endY);
      const stroke = context.createLinearGradient(0, 0, width, 0);
      stroke.addColorStop(0, 'rgba(83,41,160,0)');
      stroke.addColorStop(0.42, `rgba(170,62,255,${0.09 + line * 0.025})`);
      stroke.addColorStop(0.7, `rgba(65,86,255,${0.11 + line * 0.02})`);
      stroke.addColorStop(1, 'rgba(65,86,255,0)');
      context.strokeStyle = stroke;
      context.lineWidth = line === 1 ? 1.1 : 0.7;
      context.stroke();
    }

    const nodes = [
      [pointer.x, pointer.y, 3.2], [width * 0.18, height * (0.32 + Math.sin(time * 0.0003) * 0.08), 1.8],
      [width * 0.82, height * (0.68 + Math.cos(time * 0.00025) * 0.07), 2.3],
    ];
    nodes.forEach(([x, y, radius]) => {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = 'rgba(198,116,255,.82)';
      context.shadowBlur = 18;
      context.shadowColor = '#9d3dff';
      context.fill();
      context.shadowBlur = 0;
    });
  };
  addEventListener('resize', resize, { passive: true });
  if (finePointer && !reduced) addEventListener('pointermove', (event) => { pointer.tx = event.clientX; pointer.ty = event.clientY; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    const next = !document.hidden;
    if (next && !active) { active = true; requestAnimationFrame(draw); }
    else active = next;
  });
  resize();
  requestAnimationFrame(draw);
}

function setupMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-mobile-menu]');
  if (!toggle || !menu) return;
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); menu.hidden = true; document.body.classList.remove('menu-open'); toggle.focus(); };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) close();
    else { toggle.setAttribute('aria-expanded', 'true'); menu.hidden = false; document.body.classList.add('menu-open'); menu.querySelector<HTMLAnchorElement>('a')?.focus(); }
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); }));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !menu.hidden) close(); });
}

function setupChrome() {
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector<HTMLElement>('[data-page-progress]');
  const update = () => {
    header?.classList.toggle('is-scrolled', scrollY > 32);
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (progress) progress.style.transform = `scaleY(${Math.min(1, scrollY / max)})`;
  };
  update();
  addEventListener('scroll', update, { passive: true });

  document.querySelectorAll<HTMLAnchorElement>('[data-lang-choice]').forEach((link) => link.addEventListener('click', () => {
    try { localStorage.setItem('noctem-language-choice', link.dataset.langChoice || 'pt'); } catch {}
  }));
}

function setupCursor() {
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  if (!cursor || !finePointer || reduced) return;
  const label = cursor.querySelector<HTMLElement>('[data-cursor-label]');
  const position = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', (event) => {
    position.x = event.clientX;
    position.y = event.clientY;
    gsap.to(cursor, { x: position.x, y: position.y, duration: 0.36, ease: 'power3.out' });
    cursor.classList.add('is-visible');
  }, { passive: true });
  document.querySelectorAll<HTMLElement>('a,button,[data-cursor-text]').forEach((target) => {
    target.addEventListener('pointerenter', () => {
      cursor.classList.add('is-active');
      if (label) label.textContent = target.dataset.cursorText || '';
    });
    target.addEventListener('pointerleave', () => {
      cursor.classList.remove('is-active');
      if (label) label.textContent = '';
    });
  });
}

function setupForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();
    const error = form.querySelector<HTMLElement>('[data-form-error]');
    if (!form.checkValidity()) {
      if (error) error.textContent = form.dataset.lang === 'pt' ? 'Preencha os campos obrigatórios.' : 'Please complete the required fields.';
      form.reportValidity(); return;
    }
    const data = new FormData(form);
    const pt = form.dataset.lang === 'pt';
    const message = pt
      ? `Olá, Noctem! Meu nome é ${data.get('name')}.${data.get('company') ? ` Empresa: ${data.get('company')}.` : ''} Quero conversar sobre ${data.get('type')}. Objetivo: ${data.get('goal')}`
      : `Hello, Noctem! My name is ${data.get('name')}.${data.get('company') ? ` Company: ${data.get('company')}.` : ''} I would like to discuss ${data.get('type')}. Goal: ${data.get('goal')}`;
    const channel = (event.submitter as HTMLElement | null)?.dataset.contactChannel || 'whatsapp';
    if (channel === 'email') {
      const subject = pt ? `Novo projeto — ${data.get('type')}` : `New project — ${data.get('type')}`;
      const email = form.dataset.email || 'hello.noctem@proton.me';
      const link = document.createElement('a');
      link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      link.click();
      return;
    }
    window.open(`https://wa.me/5535997243658?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
}

function setupMotion() {
  if (reduced) return;
  gsap.registerPlugin(ScrollTrigger);
  const compactHero = innerWidth <= 1100;
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  if (!compactHero) {
    gsap.from('.hero .reveal', { yPercent: 115, opacity: 0, rotateX: -18, duration: 1.25, stagger: 0.1, delay: 0.12, ease: 'power4.out' });
  } else {
    gsap.set('.hero .reveal', { opacity: 1, visibility: 'visible', clearProps: 'transform,filter' });
    gsap.fromTo('.hero .reveal', { y: 20 }, { y: 0, duration: 0.8, stagger: 0.07, delay: 0.08, ease: 'power3.out', clearProps: 'transform' });
  }
  gsap.from('.signal-art img', { scale: 0.45, opacity: 0, rotate: 14, filter: 'blur(18px)', duration: 1.7, delay: 0.18, ease: 'expo.out' });
  gsap.from('.hero-depth i', { scale: 0.45, opacity: 0, stagger: 0.09, duration: 1.45, delay: 0.2, ease: 'expo.out' });

  if (!compactHero && document.querySelector('.hero')) {
    const heroTimeline = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=135%', scrub: 0.75, pin: true, anticipatePin: 1 } });
    heroTimeline
      .fromTo('.hero-copy', { z: 0, scale: 1, yPercent: 0 }, { z: 120, scale: 1.04, yPercent: -4, ease: 'none' }, 0)
      .fromTo('.hero-intro,.hero-actions,.hero .eyebrow', { opacity: 1, y: 0 }, { opacity: 0, y: -50, ease: 'none' }, 0)
      .fromTo('[data-hero-title]', { scale: 1, letterSpacing: '-.06em', opacity: 1, filter: 'blur(0px)' }, { scale: 1.08, letterSpacing: '-.07em', opacity: 0.08, filter: 'blur(5px)', ease: 'none' }, 0.18)
      .to('.signal-art', { scale: 2.1, z: 300, rotateZ: -11, opacity: 0.5, ease: 'none' }, 0)
      .to('.hero-depth', { scale: 2.8, rotateZ: 18, opacity: 0, ease: 'none' }, 0)
      .to('.hero-atmosphere', { scale: 1.35, filter: 'brightness(1.4)', ease: 'none' }, 0)
      .fromTo('.scroll-cue,.hero-index', { opacity: 1 }, { opacity: 0, ease: 'none' }, 0);
  } else if (document.querySelector('.hero')) {
    const mobileHero = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.55 } });
    mobileHero
      .to('.signal-art', { yPercent: 28, scale: 1.22, rotateZ: -7, ease: 'none' }, 0)
      .to('.hero-depth', { yPercent: 12, scale: 1.35, rotateZ: 14, ease: 'none' }, 0)
      .to('.scroll-cue', { opacity: 0, y: -18, ease: 'none' }, 0);
    gsap.to('.signal-art img', { y: -12, duration: 2.7, delay: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.signal-orbit', { rotate: '+=26', duration: 18, repeat: -1, ease: 'none' });
    gsap.to('.hero-depth b', { scale: 1.28, opacity: 0.72, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  gsap.to('.track-forward', { xPercent: -24, ease: 'none', scrollTrigger: { trigger: '[data-kinetic]', start: 'top bottom', end: 'bottom top', scrub: 0.65 } });
  gsap.fromTo('.track-reverse', { xPercent: -28 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '[data-kinetic]', start: 'top bottom', end: 'bottom top', scrub: 0.65 } });

  gsap.from('.manifesto h2', { scale: 0.94, opacity: 0.18, filter: 'blur(9px)', rotationX: -12, transformOrigin: 'left center', scrollTrigger: { trigger: '.manifesto', start: 'top 88%', end: 'center 52%', scrub: true } });
  gsap.from('.home-projects .portfolio-entry', { y: 54, opacity: 0, stagger: 0.09, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.home-projects', start: 'top 82%', once: true } });

  gsap.utils.toArray<HTMLElement>('[data-section]').forEach((section) => {
    if (section.classList.contains('home-projects') || section.classList.contains('manifesto')) return;
    gsap.from(section, { y: 75, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 86%', once: true } });
  });
  gsap.from('.service-list article', { xPercent: (index) => index % 2 ? 5 : -5, opacity: 0, stagger: 0.08, scrollTrigger: { trigger: '.service-list', start: 'top 82%', once: true } });
  gsap.to('.world-orbit', { rotate: 70, scale: 1.18, scrollTrigger: { trigger: '.worldwide', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.cta-signal', { rotate: -35, scale: 1.5, scrollTrigger: { trigger: '.final-cta', start: 'top bottom', end: 'bottom top', scrub: true } });

  if (document.querySelector('[data-contact-hero]')) {
    gsap.from('.contact-hero h1,.contact-hero>p', { y: 80, opacity: 0, stagger: 0.12, duration: 1.2, ease: 'power4.out' });
    gsap.to('.contact-orb', { scale: 2.4, rotate: 55, opacity: 0.25, scrollTrigger: { trigger: '.contact-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.contact-marquee>div', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '.contact-marquee', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  const art = document.querySelector<HTMLElement>('[data-signal-art]');
  if (art && finePointer) addEventListener('pointermove', (event) => {
    const x = (event.clientX / innerWidth - 0.5) * 22;
    const y = (event.clientY / innerHeight - 0.5) * 22;
    gsap.to(art, { rotateY: x * 0.55, rotateX: -y * 0.38, x, y, duration: 1.2, ease: 'power2.out' });
  }, { passive: true });
}

setupPreloader();
setupSignalCanvas();
setupMenu();
setupChrome();
setupCursor();
setupForm();
setupMotion();
