import test from 'node:test';
import assert from 'node:assert/strict';
import {RevivalSystem} from '../dist/js/combat/RevivalSystem.js';
import {Character} from '../dist/js/characters/Character.js';
import {PowerupSystem} from '../dist/js/combat/PowerupSystem.js';
import {GameMap} from '../dist/js/world/GameMap.js';
function view(){let p;const o={};p=new Proxy(o,{get(t,k){return k in t?t[k]:(...args)=>{if(k==='setText')t.text=args[0];if(k==='setVisible')t.visible=args[0];return p;};}});return p;}
function fixture(){const events=[],saves=[],s={now:100,activeMission:true,app:{settings:{reduceMotion:false},input:{consume(){}}},add:{graphics:view,text:view},tweens:{add(v){events.push(v);}},map:Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:[]}),party:[],enemies:[],difficulty:{stun:500},audio:{effect(v){events.push(v);},say(){}},fx:{burst(){events.push('burst');},word(){}},floatText(){},toast(v){events.push(v);},bus:{emit(){}},adventureController:{save(){saves.push(1);}},onKO(){}};
 const hero={id:'click',x:300,y:300,hp:100,data:{hp:140,name:'Click'},special:20,stats:{defense:0},stunUntil:0,invulnerableUntil:0,face(){},scene:s};const down={...hero,id:'ted',x:350,hp:0,ko:true,special:0,data:{hp:110,name:'Ted'}};s.party=[hero,down];s.player=hero;s.powers=new PowerupSystem(s);s.revival=new RevivalSystem(s);
 const advance=ms=>{for(let t=0;t<ms;t+=20){if(s.activeMission)s.now+=Math.min(20,ms-t);s.revival.update();s.powers.update();s.revival.render();}};return {s,hero,down,advance,events,saves};}
test('A starts a 2-second revival: exactly 15% HP, full special and a healing animation on completion',()=>{
 const {s,hero,down,advance,events,saves}=fixture();assert.match(s.revival.hint(),/RIANIMA TED/);s.revival.render();assert.match(s.revival.label.text,/A \/ J/);assert.ok(s.revival.tryStart());assert.ok(hero.actionLocked);advance(1999);assert.ok(down.ko);assert.equal(down.hp,0);advance(1);assert.equal(down.ko,false);assert.equal(down.hp,16.5);assert.equal(down.special,100);assert.equal(hero.actionLocked,false);assert.equal(s.revival.active,null);assert.ok(events.includes('heal'));assert.ok(events.includes('burst'));assert.equal(saves.length,1);advance(500);assert.equal(down.reviveAngle,0);
});
test('Damage at the last instant cancels revival; held A cannot silently resume it',()=>{
 const {s,hero,down,advance}=fixture();s.revival.tryStart();advance(1980);assert.equal(Character.prototype.damage.call(hero,20,{x:250,y:300}),true);assert.equal(s.revival.active,null);assert.equal(hero.actionLocked,false);advance(4000);assert.ok(down.ko);assert.equal(down.hp,0);s.revival.tryStart(false);assert.equal(s.revival.active,null);s.revival.tryStart(true);advance(1999);assert.ok(down.ko);advance(1);assert.equal(down.ko,false);
});
test('Pause freezes the rescue; leaving the scene cancels it without reviving later',()=>{
 const x=fixture();x.s.revival.tryStart();x.advance(1000);x.s.activeMission=false;x.advance(10000);assert.ok(x.down.ko);x.s.activeMission=true;x.advance(999);assert.ok(x.down.ko);x.advance(1);assert.equal(x.down.ko,false);
 const y=fixture();y.s.revival.tryStart();y.advance(1000);y.s.revival.cancel();y.advance(3000);assert.ok(y.down.ko);assert.equal(y.hero.actionLocked,false);
});
test('Only nearby visible KO allies with line of sight can be revived; nearest eligible ally is highlighted',()=>{
 const {s,hero,down}=fixture();s.map.obstacles=[{x:320,y:200,w:15,h:200}];assert.equal(s.revival.tryStart(),false);s.map.obstacles=[];down.hidden=true;assert.equal(s.revival.tryStart(),false);down.hidden=false;down.x=450;assert.equal(s.revival.tryStart(),false);down.x=350;down.ko=false;assert.equal(s.revival.tryStart(),false);down.ko=true;const other={...down,id:'bruce',x:320,data:{hp:155,name:'Bruce'}};s.party.push(other);assert.equal(s.revival.nearest(),other);hero.ko=true;assert.equal(s.revival.tryStart(),false);
});
test('Switching, rescuer KO, target recovery by another ability and loss of range each cancel safely',()=>{
 for(const change of [(x)=>x.s.player=x.down,(x)=>x.hero.ko=true,(x)=>{x.down.ko=false;x.down.hp=80;},(x)=>x.down.x=600]){const x=fixture();x.s.revival.tryStart();change(x);x.advance(2000);assert.equal(x.s.revival.active,null);assert.equal(x.hero.actionLocked,false);if(!x.down.ko)assert.equal(x.down.hp,80);else assert.equal(x.down.hp,0);}
});
test('Reduced motion preserves revival stats without tilting the recovering character',()=>{const x=fixture();x.s.app.settings.reduceMotion=true;x.s.revival.tryStart();x.advance(2000);assert.equal(x.down.reviveAngle,0);assert.equal(x.down.hp,x.down.data.hp*.15);assert.equal(x.down.special,100);});

test('A registered impact interrupts even when a shield absorbs its damage',()=>{const x=fixture();x.s.powers.absorb=()=>0;x.s.revival.tryStart();Character.prototype.damage.call(x.hero,20,{x:250,y:300});assert.equal(x.s.revival.active,null);assert.equal(x.hero.hp,100);x.advance(2000);assert.ok(x.down.ko);});
