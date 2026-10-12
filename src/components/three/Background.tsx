/**
 * AdvancedBackground
 *
 * Layered, GPU-driven animated background:
 *   1. Nebula + aurora backdrop — full-screen shader (domain-warped fbm, twinkling stars)
 *   2. Holographic terrain     — simplex displacement, anti-aliased grid, pointer bulge, tap ripples
 *   3. Constellation network   — drifting nodes that lean toward the pointer and link to it
 *   4. Particle field          — flow-field drift, pointer repulsion, tap shockwave
 *   5. Focus orb               — glow that follows the cursor / finger, pulse ring on tap
 *
 * Input comes from window-level listeners, so touch and mouse keep working even
 * though page content sits on top of this fixed z-0 canvas. Every listener is
 * passive, so scrolling on touch devices is never blocked.
 *
 * No extra dependencies: three + @react-three/fiber only.
 */
import { Component, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useOverlayOpen } from '../../lib/overlayState';

// ─── Environment & quality tiers ────────────────────────────────────────────

const hasWindow = typeof window !== 'undefined';

function mediaMatches(query: string): boolean {
  return hasWindow && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

// Lower scene complexity on touch / small-screen devices
const isLowPower = mediaMatches('(pointer: coarse)') || (hasWindow && window.innerWidth < 768);
const reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');

const QUALITY = isLowPower
  ? { particles: 700, nodes: 22, terrainX: 96, terrainY: 66, octaves: 3, dprMax: 1.25, bulge: 1.0 }
  : { particles: 1600, nodes: 42, terrainX: 150, terrainY: 104, octaves: 4, dprMax: 1.5, bulge: 1.6 };

const TIME_SCALE = reducedMotion ? 0.35 : 1;
const PARALLAX = reducedMotion ? 0.25 : 1;

const MAX_RIPPLES = 6;
const TERRAIN_W = 64;
const TERRAIN_H = 44;
const TAP_MAX_AGE_MS = 400;

// Brand palette — #2e5bff blue, #00f2fe cyan, violet accent
const BLUE: [number, number, number] = [0.18, 0.36, 1.0];
const CYAN: [number, number, number] = [0.0, 0.95, 0.99];

// Seeded random generator for deterministic values
function createSeededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// ─── Shared GLSL ────────────────────────────────────────────────────────────

const PALETTE_GLSL = /* glsl */ `
  const vec3 C_BLUE   = vec3(0.18, 0.36, 1.0);
  const vec3 C_CYAN   = vec3(0.0, 0.95, 0.99);
  const vec3 C_VIOLET = vec3(0.6, 0.2, 0.9);
`;

// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT)
const SIMPLEX_3D_GLSL = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j  = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

// ─── Interaction state (mutable, shared, never triggers React renders) ──────

interface PendingTap {
  ndc: THREE.Vector2;
  at: number;
}

interface FxState {
  /** Scene clock in seconds (delta-clamped, slowed for reduced motion). */
  time: number;
  // Raw input written by DOM listeners
  rawNdc: THREE.Vector2;
  hovering: boolean;
  pressed: boolean;
  touch: boolean;
  lastInput: number;
  pendingTaps: PendingTap[];
  /** Set by a new touch contact: the pointer jumps instead of gliding. */
  snapRequested: boolean;
  // Derived every frame by <InteractionRig />
  ndc: THREE.Vector2;
  /** True for the frame in which the pointer jumped (consumers snap too). */
  jumped: boolean;
  activity: number;
  ray: THREE.Ray;
  pointerWorld: THREE.Vector3;
  frameTaps: THREE.Ray[];
  lastTapTime: number;
  pulse: number;
}

function createFxState(): FxState {
  return {
    time: 0,
    rawNdc: new THREE.Vector2(0, 0),
    hovering: false,
    pressed: false,
    touch: isLowPower,
    lastInput: -Infinity,
    pendingTaps: [],
    snapRequested: false,
    ndc: new THREE.Vector2(0, 0),
    jumped: false,
    activity: 0,
    ray: new THREE.Ray(),
    pointerWorld: new THREE.Vector3(),
    frameTaps: [],
    lastTapTime: -100,
    pulse: 0,
  };
}

/** Window-level pointer + touch tracking. Passive, so it never blocks scroll. */
function usePointerInput(fx: FxState) {
  useEffect(() => {
    if (!hasWindow) return;
    let lastTapAt = 0;

    const setFromClient = (x: number, y: number) => {
      fx.rawNdc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
      fx.lastInput = performance.now();
    };

    const onPointerMove = (e: PointerEvent) => {
      fx.touch = e.pointerType !== 'mouse';
      fx.hovering = true;
      setFromClient(e.clientX, e.clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      onPointerMove(e);
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // A finger landing is a discontinuous jump, never a glide from the last spot
      if (e.pointerType !== 'mouse') fx.snapRequested = true;
      fx.pressed = true;
      const now = performance.now();
      if (now - lastTapAt > 90 && fx.pendingTaps.length < 4) {
        fx.pendingTaps.push({ ndc: fx.rawNdc.clone(), at: now });
        lastTapAt = now;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      fx.pressed = false;
      if (e.pointerType !== 'mouse') {
        fx.hovering = false;
        fx.lastInput = performance.now();
      }
    };

    // Pointer events stop (pointercancel) once a touch turns into a scroll;
    // touch events keep coming, so the effect follows the finger while scrolling.
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      fx.touch = true;
      fx.pressed = true;
      setFromClient(t.clientX, t.clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        fx.pressed = false;
        fx.lastInput = performance.now();
      }
    };

    const onPointerOut = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !e.relatedTarget) fx.hovering = false;
    };

    const onBlur = () => {
      fx.hovering = false;
      fx.pressed = false;
    };

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener('pointermove', onPointerMove, opts);
    window.addEventListener('pointerdown', onPointerDown, opts);
    window.addEventListener('pointerup', onPointerUp, opts);
    window.addEventListener('pointerout', onPointerOut, opts);
    window.addEventListener('touchmove', onTouchMove, opts);
    window.addEventListener('touchend', onTouchEnd, opts);
    window.addEventListener('touchcancel', onTouchEnd, opts);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('blur', onBlur);
    };
  }, [fx]);
}

