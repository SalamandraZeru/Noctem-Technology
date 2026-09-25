import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FPS = 24;
const RUNTIME_SECONDS = 180;
const pad = (value: number) => String(value).padStart(2, '0');
export const timecode = (frames: number) => {
  const totalSeconds = Math.floor(frames / FPS);
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor(totalSeconds / 60) % 60)}:${pad(totalSeconds % 60)}:${pad(frames % FPS)}`;
};

// Scene counter and a timecode that runs with the scroll, as if the page were a three-minute film.
export function setupHud() {
  const hud = document.querySelector<HTMLElement>('[data-hud]');
  if (!hud) return;
  const scene = hud.querySelector<HTMLElement>('[data-hud-scene]');
  const label = hud.querySelector<HTMLElement>('[data-hud-label]');
  const clock = hud.querySelector<HTMLElement>('[data-hud-tc]');
  const footer = document.querySelector<HTMLElement>('.site-footer');

  document.querySelectorAll<HTMLElement>('[data-scene]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (!self.isActive) return;
        if (scene) scene.textContent = `SC ${section.dataset.scene}`;
        if (label) label.textContent = section.dataset.sceneLabel || '';
      },
    });
  });

  let frame = 0;
  const update = () => {
    frame = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    if (clock) clock.textContent = timecode(Math.round((scrollY / max) * RUNTIME_SECONDS * FPS));
    const footerVisible = footer ? footer.getBoundingClientRect().top < innerHeight * 0.92 : false;
    hud.classList.toggle('is-visible', scrollY > innerHeight * 0.35 && !footerVisible);
  };
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  update();
}
