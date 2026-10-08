import{j as e,r as a}from"./react-vendor-D1MasUqb.js";import{C as w,u as T,a as y,V as k,D as M,A as j,b as C,B as R,c as E}from"./three-MlUiDB9b.js";import{u as z}from"./overlayState-BZ9t3wg0.js";function B(t){return function(){return t=(t*9301+49297)%233280,t/233280}}const g=typeof window<"u"&&(window.matchMedia("(pointer: coarse)").matches||window.innerWidth<768),P=`
  uniform float uTime;
  uniform vec2 uMouse;
  attribute float aScale;
  attribute vec3 aRandom;
  varying vec3 vPosition;
  varying float vDist;
  
  void main() {
    vPosition = position;
    vec3 pos = position;
    
    // Organic floating motion
    float noise = sin(uTime * aRandom.x + aRandom.y) * 0.5 + 0.5;
    pos.x += sin(uTime * 0.5 + aRandom.z) * 0.5;
    pos.y += cos(uTime * 0.3 + aRandom.x) * 0.5;
    pos.z += sin(uTime * 0.4 + aRandom.y) * 0.3;
    
    // Mouse repulsion
    vec2 toMouse = pos.xy - uMouse * 10.0;
    float dist = length(toMouse);
    vDist = dist;
    
    if (dist < 3.0) {
      float force = (3.0 - dist) / 3.0;
      pos.xy += normalize(toMouse) * force * 2.0;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aScale * (300.0 / -mvPosition.z) * (1.0 + noise * 0.5);
  }
`,F=`
  uniform float uTime;
  varying vec3 vPosition;
  varying float vDist;
  
  void main() {
    // Circular particle with soft edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Gradient from center
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Color based on position and time
    vec3 color1 = vec3(0.18, 0.36, 1.0); // #2e5bff
    vec3 color2 = vec3(0.0, 0.95, 0.99); // #00f2fe
    vec3 color3 = vec3(0.6, 0.2, 0.9);   // Purple accent
    
    float mixFactor = sin(vPosition.x * 0.1 + uTime * 0.5) * 0.5 + 0.5;
    vec3 finalColor = mix(color1, color2, mixFactor);
    finalColor = mix(finalColor, color3, sin(uTime * 0.3) * 0.3 + 0.2);
    
    // Glow intensity based on mouse proximity
    float glow = 1.0 + (1.0 - smoothstep(0.0, 5.0, vDist)) * 2.0;
    
    gl_FragColor = vec4(finalColor * glow, alpha * 0.9);
  }
`;function A(){const t=a.useRef(null),c=g?100:200,[o,n,i]=a.useMemo(()=>{const r=B(12345),p=new Float32Array(c*3),l=new Float32Array(c),m=new Float32Array(c*3);for(let f=0;f<c;f++){const h=f*3,s=r()*Math.PI*2,d=Math.acos(2*r()-1),x=5+r()*15;p[h]=x*Math.sin(d)*Math.cos(s),p[h+1]=x*Math.sin(d)*Math.sin(s),p[h+2]=x*Math.cos(d)*.5,l[f]=.5+r()*1.5,m[h]=r(),m[h+1]=r(),m[h+2]=r()}return[p,l,m]},[]),u=a.useRef(null);a.useEffect(()=>{u.current={uTime:{value:0},uMouse:{value:new k(100,100)}};const r=t.current?.material;r&&(r.uniforms=u.current)},[]),y(r=>{!t.current||!u.current||(u.current.uTime.value=r.clock.getElapsedTime(),t.current.rotation.y=r.clock.getElapsedTime()*.02,t.current.rotation.z=Math.sin(r.clock.getElapsedTime()*.1)*.05)});const v=a.useMemo(()=>({uTime:{value:0},uMouse:{value:new k(100,100)}}),[]);return e.jsxs("points",{"code-path":"src/components/three/Background.tsx:148:5",ref:t,children:[e.jsxs("bufferGeometry",{"code-path":"src/components/three/Background.tsx:149:7",children:[e.jsx("bufferAttribute",{"code-path":"src/components/three/Background.tsx:150:9",attach:"attributes-position",args:[o,3]}),e.jsx("bufferAttribute",{"code-path":"src/components/three/Background.tsx:154:9",attach:"attributes-aScale",args:[n,1]}),e.jsx("bufferAttribute",{"code-path":"src/components/three/Background.tsx:158:9",attach:"attributes-aRandom",args:[i,3]})]}),e.jsx("shaderMaterial",{"code-path":"src/components/three/Background.tsx:163:7",vertexShader:P,fragmentShader:F,uniforms:v,transparent:!0,depthWrite:!1,blending:j})]})}function S(){const t=a.useRef(null),c=`
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uHover;
    varying vec2 vUv;
    varying float vElevation;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Multi-layered noise
      float noise1 = snoise(pos.xy * 0.1 + uTime * 0.2) * 2.0;
      float noise2 = snoise(pos.xy * 0.3 - uTime * 0.15) * 1.0;
      float noise3 = snoise(pos.xy * 0.6 + uTime * 0.1) * 0.5;
      
      // Mouse interaction ripple
      float dist = distance(pos.xy, uMouse * 15.0);
      float ripple = sin(dist * 0.5 - uTime * 3.0) * exp(-dist * 0.1) * uHover * 3.0;
      
      pos.z += noise1 + noise2 + noise3 + ripple;
      vElevation = pos.z;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,o=`
    uniform float uTime;
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      // Gradient based on elevation
      vec3 deepColor = vec3(0.05, 0.05, 0.2);
      vec3 surfaceColor = vec3(0.18, 0.36, 1.0);
      vec3 highlightColor = vec3(0.0, 0.95, 0.99);
      
      float mixFactor = smoothstep(-2.0, 4.0, vElevation);
      vec3 color = mix(deepColor, surfaceColor, mixFactor);
      color = mix(color, highlightColor, smoothstep(2.0, 5.0, vElevation) * 0.5);
      
      // Grid pattern
      float gridX = step(0.98, fract(vUv.x * 50.0));
      float gridY = step(0.98, fract(vUv.y * 50.0));
      float grid = max(gridX, gridY) * 0.3;
      
      // Scanline effect
      float scanline = sin(vUv.y * 100.0 + uTime) * 0.02;
      
      gl_FragColor = vec4(color + grid + scanline, 0.6);
    }
  `,n=a.useRef(null);a.useEffect(()=>{n.current={uTime:{value:0},uMouse:{value:new k(100,100)},uHover:{value:0}};const u=t.current?.material;u&&(u.uniforms=n.current)},[]),y(u=>{!t.current||!n.current||(n.current.uTime.value=u.clock.getElapsedTime())});const i=a.useMemo(()=>({uTime:{value:0},uMouse:{value:new k(100,100)},uHover:{value:0}}),[]);return e.jsxs("mesh",{"code-path":"src/components/three/Background.tsx:297:5",ref:t,rotation:[-Math.PI/3,0,0],position:[0,-4,-8],scale:[2,2,1],children:[e.jsx("planeGeometry",{"code-path":"src/components/three/Background.tsx:303:7",args:[30,30,g?48:96,g?48:96]}),e.jsx("shaderMaterial",{"code-path":"src/components/three/Background.tsx:304:7",vertexShader:c,fragmentShader:o,uniforms:i,transparent:!0,side:M,wireframe:!1})]})}function G(){const t=a.useRef(null),c=a.useRef(null),o=a.useRef(null),n=g?18:30,i=a.useMemo(()=>{const r=B(54321),p=[];for(let l=0;l<n;l++)p.push(new C((r()-.5)*25,(r()-.5)*15,(r()-.5)*10));return p},[]),[u,v]=a.useMemo(()=>{const r=new R,p=new Float32Array(n*n*6);r.setAttribute("position",new E(p,3));const l=new Float32Array(n*3);return[r,l]},[]);return a.useEffect(()=>{o.current=u},[u]),y(r=>{if(!t.current||!c.current||!o.current)return;const p=r.clock.getElapsedTime(),l=o.current.attributes.position.array;let m=0;const f=7;i.forEach((s,d)=>{const x=s.y;s.y=x+Math.sin(p*.5+d)*.5,s.x+=Math.cos(p*.3+d*.5)*.01});const h=c.current.geometry.attributes.position.array;i.forEach((s,d)=>{h[d*3]=s.x,h[d*3+1]=s.y,h[d*3+2]=s.z}),c.current.geometry.attributes.position.needsUpdate=!0;for(let s=0;s<n;s++)for(let d=s+1;d<n;d++){const x=i[s].distanceTo(i[d]);if(x<f&&m<l.length-6){const b=Math.sin(p*2-x*.5)*.5+.5;(1-x/f)*b>.1&&(l[m++]=i[s].x,l[m++]=i[s].y,l[m++]=i[s].z,l[m++]=i[d].x,l[m++]=i[d].y,l[m++]=i[d].z)}}for(let s=m;s<l.length;s++)l[s]=0;o.current.attributes.position.needsUpdate=!0}),e.jsxs(e.Fragment,{children:[e.jsx("lineSegments",{"code-path":"src/components/three/Background.tsx:402:7",ref:t,geometry:u,children:e.jsx("lineBasicMaterial",{"code-path":"src/components/three/Background.tsx:403:9",color:3038207,transparent:!0,opacity:.15,blending:j})}),e.jsxs("points",{"code-path":"src/components/three/Background.tsx:405:7",ref:c,children:[e.jsx("bufferGeometry",{"code-path":"src/components/three/Background.tsx:406:9",children:e.jsx("bufferAttribute",{"code-path":"src/components/three/Background.tsx:407:11",attach:"attributes-position",args:[v,3]})}),e.jsx("pointsMaterial",{"code-path":"src/components/three/Background.tsx:412:9",size:.15,color:62206,transparent:!0,opacity:.8,blending:j})]})]})}function U(){const t=a.useRef(null),c=a.useMemo(()=>{const o=B(99999);return Array.from({length:g?7:15},()=>({position:[(o()-.5)*20,(o()-.5)*15,(o()-.5)*10],rotation:[o()*Math.PI,o()*Math.PI,0],scale:.5+o()*1,speed:.2+o()*.3,type:Math.floor(o()*3)}))},[]);return y(o=>{if(!t.current)return;const n=o.clock.getElapsedTime();t.current.children.forEach((i,u)=>{i.rotation.x+=.005*c[u].speed,i.rotation.y+=.01*c[u].speed,i.position.y+=Math.sin(n*c[u].speed+u)*.002})}),e.jsx("group",{"code-path":"src/components/three/Background.tsx:443:5",ref:t,children:c.map((o,n)=>e.jsxs("mesh",{"code-path":"src/components/three/Background.tsx:445:9",position:o.position,rotation:o.rotation,scale:o.scale,children:[o.type===0?e.jsx("icosahedronGeometry",{"code-path":"src/components/three/Background.tsx:446:31",args:[.5,0]}):o.type===1?e.jsx("torusGeometry",{"code-path":"src/components/three/Background.tsx:447:31",args:[.4,.15,8,20]}):e.jsx("octahedronGeometry",{"code-path":"src/components/three/Background.tsx:448:12",args:[.5,0]}),e.jsx("meshStandardMaterial",{"code-path":"src/components/three/Background.tsx:450:11",color:3038207,metalness:.4,roughness:.2,emissive:1321070,emissiveIntensity:.5,transparent:!0,opacity:.3,side:M})]},n))})}function _(){const t=a.useRef(null),c=a.useRef(null);return y(o=>{if(!t.current||!c.current)return;const n=o.clock.getElapsedTime(),i=Math.sin(n*.4)*6,u=Math.cos(n*.3)*4,v=2+Math.sin(n)*2;t.current.position.x+=(i-t.current.position.x)*.05,t.current.position.y+=(u-t.current.position.y)*.05,t.current.position.z+=(v-t.current.position.z)*.05,c.current.position.copy(t.current.position),c.current.rotation.z=n*.5}),e.jsxs(e.Fragment,{children:[e.jsx("pointLight",{"code-path":"src/components/three/Background.tsx:490:7",ref:t,intensity:2,distance:20,color:62206}),e.jsxs("mesh",{"code-path":"src/components/three/Background.tsx:491:7",ref:c,children:[e.jsx("sphereGeometry",{"code-path":"src/components/three/Background.tsx:492:9",args:[.2,16,16]}),e.jsx("meshBasicMaterial",{"code-path":"src/components/three/Background.tsx:493:9",color:16777215,transparent:!0,opacity:.8})]})]})}function N(){const{camera:t}=T();return a.useEffect(()=>{t.position.set(0,0,12),t.lookAt(0,0,0)},[t]),null}function D(){return e.jsxs(e.Fragment,{children:[e.jsx(N,{"code-path":"src/components/three/Background.tsx:517:7"}),e.jsx("color",{"code-path":"src/components/three/Background.tsx:518:7",attach:"background",args:["#050510"]}),e.jsx("fog",{"code-path":"src/components/three/Background.tsx:519:7",attach:"fog",args:["#050510",10,50]}),e.jsx("ambientLight",{"code-path":"src/components/three/Background.tsx:521:7",intensity:.1}),e.jsx("directionalLight",{"code-path":"src/components/three/Background.tsx:522:7",position:[10,10,5],intensity:.5,color:3038207}),e.jsx(_,{"code-path":"src/components/three/Background.tsx:524:7"}),e.jsx(S,{"code-path":"src/components/three/Background.tsx:525:7"}),e.jsx(A,{"code-path":"src/components/three/Background.tsx:526:7"}),e.jsx(G,{"code-path":"src/components/three/Background.tsx:527:7"}),e.jsx(U,{"code-path":"src/components/three/Background.tsx:528:7"})]})}function L(){return e.jsx("div",{"code-path":"src/components/three/Background.tsx:536:5",className:"flex items-center justify-center h-screen text-blue-400",children:e.jsx("div",{"code-path":"src/components/three/Background.tsx:537:7",className:"animate-pulse",children:"Loading Experience..."})})}function Y(){const t=z();return e.jsxs("div",{"code-path":"src/components/three/Background.tsx:546:5",className:"fixed inset-0 z-0 bg-[#050510]",children:[e.jsx(a.Suspense,{"code-path":"src/components/three/Background.tsx:547:7",fallback:e.jsx(L,{"code-path":"src/components/three/Background.tsx:547:27"}),children:e.jsx(w,{"code-path":"src/components/three/Background.tsx:548:9",camera:{position:[0,0,12],fov:60},dpr:[1,g?1.25:1.5],frameloop:t?"never":"always",gl:{antialias:!1,alpha:!0,powerPreference:"high-performance",stencil:!1,depth:!0},children:e.jsx(D,{"code-path":"src/components/three/Background.tsx:560:11"})})}),e.jsxs("div",{"code-path":"src/components/three/Background.tsx:565:7",className:"absolute inset-0 pointer-events-none",children:[e.jsx("div",{"code-path":"src/components/three/Background.tsx:566:9",className:"absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,16,0.4)_100%)]"}),e.jsx("div",{"code-path":"src/components/three/Background.tsx:567:9",className:"absolute inset-0 opacity-[0.015]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg '%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}})]})]})}export{Y as default};
