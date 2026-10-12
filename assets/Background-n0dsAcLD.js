import{r as y,j as p}from"./react-vendor-D1MasUqb.js";import{C as ve,V as A,R as me,a as F,u as he,P as K,b as fe,c as N,S as j,D as ge,d as se,B as $,e as k,f as V,A as Y,M as U,g as we}from"./three-BIcjDjoQ.js";import{u as ye}from"./overlayState-BZ9t3wg0.js";const Q=typeof window<"u";function ce(e){return Q&&typeof window.matchMedia=="function"&&window.matchMedia(e).matches}const J=ce("(pointer: coarse)")||Q&&window.innerWidth<768,le=ce("(prefers-reduced-motion: reduce)"),L=J?{particles:700,nodes:22,terrainX:96,terrainY:66,octaves:3,dprMax:1.25,bulge:1}:{particles:1600,nodes:42,terrainX:150,terrainY:104,octaves:4,dprMax:1.5,bulge:1.6},xe=le?.35:1,ne=le?.25:1,X=6,ae=64,re=44,Pe=400,I=[.18,.36,1],b=[0,.95,.99];function ue(e){return function(){return e=(e*9301+49297)%233280,e/233280}}const G=`
  const vec3 C_BLUE   = vec3(0.18, 0.36, 1.0);
  const vec3 C_CYAN   = vec3(0.0, 0.95, 0.99);
  const vec3 C_VIOLET = vec3(0.6, 0.2, 0.9);
`,pe=`
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
`;function Ce(){return{time:0,rawNdc:new F(0,0),hovering:!1,pressed:!1,touch:J,lastInput:-1/0,pendingTaps:[],snapRequested:!1,ndc:new F(0,0),jumped:!1,activity:0,ray:new me,pointerWorld:new A,frameTaps:[],lastTapTime:-100,pulse:0}}function Te(e){y.useEffect(()=>{if(!Q)return;let n=0;const s=(i,d)=>{e.rawNdc.set(i/window.innerWidth*2-1,-(d/window.innerHeight)*2+1),e.lastInput=performance.now()},o=i=>{e.touch=i.pointerType!=="mouse",e.hovering=!0,s(i.clientX,i.clientY)},h=i=>{if(o(i),i.pointerType==="mouse"&&i.button!==0)return;i.pointerType!=="mouse"&&(e.snapRequested=!0),e.pressed=!0;const d=performance.now();d-n>90&&e.pendingTaps.length<4&&(e.pendingTaps.push({ndc:e.rawNdc.clone(),at:d}),n=d)},c=i=>{e.pressed=!1,i.pointerType!=="mouse"&&(e.hovering=!1,e.lastInput=performance.now())},r=i=>{const d=i.touches[0];d&&(e.touch=!0,e.pressed=!0,s(d.clientX,d.clientY))},a=i=>{i.touches.length===0&&(e.pressed=!1,e.lastInput=performance.now())},t=i=>{i.pointerType==="mouse"&&!i.relatedTarget&&(e.hovering=!1)},l=()=>{e.hovering=!1,e.pressed=!1},u={passive:!0};return window.addEventListener("pointermove",o,u),window.addEventListener("pointerdown",h,u),window.addEventListener("pointerup",c,u),window.addEventListener("pointerout",t,u),window.addEventListener("touchmove",r,u),window.addEventListener("touchend",a,u),window.addEventListener("touchcancel",a,u),window.addEventListener("blur",l),()=>{window.removeEventListener("pointermove",o),window.removeEventListener("pointerdown",h),window.removeEventListener("pointerup",c),window.removeEventListener("pointerout",t),window.removeEventListener("touchmove",r),window.removeEventListener("touchend",a),window.removeEventListener("touchcancel",a),window.removeEventListener("blur",l)}},[e])}function W(...e){y.useEffect(()=>()=>e.forEach(n=>n.dispose()),e)}function Re({fx:e}){const n=he(o=>o.camera),s=y.useMemo(()=>({raycaster:new fe,zPlane:new K(new A(0,0,1),0),origin:new A(0,0,0)}),[]);return N((o,h)=>{const{damp:c}=U,r=Math.min(h,.1);e.time+=r*xe;const a=performance.now(),t=a-e.lastInput;let l;e.touch?l=e.pressed||t<900?1:0:l=e.hovering?t<4e3?1:.35:0,e.jumped=e.snapRequested||e.activity<.02,e.snapRequested=!1,e.jumped&&e.ndc.copy(e.rawNdc);const u=e.touch?16:9;e.ndc.x=c(e.ndc.x,e.rawNdc.x,u,r),e.ndc.y=c(e.ndc.y,e.rawNdc.y,u,r),e.activity=c(e.activity,l,l>e.activity?7:1.8,r);const i=e.time,d=(Math.sin(i*.05)*.7+e.ndc.x*1.4*e.activity)*ne,f=(Math.cos(i*.04)*.35+e.ndc.y*.7*e.activity)*ne;n.position.x=c(n.position.x,d,2.2,r),n.position.y=c(n.position.y,f,2.2,r),n.lookAt(s.origin),n.updateMatrixWorld();const{raycaster:g,zPlane:m}=s;g.setFromCamera(e.ndc,n),e.ray.copy(g.ray),g.ray.intersectPlane(m,e.pointerWorld),e.frameTaps.length=0;let T=!1;for(const O of e.pendingTaps)a-O.at>Pe||(g.setFromCamera(O.ndc,n),e.frameTaps.push(g.ray.clone()),T=!0);e.pendingTaps.length=0,T?(e.lastTapTime=e.time,e.pulse=1):e.pulse=Math.max(0,e.pulse-r*1.6)},-1),null}const Ee=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,be=`
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uActivity;
  uniform float uPulse;
  uniform vec2 uParallax;
  varying vec2 vUv;
  ${G}

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
`;function Ae({fx:e}){const n=y.useMemo(()=>new j({vertexShader:Ee,fragmentShader:be,defines:{OCTAVES:L.octaves},uniforms:{uTime:{value:0},uResolution:{value:new F(1,1)},uPixelRatio:{value:1},uPointer:{value:new F},uActivity:{value:0},uPulse:{value:0},uParallax:{value:new F}},depthTest:!1,depthWrite:!1}),[]);return W(n),N(s=>{const o=n.uniforms;o.uTime.value=e.time,o.uResolution.value.set(s.size.width,s.size.height),o.uPixelRatio.value=s.gl.getPixelRatio(),o.uPointer.value.copy(e.ndc),o.uActivity.value=e.activity,o.uPulse.value=e.pulse,o.uParallax.value.set(s.camera.position.x,s.camera.position.y)}),p.jsx("mesh",{"code-path":"src/components/three/Background.tsx:477:5",frustumCulled:!1,renderOrder:-1e3,material:n,children:p.jsx("planeGeometry",{"code-path":"src/components/three/Background.tsx:478:7",args:[2,2]})})}const Me=`
  uniform float uTime;
  uniform float uBulge;
  uniform vec3 uPointer;              // xy = local position, z = strength
  uniform vec4 uRipples[MAX_RIPPLES]; // xy = local position, z = start time, w = amplitude
  varying vec2 vUv;
  varying float vElevation;
  varying float vRipple;
  varying float vPointer;
  varying vec3 vWorld;
  ${pe}

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
`,_e=`
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;
  varying float vRipple;
  varying float vPointer;
  varying vec3 vWorld;
  ${G}

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
`;function ze({fx:e}){const n=y.useRef(null),s=y.useMemo(()=>new j({vertexShader:Me,fragmentShader:_e,defines:{MAX_RIPPLES:X},uniforms:{uTime:{value:0},uBulge:{value:L.bulge},uPointer:{value:new A},uRipples:{value:Array.from({length:X},()=>new se(0,0,-100,0))}},transparent:!0,depthWrite:!1,side:ge}),[]);W(s);const o=y.useMemo(()=>({plane:new K,normal:new A,hit:new A,cursor:0}),[]);return N((h,c)=>{const r=n.current;if(!r)return;const a=s.uniforms;a.uTime.value=e.time,r.updateMatrixWorld(),o.normal.set(0,0,1).applyQuaternion(r.quaternion),o.plane.setFromNormalAndCoplanarPoint(o.normal,r.position);const t=a.uPointer.value;let l=0;e.ray.intersectPlane(o.plane,o.hit)&&(r.worldToLocal(o.hit),Math.abs(o.hit.x)<ae/2&&Math.abs(o.hit.y)<re/2&&(t.x=o.hit.x,t.y=o.hit.y,l=e.activity)),t.z=U.damp(t.z,l,6,Math.min(c,.1));const u=a.uRipples.value;for(const i of e.frameTaps)i.intersectPlane(o.plane,o.hit)&&(r.worldToLocal(o.hit),u[o.cursor].set(o.hit.x,o.hit.y,e.time,1),o.cursor=(o.cursor+1)%X)}),p.jsx("mesh",{"code-path":"src/components/three/Background.tsx:652:5",ref:n,rotation:[-Math.PI/2.55,0,0],position:[0,-5.5,-7],material:s,frustumCulled:!1,children:p.jsx("planeGeometry",{"code-path":"src/components/three/Background.tsx:659:7",args:[ae,re,L.terrainX,L.terrainY]})})}const Se=`
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,ke=`
  varying vec3 vColor;
  void main() { gl_FragColor = vec4(vColor, 1.0); }
