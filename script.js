import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = (s, root=document) => root.querySelector(s);
const loader = $('.loader');
window.addEventListener('load', () => setTimeout(()=>loader.classList.add('done'), 500));
$('#year').textContent = new Date().getFullYear();

// Mobile navigation
const menuButton = $('.menu-toggle'), nav = $('.main-nav');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click',()=> {
  nav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false');
}));

// Scroll reveal with a lightweight native observer.
// GSAP adds a refined entrance sequence when the library is available.
if (window.gsap) {
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.gsap.from('.site-header', {y:-24, opacity:0, duration:1, ease:'power3.out', delay:.15});
  window.gsap.from('.hero-content > *', {y:28, opacity:0, duration:.9, stagger:.13, ease:'power3.out', delay:.35});
  window.gsap.from('.visual-frame', {scale:.94, opacity:0, duration:1.3, ease:'power3.out', delay:.45});
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

// Count-up figures when the statistics section enters the viewport.
const stats = document.querySelector('.stats-row');
if (stats) {
  const countObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    stats.querySelectorAll('[data-count]').forEach(el => {
      const target = Number(el.dataset.count);
      if (window.gsap) {
        const counter = {value:0};
        window.gsap.to(counter, {value:target, duration:1.8, ease:'power2.out',
          onUpdate:()=>el.textContent=Math.round(counter.value)+(target===96?'%':'+')});
      } else el.textContent = target + (target===96?'%':'+');
    });
    countObserver.disconnect();
  }, {threshold:.35});
  countObserver.observe(stats);
}

