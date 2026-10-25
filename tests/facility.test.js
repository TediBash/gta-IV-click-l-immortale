import test from 'node:test';
import assert from 'node:assert/strict';
import {FACILITY_ZONES,FACILITY_VAN,FACILITY_VOICES,facilityConfig} from '../dist/js/data/facility.js';
import {FacilitySession} from '../dist/js/core/FacilitySession.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {lineById} from '../dist/js/data/voices.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';

function mapFor(id){const z=FACILITY_ZONES[id],m=Object.create(GameMap.prototype);Object.assign(m,{width:1280,height:800,obstacles:z.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});return m;}
test('Six facility zones have reciprocal doors and reachable devices, loot, exits and clear spawns',()=>{
 assert.equal(Object.keys(FACILITY_ZONES).length,6);
 for(const [id,z]of Object.entries(FACILITY_ZONES)){
  const m=mapFor(id),queue=[z.start],seen=new Set([z.start.join(',')]);
  for(let i=0;i<queue.length&&i<4000;i++){const [x,y]=queue[i];for(const [dx,dy]of [[40,0],[-40,0],[0,40],[0,-40]]){const p=[x+dx,y+dy],key=p.join(',');if(!seen.has(key)&&!m.blocked(...p,18)){seen.add(key);queue.push(p);}}}
  const targets=[...z.doors.map(d=>[d.x,d.y]),...z.crates.map(c=>c.slice(0,2)),...(z.device?[[z.device.x,z.device.y]]:[]),...(id==='escape'?[[FACILITY_VAN.x,FACILITY_VAN.y]]:[])];
  for(const [x,y]of targets){assert.equal(m.blocked(x,y,18),false,id+': clear target');assert.ok(queue.some(([px,py])=>Math.hypot(px-x,py-y)<65),id+': reachable target');}
  for(const [x,y]of z.guards)assert.equal(m.blocked(x,y,22),false,id+': enemy spawn');
  for(const d of z.doors){assert.ok(FACILITY_ZONES[d.to].doors.some(back=>back.to===id),'reciprocal '+d.id);for(const offset of [0,44])assert.equal(mapFor(d.to).blocked(d.spawn[0]+offset,d.spawn[1],18),false,'arrival '+d.id);}
 }
});

test('Facility stages have correct aggregate guard targets and only three unique cash crates',()=>{
 assert.equal(Object.values(FACILITY_ZONES).flatMap(z=>z.crates).filter(c=>c[2]==='cash').length,3);
 for(const [id,z]of Object.entries(FACILITY_ZONES))for(let stage=z.stage;stage<3;stage++){
  const c=facilityConfig(MISSIONS[3].chapters[stage],id,stage);assert.equal(c.guardTarget,[7,7,8][stage]);assert.equal(c.enemySpecialReady,z.stage===2);assert.equal(c.terminal,null);assert.equal(c.facilityStage,z.stage);
 }
 for(const line of FACILITY_VOICES)assert.equal(lineById(line.id)?.text,line.text);
});

test('Legacy facility checkpoints preserve their chapter and do not recreate past rewards',()=>{
 for(const chapter of [0,1,2]){
  const session=new FacilitySession(null,chapter);assert.equal(session.data.chapter,chapter);assert.equal(FACILITY_ZONES[session.data.current].stage,chapter);
  for(const [id,z]of Object.entries(FACILITY_ZONES))if(z.stage<chapter){assert.ok(session.data.zones[id].enemies.every(e=>e.ko));assert.ok(session.data.zones[id].crates.every(c=>c.destroyed));}
  assert.equal(!!session.data.flags.terminal,chapter>0);assert.equal(!!session.data.flags.prototype,chapter>1);
 }
});

test('Facility snapshots survive saving and chapter transitions with health, flags and cleared rooms',()=>{
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const session=new FacilitySession(null,0);session.enter('security',[160,650]);session.data.flags.terminal=true;
 const scene={mission:{state:{index:0,guards:7,terminal:true}},player:{id:'ted'},party:[{id:'ted',x:1030,y:440,hp:69,special:18,ko:false}],enemies:[{x:520,y:410,hp:0,ko:true,specialAbility:{energy:0}}],crates:[{hp:0,destroyed:true}]};
 const saves=new SaveManager();saves.save({mission:3,chapter:0,cash:350,facilityRun:session.capture(scene)});
 const restored=new FacilitySession(saves.load().facilityRun,1);assert.equal(restored.data.current,'lab');assert.equal(restored.data.party[0].hp,69);assert.equal(restored.data.party[0].special,18);assert.equal(restored.data.states[0].guards,7);assert.equal(restored.data.zones.security.enemies[0].ko,true);assert.equal(restored.data.zones.security.crates[0].destroyed,true);
 restored.enter('security',[1060,290]);assert.equal(restored.countsCurrentStage,false);restored.enter('server',[160,650]);assert.equal(restored.countsCurrentStage,true);
 assert.equal(session.data.chapter,0,'transition must not mutate saved input');
});
