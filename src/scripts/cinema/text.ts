import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Headings rise line by line from behind a mask, like title cards.
export function setupSplitHeadings(selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((heading) => {
    SplitText.create(heading, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 115,
          rotate: 1.5,
          duration: 1.15,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: heading, start: 'top 90%', once: true },
        });
      },
    });
  });
}