// Subtle pointer-driven depth on service cards (desktop only).
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.querySelectorAll('.expertise-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width, y = (e.clientY-r.top)/r.height;
      card.style.setProperty('--mx', (x*100)+'%');
      card.style.setProperty('--my', (y*100)+'%');
      card.style.transform = `perspective(900px) rotateX(${(0.5-y)*4}deg) rotateY(${(x-.5)*4}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });
}

// Scroll-linked cinematic depth for the 3D hero composition.
if (window.gsap && window.ScrollTrigger) {
  window.gsap.to('.hero-visual', {
    yPercent: 9, ease: 'none',
    scrollTrigger: {trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true}
  });
}

// Pointer glow and gentle parallax.
const glow = $('.cursor-glow');
window.addEventListener('pointermove', e => {
  glow.style.left = e.clientX+'px'; glow.style.top = e.clientY+'px';
},{passive:true});

// Three.js scene: procedural golden balance sculpture, no external model required.
const mount = $('#justice-scene');
let renderer, scene, camera, balance, pointerX=0, pointerY=0, frame;
try {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, mount.clientWidth/mount.clientHeight, .1, 100);
  camera.position.set(0, .2, 8.7);
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(mount.clientWidth,mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  mount.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xd8c49d,1.45));
  const key = new THREE.DirectionalLight(0xffd99a,3.1); key.position.set(3,5,5); scene.add(key);
  const rim = new THREE.PointLight(0x9b7136,22,18); rim.position.set(-4,1,1); scene.add(rim);
  const gold = new THREE.MeshStandardMaterial({color:0xc39b56,metalness:.88,roughness:.22});
  const bright = new THREE.MeshStandardMaterial({color:0xe5c887,metalness:.9,roughness:.17});
  const darkGold = new THREE.MeshStandardMaterial({color:0x72552b,metalness:.8,roughness:.28});
  balance = new THREE.Group(); scene.add(balance);
  const addMesh=(geo,mat,pos,group=balance)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);group.add(m);return m;};
  // Pedestal and central column
  addMesh(new THREE.CylinderGeometry(.78,.94,.18,64),darkGold,[0,-2.05,0]);
  addMesh(new THREE.CylinderGeometry(.58,.75,.17,64),gold,[0,-1.88,0]);
  addMesh(new THREE.CylinderGeometry(.18,.28,.26,32),bright,[0,-1.68,0]);
  addMesh(new THREE.CylinderGeometry(.075,.12,2.85,32),gold,[0,-.18,0]);
  addMesh(new THREE.SphereGeometry(.19,32,24),bright,[0,1.34,0]);
  // Crossbar and finials
  addMesh(new THREE.CylinderGeometry(.07,.07,3.8,32),bright,[0,1.18,0]).rotation.z=Math.PI/2;
  addMesh(new THREE.SphereGeometry(.12,24,16),gold,[-1.92,1.18,0]);
  addMesh(new THREE.SphereGeometry(.12,24,16),gold,[1.92,1.18,0]);
  // Crown ornament
  addMesh(new THREE.ConeGeometry(.18,.5,4),bright,[0,1.72,0]);
  // Chains, pans and hanging bowls
  const makeChain=(x)=>{
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(x,1.15,0),new THREE.Vector3(x*.98,.62,0),new THREE.Vector3(x*.9,.15,0),new THREE.Vector3(x*.82,-.12,0)
    ]);
    const chain=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.018,8,false),bright);balance.add(chain);
    const panGroup=new THREE.Group();panGroup.position.set(x*.82,-.18,0);balance.add(panGroup);
    const bowl=addMesh(new THREE.SphereGeometry(.73,48,24,0,Math.PI*2,0,Math.PI/2),gold,[0,0,0],panGroup);
    bowl.scale.y=.22;bowl.position.y=-.05;
    addMesh(new THREE.TorusGeometry(.72,.035,12,64),bright,[0,-.04,0],panGroup).rotation.x=Math.PI;
    addMesh(new THREE.CylinderGeometry(.04,.04,.2,16),bright,[0,-.2,0],panGroup);
  };
  makeChain(-1.92);makeChain(1.92);
  // Small engraved-looking orbit rings
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.55,.008,8,120),darkGold);ring.rotation.x=1.1;balance.add(ring);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.8,.006,8,120),darkGold);ring2.rotation.y=.7;balance.add(ring2);
  // Floating gold dust particles
  const count=240, positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){const r=2.1+Math.random()*2.5,a=Math.random()*Math.PI*2;positions[i*3]=Math.cos(a)*r;positions[i*3+1]=(Math.random()-.5)*5;positions[i*3+2]=(Math.random()-.5)*2.4;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc9a665,size:.018,transparent:true,opacity:.75}));scene.add(particles);
  window.addEventListener('pointermove',e=>{pointerX=(e.clientX/innerWidth-.5)*.5;pointerY=(e.clientY/innerHeight-.5)*.25;},{passive:true});
  const clock=new THREE.Clock();
  const animate=()=>{
    frame=requestAnimationFrame(animate);
    const t=clock.getElapsedTime();
    balance.rotation.y += (pointerX*.45 + Math.sin(t*.35)*.05 - balance.rotation.y)*.025;
    balance.rotation.x += (-pointerY*.35 - balance.rotation.x)*.025;
    balance.position.y=Math.sin(t*.8)*.045;
    particles.rotation.y=t*.025;
    renderer.render(scene,camera);
  };
  animate();
  const resize=()=>{
    const w=mount.clientWidth,h=mount.clientHeight;
    if(!w||!h)return;
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
  };
  new ResizeObserver(resize).observe(mount);
} catch(err) {
  console.warn('3D scene could not be initialized:',err);
  mount.innerHTML='<div style="height:100%;display:grid;place-items:center;color:#c7a66a;font-size:150px;text-shadow:0 0 50px #c7a66a55">⚖</div>';
}
window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame);if(renderer)renderer.dispose();});

// Language switch: compact bilingual content toggle for the demo.
const translations = {
  en: {
    nav:['Home','About','Expertise','Our Approach','Contact'],
    kicker:['Your trusted legal partner','01 / ABOUT US','02 / AREAS OF EXPERTISE','03 / OUR APPROACH','04 / CONTACT'],
    hero:['Your rights, protected.<br><em>Your future,</em> <span>secured.</span>','Legal strength shaped by experience, precision and strategic vision. We put your interests first and give every matter the attention it deserves.'],
    about:['Law is more than words.<br><em>It is understanding what lies beyond them.</em>','At Al Mizan, effective legal representation begins with understanding each client’s needs and ends with considered solutions that protect their interests.'],
    services:['Legal solutions<br><em>for every challenge.</em>','From everyday advice to complex matters, we provide legal support built on careful analysis and clear planning.'],
    approach:['Clear vision.<br><em>Precise execution.</em>','Every matter is unique. We build our next steps around the facts, your goals and the available options.'],
    contact:['Your first step<br><em>starts with a conversation.</em>','Tell us what is on your mind and our team will get in touch to discuss how we can help.']
  }
};
let english=false;
$('.lang-switch').addEventListener('click',()=>{
  english=!english;
  const b=$('.lang-switch');
  b.textContent=english?'عربي':'EN';
  document.documentElement.lang=english?'en':'ar';
  document.documentElement.dir=english?'ltr':'rtl';
  if(english){
    nav.querySelectorAll('a').forEach((a,i)=>a.textContent=translations.en.nav[i]);
    $('.eyebrow').lastChild.textContent=' '+translations.en.kicker[0];
    $('h1').innerHTML=translations.en.hero[0];
    $('.hero-lead').textContent=translations.en.hero[1];
    $('#about .section-kicker').textContent=translations.en.kicker[1];
    $('#about h2').innerHTML=translations.en.about[0];
    $('.intro-copy p').textContent=translations.en.about[1];
    $('#expertise .section-kicker').textContent=translations.en.kicker[2];
    $('#expertise h2').innerHTML=translations.en.services[0];
    $('.section-heading>p').textContent=translations.en.services[1];
    $('#approach .section-kicker').textContent=translations.en.kicker[3];
    $('#approach h2').innerHTML=translations.en.approach[0];
    $('.approach-left>p').textContent=translations.en.approach[1];
    $('#contact .section-kicker').textContent=translations.en.kicker[4];
    $('#contact h2').innerHTML=translations.en.contact[0];
    $('#contact .contact-content>p').textContent=translations.en.contact[1];
    document.querySelectorAll('.expertise-card h3').forEach((el,i)=>el.textContent=['Litigation & Dispute Resolution','Corporate & Business Law','Contracts & Agreements','Real Estate Law'][i]);
  }else{location.reload();}
});
