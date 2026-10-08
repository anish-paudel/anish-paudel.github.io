import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Play, Pause } from 'lucide-react';

const GRID = 20;
const CELL = 20;
const START_TICK_MS = 170; // slow at the start
const MIN_TICK_MS = 70;    // floor for the fastest speed
const SPEEDUP_MS = 6;      // shaved off the tick on every food eaten
const BIG_FOOD_EVERY = 5;        // regular foods between big foods
const BIG_FOOD_DURATION_MS = 7000;
const BIG_FOOD_SCORE = 50;

type Vec = { x: number; y: number };
type Dir = 'U' | 'D' | 'L' | 'R';

const DIR_VEC: Record<Dir, Vec> = {
  U: { x: 0, y: -1 },
  D: { x: 0, y: 1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = { U: 'D', D: 'U', L: 'R', R: 'L' };

interface SnakeGameProps {
  onExit: () => void;
}

function randFood(snake: Vec[]): Vec {
  while (true) {
    const f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some(s => s.x === f.x && s.y === f.y)) return f;
  }
}

function initialSnake(): Vec[] {
  // Start length 2; each food eaten adds exactly one segment.
  return [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
  ];
}

function randBigFood(snake: Vec[], food: Vec): Vec | null {
  for (let attempts = 0; attempts < 100; attempts++) {
    const bx = Math.floor(Math.random() * (GRID - 1));
    const by = Math.floor(Math.random() * (GRID - 1));
    const cells = [
      { x: bx, y: by },
      { x: bx + 1, y: by },
      { x: bx, y: by + 1 },
      { x: bx + 1, y: by + 1 },
    ];
    const conflict = cells.some(
      c =>
        (food.x === c.x && food.y === c.y) ||
        snake.some(s => s.x === c.x && s.y === c.y),
    );
    if (!conflict) return { x: bx, y: by };
  }
  return null;
}

export default function SnakeGame({ onExit }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const snakeRef = useRef<Vec[]>(initialSnake());
  const foodRef = useRef<Vec>(randFood(snakeRef.current));
  const dirRef = useRef<Dir>('R');
  const queuedDirRef = useRef<Dir | null>(null);
  const lastTickRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const tickMsRef = useRef(START_TICK_MS);
  const bigFoodRef = useRef<Vec | null>(null);
  const bigFoodExpiresAtRef = useRef(0);
  const foodsSinceBigRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pauseStartRef = useRef<number | null>(null);

  const [bigFoodMsLeft, setBigFoodMsLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('snake:high') : null;
    return raw ? parseInt(raw, 10) || 0 : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const playBeep = useCallback((freq: number, duration = 0.12, type: OscillatorType = 'square') => {
    try {
      if (!audioCtxRef.current) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        audioCtxRef.current = new Ctor();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      o.connect(g).connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      o.stop(ctx.currentTime + duration);
    } catch {
      /* ignore */
    }
  }, []);

  // Build the static board background once and cache it on an offscreen canvas.
  const buildGrid = useCallback(() => {
    const W = GRID * CELL;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = W;
    const octx = off.getContext('2d');
    if (!octx) return;
    octx.fillStyle = '#0a0a0a';
    octx.fillRect(0, 0, W, W);
    gridCanvasRef.current = off;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = GRID * CELL;
    if (!gridCanvasRef.current) buildGrid();

    if (gridCanvasRef.current) {
      ctx.drawImage(gridCanvasRef.current, 0, 0);
    } else {
      ctx.clearRect(0, 0, W, W);
    }

    // Food — flat red square.
    const f = foodRef.current;
    ctx.fillStyle = '#e53935';
    ctx.fillRect(f.x * CELL + 2, f.y * CELL + 2, CELL - 4, CELL - 4);

    // Big food — flashing 2x2 yellow block, flashes faster near expiry.
    const big = bigFoodRef.current;
    if (big) {
      const msLeft = Math.max(0, bigFoodExpiresAtRef.current - performance.now());
      const flashPeriod = msLeft < 2000 ? 120 : 260;
      const visible = Math.floor(performance.now() / flashPeriod) % 2 === 0;
      if (visible) {
        ctx.fillStyle = '#ffd600';
        ctx.fillRect(big.x * CELL + 2, big.y * CELL + 2, CELL * 2 - 4, CELL * 2 - 4);
      }
    }

    // Snake — flat green squares, classic look.
    const snake = snakeRef.current;
    ctx.fillStyle = '#4caf50';
    for (let i = 0; i < snake.length; i++) {
      const seg = snake[i];
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    }
  }, [buildGrid]);

  const tick = useCallback(() => {
    if (queuedDirRef.current && queuedDirRef.current !== OPPOSITE[dirRef.current]) {
      dirRef.current = queuedDirRef.current;
    }
    queuedDirRef.current = null;

    // Expire big food if its timer ran out.
    if (bigFoodRef.current && performance.now() > bigFoodExpiresAtRef.current) {
      bigFoodRef.current = null;
    }

    const snake = snakeRef.current;
    const head = snake[0];
    const v = DIR_VEC[dirRef.current];
    const next: Vec = { x: head.x + v.x, y: head.y + v.y };

    // Wall collision
    if (next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID) {
      setGameOver(true);
      return;
    }

    const ate = next.x === foodRef.current.x && next.y === foodRef.current.y;
    let ateBig = false;
    const big = bigFoodRef.current;
    if (big) {
      if (
        (next.x === big.x || next.x === big.x + 1) &&
        (next.y === big.y || next.y === big.y + 1)
      ) {
        ateBig = true;
      }
    }

    // Self collision (ignore the tail which will move away unless we grow)
    const grow = ate || ateBig;
    const body = grow ? snake : snake.slice(0, -1);
    if (body.some(s => s.x === next.x && s.y === next.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [next, ...body];
    snakeRef.current = newSnake;

    const bumpScore = (delta: number) => {
      setScore(s => {
        const ns = s + delta;
        setHighScore(h => {
          if (ns > h) {
            try {
              window.localStorage.setItem('snake:high', String(ns));
            } catch {
              /* ignore */
            }
            return ns;
          }
          return h;
        });
        return ns;
      });
    };

    if (ateBig) {
      bigFoodRef.current = null;
      playBeep(880, 0.1);
      window.setTimeout(() => playBeep(1320, 0.14), 90);
      bumpScore(BIG_FOOD_SCORE);
    }

    if (ate) {
      foodRef.current = randFood(newSnake);
      tickMsRef.current = Math.max(MIN_TICK_MS, tickMsRef.current - SPEEDUP_MS);
      playBeep(660, 0.08);
      bumpScore(10);
      foodsSinceBigRef.current += 1;
      if (foodsSinceBigRef.current >= BIG_FOOD_EVERY && !bigFoodRef.current) {
        const spot = randBigFood(newSnake, foodRef.current);
        if (spot) {
          bigFoodRef.current = spot;
          bigFoodExpiresAtRef.current = performance.now() + BIG_FOOD_DURATION_MS;
          foodsSinceBigRef.current = 0;
          playBeep(990, 0.09);
          window.setTimeout(() => playBeep(1240, 0.12), 100);
        }
      }
    }
  }, [playBeep]);

  // Keep the big-food countdown pause-aware: on pause, remember when;
  // on resume, push the expiry forward by the paused duration.
  useEffect(() => {
    if (paused) {
      pauseStartRef.current = performance.now();
    } else if (pauseStartRef.current != null) {
      const paused_ms = performance.now() - pauseStartRef.current;
      if (bigFoodRef.current) bigFoodExpiresAtRef.current += paused_ms;
      pauseStartRef.current = null;
    }
  }, [paused]);

  // Drive the on-screen countdown pill (100 ms is enough resolution).
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!bigFoodRef.current || paused || gameOver) {
        setBigFoodMsLeft(prev => (prev === 0 ? prev : 0));
        return;
      }
      const left = Math.max(0, bigFoodExpiresAtRef.current - performance.now());
      setBigFoodMsLeft(prev => (Math.abs(prev - left) > 80 ? left : prev));
    }, 100);
    return () => window.clearInterval(id);
  }, [paused, gameOver]);

  // Game loop
  useEffect(() => {
    if (gameOver || paused) return;

    const loop = (timestamp: number) => {
      if (!lastTickRef.current) lastTickRef.current = timestamp;
      if (timestamp - lastTickRef.current >= tickMsRef.current) {
        tick();
        lastTickRef.current = timestamp;
      }
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, [draw, tick, gameOver, paused]);

  // Draw once on mount so we see the initial state before first tick.
  useEffect(() => {
    draw();
  }, [draw]);

  // Input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      let d: Dir | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w') d = 'U';
      else if (e.key === 'ArrowDown' || e.key === 's') d = 'D';
      else if (e.key === 'ArrowLeft' || e.key === 'a') d = 'L';
      else if (e.key === 'ArrowRight' || e.key === 'd') d = 'R';
      else if (e.key === ' ') {
        e.preventDefault();
        setPaused(p => !p);
        return;
      }
      if (d) {
        e.preventDefault();
        queuedDirRef.current = d;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = initialSnake();
    foodRef.current = randFood(snakeRef.current);
    dirRef.current = 'R';
    queuedDirRef.current = null;
    lastTickRef.current = 0;
    tickMsRef.current = START_TICK_MS;
    bigFoodRef.current = null;
    bigFoodExpiresAtRef.current = 0;
    foodsSinceBigRef.current = 0;
    pauseStartRef.current = null;
    setBigFoodMsLeft(0);
    setScore(0);
    setGameOver(false);
    setPaused(false);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3 text-sm">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            Score: <span className="text-white font-semibold">{score}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            Best: <span className="text-amber-300 font-semibold">{highScore}</span>
          </div>
          {bigFoodMsLeft > 0 && (
            <div className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-200 font-semibold tabular-nums">
              Bonus: {(bigFoodMsLeft / 1000).toFixed(1)}s
            </div>
          )}
          <button
            onClick={() => setPaused(p => !p)}
            disabled={gameOver}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={paused ? 'Resume' : 'Pause'}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative rounded-2xl p-2 bg-white/5 border border-white/10"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          width={GRID * CELL}
          height={GRID * CELL}
          className="block w-full h-auto rounded-xl"
        />

        {paused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
            <div className="text-white font-display tracking-widest">PAUSED</div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-white/40 uppercase tracking-widest">
        Arrow keys or WASD · space to pause
      </p>

      {/* Game over overlay */}
      {gameOver && (
        <div className="absolute inset-0 -m-4 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl z-10">
          <div className="text-center p-8">
            <Trophy size={56} className="mx-auto text-amber-400 mb-4" />
            <h3 className="text-3xl font-display tracking-wider text-white mb-2">Game Over</h3>
            <p className="text-white/60 mb-6">
              Score {score} · Best {highScore}
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
