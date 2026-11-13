import test from 'node:test';
import assert from 'node:assert/strict';
import {createDustEffects,footContactPosition} from './dust-effects.mjs';
import {createMotionTracker} from './motion-tracker.mjs';
function setup(){const nodes=[];globalThis.document={createElementNS(){return {attrs:{},setAttribute(k,v){this.attrs[k]=String(v)},remove(){const i=nodes.indexOf(this);if(i>=0)nodes.splice(i,1)}}}};return {nodes,dust:createDustEffects({appendChild(n){nodes.push(n)}})}}
function actor(dust,id,angle=0){let x=0,y=0;const motion=createMotionTracker();motion.reset({x,y});dust.emit(id,x,y,angle,motion.sample({x,y,dt:0}));return {step(distance,options={}){x+=distance*Math.cos(angle);y+=distance*Math.sin(angle);dust.emit(id,x,y,angle,motion.sample({x,y,dt:1/60,...options}));}}}
function near(a,b){assert.ok(Math.abs(Number(a)-b)<1e-8,`${a} != ${b}`)}
test('both actors emit alternating contacts from their actual scaled feet',()=>{
 const {nodes,dust}=setup();for(const id of ['player',9]){const a=actor(dust,id);a.step(7);const right=nodes.at(-1);assert.equal(right.attrs['data-foot'],'right');const p=footContactPosition(7,0,0,.25,1);near(right.attrs.cx,p.x);near(right.attrs.cy,p.y);a.step(14);assert.equal(nodes.at(-1).attrs['data-foot'],'left');const q=footContactPosition(21,0,0,.75,-1);near(nodes.at(-1).attrs.cx,q.x);near(nodes.at(-1).attrs.cy,q.y);}
 assert.equal(nodes.length,4);
});
test('contacts follow turning and opposite directions, not actor centre',()=>{
 for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){const {nodes,dust}=setup();const a=actor(dust,'player',angle);a.step(7);const p=footContactPosition(7*Math.cos(angle),7*Math.sin(angle),angle,.25,1);near(nodes[0].attrs.cx,p.x);near(nodes[0].attrs.cy,p.y);assert.ok(Math.hypot(p.x-7*Math.cos(angle),p.y-7*Math.sin(angle))>9);}
});
test('frame-size-independent alternating contacts across phase wrap',()=>{
 for(const steps of [[28,28],Array(56).fill(1)]){const {nodes,dust}=setup();const a=actor(dust,'player');for(const d of steps)a.step(d);assert.deepEqual(nodes.map(n=>n.attrs['data-foot']),['right','left','right','left']);for(let i=0;i<4;i++){const p=footContactPosition(7+i*14,0,0,.25+i*.5,i%2?-1:1);near(nodes[i].attrs.cx,p.x);near(nodes[i].attrs.cy,p.y);}}
});
test('idle, collision, paused and exhausted actors do not emit; cleanup resets state',()=>{
 const {nodes,dust}=setup();const a=actor(dust,'player');a.step(7);assert.equal(nodes.length,1);for(let i=0;i<20;i++)a.step(0);a.step(14,{paused:true});a.step(14,{exhausted:true});assert.equal(nodes.length,1);dust.update(.4);assert.equal(nodes.length,0);dust.clear();a.step(14);assert.equal(nodes.length,0);
});
test('particles have immediate geometry and remain bounded',()=>{const {nodes,dust}=setup();const a=actor(dust,1);for(let i=0;i<200;i++)a.step(14);assert.equal(nodes.length,80);assert.equal(nodes.at(-1).attrs.r,'1.8');dust.clear();assert.equal(nodes.length,0)});
