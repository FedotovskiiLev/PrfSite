import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createFoodGame,reactBlackRoach,safeBlackStepAngle,BLACK_CHALLENGE_INCREMENT,stopAwareRoachHit} from './food-game-model.mjs';
const player={x:0,y:0,radius:16};
const roach=(extra={})=>({kind:'black',x:40,y:0,radius:8,angle:Math.PI,phase:'idle',remaining:.6,walkDuration:.4,challenge:0,reactionElapsed:0,evading:false,...extra});
test('black births start at zero; orange actor state and behavior are untouched',()=>{
 const g=createFoodGame({rareChance:1,blackUnlockGinger:0});
 assert.ok(g.snapshot().roaches.every(r=>r.challenge===0&&r.reactionElapsed===0));
 const r=roach({kind:'ginger'}),copy={...r};assert.equal(reactBlackRoach(r,player,.1,210),false);assert.deepEqual(r,copy);
 assert.ok(createFoodGame({rareChance:0}).snapshot().roaches.every(r=>!('challenge' in r)));
});
test('zero latency starts an ordinary-length safe walk without changing position',()=>{
 const r=roach(),pos={x:r.x,y:r.y};assert.equal(reactBlackRoach(r,player,1/120,210),true);
 assert.deepEqual({x:r.x,y:r.y},pos);assert.equal(r.remaining,.4);assert.equal(r.phase,'walk');assert.equal(r.challenge,.12);
 assert.equal(stopAwareRoachHit(0,0,0,0,r.x,r.y,r.x+Math.cos(r.angle)*84,r.y+Math.sin(r.angle)*84,24,0),false);
 for(let i=0;i<100;i++)assert.equal(reactBlackRoach(r,player,.01,210),false);
 assert.equal(r.challenge,.12,'an ongoing step cannot retrigger or accrue fatigue per frame');
});
test('each completed dodge adds reaction latency; absence resets pending reaction',()=>{
 const r=roach();reactBlackRoach(r,player,.01,210);r.evading=false;
 assert.equal(reactBlackRoach(r,player,.119,210),false);assert.equal(reactBlackRoach(r,player,.001,210),true);
 assert.equal(r.challenge,2*BLACK_CHALLENGE_INCREMENT);r.evading=false;
 assert.equal(reactBlackRoach(r,player,.12,210),false);r.x=67;
 assert.equal(reactBlackRoach(r,player,.3,210),false);assert.equal(r.reactionElapsed,0);r.x=40;
 assert.equal(reactBlackRoach(r,player,.239,210),false);assert.equal(reactBlackRoach(r,player,.001,210),true);
 assert.equal(r.challenge,3*BLACK_CHALLENGE_INCREMENT);
});
test('contact boundary cannot evade; threat boundary includes exactly 66 pixels',()=>{
 assert.equal(reactBlackRoach(roach({x:24}),player,.1,210),false);
 assert.equal(reactBlackRoach(roach({x:66}),player,.1,210),true);
 assert.equal(reactBlackRoach(roach({x:66.00001}),player,.1,210),false);
});
test('ordinary step protects the whole segment, not only endpoint, in every direction',()=>{
 for(let i=0;i<128;i++){
  const theta=i*Math.PI*2/128,r=roach({x:40*Math.cos(theta),y:40*Math.sin(theta),angle:theta+Math.PI});
  const a=safeBlackStepAngle(r,player,160);
  assert.equal(stopAwareRoachHit(0,0,0,0,r.x,r.y,r.x+Math.cos(a)*160,r.y+Math.sin(a)*160,24,0),false);
 }
});
// A seeded fixture only changes initial placement, preserving production tick/capture logic.
const source=fs.readFileSync(new URL('./food-game-model.mjs',import.meta.url),'utf8')
 .replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,import.meta.url).href}'`)
 .replace('for(let i=0;i<population;i++)roaches.push(spawn());',"for(let i=0;i<population;i++)roaches.push(spawn()); Object.assign(roaches[0],{x:0,y:0,kind:'black',challenge:0});");
const fixture=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('overlapping black roach remains edible: no rescue, teleport or invulnerability',()=>{
 const g=fixture.createFoodGame({population:1,sanitizerUnlockEaten:999});const result=g.advance(1/120);
 assert.equal(result.eaten,1);assert.equal(result.consumed[0].kind,'black');assert.equal(g.snapshot().score,50);
});
test('player interception is still swept capture even when endpoints miss',()=>{
 assert.equal(stopAwareRoachHit(40,-60,40,60,40,0,44,0,24,1),true);
});
test('seeded all-black simulations are deterministic with bounded population',()=>{
 const options={seed:17,rareChance:1,blackUnlockGinger:0,sanitizerUnlockEaten:99999},a=createFoodGame(options),b=createFoodGame(options);
 for(let i=0;i<1200;i++){const input={x:Math.sin(i*.01),y:Math.cos(i*.01)};a.advance(1/120,input);b.advance(1/120,input);}
 assert.deepEqual(a.snapshot(),b.snapshot());assert.equal(a.snapshot().roaches.length,40);
});
test('close-threat steering work stays bounded for large crowds',()=>{
 const actors=Array.from({length:1000},(_,i)=>roach({x:25+i%42}));const start=performance.now();
 for(let tick=0;tick<120;tick++)for(const r of actors){reactBlackRoach(r,player,1/120,210);safeBlackStepAngle(r,player,84);}
 const ms=performance.now()-start;console.log(`120000 black reaction/steering pairs: ${ms.toFixed(1)} ms`);assert.ok(ms<5000);
});
