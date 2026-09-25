import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type Lenis from 'lenis';
import type { LightFieldHandle } from './lightfield';
import { onIntroDone } from './intro';
import { timecode } from './hud';
import { setupClocks, setupGlobe } from './globe';

interface HomeContext {
  lenis: Lenis;
  light: LightFieldHandle | null;
  reduced: boolean;
}

const wide = () => innerWidth > 1100;

// Scene 01: opening title, then a dolly into the gecko as the visitor scrolls.
function hero({ light }: HomeContext) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const [firstLine, accentLine] = hero.querySelectorAll<HTMLElement>('[data-hero-line]');
  const chars = firstLine ? SplitText.create(firstLine, { type: 'chars', charsClass: 'hero-char', aria: 'none' }).chars : [];
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .from('.hero .eyebrow', { opacity: 0, y: 16, duration: 0.9 })
    .from(chars, { yPercent: 118, opacity: 0, rotateX: -70, transformOrigin: '50% 100%', duration: 1.2, stagger: 0.028 }, 0.05)
    .fromTo(accentLine, { clipPath: 'inset(0 100% 0 0)', filter: 'blur(10px)' }, { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)', duration: 1.5, ease: 'power3.inOut', clearProps: 'clipPath,filter' }, 0.35)
    .from('.hero-intro, .hero-actions', { opacity: 0, y: 26, duration: 1, stagger: 0.08 }, 0.7)
    .from('.signal-art img', { scale: 0.55, opacity: 0, rotate: 14, filter: 'blur(18px)', duration: 1.8, ease: 'expo.out', clearProps: 'filter' }, 0)
    .from('.hero-depth i', { scale: 0.45, opacity: 0, stagger: 0.09, duration: 1.5 }, 0.1)
    .from('.anamorphic', { scaleX: 0, opacity: 0, duration: 1.6, ease: 'power4.inOut' }, 0.2);
  onIntroDone(() => intro.play());

  if (wide()) {
    gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: 'top top', end: '+=135%', scrub: 0.75, pin: true, anticipatePin: 1,
        onUpdate: (self) => light?.setScroll(self.progress),
      },
    })
      .fromTo('.hero-copy', { z: 0, scale: 1, yPercent: 0 }, { z: 120, scale: 1.04, yPercent: -4, ease: 'none' }, 0)
      .fromTo('.hero-intro,.hero-actions,.hero .eyebrow', { opacity: 1, y: 0 }, { opacity: 0, y: -50, ease: 'none', immediateRender: false }, 0)
      .fromTo('[data-hero-title]', { scale: 1, opacity: 1, filter: 'blur(0px)' }, { scale: 1.08, opacity: 0.08, filter: 'blur(5px)', ease: 'none' }, 0.18)
      .to('.signal-art', { scale: 2.1, z: 300, rotateZ: -11, opacity: 0.5, ease: 'none' }, 0)
      .to('.hero-depth', { scale: 2.8, rotateZ: 18, opacity: 0, ease: 'none' }, 0)
      .to('.anamorphic', { scaleX: 1.6, opacity: 0, ease: 'none' }, 0)
      .fromTo('.scroll-cue,.hero-index', { opacity: 1 }, { opacity: 0, ease: 'none' }, 0);
  } else {
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.55, onUpdate: (self) => light?.setScroll(self.progress) } })
      .to('.signal-art', { yPercent: 28, scale: 1.22, rotateZ: -7, ease: 'none' }, 0)
      .to('.hero-depth', { yPercent: 12, scale: 1.35, rotateZ: 14, ease: 'none' }, 0)
      .to('.scroll-cue', { opacity: 0, y: -18, ease: 'none' }, 0);
    gsap.to('.signal-art img', { y: -12, duration: 2.7, delay: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.signal-orbit', { rotate: '+=26', duration: 18, repeat: -1, ease: 'none' });
  }

  const art = document.querySelector<HTMLElement>('[data-signal-art]');
  if (art && matchMedia('(pointer:fine)').matches) {
    addEventListener('pointermove', (event) => {
      const x = (event.clientX / innerWidth - 0.5) * 22;
      const y = (event.clientY / innerHeight - 0.5) * 22;
      gsap.to(art, { rotateY: x * 0.55, rotateX: -y * 0.38, x, y, duration: 1.2, ease: 'power2.out' });
    }, { passive: true });
  }
}

function kinetic() {
  if (!document.querySelector('[data-kinetic]')) return;
  const trigger = { trigger: '[data-kinetic]', start: 'top bottom', end: 'bottom top', scrub: 0.65 };
  gsap.to('.track-forward', { xPercent: -24, ease: 'none', scrollTrigger: trigger });
  gsap.fromTo('.track-reverse', { xPercent: -28 }, { xPercent: -4, ease: 'none', scrollTrigger: { ...trigger } });
}

