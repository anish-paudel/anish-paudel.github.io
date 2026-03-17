import { useEffect, useRef } from 'react';
import { X, Gamepad2, Trophy, Clock, Star, Play } from 'lucide-react';
import gsap from 'gsap';

interface Game {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  rating: number;
  icon: React.ReactNode;
  color: string;
}

interface GameDisplayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample games data - you can add more games here
const games: Game[] = [
  {
    id: '1',
    title: 'Space Shooter',
    description: 'Classic arcade shooter with modern twist. Defend the galaxy!',
    difficulty: 'Medium',
    estimatedTime: '5 min',
    rating: 4.5,
    icon: <Gamepad2 size={32} />,
    color: '#2e5bff',
  },
  {
    id: '2',
    title: 'Memory Match',
    description: 'Test your memory with this card matching puzzle game.',
    difficulty: 'Easy',
    estimatedTime: '3 min',
    rating: 4.2,
    icon: <Trophy size={32} />,
    color: '#10b981',
  },
  {
    id: '3',
    title: 'Puzzle Rush',
    description: 'Solve as many puzzles as you can before time runs out.',
    difficulty: 'Hard',
    estimatedTime: '10 min',
    rating: 4.8,
    icon: <Clock size={32} />,
    color: '#f59e0b',
  },
];

export default function GameDisplay({ isOpen, onClose }: GameDisplayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Animate dialog entrance
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      // Animate content scale
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'back.out(1.7)' }
      );

      // Stagger cards animation
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.1, 
          delay: 0.3, 
          ease: 'power2.out' 
        }
      );
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-strong rounded-3xl border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2e5bff]/10 via-transparent to-[#2e5bff]/10" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#2e5bff]/20 border border-[#2e5bff]/30">
                <Gamepad2 size={28} className="text-[#2e5bff]" />
              </div>
              <div>
                <h2 className="text-2xl font-display tracking-wider text-white">
                  Game Center
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  Choose a game to play
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              aria-label="Close dialog"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Games Grid */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <div
                key={game.id}
                ref={(el) => { cardsRef.current[index] = el; }}
                className="group relative glass rounded-2xl p-6 border border-white/10 hover:border-[#2e5bff]/50 transition-all duration-500 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#2e5bff]/10 cursor-pointer overflow-hidden"
              >
                {/* Hover gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${game.color}15, transparent 70%)`
                  }}
                />

                {/* Content */}
                <div className="relative">
                  {/* Icon & Rating */}
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl border transition-colors duration-300"
                      style={{ 
                        backgroundColor: `${game.color}15`,
                        borderColor: `${game.color}30`,
                        color: game.color
                      }}
                    >
                      {game.icon}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-white/80">{game.rating}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-display tracking-wider text-white mb-2 group-hover:text-[#2e5bff] transition-colors duration-300">
                    {game.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
                    {game.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Clock size={14} />
                      {game.estimatedTime}
                    </span>
                  </div>

                  {/* Play Button */}
                  <button 
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm uppercase tracking-wider group-hover:bg-[#2e5bff] group-hover:border-[#2e5bff] transition-all duration-300"
                    onClick={() => console.log(`Starting ${game.title}...`)}
                  >
                    <Play size={18} className="group-hover:scale-110 transition-transform duration-300" />
                    Play Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/10 bg-white/5">
          <p className="text-center text-xs text-white/40">
            More games coming soon • Built with React & GSAP
          </p>
        </div>
      </div>
    </div>
  );
}