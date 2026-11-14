const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('assets/home-ribbons.css','utf8');
const palette=JSON.parse(fs.readFileSync('assets/department-palette.json','utf8'));
const ribbons=[...html.matchAll(/<path pathLength="1" data-ribbon="([^"]+)"[^>]+stroke="([^"]+)"/g)];
assert.equal(ribbons.length,7);
assert.equal(new Set(ribbons.map(r=>r[1])).size,7);
for(const [,id,color] of ribbons)assert.equal(color,palette[id].accent);
assert.match(html,/<\/header><div class="home-scene"><div class="home-ribbons" aria-hidden="true">/);
assert.match(html,/<\/footer><\/div><\/body>/);
assert.equal((html.match(/V1800"/g)||[]).length,7);
assert.match(html,/<g fill="none" stroke-width="8">/);
assert.match(css,/ribbon-descend 3s/);
assert.match(css,/stroke-dasharray:1/);
assert.match(css,/position:absolute;inset:0;z-index:-1/);
assert.match(css,/height:100%/);
assert.match(css,/rgba\(255,255,255,\.78\)/);
assert.match(css,/ribbon-copy-in \.25s ease-out 3s both/);
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
