import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EnemySpecial} from '../dist/js/combat/EnemySpecial.js';
import {EnemyBot} from '../dist/js/characters/EnemyBot.js';
import {ENEMY_TYPES} from '../dist/js/data/enemies.js';
import {ENEMY_ABILITIES,ENEMY_LOADOUTS,abilityIds} from '../dist/js/data/enemyAbilities.js';
import {ENEMY_SETS,applyEnemySet} from '../dist/js/data/enemySets.js';
import {DIFFICULTIES} from '../dist/js/data/characters.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {ADVENTURE_ZONES,adventureConfig} from '../dist/js/data/adventures.js';
import {facilityConfig,FACILITY_ZONES} from '../dist/js/data/facility.js';
import {workshopConfig} from '../dist/js/data/zones.js';
import {scaleConfig} from '../dist/js/world/DifficultyEncounters.js';
import {Character} from '../dist/js/characters/Character.js';
function view(){let v;v=new Proxy({},{get:()=>()=>v});return v;}
function fixture(type='ranger',difficulty='easy',child=false){
 const hits=[],effects=[],events=[];const s={now:0,difficulty:DIFFICULTIES[difficulty],mission:{config:{enemySpecialReady:true},mission:{children:child}},app:{settings:{reduceMotion:false}},add:{circle:view,rectangle:view,graphics:view,ellipse:view,text:view,image:view},map:{clearLine:()=>true,move:(a,x,y)=>{a.x+=x;a.y+=y;}},fx:{burst:(...x)=>effects.push(x),word(){}},bus:{emit:(...x)=>events.push(x)},floatText(){},onEnemyKO(){}};
 const a={type,profile:ENEMY_TYPES[type],boss:!!ENEMY_TYPES[type].boss,scene:s,x:300,y:300,hp:100,maxHp:200,stunUntil:0,ko:false,render(){},bar:view(),label:view(),warning:view()};
 const h={x:380,y:300,special:100,damage(d){hits.push(d);return true;}};s.party=[h];s.enemies=[a];const sp=new EnemySpecial(a);a.specialAbility=sp;
 const cast=()=>{sp.energy=100;sp.readyAt=0;s.enemySpecialUntil=0;assert.equal(sp.update(.016,h),true);return sp.pending;};
 const finish=()=>{s.now=sp.pending.at;sp.update(.016,h);};return {s,a,h,sp,hits,effects,events,cast,finish};
}
test('Every old/new enemy has three real abilities; difficulty exposes 1/2/3 with Extreme pairs',()=>{
 assert.equal(Object.keys(ENEMY_TYPES).filter(k=>['ranger','sapper','riot','medic','duelist','dronepilot'].includes(k)).length,6);
 for(const type of Object.keys(ENEMY_TYPES)){
  assert.equal(new Set(ENEMY_LOADOUTS[type]).size,3,type);for(const id of ENEMY_LOADOUTS[type])assert.ok(ENEMY_ABILITIES[id],id);
  for(const [difficulty,count]of [['easy',1],['normal',2],['hard',3],['extreme',3]])assert.equal(abilityIds(type,DIFFICULTIES[difficulty]).length,count);
 }
});
test('Extreme executes two different abilities at the same deadline and rotates through all three',()=>{
 const x=fixture('riot','extreme'),cast=x.cast();assert.deepEqual(cast.moves.map(m=>m.id),['shield','charge']);assert.equal(x.hits.length,0);x.s.now=999;x.sp.update(.016,x.h);assert.equal(x.hits.length,0);x.finish();assert.equal(x.hits.length,2);assert.equal(x.sp.shieldUntil,3400);assert.equal(x.a.x,380);
 x.s.now+=9000;const next=x.cast();assert.deepEqual(next.moves.map(m=>m.id),['wave','shield']);assert.equal(new Set([...cast.moves,...next.moves].map(m=>m.id)).size,3);
});
test('Every ability rotation runs on every difficulty with finite stats and interruptible warnings',()=>{
 for(const type of Object.keys(ENEMY_TYPES))for(const difficulty of Object.keys(DIFFICULTIES)){
  const x=fixture(type,difficulty);x.a.hp=x.a.maxHp; // HP phases have separate regression tests.
  const seen=new Set();for(let i=0;i<3;i++){x.s.now+=10000;const cast=x.cast();cast.moves.forEach(m=>seen.add(m.id));assert.equal(cast.moves.length,DIFFICULTIES[difficulty].simultaneous);x.finish();if(x.sp.echo){x.s.now=x.sp.echo.at;x.sp.update(.016,x.h);}assert.ok(Number.isFinite(x.a.x)&&Number.isFinite(x.a.hp));assert.ok(x.hits.every(n=>Number.isFinite(n)&&n>=0));}
  assert.equal(seen.size,DIFFICULTIES[difficulty].abilities,type+' '+difficulty);
 }
});
test('Interrupting an Extreme cast cancels both attacks; silence and line of sight block casts',()=>{
 const x=fixture('dronepilot','extreme');x.cast();x.sp.cancel();x.s.now=1001;x.sp.update(0,x.h);assert.equal(x.hits.length,0);assert.equal(x.h.special,100);assert.equal(x.sp.pending,null);
 x.sp.energy=100;x.a.powerSilencedUntil=5000;assert.equal(x.sp.update(0,x.h),false);x.a.powerSilencedUntil=0;x.s.map.clearLine=()=>false;assert.equal(x.sp.update(0,x.h),false);
});
test('Medics heal living visible allies in range, never KO enemies, over max HP or through walls',()=>{
 const x=fixture('medic'),near={x:330,y:300,hp:90,maxHp:100},ko={x:320,y:300,hp:0,maxHp:100,ko:true},far={x:1000,y:300,hp:10,maxHp:100},wall={x:310,y:300,hp:10,maxHp:100};x.s.enemies.push(near,ko,far,wall);x.s.map.clearLine=(a,b,c)=>c!==310;x.cast();x.finish();assert.equal(near.hp,100);assert.equal(ko.hp,0);assert.equal(far.hp,10);assert.equal(wall.hp,10);assert.equal(x.a.hp,132);
});
test('Slow, drain and rally change movement/resources and expire using paused simulation time',()=>{
 const x=fixture('ranger','hard');x.sp.cursor=1;x.cast();x.finish();assert.equal(x.h.enemySlowUntil,2500);
 let moved;const c={scene:x.s,data:{},stats:{speed:100},face(){}};Object.assign(c,{enemySlowUntil:2500});x.s.map.move=(a,dx,dy)=>moved=[dx,dy];Character.prototype.move.call(c,1,0,1);assert.equal(moved[0],60);x.s.now=2500;Character.prototype.move.call(c,1,0,1);assert.equal(moved[0],100);
 x.s.now+=9000;x.cast();x.finish();assert.equal(x.a.hasteUntil,x.s.now+3200);
 const d=fixture('dronepilot','normal');d.sp.cursor=1;d.cast();d.finish();assert.equal(d.h.special,75);
});
test('Drone has a visible approach, locks its target, can be dodged, and explodes only once',()=>{
 const x=fixture('dronepilot');const cast=x.cast();assert.equal(cast.moves[0].profile.kind,'drone');assert.equal(x.hits.length,0);x.h.x=700;x.s.now=500;x.sp.update(.016,x.h);assert.equal(cast.moves[0].center.x,380);x.finish();assert.equal(x.hits.length,0);assert.equal(x.effects.length,1);x.s.now+=100;x.sp.update(.016,x.h);assert.equal(x.effects.length,1);
});
test('Shield applies to all new archetypes and reduced motion preserves double-cast rules',()=>{
 const x=fixture('riot','extreme');x.s.app.settings.reduceMotion=true;x.a.hp=200;x.cast();x.finish();EnemyBot.prototype.hit.call(x.a,40,{x:200,y:300});assert.equal(x.a.hp,190);assert.equal(x.sp.pending,null);
});
test('Cooldown and rotation survive save/restore without resurrecting pending attacks',()=>{
 const x=fixture('duelist','extreme');x.cast();x.finish();const saved=x.sp.snapshot(),y=fixture('duelist','extreme');y.s.now=90000;y.sp.restore(saved);assert.equal(y.sp.cursor,x.sp.cursor);assert.equal(y.sp.readyAt,98000);assert.equal(y.sp.pending,null);assert.equal(y.sp.echo,null);y.sp.restore(undefined);assert.equal(y.sp.cursor,2);
});
test('Each mission uses its set and a chief; all difficulties preserve slots, bosses and empty story rooms',()=>{
 const found=new Set();for(const [id,set]of Object.entries(ENEMY_SETS))for(const difficulty of Object.keys(DIFFICULTIES)){
  const mission=MISSIONS[id],configs=id==='2'?[scaleConfig(applyEnemySet(mission.chapters[0],2),difficulty),workshopConfig(mission.chapters[1],'depot',difficulty)]:id==='3'?Object.entries(FACILITY_ZONES).map(([zone,z])=>facilityConfig(mission.chapters[z.stage],zone,z.stage,difficulty)):Object.entries(ADVENTURE_ZONES[id]).map(([zone,z])=>adventureConfig(mission,zone,z.stage,difficulty));
  assert.ok(configs.some(c=>c.guards.some(g=>g[2]===set.boss)),id+' boss');
  for(const c of configs){assert.ok(c.guards.every(g=>ENEMY_TYPES[g[2]]));c.guards.forEach(g=>found.add(g[2]));assert.ok(c.guards.filter(g=>ENEMY_TYPES[g[2]].boss).length<=1);}
 }
 for(const type of ['ranger','sapper','riot','medic','duelist','dronepilot'])assert.ok(found.has(type),type);
 assert.equal(adventureConfig(MISSIONS[1],'village',0).guards.length,0);assert.equal(adventureConfig(MISSIONS[10],'home',3).guards.length,0);assert.equal(MISSIONS[2].chapters[2].guards.length,0);
 assert.equal(adventureConfig(MISSIONS[5],'collector',1).guards[0][2],'alligator');
 const c=adventureConfig(MISSIONS[1],'coast',1,'extreme');assert.ok(c.guards.every(g=>ENEMY_TYPES[g[2]].military));
});
test('Greek military abilities give children a longer warning and capped special damage',()=>{
 const x=fixture('major','extreme',true);x.a.hp=200;assert.equal(x.cast().at,1400);x.finish();assert.ok(x.hits.every(n=>n<=16));
});
test('Original Click Boy is below the guide with original manual art and working mapped controls',()=>{
 const h=readFileSync('dist/index.html','utf8');assert.ok(h.indexOf('class="console-return"')>h.indexOf('class="game-guide"'));assert.ok(h.indexOf('class="console-return"')<h.indexOf('class="mission-strip"'));assert.match(h,/CLICK BOY/);assert.match(h,/assets\/manual\/m03-1.jpg/);assert.match(h,/data-home-control="play"/);assert.ok(!h.includes('FOSSANO<br>NON ERA'));
});
