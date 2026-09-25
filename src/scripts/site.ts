import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { hasConsent, setupConsent } from './consent';
import { markIntroDone } from './cinema/intro';
import { setupLightField } from './cinema/lightfield';
import { setupSplitHeadings } from './cinema/text';
import { setupMagnetic } from './cinema/magnetic';
import { setupHud } from './cinema/hud';
import { setupHome, setupHomeStatic } from './cinema/home';
import { setupInnerPages } from './cinema/inner';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;

function setupPreloader() {
  const loader = document.querySelector<HTMLElement>('[data-preloader]');
  if (!loader) { markIntroDone(); return; }
  let seen = false;
  try { seen = sessionStorage.getItem('noctem-intro-seen') === '1'; } catch {}
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const isReload = navigation?.type === 'reload';
  if (seen && !isReload) {
    loader.remove();
    document.documentElement.classList.remove('is-loading');
    document.body.classList.add('intro-complete');
    markIntroDone();
    return;
  }
  const startedAt = performance.now();
  const minimumVisible = 3150;
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
    const remaining = reduced ? 0 : Math.max(0, minimumVisible - (performance.now() - startedAt));
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
        // The title sequence starts while the curtain planes are still opening.
        setTimeout(markIntroDone, reduced ? 0 : 280);
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
  // Modest devices skip this ambient layer entirely (CSS hides it under html.lite).
  if (document.documentElement.classList.contains('lite')) return;
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
    // The WebGL light field already fills the hero: don't paint a second full-screen layer under it.
    if (document.documentElement.classList.contains('lightfield-visible')) { context.clearRect(0, 0, width, height); return; }
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
    // A radial gradient halo instead of shadowBlur, which forces a slow blur pass every frame.
    nodes.forEach(([x, y, radius]) => {
      const halo = context.createRadialGradient(x, y, 0, x, y, radius * 6);
      halo.addColorStop(0, 'rgba(198,116,255,.85)');
      halo.addColorStop(0.25, 'rgba(157,61,255,.35)');
      halo.addColorStop(1, 'rgba(157,61,255,0)');
      context.fillStyle = halo;
      context.fillRect(x - radius * 6, y - radius * 6, radius * 12, radius * 12);
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
    // Remembering the language across visits is optional storage (LGPD consent, "preferences" category).
    if (!hasConsent('preferences')) return;
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
    const raw = new FormData(form);
    // Normalize whitespace and cap each field before it is placed in a URL (OWASP input validation).
    const field = (name: string, max: number, multiline = false) => {
      const value = String(raw.get(name) ?? '').normalize('NFC');
      return (multiline ? value.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n') : value.replace(/\s+/g, ' ')).trim().slice(0, max);
    };
    const data = { name: field('name', 120), company: field('company', 120), type: field('type', 60), goal: field('goal', 1500, true) };
    if (!form.checkValidity() || !data.name || !data.type || !data.goal) {
      if (error) error.textContent = form.dataset.lang === 'pt' ? 'Preencha os campos obrigatórios.' : 'Please complete the required fields.';
      form.reportValidity(); return;
    }
    if (error) error.textContent = '';
    const pt = form.dataset.lang === 'pt';
    const message = pt
      ? `Olá, Noctem! Meu nome é ${data.name}.${data.company ? ` Empresa: ${data.company}.` : ''} Quero conversar sobre ${data.type}. Objetivo: ${data.goal}`
      : `Hello, Noctem! My name is ${data.name}.${data.company ? ` Company: ${data.company}.` : ''} I would like to discuss ${data.type}. Goal: ${data.goal}`;
    const channel = (event.submitter as HTMLElement | null)?.dataset.contactChannel || 'whatsapp';
    if (channel === 'email') {
      const subject = pt ? `Novo projeto — ${data.type}` : `New project — ${data.type}`;
      const email = form.dataset.email || 'hello@noctem.agency';
      const link = document.createElement('a');
      link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      link.click();
      return;
    }
    window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
}

function setupMotion() {
  const light = setupLightField(reduced);
  if (reduced) {
    setupHomeStatic();
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9, anchors: { offset: -96 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  setupHome({ lenis, light, reduced });
  setupInnerPages({ light });
  setupHud();
  setupMagnetic();
  document.fonts.ready.then(() => {
    setupSplitHeadings('[data-split], .inner-hero h1, .case-hero h1, .section-heading h2:not([data-split]), .case-story h2, .case-signal h2, .about-grid h2');
    ScrollTrigger.refresh();
  });

  const wordmark = document.querySelector<HTMLElement>('[data-wordmark]');
  if (wordmark) gsap.fromTo(wordmark, { yPercent: 30, opacity: 0.25 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: wordmark, start: 'top bottom', end: 'top 78%', scrub: true } });
}

setupPreloader();
setupConsent();
setupSignalCanvas();
setupMenu();
setupChrome();
setupCursor();
setupForm();
setupMotion();
