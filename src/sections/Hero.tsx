import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [displayText, setDisplayText] = useState({ line1: '', line2: '' });
  const [glitchActive, setGlitchActive] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);

  const line1 = 'ANISH';
  const line2 = 'PAUDEL';

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      const particles: Particle[] = [];
      const spacing = 60;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particles.push({
            x: i * spacing + spacing / 2,
            y: j * spacing + spacing / 2,
            baseX: i * spacing + spacing / 2,
            baseY: j * spacing + spacing / 2,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? '#2e5bff' : '#00f2fe',
            vx: 0,
            vy: 0
          });
        }
      }
      particlesRef.current = particles;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          const pushX = Math.cos(angle) * force * 5;
          const pushY = Math.sin(angle) * force * 5;
          
          particle.vx -= pushX;
          particle.vy -= pushY;
        }

        const homeX = particle.baseX - particle.x;
        const homeY = particle.baseY - particle.y;
        
        particle.vx += homeX * 0.05;
        particle.vy += homeY * 0.05;
        particle.vx *= 0.9;
        particle.vy *= 0.9;

        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        particlesRef.current.forEach((other) => {
          const dist = Math.sqrt(
            Math.pow(particle.x - other.x, 2) + 
            Math.pow(particle.y - other.y, 2)
          );
          if (dist < 100 && dist > 0) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(46, 91, 255, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Typing effect with glitch
  useEffect(() => {
    let currentIndex = 0;
    const fullText = `${line1} ${line2}`;
    
    const typeChar = () => {
      if (currentIndex <= fullText.length) {
        const text = fullText.substring(0, currentIndex);
        const spaceIndex = text.indexOf(' ');
        
        setDisplayText({
          line1: spaceIndex > -1 ? text.substring(0, spaceIndex) : text,
          line2: spaceIndex > -1 ? text.substring(spaceIndex + 1) : ''
        });
        
        currentIndex++;
        const delay = currentIndex === fullText.length ? 500 : 80 + Math.random() * 60;
        setTimeout(typeChar, delay);
      } else {
        setIsTypingDone(true);
        // Trigger glitch sequence
        const glitchSequence = async () => {
          setGlitchActive(true);
          await new Promise(r => setTimeout(r, 100));
          setGlitchActive(false);
          await new Promise(r => setTimeout(r, 100));
          setGlitchActive(true);
          await new Promise(r => setTimeout(r, 100));
          setGlitchActive(false);
        };
        glitchSequence();
      }
    };

    setTimeout(typeChar, 300);
  }, []);

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { 
          opacity: 0, 
          rotateX: 45,
          y: 100,
          scale: 0.8
        },
        { 
          opacity: 1, 
          rotateX: 0,
          y: 0,
          scale: 1,
          duration: 1.4, 
          ease: 'power4.out',
          delay: 0.2
        }
      );

      const chars = subtitleRef.current?.querySelectorAll('.char');
      if (chars) {
        gsap.fromTo(
          chars,
          { 
            opacity: 0, 
            y: 50,
            rotateY: -90
          },
          { 
            opacity: 1, 
            y: 0,
            rotateY: 0,
            duration: 0.6,
            stagger: 0.02,
            ease: 'back.out(1.7)',
            delay: 1.2
          }
        );
      }

      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: 1.8,
          ease: 'power3.out'
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Spotlight Effect */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `radial-gradient(circle at ${mouseRef.current.x}px ${mouseRef.current.y}px, rgba(46, 91, 255, 0.15) 0%, transparent 40%)`
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        
        {/* Pre-title Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/70 font-mono tracking-[0.2em] uppercase">Available for Projects</span>
        </div>

        {/* Main Title with All Effects */}
        <div 
          ref={titleRef} 
          className="relative mb-8"
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        >
          {/* Background Glow */}
          <div className="absolute inset-0 blur-3xl opacity-40 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-gradient-to-r from-[#2e5bff] to-[#00f2fe] rounded-full" />
          </div>

          <h1 className="relative font-display text-[clamp(4rem,15vw,12rem)] leading-[0.85] tracking-tighter select-none">
            {/* Line 1: ANISH */}
            <span className="block relative">
              {/* Shadow Layer */}
              <span 
                className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-transparent blur-md transform translate-y-4 pointer-events-none"
                style={{ WebkitTextStroke: '0px' }}
              >
                {displayText.line1}
              </span>
              
              {/* Main Text with Glitch */}
              <span 
                className={`relative block bg-gradient-to-b from-white via-white to-white/80 bg-clip-text text-transparent transition-transform duration-75 ${
                  glitchActive ? 'skew-x-6 translate-x-2' : ''
                }`}
              >
                {displayText.line1}
                
                {/* Glitch Layer 1 - Red */}
                <span 
                  className={`absolute inset-0 text-[#ff2e63] opacity-0 mix-blend-screen pointer-events-none ${
                    glitchActive ? 'opacity-80 -translate-x-2' : ''
                  }`}
                  style={{ 
                    textShadow: '2px 0 #ff2e63',
                    WebkitTextStroke: '0px'
                  }}
                  aria-hidden="true"
                >
                  {displayText.line1}
                </span>
                
                {/* Glitch Layer 2 - Cyan */}
                <span 
                  className={`absolute inset-0 text-[#00f2fe] opacity-0 mix-blend-screen pointer-events-none ${
                    glitchActive ? 'opacity-80 translate-x-2' : ''
                  }`}
                  style={{ 
                    textShadow: '-2px 0 #00f2fe',
                    WebkitTextStroke: '0px'
                  }}
                  aria-hidden="true"
                >
                  {displayText.line1}
                </span>
              </span>

              {/* Underline */}
              <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2e5bff] to-transparent opacity-50" />
            </span>

            {/* Line 2: PAUDEL */}
            <span className="block relative mt-2">
              {/* Animated Gradient Fill */}
              <span 
                className={`absolute inset-0 bg-gradient-to-r from-[#2e5bff] via-[#00f2fe] via-[#ff2e63] to-[#2e5bff] bg-clip-text text-transparent bg-[length:300%_100%] animate-gradient-x pointer-events-none ${
                  glitchActive ? 'blur-sm' : ''
                }`}
                style={{
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {displayText.line2}
              </span>

              {/* Stroke Text */}
              <span 
                className={`relative block text-transparent transition-transform duration-75 ${
                  glitchActive ? 'skew-x-[-6deg] translate-x-[-4px]' : ''
                }`}
                style={{
                  WebkitTextStroke: '3px rgba(255,255,255,0.95)',
                  paintOrder: 'stroke fill'
                }}
              >
                {displayText.line2}
              </span>

              {/* Glitch Stroke Layers */}
              <span 
                className={`absolute inset-0 text-transparent pointer-events-none transition-all duration-75 ${
                  glitchActive ? 'opacity-70 translate-x-[4px]' : 'opacity-0'
                }`}
                style={{ 
                  WebkitTextStroke: '3px #2e5bff',
                  transform: glitchActive ? 'translateX(4px)' : 'none'
                }}
                aria-hidden="true"
              >
                {displayText.line2}
              </span>
              
              <span 
                className={`absolute inset-0 text-transparent pointer-events-none transition-all duration-75 ${
                  glitchActive ? 'opacity-70 -translate-x-[4px]' : 'opacity-0'
                }`}
                style={{ 
                  WebkitTextStroke: '3px #00f2fe',
                  transform: glitchActive ? 'translateX(-4px)' : 'none'
                }}
                aria-hidden="true"
              >
                {displayText.line2}
              </span>

              {/* Shine Effect */}
              <span 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent bg-[length:200%_100%] animate-shine bg-clip-text text-transparent pointer-events-none"
                style={{
                  WebkitTextFillColor: 'transparent',
                  backgroundPosition: '200% center',
                }}
              >
                {displayText.line2}
              </span>

              {/* Cursor */}
              {isTypingDone && (
                <span className="absolute -right-8 top-0 text-[#2e5bff] animate-blink">_</span>
              )}
            </span>
          </h1>

          {/* Side Accents */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="w-[2px] h-24 bg-gradient-to-b from-transparent via-[#2e5bff] to-transparent animate-pulse" />
          </div>
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="w-[2px] h-24 bg-gradient-to-b from-transparent via-[#00f2fe] to-transparent animate-pulse delay-300" />
          </div>
        </div>

        {/* Subtitle */}
        <div ref={subtitleRef} className="mb-12 max-w-3xl mx-auto">
          <p className="text-lg sm:text-2xl text-white/60 font-light leading-relaxed">
            {'Technical Solutions Architect'.split('').map((char, i) => (
              <span key={i} className="char inline-block" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
                {char}
              </span>
            ))}
            <span className="mx-2 text-[#2e5bff] inline-block animate-pulse">•</span>
            {'Microsoft D365 BC'.split('').map((char, i) => (
              <span key={`d365-${i}`} className="char inline-block text-white font-medium" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
                {char}
              </span>
            ))}
            <span className="mx-2 text-[#00f2fe] inline-block animate-pulse delay-150">•</span>
            {'.NET'.split('').map((char, i) => (
              <span key={`net-${i}`} className="char inline-block text-white font-medium" style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
                {char}
              </span>
            ))}
          </p>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button
            onClick={() => scrollToSection('#projects')}
            className="group relative px-8 py-4 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(46,91,255,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#2e5bff] to-[#00f2fe] transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative flex items-center gap-3 text-white font-semibold text-sm uppercase tracking-[2px]">
              <Sparkles size={18} className="animate-spin-slow" />
              View Projects
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => scrollToSection('#contact')}
            className="group relative px-8 py-4 rounded-full overflow-hidden border border-white/20 hover:border-[#2e5bff]/50 transition-all duration-300 hover:scale-105 bg-white/5 hover:bg-white/10"
          >
            <span className="relative flex items-center gap-3 text-white/80 group-hover:text-white font-semibold text-sm uppercase tracking-[2px] transition-colors">
              Get in Touch
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 flex items-center justify-center gap-12">
          {[
            { num: '5+', label: 'Years' },
            { num: '50+', label: 'Projects' },
            { num: '20+', label: 'Clients' }
          ].map((stat, i) => (
            <div key={i} className="text-center group cursor-default">
              <div className="text-3xl font-display text-white mb-1 group-hover:text-[#2e5bff] transition-colors duration-300 relative">
                {stat.num}
                <span className="absolute -inset-2 bg-[#2e5bff]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
              </div>
              <div className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer group"
        onClick={() => scrollToSection('#about')}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2 group-hover:border-[#2e5bff]/50 transition-colors">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-scroll" />
        </div>
        <span className="text-[10px] text-white/30 uppercase tracking-[3px] group-hover:text-white/60 transition-colors">Scroll</span>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes gradient-x {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .animate-gradient-x {
          animation: gradient-x 4s linear infinite;
        }
        
        .animate-shine {
          animation: shine 3s linear infinite;
        }
        
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </section>
  );
}