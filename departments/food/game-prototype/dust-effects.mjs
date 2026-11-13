// Mirrors the walking rig's feet (±11, 23 ± 4*sin(phase)) and 3° body sway.
// A foot plants at its forwardmost extent: right at .25, left at .75.
const STRIDE=28,SCALE=.45,TAU=2*Math.PI;
export function footContactPosition(x,y,angle,phase,side){
 const s=Math.sin(phase*TAU),localX=side*11*SCALE,localY=(23-side*4*s)*SCALE;
 const rotation=angle+Math.PI/2+3*s*Math.PI/180;
 return {x:x+localX*Math.cos(rotation)-localY*Math.sin(rotation),y:y+localX*Math.sin(rotation)+localY*Math.cos(rotation)};
}
export function createDustEffects(layer){
 const particles=[],positions=new Map(),NS='http://www.w3.org/2000/svg';
 function emit(id,x,y,angle,gait){
  const previous=positions.get(id);positions.set(id,{x,y});
  if(!previous||!gait.moved||!gait.moving||!(gait.stepDistance>0))return;
  // Unwrap this frame, including phase wrap and multiple contacts in one frame.
  const advance=gait.stepDistance/STRIDE,end=gait.phase,start=end-advance;
  for(let k=Math.floor((start-.25)/.5+1e-9)+1;k<=Math.floor((end-.25)/.5+1e-9);k++){
   const phase=.25+k*.5,side=((k%2)+2)%2===0?1:-1;
   const fraction=Math.max(0,Math.min(1,(phase-start)/advance));
   const at=footContactPosition(previous.x+(x-previous.x)*fraction,previous.y+(y-previous.y)*fraction,angle,phase,side);
   const node=document.createElementNS(NS,'circle');
   for(const [key,value] of Object.entries({fill:'#fff',cx:at.x,cy:at.y,r:1.8,opacity:.65,'data-foot':side===1?'right':'left'}))node.setAttribute(key,value);
   layer.appendChild(node);particles.push({node,age:0});
   if(particles.length>80)particles.shift().node.remove();
  }
 }
 function update(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;const f=p.age/.38;if(f>=1){p.node.remove();particles.splice(i,1)}else{p.node.setAttribute('r',1.8+2*f);p.node.setAttribute('opacity',.65*(1-f))}}}
 function clear(){for(const p of particles)p.node.remove();particles.length=0;positions.clear()}
 return{emit,update,clear,forget:id=>positions.delete(id)};
}
