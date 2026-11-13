import {sweepFraction,blocked,tablesInBounds} from './table-geometry.mjs';
export function createRouteJob(start,goal,radius,source=tablesInBounds){
 start={x:start.x,y:start.y};goal={x:goal.x,y:goal.y};
 const grid=32,pad=384,heap=[],nodes=new Map();let order=0,expanded=0,done=false,path=[],initialized=false,status='queued',rebuild=null;
 const clear=(a,b)=>sweepFraction(a.x,a.y,b.x,b.y,radius,source)===1;
 const h=p=>Math.hypot(p.x-goal.x,p.y-goal.y),point=(x,y)=>({x:x*grid,y:y*grid});
 const minX=Math.floor((Math.min(start.x,goal.x)-pad)/grid),maxX=Math.ceil((Math.max(start.x,goal.x)+pad)/grid),minY=Math.floor((Math.min(start.y,goal.y)-pad)/grid),maxY=Math.ceil((Math.max(start.y,goal.y)+pad)/grid);
 const less=(a,b)=>a.f<b.f||a.f===b.f&&a.order<b.order;
 function push(n){heap.push(n);let i=heap.length-1;while(i){const p=(i-1)>>1;if(!less(heap[i],heap[p]))break;[heap[i],heap[p]]=[heap[p],heap[i]];i=p;}}
 function pop(){const n=heap[0],end=heap.pop();if(heap.length){heap[0]=end;let i=0;while(true){let c=i,l=i*2+1,r=l+1;if(l<heap.length&&less(heap[l],heap[c]))c=l;if(r<heap.length&&less(heap[r],heap[c]))c=r;if(c===i)break;[heap[i],heap[c]]=[heap[c],heap[i]];i=c;}}return n;}
 function add(x,y,g,parent){const key=x+','+y,old=nodes.get(key);if(old&&old.g<=g)return;const n={x,y,g,f:g+h(point(x,y)),key,parent,order:order++};nodes.set(key,n);push(n);}
 return {get done(){return done},get goal(){return {...goal}},get path(){return path.slice(-64).reverse().map(p=>({...p}))},get status(){return status},get expanded(){return expanded},
 run(budget){let used=0;while(used<budget&&!done){used++;
 if(rebuild){path.push(point(rebuild.x,rebuild.y));rebuild=rebuild.parent;if(!rebuild){done=true;status='ready';}continue;}
 if(!initialized){initialized=true;status='searching';if(h(start)>4096){done=true;status='limited';continue;}if(clear(start,goal)){path=[goal];done=true;status='ready';continue;}const sx=Math.round(start.x/grid),sy=Math.round(start.y/grid);for(let y=sy-1;y<=sy+1;y++)for(let x=sx-1;x<=sx+1;x++){const p=point(x,y);if(!blocked(p.x,p.y,radius,source)&&clear(start,p))add(x,y,Math.hypot(p.x-start.x,p.y-start.y),null);}continue;}
 if(!heap.length||expanded>=6000){done=true;status=heap.length?'limited':'unreachable';continue;}
 const n=pop();if(nodes.get(n.key)!==n||n.closed)continue;n.closed=true;expanded++;const p=point(n.x,n.y);
 if(h(p)<80&&clear(p,goal)){path=[goal];rebuild=n;status='reconstructing';continue;}
 for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1]]){const x=n.x+dx,y=n.y+dy;if(x<minX||x>maxX||y<minY||y>maxY)continue;if(clear(p,point(x,y)))add(x,y,n.g+Math.hypot(dx,dy)*grid,n);}
 }return used;}
 };
}
export function createRouteQueue(budget=96){const jobs=new Map(),queue=[];let used=0;return{
 request(id,start,goal,radius,source){if(jobs.has(id))return;const job=createRouteJob(start,goal,radius,source);jobs.set(id,job);queue.push(id);},
 cancel(id){jobs.delete(id);},
 process(){used=0;const ready=[];while(used<budget&&queue.length&&ready.length<16){const id=queue.shift(),job=jobs.get(id);if(!job)continue;used+=job.run(Math.min(8,budget-used));if(job.done){ready.push({id,path:job.path,goal:job.goal,status:job.status});jobs.delete(id);}else queue.push(id);}return ready;},
 get pending(){return jobs.size},get used(){return used},has(id){return jobs.has(id)}
};}
