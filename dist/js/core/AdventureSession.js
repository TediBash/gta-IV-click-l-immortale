import {ADVENTURE_ZONES,ADVENTURE_START} from '../data/adventures.js';
import {copy} from './ZoneSession.js';
export class AdventureSession{
 constructor(saved,mission,chapter){
  this.zones=ADVENTURE_ZONES[mission];const valid=saved?.version===1&&saved.mission===mission&&this.zones[saved.current]&&saved.zones&&saved.states&&Array.isArray(saved.party);
  this.data=valid?copy(saved):{version:1,mission,chapter,current:ADVENTURE_START[mission][chapter],states:{},zones:{},party:[],activeId:'click',flags:{explosion:mission===1&&chapter>1},vehicle:{zone:'forecourt',x:490,y:570,angle:0,riding:false}};
  if(!valid&&chapter>0)for(const [id,z]of Object.entries(this.zones))if(z.stage<chapter)this.data.zones[id]={enemies:(z.guards||[]).map(([x,y])=>({x,y,hp:0,ko:true,energy:0})),crates:(z.crates||[]).map(()=>({destroyed:true,hp:0})),collected:(z.points||[]).map(p=>p.ref)};
  if(mission===5&&chapter>1)this.data.flags.alligatorDown=true;
  if(mission===4&&chapter>0){this.data.vehicle.riding=false;this.data.party.forEach(p=>p.hidden=false);}
  if(this.data.chapter!==chapter){this.data.chapter=chapter;this.enter(ADVENTURE_START[mission][chapter],this.zones[ADVENTURE_START[mission][chapter]].start);}
  if(this.zones[this.data.current].stage>chapter)this.enter(ADVENTURE_START[mission][chapter],this.zones[ADVENTURE_START[mission][chapter]].start);
 }
 capture(s){
  const d=this.data;d.states[d.chapter]=copy(s.mission.state);d.activeId=s.player.id;
  const present=new Set(s.party.map(p=>p.id));d.party=[...d.party.filter(p=>!present.has(p.id)),...s.party.map(p=>({id:p.id,hp:p.hp,special:p.special,ko:p.ko,hidden:!!p.hidden,x:p.x,y:p.y}))];
  d.zones[d.current]={enemies:s.enemies.filter(e=>!e.cinematicOnly).map(e=>({x:e.x,y:e.y,hp:e.hp,ko:e.ko,energy:e.specialAbility.energy,specialState:e.specialAbility.snapshot?.(),bossRage:!!e.specialAbility.rage?.completed,charges:e.specialAbility.charge?.completed??0})),crates:s.crates.map(c=>({destroyed:c.destroyed,hp:c.hp})),collected:[...s.director.collected],exposure:s.director.exposure,searchlight:s.director.helicopters?.snapshot()||null};
  if(s.director.car&&s.director.riding)Object.assign(d.vehicle,{zone:d.current,x:s.director.car.x,y:s.director.car.y,angle:Number.isFinite(s.director.car.rotation)?s.director.car.rotation:0,riding:true});
  return copy(d);
 }
 enter(id,spawn){
  this.data.current=id;const positions=zoneArrivals(this.zones[id],spawn,this.data.party.length);this.data.party.forEach((p,i)=>{p.x=positions[i][0];p.y=positions[i][1];});
  if(this.data.vehicle.riding)Object.assign(this.data.vehicle,{zone:id,x:spawn[0]+70,y:spawn[1]-60});
 }
 has(key){return !!this.data.flags[key]||Object.values(this.data.zones).some(z=>z.collected?.includes(key))||Object.values(this.data.states).some(s=>s[key]===true);}
 get countsCurrentStage(){return this.zones[this.data.current].stage===this.data.chapter;}
}

export function zoneArrivals(zone,spawn,count){
 const points=[];for(let r=0;r<18&&points.length<count;r++)for(let dx=-r;dx<=r&&points.length<count;dx++)for(let dy=-r;dy<=r&&points.length<count;dy++){
  if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=spawn[0]+dx*44,y=spawn[1]+dy*44;
  if(x<42||x>1238||y<57||y>763||zone.obstacles.some(([bx,by,w,h])=>Math.hypot(x-Math.max(bx,Math.min(x,bx+w)),y-Math.max(by,Math.min(y,by+h)))<20))continue;
  points.push([x,y]);
 }if(points.length<count)throw new Error('No safe party arrival');return points;
}
