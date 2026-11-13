/* Deterministic canteen: CC0 floor/table, original SVG meal details.
 * Visible table bounds are shared with table-geometry.mjs. */
(function(root){'use strict';
const ns='http://www.w3.org/2000/svg', layer=document.getElementById('environment'),pattern=document.getElementById('tile-pattern');let cache='';
function add(parent,tag,attrs){const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));parent.appendChild(n);return n}
// The CC0 texture is a 2×2 tile repeat. Tint only alternating tile faces;
// retain the other two white tiles and the original light grout/texture.
// A light blue wash keeps the checker readable without competing with actors.
// These two static shapes are created once, never in the camera update loop.
for(const offset of [1.5,25.5])add(pattern,'rect',{x:offset,y:offset,width:21,height:21,fill:'#3f92ce',opacity:.13,'pointer-events':'none','data-floor-tint':'blue'});
function hash(x,y){let n=Math.imul(x,0x1f123bb5)^Math.imul(y,0x5f356495);n^=n>>>16;n=Math.imul(n,0x45d9f3b);return(n^(n>>>16))>>>0}
function meal(parent,x,y,variant){const g=add(parent,'g',{transform:`translate(${x} ${y}) rotate(${variant?12:-9})`});
 add(g,'ellipse',{cx:.6,cy:1.4,rx:12.2,ry:11.8,fill:'#302820',opacity:.18});
 add(g,'circle',{r:11.8,fill:'#d9d6ca',stroke:'#aaa99f','stroke-width':.5});
 add(g,'circle',{cy:-.5,r:11.2,fill:'#fffdf0'});add(g,'circle',{r:8.9,fill:'#e9e7dc',stroke:'#c9c7bb','stroke-width':.6});
 add(g,'path',{d:'M-9-4a10 10 0 0 1 13-5',fill:'none',stroke:'#fff','stroke-width':1.2,'stroke-linecap':'round'});
 if(!variant){
  add(g,'path',{d:'M-7-3Q-9 1-5 5Q0 8 3 3Q4-2 0-4Q-5-6-7-3',fill:'#79472d',stroke:'#59351f','stroke-width':.65});
  add(g,'path',{d:'M-5-3l5 5m-6-2 4 4m1-8 3 3',stroke:'#a76e47','stroke-width':.65});
  for(const [x,y]of [[3,-5],[6,-3],[5,0],[7,2]])add(g,'ellipse',{cx:x,cy:y,rx:2,ry:1.5,fill:'#efd19a',stroke:'#cba96e','stroke-width':.35});
 }else{
  add(g,'path',{d:'M-6-4Q-9 0-5 4L1 6Q6 5 6 1L4-5Z',fill:'#d6a25b'});
  for(let i=0;i<5;i++)add(g,'path',{d:`M${-5+i*2}-4q-3 3 0 7`,fill:'none',stroke:i%2?'#efd08a':'#f6dd9f','stroke-width':1.3});
  add(g,'path',{d:'M-3-2Q2-5 5-1L3 3-1 2Z',fill:'#ac5035'});
 }
 for(const [x,y,r]of [[-4,-6,2.4],[-1,-6,2],[1,-7,1.7]])add(g,'circle',{cx:x,cy:y,r,fill:'#729351',stroke:'#51703c','stroke-width':.4});
 add(g,'circle',{cx:-4,cy:-6,r:1,fill:'#a4bb73'});
 // Cutlery remains decorative and entirely on the tabletop.
 add(g,'path',{d:'M-15-8v6q0 2 1.5 2v8m-3-16v5m3-5v5M15-8q-3 6-1 8h1v8',fill:'none',stroke:'#deded3','stroke-width':1.15,'stroke-linecap':'round'});
}
function update(camera,v){const originX=v.width/2-camera.x,originY=v.height/2-camera.y;pattern.setAttribute('patternTransform',`translate(${originX} ${originY})`);layer.setAttribute('transform',`translate(${originX} ${originY})`);const size=300,x0=Math.floor((camera.x-v.width/2-80)/size),x1=Math.floor((camera.x+v.width/2+80)/size),y0=Math.floor((camera.y-v.height/2-80)/size),y1=Math.floor((camera.y+v.height/2+80)/size),key=[x0,x1,y0,y1].join(',');if(key===cache)return;cache=key;while(layer.firstChild)layer.removeChild(layer.firstChild);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const h=hash(x,y);if(h%3===0)continue;const px=x*size+60+h%130,py=y*size+60+((h>>>8)%130);if(Math.hypot(px,py)<110)continue;const g=add(layer,'g',{transform:`translate(${px} ${py})`});add(g,'image',{x:-54.857142857,y:-55.265508685,width:109.714285714,height:110.53101737,preserveAspectRatio:'none',href:'assets/table-coffee-cc0.png'});meal(g,-20,-2,h%2);meal(g,20,2,(h+1)%2);}}
root.FoodEnvironment={update};
})(globalThis);
