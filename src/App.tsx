import { useEffect, Suspense, lazy } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initLenis, destroyLenis } from './lib/lenis';

// Components
import Navigation from './components/Navigation';
import ScrollProgress from './components/ScrollProgress';
import Footer from './components/Footer';

// Sections
import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Contact from './sections/Contact';
import Projects from './sections/Projects';

// Lazy load Three.js background for performance
const Background = lazy(() => import('./components/three/Background'));

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Loading fallback for Three.js
function BackgroundFallback() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2e5bff]/10 via-transparent to-[#00f2fe]/10" />
    </div>
  );
}

function App() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Fast-forward animations instead of freezing them (timeScale(0) left
      // entrance animations stuck at their hidden "from" state)
      gsap.globalTimeline.timeScale(100);
      ScrollTrigger.refresh();
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    // Lenis smooth scrolling driven by GSAP's ticker, synced with ScrollTrigger
    const lenis = initLenis();
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      destroyLenis();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Three.js Background */}
      <Suspense fallback={<BackgroundFallback />}>
        <Background />
      </Suspense>

      {/* Grain overlay for filmic quality */}
      <div className="grain-overlay" />

      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
