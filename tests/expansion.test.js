import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {CHARACTERS} from '../dist/js/data/characters.js';
import {appearance} from '../dist/js/data/appearance.js';
import {MISSION_LOOKS} from '../dist/js/data/atmosphere.js';
import {MissionManager} from '../dist/js/core/MissionManager.js';
import {EventBus} from '../dist/js/core/EventBus.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';
import {DiamondStormAbility,VoiceWaveAbility,BeeJudoAbility,VitalPulseAbility,TwinStrikeAbility} from '../dist/js/combat/SpecialAbility.js';
import {CombatEffects} from '../dist/js/combat/CombatEffects.js';
import {FullscreenController,gameViewport} from '../dist/js/ui/FullscreenController.js';

test('Every chapter has usable party members, matching skins, statistics and satisfiable gates',()=>{
 assert.equal(Object.values(MISSIONS).reduce((n,m)=>n+m.chapters.length,0),31);
 for(const m of Object.values(MISSIONS)){
  assert.ok(MISSION_LOOKS[m.id]);
  for(let i=0;i<m.chapters.length;i++){
   const c=m.chapters[i],party=c.party||m.party;
   for(const id of party){const p=CHARACTERS.find(p=>p.id===id);for(const k of ['hp','strength','speed','defense'])assert.ok(Number.isFinite(p[k]),id+' '+k);assert.ok(appearance(id,m).texture);}
   for(const p of c.points||[])if(p.who)assert.ok(party.includes(p.who),c.name+': missing '+p.who);
   const manager=new MissionManager(new EventBus(),m.id);manager.begin(i);assert.equal(manager.canExit(),false);
   for(const [key]of c.objectives){if(key==='exit')continue;const n=manager.target(key)??1;for(let j=0;j<n;j++)manager.record(key);}
   assert.equal(manager.canExit(),true,c.name);
  }
 }
 assert.equal(new Set(MISSIONS[10].chapters.flatMap(c=>c.party)).size,11);
 assert.equal(appearance('click',{elegant:true}).skin,'click-suit');assert.equal(appearance('paula',{children:true}).skin,'child-paula');assert.equal(appearance('paula').texture,'castFinal');
});
test('Final birthday checkpoint survives reload without changing earlier saves',()=>{
 const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};const save=new SaveManager();save.save({mission:10,chapter:3,cash:345,equipment:{luca:{GIOIELLO:'controller'}}});assert.equal(save.load().chapter,3);assert.equal(save.load().equipment.luca.GIOIELLO,'controller');save.save({mission:10,chapter:4});assert.equal(save.load(),null);
});
function fighter(id,x=100,y=100){return {id,x,y,hp:30,data:{hp:140,name:id,special:'special'},special:100,stats:{specialLevel:1},stunUntil:0,ko:false};}
function scene(){return {now:1000,activeMission:true,app:{settings:{}},party:[],enemies:[],map:{clearLine:()=>true,move:(a,dx,dy)=>{a.x+=dx;a.y+=dy;}},bus:{emit(){}},audio:{say(){},effect(){}},toast(){},floatText(){},fx:{special(){},beam(){},burst(){},word(){}}};}
function enemy(x=160,y=100){return {x,y,hp:200,ko:false,attackAt:2000,hit(damage){this.hp-=damage;}};}
test('Diamond and APE specials use range, line of sight and a single energy charge',()=>{
 for(const Ability of [DiamondStormAbility,BeeJudoAbility]){
  const s=scene(),a=fighter('luca');s.enemies=[enemy(),enemy(900)];const special=new Ability(s);assert.equal(special.activate(a),true);if(Ability===BeeJudoAbility){assert.equal(s.enemies[0].hp,200,'judo damage waits for impact');s.now+=700;s.powers.update();}assert.ok(s.enemies[0].hp<200);assert.equal(s.enemies[1].hp,200);assert.equal(a.special,0);assert.equal(special.activate(a),false);
  a.special=100;s.map.clearLine=()=>false;const hp=s.enemies[0].hp;special.activate(a);assert.equal(s.enemies[0].hp,hp);
 }
});
test('Ale interrupts enemy windups and charges her allies; Anna revives nearby teammates',()=>{
 const s=scene(),ale=fighter('ale'),ally=fighter('click');ally.special=10;s.party=[ale,ally];s.enemies=[enemy()];new VoiceWaveAbility(s).activate(ale);assert.equal(s.enemies[0].attackAt,0);assert.ok(s.enemies[0].stunUntil>s.now);assert.equal(ally.special,30);
 const anna=fighter('anna'),down=fighter('ted'),far=fighter('spit',1000);down.ko=true;down.hp=0;far.hp=1;s.party=[anna,down,far];new VitalPulseAbility(s).activate(anna);assert.equal(down.ko,false);assert.equal(down.hp,65);assert.equal(far.hp,1);assert.ok(down.invulnerableUntil>s.now);
});
test('Twin combo hits once per enemy and gets stronger only with a nearby conscious sibling',()=>{
 const s=scene(),paula=fighter('paula'),nico=fighter('nico',150);s.party=[paula,nico];s.enemies=[enemy()];const special=new TwinStrikeAbility(s);special.activate(paula);assert.equal(s.enemies[0].hp,70);
 paula.special=100;nico.ko=true;s.enemies=[enemy()];special.activate(paula);assert.equal(s.enemies[0].hp,125);
});
test('Comic effects are bounded, honor reduced motion and release completed objects',()=>{
 const tweens=[];let created=0,destroyed=0;function view(){created++;return {setDepth(){return this;},setOrigin(){return this;},setAngle(){return this;},setRotation(){return this;},setStrokeStyle(){return this;},destroy(){destroyed++;}};}
 const s={now:100,app:{settings:{reduceMotion:false}},add:{text:view,circle:view,rectangle:view},tweens:{add:t=>tweens.push(t),killTweensOf(){}}};const fx=new CombatEffects(s);for(let i=0;i<20;i++)fx.burst(100,100);assert.ok(fx.objects.size<=80);assert.ok(destroyed>0);
 const reduced=new CombatEffects({...s,app:{settings:{reduceMotion:true}}});const before=created;reduced.burst(100,100);assert.equal(created-before,1);const last=tweens.at(-1);assert.equal(last.scale,undefined);last.onComplete();assert.equal(reduced.objects.size,0);
});
function fullscreenHarness(mode='native'){
 const listeners={},classes=new Set(),attrs={},sizes=[],messages=[];let clears=0;
 const button={setAttribute:(k,v)=>attrs[k]=v};
 const doc={documentElement:{},body:{classList:{toggle:(k,v)=>v?classes.add(k):classes.delete(k)}},addEventListener:(k,fn)=>listeners[k]=fn,querySelector:s=>s==='#fullscreen-toggle'?button:{getBoundingClientRect:()=>({width:390,height:600})},fullscreenElement:null};
 if(mode!=='missing')doc.documentElement.requestFullscreen=async()=>{if(mode==='denied')throw new Error('denied');doc.fullscreenElement=doc.documentElement;listeners.fullscreenchange();};
 doc.exitFullscreen=async()=>{doc.fullscreenElement=null;listeners.fullscreenchange();};
 const win={addEventListener(){},requestAnimationFrame:fn=>fn()};
 const app={playing:true,input:{clear:()=>clears++},ui:{toast:t=>messages.push(t)},game:{scale:{setGameSize:(...size)=>sizes.push(size),refresh(){}}}};
 const controller=new FullscreenController(app,doc,win);return {controller,doc,listeners,classes,attrs,button,sizes,messages,get clears(){return clears;}};
}
test('Fullscreen enters and exits natively, follows browser escape and clears input',async()=>{
 const h=fullscreenHarness();await h.controller.toggle();assert.equal(h.controller.active,true);assert.ok(h.classes.has('immersive'));assert.equal(h.attrs['aria-pressed'],'true');assert.ok(h.sizes.at(-1)[0]===520);assert.ok(h.clears>0);
 h.doc.fullscreenElement=null;h.listeners.fullscreenchange();assert.equal(h.controller.active,false);assert.ok(!h.classes.has('immersive'));assert.deepEqual(h.sizes.at(-1),[960,560]);
 await h.controller.toggle();await h.controller.toggle();assert.equal(h.controller.active,false);
});
test('Unavailable or rejected fullscreen falls back and remains reversible by button or Escape',async()=>{
 for(const mode of ['missing','denied']){const h=fullscreenHarness(mode);await h.controller.toggle();assert.equal(h.controller.fallback,true);assert.ok(h.classes.has('immersive'));assert.equal(h.messages.length,1);h.listeners.keydown({key:'Escape'});assert.equal(h.controller.active,false);await h.controller.toggle();await h.controller.toggle();assert.equal(h.controller.active,false);}
});
test('Viewport sizing supports portrait, landscape and normal mode without zero sizes',()=>{
 assert.deepEqual(gameViewport(390,600,true),{width:520,height:800});assert.deepEqual(gameViewport(700,350,true),{width:1120,height:560});assert.deepEqual(gameViewport(0,0,true),{width:960,height:560});assert.deepEqual(gameViewport(390,600,false),{width:960,height:560});
});