/** Dispose GPU resources created in useMemo when the component unmounts. */
function useDispose(...items: Array<{ dispose: () => void }>) {
  useEffect(() => () => items.forEach((item) => item.dispose()), items); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Interaction rig: clock, pointer smoothing, camera parallax, ray casting ─

function InteractionRig({ fx }: { fx: FxState }) {
  const camera = useThree((s) => s.camera);
  const tools = useMemo(
    () => ({
      raycaster: new THREE.Raycaster(),
      zPlane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      origin: new THREE.Vector3(0, 0, 0),
    }),
    []
  );

  // Negative priority: runs before every other frame callback, without
  // taking over rendering.
  useFrame((_, delta) => {
    const { damp } = THREE.MathUtils;
    const dt = Math.min(delta, 0.1);
    fx.time += dt * TIME_SCALE;

    const now = performance.now();
    const idle = now - fx.lastInput;
    let target: number;
    if (fx.touch) target = fx.pressed || idle < 900 ? 1 : 0;
    else target = fx.hovering ? (idle < 4000 ? 1 : 0.35) : 0;

    // New touch, or first contact after a rest: jump straight to it instead of
    // sweeping across the screen
    fx.jumped = fx.snapRequested || fx.activity < 0.02;
    fx.snapRequested = false;
    if (fx.jumped) fx.ndc.copy(fx.rawNdc);
    const follow = fx.touch ? 16 : 9;
    fx.ndc.x = damp(fx.ndc.x, fx.rawNdc.x, follow, dt);
    fx.ndc.y = damp(fx.ndc.y, fx.rawNdc.y, follow, dt);
    fx.activity = damp(fx.activity, target, target > fx.activity ? 7 : 1.8, dt);

    // Camera: slow ambient drift + pointer parallax
    const t = fx.time;
    const camX = (Math.sin(t * 0.05) * 0.7 + fx.ndc.x * 1.4 * fx.activity) * PARALLAX;
    const camY = (Math.cos(t * 0.04) * 0.35 + fx.ndc.y * 0.7 * fx.activity) * PARALLAX;
    camera.position.x = damp(camera.position.x, camX, 2.2, dt);
    camera.position.y = damp(camera.position.y, camY, 2.2, dt);
    camera.lookAt(tools.origin);
    camera.updateMatrixWorld();

    const { raycaster, zPlane } = tools;
    raycaster.setFromCamera(fx.ndc, camera);
    fx.ray.copy(raycaster.ray);
    raycaster.ray.intersectPlane(zPlane, fx.pointerWorld);

    // Turn queued taps into world rays for this frame's consumers
    fx.frameTaps.length = 0;
    let tapped = false;
    for (const tap of fx.pendingTaps) {
      if (now - tap.at > TAP_MAX_AGE_MS) continue; // stale (e.g. queued while paused)
      raycaster.setFromCamera(tap.ndc, camera);
      fx.frameTaps.push(raycaster.ray.clone());
      tapped = true;
    }
    fx.pendingTaps.length = 0;

    if (tapped) {
      fx.lastTapTime = fx.time;
      fx.pulse = 1;
    } else {
      fx.pulse = Math.max(0, fx.pulse - dt * 1.6);
    }
  }, -1);

  return null;
}

// ─── 1. Nebula + aurora backdrop ────────────────────────────────────────────

const BACKDROP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BACKDROP_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uActivity;
  uniform float uPulse;
  uniform vec2 uParallax;
  varying vec2 vUv;
  ${PALETTE_GLSL}

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
               mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < OCTAVES; i++) {
      v += a * vnoise(p);
      p = rot * p * 2.03 + vec2(3.1, 1.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0) + uParallax * 0.03;
    vec2 ptr = uPointer * 0.5 * vec2(aspect, 1.0);

    // The pointer gently swirls the nebula around itself
    vec2 toPtr = p - ptr;
    float pd = length(toPtr);
    float swirl = exp(-pd * pd * 6.0) * uActivity * 0.9;
    float s = sin(swirl);
    float c = cos(swirl);
    p = ptr + mat2(c, -s, s, c) * toPtr;

    // Domain-warped fbm nebula
    float t = uTime * 0.035;
    vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t)), fbm(p * 1.5 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p * 1.7 + 2.4 * q + vec2(1.7, 9.2) + t * 1.4),
                  fbm(p * 1.7 + 2.4 * q + vec2(8.3, 2.8) - t * 1.1));
    float f = fbm(p * 1.3 + 2.0 * r);

    vec3 col = vec3(0.0, 0.0, 0.0);
    col = mix(col, C_BLUE * 0.30, smoothstep(0.34, 0.74, f));
    col = mix(col, C_VIOLET * 0.26, smoothstep(0.45, 0.9, q.y) * smoothstep(0.3, 0.7, f));
    col += C_CYAN * 0.18 * pow(smoothstep(0.3, 0.7, r.x * f * 1.6), 2.0);

    // Aurora curtains: crisp lower edge, long soft fade upward
    float band = smoothstep(0.5, 0.62, uv.y) * (1.0 - smoothstep(0.62, 0.98, uv.y));
    float curtainN = fbm(vec2(p.x * 2.2 + t * 4.0, p.y * 0.45 - t * 2.0) + r * 0.6);
    float curtain = smoothstep(0.42, 0.62, curtainN);
    float streak = 0.55 + 0.45 * sin(p.x * 22.0 + curtainN * 9.0 + uTime * 0.6);
    vec3 auroraCol = mix(C_CYAN, C_VIOLET, smoothstep(-0.6, 0.8, p.x + sin(t * 3.0) * 0.4));
    col += auroraCol * band * curtain * streak * 0.28;

    // Horizon glow sitting behind the terrain
    float horizon = exp(-pow((uv.y - 0.53) * 7.0, 2.0));
    col += mix(C_BLUE, C_CYAN, 0.35) * horizon * 0.08;

    // Pointer glow + tap flash
    col += mix(C_BLUE, C_CYAN, 0.6) * exp(-pd * pd * 14.0) * (0.07 * uActivity + 0.22 * uPulse);

    // Twinkling star field (fixed size in CSS pixels on any DPR)
    vec2 fc = gl_FragCoord.xy / uPixelRatio + uParallax * 12.0;
    float cell = 34.0;
    vec2 id = floor(fc / cell);
    vec2 gv = fract(fc / cell);
    float h = hash21(id);
    if (h > 0.86) {
      vec2 sp = vec2(hash21(id + 13.7), hash21(id + 71.3)) * 0.8 + 0.1;
      float d = length(gv - sp) * cell;
      float tw = 0.55 + 0.45 * sin(uTime * (0.8 + h * 3.0) + h * 91.0);
      float bright = (h - 0.86) / 0.14;
      float star = 1.0 - smoothstep(0.0, 1.8, d);
      col += vec3(1.0, 1.0, 1.0) * star * tw * (0.6 + bright * 1.4) * smoothstep(0.3, 0.65, uv.y);
    }

    // Dither to remove banding in the dark gradients
    col += (hash21(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Backdrop({ fx }: { fx: FxState }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BACKDROP_VERT,
        fragmentShader: BACKDROP_FRAG,
        defines: { OCTAVES: QUALITY.octaves },
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uPixelRatio: { value: 1 },
          uPointer: { value: new THREE.Vector2() },
          uActivity: { value: 0 },
          uPulse: { value: 0 },
          uParallax: { value: new THREE.Vector2() },
        },
        depthTest: false,
        depthWrite: false,
      }),
    []
  );
  useDispose(material);

  useFrame((state) => {
    const u = material.uniforms;
    u.uTime.value = fx.time;
    u.uResolution.value.set(state.size.width, state.size.height);
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uPointer.value.copy(fx.ndc);
    u.uActivity.value = fx.activity;
    u.uPulse.value = fx.pulse;
    u.uParallax.value.set(state.camera.position.x, state.camera.position.y);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1000} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

// ─── 2. Holographic terrain ─────────────────────────────────────────────────

const TERRAIN_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uBulge;
  uniform vec3 uPointer;              // xy = local position, z = strength
  uniform vec4 uRipples[MAX_RIPPLES]; // xy = local position, z = start time, w = amplitude
  varying vec2 vUv;
  varying float vElevation;
  varying float vRipple;
  varying float vPointer;
  varying vec3 vWorld;
  ${SIMPLEX_3D_GLSL}

  float terrainHeight(vec2 p) {
    float h = snoise(vec3(p * 0.07, uTime * 0.10)) * 2.4;
    h += snoise(vec3(p * 0.18 + 7.3, uTime * 0.16)) * 0.9;
    h += snoise(vec3(p * 0.45 - 3.1, uTime * 0.22)) * 0.28;
    return h;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float h = terrainHeight(pos.xy);

    // Pointer lifts the surface under it
    float pd = distance(pos.xy, uPointer.xy);
    float bulge = exp(-pd * pd * 0.045) * uPointer.z;
    h += bulge * uBulge;
    vPointer = bulge;

    // Expanding tap ripples
    float rip = 0.0;
    for (int i = 0; i < MAX_RIPPLES; i++) {
      vec4 r = uRipples[i];
      float age = uTime - r.z;
      if (r.w <= 0.0 || age < 0.0 || age > 5.0) continue;
      float d = distance(pos.xy, r.xy);
      float w = d - age * 6.5;
      float env = exp(-w * w * 0.25) * exp(-age * 0.75) * r.w;
      rip += cos(w * 1.6) * env;
    }
    h += rip * uBulge;
    vRipple = abs(rip);

    pos.z += h;
    vElevation = h;
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const TERRAIN_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;
  varying float vRipple;
  varying float vPointer;
  varying vec3 vWorld;
  ${PALETTE_GLSL}

  void main() {
    float e = smoothstep(-2.5, 3.5, vElevation);
    vec3 col = mix(vec3(0.0, 0.0, 0.0), C_BLUE * 0.38, e);
    col = mix(col, C_CYAN * 0.7, smoothstep(2.0, 4.2, vElevation) * 0.6);
    col = mix(col, C_VIOLET * 0.35, (1.0 - smoothstep(-2.5, 0.0, vElevation)) * 0.35);

    // Anti-aliased grid lines (constant pixel width at every distance)
    vec2 g = vUv * vec2(48.0, 33.0);
    vec2 fw = max(fwidth(g), vec2(1e-4));
    vec2 gd = abs(fract(g - 0.5) - 0.5) / fw;
    float line = 1.0 - min(min(gd.x, gd.y), 1.0);
    line *= 1.0 - smoothstep(0.35, 0.9, max(fw.x, fw.y)); // fade where cells go sub-pixel

    // Glowing grid intersections
    float node = 1.0 - smoothstep(0.0, 1.8, length(gd));

    float energy = vRipple + vPointer;
    vec3 lineCol = mix(C_BLUE, C_CYAN, clamp(e * 0.8 + energy, 0.0, 1.0));
    col += lineCol * line * (0.45 + energy * 1.6);
    col += C_CYAN * node * (0.35 + energy) * (1.0 - smoothstep(0.35, 0.9, max(fw.x, fw.y)));

    col += C_CYAN * vRipple * 0.45;
    col += mix(C_CYAN, C_VIOLET, 0.35) * vPointer * 0.3;

    // Slow scan band sweeping across the surface
    float scan = exp(-pow((fract(vUv.y * 0.5 + uTime * 0.03) - 0.5) * 30.0, 2.0));
    col += C_BLUE * scan * 0.18 * (0.5 + line);

    float dist = length(vWorld - cameraPosition);
    float fade = 1.0 - smoothstep(16.0, 42.0, dist);
    float edge = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x))
               * smoothstep(0.0, 0.1, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
    float alpha = clamp(0.55 + line * 0.4 + energy * 0.2, 0.0, 1.0) * fade * edge;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Terrain({ fx }: { fx: FxState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: TERRAIN_VERT,
        fragmentShader: TERRAIN_FRAG,
        defines: { MAX_RIPPLES },
        uniforms: {
          uTime: { value: 0 },
          uBulge: { value: QUALITY.bulge },
          uPointer: { value: new THREE.Vector3() },
          uRipples: {
            value: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)),
          },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );
  useDispose(material);

  const scratch = useMemo(
    () => ({
      plane: new THREE.Plane(),
      normal: new THREE.Vector3(),
      hit: new THREE.Vector3(),
      cursor: 0,
    }),
    []
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const u = material.uniforms;
    u.uTime.value = fx.time;

    // World-space plane of the undisplaced terrain
    mesh.updateMatrixWorld();
    scratch.normal.set(0, 0, 1).applyQuaternion(mesh.quaternion);
    scratch.plane.setFromNormalAndCoplanarPoint(scratch.normal, mesh.position);

    // Pointer bulge
    const pointer = u.uPointer.value as THREE.Vector3;
    let strength = 0;
    if (fx.ray.intersectPlane(scratch.plane, scratch.hit)) {
      mesh.worldToLocal(scratch.hit);
      if (Math.abs(scratch.hit.x) < TERRAIN_W / 2 && Math.abs(scratch.hit.y) < TERRAIN_H / 2) {
        pointer.x = scratch.hit.x;
        pointer.y = scratch.hit.y;
        strength = fx.activity;
      }
    }
    pointer.z = THREE.MathUtils.damp(pointer.z, strength, 6, Math.min(delta, 0.1));

    // Tap ripples (ring buffer)
    const ripples = u.uRipples.value as THREE.Vector4[];
    for (const ray of fx.frameTaps) {
      if (!ray.intersectPlane(scratch.plane, scratch.hit)) continue;
      mesh.worldToLocal(scratch.hit);
      ripples[scratch.cursor].set(scratch.hit.x, scratch.hit.y, fx.time, 1);
      scratch.cursor = (scratch.cursor + 1) % MAX_RIPPLES;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.55, 0, 0]}
      position={[0, -5.5, -7]}
      material={material}
      frustumCulled={false}
    >
      <planeGeometry args={[TERRAIN_W, TERRAIN_H, QUALITY.terrainX, QUALITY.terrainY]} />
    </mesh>
  );
}

