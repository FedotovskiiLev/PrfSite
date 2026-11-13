// Same world hash/300-unit cells/table positions as environment.js, no rendering.
// Grab3D PNG alpha support [152,198,360,314), source 512-square.
// Render square size 512*6/13: visible bounds x +/-48, y +/-348/13.
// Seven source pixels approximate the small rounded texture corners.
export const TABLE_ART_GEOMETRY=Object.freeze({minX:-48,maxX:48,minY:-348/13,maxY:348/13,cornerRadius:42/13});
export function tableHash(x,y){let n=Math.imul(x,0x1f123bb5)^Math.imul(y,0x5f356495);n^=n>>>16;n=Math.imul(n,0x45d9f3b);return(n^(n>>>16))>>>0;}
export function tablesInBounds(minX,minY,maxX,maxY){const out=[];for(let y=Math.floor((minY-220)/300);y<=Math.floor((maxY+50)/300);y++)for(let x=Math.floor((minX-240)/300);x<=Math.floor((maxX+50)/300);x++){const h=tableHash(x,y);if(h%3===0)continue;const px=x*300+60+h%130,py=y*300+60+(h>>>8)%130;if(Math.hypot(px,py)<110)continue;const r={minX:px+TABLE_ART_GEOMETRY.minX,maxX:px+TABLE_ART_GEOMETRY.maxX,minY:py+TABLE_ART_GEOMETRY.minY,maxY:py+TABLE_ART_GEOMETRY.maxY,cornerRadius:TABLE_ART_GEOMETRY.cornerRadius};if(r.maxX>=minX&&r.minX<=maxX&&r.maxY>=minY&&r.minY<=maxY)out.push(r);}return out;}
// Circle versus visible rectangle, not a rectangle expanded at its corners.
const EPS=1e-9;
function roundedCore(r){const c=r.cornerRadius||0;return {minX:r.minX+c,maxX:r.maxX-c,minY:r.minY+c,maxY:r.maxY-c};}
function overlaps(x,y,radius,r){
 radius+=r.cornerRadius||0;r=roundedCore(r);
 const dx=Math.max(r.minX-x,0,x-r.maxX),dy=Math.max(r.minY-y,0,y-r.maxY);
 return radius===0?x>r.minX+EPS&&x<r.maxX-EPS&&y>r.minY+EPS&&y<r.maxY-EPS:dx*dx+dy*dy<radius*radius-EPS;
}
export function blocked(x,y,radius,source=tablesInBounds){
 return source(x-radius,y-radius,x+radius,y+radius).some(r=>overlaps(x,y,radius,r));
}
export function sweepFraction(x,y,nx,ny,radius,source=tablesInBounds){
 let earliest=1;const dx=nx-x,dy=ny-y,a=dx*dx+dy*dy;
 for(const rect of source(Math.min(x,nx)-radius,Math.min(y,ny)-radius,Math.max(x,nx)+radius,Math.max(y,ny)+radius)){
  if(overlaps(x,y,radius,rect)){earliest=0;continue;}
  const r=roundedCore(rect),hitRadius=radius+(rect.cornerRadius||0);
  if(a<EPS*EPS)continue;
  const accept=t=>{if(t>=-EPS&&t<=1)earliest=Math.min(earliest,Math.max(0,t));};
  // Only approaching faces: exact contact can move away or tangentially.
  if(dx>0){const t=(r.minX-hitRadius-x)/dx,q=y+t*dy;if(q>=r.minY&&q<=r.maxY)accept(t);}
  if(dx<0){const t=(r.maxX+hitRadius-x)/dx,q=y+t*dy;if(q>=r.minY&&q<=r.maxY)accept(t);}
  if(dy>0){const t=(r.minY-hitRadius-y)/dy,q=x+t*dx;if(q>=r.minX&&q<=r.maxX)accept(t);}
  if(dy<0){const t=(r.maxY+hitRadius-y)/dy,q=x+t*dx;if(q>=r.minX&&q<=r.maxX)accept(t);}
  if(hitRadius===0)continue;
  for(const [cx,cy,sx,sy] of [[r.minX,r.minY,-1,-1],[r.minX,r.maxY,-1,1],[r.maxX,r.minY,1,-1],[r.maxX,r.maxY,1,1]]){
   const ox=x-cx,oy=y-cy,b=ox*dx+oy*dy,c=ox*ox+oy*oy-hitRadius*hitRadius,disc=b*b-a*c;
   if(disc<=EPS)continue; // Grazing a corner is allowed, no penetration.
   const t=(-b-Math.sqrt(disc))/a,px=ox+t*dx,py=oy+t*dy;
   if(px*sx>=-EPS&&py*sy>=-EPS&&px*dx+py*dy<-EPS)accept(t);
  }
 }
 return earliest;
}
export function moveWithTables(x,y,nx,ny,radius,source=tablesInBounds){const t=sweepFraction(x,y,nx,ny,radius,source),length=Math.hypot(nx-x,ny-y);const f=t<1?Math.max(0,t-1e-5/Math.max(length,1)):1;return{x:x+(nx-x)*f,y:y+(ny-y)*f};}
export function findRoute(start,goal,radius,source=tablesInBounds){const nearby=source(Math.min(start.x,goal.x)-450-radius,Math.min(start.y,goal.y)-450-radius,Math.max(start.x,goal.x)+450+radius,Math.max(start.y,goal.y)+450+radius);source=()=>nearby;const clear=(a,b)=>sweepFraction(a.x,a.y,b.x,b.y,radius,source)===1;if(clear(start,goal))return[goal];const grid=32,pad=384,minX=Math.floor((Math.min(start.x,goal.x)-pad)/grid),minY=Math.floor((Math.min(start.y,goal.y)-pad)/grid),maxX=Math.ceil((Math.max(start.x,goal.x)+pad)/grid),maxY=Math.ceil((Math.max(start.y,goal.y)+pad)/grid);const nodes=new Map(),open=[];let visits=0;const point=(x,y)=>({x:x*grid,y:y*grid});const heuristic=p=>Math.hypot(p.x-goal.x,p.y-goal.y);function add(x,y,g,parent){const key=x+','+y,old=nodes.get(key);if(old&&old.g<=g)return;const p=point(x,y),n={x,y,g,f:g+heuristic(p),parent,key};nodes.set(key,n);open.push(n);}
const sx=Math.round(start.x/grid),sy=Math.round(start.y/grid);for(let y=sy-1;y<=sy+1;y++)for(let x=sx-1;x<=sx+1;x++){const p=point(x,y);if(!blocked(p.x,p.y,radius,source)&&clear(start,p))add(x,y,Math.hypot(p.x-start.x,p.y-start.y),null);}
while(open.length&&visits++<6000){let index=0;for(let i=1;i<open.length;i++)if(open[i].f<open[index].f)index=i;const n=open.splice(index,1)[0];if(nodes.get(n.key)!==n||n.closed)continue;n.closed=true;const p=point(n.x,n.y);if(heuristic(p)<80&&clear(p,goal)){const result=[goal];let v=n;while(v){result.unshift(point(v.x,v.y));v=v.parent;}return result;}for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]]){const x=n.x+dx,y=n.y+dy;if(x<minX||x>maxX||y<minY||y>maxY)continue;const q=point(x,y);if(clear(p,q))add(x,y,n.g+Math.hypot(dx,dy)*grid,n);}}
return[];}
