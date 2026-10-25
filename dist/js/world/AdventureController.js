import {scaleGuards} from './DifficultyEncounters.js';
import {EnemyBot} from '../characters/EnemyBot.js';
import {FinaleEffects} from './FinaleEffects.js';
import {PreparationEffects} from './PreparationEffects.js';
import {UnderworldEffects} from './UnderworldEffects.js';
import {ADVENTURE_ZONES,ADVENTURE_DIALOGUES} from '../data/adventures.js';
import {GREECE_EXPLOSION} from '../data/dialogues.js';
export class AdventureController{
 constructor(scene,session){this.scene=scene;this.session=session;this.data=session.data;this.zone=this.data.current;this.config=ADVENTURE_ZONES[this.data.mission][this.zone];this.doors=this.config.doors;this.busy=false;this.autosave=scene.now;this.restore();this.draw();if([5,6].includes(this.data.mission))this.effects=new UnderworldEffects(this);if([7,8].includes(this.data.mission))this.effects=new PreparationEffects(this);if([9,10].includes(this.data.mission))this.effects=new FinaleEffects(this);}
 restore(){
  const s=this.scene,saved=this.data.zones[this.zone];
  if(saved){
   s.enemies.forEach((e,i)=>{const v=saved.enemies?.[i];if(!v){if(this.config.stage<s.mission.state.index){e.hp=0;e.ko=true;e.render();e.bar.setVisible(false);e.label.setVisible(false);}return;}Object.assign(e,{x:v.x,y:v.y,hp:v.hp,ko:v.ko});e.specialAbility.energy=v.energy;e.specialAbility.restore(v.specialState);if(e.specialAbility.rage)e.specialAbility.rage.completed=!!v.bossRage;if(e.specialAbility.charge)e.specialAbility.charge.completed=v.charges||0;e.render();if(e.ko){e.bar.setVisible(false);e.label.setVisible(false);}});
   s.crates.forEach((c,i)=>{const v=saved.crates?.[i];if(v){c.hp=v.hp;c.destroyed=v.destroyed;if(c.destroyed)c.view.destroy();}});
   s.director.collected=new Set(saved.collected||[]);s.director.exposure=saved.exposure||0;
   for(const p of s.director.points)if(s.director.collected.has(p.id)){p.art.setVisible(false);p.marker.setText('✓ '+p.label).setColor('#a3d9aa').setAlpha(.55);}
  }
  s.party.forEach(p=>{const v=this.data.party.find(v=>v.id===p.id);if(v)Object.assign(p,v);});
  const active=s.party.findIndex(p=>p.id===this.data.activeId&&!p.ko&&!p.hidden);s.activeIndex=active<0?s.party.findIndex(p=>!p.ko&&!p.hidden):active;if(s.activeIndex<0)s.activeIndex=0;
  if(s.director.car){const v=this.data.vehicle;if(v.zone===this.zone){s.director.car.setPosition(v.x,v.y).setRotation(v.angle);s.director.riding=v.riding;}else{s.director.car.destroy();s.director.car=null;}}
  const route=s.mission.state.route||0;s.director.routes.forEach((r,i)=>{if(i+(s.mission.config.routeOffset||0)<route)r.marker.setText('✓').setColor('#b1e2bd');});
 }
 blocked(door){
  const s=this.scene;if(s.director?.helicopters?.alert)return 'ALLARME · Resta fuori dai fari per 3 secondi consecutivi.';if(door.closedAfter!==undefined&&s.mission.state.index>door.closedAfter)return door.blocked;
  if((door.requires||[]).some(key=>!this.session.has(key)))return door.blocked||'Prima esplora il sentiero e trova il varco con Nico.';
  if(door.route&&(s.mission.state.route||0)<door.route)return 'Segui prima i segnali numerati del sentiero.';
  if(ADVENTURE_ZONES[this.data.mission][door.to].stage>s.mission.state.index&&!s.mission.canExit())return 'Completa gli obiettivi nel diario prima di proseguire.';return '';
 }
 draw(){
  this.doorViews=[];
 }
 updateAccess(){for(const {door,view}of this.doorViews||[]){const color=this.blocked(door)?0xe9c572:0x77d8d0;view.setFillStyle(color,.25).setStrokeStyle(2,color);}}
 save(){const s=this.scene;s.app.progress.adventureRun=this.session.capture(s);this.updateAccess();this.effects?.refresh();if(!s.mission.mission.children)s.party.forEach(p=>s.app.progress.equipment[p.id]={...p.loadout.slots});const ok=s.app.save.save(s.app.progress);document.querySelector('#save-status').textContent=ok?'ZONA SALVATA':'SALVATAGGIO NON DISPONIBILE';}
 nearbyDoor(){const p=this.scene.player;return this.doors.find(d=>Math.hypot(d.x-p.x,d.y-p.y)<80);}
 hint(){const d=this.nearbyDoor();return d?'A / J · '+d.label:'';}
 interact(){if(this.busy)return true;const p=this.scene.director.nearest();if(p?.action==='pizza'&&this.effects)return this.effects.pizza(p);const d=this.nearbyDoor();if(!d)return false;this.travel(d);return true;}
 travel(door){
  if(this.busy)return;const s=this.scene,reason=this.blocked(door);if(reason){s.toast(reason);return;}
  if(ADVENTURE_ZONES[this.data.mission][door.to].stage>s.mission.state.index){this.save();s.finishChapter();return;}
  this.busy=true;this.save();s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();s.audio.stop();s.bus.emit('zone:loading',ADVENTURE_ZONES[this.data.mission][door.to].name);
  s.time.delayedCall(s.app.settings.reduceMotion?0:220,()=>{this.session.enter(door.to,door.spawn);s.app.progress.adventureRun=this.data;s.loadChapter(s.mission.state.index,{zoneTransition:true});s.bus.emit('zone:loaded');});
 }
 onEnter(){
  const s=this.scene;if(this.data.mission!==1||this.zone!=='coast'||this.data.flags.explosion)return;
  this.data.flags.explosion=true;this.save();if(s.checkpoint?.adventureRun)s.checkpoint.adventureRun.flags.explosion=true;
  const flash=s.add.rectangle(640,60,1280,180,0xffd999,.85).setDepth(1600);s.tweens.add({targets:flash,alpha:0,duration:s.app.settings.reduceMotion?0:1500,onComplete:()=>flash.destroy()});
  if(!s.app.settings.reduceMotion)s.cameras.main.shake(300,.004);s.audio.effect('special');
  s.playDialogue({kicker:'LONTANO DALLA BASE',lines:ADVENTURE_DIALOGUES.explosion,art:GREECE_EXPLOSION});
 }
 animatePoint(point,show){
  if(this.effects?.animatePoint(point,show))return true;
  if(point.action!=='firecracker')return false;const s=this.scene;this.busy=true;s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();
  const spark=s.add.circle(s.player.x,s.player.y-35,5,0xffd378).setDepth(1800);
  s.tweens.add({targets:spark,x:970,y:350,duration:s.app.settings.reduceMotion?0:600,onComplete:()=>{spark.destroy();s.fx.burst(970,350,0xffd378,25);this.startPatrol();this.busy=false;show();}});return true;
 }
 startPatrol(){const s=this.scene;if(s.mission.id!==1||!s.mission.config.pursuers||s.enemies.length)return;const guards=scaleGuards(s.mission.config.pursuers,s.mission.config,s.app.progress.difficulty);s.mission.override={...s.mission.config,guards};s.enemies=guards.map(([x,y,type])=>new EnemyBot(s,x,y,type));this.save();s.toast('PATTUGLIA MILITARE · Scappate verso le colline!');}
 update(){if(!this.busy&&this.scene.now-this.autosave>2000){this.save();this.autosave=this.scene.now;}}
}