// ─── 3. Constellation network ───────────────────────────────────────────────

const LINE_VERT = /* glsl */ `
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LINE_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() { gl_FragColor = vec4(vColor, 1.0); }
`;

const NODE_VERT = /* glsl */ `
  uniform float uPixelRatio;
  attribute float aGlow;
  varying float vGlow;
  void main() {
    vGlow = aGlow;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((100.0 + aGlow * 130.0) * uPixelRatio / max(-mv.z, 0.5), 0.0, 40.0 * uPixelRatio);
  }
`;

const NODE_FRAG = /* glsl */ `
  varying float vGlow;
  ${PALETTE_GLSL}
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float halo = pow(1.0 - d, 3.0);
    float core = 1.0 - smoothstep(0.0, 0.22, d);
    vec3 col = C_CYAN * halo * (0.55 + vGlow * 0.9) + vec3(1.0) * core * (0.5 + vGlow * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const LINK_DIST = 5.2;
const POINTER_LINK_DIST = 6.5;

function Constellation({ fx }: { fx: FxState }) {
  const count = QUALITY.nodes;

  const data = useMemo(() => {
    const rand = createSeededRandom(54321);
    const base = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      base[i * 3] = (rand() - 0.5) * 28;
      base[i * 3 + 1] = -3 + rand() * 10.5;
      base[i * 3 + 2] = -7 + rand() * 8;
      phase[i] = rand() * Math.PI * 2;
    }

    const maxSegments = (count * (count - 1)) / 2 + count;
    const linePos = new Float32Array(maxSegments * 6);
    const lineCol = new Float32Array(maxSegments * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('aColor', new THREE.BufferAttribute(lineCol, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setDrawRange(0, 0);

    const nodePos = new Float32Array(count * 3);
    const nodeGlow = new Float32Array(count);
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3).setUsage(THREE.DynamicDrawUsage));
    nodeGeo.setAttribute('aGlow', new THREE.BufferAttribute(nodeGlow, 1).setUsage(THREE.DynamicDrawUsage));

    const lineMat = new THREE.ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nodeMat = new THREE.ShaderMaterial({
      vertexShader: NODE_VERT,
      fragmentShader: NODE_FRAG,
      uniforms: { uPixelRatio: { value: 1 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { base, phase, linePos, lineCol, lineGeo, nodePos, nodeGlow, nodeGeo, lineMat, nodeMat };
  }, [count]);
  useDispose(data.lineGeo, data.nodeGeo, data.lineMat, data.nodeMat);

  useFrame((state) => {
    const { base, phase, linePos, lineCol, nodePos, nodeGlow, lineGeo, nodeGeo, nodeMat } = data;
    const t = fx.time;
    const act = fx.activity;
    const px = fx.pointerWorld.x;
    const py = fx.pointerWorld.y;
    const pz = fx.pointerWorld.z;

    // Node drift + attraction toward the pointer (base positions never mutate)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const ph = phase[i];
      let x = base[i3] + Math.sin(t * 0.23 + ph) * 0.9;
      let y = base[i3 + 1] + Math.cos(t * 0.19 + ph * 1.7) * 0.7;
      const z = base[i3 + 2] + Math.sin(t * 0.15 + ph * 0.6) * 0.6;
      const dx = px - x;
      const dy = py - y;
      const d2 = dx * dx + dy * dy;
      const pull = Math.exp(-d2 / 18) * act * 0.32;
      x += dx * pull;
      y += dy * pull;
      nodePos[i3] = x;
      nodePos[i3 + 1] = y;
      nodePos[i3 + 2] = z;
      nodeGlow[i] = Math.exp(-d2 / 10) * act;
    }

    let v = 0; // vertex cursor
    const push = (
      ax: number, ay: number, az: number, bx: number, by: number, bz: number,
      r0: number, g0: number, b0: number, r1: number, g1: number, b1: number
    ) => {
      const o = v * 3;
      linePos[o] = ax; linePos[o + 1] = ay; linePos[o + 2] = az;
      linePos[o + 3] = bx; linePos[o + 4] = by; linePos[o + 5] = bz;
      lineCol[o] = r0; lineCol[o + 1] = g0; lineCol[o + 2] = b0;
      lineCol[o + 3] = r1; lineCol[o + 4] = g1; lineCol[o + 5] = b1;
      v += 2;
    };

    // Node ↔ node links with travelling pulses
    const L2 = LINK_DIST * LINK_DIST;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      for (let j = i + 1; j < count; j++) {
        const j3 = j * 3;
        const dx = nodePos[j3] - nodePos[i3];
        const dy = nodePos[j3 + 1] - nodePos[i3 + 1];
        const dz = nodePos[j3 + 2] - nodePos[i3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > L2) continue;
        const fall = 1 - Math.sqrt(d2) / LINK_DIST;
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 - (i * 0.37 + j * 0.61));
        const boost = (nodeGlow[i] + nodeGlow[j]) * 0.5;
        const k = fall * fall * (0.3 + 0.4 * pulse) + boost * fall * 0.7;
        if (k < 0.01) continue;
        const m = Math.min(1, boost * 1.5 + pulse * 0.3);
        const r = (BLUE[0] + (CYAN[0] - BLUE[0]) * m) * k;
        const g = (BLUE[1] + (CYAN[1] - BLUE[1]) * m) * k;
        const b = (BLUE[2] + (CYAN[2] - BLUE[2]) * m) * k;
        push(
          nodePos[i3], nodePos[i3 + 1], nodePos[i3 + 2],
          nodePos[j3], nodePos[j3 + 1], nodePos[j3 + 2],
          r, g, b, r, g, b
        );
      }
    }

    // Pointer ↔ node links: the cursor / finger joins the network
    if (act > 0.02) {
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const dx = nodePos[i3] - px;
        const dy = nodePos[i3 + 1] - py;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > POINTER_LINK_DIST) continue;
        const k = Math.pow(1 - d / POINTER_LINK_DIST, 1.5) * act * 0.75;
        push(
          nodePos[i3], nodePos[i3 + 1], nodePos[i3 + 2],
          px, py, pz,
          CYAN[0] * k * 0.6, CYAN[1] * k * 0.6, CYAN[2] * k * 0.6,
          (0.6 + CYAN[0] * 0.4) * k, (0.6 + CYAN[1] * 0.4) * k, (0.6 + CYAN[2] * 0.4) * k
        );
      }
    }

    lineGeo.setDrawRange(0, v);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.aColor.needsUpdate = true;
    nodeGeo.attributes.position.needsUpdate = true;
    nodeGeo.attributes.aGlow.needsUpdate = true;
    nodeMat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
  });

  return (
    <>
      <lineSegments geometry={data.lineGeo} material={data.lineMat} frustumCulled={false} renderOrder={1} />
      <points geometry={data.nodeGeo} material={data.nodeMat} frustumCulled={false} renderOrder={3} />
    </>
  );
}

// ─── 4. Particle field ──────────────────────────────────────────────────────

const PARTICLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec3 uPointer;   // world space
  uniform float uPointerStrength;
  uniform vec4 uShock;     // xyz = world origin, w = start time
  attribute float aScale;
  attribute vec3 aRandom;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vEnergy;
  ${PALETTE_GLSL}
  ${SIMPLEX_3D_GLSL}

  void main() {
    vec3 pos = position;

    // Flow-field drift
    float t = uTime * 0.12;
    vec3 flow = vec3(
      snoise(vec3(pos.xy * 0.07, t + aRandom.x * 9.0)),
      snoise(vec3(pos.yz * 0.07 + 17.0, t + aRandom.y * 9.0)),
      snoise(vec3(pos.zx * 0.07 + 41.0, t + aRandom.z * 9.0))
    );
    pos += flow * 1.8;

    vec4 world = modelMatrix * vec4(pos, 1.0);

    // Pointer repulsion (world space, so it stays correct as the field rotates)
    vec2 toP = world.xy - uPointer.xy;
    float pd = length(toP);
    float push = exp(-pd * pd * 0.12) * uPointerStrength;
    world.xy += (toP / max(pd, 1e-3)) * push * 2.6;
    world.z += push * 1.2;

    // Tap shockwave
    float shock = 0.0;
    float age = uTime - uShock.w;
    if (age > 0.0 && age < 3.0) {
      vec3 toS = world.xyz - uShock.xyz;
      float sd = length(toS);
      float w = sd - age * 10.0;
      shock = exp(-w * w * 0.35) * exp(-age * 1.3);
      world.xyz += (toS / max(sd, 1e-3)) * shock * 2.4;
    }
    vEnergy = clamp(push * 0.9 + shock * 1.4, 0.0, 1.6);

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;

    float depth = -mv.z;
    float twinkle = 0.6 + 0.4 * sin(uTime * (0.6 + aRandom.x * 2.4) + aRandom.y * 6.2831);
    float size = uSize * aScale * (0.75 + 0.25 * twinkle) * (1.0 + vEnergy * 0.9);
    gl_PointSize = clamp(size * uPixelRatio / max(depth, 0.5), 0.0, 48.0 * uPixelRatio);

    vAlpha = smoothstep(1.0, 4.0, depth) * (1.0 - smoothstep(26.0, 42.0, depth)) * (0.45 + 0.55 * twinkle);

    float k = aRandom.z;
    vColor = k < 0.55 ? mix(C_BLUE, C_CYAN, k / 0.55) : mix(C_CYAN, C_VIOLET, (k - 0.55) / 0.45);
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vEnergy;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float halo = pow(1.0 - d, 2.2);
    float core = 1.0 - smoothstep(0.0, 0.28, d);
    vec3 col = vColor * halo + vec3(0.85, 0.95, 1.0) * core * 0.8;
    col += vec3(0.5, 0.95, 1.0) * vEnergy * halo * 0.9;
    gl_FragColor = vec4(col * vAlpha, 1.0);
  }
`;

