import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {MissionManager} from '../dist/js/core/MissionManager.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';
import {EventBus} from '../dist/js/core/EventBus.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {RaceProgress,TRACK,trackDistance} from '../dist/js/world/RaceController.js';
import {ENEMY_TYPES} from '../dist/js/data/enemies.js';
import {lineById} from '../dist/js/data/voices.js';

test('Greek discovery, escape and departure each require their own objectives',()=>{
 const m=new MissionManager(new EventBus(),1);m.begin(0);
 m.record('firecracker');m.record('clues');m.record('clues');assert.equal(m.canExit(),false);
 m.record('clues');assert.equal(m.canExit(),true);
 m.begin(1);assert.equal(m.canExit(),false);for(let i=0;i<3;i++)m.record('route');assert.equal(m.canExit(),true);
 m.begin(2);for(let i=0;i<2;i++)m.record('bags');assert.equal(m.canExit(),false);m.record('bags');assert.equal(m.canExit(),true);
});
test('Spit requires the recovered car, all parts and tuning before the race',()=>{
 const m=new MissionManager(new EventBus(),2);m.begin(1);
 for(let i=0;i<m.target('guards');i++)m.record('guards');m.record('car');for(let i=0;i<3;i++)m.record('parts');
 assert.equal(m.canExit(),false);m.record('tuned');assert.equal(m.canExit(),true);
 m.begin(2);m.record('laps');m.record('laps');assert.equal(m.canExit(),false);m.record('won');assert.equal(m.canExit(),true);
});
test('Race rejects repeated finish crossings and requires all ordered checkpoints',()=>{
 const race=new RaceProgress();for(let i=0;i<20;i++)race.visit(...TRACK[0]);assert.equal(race.laps,0);
 for(let i=0;i<2;i++){for(const p of TRACK.slice(1))race.visit(...p);race.visit(...TRACK[0]);assert.equal(race.laps,i+1);}
 assert.equal(race.finished,true);assert.equal(trackDistance(600,650),0);assert.ok(trackDistance(600,400)>65);
});
test('Old Mission 03 checkpoints migrate and new mission IDs survive reload',()=>{
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 const store=new SaveManager();data.set('gtaclick.save.v1',JSON.stringify({version:1,chapter:1,cash:600,equipment:{ted:{GIOIELLO:'controller'}}}));
 const old=store.load();assert.equal(old.mission,3);assert.equal(old.cash,600);assert.equal(old.equipment.ted.GIOIELLO,'controller');
 store.save({...old,mission:2,chapter:2});assert.equal(store.load().mission,2);
 store.markComplete(1);store.markComplete(1);store.markComplete(2);assert.deepEqual(store.completed(),[1,2]);
 data.set('gtaclick.save.v1',JSON.stringify({version:2,mission:99,chapter:1}));assert.equal(store.load(),null);
});
test('Every mission interaction has a reachable approach and a valid voice / party role',()=>{
 for(const mission of Object.values(MISSIONS))for(const c of mission.chapters){
  const map=Object.create(GameMap.prototype);map.width=1280;map.height=800;map.obstacles=c.obstacles.map(([x,y,w,h])=>({x,y,w,h}));
  assert.equal(map.blocked(...c.start),false,c.name+' start');
  const start=[Math.floor(c.start[0]/40),Math.floor(c.start[1]/40)],q=[start],seen=new Set([start.join(',')]);
  for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const p=[x+dx,y+dy],key=p.join(',');if(!seen.has(key)&&!map.blocked(p[0]*40+20,p[1]*40+20,18)){seen.add(key);q.push(p);}}}
  for(const [x,y]of[c.gate,...(c.route||[]),...(c.points||[]).map(p=>[p.x,p.y]),...(c.terminal?[c.terminal]:[])])assert.ok(q.some(([gx,gy])=>Math.hypot(gx*40+20-x,gy*40+20-y)<65),c.name+' unreachable '+x+','+y);
  for(const p of c.points||[]){if(p.who)assert.ok(mission.party.includes(p.who));if(p.voice)assert.ok(lineById(p.voice),p.voice);for(const key of p.requires||[])assert.ok(c.objectives.some(([k])=>k===key));}
 }
});
test('Melee line of sight prevents attacks through solid walls',()=>{
 const map=Object.create(GameMap.prototype);map.width=400;map.height=400;map.obstacles=[{x:160,y:80,w:40,h:180}];
 assert.equal(map.clearLine(140,160,220,160),false);assert.equal(map.clearLine(140,300,220,300),true);
});
test('Enemy roles have distinct strengths and enough telegraph time to react',()=>{
 assert.ok(ENEMY_TYPES.bruiser.hp>ENEMY_TYPES.guard.hp);assert.ok(ENEMY_TYPES.bruiser.speed<ENEMY_TYPES.guard.speed);
 assert.ok(ENEMY_TYPES.technician.speed>ENEMY_TYPES.guard.speed);assert.ok(ENEMY_TYPES.technician.hp<ENEMY_TYPES.guard.hp);
 assert.ok(ENEMY_TYPES.captain.hp>ENEMY_TYPES.bruiser.hp);assert.ok(Object.values(ENEMY_TYPES).every(e=>e.windup>=300&&e.recovery>e.windup));
});