`,Le=`
  uniform float uPixelRatio;
  attribute float aGlow;
  varying float vGlow;
  void main() {
    vGlow = aGlow;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp((100.0 + aGlow * 130.0) * uPixelRatio / max(-mv.z, 0.5), 0.0, 40.0 * uPixelRatio);
  }
`,Be=`
  varying float vGlow;
  ${G}
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float halo = pow(1.0 - d, 3.0);
    float core = 1.0 - smoothstep(0.0, 0.22, d);
    vec3 col = C_CYAN * halo * (0.55 + vGlow * 0.9) + vec3(1.0) * core * (0.5 + vGlow * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`,H=5.2,ie=6.5;function Ie({fx:e}){const n=L.nodes,s=y.useMemo(()=>{const o=ue(54321),h=new Float32Array(n*3),c=new Float32Array(n);for(let m=0;m<n;m++)h[m*3]=(o()-.5)*28,h[m*3+1]=-3+o()*10.5,h[m*3+2]=-7+o()*8,c[m]=o()*Math.PI*2;const r=n*(n-1)/2+n,a=new Float32Array(r*6),t=new Float32Array(r*6),l=new $;l.setAttribute("position",new k(a,3).setUsage(V)),l.setAttribute("aColor",new k(t,3).setUsage(V)),l.setDrawRange(0,0);const u=new Float32Array(n*3),i=new Float32Array(n),d=new $;d.setAttribute("position",new k(u,3).setUsage(V)),d.setAttribute("aGlow",new k(i,1).setUsage(V));const f=new j({vertexShader:Se,fragmentShader:ke,transparent:!0,depthWrite:!1,blending:Y}),g=new j({vertexShader:Le,fragmentShader:Be,uniforms:{uPixelRatio:{value:1}},transparent:!0,depthWrite:!1,blending:Y});return{base:h,phase:c,linePos:a,lineCol:t,lineGeo:l,nodePos:u,nodeGlow:i,nodeGeo:d,lineMat:f,nodeMat:g}},[n]);return W(s.lineGeo,s.nodeGeo,s.lineMat,s.nodeMat),N(o=>{const{base:h,phase:c,linePos:r,lineCol:a,nodePos:t,nodeGlow:l,lineGeo:u,nodeGeo:i,nodeMat:d}=s,f=e.time,g=e.activity,m=e.pointerWorld.x,T=e.pointerWorld.y,O=e.pointerWorld.z;for(let w=0;w<n;w++){const v=w*3,C=c[w];let P=h[v]+Math.sin(f*.23+C)*.9,E=h[v+1]+Math.cos(f*.19+C*1.7)*.7;const R=h[v+2]+Math.sin(f*.15+C*.6)*.6,M=m-P,_=T-E,z=M*M+_*_,S=Math.exp(-z/18)*g*.32;P+=M*S,E+=_*S,t[v]=P,t[v+1]=E,t[v+2]=R,l[w]=Math.exp(-z/10)*g}let q=0;const Z=(w,v,C,P,E,R,M,_,z,S,D,B)=>{const x=q*3;r[x]=w,r[x+1]=v,r[x+2]=C,r[x+3]=P,r[x+4]=E,r[x+5]=R,a[x]=M,a[x+1]=_,a[x+2]=z,a[x+3]=S,a[x+4]=D,a[x+5]=B,q+=2},de=H*H;for(let w=0;w<n;w++){const v=w*3;for(let C=w+1;C<n;C++){const P=C*3,E=t[P]-t[v],R=t[P+1]-t[v+1],M=t[P+2]-t[v+2],_=E*E+R*R+M*M;if(_>de)continue;const z=1-Math.sqrt(_)/H,S=.5+.5*Math.sin(f*1.4-(w*.37+C*.61)),D=(l[w]+l[C])*.5,B=z*z*(.3+.4*S)+D*z*.7;if(B<.01)continue;const x=Math.min(1,D*1.5+S*.3),ee=(I[0]+(b[0]-I[0])*x)*B,te=(I[1]+(b[1]-I[1])*x)*B,oe=(I[2]+(b[2]-I[2])*x)*B;Z(t[v],t[v+1],t[v+2],t[P],t[P+1],t[P+2],ee,te,oe,ee,te,oe)}}if(g>.02)for(let w=0;w<n;w++){const v=w*3,C=t[v]-m,P=t[v+1]-T,E=Math.sqrt(C*C+P*P);if(E>ie)continue;const R=Math.pow(1-E/ie,1.5)*g*.75;Z(t[v],t[v+1],t[v+2],m,T,O,b[0]*R*.6,b[1]*R*.6,b[2]*R*.6,(.6+b[0]*.4)*R,(.6+b[1]*.4)*R,(.6+b[2]*.4)*R)}u.setDrawRange(0,q),u.attributes.position.needsUpdate=!0,u.attributes.aColor.needsUpdate=!0,i.attributes.position.needsUpdate=!0,i.attributes.aGlow.needsUpdate=!0,d.uniforms.uPixelRatio.value=o.gl.getPixelRatio()}),p.jsxs(p.Fragment,{children:[p.jsx("lineSegments",{"code-path":"src/components/three/Background.tsx:852:7",geometry:s.lineGeo,material:s.lineMat,frustumCulled:!1,renderOrder:1}),p.jsx("points",{"code-path":"src/components/three/Background.tsx:853:7",geometry:s.nodeGeo,material:s.nodeMat,frustumCulled:!1,renderOrder:3})]})}const je=`
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
  ${G}
  ${pe}

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
`,Ne=`
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
`;function Fe({fx:e}){const n=y.useRef(null),s=y.useMemo(()=>{const r=L.particles,a=ue(12345),t=new Float32Array(r*3),l=new Float32Array(r),u=new Float32Array(r*3);for(let d=0;d<r;d++){const f=d*3;if(a()<.3){const g=a()*Math.PI*2,m=7+a()*7,T=Math.sin(g)*m;t[f]=Math.cos(g)*m,t[f+1]=T*.28+(a()-.5)*1.4+1,t[f+2]=T*.55-3}else{const g=a()*Math.PI*2,m=Math.acos(2*a()-1),T=3+Math.pow(a(),.7)*20;t[f]=T*Math.sin(m)*Math.cos(g)*1.2,t[f+1]=T*Math.sin(m)*Math.sin(g)*.7,t[f+2]=T*Math.cos(m)*.5-2}l[d]=.35+Math.pow(a(),2.2)*1.6,u[f]=a(),u[f+1]=a(),u[f+2]=a()}const i=new $;return i.setAttribute("position",new k(t,3)),i.setAttribute("aScale",new k(l,1)),i.setAttribute("aRandom",new k(u,3)),i},[]),o=y.useMemo(()=>new j({vertexShader:je,fragmentShader:Ne,uniforms:{uTime:{value:0},uPixelRatio:{value:1},uSize:{value:J?70:60},uPointer:{value:new A},uPointerStrength:{value:0},uShock:{value:new se(0,0,0,-100)}},transparent:!0,depthWrite:!1,blending:Y}),[]);W(s,o);const h=y.useMemo(()=>new K(new A(0,0,1),0),[]),c=y.useMemo(()=>new A,[]);return N(r=>{const a=n.current;if(!a)return;a.rotation.y=e.time*.015,a.rotation.z=Math.sin(e.time*.05)*.06;const t=o.uniforms;t.uTime.value=e.time,t.uPixelRatio.value=r.gl.getPixelRatio(),t.uPointer.value.copy(e.pointerWorld),t.uPointerStrength.value=e.activity;for(const l of e.frameTaps)l.intersectPlane(h,c)&&t.uShock.value.set(c.x,c.y,c.z,e.time)}),p.jsx("points",{"code-path":"src/components/three/Background.tsx:1024:10",ref:n,geometry:s,material:o,frustumCulled:!1,renderOrder:2})}const Ue=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Ge=`
  uniform float uTime;
  uniform float uActivity;
  uniform float uPulseAge;
  varying vec2 vUv;
  ${G}

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
`;function We({fx:e}){const n=y.useRef(null),s=y.useMemo(()=>new j({vertexShader:Ue,fragmentShader:Ge,uniforms:{uTime:{value:0},uActivity:{value:0},uPulseAge:{value:100}},transparent:!0,depthWrite:!1,depthTest:!1,blending:Y}),[]);return W(s),N((o,h)=>{const c=n.current;if(!c)return;const r=Math.min(h,.1),a=e.touch?18:7,{damp:t}=U;e.jumped?c.position.copy(e.pointerWorld):(c.position.x=t(c.position.x,e.pointerWorld.x,a,r),c.position.y=t(c.position.y,e.pointerWorld.y,a,r),c.position.z=t(c.position.z,e.pointerWorld.z,a,r)),c.quaternion.copy(o.camera.quaternion);const l=o.camera;if(l instanceof we){const d=2*l.position.distanceTo(c.position)*Math.tan(U.degToRad(l.fov/2))*l.aspect;c.scale.setScalar(U.clamp(d*.28,2.2,7))}const u=s.uniforms;u.uTime.value=e.time,u.uActivity.value=e.activity,u.uPulseAge.value=e.time-e.lastTapTime}),p.jsx("mesh",{"code-path":"src/components/three/Background.tsx:1126:5",ref:n,material:s,frustumCulled:!1,renderOrder:10,children:p.jsx("planeGeometry",{"code-path":"src/components/three/Background.tsx:1127:7",args:[1,1]})})}function Oe({fx:e}){return p.jsxs(p.Fragment,{children:[p.jsx(Re,{"code-path":"src/components/three/Background.tsx:1137:7",fx:e}),p.jsx(Ae,{"code-path":"src/components/three/Background.tsx:1138:7",fx:e}),p.jsx(ze,{"code-path":"src/components/three/Background.tsx:1139:7",fx:e}),p.jsx(Ie,{"code-path":"src/components/three/Background.tsx:1140:7",fx:e}),p.jsx(Fe,{"code-path":"src/components/three/Background.tsx:1141:7",fx:e}),p.jsx(We,{"code-path":"src/components/three/Background.tsx:1142:7",fx:e})]})}function De(){return p.jsx("div",{"code-path":"src/components/three/Background.tsx:1150:5",className:"absolute inset-0",style:{background:"radial-gradient(ellipse at 30% 20%, rgba(46,91,255,0.20), transparent 55%),radial-gradient(ellipse at 75% 70%, rgba(0,242,254,0.10), transparent 50%),radial-gradient(ellipse at 60% 30%, rgba(153,51,230,0.10), transparent 60%),#000000"}})}class Ve extends y.Component{state={failed:!1};static getDerivedStateFromError(){return{failed:!0}}componentDidCatch(n){console.warn("[AdvancedBackground] WebGL unavailable, showing static fallback.",n)}render(){return this.state.failed?this.props.fallback:this.props.children}}function He(){const e=ye(),n=y.useMemo(Ce,[]);return Te(n),p.jsxs("div",{"code-path":"src/components/three/Background.tsx:1191:5",className:"fixed inset-0 z-0 bg-black","aria-hidden":"true",children:[p.jsx(Ve,{"code-path":"src/components/three/Background.tsx:1192:7",fallback:p.jsx(De,{"code-path":"src/components/three/Background.tsx:1192:32"}),children:p.jsx(ve,{"code-path":"src/components/three/Background.tsx:1193:9",camera:{position:[0,0,12],fov:60,near:.1,far:100},dpr:[1,L.dprMax],frameloop:e?"never":"always",style:{pointerEvents:"none"},gl:{antialias:!1,alpha:!0,powerPreference:"high-performance",stencil:!1,depth:!0},children:p.jsx(Oe,{"code-path":"src/components/three/Background.tsx:1206:11",fx:n})})}),p.jsxs("div",{"code-path":"src/components/three/Background.tsx:1211:7",className:"absolute inset-0 pointer-events-none",children:[p.jsx("div",{"code-path":"src/components/three/Background.tsx:1212:9",className:"absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.75)_100%)]"}),p.jsx("div",{"code-path":"src/components/three/Background.tsx:1213:9",className:"absolute inset-0 opacity-[0.03]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}})]})]})}export{He as default};
