import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { X, Gamepad2, Trophy, Clock, Star, Play, Zap } from 'lucide-react';
import gsap from 'gsap';
import { pushOverlay, popOverlay } from '../lib/overlayState';

const SpaceShooter = lazy(() => import('./Games/SpaceShooter'));
const MemoryMatch = lazy(() => import('./Games/MemoryMatch'));
const SnakeGame = lazy(() => import('./Games/SnakeGame'));

type GameId = 'space-shooter' | 'memory-match' | 'snake';

interface Game {
  id: GameId;
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

const games: Game[] = [
  {
    id: 'space-shooter',
    title: 'Space Shooter',
    description: 'Classic arcade shooter with modern twist. Defend the galaxy!',
    difficulty: 'Medium',
    estimatedTime: '5 min',
    rating: 4.5,
    icon: <Gamepad2 size={32} />,
    color: '#2e5bff',
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Test your memory with this card matching puzzle game.',
    difficulty: 'Easy',
    estimatedTime: '3 min',
    rating: 4.2,
    icon: <Trophy size={32} />,
    color: '#10b981',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Steer the neon snake, eat the dots, do not bite yourself.',
    difficulty: 'Hard',
    estimatedTime: '5 min',
    rating: 4.8,
    icon: <Zap size={32} />,
    color: '#f59e0b',
  },
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'Medium':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'Hard':
      return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    default:
      return 'text-white/60 bg-white/10 border-white/20';
  }
}

export default function GameDisplay({ isOpen, onClose }: GameDisplayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  // Lock scroll and register overlay so Three.js pauses behind us.
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    pushOverlay();
    return () => {
      document.body.style.overflow = '';
      popOverlay();
    };
  }, [isOpen]);

  // Entrance animations — only when the picker (not a game) is on screen.
  useEffect(() => {
    if (!isOpen || activeGame) return;

    gsap.fromTo(dialogRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(
      contentRef.current,
      { scale: 0.95, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.35, delay: 0.05, ease: 'power3.out' },
    );
    gsap.fromTo(
      cardsRef.current.filter(Boolean),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.15, ease: 'power2.out' },
    );
  }, [isOpen, activeGame]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (activeGame) return; // never dismiss mid-game
    if (e.target === dialogRef.current) onClose();
  };

  const handleClose = () => {
    setActiveGame(null);
    onClose();
  };

  if (!isOpen) return null;

  // When a game is active, render it fullscreen in place of the picker.
  if (activeGame === 'space-shooter') {
    return (
      <Suspense fallback={null}>
        <SpaceShooter isOpen onClose={() => setActiveGame(null)} />
      </Suspense>
    );
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-strong rounded-3xl border border-white/10 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="relative px-6 sm:px-8 py-5 border-b border-white/10 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2e5bff]/10 via-transparent to-[#2e5bff]/10" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-[#2e5bff]/20 border border-[#2e5bff]/30">
                <Gamepad2 size={26} className="text-[#2e5bff]" />
              </div>
              <div>
                <h2 className="text-2xl font-display tracking-wider text-white">Game Center</h2>
                <p className="text-sm text-white/50 mt-1">
                  {activeGame ? 'Playing' : 'Choose a game to play'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors"
              aria-label="Close dialog"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {activeGame === 'memory-match' && (
            <Suspense fallback={<div className="text-white/60 text-center py-10">Loading…</div>}>
              <MemoryMatch onExit={() => setActiveGame(null)} />
            </Suspense>
          )}

          {activeGame === 'snake' && (
            <Suspense fallback={<div className="text-white/60 text-center py-10">Loading…</div>}>
              <SnakeGame onExit={() => setActiveGame(null)} />
            </Suspense>
          )}

          {!activeGame && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  ref={el => {
                    cardsRef.current[index] = el;
                  }}
                  className="group relative glass rounded-2xl p-6 border border-white/10 hover:border-[#2e5bff]/50 transition-colors duration-300 overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${game.color}15, transparent 70%)`,
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="p-3 rounded-xl border"
                        style={{
                          backgroundColor: `${game.color}15`,
                          borderColor: `${game.color}30`,
                          color: game.color,
                        }}
                      >
                        {game.icon}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-white/80">{game.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-display tracking-wider text-white mb-2">
                      {game.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
                      {game.description}
                    </p>

                    <div className="flex items-center gap-3 mb-6">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(
                          game.difficulty,
                        )}`}
                      >
                        {game.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/40">
                        <Clock size={14} />
                        {game.estimatedTime}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveGame(game.id)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#2e5bff] hover:border-[#2e5bff] active:scale-[0.97] transition-[background-color,border-color,transform] duration-150"
                    >
                      <Play size={18} />
                      Play Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!activeGame && (
          <div className="px-6 sm:px-8 py-3 border-t border-white/10 bg-white/5 shrink-0">
            <p className="text-center text-xs text-white/40">
              Built with React & GSAP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