// Scene 02: the manifesto lights up one word at a time.
function manifesto() {
  const section = document.querySelector<HTMLElement>('[data-manifesto]');
  const text = section?.querySelector<HTMLElement>('[data-manifesto-text]');
  if (!section || !text) return;
  const { words } = SplitText.create(text, { type: 'words', wordsClass: 'word' });
  const pin = wide();
  gsap.timeline({ scrollTrigger: { trigger: section, start: pin ? 'top top' : 'top 78%', end: pin ? '+=110%' : 'bottom 55%', scrub: 0.6, pin } })
    .fromTo(words, { opacity: 0.1, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)', stagger: 0.1, ease: 'none' })
    .from('[data-manifesto-note]', { opacity: 0, y: 30, ease: 'none' }, '>-0.3')
    .from('.manifesto .section-kicker', { opacity: 0, x: -20, ease: 'none' }, 0);
}

// Scene 03: a small window on the portfolio opens into a full-bleed, letterboxed reel.
function reel({ reduced }: HomeContext) {
  const section = document.querySelector<HTMLElement>('[data-reel]');
  const frame = section?.querySelector<HTMLElement>('[data-reel-frame]');
  if (!section || !frame) return;
  const bar = () => Math.max(0, Math.min(innerHeight * (innerWidth < 700 ? 0.14 : 0.2), (innerHeight - innerWidth / 2.39) / 2));
  gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true } })
    .fromTo(frame, { '--inset-y': '24%', '--inset-x': '26%', '--radius': '1.6rem', '--zoom': 1.22 }, { '--inset-y': '0%', '--inset-x': '0%', '--radius': '0rem', '--zoom': 1, ease: 'power2.inOut', duration: 0.55 })
    .fromTo(section, { '--bar': '0px' }, { '--bar': () => `${bar()}px`, ease: 'power2.inOut', duration: 0.22 }, 0.5)
    .from('.reel-title > *', { y: 70, opacity: 0, stagger: 0.04, duration: 0.24, ease: 'power3.out' }, 0.36)
    .to({}, { duration: 0.18 });

  if (reduced) return;
  // The montage frames only download as the reel approaches, not with the rest of the page.
  const pending = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    pending.disconnect();
    section.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((image) => { image.src = image.dataset.src!; image.removeAttribute('data-src'); });
  }, { rootMargin: '50% 0px' });
  pending.observe(section);
  const shots = [...section.querySelectorAll<HTMLElement>('[data-reel-shot]')];
  const client = section.querySelector<HTMLElement>('[data-reel-client]');
  const clock = section.querySelector<HTMLElement>('[data-reel-timecode]');
  let index = 0;
  let timer = 0;
  let started = 0;
  let raf = 0;
  const advance = () => {
    shots[index].classList.remove('is-active');
    index = (index + 1) % shots.length;
    shots[index].classList.add('is-active');
    if (client) client.textContent = shots[index].dataset.client || '';
  };
  const tick = (now: number) => {
    if (clock) clock.textContent = timecode(Math.floor(((now - started) / 1000) * 24));
    raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !timer) {
      timer = window.setInterval(advance, 2600);
      started = started || performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && timer) {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      timer = 0;
    }
  }).observe(frame);
}

// Scene 04: projects travel sideways like frames of film (desktop); cards rise elsewhere.
function films({ lenis }: HomeContext) {
  const section = document.querySelector<HTMLElement>('[data-films]');
  const track = section?.querySelector<HTMLElement>('[data-films-track]');
  if (!section || !track) return;
  const cards = [...track.querySelectorAll<HTMLElement>('.portfolio-entry')];
  const media = gsap.matchMedia();
  media.add('(min-width: 1101px)', () => {
    const counter = section.querySelector<HTMLElement>('[data-films-count]');
    const progress = section.querySelector<HTMLElement>('[data-films-progress]');
    const distance = () => Math.max(0, track.scrollWidth - innerWidth);
    const travel = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section, pin: true, start: 'top top', end: () => `+=${distance()}`, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;
          if (counter) counter.textContent = String(Math.min(cards.length, Math.floor(self.progress * cards.length * 0.999) + 1)).padStart(2, '0');
        },
      },
    });
    cards.forEach((card) => {
      // Opacity and scale only: an animated filter here re-rasterized every card on each frame.
      gsap.fromTo(card, { scale: 0.9, opacity: 0.35 }, {
        scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { containerAnimation: travel, trigger: card, start: 'left 92%', end: 'left 45%', scrub: true },
      });
    });
    // Keyboard users tab through cards that sit off-screen: move the film to the focused frame.
    const onFocus = (event: FocusEvent) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>('.portfolio-entry');
      const trigger = travel.scrollTrigger;
      if (!card || !trigger) return;
      const ratio = Math.min(1, Math.max(0, (card.offsetLeft - (innerWidth - card.offsetWidth) / 2) / Math.max(1, distance())));
      lenis.scrollTo(trigger.start + ratio * (trigger.end - trigger.start), { immediate: true });
    };
    track.addEventListener('focusin', onFocus);
    return () => track.removeEventListener('focusin', onFocus);
  });
  media.add('(max-width: 1100px)', () => {
    gsap.from(cards, { y: 70, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: track, start: 'top 85%', once: true } });
  });
}