function ParticleField({ fx }: { fx: FxState }) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = QUALITY.particles;
    const rand = createSeededRandom(12345);
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const rnd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      if (rand() < 0.3) {
        // Tilted orbital ring
        const a = rand() * Math.PI * 2;
        const r = 7 + rand() * 7;
        const depth = Math.sin(a) * r;
        pos[i3] = Math.cos(a) * r;
        pos[i3 + 1] = depth * 0.28 + (rand() - 0.5) * 1.4 + 1.0;
        pos[i3 + 2] = depth * 0.55 - 3;
      } else {
        // Flattened ellipsoid cloud
        const theta = rand() * Math.PI * 2;
        const phi = Math.acos(2 * rand() - 1);
        const r = 3 + Math.pow(rand(), 0.7) * 20;
        pos[i3] = r * Math.sin(phi) * Math.cos(theta) * 1.2;
        pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
        pos[i3 + 2] = r * Math.cos(phi) * 0.5 - 2;
      }
      scl[i] = 0.35 + Math.pow(rand(), 2.2) * 1.6; // mostly fine dust, a few bright motes
      rnd[i3] = rand();
      rnd[i3 + 1] = rand();
      rnd[i3 + 2] = rand();
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aScale', new THREE.BufferAttribute(scl, 1));
    g.setAttribute('aRandom', new THREE.BufferAttribute(rnd, 3));
    return g;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: isLowPower ? 70 : 60 },
          uPointer: { value: new THREE.Vector3() },
          uPointerStrength: { value: 0 },
          uShock: { value: new THREE.Vector4(0, 0, 0, -100) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  useDispose(geometry, material);

  const zPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;
    pts.rotation.y = fx.time * 0.015;
    pts.rotation.z = Math.sin(fx.time * 0.05) * 0.06;

    const u = material.uniforms;
    u.uTime.value = fx.time;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    (u.uPointer.value as THREE.Vector3).copy(fx.pointerWorld);
    u.uPointerStrength.value = fx.activity;

    for (const ray of fx.frameTaps) {
      if (ray.intersectPlane(zPlane, hit)) {
        (u.uShock.value as THREE.Vector4).set(hit.x, hit.y, hit.z, fx.time);
      }
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}

// ─── 5. Focus orb ───────────────────────────────────────────────────────────

const ORB_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ORB_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uActivity;
  uniform float uPulseAge;
  varying vec2 vUv;
  ${PALETTE_GLSL}

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p);
    float ang = atan(p.y, p.x);

    float core = exp(-d * d * 900.0);
    float halo = exp(-d * d * 60.0) * 0.5;
    float outer = exp(-d * d * 12.0) * 0.16;
    float ringR = 0.15 + 0.012 * sin(uTime * 2.0);
    float ring = exp(-pow((d - ringR) * 70.0, 2.0)) * (0.3 + 0.25 * sin(ang * 3.0 + uTime * 1.5));

    vec3 WHITE = vec3(1.0, 1.0, 1.0);
    vec3 col = (WHITE * core * 1.2
              + WHITE * halo
              + WHITE * outer * 0.6
              + WHITE * ring) * uActivity;

    // Tap shockwave ring
    float age = uPulseAge;
    if (age >= 0.0 && age < 1.2) {
      float pr = age * 0.4;
      float pulse = exp(-pow((d - pr) * 45.0, 2.0)) * (1.0 - age / 1.2);
      col += WHITE * pulse * 1.1;
    }

    col *= 1.0 - smoothstep(0.42, 0.5, d);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function FocusOrb({ fx }: { fx: FxState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ORB_VERT,
        fragmentShader: ORB_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uActivity: { value: 0 },
          uPulseAge: { value: 100 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  useDispose(material);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.1);
    const lambda = fx.touch ? 18 : 7;
    const { damp } = THREE.MathUtils;
    if (fx.jumped) {
      mesh.position.copy(fx.pointerWorld);
    } else {
      mesh.position.x = damp(mesh.position.x, fx.pointerWorld.x, lambda, dt);
      mesh.position.y = damp(mesh.position.y, fx.pointerWorld.y, lambda, dt);
      mesh.position.z = damp(mesh.position.z, fx.pointerWorld.z, lambda, dt);
    }
    mesh.quaternion.copy(state.camera.quaternion); // billboard

    // Size relative to the visible width so the orb stays proportionate on
    // narrow portrait phones as well as wide desktop screens.
    const cam = state.camera;
    if (cam instanceof THREE.PerspectiveCamera) {
      const dist = cam.position.distanceTo(mesh.position);
      const visibleW = 2 * dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.aspect;
      mesh.scale.setScalar(THREE.MathUtils.clamp(visibleW * 0.28, 2.2, 7));
    }

    const u = material.uniforms;
    u.uTime.value = fx.time;
    u.uActivity.value = fx.activity;
    u.uPulseAge.value = fx.time - fx.lastTapTime;
  });

  return (
    <mesh ref={meshRef} material={material} frustumCulled={false} renderOrder={10}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

// ─── Scene & shell ──────────────────────────────────────────────────────────

function Scene({ fx }: { fx: FxState }) {
  return (
    <>
      <InteractionRig fx={fx} />
      <Backdrop fx={fx} />
      <Terrain fx={fx} />
      <Constellation fx={fx} />
      <ParticleField fx={fx} />
      <FocusOrb fx={fx} />
    </>
  );
}

/** Static gradient shown if WebGL is unavailable. */
function StaticFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(46,91,255,0.20), transparent 55%),' +
          'radial-gradient(ellipse at 75% 70%, rgba(0,242,254,0.10), transparent 50%),' +
          'radial-gradient(ellipse at 60% 30%, rgba(153,51,230,0.10), transparent 60%),' +
          '#000000',
      }}
    />
  );
}

interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

class WebGLBoundary extends Component<BoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.warn('[AdvancedBackground] WebGL unavailable, showing static fallback.', error);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// Main component
export default function AdvancedBackground() {
  const overlayOpen = useOverlayOpen();
  const fx = useMemo(createFxState, []);
  usePointerInput(fx);

  return (
    <div className="fixed inset-0 z-0 bg-black" aria-hidden="true">
      <WebGLBoundary fallback={<StaticFallback />}>
        <Canvas
          camera={{ position: [0, 0, 12], fov: 60, near: 0.1, far: 100 }}
          dpr={[1, QUALITY.dprMax]}
          frameloop={overlayOpen ? 'never' : 'always'}
          style={{ pointerEvents: 'none' }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
        >
          <Scene fx={fx} />
        </Canvas>
      </WebGLBoundary>

      {/* CSS vignette and film-grain overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </div>
  );
}