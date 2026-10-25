import test from 'node:test';
import assert from 'node:assert/strict';
import {navigationState,navigationContext,guidePath,roomRoute,remainingPath} from '../dist/js/world/NavigationModel.js';
import {scaleConfig} from '../dist/js/world/DifficultyEncounters.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {MissionManager} from '../dist/js/core/MissionManager.js';
import {AdventureController} from '../dist/js/world/AdventureController.js';
import {ADVENTURE_ZONES,ADVENTURE_START,adventureConfig} from '../dist/js/data/adventures.js';
import {FACILITY_ZONES,FACILITY_START,facilityConfig} from '../dist/js/data/facility.js';
import {DOORS,workshopConfig} from '../dist/js/data/zones.js';
import {GameMap} from '../dist/js/world/GameMap.js';
function scene(id,index,difficulty='easy'){
 const mission=new MissionManager({emit(){}},id);mission.begin(index);
 const s={app:{progress:{difficulty}},mission,player:{x:160,y:650},party:[],enemies:[],crates:[],director:{points:[],collected:new Set()},gate:{x:-500,y:-500}};
 const type=id===3?'facility':id===2&&index===1?'zone':ADVENTURE_ZONES[id]?'adventure':null;
 const zones=type==='adventure'?ADVENTURE_ZONES[id]:type==='facility'?FACILITY_ZONES:type==='zone'?DOORS:null;
 const data={mission:id,zones:{},flags:{},vehicle:{zone:'depot',x:1050,y:420,driving:false}};
 const c={scene:s,data,session:{has(key){return s.mission.state[key]===true||data.flags[key]||Object.values(data.zones).some(z=>z.collected?.includes(key));}},zone:type==='adventure'?ADVENTURE_START[id][index]:type==='facility'?FACILITY_START[index]:type==='zone'?'street':'local'};
 if(type==='adventure'){s.adventureController=c;c.blocked=d=>AdventureController.prototype.blocked.call(c,d);}
 if(type==='facility')s.facilityController=c;
 if(type==='zone'){s.zoneController=c;c.vehicle=data.vehicle;Object.defineProperty(c,'driving',{get:()=>data.vehicle.driving});}
 const enter=zone=>{c.zone=zone;data.current=zone;c.doors=type==='zone'?DOORS[zone]:zones?.[zone]?.doors||[];const config=type==='adventure'?adventureConfig(MISSIONS[id],zone,index,difficulty):type==='facility'?facilityConfig(MISSIONS[id].chapters[index],zone,index,difficulty):type==='zone'?workshopConfig(MISSIONS[id].chapters[index],zone,difficulty):scaleConfig(MISSIONS[id].chapters[index],difficulty);mission.override=config;
  const save=data.zones[zone];s.enemies=(config.guards||[]).map(([x,y],i)=>({x,y,...save?.enemies?.[i]}));s.crates=(config.crates||[]).map(([x,y,type],i)=>({x,y,type,...save?.crates?.[i]}));s.director={points:config.points||[],collected:new Set(save?.collected||[])};s.gate={x:config.gate[0],y:config.gate[1]};s.player.x=config.start[0];s.player.y=config.start[1];s.map=Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:config.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});};
 const save=()=>{data.zones[c.zone]={enemies:s.enemies.map(e=>({...e})),crates:s.crates.map(e=>({...e})),collected:[...s.director.collected]};};
 enter(c.zone);return {s,c,enter,save};
}
test('Guide resolves a valid next action through every non-race chapter, including room backtracking',()=>{
 for(const difficulty of ['easy','normal','hard','extreme'])for(const m of Object.values(MISSIONS))for(let index=0;index<m.chapters.length;index++){
  if(m.chapters[index].mode==='race')continue;const {s,c,enter,save}=scene(m.id,index,difficulty);let finished=false;
  for(let step=0;step<140&&!finished;step++){
   save();const state=navigationState(s),t=state.target,where=`${difficulty} mission ${m.id}/${index} room ${c.zone} step ${step}`;assert.ok(t,where+' has a target');assert.ok(Number.isFinite(t.x)&&Number.isFinite(t.y),where);
   const path=guidePath(s.map,s.player,t);assert.ok(path.length>1,where+' target has a walkable path: '+t.label);
   const d=c.doors.find(d=>d.id===t.id);if(d){assert.equal(state.doors.find(v=>v.id===d.id).locked,false,where+' never selects a locked door');const next=navigationContext(s).zones[d.to];if(next.stage>s.mission.state.index){assert.equal(s.mission.canExit(),true);finished=true;}else enter(d.to);continue;}
   s.player.x=t.x;s.player.y=t.y;
   if(t.key==='guards'){const e=s.enemies.find(e=>!e.ko&&e.x===t.x&&e.y===t.y);assert.ok(e,where+' enemy');e.ko=true;s.mission.record('guards');if(m.id===5&&index===1&&c.zone==='collector')c.data.flags.alligatorDown=true;}
   else if(t.key==='cash'){const box=s.crates.find(e=>e.x===t.x&&e.y===t.y&&!e.destroyed);assert.ok(box);box.destroyed=true;s.mission.record('cash');}
   else if(t.id){const p=s.director.points.find(p=>p.id===t.id);assert.ok(p,where+' point');assert.ok((p.requires||[]).every(k=>s.mission.complete(k)));s.director.collected.add(p.id);s.mission.record(p.flag);if(p.action==='pizza')s.mission.record('guards');}
   else if(['car','vehicle'].includes(t.key)){c.vehicle.driving=true;c.vehicle.zone=c.zone;if(t.key==='car')s.mission.record('car');}
   else if(t.key==='parked'||t.key==='tuned'){s.mission.record('parked');s.mission.record('tuned');}
   else if(t.key==='exit'){assert.ok(s.mission.canExit(),where);finished=true;}
   else {s.mission.record(t.key);c.data.flags[t.key]=true;}
  }
  assert.equal(finished,true,`mission ${m.id}/${index} finished`);
 }
});
test('Map and world share all workshop doors, selected passage and live player coordinates',()=>{
 const {s}=scene(2,1),state=navigationState(s);assert.equal(state.doors.length,2);assert.equal(state.target.id,'workshop-in');assert.equal(state.target.kind,'door');assert.match(state.target.goal,/spit/i);
});
test('Path routes around walls, uses actor clearance and never fabricates a route across a sealed wall',()=>{
 const map=Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:[{x:400,y:160,w:100,h:400}]});
 const path=guidePath(map,{x:300,y:350},{x:650,y:350});assert.ok(path.length>4);for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let t=0;t<=1;t+=.05)assert.equal(map.blocked(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,18),false);}
 map.obstacles=[{x:400,y:0,w:100,h:800}];assert.deepEqual(guidePath(map,{x:300,y:350},{x:650,y:350}),[]);
});
test('Collected loot disappears and guide redirects to another room; locked future stages stay locked',()=>{
 const {s,enter,save}=scene(8,0);let t=navigationState(s).target;assert.equal(t.id,'part0');s.director.collected.add('part0');s.mission.record('parts');save();t=navigationState(s).target;assert.equal(t.id,'store-in');assert.ok(navigationState(s).doors.find(d=>d.id==='range-in').locked);
 enter('store');for(const p of s.director.points){s.director.collected.add(p.id);s.mission.record(p.flag);}save();t=navigationState(s).target;assert.equal(t.id,'workshop-out');enter('workshop');assert.equal(navigationState(s).target.id,'bench');assert.ok(!navigationState(s).points.some(p=>p.id==='part0'));
});
test('Race guidance selects the next checkpoint; hideout does not retain mission targets',()=>{const {s}=scene(2,0);s.race={progress:{next:2}};assert.deepEqual([navigationState(s).target.x,navigationState(s).target.y],[1130,550]);s.isHideout=true;assert.equal(navigationState(s).target,null);});

test('Cached breadcrumbs ahead of the player never point back to a passed corner',()=>{const path=[{x:100,y:100},{x:132,y:100},{x:164,y:100},{x:196,y:100},{x:196,y:164}];assert.deepEqual(remainingPath(path,{x:178,y:100})[1],{x:196,y:100});});
