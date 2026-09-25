import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LightFieldHandle } from './lightfield';
import { onIntroDone } from './intro';

// Inner pages, case studies, and legal pages: title-card heroes and scroll-built compositions.
export function setupInnerPages({ light }: { light: LightFieldHandle | null }) {
  const hero = document.querySelector<HTMLElement>('.inner-hero, .case-hero');
  if (!hero) return;
  if (light) ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onUpdate: (self) => light.setScroll(self.progress) });

  const supporting = hero.querySelectorAll(':scope > .eyebrow, :scope > p:not(.eyebrow), :scope > .legal-meta');
  gsap.set(supporting, { opacity: 0, y: 26 });
  onIntroDone(() => gsap.to(supporting, { opacity: 1, y: 0, stagger: 0.09, duration: 1.1, delay: 0.2, ease: 'power3.out' }));

  // Case stage: the laptop tilts up into place and the devices rise one after another.
  const stage = document.querySelector<HTMLElement>('.case-stage > .project-stage');
  if (stage) {
    gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 98%', end: 'top 30%', scrub: 0.8 } })
      .fromTo(stage, { '--tilt': '22deg', '--lift': '10%', opacity: 0.35 }, { '--tilt': '0deg', '--lift': '0%', opacity: 1, ease: 'power2.out' })
      .fromTo(stage.querySelectorAll('.device'), { '--rise': '38%' }, { '--rise': '0%', stagger: 0.12, ease: 'power3.out' }, 0.1);
  }

  gsap.utils.toArray<HTMLElement>('.showcase-grid figure').forEach((figure) => {
    const frame = figure.querySelector<HTMLElement>(':scope > div');
    const image = figure.querySelector('img');
    if (!frame) return;
    gsap.timeline({ scrollTrigger: { trigger: figure, start: 'top 96%', end: 'top 50%', scrub: 0.6 } })
      .fromTo(frame, { clipPath: 'inset(14% 8% 14% 8% round 1.25rem)' }, { clipPath: 'inset(0% 0% 0% 0% round 1.25rem)', ease: 'none' })
      .fromTo(image, { scale: 1.18 }, { scale: 1, ease: 'none' }, 0);
  });

  gsap.utils.toArray<HTMLElement>('.service-detail article, .values article, .case-story > div, .case-signal, .case-meta > div, .about-grid > div:last-child, .projects-index .portfolio-entry, .contact-layout form, .contact-layout aside, .next-project').forEach((element) => {
    gsap.from(element, { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } });
  });

  const next = document.querySelector<HTMLElement>('.next-project');
  if (next) {
    gsap.fromTo(next.querySelector('.next-project-title'), { letterSpacing: '0.02em', opacity: 0.3 }, { letterSpacing: '-0.06em', opacity: 1, ease: 'none', scrollTrigger: { trigger: next, start: 'top 95%', end: 'center 60%', scrub: true } });
  }

  if (document.querySelector('[data-contact-hero]')) {
    gsap.to('.contact-orb', { scale: 2.4, rotate: 55, opacity: 0.25, scrollTrigger: { trigger: '.contact-hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.contact-marquee>div', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: '.contact-marquee', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
}
