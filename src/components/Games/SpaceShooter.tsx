import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';

// Types
type GameState = 'MENU' | 'PLAYING' | 'GAMEOVER';
type EntityType = 'obstacle' | 'collectible';

interface ParticleConfig {
  x: number;
  y: number;
  color: string;
}

interface EntityConfig {
  lane: number;
  y: number;
  type: EntityType;
}

// Configuration
const CONFIG = {
  laneCount: 5,
  baseSpeed: 8,
  maxSpeed: 25,
  acceleration: 0.005,
  playerSize: 40,
  colors: {
    bg: '#050505',
    grid: '#1a1a2e',
    gridHighlight: '#2a2a4e',
    player: '#00ffff',
    playerGlow: 'rgba(0, 255, 255, 0.6)',
    obstacle: '#ff0055',
    collectible: '#ffff00',
  },
} as const;

// Particle Class
class Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  speedY: number;
  speedX: number;
  life: number;
  decay: number;

  constructor({ x, y, color }: ParticleConfig) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3 + 1;
    this.speedY = (Math.random() - 0.5) * 2;
    this.speedX = (Math.random() - 0.5) * 2;
    this.life = 1.0;
    this.decay = Math.random() * 0.03 + 0.02;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

// Entity Class
class Entity {
  lane: number;
  y: number;
  type: EntityType;
  width: number;
  height: number;
  markedForDeletion: boolean;
  rotation: number;
  laneWidth: number;

  constructor({ lane, y, type }: EntityConfig, laneWidth: number) {
    this.lane = lane;
    this.y = y;
    this.type = type;
    this.laneWidth = laneWidth;
    this.width = laneWidth * 0.6;
    this.height = 40;
    this.markedForDeletion = false;
    this.rotation = 0;
  }

  update(speed: number, canvasHeight: number) {
    this.y += speed;
    this.rotation += 0.05;
    if (this.y > canvasHeight + 100) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const x = (this.lane * this.laneWidth) + (this.laneWidth / 2);
    
    ctx.save();
    ctx.translate(x, this.y);

    if (this.type === 'obstacle') {
      ctx.shadowBlur = 15;
      ctx.shadowColor = CONFIG.colors.obstacle;
      ctx.fillStyle = CONFIG.colors.obstacle;
      
      ctx.beginPath();
      ctx.moveTo(-this.width / 2, this.height / 2);
      ctx.lineTo(0, -this.height / 2);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(-this.width / 4, this.height / 4);
      ctx.lineTo(0, -this.height / 4);
      ctx.lineTo(this.width / 4, this.height / 4);
      ctx.fill();
    } else {
      ctx.shadowBlur = 15;
      ctx.shadowColor = CONFIG.colors.collectible;
      ctx.fillStyle = CONFIG.colors.collectible;
      
      ctx.rotate(this.rotation);
      ctx.fillRect(-10, -10, 20, 20);
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(-4, -4, 8, 8);
    }

    ctx.restore();
  }
}

// Player Class
class Player {
  lane: number;
  targetLane: number;
  visualLane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  tilt: number;
  laneWidth: number;

  constructor(canvasHeight: number, laneWidth: number) {
    this.lane = 2;
    this.targetLane = 2;
    this.visualLane = 2;
    this.x = 0;
    this.y = canvasHeight - 150;
    this.laneWidth = laneWidth;
    this.width = 50;
    this.height = 60;
    this.color = CONFIG.colors.player;
    this.tilt = 0;
  }

  move(dir: number, laneCount: number) {
    this.targetLane += dir;
    if (this.targetLane < 0) this.targetLane = 0;
    if (this.targetLane >= laneCount) this.targetLane = laneCount - 1;
  }

  update() {
    const diff = this.targetLane - this.visualLane;
    
    if (Math.abs(diff) < 0.01) {
      this.visualLane = this.targetLane;
      this.lane = Math.round(this.targetLane);
      this.tilt = 0;
    } else {
      this.visualLane += diff * 0.15;
      this.lane = Math.round(this.visualLane);
      this.tilt = diff > 0 ? 0.3 : -0.3;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const centerX = (this.visualLane * this.laneWidth) + (this.laneWidth / 2);
    
    ctx.save();
    ctx.translate(centerX, this.y);
    ctx.rotate(this.tilt);

    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(0, this.height / 3);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f0f';
    ctx.fillStyle = `rgba(255, 0, 255, ${Math.random() * 0.5 + 0.5})`;
    ctx.beginPath();
    ctx.moveTo(-5, this.height / 3);
    ctx.lineTo(5, this.height / 3);
    ctx.lineTo(0, this.height / 3 + (Math.random() * 30 + 20));
    ctx.fill();

    ctx.restore();
  }
}

// Audio Controller
class AudioController {
  initialized: boolean;
  bass: Tone.MembraneSynth | null;
  synth: Tone.PolySynth | null;
  collectSynth: Tone.Synth | null;
  crashSynth: Tone.NoiseSynth | null;
  loop: Tone.Loop | null;

