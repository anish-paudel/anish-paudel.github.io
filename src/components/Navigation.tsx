import { useState, useEffect, useRef } from 'react';
import { Menu, X, Gamepad2 } from 'lucide-react';
import gsap from 'gsap';
import GameDisplay from './GameDisplay';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Entrance animation
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, delay: 0.2, ease: 'power4.out' }
      );
    }

    // Stagger links animation
    gsap.fromTo(
      linksRef.current.filter(Boolean),
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.8, ease: 'power2.out' }
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (spotlightRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlightRef.current.style.left = `${x - 50}px`;
      spotlightRef.current.style.top = `${y - 50}px`;
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGameClick = () => {
    setIsGameDialogOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'w-auto px-2 py-2' 
            : 'w-[90%] max-w-4xl px-4 py-3'
        }`}
      >
        <div 
          className={`relative glass rounded-full overflow-hidden transition-all duration-500 ${
            isScrolled ? 'px-4 py-2' : 'px-6 py-3'
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <div
            ref={spotlightRef}
            className="absolute w-[100px] h-[100px] rounded-full bg-[#2e5bff] opacity-10 blur-2xl pointer-events-none transition-all duration-100"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          <div className="relative flex items-center justify-between gap-8">
            {/* Logo */}
            <a 
              href="#home" 
              onClick={(e) => handleLinkClick(e, '#home')}
              className="font-display text-2xl tracking-wider text-white hover:text-[#2e5bff] transition-colors"
            >
              AP
            </a>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  ref={(el) => { linksRef.current[index] = el; }}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="relative text-xs font-semibold uppercase tracking-[2px] text-white/60 hover:text-white transition-all duration-300 group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#2e5bff] transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
              
              {/* Play Game Button - Desktop */}
              <button
                onClick={handleGameClick}
                className="relative flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[2px] text-white bg-[#2e5bff]/20 border border-[#2e5bff]/50 rounded-full hover:bg-[#2e5bff]/40 hover:border-[#2e5bff] transition-all duration-300 group"
              >
                <Gamepad2 size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                Play Game
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white/80 hover:text-[#2e5bff] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-[70%] max-w-sm glass-strong transition-transform duration-500 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-2xl font-display tracking-wider text-white/80 hover:text-[#2e5bff] transition-all duration-300"
                style={{ 
                  transitionDelay: isMobileMenuOpen ? `${index * 100}ms` : '0ms',
                  transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(50px)',
                  opacity: isMobileMenuOpen ? 1 : 0
                }}
              >
                {link.name}
              </a>
            ))}
            
            {/* Play Game Button - Mobile */}
            <button
              onClick={handleGameClick}
              className="flex items-center gap-3 px-6 py-3 text-lg font-display tracking-wider text-white bg-[#2e5bff]/20 border border-[#2e5bff]/50 rounded-full hover:bg-[#2e5bff]/40 transition-all duration-300 mt-4"
              style={{ 
                transitionDelay: isMobileMenuOpen ? '400ms' : '0ms',
                transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(50px)',
                opacity: isMobileMenuOpen ? 1 : 0
              }}
            >
              <Gamepad2 size={24} />
              Play Game
            </button>
          </div>
        </div>
      </div>

      {/* Game Dialog */}
      <GameDisplay 
        isOpen={isGameDialogOpen} 
        onClose={() => setIsGameDialogOpen(false)} 
      />
    </>
  );
}