test('Villa delivery requires the right characters and all preparation before hiding Click',async()=>{
 const {canUsePoint}=await import('../dist/js/world/ChapterDirector.js');
 const m=new MissionManager(new EventBus(),4);m.begin(0);const scene={mission:m,player:{id:'click'}},hide=m.config.points.find(p=>p.action==='hide'),entry=m.config.points.find(p=>p.flag==='access');
 assert.equal(canUsePoint(scene,hide),false);m.record('papers');m.record('ready');assert.equal(canUsePoint(scene,hide),true);
 scene.player.id='andy';assert.equal(canUsePoint(scene,hide),false);assert.equal(canUsePoint(scene,entry),false);m.record('hidden');assert.equal(canUsePoint(scene,entry),true);assert.equal(m.canExit(),false);m.record('access');assert.equal(m.canExit(),true);
 m.begin(1);m.record('key');m.record('dossier');m.record('cash');for(let i=0;i<m.target('guards');i++)m.record('guards');assert.equal(m.canExit(),false);m.record('cash');assert.equal(m.canExit(),true);
 m.begin(2);for(let i=0;i<m.target('guards');i++)m.record('guards');m.record('gateKey');assert.equal(m.canExit(),false);m.record('escapeCar');assert.equal(m.canExit(),true);
});
test('Sewer valves, alligator and pizza reinforcement each gate their chapter',()=>{
 const m=new MissionManager(new EventBus(),5);m.begin(0);m.record('map');m.record('valves');for(let i=0;i<m.target('guards');i++)m.record('guards');assert.equal(m.canExit(),false);m.record('valves');assert.equal(m.canExit(),true);
 m.begin(1);for(let i=0;i<m.target('guards');i++)m.record('guards');assert.equal(m.canExit(),false);m.record('routeKey');assert.equal(m.canExit(),true);
 m.begin(2);for(let i=0;i<m.target('guards')-1;i++)m.record('guards');m.record('pizzaHit');m.record('address');assert.equal(m.canExit(),false);assert.equal(m.target('guards'),m.config.guards.length+1);m.record('guards');assert.equal(m.canExit(),true);
});
test('New mission checkpoints load without changing the old saved-game key',()=>{
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};const save=new SaveManager();
 for(const mission of [4,5]){save.save({mission,chapter:2,cash:123});assert.equal(save.load().mission,mission);assert.equal(save.load().cash,123);}
 save.save({mission:5,chapter:3});assert.equal(save.load(),null);
});
test('World skins cover every crate, point, building and furniture reference',async()=>{
 const {PROP_SKINS,ENV_SKINS,DETAIL_SKINS,CELEBRATION_SKINS,pointSkin}=await import('../dist/js/data/skins.js');
 for(const mission of Object.values(MISSIONS))for(const c of mission.chapters){
  for(const [,,skin] of c.crates)assert.ok(PROP_SKINS.includes(skin),skin);
  for(const point of c.points||[])assert.ok([...PROP_SKINS,...DETAIL_SKINS,...CELEBRATION_SKINS].includes(pointSkin(point)),point.id);
  for(const [skin]of c.furniture||[])assert.ok(PROP_SKINS.includes(skin),skin);
  for(const skin of c.buildingSkins||[])if(skin)assert.ok(ENV_SKINS.includes(skin),skin);
  for(const [,,,,skin]of c.rooms||[])assert.ok(ENV_SKINS.includes(skin),skin);
 }
});
test('Atlas registration covers odd-sized image edges without overlapping frames',async()=>{
 const {addGridFrames}=await import('../dist/js/data/skins.js');const frames=[];
 const scene={textures:{get:()=>({source:[{width:1774,height:887}],add:(...args)=>frames.push(args)})}};
 addGridFrames(scene,'environment',['a','b','c','d','e','f','g','h'],4,2);
 for(let i=0;i<4;i++){assert.equal(frames[i][3]+frames[i][5],frames[i+4][3]);assert.equal(frames[i+4][3]+frames[i+4][5],887);}
 for(let row=0;row<2;row++)for(let col=0;col<3;col++)assert.equal(frames[row*4+col][2]+frames[row*4+col][4],frames[row*4+col+1][2]);
 assert.equal(frames[7][2]+frames[7][4],1774);
});
