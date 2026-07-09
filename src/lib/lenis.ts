import Lenis from 'lenis';

let lenis: Lenis | null = null;

export function initLenis(): Lenis {
  if (lenis) return lenis;
  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
    smoothWheel: true,
  });
  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}

export function scrollToSection(target: string) {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }
}
