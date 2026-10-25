import test from 'node:test';
import assert from 'node:assert/strict';
import {BossRage} from '../dist/js/combat/BossRage.js';
import {ENEMY_TYPES} from '../dist/js/data/enemies.js';
import {gameViewport} from '../dist/js/ui/FullscreenController.js';
import {AdventureSession} from '../dist/js/core/AdventureSession.js';
import {FacilitySession} from '../dist/js/core/FacilitySession.js';
import {ZoneSession} from '../dist/js/core/ZoneSession.js';
function view(){let v;v=new Proxy({},{get:()=>()=>v});return v;}
function fixture(type='captain'){
 const hits=[],events=[];let saves=0;
 const s={now:0,add:{graphics:view},tweens:{add(){}},fx:{burst(){},word(){}},bus:{emit:(event,value)=>events.push(value)},difficulty:{multiplier:1},map:{clearLine:()=>true},adventureController:{save:()=>saves++},party:[]};
 const a={scene:s,type,profile:ENEMY_TYPES[type],x:500,y:400,maxHp:200,hp:200};
 const hero=(x,y)=>({x,y,damage:n=>hits.push(n)}),rage=new BossRage(a);
 return {s,a,rage,hits,events,hero,saves:()=>saves};
}
test('Every non-alligator boss has exactly one half-health phase, including lethal incoming damage',()=>{
 for(const type of ['captain',...Object.keys(ENEMY_TYPES).filter(k=>ENEMY_TYPES[k].boss)]){
  const f=fixture(type),{s,a,rage}=f,h=f.hero(500,400);s.party=[h];assert.equal(rage.update(.016,h),false);
  a.hp-=rage.limitDamage(999);assert.equal(a.hp,100);assert.equal(rage.limitDamage(999),0);rage.update(.016,h);assert.equal(f.hits.length,0);s.now=1199;rage.update(.016,h);assert.equal(f.hits.length,0);s.now=1200;rage.update(.016,h);assert.equal(f.hits.length,1);assert.equal(f.saves(),1);assert.equal(rage.completed,true);assert.equal(rage.limitDamage(999),999);s.now=9999;assert.equal(rage.update(.016,h),false);assert.equal(f.events.length,1);
 }
});
test('Half-health attacks can be dodged and never damage through walls or hidden/KO teammates',()=>{
 for(const type of ['captain','overseer']){
  const f=fixture(type),{s,a,rage}=f,h=f.hero(500,400);s.party=[h,{...f.hero(500,400),hidden:true},{...f.hero(500,400),ko:true}];a.hp=100;rage.update(.016,h);h.x=750;h.y=650;s.now=1200;rage.update(.016,h);assert.equal(f.hits.length,0);
  const g=fixture(type);g.a.hp=100;const blocked=g.hero(500,400);g.s.party=[blocked];g.s.map.clearLine=()=>false;g.rage.update(.016,blocked);g.s.now=1200;g.rage.update(.016,blocked);assert.equal(g.hits.length,0);
 }
});
test('An interrupted warning restarts, and every zone save format retains a completed boss phase',()=>{
 const f=fixture(),h=f.hero(500,400);f.a.hp=100;f.rage.update(.016,h);f.rage.cancel();assert.equal(f.rage.completed,false);assert.equal(f.rage.limitDamage(50),0);f.s.now=500;f.rage.update(.016,h);assert.equal(f.rage.pending.at,1700);
 const scene={mission:{state:{index:0}},player:{id:'click'},party:[],enemies:[{x:500,y:400,hp:100,ko:false,specialAbility:{energy:0,rage:{completed:true}}}],crates:[],director:{collected:new Set(),exposure:0}};
 for(const session of [new AdventureSession(null,7,0),new FacilitySession(null,0),new ZoneSession(null)]){
  const saved=session.capture(scene);assert.equal(saved.zones[saved.current].enemies[0].bossRage,true);assert.ok(!('pending' in saved.zones[saved.current].enemies[0]));
 }
});
test('Game viewport preserves usable canvas proportions through rotations and very wide displays',()=>{
 for(const [w,h]of [[304,255],[374,420],[520,275],[332,233],[1000,300],[1200,700],[700,1200]]){
  const size=gameViewport(w,h,true);assert.ok(size.width>0&&size.width<=1280);assert.ok(size.height>0&&size.height<=800);assert.ok(Math.abs(size.width/size.height-w/h)<.01,'no aspect-ratio clipping or stretching');
 }
});
