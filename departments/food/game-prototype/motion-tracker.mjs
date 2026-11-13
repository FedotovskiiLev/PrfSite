/** Distance-driven gait; attempted input never advances a planted foot. */
export function createMotionTracker({strideLength=28,stopGrace=.075,teleportDistance=256}={}){
 let previous=null,phase=0,still=Infinity;
 function reset(position=null){previous=position;phase=0;still=Infinity}
 function sample({x,y,dt,paused=false,exhausted=false}){
  const distance=previous?Math.hypot(x-previous.x,y-previous.y):0;previous={x,y};
  const stepDistance=dt>0&&!paused&&!exhausted&&distance<teleportDistance?distance:0;
  if(stepDistance>1e-6){phase=(phase+stepDistance/strideLength)%1;still=0}else if(dt>0)still+=dt;
  return {phase,moving:!paused&&!exhausted&&still<stopGrace,moved:stepDistance>1e-6,stepDistance};
 }
 return{sample,reset};
}
