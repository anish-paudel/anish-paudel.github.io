import{j as e,r as c}from"./react-vendor-D1MasUqb.js";import{C as R,u as T,a as w,V as j,D as E,A as B,b as C,B as z,c as P}from"./three-MlUiDB9b.js";import{u as F}from"./overlayState-BZ9t3wg0.js";function b(o){return function(){return o=(o*9301+49297)%233280,o/233280}}const y=typeof window<"u"&&(window.matchMedia("(pointer: coarse)").matches||window.innerWidth<768),A=`
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
`,L=`
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
`;function S(){const o=c.useRef(null),t=c.useRef({x:0,y:0}),n=y?100:200,[i,r,a]=c.useMemo(()=>{const s=b(12345),d=new Float32Array(n*3),m=new Float32Array(n),p=new Float32Array(n*3);for(let g=0;g<n;g++){const f=g*3,u=s()*Math.PI*2,h=Math.acos(2*s()-1),v=5+s()*15;d[f]=v*Math.sin(h)*Math.cos(u),d[f+1]=v*Math.sin(h)*Math.sin(u),d[f+2]=v*Math.cos(h)*.5,m[g]=.5+s()*1.5,p[f]=s(),p[f+1]=s(),p[f+2]=s()}return[d,m,p]},[]),l=c.useRef(null);c.useEffect(()=>{l.current={uTime:{value:0},uMouse:{value:new j(0,0)}};const s=o.current?.material;s&&(s.uniforms=l.current)},[]),c.useEffect(()=>{const s=d=>{t.current.x=d.clientX/window.innerWidth*2-1,t.current.y=-(d.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",s),()=>window.removeEventListener("mousemove",s)},[]),w(s=>{!o.current||!l.current||(l.current.uTime.value=s.clock.getElapsedTime(),l.current.uMouse.value.x+=(t.current.x-l.current.uMouse.value.x)*.05,l.current.uMouse.value.y+=(t.current.y-l.current.uMouse.value.y)*.05,o.current.rotation.y=s.clock.getElapsedTime()*.02,o.current.rotation.z=Math.sin(s.clock.getElapsedTime()*.1)*.05)});const x=c.useMemo(()=>({uTime:{value:0},uMouse:{value:new j(0,0)}}),[]);return e.jsxs("points",{"code-path":"src\\components\\three\\Background.tsx:164:5",ref:o,children:[e.jsxs("bufferGeometry",{"code-path":"src\\components\\three\\Background.tsx:165:7",children:[e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:166:9",attach:"attributes-position",args:[i,3]}),e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:170:9",attach:"attributes-aScale",args:[r,1]}),e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:174:9",attach:"attributes-aRandom",args:[a,3]})]}),e.jsx("shaderMaterial",{"code-path":"src\\components\\three\\Background.tsx:179:7",vertexShader:A,fragmentShader:L,uniforms:x,transparent:!0,depthWrite:!1,blending:B})]})}function G(){const o=c.useRef(null),t=c.useRef({x:0,y:0,vx:0,vy:0}),n=`
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
  `,r=c.useRef(null);c.useEffect(()=>{r.current={uTime:{value:0},uMouse:{value:new j(0,0)},uHover:{value:0}};const l=o.current?.material;l&&(l.uniforms=r.current)},[]),c.useEffect(()=>{let l=0,x=0;const s=d=>{const m=d.clientX/window.innerWidth*2-1,p=-(d.clientY/window.innerHeight)*2+1;t.current.vx=m-l,t.current.vy=p-x,t.current.x=m,t.current.y=p,l=m,x=p};return window.addEventListener("mousemove",s),()=>window.removeEventListener("mousemove",s)},[]),w(l=>{if(!o.current||!r.current)return;r.current.uTime.value=l.clock.getElapsedTime(),r.current.uMouse.value.x+=(t.current.x-r.current.uMouse.value.x)*.05,r.current.uMouse.value.y+=(t.current.y-r.current.uMouse.value.y)*.05;const x=Math.sqrt(t.current.vx**2+t.current.vy**2);r.current.uHover.value+=(x*5-r.current.uHover.value)*.1});const a=c.useMemo(()=>({uTime:{value:0},uMouse:{value:new j(0,0)},uHover:{value:0}}),[]);return e.jsxs("mesh",{"code-path":"src\\components\\three\\Background.tsx:339:5",ref:o,rotation:[-Math.PI/3,0,0],position:[0,-4,-8],scale:[2,2,1],children:[e.jsx("planeGeometry",{"code-path":"src\\components\\three\\Background.tsx:345:7",args:[30,30,y?48:96,y?48:96]}),e.jsx("shaderMaterial",{"code-path":"src\\components\\three\\Background.tsx:346:7",vertexShader:n,fragmentShader:i,uniforms:a,transparent:!0,side:E,wireframe:!1})]})}function H(){const o=c.useRef(null),t=c.useRef(null),n=c.useRef({x:0,y:0}),i=c.useRef(null),r=y?18:30,a=c.useMemo(()=>{const s=b(54321),d=[];for(let m=0;m<r;m++)d.push(new C((s()-.5)*25,(s()-.5)*15,(s()-.5)*10));return d},[]),[l,x]=c.useMemo(()=>{const s=new z,d=new Float32Array(r*r*6);s.setAttribute("position",new P(d,3));const m=new Float32Array(r*3);return[s,m]},[]);return c.useEffect(()=>{i.current=l},[l]),c.useEffect(()=>{const s=d=>{n.current.x=d.clientX/window.innerWidth*2-1,n.current.y=-(d.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",s),()=>window.removeEventListener("mousemove",s)},[]),w(s=>{if(!o.current||!t.current||!i.current)return;const d=s.clock.getElapsedTime(),m=i.current.attributes.position.array;let p=0;const g=7;a.forEach((u,h)=>{const v=u.y;u.y=v+Math.sin(d*.5+h)*.5,u.x+=Math.cos(d*.3+h*.5)*.01;const M=n.current.x*10-u.x,k=n.current.y*5-u.y;Math.sqrt(M*M+k*k)<8&&(u.x+=M*.002,u.y+=k*.002)});const f=t.current.geometry.attributes.position.array;a.forEach((u,h)=>{f[h*3]=u.x,f[h*3+1]=u.y,f[h*3+2]=u.z}),t.current.geometry.attributes.position.needsUpdate=!0;for(let u=0;u<r;u++)for(let h=u+1;h<r;h++){const v=a[u].distanceTo(a[h]);if(v<g&&p<m.length-6){const M=Math.sin(d*2-v*.5)*.5+.5;(1-v/g)*M>.1&&(m[p++]=a[u].x,m[p++]=a[u].y,m[p++]=a[u].z,m[p++]=a[h].x,m[p++]=a[h].y,m[p++]=a[h].z)}}for(let u=p;u<m.length;u++)m[u]=0;i.current.attributes.position.needsUpdate=!0}),e.jsxs(e.Fragment,{children:[e.jsx("lineSegments",{"code-path":"src\\components\\three\\Background.tsx:463:7",ref:o,geometry:l,children:e.jsx("lineBasicMaterial",{"code-path":"src\\components\\three\\Background.tsx:464:9",color:3038207,transparent:!0,opacity:.15,blending:B})}),e.jsxs("points",{"code-path":"src\\components\\three\\Background.tsx:466:7",ref:t,children:[e.jsx("bufferGeometry",{"code-path":"src\\components\\three\\Background.tsx:467:9",children:e.jsx("bufferAttribute",{"code-path":"src\\components\\three\\Background.tsx:468:11",attach:"attributes-position",args:[x,3]})}),e.jsx("pointsMaterial",{"code-path":"src\\components\\three\\Background.tsx:473:9",size:.15,color:62206,transparent:!0,opacity:.8,blending:B})]})]})}function Y(){const o=c.useRef(null),t=c.useMemo(()=>{const n=b(99999);return Array.from({length:y?7:15},()=>({position:[(n()-.5)*20,(n()-.5)*15,(n()-.5)*10],rotation:[n()*Math.PI,n()*Math.PI,0],scale:.5+n()*1,speed:.2+n()*.3,type:Math.floor(n()*3)}))},[]);return w(n=>{if(!o.current)return;const i=n.clock.getElapsedTime();o.current.children.forEach((r,a)=>{r.rotation.x+=.005*t[a].speed,r.rotation.y+=.01*t[a].speed,r.position.y+=Math.sin(i*t[a].speed+a)*.002})}),e.jsx("group",{"code-path":"src\\components\\three\\Background.tsx:504:5",ref:o,children:t.map((n,i)=>e.jsxs("mesh",{"code-path":"src\\components\\three\\Background.tsx:506:9",position:n.position,rotation:n.rotation,scale:n.scale,children:[n.type===0?e.jsx("icosahedronGeometry",{"code-path":"src\\components\\three\\Background.tsx:507:31",args:[.5,0]}):n.type===1?e.jsx("torusGeometry",{"code-path":"src\\components\\three\\Background.tsx:508:31",args:[.4,.15,8,20]}):e.jsx("octahedronGeometry",{"code-path":"src\\components\\three\\Background.tsx:509:12",args:[.5,0]}),e.jsx("meshStandardMaterial",{"code-path":"src\\components\\three\\Background.tsx:511:11",color:3038207,metalness:.4,roughness:.2,emissive:1321070,emissiveIntensity:.5,transparent:!0,opacity:.3,side:E})]},i))})}function U(){const o=c.useRef(null),t=c.useRef(null),n=c.useRef({x:0,y:0});return c.useEffect(()=>{const i=r=>{n.current.x=r.clientX/window.innerWidth*2-1,n.current.y=-(r.clientY/window.innerHeight)*2+1};return window.addEventListener("mousemove",i),()=>window.removeEventListener("mousemove",i)},[]),w(i=>{if(!o.current||!t.current)return;const r=i.clock.getElapsedTime(),a=n.current.x*8,l=n.current.y*5,x=2+Math.sin(r)*2;o.current.position.x+=(a-o.current.position.x)*.05,o.current.position.y+=(l-o.current.position.y)*.05,o.current.position.z+=(x-o.current.position.z)*.05,t.current.position.copy(o.current.position),t.current.rotation.z=r*.5}),e.jsxs(e.Fragment,{children:[e.jsx("pointLight",{"code-path":"src\\components\\three\\Background.tsx:560:7",ref:o,intensity:2,distance:20,color:62206}),e.jsxs("mesh",{"code-path":"src\\components\\three\\Background.tsx:561:7",ref:t,children:[e.jsx("sphereGeometry",{"code-path":"src\\components\\three\\Background.tsx:562:9",args:[.2,16,16]}),e.jsx("meshBasicMaterial",{"code-path":"src\\components\\three\\Background.tsx:563:9",color:16777215,transparent:!0,opacity:.8})]})]})}function _(){const{camera:o}=T(),t=c.useRef({x:0,y:0,targetZ:12}),n=c.useRef(o);return c.useEffect(()=>{n.current=o},[o]),c.useEffect(()=>{const i=a=>{t.current.x=(a.clientX/window.innerWidth-.5)*2,t.current.y=(a.clientY/window.innerHeight-.5)*2},r=a=>{t.current.targetZ+=a.deltaY*.01,t.current.targetZ=Math.max(8,Math.min(20,t.current.targetZ))};return window.addEventListener("mousemove",i),window.addEventListener("wheel",r),()=>{window.removeEventListener("mousemove",i),window.removeEventListener("wheel",r)}},[]),w(()=>{const i=n.current;i.position.x+=(t.current.x*2-i.position.x)*.03,i.position.y+=(-t.current.y*1.5-i.position.y)*.03,i.position.z+=(t.current.targetZ-i.position.z)*.05,i.lookAt(0,0,0)}),null}function N(){return e.jsxs(e.Fragment,{children:[e.jsx(_,{"code-path":"src\\components\\three\\Background.tsx:611:7"}),e.jsx("color",{"code-path":"src\\components\\three\\Background.tsx:612:7",attach:"background",args:["#050510"]}),e.jsx("fog",{"code-path":"src\\components\\three\\Background.tsx:613:7",attach:"fog",args:["#050510",10,50]}),e.jsx("ambientLight",{"code-path":"src\\components\\three\\Background.tsx:615:7",intensity:.1}),e.jsx("directionalLight",{"code-path":"src\\components\\three\\Background.tsx:616:7",position:[10,10,5],intensity:.5,color:3038207}),e.jsx(U,{"code-path":"src\\components\\three\\Background.tsx:618:7"}),e.jsx(G,{"code-path":"src\\components\\three\\Background.tsx:619:7"}),e.jsx(S,{"code-path":"src\\components\\three\\Background.tsx:620:7"}),e.jsx(H,{"code-path":"src\\components\\three\\Background.tsx:621:7"}),e.jsx(Y,{"code-path":"src\\components\\three\\Background.tsx:622:7"})]})}function W(){return e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:630:5",className:"flex items-center justify-center h-screen text-blue-400",children:e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:631:7",className:"animate-pulse",children:"Loading Experience..."})})}function V(){const o=F();return e.jsxs("div",{"code-path":"src\\components\\three\\Background.tsx:640:5",className:"fixed inset-0 z-0 bg-[#050510]",children:[e.jsx(c.Suspense,{"code-path":"src\\components\\three\\Background.tsx:641:7",fallback:e.jsx(W,{"code-path":"src\\components\\three\\Background.tsx:641:27"}),children:e.jsx(R,{"code-path":"src\\components\\three\\Background.tsx:642:9",camera:{position:[0,0,12],fov:60},dpr:[1,y?1.25:1.5],frameloop:o?"never":"always",gl:{antialias:!1,alpha:!0,powerPreference:"high-performance",stencil:!1,depth:!0},children:e.jsx(N,{"code-path":"src\\components\\three\\Background.tsx:654:11"})})}),e.jsxs("div",{"code-path":"src\\components\\three\\Background.tsx:659:7",className:"absolute inset-0 pointer-events-none",children:[e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:660:9",className:"absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,16,0.4)_100%)]"}),e.jsx("div",{"code-path":"src\\components\\three\\Background.tsx:661:9",className:"absolute inset-0 opacity-[0.015]",style:{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg '%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}})]})]})}export{V as default};
