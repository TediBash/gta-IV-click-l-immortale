import {ADVENTURE_ZONES,adventureConfig} from '../data/adventures.js';
import {FACILITY_ZONES,facilityConfig,FACILITY_VAN} from '../data/facility.js';
import {DOORS,ZONE_NAMES,workshopConfig,PARKING} from '../data/zones.js';
import {TRACK} from './RaceController.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const NAV_COLORS={door:0x95f55b,locked:0xc99cff,objective:0xffda69,enemy:0xff997c,player:0xffffff};
export function navigationContext(s){
 const controller=s.adventureController||s.facilityController||s.zoneController;
 if(!controller)return {current:'local',zones:{local:{...s.mission.config,stage:s.mission.state.index,doors:[]}},configs:{local:s.mission.config},saved:{},doors:[],blocked:()=>false};
 const current=controller.zone,index=s.mission.state.index;
 const zones=s.adventureController?ADVENTURE_ZONES[s.mission.id]:s.facilityController?FACILITY_ZONES:Object.fromEntries(Object.entries(DOORS).map(([id,doors])=>[id,{doors,stage:index,name:ZONE_NAMES[id]}]));
 const configs=Object.fromEntries(Object.keys(zones).map(id=>[id,s.adventureController?adventureConfig(s.mission.mission,id,index,s.app?.progress?.difficulty):s.facilityController?facilityConfig(s.mission.mission.chapters[index],id,index,s.app?.progress?.difficulty):workshopConfig(s.mission.mission.chapters[index],id,s.app?.progress?.difficulty)]));
 const blocked=d=>s.adventureController?!!controller.blocked(d):s.facilityController?zones[d.to].stage>index&&!s.mission.canExit():false;
 return {controller,current,zones,configs,saved:controller.data.zones,doors:controller.doors,blocked};
}
export function roomRoute(ctx,to){
 const q=[{id:ctx.current,path:[]}],seen=new Set([ctx.current]);
 for(let i=0;i<q.length;i++){const n=q[i];if(n.id===to)return n.path;for(const d of ctx.zones[n.id]?.doors||[]){if(seen.has(d.to)||ctx.blocked(d))continue;seen.add(d.to);q.push({id:d.to,path:[...n.path,d]});}}return null;
}
export function navigationState(s){
 if(s.isHideout)return {doors:[],points:[],target:null};
 if(s.race){const [x,y]=TRACK[s.race.progress.next];return {doors:[],points:[],target:{x,y,kind:'objective',label:'Prossimo varco del circuito'}};}
 const ctx=navigationContext(s),index=s.mission.state.index,candidates=[];
 if(s.director.helicopters?.alert)return {target:s.director.helicopters.guidance(s.player,s.map),doors:ctx.doors.map(d=>({...d,locked:true,alarm:true})),points:[]};
 const add=(zone,key,p)=>candidates.push({...p,zone,key,kind:p.kind||'objective'});
 for(const [zone,c]of Object.entries(ctx.configs)){
  if(ctx.zones[zone].stage!==index)continue;const local=zone===ctx.current,save=ctx.saved[zone];
  const collected=local?s.director.collected:new Set(save?.collected||[]);
  for(const p of local?s.director.points:c.points||[])if(!collected.has(p.id)&&!(p.requires||[]).some(k=>!s.mission.complete(k)))add(zone,p.flag,{...p,label:p.label+(p.who?' · '+(s.party.find(a=>a.id===p.who)?.data.name||p.who):'')});
  (local?s.enemies:(c.guards||[]).map(([x,y],i)=>({x,y,...save?.enemies?.[i]}))).filter(e=>!e.ko&&!e.cinematicOnly).forEach(e=>add(zone,'guards',{x:e.x,y:e.y,kind:'enemy',label:'Libera la zona'}));
  (local?s.crates:(c.crates||[]).map(([x,y,type],i)=>({x,y,type,...save?.crates?.[i]}))).filter(e=>!e.destroyed&&e.type==='cash').forEach(e=>add(zone,'cash',{x:e.x,y:e.y,label:'Recupera il denaro'}));
  const routeIndex=(s.mission.state.route||0)-(c.routeOffset||0),route=c.route?.[routeIndex];if(route)add(zone,'route',{x:route[0],y:route[1],label:'Sentiero · segnale '+(s.mission.state.route+1)});
  if(c.device&&!ctx.controller?.data.flags[c.device.key])add(zone,c.device.key,{...c.device,label:c.device.label+' · Ted'});
  if(c.terminal){const key=index===0?'terminal':'prototype';add(zone,key,{x:c.terminal[0],y:c.terminal[1],label:'Terminale · Ted'});}
  if(c.gate?.[0]>0)add(zone,'exit',{x:c.gate[0],y:c.gate[1],kind:'door',label:c.objectives.find(([k])=>k==='exit')?.[1]||'Prosegui'});
 }
 if(s.facilityController&&index===2)add('escape','loaded',{...FACILITY_VAN,label:'Carica il bottino nel furgone'});
 if(s.zoneController){const v=s.zoneController.vehicle;add(v.zone,'car',{...v,label:'Sali in auto · Spit'});for(const key of ['parked','tuned'])add('workshop',key,{x:PARKING.x+PARKING.w/2,y:PARKING.y+PARKING.h/2,label:'Parcheggia nel forno'});
  // Recover the car if the player got out before reaching the booth or circuit.
  if(s.mission.complete('car')&&!s.zoneController.driving){candidates.splice(0,0,{...v,zone:v.zone,key:'vehicle',kind:'objective',label:'Torna all’auto · Spit'});}
 }
 let target=null;
 const keys=[...(s.zoneController&&s.mission.complete('car')&&!s.zoneController.driving?['vehicle']:[]),...s.mission.config.objectives.filter(([k])=>!s.mission.complete(k)).map(([k])=>k)];
 for(const key of keys){
  if(key==='exit'&&!s.mission.canExit())continue;
  const possible=candidates.filter(p=>p.key===key).map(p=>({...p,path:roomRoute(ctx,p.zone)})).filter(p=>p.path!==null).sort((a,b)=>a.path.length-b.path.length||dist(s.player,a)-dist(s.player,b));
  if(possible.length){const p=possible[0];target=p.path.length?{...p.path[0],kind:'door',label:p.path[0].label,goal:p.label}:p;break;}
 }
 if(!target&&s.mission.canExit()){
  const forward=ctx.doors.find(d=>ctx.zones[d.to].stage>index&&!ctx.blocked(d));if(forward)target={...forward,kind:'door',label:forward.label};
  else {const options=[];for(const [id,z]of Object.entries(ctx.zones)){const path=roomRoute(ctx,id);if(path===null)continue;for(const d of z.doors||[])if(ctx.zones[d.to].stage>index&&!ctx.blocked(d))options.push({path:[...path,d]});}options.sort((a,b)=>a.path.length-b.path.length);if(options[0])target={...options[0].path[0],kind:'door',label:options[0].path[0].label};}
 }
 return {target,doors:ctx.doors.map(d=>({...d,locked:ctx.blocked(d)})),points:candidates.filter(p=>p.zone===ctx.current&&p.key!=='exit'&&p.kind!=='enemy'&&!s.mission.complete(p.key))};
}
/** Walkable breadcrumb route, with actor clearance; never point through a blocked wall. */
export function guidePath(map,from,to){
 if(!to)return [];const clear=(a,b)=>{const n=Math.ceil(dist(a,b)/8);for(let i=1;i<=n;i++)if(map.blocked(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n,18))return false;return true;};
 if(clear(from,to))return [{x:from.x,y:from.y},{x:to.x,y:to.y}];
 const cell=32,queue=[{x:from.x,y:from.y}],parents=[-1],seen=new Set();let end=-1;
 // Seed grid nodes visible from the player to avoid snapping across a wall.
 for(let x=Math.floor(from.x/cell)-1;x<=Math.floor(from.x/cell)+1;x++)for(let y=Math.floor(from.y/cell)-1;y<=Math.floor(from.y/cell)+1;y++){const p={x:x*cell+16,y:y*cell+16};if(!map.blocked(p.x,p.y,18)&&clear(from,p)){seen.add(x+','+y);queue.push(p);parents.push(0);}}
 for(let i=1;i<queue.length&&i<1100;i++){const p=queue[i];if(dist(p,to)<80&&clear(p,to)){end=i;break;}const cx=Math.floor(p.x/cell),cy=Math.floor(p.y/cell);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=cx+dx,y=cy+dy,k=x+','+y,q={x:x*cell+16,y:y*cell+16};if(seen.has(k)||map.blocked(q.x,q.y,18)||!clear(p,q))continue;seen.add(k);queue.push(q);parents.push(i);}}
 if(end<0)return [];const path=[{x:to.x,y:to.y}];for(let i=end;i>=0;i=parents[i])path.unshift(queue[i]);return path;
}

/** Drop breadcrumbs behind the player between route refreshes. */
export function remainingPath(path,position){
 if(path.length<2)return path;let best=Infinity,index=1;
 for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y,q=Math.max(0,Math.min(1,((position.x-a.x)*dx+(position.y-a.y)*dy)/(dx*dx+dy*dy||1))),distance=Math.hypot(position.x-a.x-q*dx,position.y-a.y-q*dy);if(distance<best){best=distance;index=i;}}
 return [{x:position.x,y:position.y},...path.slice(index)];
}
