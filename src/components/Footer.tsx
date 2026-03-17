import { Heart, Code } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-8 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="font-display text-2xl text-white/80 tracking-wider">
          AP
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <span>&copy; {currentYear} Anish Paudel</span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1">
            Built with <Heart size={14} className="text-red-500 fill-red-500" /> & <Code size={14} className="text-[#2e5bff]" />
          </span>
        </div>

        {/* Back to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-white/40 text-sm uppercase tracking-wider hover:text-[#2e5bff] transition-colors"
        >
          Back to Top
        </button>
      </div>
    </footer>
  );
}
