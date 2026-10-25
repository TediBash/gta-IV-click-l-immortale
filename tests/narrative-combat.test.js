import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {introLines,outroLines,pointLines,pointArt,chapterArt,CHILD_PHOTO,SPIT_REPAIR} from '../dist/js/data/dialogues.js';
import {lineById} from '../dist/js/data/voices.js';
import {EnemySpecial} from '../dist/js/combat/EnemySpecial.js';
import {RecoveryDriftAbility} from '../dist/js/combat/SpecialAbility.js';
import {nearestEnemy,driftPoint} from '../dist/js/combat/DriftPath.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {NarrativeUI} from '../dist/js/ui/NarrativeUI.js';
function view(x=0,y=0){const v={x,y};const proxy=new Proxy(v,{get(o,k){if(k in o)return o[k];return(...args)=>{if(k==='setPosition'){o.x=args[0];o.y=args[1];}return proxy;};}});return proxy;}
function combatScene(ready=true){const s={now:0,activeMission:true,mission:{config:{enemySpecialReady:ready}},difficulty:{multiplier:1},app:{settings:{reduceMotion:false}},map:{clearLine:()=>true,blocked:()=>false,move:(a,x,y)=>{a.x+=x;a.y+=y;}},add:{circle:view,rectangle:view,container:view,graphics:view,image:view},fx:{burst(){},word(){},special(){}},audio:{say(){},effect(){}},bus:{emit(){}},floatText(){},toast(){},party:[],enemies:[],tweens:{add(t){s.tween=t;}}};return s;}
function enemy(s,type='technician'){return {scene:s,x:300,y:300,type,profile:{name:'Nemico',size:80},stunUntil:0,ko:false};}
test('All chapters and interactions have voice-compatible conversations and real manual art',()=>{
 let chapters=0;for(const m of Object.values(MISSIONS))for(const [i,c]of m.chapters.entries()){
  chapters++;for(const line of [...introLines(m.id,i),...outroLines(m.id,i),...(c.points||[]).flatMap(p=>pointLines(m.id,p))])assert.equal(lineById(line.id)?.text,line.text);
  for(const art of [chapterArt(m.id,i),chapterArt(m.id,i,true),...(c.points||[]).map(p=>pointArt(m.id,p)).filter(Boolean)]){assert.ok(existsSync('dist/'+art.src));const [x,y,w,h]=art.crop;assert.ok(x>=0&&y>=0&&x+w<=1&&y+h<=1&&w>0&&h>0);}
 }assert.equal(chapters,31);assert.equal(MISSIONS[1].chapters[2].points.find(p=>p.id==='bag').who,'paula');assert.equal(pointArt(1,{id:'photo'}),CHILD_PHOTO);assert.equal(pointArt(4,{id:'ready'}),SPIT_REPAIR);assert.match(pointLines(4,{id:'ready'})[0].text,/Ecco a voi/);
});
test('Final combat stages start charged and all reinforcements stand outside obstacles',()=>{
 assert.ok(MISSIONS[1].chapters.every(c=>c.guards.length===0));for(const m of Object.values(MISSIONS).filter(m=>m.id>1)){const last=m.chapters.findLastIndex(c=>c.guards.length);m.chapters.forEach((c,i)=>{assert.equal(c.enemySpecialReady,i===last);const map=Object.create(GameMap.prototype);Object.assign(map,{width:1280,height:800,obstacles:c.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});for(const [x,y]of c.guards)assert.equal(map.blocked(x,y),false,`${m.id}/${i} enemy ${x},${y}`);});}assert.equal(MISSIONS[2].chapters[0].guards.length,5);assert.equal(MISSIONS[2].chapters[1].guards.length,7);
});
test('Enemy special locks a telegraphed target, permits dodging and serializes windups',()=>{
 const s=combatScene(),sp=new EnemySpecial(enemy(s));let damage=0;const hero={x:400,y:300,damage(){damage++;}};s.party=[hero];assert.equal(sp.energy,100);assert.equal(sp.update(.016,hero),true);assert.equal(damage,0);assert.equal(sp.energy,0);assert.equal(new EnemySpecial(enemy(s)).update(.016,hero),false);s.now=999;sp.update(.016,hero);assert.equal(damage,0);hero.x=600;s.now=1000;sp.update(.016,hero);assert.equal(damage,0);assert.equal(sp.pending,null);
});
test('Enemy special respects line of sight and interruption cancels damage',()=>{
 const s=combatScene(),sp=new EnemySpecial(enemy(s));let hits=0;const hero={x:400,y:300,damage(){hits++;}};s.party=[hero];sp.update(.01,hero);s.now=1001;sp.update(.01,hero);assert.equal(hits,1);const interrupted=new EnemySpecial(enemy(s));s.now=2000;interrupted.update(.01,hero);interrupted.cancel();s.now=4000;interrupted.update(.01,hero);assert.equal(hits,1);const blocked=new EnemySpecial(enemy(s));s.map.clearLine=()=>false;assert.equal(blocked.update(.01,hero),false);assert.equal(blocked.energy,100);
});
test('Spit targets nearest living enemy in all four directions and hits it only once',()=>{
 for(const [dx,dy]of[[0,-200],[0,200],[-200,0],[200,0]]){const s=combatScene(),actor={id:'spit',x:500,y:400,special:100,stunUntil:0,stats:{specialLevel:1},data:{name:'Spit',special:'Derapata'}},target={x:500+dx,y:400+dy,ko:false,hits:0,hit(d){this.hits++;this.damage=d;}},far={x:1000,y:700,ko:false,hit(){throw new Error('Wrong target');}};s.enemies=[far,{x:501,y:401,ko:true},target];assert.equal(nearestEnemy(actor,s.enemies),target);assert.deepEqual(driftPoint(actor,target,1),{x:target.x,y:target.y});const mid=driftPoint(actor,target,.5);assert.ok(dx===0?mid.x!==500:mid.y!==400);assert.equal(new RecoveryDriftAbility(s).activate(actor),true);assert.equal(actor.special,0);for(let i=0;i<=40;i++){s.tween.targets.t=i/40;s.now=i*30;s.tween.onUpdate();}assert.equal(target.hits,1);assert.ok(target.damage>=150);}
});
test('Spit retains charge without enemies',()=>{const s=combatScene(),actor={special:100,stunUntil:0};assert.equal(new RecoveryDriftAbility(s).activate(actor),true);assert.equal(actor.special,100);});
test('Dialogue advances explicitly, completes once and pauses while the menu is open',()=>{
 const ui=Object.create(NarrativeUI.prototype);let rendered=0,completed=0;ui.app={audio:{stop(){}},ui:{dialog:{open:false}}};ui.options={lines:[{},{}],onComplete(){completed++;}};ui.index=0;ui.readyAt=0;ui.render=()=>rendered++;ui.cancel=()=>ui.options=null;ui.next();assert.equal(rendered,1);assert.equal(completed,0);ui.app.ui.dialog.open=true;ui.next();assert.equal(completed,0);ui.app.ui.dialog.open=false;ui.next();ui.next();assert.equal(completed,1);
});