// Scene 05: rows roll their titles; a preview of real work follows the cursor.
function services() {
  const section = document.querySelector<HTMLElement>('[data-services]');
  if (!section) return;
  const rows = [...section.querySelectorAll<HTMLElement>('.service-list article')];
  gsap.from(rows, { yPercent: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: rows[0], start: 'top 88%', once: true } });

  const preview = section.querySelector<HTMLElement>('[data-service-preview]');
  if (!preview || !matchMedia('(pointer:fine) and (min-width: 901px)').matches) return;
  const images = new Map([...preview.querySelectorAll<HTMLImageElement>('[data-preview-image]')].map((image) => [image.dataset.previewImage, image]));
  // Previews are only useful with a mouse over the list: fetch them when the section comes near.
  const nearby = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    nearby.disconnect();
    images.forEach((image) => { if (image.dataset.src) { image.src = image.dataset.src; image.removeAttribute('data-src'); } });
  }, { rootMargin: '50% 0px' });
  nearby.observe(section);
  gsap.set(preview, { yPercent: -50, scale: 0.7, rotate: -4 });
  const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3.out' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3.out' });
  const list = section.querySelector<HTMLElement>('.service-list')!;
  list.addEventListener('pointermove', (event) => { xTo(event.clientX + 36); yTo(event.clientY); });
  rows.forEach((row) => row.addEventListener('pointerenter', (event) => {
    // Entering from a scroll (no pointermove yet): place the preview under the pointer first.
    if (Number(gsap.getProperty(preview, 'opacity')) === 0) gsap.set(preview, { x: event.clientX + 36, y: event.clientY });
    images.forEach((image, key) => image.classList.toggle('is-active', key === row.dataset.preview));
    gsap.to(preview, { autoAlpha: 1, scale: 1, rotate: gsap.utils.random(-5, 5), duration: 0.6, ease: 'expo.out' });
  }));
  list.addEventListener('pointerleave', () => gsap.to(preview, { autoAlpha: 0, scale: 0.7, duration: 0.45, ease: 'power3.in' }));
}

// Scene 06: the timeline draws itself and lights each step as it passes.
function process() {
  const section = document.querySelector<HTMLElement>('[data-process]');
  if (!section) return;
  const ghost = section.querySelector<HTMLElement>('[data-process-ghost]');
  gsap.fromTo('[data-process-fill]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.process-track', start: 'top 62%', end: 'bottom 62%', scrub: true } });
  const steps = [...section.querySelectorAll<HTMLElement>('[data-process-step]')];
  steps.forEach((step, index) => ScrollTrigger.create({
    trigger: step, start: 'top 62%',
    onEnter: () => { step.classList.add('is-active'); if (ghost) ghost.textContent = step.dataset.processStep || ''; },
    onLeaveBack: () => { step.classList.remove('is-active'); if (ghost) ghost.textContent = steps[Math.max(0, index - 1)].dataset.processStep || ''; },
  }));
}

function world(context: HomeContext) {
  const section = document.querySelector<HTMLElement>('[data-world]');
  if (!section) return;
  setupClocks();
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    void setupGlobe(context.reduced);
  }, { rootMargin: '600px 0px' });
  observer.observe(section);
  gsap.from('.globe-wrap', { scale: 0.8, opacity: 0, rotate: -12, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 75%', once: true } });
  gsap.from('.clocks li', { y: 24, opacity: 0, stagger: 0.07, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.clocks', start: 'top 92%', once: true } });
}

function credits() {
  if (!document.querySelector('[data-credits]')) return;
  gsap.to('.cta-signal', { rotate: -35, scale: 1.5, scrollTrigger: { trigger: '.final-cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.credits > div', { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.credits', start: 'top 92%', once: true } });
}

export function setupHome(context: HomeContext) {
  if (!document.querySelector('[data-hero]')) return;
  hero(context);
  kinetic();
  manifesto();
  reel(context);
  films(context);
  services();
  process();
  world(context);
  credits();
}

// Reduced motion keeps the static composition but still shows live data.
export function setupHomeStatic() {
  if (document.querySelector('[data-world]')) {
    setupClocks();
    void setupGlobe(true);
  }
}
