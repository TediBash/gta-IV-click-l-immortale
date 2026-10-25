import test from 'node:test';
import assert from 'node:assert/strict';
import {POWERUPS,selectedPower,choosePower} from '../dist/js/data/powerups.js';
import {PowerupSystem} from '../dist/js/combat/PowerupSystem.js';
import {FuriaImmortaleAbility,BeeJudoAbility,VitalPulseAbility} from '../dist/js/combat/SpecialAbility.js';
import {Character} from '../dist/js/characters/Character.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';
import {powerupMarkup} from '../dist/js/ui/PowerupMenu.js';
import {GameMap} from '../dist/js/world/GameMap.js';
function view(){let proxy;const v={destroyed:false,destroy(){this.destroyed=true;}};proxy=new Proxy(v,{get(o,k){return k in o?o[k]:(...args)=>proxy;}});return proxy;}
function setup(id,mode='base',reduceMotion=false){
 const map=Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:[]});
 const s={now:100,activeMission:true,app:{settings:{powerups:{[id]:mode},reduceMotion}},map,party:[],enemies:[],fx:{special(){},word(){},burst(){}},bus:{emit(){}},audio:{say(){},effect(){}},floatText(){},toast(t){s.message=t;},add:{graphics:view,circle:view},tweens:{add(){}},time:{delayedCall(){}},cameras:{main:{shake(){}}},difficulty:{stun:100},onKO(){}};
 const a={id,x:300,y:300,hp:100,data:{hp:140,name:id,special:'test'},special:100,stunUntil:0,invulnerableUntil:0,stats:{specialLevel:1,defense:0},face(){},render(){},scene:s};s.party=[a];s.powers=new PowerupSystem(s);
 const enemy=(x=360,y=300,boss=false)=>{const e={x,y,hp:500,boss,stunUntil:0,attackAt:0,specialAbility:{cancel(){}},render(){},hit(d){e.hits=(e.hits||0)+1;e.hp=Math.max(0,e.hp-d);e.ko=e.hp===0;}};s.enemies.push(e);return e;};
 const advance=(ms,step=20)=>{for(let t=0;t<ms;t+=step){if(s.activeMission)s.now+=Math.min(step,ms-t);s.powers.update();}};return {s,a,enemy,advance};
}
test('All 22 choices save independently, migrate old saves to base and do not overwrite campaign progress',()=>{
 assert.equal(Object.values(POWERUPS).flat().length,33);const memory=new Map([['gtaclick.save.v1','untouched']]);globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};globalThis.matchMedia=()=>({matches:false});const save=new SaveManager(),app={playing:false,settings:save.settings(),save};
 assert.equal(selectedPower(app.settings,'anna').id,'base');assert.equal(choosePower(app,'click','boxer'),true);choosePower(app,'luca','chain');choosePower(app,'anna','renew');assert.deepEqual(save.settings().powerups,{click:'boxer',luca:'chain',anna:'renew'});assert.equal(memory.get('gtaclick.save.v1'),'untouched');
 app.playing=true;app.scene={isHideout:false};assert.equal(choosePower(app,'click','guard'),false);app.scene.isHideout=true;assert.equal(choosePower(app,'click','guard'),true);assert.equal(choosePower(app,'anna','boxer'),false);assert.equal(selectedPower({powerups:{anna:'bad'}},'anna').id,'base');
 const markup=powerupMarkup(app);assert.equal((markup.match(/type="radio"/g)||[]).length,33);assert.equal((markup.match(/ checked /g)||[]).length,11);app.scene.isHideout=false;assert.equal((powerupMarkup(app).match(/ disabled/g)||[]).length,33);
});
test('Click performs three timed impacts; blocked or absent targets preserve charge',()=>{
 const {s,a,enemy,advance}=setup('click','boxer'),e=enemy(500);const special=new FuriaImmortaleAbility(s);assert.equal(special.activate(a),true);assert.equal(e.hp,500);assert.equal(a.actionLocked,true);advance(1050);assert.equal(e.hits,3);assert.equal(e.hp,380);assert.equal(a.actionLocked,false);assert.equal(a.powerAngle,0);assert.equal(a.special,0);
 a.special=100;s.enemies=[];special.activate(a);assert.equal(a.special,100);s.enemies=[e];s.map.obstacles=[{x:360,y:200,w:40,h:200}];a.x=300;e.x=420;special.activate(a);assert.equal(a.special,100);
});
test('Click cannot damage through a wall that blocks his target during the combo; cancellation frees action lock',()=>{
 const {s,a,enemy,advance}=setup('click','boxer'),e=enemy(380);new FuriaImmortaleAbility(s).activate(a);s.map.obstacles=[{x:340,y:200,w:20,h:200}];advance(400);assert.equal(e.hp,500);assert.ok(a.x<340);s.powers.clear();assert.equal(a.actionLocked,false);advance(1500);assert.equal(e.hp,500);
});
test('Guard absorbs exactly one real hit and counters nearby enemies, then expires cleanly',()=>{
 const {s,a,enemy,advance}=setup('click','guard'),e=enemy();new FuriaImmortaleAbility(s).activate(a);assert.equal(Character.prototype.damage.call(a,30,e),false);assert.equal(a.hp,100);assert.equal(e.hp,410);assert.equal(a.powerGuard,null);advance(320);assert.equal(Character.prototype.damage.call(a,30,e),true);assert.equal(a.hp,70);assert.equal(e.hp,410);
 a.special=100;new FuriaImmortaleAbility(s).activate(a);advance(2500);assert.equal(a.powerGuard,null);a.invulnerableUntil=0;Character.prototype.damage.call(a,10,e);assert.equal(a.hp,60);
});
test('Judo damage occurs at landing, chains to one nearby enemy and never lifts a boss',()=>{
 const {s,a,enemy,advance}=setup('luca','chain'),e=enemy(360),other=enemy(430);new BeeJudoAbility(s).activate(a);assert.equal(e.hp,500);advance(300);assert.ok(e.powerLift>0);assert.equal(e.hp,500);advance(400);assert.equal(e.hp,385);assert.equal(other.hp,430);assert.equal(e.powerLift,0);assert.equal(e.powerAngle,0);assert.equal(a.actionLocked,false);
 const far=setup('luca','chain');far.enemy(550);new BeeJudoAbility(far.s).activate(far.a);assert.equal(far.a.special,100);
 const boss=setup('luca','chain'),b=boss.enemy(360,300,true),x=b.x;new BeeJudoAbility(boss.s).activate(boss.a);boss.advance(700);assert.equal(b.x,x);assert.equal(b.powerLift,0);assert.equal(b.hp,385);assert.ok(b.stunUntil<=boss.s.now+350);
});
test('Sentinel fires at most three times, respects walls, stops after four seconds and freezes during pause',()=>{
 const {s,a,enemy,advance}=setup('luca','sentinel'),e=enemy(440);new BeeJudoAbility(s).activate(a);s.activeMission=false;advance(2000);assert.equal(e.hp,500);s.activeMission=true;advance(5000);assert.equal(e.hits,3);assert.equal(e.hp,380);assert.equal(s.powers.jobs.size,0);
 const blocked=setup('luca','sentinel'),b=blocked.enemy(430);blocked.s.map.obstacles=[{x:350,y:200,w:40,h:200}];new BeeJudoAbility(blocked.s).activate(blocked.a);blocked.advance(5000);assert.equal(b.hp,500);
});
test('Anna prioritizes KO allies and shield absorbs damage only once up to its remaining value',()=>{
 const {s,a,enemy,advance}=setup('anna','triage');const down={...a,id:'click',x:350,hp:0,ko:true,data:{hp:140},scene:s};s.party.push(down);const e=enemy(400);new VitalPulseAbility(s).activate(a);assert.equal(down.ko,false);assert.equal(down.hp,90);assert.equal(a.hp,135);assert.equal(down.powerShield.hp,40);advance(1400);
 Character.prototype.damage.call(down,25,e);assert.equal(down.hp,90);assert.equal(down.powerShield.hp,15);Character.prototype.damage.call(down,25,e);assert.equal(down.hp,80);assert.equal(down.powerShield,null);advance(2000);assert.equal(down.powerShield,null);
});
test('Second breath totals 65 HP, never overheals or revives a later KO, and clears on zone change',()=>{
 const {s,a,advance}=setup('anna','renew');a.hp=10;const down={...a,id:'click',x:340,hp:0,ko:true,data:{hp:140}};s.party.push(down);new VitalPulseAbility(s).activate(a);assert.equal(a.hp,45);assert.equal(down.hp,35);down.ko=true;down.hp=0;advance(3000);assert.equal(a.hp,75);assert.equal(down.hp,0);assert.equal(down.ko,true);
 a.special=100;new VitalPulseAbility(s).activate(a);const hp=a.hp;s.powers.clear();advance(3000);assert.equal(a.hp,hp);
 a.hp=138;a.special=100;s.party=[a];new VitalPulseAbility(s).activate(a);advance(3000);assert.equal(a.hp,140);a.special=100;new VitalPulseAbility(s).activate(a);assert.equal(a.special,100);
});
test('Anna cannot heal hidden, far-away or wall-separated allies',()=>{
 const {s,a}=setup('anna');const ally={...a,id:'click',x:430,hp:1};s.party.push(ally);s.map.obstacles=[{x:350,y:200,w:40,h:200}];new VitalPulseAbility(s).activate(a);assert.equal(ally.hp,1);assert.equal(a.hp,140);
});
test('Reduced motion preserves all hits while omitting large judo lifts and rotations',()=>{
 const {s,a,enemy,advance}=setup('luca','chain',true),e=enemy();new BeeJudoAbility(s).activate(a);advance(300);assert.equal(e.powerLift,0);assert.equal(e.powerAngle,0);assert.equal(a.powerAngle,0);advance(400);assert.equal(e.hp,385);assert.equal(s.powers.jobs.size,0);
});
