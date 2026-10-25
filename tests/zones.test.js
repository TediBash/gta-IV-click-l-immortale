import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {ZoneSession,vehicleFits,parkedInside} from '../dist/js/core/ZoneSession.js';
import {workshopConfig,DOORS,PARKING} from '../dist/js/data/zones.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';
const base=MISSIONS[2].chapters[1];
function mapFor(id){const c=workshopConfig(base,id),map=Object.create(GameMap.prototype);Object.assign(map,{width:1280,height:800,obstacles:c.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});return {c,map};}
test('All doors are bidirectional, reachable on foot and accept a car at arrival',()=>{
 for(const id of Object.keys(DOORS)){const {c,map}=mapFor(id),queue=[c.start],seen=new Set();for(let i=0;i<queue.length&&i<4000;i++){const [x,y]=queue[i];for(const [dx,dy]of[[40,0],[-40,0],[0,40],[0,-40]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&!map.blocked(nx,ny,18)){seen.add(k);queue.push([nx,ny]);}}}for(const d of DOORS[id]){assert.ok(DOORS[d.to].some(back=>back.to===id));assert.ok(queue.some(([x,y])=>Math.hypot(x-d.x,y-d.y)<70),id+' door');assert.ok(vehicleFits(mapFor(d.to).map,...d.spawn));}for(const p of c.points)assert.ok(queue.some(([x,y])=>Math.hypot(x-p.x,y-p.y)<70));}
});
test('Vehicle footprint stops at walls; parking requires the whole car and near-zero speed',()=>{
 const {map}=mapFor('workshop');assert.equal(vehicleFits(map,1010,270,Math.PI/2),true);assert.equal(vehicleFits(map,910,270),false);assert.equal(parkedInside({x:1010,y:270,angle:0,speed:0},PARKING),true);assert.equal(parkedInside({x:940,y:270,angle:0,speed:0},PARKING),false);assert.equal(parkedInside({x:1010,y:270,angle:0,speed:30},PARKING),false);
});
test('Zone snapshots keep defeated enemies, collected parts and the vehicle across reloads',()=>{
 const session=new ZoneSession(),scene={mission:{state:{index:1,parts:2,guards:1}},player:{id:'spit'},party:[{id:'spit',x:500,y:500,hp:90,special:44,ko:false}],enemies:[{x:400,y:300,hp:0,ko:true,specialAbility:{energy:0}}],crates:[{destroyed:true,hp:0}],director:{collected:new Set(['engine','wheels'])}};
 session.data.current='depot';session.data.vehicle={zone:'depot',x:1050,y:420,angle:0,owned:true,driving:true,skin:'classic'};session.capture(scene);session.enter('street',[1030,420]);assert.equal(session.data.vehicle.zone,'street');assert.deepEqual(session.data.party.map(p=>[p.x,p.y]),[[1030,420]]);
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};const saves=new SaveManager();saves.save({mission:2,chapter:1,zoneRun:session.data});const restored=new ZoneSession(saves.load().zoneRun);assert.equal(restored.data.zones.depot.enemies[0].ko,true);assert.equal(restored.data.zones.depot.crates[0].destroyed,true);assert.deepEqual(restored.data.zones.depot.collected,['engine','wheels']);assert.equal(restored.data.vehicle.owned,true);assert.equal(restored.data.missionState.parts,2);
});
test('Old mission-two saves start a fresh connected zone without changing other chapters',()=>{const s=new ZoneSession();assert.equal(s.data.current,'street');assert.equal(s.data.vehicle.owned,false);assert.equal(workshopConfig(base,'workshop').points.length,3);assert.equal(workshopConfig(base,'street').guardTarget,base.guards.length);assert.equal(workshopConfig(base,'depot').guards.length,base.guards.length);assert.equal(MISSIONS[2].chapters[2].mode,'race');});
test('The car has a collision-free route from the depot to its exit and from workshop entry into the booth',()=>{
 for(const [id,start,end]of[['depot',[1050,420],[90,650]],['workshop',[620,640],[1010,270]],['street',[1030,420],[300,330]]]){
  const {map}=mapFor(id),queue=[start],seen=new Set([start.join(',')]);let reached=false;
  for(let i=0;i<queue.length&&i<10000;i++){const [x,y]=queue[i];if(Math.hypot(x-end[0],y-end[1])<35){reached=true;break;}for(const [dx,dy]of[[20,0],[-20,0],[0,20],[0,-20]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(!seen.has(key)&&vehicleFits(map,nx,ny,0)){seen.add(key);queue.push([nx,ny]);}}}
  assert.ok(reached,id+' has no vehicle route');
 }
});