  constructor() {
    this.initialized = false;
    this.bass = null;
    this.synth = null;
    this.collectSynth = null;
    this.crashSynth = null;
    this.loop = null;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await Tone.start();
      
      this.bass = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }).toDestination();
      this.bass.volume.value = -10;

      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "square" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 1 }
      }).toDestination();
      this.synth.volume.value = -15;

      this.collectSynth = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 }
      }).toDestination();
      this.collectSynth.volume.value = -8;

      this.crashSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0 }
      }).toDestination();

      this.loop = new Tone.Loop((time) => {
        this.bass?.triggerAttackRelease("C2", "8n", time);
        this.bass?.triggerAttackRelease("C2", "8n", time + 0.25);
        this.bass?.triggerAttackRelease("G1", "8n", time + 0.5);
        this.bass?.triggerAttackRelease("C2", "8n", time + 0.75);
      }, "1n").start(0);
      
      Tone.Transport.bpm.value = 130;
      this.initialized = true;
    } catch (e) {
      console.warn("Audio init failed:", e);
    }
  }

  startMusic() {
    if (this.initialized) {
      Tone.Transport.start();
      Tone.context.resume();
    }
  }

  stopMusic() {
    if (this.initialized) Tone.Transport.stop();
  }

  playCollect() {
    if (this.initialized) this.collectSynth?.triggerAttackRelease("C6", "16n");
  }

  playCrash() {
    if (this.initialized) this.crashSynth?.triggerAttackRelease("8n");
  }
}

