import test from 'node:test';
import assert from 'node:assert/strict';
import {FlyingKickAbility} from '../dist/js/combat/SpecialAbility.js';
import {EnemySpecial} from '../dist/js/combat/EnemySpecial.js';
import {AlligatorCharge} from '../dist/js/combat/AlligatorCharge.js';
import {EnemyBot} from '../dist/js/characters/EnemyBot.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {ADVENTURE_ZONES,adventureConfig} from '../dist/js/data/adventures.js';
import {BRUCE_ALLIGATOR,PIZZA_KO} from '../dist/js/data/dialogues.js';
import {artGeometry} from '../dist/js/ui/ManualArt.js';
function view(x=0,y=0){let p;const o={x,y};p=new Proxy(o,{get(t,k){if(k in t)return t[k];return(...args)=>{if(k==='setPosition'){t.x=args[0];t.y=args[1];}return p;};}});return p;}
function scene(){const s={now:0,activeMission:true,mission:{config:{enemySpecialReady:true}},difficulty:{multiplier:1},app:{settings:{reduceMotion:false}},map:{clearLine:()=>true,move:(a,x,y)=>{a.x+=x;a.y+=y;}},add:{circle:view,rectangle:view,graphics:view},fx:{burst(){},word(){},special(){}},audio:{effect(){},say(){}},bus:{emit(){}},toast(){},floatText(){},party:[],enemies:[],tweens:{add(t){s.tween=t;}}};return s;}
function bruce(){return {id:'bruce',x:500,y:400,special:100,stunUntil:0,stats:{specialLevel:1},data:{name:'Bruce',special:'Calcio volante'},face(){},render(){}};}
function enemy(s,type='pulse'){return {scene:s,x:300,y:300,type,profile:{name:type,size:90},hp:270,maxHp:270,stunUntil:0,ko:false};}

