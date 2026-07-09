import{j as e,b as c,C as R,u as T,c as w,V as j,D as E,A as B,d as C,B as z,e as P}from"./three-CXBNYTqq.js";function b(n){return function(){return n=(n*9301+49297)%233280,n/233280}}const y=typeof window<"u"&&(window.matchMedia("(pointer: coarse)").matches||window.innerWidth<768),F=`
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
`,A=`
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
`;function L(){const n=c.useRef(null),t=c.useRef({x:0,y:0}),o=y?100:200,[i,r,a]=c.useMemo(()=>{const s=b(12345),d=new Float32Array(o*3),m=new Float32Array(o),p=new Float32Array(o*3);for(let g=0;g<o;g++){const f=g*3,u=s()*Math.PI*2,h=Math.acos(2*s()-1),v=5+s()*15;d[f]=v*Math.sin(h)*Math.cos(u),d[f+1]=v*Math.sin(h)*Math.sin(u),d[f+2]=v*Math.cos(h)*.5,m[g]=.5+s()*1.5,p[f]=s(),p[f+1]=s(),p[f+2]=s()}return[d,m,p]},[]),l=c.useRef(null);c.useEffect(()=>{l.current={uTime:{value:0},uMouse:{value:new j(0,0)}};const s=n.current?.material;s&&(s.uniforms=l.current)},[]),c.useEffect(()=>{const s=d=>{t.current.x=d.clientX/window.innerWidth*2-1,t.current.y=-(d.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",s),()=>window.removeEventListener("mousemove",s)},[]),w(s=>{!n.current||!l.current||(l.current.uTime.value=s.clock.getElapsedTime(),l.current.uMouse.value.x+=(t.current.x-l.current.uMouse.value.x)*.05,l.current.uMouse.value.y+=(t.current.y-l.current.uMouse.value.y)*.05,n.current.rotation.y=s.clock.getElapsedTime()*.02,n.current.rotation.z=Math.sin(s.clock.getElapsedTime()*.1)*.05)});const x=c.useMemo(()=>({uTime:{value:0},uMouse:{value:new j(0,0)}}),[]);return e.jsxs("points",{"code-path":"src\\components\\three\\Background.tsx:163:5",ref:n,children:[e.jsxs("bufferGeometry",{"code-path":"src\\components\\three\\Background.tsx:164:7",children:[e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:165:9",attach:"attributes-position",args:[i,3]}),e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:169:9",attach:"attributes-aScale",args:[r,1]}),e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:173:9",attach:"attributes-aRandom",args:[a,3]})]}),e.jsx("shaderMaterial",{"code-path":"src\\components\\three\\Background.tsx:178:7",vertexShader:F,fragmentShader:A,uniforms:x,transparent:!0,depthWrite:!1,blending:B})]})}function S(){const n=c.useRef(null),t=c.useRef({x:0,y:0,vx:0,vy:0}),o=`
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
  `,i=`
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
  `,r=c.useRef(null);c.useEffect(()=>{r.current={uTime:{value:0},uMouse:{value:new j(0,0)},uHover:{value:0}};const l=n.current?.material;l&&(l.uniforms=r.current)},[]),c.useEffect(()=>{let l=0,x=0;const s=d=>{const m=d.clientX/window.innerWidth*2-1,p=-(d.clientY/window.innerHeight)*2+1;t.current.vx=m-l,t.current.vy=p-x,t.current.x=m,t.current.y=p,l=m,x=p};return window.addEventListener("mousemove",s),()=>window.removeEventListener("mousemove",s)},[]),w(l=>{if(!n.current||!r.current)return;r.current.uTime.value=l.clock.getElapsedTime(),r.current.uMouse.value.x+=(t.current.x-r.current.uMouse.value.x)*.05,r.current.uMouse.value.y+=(t.current.y-r.current.uMouse.value.y)*.05;const x=Math.sqrt(t.current.vx**2+t.current.vy**2);r.current.uHover.value+=(x*5-r.current.uHover.value)*.1});const a=c.useMemo(()=>({uTime:{value:0},uMouse:{value:new j(0,0)},uHover:{value:0}}),[]);return e.jsxs("mesh",{"code-path":"src\\components\\three\\Background.tsx:338:5",ref:n,rotation:[-Math.PI/3,0,0],position:[0,-4,-8],scale:[2,2,1],children:[e.jsx("planeGeometry",{"code-path":"src\\components\\three\\Background.tsx:344:7",args:[30,30,y?48:96,y?48:96]}),e.jsx("shaderMaterial",{"code-path":"src\\components\\three\\Background.tsx:345:7",vertexShader:o,fragmentShader:i,uniforms:a,transparent:!0,side:E,wireframe:!1})]})}function G(){const n=c.useRef(null),t=c.useRef(null),o=c.useRef({x:0,y:0}),i=c.useRef(null),r=y?18:30,a=c.useMemo(()=>{const s=b(54321),d=[];for(let m=0;m<r;m++)d.push(new C((s()-.5)*25,(s()-.5)*15,(s()-.5)*10));return d},[]),[l,x]=c.useMemo(()=>{const s=new z,d=new Float32Array(r*r*6);s.setAttribute("position",new P(d,3));const m=new Float32Array(r*3);return[s,m]},[]);return c.useEffect(()=>{i.current=l},[l]),c.useEffect(()=>{const s=d=>{o.current.x=d.clientX/window.innerWidth*2-1,o.current.y=-(d.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",s),()=>window.removeEventListener("mousemove",s)},[]),w(s=>{if(!n.current||!t.current||!i.current)return;const d=s.clock.getElapsedTime(),m=i.current.attributes.position.array;let p=0;const g=7;a.forEach((u,h)=>{const v=u.y;u.y=v+Math.sin(d*.5+h)*.5,u.x+=Math.cos(d*.3+h*.5)*.01;const M=o.current.x*10-u.x,k=o.current.y*5-u.y;Math.sqrt(M*M+k*k)<8&&(u.x+=M*.002,u.y+=k*.002)});const f=t.current.geometry.attributes.position.array;a.forEach((u,h)=>{f[h*3]=u.x,f[h*3+1]=u.y,f[h*3+2]=u.z}),t.current.geometry.attributes.position.needsUpdate=!0;for(let u=0;u<r;u++)for(let h=u+1;h<r;h++){const v=a[u].distanceTo(a[h]);if(v<g&&p<m.length-6){const M=Math.sin(d*2-v*.5)*.5+.5;(1-v/g)*M>.1&&(m[p++]=a[u].x,m[p++]=a[u].y,m[p++]=a[u].z,m[p++]=a[h].x,m[p++]=a[h].y,m[p++]=a[h].z)}}for(let u=p;u<m.length;u++)m[u]=0;i.current.attributes.position.needsUpdate=!0}),e.jsxs(e.Fragment,{children:[e.jsx("lineSegments",{"code-path":"src\\components\\three\\Background.tsx:462:7",ref:n,geometry:l,children:e.jsx("lineBasicMaterial",{"code-path":"src\\components\\three\\Background.tsx:463:9",color:3038207,transparent:!0,opacity:.15,blending:B})}),e.jsxs("points",{"code-path":"src\\components\\three\\Background.tsx:465:7",ref:t,children:[e.jsx("bufferGeometry",{"code-path":"src\\components\\three\\Background.tsx:466:9",children:e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:467:11",attach:"attributes-position",args:[x,3]})}),e.jsx("pointsMaterial",{"code-path":"src\\components\\three\\Background.tsx:472:9",size:.15,color:62206,transparent:!0,opacity:.8,blending:B})]})]})}function H(){const n=c.useRef(null),t=c.useMemo(()=>{const o=b(99999);return Array.from({length:y?7:15},()=>({position:[(o()-.5)*20,(o()-.5)*15,(o()-.5)*10],rotation:[o()*Math.PI,o()*Math.PI,0],scale:.5+o()*1,speed:.2+o()*.3,type:Math.floor(o()*3)}))},[]);return w(o=>{if(!n.current)return;const i=o.clock.getElapsedTime();n.current.children.forEach((r,a)=>{r.rotation.x+=.005*t[a].speed,r.rotation.y+=.01*t[a].speed,r.position.y+=Math.sin(i*t[a].speed+a)*.002})}),e.jsx("group",{"code-path":"src\\components\\three\\Background.tsx:503:5",ref:n,children:t.map((o,i)=>e.jsxs("mesh",{"code-path":"src\\components\\three\\Background.tsx:505:9",position:o.position,rotation:o.rotation,scale:o.scale,children:[o.type===0?e.jsx("icosahedronGeometry",{"code-path":"src\\components\\three\\Background.tsx:506:31",args:[.5,0]}):o.type===1?e.jsx("torusGeometry",{"code-path":"src\\components\\three\\Background.tsx:507:31",args:[.4,.15,8,20]}):e.jsx("octahedronGeometry",{"code-path":"src\\components\\three\\Background.tsx:508:12",args:[.5,0]}),e.jsx("meshStandardMaterial",{"code-path":"src\\components\\three\\Background.tsx:510:11",color:3038207,metalness:.4,roughness:.2,emissive:1321070,emissiveIntensity:.5,transparent:!0,opacity:.3,side:E})]},i))})}function Y(){const n=c.useRef(null),t=c.useRef(null),o=c.useRef({x:0,y:0});return c.useEffect(()=>{const i=r=>{o.current.x=r.clientX/window.innerWidth*2-1,o.current.y=-(r.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",i),()=>window.removeEventListener("mousemove",i)},[]),w(i=>{if(!n.current||!t.current)return;const r=i.clock.getElapsedTime(),a=o.current.x*8,l=o.current.y*5,x=2+Math.sin(r)*2;n.current.position.x+=(a-n.current.position.x)*.05,n.current.position.y+=(l-n.current.position.y)*.05,n.current.position.z+=(x-n.current.position.z)*.05,t.current.position.copy(n.current.position),t.current.rotation.z=r*.5}),e.jsxs(e.Fragment,{children:[e.jsx("pointLight",{"code-path":"src\\components\\three\\Background.tsx:559:7",ref:n,intensity:2,distance:20,color:62206}),e.jsxs("mesh",{"code-path":"src\\components\\three\\Background.tsx:560:7",ref:t,children:[e.jsx("sphereGeometry",{"code-path":"src\\components\\three\\Background.tsx:561:9",args:[.2,16,16]}),e.jsx("meshBasicMaterial",{"code-path":"src\\components\\three\\Background.tsx:562:9",color:16777215,transparent:!0,opacity:.8})]})]})}function U(){const{camera:n}=T(),t=c.useRef({x:0,y:0,targetZ:12}),o=c.useRef(n);return c.useEffect(()=>{o.current=n},[n]),c.useEffect(()=>{const i=a=>{t.current.x=(a.clientX/window.innerWidth-.5)*2,t.current.y=(a.clientY/window.innerHeight-.5)*2},r=a=>{t.current.targetZ+=a.deltaY*.01,t.current.targetZ=Math.max(8,Math.min(20,t.current.targetZ))};return window.addEventListener("mousemove",i),window.addEventListener("wheel",r),()=>{window.removeEventListener("mousemove",i),window.removeEventListener("wheel",r)}},[]),w(()=>{const i=o.current;i.position.x+=(t.current.x*2-i.position.x)*.03,i.position.y+=(-t.current.y*1.5-i.position.y)*.03,i.position.z+=(t.current.targetZ-i.position.z)*.05,i.lookAt(0,0,0)}),null}function _(){return e.jsxs(e.Fragment,{children:[e.jsx(U,{"code-path":"src\\components\\three\\Background.tsx:610:7"}),e.jsx("color",{"code-path":"src\\components\\three\\Background.tsx:611:7",attach:"background",args:["#050510"]}),e.jsx("fog",{"code-path":"src\\components\\three\\Background.tsx:612:7",attach:"fog",args:["#050510",10,50]}),e.jsx("ambientLight",{"code-path":"src\\components\\three\\Background.tsx:614:7",intensity:.1}),e.jsx("directionalLight",{"code-path":"src\\components\\three\\Background.tsx:615:7",position:[10,10,5],intensity:.5,color:3038207}),e.jsx(Y,{"code-path":"src\\components\\three\\Background.tsx:617:7"}),e.jsx(S,{"code-path":"src\\components\\three\\Background.tsx:618:7"}),e.jsx(L,{"code-path":"src\\components\\three\\Background.tsx:619:7"}),e.jsx(G,{"code-path":"src\\components\\three\\Background.tsx:620:7"}),e.jsx(H,{"code-path":"src\\components\\three\\Background.tsx:621:7"})]})}function N(){return e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:629:5",className:"flex items-center justify-center h-screen text-blue-400",children:e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:630:7",className:"animate-pulse",children:"Loading Experience..."})})}function D(){return e.jsxs("div",{"code-path":"src\\components\\three\\Background.tsx:638:5",className:"fixed inset-0 z-0 bg-[#050510]",children:[e.jsx(c.Suspense,{"code-path":"src\\components\\three\\Background.tsx:639:7",fallback:e.jsx(N,{"code-path":"src\\components\\three\\Background.tsx:639:27"}),children:e.jsx(R,{"code-path":"src\\components\\three\\Background.tsx:640:9",camera:{position:[0,0,12],fov:60},dpr:[1,y?1.25:1.5],gl:{antialias:!1,alpha:!0,powerPreference:"high-performance",stencil:!1,depth:!0},children:e.jsx(_,{"code-path":"src\\components\\three\\Background.tsx:651:11"})})}),e.jsxs("div",{"code-path":"src\\components\\three\\Background.tsx:656:7",className:"absolute inset-0 pointer-events-none",children:[e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:657:9",className:"absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,16,0.4)_100%)]"}),e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:658:9",className:"absolute inset-0 opacity-[0.015]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg '%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}})]})]})}export{D as default};