interface NeonOverdriveGameProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NeonOverdriveGame({ isOpen, onClose }: NeonOverdriveGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
const animationRef = useRef<number | null>(null);
  
  // Game state refs (using refs for mutable game state to avoid re-renders)
  const gameStateRef = useRef<GameState>('MENU');
  const scoreRef = useRef(0);
  const healthRef = useRef(100);
  const speedRef = useRef(CONFIG.baseSpeed);
  const frameRef = useRef(0);
  const shakeRef = useRef(0);
  const lastTimeRef = useRef(0);
  const gridOffsetRef = useRef(0);
  const laneWidthRef = useRef(0);
  
  // Game objects refs
  const playerRef = useRef<Player | null>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const audioRef = useRef<AudioController | null>(null);
  
  // React state for UI updates
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [speed, _setSpeed] = useState(CONFIG.baseSpeed);

  // Initialize canvas and game
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    laneWidthRef.current = canvas.width / CONFIG.laneCount;
    
    // Initialize player
    playerRef.current = new Player(canvas.height, laneWidthRef.current);
    
    // Initialize audio
    audioRef.current = new AudioController();
  }, []);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    laneWidthRef.current = canvas.width / CONFIG.laneCount;
    
    if (playerRef.current) {
      playerRef.current.y = canvas.height - 150;
      playerRef.current.laneWidth = laneWidthRef.current;
    }
  }, []);

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(new Particle({ x, y, color }));
    }
  }, []);

  // Spawn entities
  const spawnEntity = useCallback(() => {
    const spawnRate = Math.max(0.02, 0.05 - (speedRef.current * 0.001));
    
    if (Math.random() < spawnRate) {
      const lane = Math.floor(Math.random() * CONFIG.laneCount);
      const tooClose = entitiesRef.current.some(e => e.lane === lane && e.y < 150);
      
      if (!tooClose) {
        const type: EntityType = Math.random() > 0.7 ? 'collectible' : 'obstacle';
        entitiesRef.current.push(new Entity({ lane, y: -100, type }, laneWidthRef.current));
      }
    }
  }, []);

  // Game update logic
  const update = useCallback((_deltaTime: number) => {
    if (gameStateRef.current !== 'PLAYING') return;
    const [_speed, setSpeed] = useState<number>(0);
const speedRef = useRef<number>(0);

    frameRef.current++;
    scoreRef.current += speedRef.current * 0.1;
    speedRef.current = Math.min(speedRef.current + CONFIG.acceleration, CONFIG.maxSpeed);

    // Update UI state
    setScore(Math.floor(scoreRef.current));
    setHealth(Math.max(0, healthRef.current));
    setSpeed(Math.floor(speedRef.current * 100));

    // Update Player
    playerRef.current?.update();

    // Update Entities
    spawnEntity();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    entitiesRef.current.forEach((entity) => {
      entity.update(speedRef.current, canvas.height);
      
      // Collision Detection
      const entityX = (entity.lane * laneWidthRef.current) + (laneWidthRef.current / 2);
      const playerX = ((playerRef.current?.visualLane || 0) * laneWidthRef.current) + (laneWidthRef.current / 2);
      const dx = Math.abs(entityX - playerX);
      const dy = Math.abs(entity.y - (playerRef.current?.y || 0));

      if (dx < laneWidthRef.current * 0.4 && dy < 50) {
        if (entity.type === 'obstacle') {
          healthRef.current -= 34;
          createExplosion(entityX, entity.y, CONFIG.colors.obstacle);
          audioRef.current?.playCrash();
          entity.markedForDeletion = true;
          shakeRef.current = 15;

          if (healthRef.current <= 0) {
            createExplosion(playerX, playerRef.current?.y || 0, CONFIG.colors.player);
            gameStateRef.current = 'GAMEOVER';
            setGameState('GAMEOVER');
            audioRef.current?.stopMusic();
            audioRef.current?.playCrash();
          }
        } else {
          scoreRef.current += 500;
          healthRef.current = Math.min(100, healthRef.current + 10);
          createExplosion(entityX, entity.y, CONFIG.colors.collectible);
          audioRef.current?.playCollect();
          entity.markedForDeletion = true;
        }
      }
    });

    entitiesRef.current = entitiesRef.current.filter(e => !e.markedForDeletion);

    // Update Particles
    particlesRef.current.forEach(p => p.update());
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Grid Animation
    gridOffsetRef.current += speedRef.current;
    if (gridOffsetRef.current > 100) gridOffsetRef.current = 0;
    
    // Shake decay
    if (shakeRef.current > 0) {
      shakeRef.current *= 0.9;
      if (shakeRef.current < 0.5) shakeRef.current = 0;
    }
  }, [createExplosion, spawnEntity]);

  // Game draw logic
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.fillStyle = CONFIG.colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Shake
    ctx.save();
    if (shakeRef.current > 0) {
      const dx = (Math.random() - 0.5) * shakeRef.current;
      const dy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(dx, dy);
    }

    // Draw Retro Grid
    ctx.strokeStyle = CONFIG.colors.grid;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i <= CONFIG.laneCount; i++) {
      const x = i * laneWidthRef.current;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }

    for (let i = 0; i < canvas.height / 100 + 2; i++) {
      const y = (i * 100) + gridOffsetRef.current - 100;
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Lane Highlights
    ctx.shadowBlur = 10;
    ctx.shadowColor = CONFIG.colors.gridHighlight;
    ctx.strokeStyle = CONFIG.colors.gridHighlight;
    ctx.beginPath();
    ctx.moveTo(laneWidthRef.current, 0);
    ctx.lineTo(laneWidthRef.current, canvas.height);
    ctx.moveTo(laneWidthRef.current * (CONFIG.laneCount - 1), 0);
    ctx.lineTo(laneWidthRef.current * (CONFIG.laneCount - 1), canvas.height);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Entities
    entitiesRef.current.forEach(e => e.draw(ctx));

    // Draw Player
    if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'GAMEOVER') {
      playerRef.current?.draw(ctx);
    }

    // Draw Particles
    particlesRef.current.forEach(p => p.draw(ctx));

    // Vignette
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, canvas.height / 3,
      canvas.width / 2, canvas.height / 2, canvas.height
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
  }, []);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    update(deltaTime);
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  // Start game
  const startGame = useCallback(async () => {
    await audioRef.current?.init();
    audioRef.current?.startMusic();
    
    scoreRef.current = 0;
    healthRef.current = 100;
    speedRef.current = CONFIG.baseSpeed;
    shakeRef.current = 0;
    entitiesRef.current = [];
    particlesRef.current = [];
    playerRef.current = new Player(window.innerHeight, laneWidthRef.current);
    
    gameStateRef.current = 'PLAYING';
    setGameState('PLAYING');
  }, []);

  // Reset game
  // const resetGame = useCallback(() => {
  //   gameStateRef.current = 'MENU';
  //   setGameState('MENU');
  // }, []);

  // Input handlers
  useEffect(() => {
    const speedRef = useRef<number>(CONFIG.baseSpeed);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'PLAYING') return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        playerRef.current?.move(-1, CONFIG.laneCount);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        playerRef.current?.move(1, CONFIG.laneCount);
      } else if (e.key === ' ' || e.key === 'ArrowUp') {
        speedRef.current = Math.min(speedRef.current + 5, CONFIG.maxSpeed + 10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameStateRef.current !== 'PLAYING') return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      
      if (Math.abs(diff) > 30) {
        if (diff < 0) playerRef.current?.move(-1, CONFIG.laneCount);
        else playerRef.current?.move(1, CONFIG.laneCount);
      }
      e.preventDefault();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Initialize and cleanup
  useEffect(() => {
    if (isOpen) {
      initGame();
      window.addEventListener('resize', handleResize);
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioRef.current?.stopMusic();
    };
  }, [isOpen, initGame, handleResize, gameLoop]);

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[70] bg-[#050505] overflow-hidden font-['Orbitron']"
    >
      {/* Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* CRT Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.2) 50%,
            rgba(0,0,0,0.2)
          )`,
          backgroundSize: '100% 4px',
        }}
      />

      {/* Menu Screen */}
      {gameState === 'MENU' && (
        <div className="absolute z-10 flex flex-col items-center justify-center w-full h-full bg-black/80 backdrop-blur-sm transition-opacity duration-500">
          <h1 
            className="text-6xl md:text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 tracking-widest italic"
            style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.5)' }}
          >
            NEON<br />OVERDRIVE
          </h1>
          <p className="text-cyan-200 mb-8 text-lg tracking-widest">AVOID OBSTACLES // COLLECT DATA</p>
          
          <button 
            onClick={startGame}
            className="px-8 py-4 text-2xl font-bold text-black bg-cyan-400 hover:bg-fuchsia-500 transition-colors duration-200 uppercase tracking-wider rounded group relative overflow-hidden"
            style={{ 
              boxShadow: '0 0 10px #0ff, inset 0 0 10px #0ff',
              border: '2px solid #0ff'
            }}
          >
            <span className="relative z-10 group-hover:animate-pulse">Initialize System</span>
          </button>
          
          <div className="mt-8 text-sm text-gray-400 flex gap-8">
            <div className="flex items-center gap-2">
              <span className="border border-gray-600 px-2 py-1 rounded">←</span>
              <span className="border border-gray-600 px-2 py-1 rounded">→</span>
              <span>MOVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="border border-gray-600 px-2 py-1 rounded">SPACE</span>
              <span>BOOST</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mt-8 text-white/60 hover:text-white transition-colors text-sm uppercase tracking-widest"
          >
            Exit to Menu
          </button>
        </div>
      )}

      {/* HUD */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none transition-opacity duration-500">
          <div className="flex flex-col">
            <div className="text-xs text-cyan-400 tracking-widest">SCORE</div>
            <div 
              className="text-4xl font-bold text-white"
              style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.5)' }}
            >
              {score.toString().padStart(6, '0')}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-xs text-fuchsia-400 tracking-widest">SHIELD INTEGRITY</div>
            <div className="w-48 h-4 border border-fuchsia-500/50 mt-1 relative skew-x-[-12deg]">
              <div 
                className="h-full bg-fuchsia-500 transition-all duration-200"
                style={{ 
                  width: `${health}%`,
                  boxShadow: '0 0 10px #d946ef'
                }}
              />
            </div>
            <div className="mt-2 text-xl text-cyan-300 font-mono">{speed} KM/H</div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute z-30 flex flex-col items-center justify-center w-full h-full bg-red-900/20 backdrop-blur-md">
          <h2 
            className="text-6xl font-black text-red-500 mb-2"
            style={{ textShadow: '0 0 10px rgba(255, 0, 0, 0.7), 0 0 20px rgba(255, 0, 0, 0.5)' }}
          >
            CRITICAL FAILURE
          </h2>
          <p className="text-white text-xl mb-6">SYSTEM DESTROYED</p>
          <div className="text-center mb-8">
            <div className="text-sm text-gray-400">FINAL SCORE</div>
            <div className="text-5xl font-bold text-white">
              {score.toString().padStart(6, '0')}
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={startGame}
              className="px-8 py-4 text-2xl font-bold text-white bg-red-600 hover:bg-red-500 border-2 border-red-400 transition-all duration-200 uppercase tracking-wider rounded"
              style={{ boxShadow: '0 0 20px rgba(220,38,38,0.7)' }}
            >
              REBOOT SYSTEM
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-4 text-xl font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/30 transition-all duration-200 uppercase tracking-wider rounded"
            >
              EXIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}