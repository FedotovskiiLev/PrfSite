export function createDustEffects(layer){
 const particles=[],distances=new Map(),NS='http://www.w3.org/2000/svg';
 function emit(id,x,y,angle,distance){let d=(distances.get(id)||0)+distance;if(d>=18){d%=18;const node=document.createElementNS(NS,'circle');node.setAttribute('fill','#fff');node.setAttribute('cx',x-Math.cos(angle)*12);node.setAttribute('cy',y-Math.sin(angle)*12);layer.appendChild(node);particles.push({node,age:0});if(particles.length>80)particles.shift().node.remove()}distances.set(id,d)}
 function update(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;const f=p.age/.38;if(f>=1){p.node.remove();particles.splice(i,1)}else{p.node.setAttribute('r',2.3+2*f);p.node.setAttribute('opacity',.65*(1-f))}}}
 function clear(){for(const p of particles)p.node.remove();particles.length=0;distances.clear()}
 return{emit,update,clear,forget:id=>distances.delete(id)};
}
