import gsap from 'gsap';

export function setupMagnetic() {
  if (!matchMedia('(pointer:fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
    const xTo = gsap.quickTo(element, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(element, 'y', { duration: 0.55, ease: 'power3.out' });
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      xTo((event.clientX - (rect.left + rect.width / 2)) * 0.32);
      yTo((event.clientY - (rect.top + rect.height / 2)) * 0.45);
    });
    element.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
