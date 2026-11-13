/* SVG sprite geometry, authored for Phystech.Food. Not a release build. */
(function(root){'use strict';
const NS='http://www.w3.org/2000/svg';
function el(n,a={}){const e=document.createElementNS(NS,n);for(const [k,v] of Object.entries(a))e.setAttribute(k,String(v));return e}
function add(p,n,a={}){const e=el(n,a);p.appendChild(e);return e}
const outline={stroke:'#403d3a','stroke-width':3};
function student(){const g=el('g'),feet=add(g,'g',{fill:'#544638',stroke:'#34312e','stroke-width':2}),fl=add(feet,'ellipse',{cx:-11,cy:23,rx:7,ry:10}),fr=add(feet,'ellipse',{cx:11,cy:23,rx:7,ry:10});const l=add(g,'g'),r=add(g,'g');add(l,'path',{d:'M-29 9q-7-8-4-18l6-10 9 5-4 15 5 8',fill:'#d99b71',...outline});add(r,'path',{d:'M29 9q7-8 4-18l-6-10-9 5 4 15-5 8',fill:'#d99b71',...outline});const torso=add(g,'path',{fill:'#45778a',stroke:'#303f45','stroke-width':3});const head=add(g,'g');add(head,'circle',{cy:-19,r:18,fill:'#7b5037',stroke:'#49372d','stroke-width':3});add(head,'path',{d:'M-16-21q2-19 17-19 15 0 17 19-12-6-34 0',fill:'#45352e'});add(head,'path',{d:'M-8-8q8 4 16 0',fill:'none',stroke:'#a86a4a','stroke-width':2});return{node:g,update(t,moving){const s=moving?Math.sin(t*2*Math.PI):0;feet.setAttribute('display',moving?'inline':'none');fl.setAttribute('cy',23+4*s);fr.setAttribute('cy',23-4*s);l.setAttribute('transform',`translate(0 ${6*s})`);r.setAttribute('transform',`translate(0 ${-6*s})`);head.setAttribute('transform',`rotate(${2*s} 0 -19)`);g.setAttribute('transform',`rotate(${3*s})`);torso.setAttribute('d',moving?'M-22-14Q0-25 22-14l8 26Q20 18 18 22Q0 30-18 22Q-20 18-30 12z':'M-22-14Q0-25 22-14l8 26Q0 25-30 12z')}}}
const targets=[[0,0],[10.4,-4.5],[-9.1,5.2],[7.8,6.5],[-10.4,-3.9],[4.6,-6.5],[-9.1,-5.2],[9.8,3.9]], antA=[0,0,9,-10,-10,14,14,-5,0,11,-14,0],antB=[6,-12,-12,0,10,10,-5,14,0];
function roach(mutant=false){const g=el('g'),legs=[];let stroke=mutant?'#141619':'#3a2922';for(const side of [-1,1])for(let row=0;row<3;row++)legs.push({side,row,node:add(g,'path',{fill:'none',stroke,'stroke-width':mutant?3.5:3,'stroke-linecap':'round','stroke-linejoin':'round'})});const body=add(g,'g'),al=add(body,'g',{fill:'none',stroke,'stroke-width':3,'stroke-linecap':'round'}),ar=add(body,'g',{fill:'none',stroke,'stroke-width':3,'stroke-linecap':'round'});add(al,'path',{d:'M-4-13q-5-20-10-29'});add(ar,'path',{d:'M4-13q5-20 10-29'});add(body,'ellipse',{cy:2,rx:10,ry:16,fill:mutant?'#292b31':'#6d3823',stroke,'stroke-width':3});add(body,'path',{d:'M0-11v26 M-8 0q8 5 16 0',fill:'none',stroke:mutant?'#686a75':'#b77646','stroke-width':2});add(body,'ellipse',{cy:-11,rx:7,ry:6,fill:mutant?'#1b1d21':'#492b20'});return{node:g,update(t,walking){const phase=((t%1)+1)%1;let bx=0,by=0;if(mutant){let u=phase*8,i=Math.floor(u),z=Math.min((u-i)/.72,1),f=z<1?1-Math.exp(-8*z)*(Math.cos(14*z)+(8/14)*Math.sin(14*z)):1,A=targets[i%8],B=targets[(i+1)%8];bx=.95*(A[0]+(B[0]-A[0])*f);by=.95*(A[1]+(B[1]-A[1])*f)}for(const {side,row,node} of legs){const A=(side===-1&&(row===0||row===2))||(side===1&&row===1),q=(phase+(A?0:.5))%1;let dy=0,lift=0;if(walking){if(q<.62)dy=-4+8*q/.62;else{let z=(q-.62)/.38;dy=4-8*z;lift=(mutant?3:2)*Math.sin(Math.PI*z)}}const y=[-10,0,10][row],near=mutant?20:16,far=mutant?31:22,hip=side*8+bx,knee=side*(near-lift)+bx*.4,foot=side*(far-lift),ky=y+[-7,0,7][row]+dy*.35+by*.4,fy=y+[-15,0,15][row]+dy;node.setAttribute('d',`M${hip} ${y+by} Q${side*13+bx*.7} ${ky-2} ${knee} ${ky} L${foot} ${fy}`)}body.setAttribute('transform',`translate(${bx} ${by})`);al.setAttribute('transform',`rotate(${antA[Math.floor(phase*12)%12]} -4 -13)`);ar.setAttribute('transform',`rotate(${antB[Math.floor(phase*9)%9]} 4 -13)`)}}}
function sanitarian(){
 const base=student(),g=base.node,feet=g.children[0],leftArm=g.children[1],rightArm=g.children[2],torso=g.children[3],head=g.children[4];
 torso.setAttribute('fill','#ebece4');
 add(head,'path',{d:'M-13-29 Q0-36 13-29 L12-23 Q0-28 -12-23 Z',fill:'#f7f8f2',stroke:'#72877d','stroke-width':2});
 const badge=add(g,'circle',{cx:11,cy:3,r:3,fill:'#508e7f'});
 // A separate resting silhouette, not rotated walking arms or detached shoes.
 // Hips and shoulders overlap the unchanged coat, so every limb has a visible joint.
 const lying=add(g,'g',{'data-pose':'lying',display:'none'});
 add(lying,'ellipse',{cx:0,cy:20,rx:49,ry:53,fill:'#243b50',opacity:.12,'data-part':'contact-shadow'});
 const trousers=add(lying,'g',{'data-part':'resting-legs',fill:'#c9cec5',stroke:'#72877d','stroke-width':2,'stroke-linejoin':'round'});
 add(trousers,'path',{d:'M-17 17 Q-10 14-3 19 L-5 39 L-10 64 Q-16 67-22 62 L-17 38 Z'});
 add(trousers,'path',{d:'M3 19 Q10 14 17 17 L23 37 L30 57 Q25 63 19 62 L11 41 Z'});
 add(trousers,'path',{d:'M-9 29 L-12 43 M10 29 L17 44 M-19 48 L-10 50 M17 48 L25 46',fill:'none',stroke:'#a5afa7','stroke-width':1.3});
 // Shoes meet the trouser hems, rather than floating under two short stumps.
 add(lying,'path',{d:'M-22 60 Q-16 63-10 62 L-10 69 Q-17 75-25 70 L-25 66 Z',fill:'#544638',stroke:'#34312e','stroke-width':2});
 add(lying,'path',{d:'M18 59 Q24 61 29 56 L35 62 Q35 68 28 70 L23 68 Z',fill:'#544638',stroke:'#34312e','stroke-width':2});
 const arms=add(lying,'g',{'data-part':'resting-arms','stroke-linejoin':'round','stroke-linecap':'round'});
 // Relaxed forearms extend out from shoulders; the two palms rest on the floor.
 add(arms,'path',{d:'M-26-9 L-43-3 L-52 7 Q-57 5-59 10 Q-58 17-51 17 L-47 13 L-35 5 L-22 3 Z',fill:'#d99b71',...outline});
 add(arms,'path',{d:'M26-9 L42-2 L51 7 Q57 5 59 11 Q57 17 51 17 L46 12 L34 5 L22 3 Z',fill:'#d99b71',...outline});
 add(arms,'path',{d:'M-21-14 Q-29-14-35-8 L-32 3 L-22 7 Z M21-14 Q29-14 35-8 L32 3 L22 7 Z',fill:'#ebece4',stroke:'#72877d','stroke-width':2});
 add(arms,'path',{d:'M-55 11 l3 2 M55 11 l-3 2',fill:'none',stroke:'#a86a4a','stroke-width':1.3});
 if(g.insertBefore)g.insertBefore(lying,torso);
 const sweat=add(g,'g',{'data-part':'sweat',fill:'#76b4bd',stroke:'#4f8390','stroke-width':1});
 const drops=[add(sweat,'path',{d:'M-29-26 q-4 5 0 8 q4-3 0-8'}),add(sweat,'path',{d:'M29-21 q-3 4 0 6 q3-2 0-6'})];
 return{node:g,update(t,moving,exhausted=false,idleTime=t){
  base.update(t,moving&&!exhausted);
  lying.setAttribute('display',exhausted?'inline':'none');
  sweat.setAttribute('display',exhausted?'inline':'none');
  leftArm.setAttribute('display',exhausted?'none':'inline');rightArm.setAttribute('display',exhausted?'none':'inline');
  if(exhausted){
   feet.setAttribute('display','none');
   torso.setAttribute('d','M-22-14Q0-25 22-14l8 26Q20 18 18 22Q0 30-18 22Q-20 18-30 12z');
   const breath=Math.sin(idleTime*2*Math.PI*.55);
   // Only the chest breathes. Limbs and their floor-contact shadow stay planted.
   torso.setAttribute('transform',`translate(0 ${-.35*breath}) scale(${1+.012*breath} ${1+.008*breath})`);
   badge.setAttribute('transform',`translate(0 ${-.35*breath})`);
   g.setAttribute('transform','rotate(0)');head.setAttribute('transform','rotate(0)');
   for(let i=0;i<drops.length;i++){const phase=((idleTime*.65+i*.47)%1+1)%1;drops[i].setAttribute('transform',`translate(0 ${7*phase})`);drops[i].setAttribute('opacity',String(Math.min(1,phase*6,(1-phase)*5)))}
  }else{torso.setAttribute('transform','');badge.setAttribute('transform','')}
 }}
}

root.FoodSpriteRig={student,roach,sanitarian};
})(globalThis);

