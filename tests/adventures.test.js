import test from 'node:test';
import assert from 'node:assert/strict';
import {ADVENTURE_ZONES,ADVENTURE_START,ADVENTURE_VOICES,adventureConfig} from '../dist/js/data/adventures.js';
import {AdventureSession} from '../dist/js/core/AdventureSession.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {lineById} from '../dist/js/data/voices.js';
const mapFor=z=>Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:z.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});

test('Fifty-four connected zones have reciprocal reachable doors, items, routes and safe arrivals',()=>{
 assert.equal(Object.values(ADVENTURE_ZONES).reduce((n,z)=>n+Object.keys(z).length,0),54);
 for(const [mission,zones]of Object.entries(ADVENTURE_ZONES))for(const [id,z]of Object.entries(zones)){
  const m=mapFor(z),queue=[z.start],seen=new Set([z.start.join(',')]);
  for(let i=0;i<queue.length&&i<4000;i++){const [x,y]=queue[i];for(const [dx,dy]of [[40,0],[-40,0],[0,40],[0,-40]]){const p=[x+dx,y+dy],key=p.join(',');if(!seen.has(key)&&!m.blocked(...p,18)){seen.add(key);queue.push(p);}}}
  const targets=[...z.doors,...(z.points||[])].map(p=>[p.x,p.y]).concat((z.crates||[]).map(c=>c.slice(0,2)),z.route||[],z.gate?[z.gate]:[]);
  for(const [x,y]of targets){assert.equal(m.blocked(x,y,18),false,id+': clear target '+x+','+y);assert.ok(queue.some(([px,py])=>Math.hypot(px-x,py-y)<65),id+': reachable target');}
  for(const [x,y]of z.guards||[])assert.equal(m.blocked(x,y,22),false,id+': enemy spawn');
  for(const d of z.doors){assert.ok(zones[d.to].doors.some(back=>back.to===id),'reciprocal '+d.id);for(const offset of [0,44,88])assert.equal(mapFor(zones[d.to]).blocked(d.spawn[0]+offset,d.spawn[1],18),false,'arrival '+d.id);}
  const config=adventureConfig(MISSIONS[mission],id,z.stage);for(const p of config.points){assert.ok(p.id,id+': unknown point');if(p.who)assert.ok(MISSIONS[mission].party.includes(p.who));}
 }
});
test('Greek clues, ordered escape and luggage are unique; villa objectives span their rooms',()=>{
 const greek=Object.values(ADVENTURE_ZONES[1]);assert.deepEqual(greek.flatMap(z=>(z.points||[]).map(p=>p.ref)).sort(),['bag','depot','fence','footprints','map','photo','story']);assert.ok(greek.filter(z=>z.stage!==1).every(z=>!z.guards?.length));assert.ok(greek.filter(z=>z.stage===1).every(z=>z.guards.every(g=>g[2]==='soldier')));
 const routes=greek.filter(z=>z.route);assert.equal(routes.reduce((n,z)=>n+z.route.length,0),3);assert.deepEqual(routes.map(z=>z.routeOffset),[0,2]);
 for(const [id,z]of Object.entries(ADVENTURE_ZONES[4])){const c=adventureConfig(MISSIONS[4],id,z.stage);assert.equal(c.guardTarget,[0,6,7][z.stage]);assert.equal(c.enemySpecialReady,z.stage===2);}
 assert.equal(Object.values(ADVENTURE_ZONES[4]).flatMap(z=>z.crates||[]).filter(c=>c[2]==='cash').length,2);
 for(const line of ADVENTURE_VOICES)assert.equal(lineById(line.id)?.text,line.text);
});
test('Legacy checkpoints stay in their chapter and consume earlier items without duplicate rewards',()=>{
 for(const mission of [1,4,5,6,7,8,9,10])for(const chapter of MISSIONS[mission].chapters.map((_,i)=>i)){
  const session=new AdventureSession(null,mission,chapter);assert.equal(session.data.current,ADVENTURE_START[mission][chapter]);
  for(const [id,z]of Object.entries(ADVENTURE_ZONES[mission]))if(z.stage<chapter){assert.ok(session.data.zones[id].enemies.every(e=>e.ko));assert.ok(session.data.zones[id].crates.every(c=>c.destroyed));assert.deepEqual(session.data.zones[id].collected,(z.points||[]).map(p=>p.ref));}
  assert.ok(session.data.party.every(p=>!p.hidden));
 }
 const greek=new AdventureSession(new AdventureSession(null,4,0).data,1,0);assert.equal(greek.data.mission,1);assert.equal(greek.data.current,'village');
});
test('Hidden passengers and car survive reload; entering the villa reveals them and preserves health',()=>{
 const session=new AdventureSession(null,4,0);const data=session.data;data.current='gatehouse';data.party=[{id:'click',hp:70,special:40,hidden:true,x:300,y:500},{id:'andy',hp:90,special:10,hidden:false,x:400,y:500}];data.vehicle={zone:'gatehouse',x:300,y:500,angle:1,riding:true};data.activeId='andy';data.zones.gatehouse={collected:['entry'],enemies:[],crates:[]};
 const reload=new AdventureSession(JSON.parse(JSON.stringify(data)),4,0);assert.equal(reload.data.party[0].hidden,true);assert.equal(reload.data.vehicle.riding,true);assert.equal(reload.data.vehicle.angle,1);assert.equal(reload.has('entry'),true);
 const interior=new AdventureSession(reload.data,4,1);assert.equal(interior.data.current,'hall');assert.ok(interior.data.party.every(p=>!p.hidden));assert.equal(interior.data.party[0].hp,70);assert.equal(interior.data.vehicle.riding,false);assert.equal(reload.data.party[0].hidden,true);
});