test('Bruce visibly lunges in four directions, picks the nearest live target and hits once',()=>{
 for(const [dx,dy]of [[200,0],[-200,0],[0,200],[0,-200]]){
  const s=scene(),a=bruce(),close={x:500+dx,y:400+dy,hits:0,hit(){this.hits++;}},far={x:1100,y:700,hit(){throw Error('wrong target');}};s.enemies=[far,{x:501,y:401,ko:true},close];s.player=a;
  assert.equal(new FlyingKickAbility(s).activate(a),true);assert.equal(a.special,0);assert.equal(a.actionLocked,true);assert.equal(close.hits,0);assert.equal(a.x,500);const t=s.tween;
  let lifted=false;for(let i=0;i<=50;i++){t.targets.t=i/50;s.now=i*20;t.onUpdate();lifted||=a.kickLift>20;}assert.ok(lifted);assert.equal(close.hits,1);assert.ok(Math.hypot(a.x-close.x,a.y-close.y)<=40);t.onComplete();assert.equal(a.actionLocked,false);assert.equal(a.kickLift,0);
 }
});
test('Bruce conserves charge without reachable targets and a wall stops his flight',()=>{
 const s=scene(),a=bruce(),ability=new FlyingKickAbility(s);assert.equal(ability.activate(a),true);assert.equal(a.special,100);
 s.enemies=[{x:800,y:400,hit(){throw Error('Hit through wall');}}];s.map.clearLine=()=>false;ability.activate(a);assert.equal(a.special,100);
 s.map.clearLine=()=>true;ability.activate(a);s.map.move=(a,x,y)=>{if(a.x+x<600)a.x+=x;a.y+=y;};const t=s.tween;for(let i=0;i<=40;i++){t.targets.t=i/40;t.onUpdate();}assert.ok(a.x<600);t.onComplete();assert.equal(a.actionLocked,false);
});
test('Alligator gates damage at both thirds, warns before moving, charges twice and can then fall',()=>{
 const s=scene(),a=enemy(s,'alligator'),charge=new AlligatorCharge(a);let hits=0;const hero={x:440,y:300,damage(){hits++;}};s.party=[hero];
 for(let phase=0;phase<2;phase++){
  a.hp-=charge.limitDamage(999);assert.equal(a.hp,[180,90][phase]);assert.equal(charge.limitDamage(999),0);hero.x=a.x+140;hero.y=a.y;s.now+=1300;charge.update(.016,hero);assert.ok(charge.pending);const x=a.x;s.now+=1000;charge.update(.016,hero);assert.equal(a.x,x,'warning must be visible before movement');
  s.now+=101;for(let i=0;i<60&&charge.completed===phase;i++){s.now+=40;charge.update(.04,hero);}assert.equal(charge.completed,phase+1);assert.equal(hits,phase+1,'at most one hit per charge');
 }
 a.hp-=Math.min(a.hp,charge.limitDamage(999));assert.equal(a.hp,0);assert.equal(charge.completed,2);assert.equal(charge.update(.016,hero),false);
});
test('Alligator locks its lane so the player can sidestep; obstacles stop the charge',()=>{
 const s=scene(),a=enemy(s,'alligator');a.hp=180;const charge=new AlligatorCharge(a),hero={x:440,y:300,damage(){throw Error('Dodge failed');}};s.party=[hero];charge.update(.016,hero);hero.y=600;s.now=1101;
 s.map.move=(actor,x,y)=>{if(actor.x+x<400)actor.x+=x;actor.y+=y;};for(let i=0;i<40&&charge.completed===0;i++){s.now+=40;charge.update(.04,hero);}assert.equal(charge.completed,1);assert.ok(a.x<400);assert.equal(a.y,300);
});
test('Pulsar sends two dodgeable waves at the locked spot; interruption cancels the second',()=>{
 for(const interrupt of [false,true]){const s=scene(),sp=new EnemySpecial(enemy(s)),hero={x:400,y:300,hits:0,damage(){this.hits++;}};s.party=[hero];sp.update(.016,hero);s.now=1000;sp.update(.016,hero);assert.equal(hero.hits,1);assert.ok(sp.echo);if(interrupt)sp.cancel();s.now=2450;sp.update(.016,hero);assert.equal(hero.hits,interrupt?1:2);}
 const s=scene(),sp=new EnemySpecial(enemy(s)),hero={x:400,y:300,damage(){throw Error('Should dodge');}};s.party=[hero];sp.update(.016,hero);hero.y=600;s.now=1000;sp.update(.016,hero);s.now=2450;sp.update(.016,hero);
});
test('Scudiero braces, repels and reduces damage only while its shield is active',()=>{
 const s=scene(),a=enemy(s,'warden'),sp=new EnemySpecial(a),hero={x:350,y:300,hits:0,damage(){this.hits++;}};s.party=[hero];sp.update(.016,hero);s.now=1000;sp.update(.016,hero);assert.equal(hero.hits,1);assert.ok(hero.x>350);assert.ok(sp.shieldUntil>s.now);
 const target={...a,type:'warden',hp:100,specialAbility:sp,render(){}};EnemyBot.prototype.hit.call(target,40,hero);assert.equal(target.hp,90);s.now=4000;EnemyBot.prototype.hit.call(target,40,hero);assert.equal(target.hp,50);
});
test('New roles appear from mission five onwards and all new stages have achievable targets',()=>{
 for(const id of [7,8,9,10]){const types=MISSIONS[id].chapters.flatMap(c=>c.guards.map(g=>g[2]));assert.ok(types.includes('warden'));assert.ok(types.includes('pulse'));}
 for(const mission of [5,6])for(const [id,z]of Object.entries(ADVENTURE_ZONES[mission])){const c=adventureConfig(MISSIONS[mission],id,z.stage);assert.equal(c.guardTarget+c.extraGuardCount,(mission===5?[5,3,7]:[6,6,7])[z.stage]);assert.equal(c.enemySpecialReady,z.stage===2);}
 for(const art of [BRUCE_ALLIGATOR,PIZZA_KO])assert.ok(artGeometry(art).w>0);
});
