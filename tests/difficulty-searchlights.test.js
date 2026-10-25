import test from 'node:test';
import assert from 'node:assert/strict';
import {SearchlightAlert,HelicopterSearch} from '../dist/js/world/HelicopterSearch.js';
import {scaleGuards,enemyCount,scaleConfig} from '../dist/js/world/DifficultyEncounters.js';
import {DIFFICULTIES} from '../dist/js/data/characters.js';
import {ENEMY_TYPES} from '../dist/js/data/enemies.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {ADVENTURE_ZONES,adventureConfig} from '../dist/js/data/adventures.js';
import {FACILITY_ZONES,facilityConfig} from '../dist/js/data/facility.js';
import {DOORS,workshopConfig} from '../dist/js/data/zones.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {AdventureController} from '../dist/js/world/AdventureController.js';
import {PortalView} from '../dist/js/world/PortalView.js';
const mapFor=c=>Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:c.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});
test('Four difficulty levels multiply encounters exactly, round Extreme up and keep bosses unique',()=>{
 const base={name:'test',start:[160,650],obstacles:[],guards:[[600,300,'captain'],[800,500,'guard'],[1000,300,'technician']]};
 for(const [key,n]of [['easy',3],['normal',6],['hard',9],['extreme',14]]){const guards=scaleGuards(base.guards,base,key);assert.equal(guards.length,n);assert.deepEqual(guards.slice(0,3),base.guards);assert.equal(guards.filter(g=>g[2]==='captain').length,1);assert.deepEqual(scaleGuards(base.guards,base,key),guards);}
 assert.equal(DIFFICULTIES.extreme.multiplier,2);assert.equal(enemyCount(0,'extreme'),0);assert.equal(enemyCount(2,'extreme'),9);
});
test('Every scaled chapter/zone has collision-free, separated reinforcements and exact guard objective totals',()=>{
 const check=(c,base,difficulty)=>{assert.equal(c.guards.length,enemyCount(base.guards.length,difficulty),c.name);const map=mapFor(c);for(const [x,y]of c.guards.slice(base.guards.length))assert.equal(map.blocked(x,y,23),false,c.name+' blocked reinforcement');for(let i=base.guards.length;i<c.guards.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(c.guards[i][0]-c.guards[j][0],c.guards[i][1]-c.guards[j][1])>=44);};
 for(const difficulty of Object.keys(DIFFICULTIES)){
  for(const m of Object.values(MISSIONS))for(const c of m.chapters)check(scaleConfig(c,difficulty),c,difficulty);
  for(const [id,zones]of Object.entries(ADVENTURE_ZONES))for(const [zone,z]of Object.entries(zones)){const c=adventureConfig(MISSIONS[id],zone,z.stage,difficulty),base=adventureConfig(MISSIONS[id],zone,z.stage);check(c,base,difficulty);assert.equal(c.guardTarget,Object.values(zones).filter(v=>v.stage===z.stage).reduce((sum,v)=>sum+enemyCount((v.guards||[]).length,difficulty),0));}
  for(const [id,z]of Object.entries(FACILITY_ZONES)){const c=facilityConfig(MISSIONS[3].chapters[z.stage],id,z.stage,difficulty);check(c,facilityConfig(MISSIONS[3].chapters[z.stage],id,z.stage),difficulty);assert.equal(c.guardTarget,Object.values(FACILITY_ZONES).filter(v=>v.stage===z.stage).reduce((n,v)=>n+enemyCount(v.guards.length,difficulty),0));}
  for(const id of Object.keys(DOORS)){const base=MISSIONS[2].chapters[1],c=workshopConfig(base,id,difficulty);check(c,workshopConfig(base,id),difficulty);assert.equal(c.guardTarget,enemyCount(base.guards.length,difficulty));}
 }
});
test('Helicopter detection locks immediately; three uninterrupted seconds outside all circles reopen it',()=>{
 const state=new SearchlightAlert([[500,400,0,0],[950,500,0,0]]);let now=0;
 const advance=(ms,p)=>{for(let t=0;t<ms;t+=20){now+=20;state.update(.02,now,p);}};
 advance(20,{x:500,y:400});assert.ok(state.alert);assert.equal(state.outsideMs,0);advance(2980,{x:100,y:700});assert.ok(state.alert);assert.ok(Math.abs(state.remaining-.02)<1e-9);
 // Another spotlight resets the entire continuous escape interval.
 advance(20,{x:state.lights[1].x,y:state.lights[1].y});assert.ok(state.alert);assert.equal(state.outsideMs,0);
 advance(2980,{x:100,y:700});assert.ok(state.alert);advance(20,{x:100,y:700});assert.equal(state.alert,false);
});
test('Searchlights track nearby characters at a bounded, escapable speed and detection matches the drawn radius',()=>{
 const state=new SearchlightAlert([[500,400,0,0]]),l=state.lights[0],before={x:l.x,y:l.y};state.update(.04,0,{x:650,y:400});assert.ok(l.x>before.x);assert.ok(Math.hypot(l.x-before.x,l.y-before.y)<=52*.04+.001);assert.equal(state.contains({x:l.x+75,y:l.y}),true);assert.equal(state.contains({x:l.x+75.1,y:l.y}),false);
});
test('Pause/reload cannot elapse the alarm: remaining interval and helicopter positions persist',()=>{
 const state=new SearchlightAlert([[500,400,0,0]]);state.update(.02,20,{x:500,y:400});for(let i=0;i<60;i++)state.update(.02,40+i*20,{x:100,y:700});const saved=state.snapshot(),restored=new SearchlightAlert([[500,400,0,0]],saved);assert.equal(restored.alert,true);assert.equal(restored.outsideMs,1200);assert.deepEqual(restored.snapshot(),saved);
 restored.update(0,99999,{x:100,y:700});assert.equal(restored.outsideMs,1200);for(let i=0;i<89;i++)restored.update(.02,100000+i*20,{x:100,y:700});assert.ok(restored.alert);restored.update(.02,102000,{x:100,y:700});assert.equal(restored.alert,false);
});
test('Alarm blocks every room exit even after objectives, and provides safe guidance',()=>{
 const state=new SearchlightAlert([[500,400,0,0]]);state.update(.02,0,{x:500,y:400});const h=Object.create(HelicopterSearch.prototype);h.state=state;
 const scene={director:{helicopters:h},mission:{state:{index:1},canExit:()=>true}},controller={scene,data:{mission:1},session:{has:()=>true}};
 for(const door of ADVENTURE_ZONES[1].coast.doors)assert.match(AdventureController.prototype.blocked.call(controller,door),/ALLARME/);
 const goal=h.guidance({x:500,y:400},mapFor({obstacles:[]}));assert.equal(state.contains(goal),false);
});
test('Military patrols only inhabit the chase and post-firecracker reinforcements; their visual profile is distinct',()=>{
 assert.equal(ENEMY_TYPES.soldier.military,true);assert.ok(ADVENTURE_ZONES[1].base.pursuers.length);assert.equal(ADVENTURE_ZONES[1].base.guards,undefined);for(const z of [ADVENTURE_ZONES[1].ridge,ADVENTURE_ZONES[1].coast])assert.ok(z.guards.every(g=>g[2]==='soldier'));
});
test('Vortex portal animates normally, stays static with reduced motion and uses red for alarm',()=>{
 let calls=[];const view=()=>{let p;p=new Proxy({},{get:(_,k)=>(...args)=>{calls.push([k,...args]);return p;}});return p;};const s={app:{settings:{reduceMotion:false}},add:{graphics:view,text:view}},v=new PortalView(s,{x:500,y:500,label:'USCITA'});
 calls=[];v.render(0);const first=JSON.stringify(calls);calls=[];v.render(500);assert.notEqual(JSON.stringify(calls),first);s.app.settings.reduceMotion=true;calls=[];v.render(500);assert.ok(calls.length);calls=[];v.render(1000);assert.equal(calls.length,0);calls=[];v.update(true,false,true);v.render(0);assert.ok(calls.some(c=>c[0]==='lineStyle'&&c[2]===0xff515c));
});
