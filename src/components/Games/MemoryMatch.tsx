import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';

const EMOJI_POOL = ['🚀', '🌟', '⚡', '🔥', '💎', '🎯', '🎮', '🧩'];

type Card = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

interface MemoryMatchProps {
  onExit: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDeck(): Card[] {
  const values = shuffle(EMOJI_POOL).slice(0, 8);
  const deck = shuffle([...values, ...values]).map((value, id) => ({
    id,
    value,
    flipped: false,
    matched: false,
  }));
  return deck;
}

export default function MemoryMatch({ onExit }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const startRef = useRef(Date.now());
  const lockRef = useRef(false);

  useEffect(() => {
    if (won) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(t);
  }, [won]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setWon(true);
    }
  }, [cards]);

  const flip = useCallback(
    (id: number) => {
      if (lockRef.current || won) return;
      setCards(prev => {
        const target = prev.find(c => c.id === id);
        if (!target || target.flipped || target.matched) return prev;
        return prev.map(c => (c.id === id ? { ...c, flipped: true } : c));
      });
      setPicked(prev => {
        if (prev.includes(id) || prev.length >= 2) return prev;
        const next = [...prev, id];
        if (next.length === 2) {
          lockRef.current = true;
          setMoves(m => m + 1);
          setTimeout(() => {
            setCards(current => {
              const [a, b] = next;
              const cardA = current.find(c => c.id === a);
              const cardB = current.find(c => c.id === b);
              if (cardA && cardB && cardA.value === cardB.value) {
                return current.map(c =>
                  c.id === a || c.id === b ? { ...c, matched: true } : c,
                );
              }
              return current.map(c =>
                c.id === a || c.id === b ? { ...c, flipped: false } : c,
              );
            });
            setPicked([]);
            lockRef.current = false;
          }, 420);
        }
        return next;
      });
    },
    [won],
  );

  const reset = useCallback(() => {
    setCards(buildDeck());
    setPicked([]);
    setMoves(0);
    setElapsed(0);
    setWon(false);
    startRef.current = Date.now();
    lockRef.current = false;
  }, []);

  const matchedCount = useMemo(() => cards.filter(c => c.matched).length / 2, [cards]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            <span className="text-white font-semibold">{moves}</span> moves
          </div>
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            <span className="text-emerald-400 font-semibold">{matchedCount}</span>/8
          </div>
          <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            <span className="text-cyan-300 font-semibold">{elapsed}</span>s
          </div>
          <button
            onClick={reset}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Reset"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => {
          const faceUp = card.flipped || card.matched;
          return (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              className="aspect-square relative will-change-transform active:scale-[0.96] transition-transform duration-75"
              style={{ perspective: '800px' }}
              aria-label={faceUp ? card.value : 'hidden card'}
            >
              <div
                className="absolute inset-0"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
                  willChange: 'transform',
                }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#2e5bff]/25 to-[#00f2fe]/15 border border-white/10 flex items-center justify-center text-base text-white/40"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  ?
                </div>
                {/* Front */}
                <div
                  className={`absolute inset-0 rounded-lg flex items-center justify-center text-2xl sm:text-3xl border ${
                    card.matched
                      ? 'bg-emerald-500/20 border-emerald-400/50'
                      : 'bg-white/10 border-white/15'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    transition: 'background-color 200ms ease, border-color 200ms ease',
                  }}
                >
                  {card.value}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Win overlay */}
      {won && (
        <div className="absolute inset-0 -m-4 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl z-10">
          <div className="text-center p-8">
            <Trophy size={56} className="mx-auto text-amber-400 mb-4" />
            <h3 className="text-3xl font-display tracking-wider text-white mb-2">You win!</h3>
            <p className="text-white/60 mb-6">
              {moves} moves · {elapsed}s
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 rounded-full bg-[#2e5bff] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#2e5bff]/80 transition-colors"
              >
                Play Again
              </button>
              <button
                onClick={onExit}
                className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-semibold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
