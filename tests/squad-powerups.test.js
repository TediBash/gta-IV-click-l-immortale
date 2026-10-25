import test from 'node:test';
import assert from 'node:assert/strict';
import {PowerupSystem} from '../dist/js/combat/PowerupSystem.js';
import {POWERUPS,choosePower} from '../dist/js/data/powerups.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {Character} from '../dist/js/characters/Character.js';
import {EnemySpecial} from '../dist/js/combat/EnemySpecial.js';
import {EnemyBot} from '../dist/js/characters/EnemyBot.js';
import * as abilities from '../dist/js/combat/SpecialAbility.js';
const classes={bruce:'FlyingKickAbility',ted:'DroneStrikeAbility',spit:'RecoveryDriftAbility',carlitos:'DiamondStormAbility',ale:'VoiceWaveAbility',andy:'LuxuryDistractionAbility',paula:'TwinStrikeAbility',nico:'TwinStrikeAbility'};
function view(x=0,y=0){let p;const o={x,y,destroy(){o.destroyed=true;}};p=new Proxy(o,{get(o,k){return k in o?o[k]:(...args)=>{if(k==='setPosition'){o.x=args[0];o.y=args[1];}return p;};}});return p;}
function setup(id,mode){const s={now:100,activeMission:true,app:{settings:{powerups:{[id]:mode},reduceMotion:false}},party:[],enemies:[],map:Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:[]}),fx:{special(){},word(){},burst(){},beam(){}},bus:{emit(){}},audio:{say(){},effect(){}},floatText(){},toast(t){s.message=t;},add:{graphics:view,circle:view,container:view,image:view},tweens:{add(){}},time:{delayedCall(){}},cameras:{main:{shake(){}}},difficulty:{stun:100},onKO(){}};
 const a={id,x:300,y:300,hp:100,data:{hp:140,name:id,special:'test'},special:100,stunUntil:0,invulnerableUntil:0,stats:{specialLevel:1,defense:0},face(){},render(){},scene:s};s.party=[a];s.powers=new PowerupSystem(s);
 const enemy=(x=400,y=300,boss=false)=>{const e={x,y,hp:900,boss,stunUntil:0,specialAbility:{cancel(){e.cancelled=true;}},render(){},hit(d){e.hits=(e.hits||0)+1;e.hp=Math.max(0,e.hp-d);e.ko=e.hp===0;}};s.enemies.push(e);return e;};
 const ally=(id='click',x=380)=>{const b={...a,id,x,hp:30,special:80,data:{hp:140}};s.party.push(b);return b;};
 const advance=ms=>{for(let t=0;t<ms;t+=20){if(s.activeMission)s.now+=Math.min(20,ms-t);s.powers.update();}};
 const activate=()=>new abilities[classes[id]](s).activate(a);return {s,a,enemy,ally,advance,activate};}
