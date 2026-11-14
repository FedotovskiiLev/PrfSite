const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('assets/home-ribbons.css','utf8');
const palette=JSON.parse(fs.readFileSync('assets/department-palette.json','utf8'));
const ribbons=[...html.matchAll(/<path pathLength="1" data-ribbon="([^"]+)"[^>]+stroke="([^"]+)"/g)];
assert.equal(ribbons.length,7);for(const [,id,color]of ribbons)assert.equal(color,palette[id].accent);
assert.equal((html.match(/V1800"/g)||[]).length,7);assert.match(css,/pointer-events:none/);
assert.doesNotMatch(css,/animation:ribbon-descend/);assert.doesNotMatch(css,/animation:ribbon-copy-in/);
assert.match(css,/content:'';display:block;height:4px/);
const source=html.match(/<script id="home-ribbon-reveal">([\s\S]*?)<\/script>/)[1];
assert.match(source,/\.home-gallery,\.dept-card/);
assert.match(html,/<p>Больше скидок Богу скидок!<\/p>/);
function exercise(viewport,reduced=false){
 let scroll=0,queue=[],now=0;const events={};
 const panels=[200,700,1400,2300].map(top=>({top,calls:[],focus:null,getBoundingClientRect(){return{top:this.top-scroll}},addEventListener(name,fn){this.focus=fn},animate(frames,options){const a={frames,options,cancelled:false,cancel(){this.cancelled=true}};this.calls.push(a);return a}}));
 const svg={style:{removeProperty(){delete this.clipPath}}};
 const context={matchMedia:()=>({matches:reduced,addEventListener(){},removeEventListener(){}}),document:{querySelector:s=>s.includes('svg')?svg:{getBoundingClientRect:()=>({top:100-scroll,height:2500})},querySelectorAll:()=>panels,documentElement:{scrollHeight:2600}},Element:{prototype:{animate(){}}},ResizeObserver:class{observe(){}disconnect(){}},window:{addEventListener:(n,f)=>events[n]=f,removeEventListener(){}},requestAnimationFrame:f=>{queue.push(f);return queue.length},cancelAnimationFrame(){queue=[]},innerHeight:viewport,scrollY:scroll};
 vm.runInNewContext(source,context);
 if(reduced){assert.ok(panels.every(p=>!p.calls.length));return;}
 function flush(){for(let i=0;queue.length&&i<300;i++){const q=queue;queue=[];now+=16;q.forEach(f=>f(now))}}
 flush();assert.ok(panels[0].calls.some(a=>a.options.duration===250));
 assert.ok(!panels[3].calls.some(a=>a.options.duration===250),'offscreen content waits for scrolling');
 scroll=1600;context.scrollY=scroll;events.scroll();flush();
 const firstCount=panels[0].calls.length;
 scroll=0;context.scrollY=0;events.scroll();flush();
 assert.equal(panels[0].calls.length,firstCount,'returning upward never hides/replays revealed panels');
 panels[3].focus();assert.ok(panels[3].calls[0].cancelled,'keyboard focus immediately reveals hidden target');
 scroll=2600-viewport;context.scrollY=scroll;events.scroll();flush();
 assert.equal(svg.style.clipPath,'inset(0 0 0% 0)','bottom of page completes all ribbon lines');
}
exercise(900);exercise(650);exercise(650,true);
console.log('PASS: 7 palette ribbons; scroll-driven desktop/mobile-height progression, one-time reveal, keyboard focus, reduced-motion and visible-by-default CSS.');
