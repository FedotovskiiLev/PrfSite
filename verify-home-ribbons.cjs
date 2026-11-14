const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/home-ribbons.css','utf8');
const palette=JSON.parse(fs.readFileSync('assets/department-palette.json','utf8'));
const ribbons=[...html.matchAll(/<path pathLength="1" data-ribbon="([^"]+)"[^>]+stroke="([^"]+)"/g)];
assert.equal(ribbons.length,7);
assert.equal(new Set(ribbons.map(r=>r[1])).size,7);
for(const [,id,color] of ribbons)assert.equal(color,palette[id].accent);
assert.match(html,/<\/header><div class="home-scene"><div class="home-ribbons" aria-hidden="true">/);
assert.match(html,/<\/footer><\/div><script id="home-ribbon-reveal">/);
assert.equal((html.match(/V1800"/g)||[]).length,7);
assert.match(html,/<g fill="none" stroke-width="8">/);
assert.match(css,/ribbon-descend 3s/);
assert.match(css,/stroke-dasharray:1/);
assert.match(css,/position:absolute;inset:0;z-index:-1/);
assert.match(css,/height:100%/);
assert.match(css,/rgba\(255,255,255,\.78\)/);
assert.doesNotMatch(css,/animation:ribbon-copy-in/);
assert.match(html,/getScreenCTM/);
assert.match(html,/getPointAtLength/);
assert.match(html,/duration:250,delay:deadline-elapsed/);
assert.match(html,/setTimeout\(stop,3400\)/);
assert.match(css,/@media\(prefers-reduced-motion:no-preference\)/);
assert.doesNotMatch(css,/infinite/);
assert.match(css,/pointer-events:none/);
assert.match(css,/@media\(max-width:650px\)/);
assert.match(html,/<main id="main"/);
assert.match(css,/var\(--soft\) 58%,transparent/);
assert.match(css,/:focus-visible/);
assert.match(css,/content:'';display:block;height:4px/);
const headerColors=[...css.split('.home-page .header{')[0].matchAll(/#[0-9A-F]{6}/g)].map(m=>m[0]);
assert.deepEqual(headerColors,ribbons.map(r=>r[2]));
console.log('PASS: seven palette colors, full-page placement, translucent panels, one-shot motion, reduced-motion and mobile rules; navigation preserved.');
// Conservative compositing: a full saturated ribbon under the most transparent
// card, without counting blur or the white highlight as readability assistance.
const rgb=h=>h.slice(1).match(/../g).map(x=>parseInt(x,16)/255);
const lum=c=>c.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
let min=Infinity;
for(const panel of Object.values(palette))for(const band of Object.values(palette)){
 const bg=rgb(panel.soft).map((v,i)=>v*.58+rgb(band.accent)[i]*.42);
 const ratio=(lum(bg)+.05)/(lum(rgb('#34404b'))+.05);min=Math.min(min,ratio);assert.ok(ratio>=4.5,`glass contrast ${ratio}`);
}
console.log(`PASS: glass body copy conservative minimum contrast ${min.toFixed(2)}:1.`);
// Execute the inline progressive enhancement against measured-geometry doubles.
const vm=require('node:vm');
const source=html.match(/<script id="home-ribbon-reveal">([\s\S]*?)<\/script>/)[1];
function exercise(height,reduced=false){
 const panels=[.1,.35,.6,.9].map(f=>({top:100+height*f,calls:[],matches:()=>false,addEventListener(){},getBoundingClientRect(){return{top:this.top}},animate(frames,options){this.calls.push(options);return{playState:'running',cancel(){}}}}));
 const path={getScreenCTM:()=>({b:0,d:height/1800,f:100}),getTotalLength:()=>1800,getPointAtLength:l=>({x:500,y:l}),getAnimations:()=>[{currentTime:0}]};
 const context={matchMedia:()=>({matches:reduced,addEventListener(){},removeEventListener(){}}),document:{querySelector:()=>({}),querySelectorAll:selector=>selector.includes('.home-ribbons')?[path]:panels},Element:{prototype:{animate(){}}},ResizeObserver:class{observe(){}disconnect(){}},window:{addEventListener(){},removeEventListener(){}},requestAnimationFrame(){},setTimeout(){}};
 vm.runInNewContext(source,context);
 if(reduced){assert.ok(panels.every(p=>!p.calls.length));return;}
 const delays=panels.map(p=>p.calls[0].delay);
 assert.ok(delays.every((v,i)=>v>=0&&v<3000&&(!i||v>delays[i-1])));
 assert.ok(panels.every(p=>p.calls[0].duration===250));
 return delays;
}
assert.deepEqual(exercise(1600),exercise(4200));exercise(4200,true);
assert.match(source,/\.home-gallery,\.dept-card/);
console.log('PASS: geometry-based stagger at desktop/mobile page heights; reduced-motion leaves all content immediately visible.');

assert.match(html,/<p>Больше скидок Богу скидок!<\/p>/);
assert.doesNotMatch(html,/<div class="demo-bar">/);
assert.doesNotMatch(source,/addEventListener\('scroll'/);