test('All 16 additional variants persist independently and run to completion without leaking locks/jobs',()=>{
 for(const id of Object.keys(classes))for(const option of POWERUPS[id].slice(1)){
  const {s,a,enemy,ally,advance,activate}=setup(id,option.id),e=enemy();ally(id==='paula'?'nico':id==='nico'?'paula':'click');enemy(510);if(option.id==='closing')e.twinMark={until:6100};
  const app={playing:false,settings:{},save:{saveSettings(){}}};assert.ok(choosePower(app,id,option.id));assert.equal(app.settings.powerups[id],option.id);
  assert.equal(activate(),true,id+'/'+option.id);assert.equal(a.special,0,id+'/'+option.id+' consumed once');advance(9000);assert.equal(s.powers.jobs.size,0,id+'/'+option.id);assert.ok(s.party.every(b=>!b.actionLocked));assert.equal(e.powerLure||null,null);assert.equal(e.twinMark||null,null);assert.equal(e.powerSilencedUntil||0,0);
 }
});
test('Bruce bounces once to a second target; inspection removes the warden shield before its hit',()=>{
 const {s,a,enemy,advance,activate}=setup('bruce','bounce'),first=enemy(430),second=enemy(530);activate();assert.equal(a.actionLocked,true);advance(2800);assert.equal(first.hits,1);assert.equal(second.hits,1);assert.equal(a.actionLocked,false);assert.equal(a.kickLift,0);
 const b=setup('bruce','inspection'),e=b.enemy();e.type='warden';e.specialAbility.shieldUntil=9999;const hit=e.hit;e.hit=d=>{assert.equal(e.specialAbility.shieldUntil,0);hit(d);};b.activate();b.advance(1500);assert.equal(e.hp,775);
});
test('Targetless or wall-separated attacks preserve charge and never cross a wall',()=>{
 for(const [id,mode]of [['bruce','bounce'],['ted','tracking'],['spit','double'],['carlitos','precision'],['andy','lure'],['nico','closing']]){const {s,a,enemy,advance,activate}=setup(id,mode);activate();assert.equal(a.special,100);const e=enemy(430);e.twinMark={until:9999};s.map.obstacles=[{x:350,y:200,w:40,h:200}];activate();advance(4000);assert.equal(a.special,100);assert.equal(e.hp,900);}
});
test('Ted tracking follows early movement and damages on impact; EMP silences commons but not bosses',()=>{
 const t=setup('ted','tracking'),e=t.enemy();t.activate();t.advance(250);assert.equal(e.hp,900);e.x=570;t.advance(650);assert.equal(e.hp,810);
 const v=setup('ted','emp'),common=v.enemy(),boss=v.enemy(430,300,true);v.activate();v.advance(900);assert.equal(common.hp,855);assert.ok(common.powerSilencedUntil>v.s.now);assert.equal(boss.powerSilencedUntil,undefined);
 const state={actor:common,scene:v.s,profile:{},cancel(){this.cancelled=true;}};assert.equal(EnemySpecial.prototype.update.call(state,.016,v.a),false);assert.equal(state.cancelled,true);v.advance(3000);assert.equal(common.powerSilencedUntil,0);
});
test('Spit hits each enemy once across two drifts; rescue protects a wounded ally only at arrival',()=>{
 const x=setup('spit','double'),a=x.enemy(430),b=x.enemy(650);x.activate();x.advance(5000);assert.equal(a.hits,1);assert.equal(b.hits,1);
 const r=setup('spit','rescue'),friend=r.ally('click',600);r.enemy(470);r.activate();assert.equal(friend.powerShield,undefined);r.advance(800);assert.equal(friend.powerShield.hp,30);assert.equal(friend.hp,30);r.advance(2500);assert.equal(friend.powerShield,null);
});
test('Carlitos targets greatest health with three crystals and orbit absorbs exactly one hit',()=>{
 const p=setup('carlitos','precision'),low=p.enemy(360),high=p.enemy(500);low.hp=200;p.activate();p.advance(900);assert.equal(low.hp,200);assert.equal(high.hits,3);assert.equal(high.hp,756);
 const o=setup('carlitos','orbit'),enemy=o.enemy();o.activate();assert.equal(Character.prototype.damage.call(o.a,25,enemy),false);assert.equal(o.a.hp,100);Character.prototype.damage.call(o.a,25,enemy);assert.equal(o.a.hp,75);o.advance(4000);assert.equal(o.a.powerShard,null);
});
test('Ale rally caps energy, shields nearby allies and excludes allies behind walls',()=>{
 const x=setup('ale','rally'),friend=x.ally('click',340),blocked=x.ally('anna',550);x.s.map.obstacles=[{x:450,y:200,w:40,h:200}];x.activate();assert.equal(friend.special,100);assert.equal(friend.powerShield.hp,20);assert.equal(blocked.special,80);assert.equal(blocked.powerShield,undefined);x.advance(2100);assert.equal(friend.powerShield,null);
 const y=setup('ale','silence'),e=y.enemy(),boss=y.enemy(420,300,true);y.activate();assert.ok(e.powerSilencedUntil);assert.equal(boss.powerSilencedUntil,undefined);
});
test('Andy lure redirects normal enemy AI without affecting bosses; contract shield is bounded',()=>{
 const x=setup('andy','lure'),e=x.enemy(550),boss=x.enemy(570,300,true);x.activate();assert.ok(e.powerLure);assert.equal(boss.powerLure,undefined);Object.assign(e,{scene:x.s,speed:100,render(){},type:'guard'});const before=e.x;EnemyBot.prototype.update.call(e,.1);assert.ok(e.x<before);x.advance(2400);assert.equal(e.powerLure,null);
 const c=setup('andy','contract'),b=c.ally();c.activate();assert.equal(b.powerShield.hp,30);assert.equal(c.s.powers.absorb(b,50),20);assert.equal(b.powerShield,null);
});
test('Twin variants require an available partner, Paula marks and Nico consumes a mark only once',()=>{
 const p=setup('paula','mirror'),e=p.enemy(400),brother=p.ally('nico',370);brother.actionLocked=true;p.activate();assert.equal(p.a.special,100);brother.actionLocked=false;p.activate();p.advance(800);assert.ok(e.twinMark?.until>p.s.now);assert.ok(e.hp<900);p.s.app.settings.powerups.nico='closing';brother.special=100;new abilities.TwinStrikeAbility(p.s).activate(brother);assert.equal(e.twinMark,null);p.advance(700);assert.ok(e.hp<=595);brother.special=100;new abilities.TwinStrikeAbility(p.s).activate(brother);assert.equal(brother.special,100);
 const b=setup('paula','bond');b.ally('nico',690);b.enemy(650);b.activate();assert.equal(b.a.special,0);b.advance(800);
 const n=setup('nico','together'),sister=n.ally('paula',370);n.enemy();n.activate();n.advance(800);assert.equal(sister.powerShield.hp,25);assert.equal(n.a.powerShield.hp,25);
});
test('Pause, KO, zone cleanup and reduced motion preserve gameplay without deferred damage or stuck partners',()=>{
 for(const [id,mode]of [['bruce','bounce'],['ted','emp'],['spit','double'],['carlitos','orbit'],['ale','silence'],['andy','lure'],['paula','mirror'],['nico','together']]){
  const x=setup(id,mode),e=x.enemy();x.ally(id==='paula'?'nico':'paula');x.s.app.settings.reduceMotion=true;x.activate();const before=e.hp;x.s.activeMission=false;x.advance(1000);assert.equal(e.hp,before);x.s.activeMission=true;x.advance(200);if(id==='bruce')assert.equal(x.a.kickLift,0);x.s.powers.clear();const after=e.hp;x.advance(7000);assert.equal(e.hp,after);assert.equal(x.s.powers.jobs.size,0);assert.ok(x.s.party.every(p=>!p.actionLocked));assert.equal(e.powerLure||null,null);assert.equal(e.powerSilencedUntil||0,0);
 }
});
