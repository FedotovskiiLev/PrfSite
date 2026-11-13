import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blocked,sweepFraction,moveWithTables,tablesInBounds,TABLE_ART_GEOMETRY} from './table-geometry.mjs';
const source=()=>[{minX:0,maxX:100,minY:0,maxY:50}];
test('visible PNG bbox includes SVG default aspect fit, no phantom border',()=>{
 assert.deepEqual(TABLE_ART_GEOMETRY,{minX:-48,maxX:48,minY:-348/13,maxY:348/13,cornerRadius:42/13});
 for(const r of tablesInBounds(-900,-900,900,900)){assert(Math.abs(r.maxX-r.minX-96)<1e-8);assert(Math.abs(r.maxY-r.minY-696/13)<1e-8);}
});
test('radius retained at sides, exact contact can depart or slide tangent',()=>{
 assert(blocked(-9,25,10,source));assert(!blocked(-10,25,10,source));
 assert.equal(sweepFraction(-10,25,-20,25,10,source),1);
 assert.equal(sweepFraction(-10,25,-10,40,10,source),1);
 assert.equal(sweepFraction(-10,25,0,25,10,source),0);
 const p=moveWithTables(-100,25,1000,25,10,source);assert(p.x<-10&&p.x>-10.001);assert.equal(p.y,25);
});
test('rounded corners permit clear diagonal gap but block actual circle overlap',()=>{
 assert(!blocked(-8,-8,10,source));assert(blocked(-7,-7,10,source));
 assert.equal(sweepFraction(-10,-8,-8,-10,10,source),1);
 const t=sweepFraction(-20,-20,20,20,10,source);assert(Math.abs(t-(20-10/Math.SQRT2)/40)<1e-9);
 assert.equal(sweepFraction(-20,-10,120,-10,10,source),1);
});
test('zero motion, starting penetration, point actors, and reversed motion',()=>{
 assert.equal(sweepFraction(-8,-8,-8,-8,10,source),1);
 assert.equal(sweepFraction(50,25,51,25,10,source),0);
 assert.equal(sweepFraction(-20,25,120,25,0,source),20/140);
 assert.equal(sweepFraction(120,25,-20,25,10,source),10/140);
});
test('swept random rays stop before penetration, including corners and negative world',()=>{
 let seed=29;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 for(let i=0;i<4000;i++){const x=rnd()*240-70,y=rnd()*190-70,nx=rnd()*240-70,ny=rnd()*190-70;if(blocked(x,y,10,source))continue;const t=sweepFraction(x,y,nx,ny,10,source);for(let k=0;k<24;k++){const f=t*k/24;assert(!blocked(x+(nx-x)*f,y+(ny-y)*f,10,source));}const p=moveWithTables(x,y,nx,ny,10,source);assert(!blocked(p.x,p.y,10,source));}
});

test('art rounded corners use sum of character and corner radii',()=>{const src=()=>[{minX:0,maxX:100,minY:0,maxY:50,cornerRadius:4}];assert(!blocked(-7,-7,10,src));assert(blocked(-5,-5,10,src));const t=sweepFraction(-20,-20,20,20,10,src);assert(Math.abs(t-(24-14/Math.SQRT2)/40)<1e-9);assert.equal(sweepFraction(-10,25,-20,25,10,src),1);});
