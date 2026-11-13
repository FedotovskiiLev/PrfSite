import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
// Start at a genuine table-free world corridor; all movement/collisions remain real.
const source=fs.readFileSync(new URL('./food-game-model.mjs',import.meta.url),'utf8').replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,import.meta.url).href}'`).replace('const player={x:0,y:0,radius:playerRadius}', 'const player={x:-25,y:-25,radius:playerRadius}');
const {createFoodGame}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
for(const [name,x,y] of [['east',1,0],['west',-1,0],['north',0,-1],['south',0,1]])test(`long run ${name}: populated camera, offscreen births, bounded pool`,()=>{
 const g=createFoodGame({width:360,height:225,seed:23,sanitizerUnlockEaten:100000});let previous=g.snapshot(),empty=0,maxEmpty=0,sum=0,samples=0,births=0,maxDistance=0;
 for(let i=0;i<90*120;i++){
  g.advance(1/120,{x,y});const s=g.snapshot();assert.equal(s.roaches.length,40);const oldIds=new Set(previous.roaches.map(r=>r.id));
  for(const r of s.roaches){if(!oldIds.has(r.id)){assert.equal(r.visible,false,'new actor must be outside view');births++}maxDistance=Math.max(maxDistance,Math.hypot(r.x-s.player.x,r.y-s.player.y));}
  if(i>5*120){empty=s.visibleCount===0?empty+1:0;maxEmpty=Math.max(maxEmpty,empty);sum+=s.visibleCount;samples++;}
  previous=s;
 }
 assert.ok(Math.hypot(previous.player.x+25,previous.player.y+25)>12000,'test must actually traverse world');
 assert.ok(births>100);assert.ok(maxEmpty<3*120,`empty stretch ${maxEmpty/120}s`);assert.ok(sum/samples>=4,`average visible ${sum/samples}`);assert.ok(maxDistance<650,`distant tail ${maxDistance}`);
 console.log(name,JSON.stringify({births,averageVisible:+(sum/samples).toFixed(2),maxEmptySeconds:maxEmpty/120,maxDistance:Math.round(maxDistance)}));
});
