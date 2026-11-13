import {createRouteQueue} from './incremental-route.mjs';
import {blocked,moveWithTables,findRoute,sweepFraction} from './table-geometry.mjs';
/** Pure gameplay model. No DOM, rendering, score multiplier, growth or difficulty curve. */
export function seededRandom(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let n = state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const positive = (n, name) => { if (!Number.isFinite(n) || n <= 0) throw new RangeError(`${name} must be finite and positive`); };
function touchesDuringStep(px, py, nx, ny, rx, ry, sx, sy, radius) {
  const x = px - rx, y = py - ry, dx = nx - px - (sx - rx), dy = ny - py - (sy - ry);
  const d2 = dx * dx + dy * dy;
  const t = d2 ? clamp(-(x * dx + y * dy) / d2, 0, 1) : 0;
  return (x + t * dx) ** 2 + (y + t * dy) ** 2 <= radius ** 2;
}
/** Swept contact for a linear player and pursuer that stops partway through a tick. */
export function touchesStoppingPursuer(px,py,nx,ny,rx,ry,sx,sy,radius,moveFraction){
  const f=clamp(moveFraction,0,1),mx=px+(nx-px)*f,my=py+(ny-py)*f;
  return (f>0&&touchesDuringStep(px,py,mx,my,rx,ry,sx,sy,radius)) ||
    (f<1&&touchesDuringStep(mx,my,nx,ny,sx,sy,sx,sy,radius));
}
function bothStoppingHit(px,py,nx,ny,rx,ry,sx,sy,radius,pf,rf){
 const times=[0,pf,rf,1].sort((a,b)=>a-b);
 const pos=(a,b,f,t)=>a+(b-a)*(f>0?Math.min(t/f,1):1);
 for(let i=1;i<times.length;i++){const a=times[i-1],b=times[i];if(b===a)continue;
 if(touchesDuringStep(pos(px,nx,pf,a),pos(py,ny,pf,a),pos(px,nx,pf,b),pos(py,ny,pf,b),pos(rx,sx,rf,a),pos(ry,sy,rf,a),pos(rx,sx,rf,b),pos(ry,sy,rf,b),radius))return true;
 }return false;
}
/** Player stops at pf within full tick; roach moves linearly during [a,b]. */
export function stopAwareRoachHit(px,py,nx,ny,rx,ry,sx,sy,radius,pf,a=0,b=1){
 const at=t=>pf>0?Math.min(t/pf,1):1;
 const u=at(a),v=at(b),local=clamp((pf-a)/(b-a),0,1);
 return bothStoppingHit(px+(nx-px)*u,py+(ny-py)*u,px+(nx-px)*v,py+(ny-py)*v,rx,ry,sx,sy,radius,local,1);
}
/** Apply a completed search without discarding a still-safe old path. */
export function applyRouteResult(r,result,player,canReach=(a,b)=>sweepFraction(a.x,a.y,b.x,b.y,a.radius)===1){
 r.routeStatus=result.status;
 if(result.status!=='ready'){r.routeTimer=2;r.routeNeedsReplan=true;return 0;}
 const goal=result.goal??result.path.at(-1);
 r.routeNeedsReplan=!!goal&&Math.hypot(goal.x-player.x,goal.y-player.y)>128;
 let checks=0,index=-1;
 // Bounded adoption: endpoint shortcut or original first node, at most TWO ray checks.
 if(goal){checks++;if(canReach(r,goal))index=-2;}
 if(index===-1&&result.path.length>0){checks++;if(canReach(r,result.path[0]))index=0;}
 if(index>=0||index===-2){r.route=index===-2?[{...goal}]:result.path.slice(index,index+64);r.routeTimer=r.routeNeedsReplan?.15:.6;}
 else{r.routeStatus='unusable';r.routeNeedsReplan=true;r.routeTimer=2;}
 return checks;
}
export function createFoodGame(options = {}) {
  let {width=960,height=600}=options;
  const {playerRadius=16,roachRadius=8,playerSpeed=140,population=40,rareChance=.30,blackUnlockGinger=15,
    sanitizerUnlockEaten=10,sanitizerInterval=7,sanitizerMinTravel=500,sanitizerMaxTravel=1100,sanitizerLimit=16,
    random=seededRandom(options.seed??1),step=1/120,lowVisibleCount=6}=options;
  for(const [key,value] of Object.entries({width,height,playerRadius,roachRadius,playerSpeed,step}))positive(value,key);
  for(const [k,v] of Object.entries({sanitizerInterval,sanitizerMinTravel,sanitizerMaxTravel}))positive(v,k);
  if(sanitizerMaxTravel<sanitizerMinTravel)throw new RangeError('invalid sanitizer travel range');
  if(!Number.isInteger(sanitizerUnlockEaten)||sanitizerUnlockEaten<0||!Number.isInteger(sanitizerLimit)||sanitizerLimit<1)throw new RangeError('invalid sanitizer threshold/limit');
  if(step<1e-6)throw new RangeError('step must be at least 1e-6 seconds');
  if(!Number.isInteger(population)||population<1||population>10000)throw new RangeError('population must be 1..10000');
  if(!Number.isInteger(blackUnlockGinger)||blackUnlockGinger<0)throw new RangeError('blackUnlockGinger must be a nonnegative integer');
  if(!Number.isInteger(lowVisibleCount)||lowVisibleCount<0)throw new RangeError('lowVisibleCount must be nonnegative');
  if(!Number.isFinite(rareChance)||rareChance<0||rareChance>1)throw new RangeError('rareChance must be 0..1');
  if(typeof random!=='function')throw new TypeError('random must be a function');
  function rng(){const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw new RangeError('random must return [0,1)');return n;}
  const player={x:0,y:0,radius:playerRadius};let travelX=0,travelY=0;
  let eaten=0,tiredSanitizers=0,gingerEaten=0,ticks=0,accumulator=0,serial=0;
  const navigation=createRouteQueue(64);let adoptionWork=0;
  const roaches=[],sanitizers=[];let failure=null,gameOver=false,sanitizerStarted=false,sanitizerTimer=0,sanitizerSerial=0;
  function healthy(){if(failure)throw new Error('Model stopped after random source failure; recreate it',{cause:failure});}
  function visible(r){return Math.abs(r.x-player.x)<=width/2+r.radius&&Math.abs(r.y-player.y)<=height/2+r.radius;}
  function durations(r){r.walkDuration=.3+rng()*.3;r.remaining=r.walkDuration*1.5;}
  function spawn(){
    // Entire collision circle is outside the current camera rectangle, with a margin.
    const margin=roachRadius+48+Math.max(playerSpeed*step,1);
    const hx=width/2+margin,hy=height/2+margin;
    // Keep new arrivals ahead of a moving camera, while retaining all-side traffic.
    let side=Math.floor(rng()*4);
    const travel=Math.abs(travelX)+Math.abs(travelY);
    if(travel>1e-6&&rng()<.7)side=rng()<Math.abs(travelX)/travel?(travelX<0?0:1):(travelY<0?2:3);
    const along=rng()*2-1,depth=rng()*Math.min(64,Math.min(width,height)*.25);
    let x,y;
    if(side===0||side===1){x=(side===0?-1:1)*(hx+depth);y=along*hy;}
    else{x=along*hx;y=(side===2?-1:1)*(hy+depth);}
    // Births avoid tabletops too, although roaches can subsequently walk across them.
    for(let i=0;i<32&&blocked(player.x+x,player.y+y,roachRadius);i++){
      if(side<2)x+=(side===0?-64:64);else y+=(side===2?-64:64);
    }
    const r={id:++serial,x:player.x+x,y:player.y+y,radius:roachRadius,
      kind:(rng()<rareChance && gingerEaten>=blackUnlockGinger)?'black':'ginger',phase:'idle',angle:rng()*Math.PI*2,
      remaining:0,walkDuration:0,directed:false};durations(r);return r;
  }
  for(let i=0;i<population;i++)roaches.push(spawn());
  function transition(r,visibleCount){
    if(r.phase==='idle'){
      r.phase='walk';r.remaining=r.walkDuration;
      // Only offscreen roaches can be biased, and only under low visible population.
      r.directed=!visible(r)&&visibleCount<lowVisibleCount&&rng()<.8;
      if(r.directed){
        const tx=player.x+(rng()-.5)*width*.7,ty=player.y+(rng()-.5)*height*.7;
        const angle=Math.atan2(ty-r.y,tx-r.x);
        r.angle=Math.abs(Math.atan2(Math.sin(angle-r.angle),Math.cos(angle-r.angle)))<.001?angle+.001:angle;
      }else r.angle=(r.angle+.2+rng()*(Math.PI*2-.4))%(Math.PI*2);
    }else{r.phase='idle';r.directed=false;durations(r);}
  }
  function spawnSanitizer(){
    let margin=playerRadius+48;const side=Math.floor(rng()*4),along=rng()*2-1;
    const hx=width/2+margin,hy=height/2+margin;
    const travel=sanitizerMinTravel+rng()*(sanitizerMaxTravel-sanitizerMinTravel);
    let x,y;
    // Fixed side, push outward if obstructed; bounded deterministic search, no RNG retries.
    let found=false;
    for(let i=0;i<32;i++){
      x=player.x+(side<2?(side===0?-1:1)*(hx+i*64):along*hx);
      y=player.y+(side>=2?(side===2?-1:1)*(hy+i*64):along*hy);
      if(!blocked(x,y,playerRadius)){found=true;break;}
    }
    if(!found)return;
    sanitizers.push({id:++sanitizerSerial,x,y,route:[],routeTimer:0,radius:playerRadius,
      phase:'walk',remainingTravel:travel,totalTravel:travel,angle:0});
  }
  function sanitizerTick(px,py,playerMoveFraction){
    if(eaten<sanitizerUnlockEaten)return;
    const previousSerial=sanitizerSerial;
    if(!sanitizerStarted){sanitizerStarted=true;sanitizerTimer=sanitizerInterval;if(sanitizers.length<sanitizerLimit)spawnSanitizer();}
    else{sanitizerTimer=Math.max(0,sanitizerTimer-step);const allowed=1+Math.floor((eaten-sanitizerUnlockEaten)/5);if(sanitizerTimer<=0&&sanitizerSerial<allowed){spawnSanitizer();sanitizerTimer=sanitizerInterval;}}
    for(const r of sanitizers){
      if(r.id>previousSerial)continue;
      const rx=r.x,ry=r.y;
      let moveTime=0;
      if(r.phase==='walk'){
        r.routeTimer-=step;
        if(r.routeTimer<=0&&!navigation.has(r.id)){navigation.request(r.id,r,player,playerRadius);r.routeTimer=.6;}
        while(r.route.length&&Math.hypot(r.route[0].x-r.x,r.route[0].y-r.y)<1e-5)r.route.shift();
        const target=r.route[0]??r;
        const dx=target.x-r.x,dy=target.y-r.y,n=Math.hypot(dx,dy);
        r.angle=Math.atan2(dy,dx);
        const speed=playerSpeed*.8;
        const d=Math.min(speed*step,r.remainingTravel,n);
        moveTime=d/speed;
        const next=n>0?moveWithTables(rx,ry,rx+dx/n*d,ry+dy/n*d,playerRadius):{x:rx,y:ry};
        r.x=next.x;r.y=next.y;
        const actual=Math.hypot(r.x-rx,r.y-ry);moveTime=actual/speed;
        r.remainingTravel=Math.max(0,r.remainingTravel-actual);
        if(r.remainingTravel<=1e-9){r.remainingTravel=0;r.phase='idle';tiredSanitizers++;navigation.cancel(r.id);}
      }
      // Actual path is movement up to moveTime, then rest, not a slower full-tick drift.
      if(r.phase==='walk'&&bothStoppingHit(px,py,player.x,player.y,rx,ry,r.x,r.y,playerRadius+r.radius,playerMoveFraction,moveTime/step)){gameOver=true;break;}
    }
    // Exhausted sanitarians stay seated in the world; thresholds never respawn replacements.
  }
  function recycleFar(){
    // A screen-shaped local population, not a huge circular tail several screens behind.
    // Never recycle a visible actor. A rear actor beyond the near halo cannot keep up
    // with a running student (roach walk/rest average speed is lower), so reuse it ahead.
    const halo=220,rearHalo=100;
    for(let i=0;i<roaches.length;i++){
      const r=roaches[i],x=r.x-player.x,y=r.y-player.y;
      const outside=Math.abs(x)>width/2+halo||Math.abs(y)>height/2+halo;
      const trailing=(travelX*x+travelY*y<0)&&
        ((Math.abs(travelX)>1e-6&&Math.abs(x)>width/2+rearHalo)||
         (Math.abs(travelY)>1e-6&&Math.abs(y)>height/2+rearHalo));
      if(!visible(r)&&(outside||trailing))roaches[i]=spawn();
    }
  }
  function tick(input,consumed){
    let dx=input.x,dy=input.y;const length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}
    const px=player.x,py=player.y;
    const moved=moveWithTables(px,py,px+dx*playerSpeed*step,py+dy*playerSpeed*step,playerRadius);
    player.x=moved.x;player.y=moved.y;travelX=player.x-px;travelY=player.y-py;
    const intended=Math.hypot(dx,dy)*playerSpeed*step;
    const playerMoveFraction=intended?Math.min(1,Math.hypot(player.x-px,player.y-py)/intended):0;
    const visibleCount=roaches.filter(visible).length;
    for(let i=0;i<roaches.length;i++){
      const r=roaches[i];let remaining=step,elapsed=0,hit=false;
      while(remaining>1e-12){
        if(r.remaining<=1e-12)transition(r,visibleCount);
        const dt=Math.min(remaining,r.remaining),rx=r.x,ry=r.y;
        if(r.phase==='walk'){r.x+=Math.cos(r.angle)*playerSpeed*1.5*dt;r.y+=Math.sin(r.angle)*playerSpeed*1.5*dt;}
        const a=elapsed/step,b=(elapsed+dt)/step;
        if(stopAwareRoachHit(px,py,player.x,player.y,rx,ry,r.x,r.y,playerRadius+roachRadius,playerMoveFraction,a,b))hit=true;
        elapsed+=dt;remaining-=dt;r.remaining-=dt;if(hit)break;
      }
      if(hit){eaten++;if(r.kind==='ginger')gingerEaten++;consumed.push({id:r.id,kind:r.kind});roaches[i]=spawn();}
    }
    recycleFar();sanitizerTick(px,py,playerMoveFraction);ticks++;
  }
  return {
    advance(dt,input={x:0,y:0}){
      healthy();
      if(!Number.isFinite(dt)||dt<0)throw new RangeError('dt must be finite and nonnegative');
      if(!Number.isFinite(input.x)||!Number.isFinite(input.y))throw new RangeError('input vector must be finite');
      if(dt===0||gameOver)return {eaten,gingerEaten,tiredSanitizers,gameOver,consumed:[]};
      adoptionWork=0;
      for(const result of navigation.process()){
        const r=sanitizers.find(r=>r.id===result.id);if(!r||r.phase!=='walk')continue;
        adoptionWork+=applyRouteResult(r,result,player);
      }
      accumulator+=dt;const consumed=[];
      try{while(accumulator+1e-12>=step){tick(input,consumed);accumulator-=step;if(gameOver){accumulator=0;break;}}}catch(error){failure=error;throw error;}
      if(accumulator<0)accumulator=0;return {eaten,gingerEaten,tiredSanitizers,gameOver,consumed};
    },
    // Resize changes only the camera rectangle. Existing world positions/IDs never move.
    resizeViewport(w,h){healthy();positive(w,'width');positive(h,'height');width=w;height=h;},
    snapshot(){healthy();return {width,height,navigation:{pending:navigation.pending,workUsed:navigation.used+adoptionWork,searchWork:navigation.used,adoptionWork,budget:96},time:ticks*step,score:gingerEaten*10+(eaten-gingerEaten)*50+tiredSanitizers*5,eaten,tiredSanitizers,gameOver,sanitizers:sanitizers.map(r=>({...r,route:r.route.map(p=>({...p})),visible:visible(r)})),gingerEaten,blackUnlockGinger,blackUnlocked:gingerEaten>=blackUnlockGinger,player:{...player},
      camera:{x:player.x,y:player.y,width,height},visibleCount:roaches.filter(visible).length,
      roaches:roaches.map(r=>({...r,visible:visible(r)})),interpolation:accumulator/step};}
  };
}
