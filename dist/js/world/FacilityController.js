import {FACILITY_ZONES,FACILITY_VAN,FACILITY_DIALOGUES} from '../data/facility.js';
import {chapterArt} from '../data/dialogues.js';
import {prop} from '../data/skins.js';

export class FacilityController{
 constructor(scene,session){
  this.scene=scene;this.session=session;this.data=session.data;this.zone=this.data.current;this.config=FACILITY_ZONES[this.zone];this.doors=this.config.doors;this.busy=false;this.autosave=scene.now;
  this.restore();this.draw();
 }
 restore(){
  const s=this.scene,saved=this.data.zones[this.zone];
  if(saved){
   s.enemies.forEach((e,i)=>{const v=saved.enemies[i];if(!v){if(this.config.stage<s.mission.state.index){e.hp=0;e.ko=true;e.render();e.bar.setVisible(false);e.label.setVisible(false);}return;}Object.assign(e,{x:v.x,y:v.y,hp:v.hp,ko:v.ko});e.specialAbility.energy=v.energy;e.specialAbility.restore(v.specialState);if(e.specialAbility.rage)e.specialAbility.rage.completed=!!v.bossRage;e.render();if(e.ko){e.bar.setVisible(false);e.label.setVisible(false);}});
   s.crates.forEach((c,i)=>{const v=saved.crates[i];if(v){c.hp=v.hp;c.destroyed=v.destroyed;if(c.destroyed)c.view.destroy();}});
  }
  s.party.forEach(p=>{const v=this.data.party.find(v=>v.id===p.id);if(v)Object.assign(p,v);});
  const active=s.party.findIndex(p=>p.id===this.data.activeId&&!p.ko);s.activeIndex=active<0?0:active;
 }
 draw(){
  const s=this.scene;this.doorViews=[];
  this.updateAccess();
  const device=this.config.device;if(device){const done=this.data.flags[device.key];this.deviceMarker=s.add.text(device.x,device.y-90,(done?'✓ ':'◇ ')+device.label,{fontFamily:'monospace',fontSize:12,color:done?'#a6e8ad':'#ffe390',backgroundColor:'#173840',padding:{x:7,y:5}}).setOrigin(.5).setDepth(1500);this.deviceGlow=s.add.ellipse(device.x,device.y,90,35,done?0x7ed1a1:0x62bde2,.3).setDepth(3);if(device.key==='prototype'&&!done)this.deviceArt=prop(s,'bee',device.x,device.y-35,70);}
  if(this.zone==='escape'){this.cargo=[];if(this.data.flags.loaded)this.showCargo();else this.cargoLabel=s.add.text(FACILITY_VAN.x,FACILITY_VAN.y+85,'A · CARICA IL BOTTINO',{fontFamily:'monospace',fontSize:11,color:'#ffe390'}).setOrigin(.5).setDepth(1500);}
 }
 showCargo(){this.cargoLabel?.destroy();this.cargo?.forEach(v=>v.destroy());this.cargo=[0,1,2].map(i=>prop(this.scene,'cash',FACILITY_VAN.x-48+i*38,FACILITY_VAN.y+52,40,1550));this.cargo.push(prop(this.scene,'bee',FACILITY_VAN.x+62,FACILITY_VAN.y+40,40,1550));}
 updateAccess(){for(const {door,view}of this.doorViews||[]){const open=FACILITY_ZONES[door.to].stage<=this.scene.mission.state.index||this.scene.mission.canExit();view.setFillStyle(open?0x77d8d0:0xe9c572,.25).setStrokeStyle(2,open?0x77d8d0:0xe9c572);}}
 save(){this.updateAccess();const s=this.scene;s.app.progress.facilityRun=this.session.capture(s);s.party.forEach(p=>s.app.progress.equipment[p.id]={...p.loadout.slots});const ok=s.app.save.save(s.app.progress);document.querySelector('#save-status').textContent=ok?'ZONA SALVATA':'SALVATAGGIO NON DISPONIBILE';}
 nearbyDoor(){const p=this.scene.player;return this.doors.find(d=>Math.hypot(d.x-p.x,d.y-p.y)<80);}
 hint(){
  if(this.busy)return '';const s=this.scene,d=this.nearbyDoor();if(d)return 'A / J · '+d.label;
  const device=this.config.device;if(device&&!this.data.flags[device.key]&&Math.hypot(device.x-s.player.x,device.y-s.player.y)<90)return s.player.id===device.who?'A / J · '+device.label:'Q / CAMBIA · Serve Ted';
  if(this.zone==='escape'&&Math.hypot(s.player.x-FACILITY_VAN.x,s.player.y-FACILITY_VAN.y)<100)return this.data.flags.loaded?'A / J · Parti per Fossano':'A / J · Carica denaro e prototipo';return '';
 }
 interact(){
  if(this.busy)return true;const s=this.scene,d=this.nearbyDoor();if(d){this.travel(d);return true;}
  const device=this.config.device;if(device&&Math.hypot(device.x-s.player.x,device.y-s.player.y)<90){
   if(this.data.flags[device.key]){s.toast(device.key==='terminal'?'Accesso già sbloccato.':'Il prototipo è già con Ted.');return true;}
   if(s.player.id!==device.who){s.toast('Serve Ted · Q / CAMBIA');return true;}
   if(device.key==='terminal'&&!s.mission.complete('guards')){s.toast('Libera tutte le guardie del cortile e della sicurezza.');return true;}
   if(device.key==='prototype'&&!this.data.flags.terminal){s.toast('Prima sblocca l’accesso dalla sicurezza.');return true;}
   this.deviceArt?.destroy();this.data.flags[device.key]=true;s.mission.record(device.key);this.deviceMarker.setText('✓ '+device.label).setColor('#a6e8ad');this.deviceGlow.setFillStyle(0x7ed1a1,.3);this.save();s.bus.emit('hud:update',s);s.audio.effect('gate');
   s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();if(device.key==='prototype')s.celebratePickup(s.player,{name:'Prototipo recuperato',skin:'bee'});
   s.time.delayedCall(device.key==='prototype'&&!s.app.settings.reduceMotion?850:0,()=>s.playDialogue({kicker:device.label,lines:FACILITY_DIALOGUES[device.key],art:device.key==='prototype'?chapterArt(3,1,true):null}));return true;
  }
  if(this.zone==='escape'&&Math.hypot(s.player.x-FACILITY_VAN.x,s.player.y-FACILITY_VAN.y)<100){
   if(!s.mission.complete('guards')){s.toast('Prima libera entrambi i piazzali dai rinforzi.');return true;}
   if(!this.data.flags.loaded){this.loadCargo();return true;}
   this.save();s.finishChapter();return true;
  }return false;
 }
 travel(door){
  if(this.busy)return;const s=this.scene,next=FACILITY_ZONES[door.to].stage;
  if(next>s.mission.state.index){if(!s.mission.canExit()){s.toast('Completa gli obiettivi prima di aprire questo passaggio.');return;}this.save();s.finishChapter();return;}
  this.busy=true;this.save();s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();s.audio.stop();s.bus.emit('zone:loading',FACILITY_ZONES[door.to].name);
  s.time.delayedCall(s.app.settings.reduceMotion?0:220,()=>{this.session.enter(door.to,door.spawn);s.app.progress.facilityRun=this.data;s.loadChapter(s.mission.state.index,{zoneTransition:true});s.bus.emit('zone:loaded');});
 }
 loadCargo(){
  const s=this.scene;this.busy=true;s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();s.audio.effect('loot');
  const bundle=s.add.container(s.player.x,s.player.y-30).setDepth(2200);for(let i=0;i<3;i++)bundle.add(s.add.image((i-1)*28,0,'props','cash').setDisplaySize(42,42));bundle.add(s.add.image(10,-28,'details','bee').setDisplaySize(36,36));
  s.tweens.add({targets:bundle,x:FACILITY_VAN.x,y:FACILITY_VAN.y,duration:s.app.settings.reduceMotion?0:950,onComplete:()=>{bundle.destroy();this.data.flags.loaded=true;s.mission.record('loaded');this.showCargo();this.save();s.bus.emit('hud:update',s);s.playDialogue({kicker:'BOTTINO A BORDO',lines:FACILITY_DIALOGUES.loaded,art:chapterArt(3,1,true),onComplete:()=>{this.busy=false;s.resumeAction();}});}});
 }
 update(){if(!this.busy&&this.scene.now-this.autosave>2000){this.save();this.autosave=this.scene.now;}}
}
