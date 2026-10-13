import { Heart, Code } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20 py-6 sm:py-8 px-4 sm:px-6 border-t border-white/10 bg-black">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
        {/* Logo */}
        <div className="font-display text-xl sm:text-2xl text-white/80 tracking-wider">
          AP
        </div>

        {/* Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-white/40 text-xs sm:text-sm">
          <span>&copy; {currentYear} Anish Paudel</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1">
            Built with <Heart size={12} className="text-red-500 fill-red-500 sm:w-[14px] sm:h-[14px]" /> & <Code size={12} className="text-[#2e5bff] sm:w-[14px] sm:h-[14px]" />
          </span>
        </div>

        {/* Back to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-white/40 text-xs sm:text-sm uppercase tracking-wider hover:text-[#2e5bff] transition-colors"
        >
          Back to Top
        </button>
      </div>
    </footer>
  );
}
