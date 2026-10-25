import {prop} from '../data/skins.js';
import {DOORS,ZONE_NAMES,PARKING,zoneLine} from '../data/zones.js';
import {vehicleFits,parkedInside} from '../core/ZoneSession.js';
import {drawCar} from './RaceController.js';
import {SPIT_REVEAL} from '../data/dialogues.js';
export class ZoneController{
 constructor(scene,session){this.scene=scene;this.session=session;this.data=session.data;this.zone=this.data.current;this.doors=DOORS[this.zone];this.busy=false;this.autosave=0;
  if(this.zone==='workshop'){prop(scene,'paint-booth',1010,355,240,2);const b=PARKING,g=scene.add.graphics().setDepth(3);g.fillStyle(0xeac765,.13).fillRect(b.x,b.y,b.w,b.h);g.lineStyle(3,0xf7d84a).strokeRect(b.x,b.y,b.w,b.h);scene.add.text(b.x+b.w/2,b.y-20,'FORNO · PARCHEGGIA QUI',{fontSize:11,color:'#ffe7a6',fontFamily:'monospace'}).setOrigin(.5).setDepth(1200);}
  this.restore();this.drawVehicle();
 }
 get vehicle(){return this.data.vehicle;}
 get driving(){return this.vehicle.driving&&this.vehicle.zone===this.zone;}
 restore(){const s=this.scene,saved=this.data.zones[this.zone];
  if(saved){s.enemies.forEach((e,i)=>{const v=saved.enemies[i];if(!v)return;Object.assign(e,{x:v.x,y:v.y,hp:v.hp,ko:v.ko});e.specialAbility.energy=v.energy;e.specialAbility.restore(v.specialState);if(e.specialAbility.rage)e.specialAbility.rage.completed=!!v.bossRage;e.render();if(e.ko){e.bar.setVisible(false);e.label.setVisible(false);}});s.crates.forEach((c,i)=>{const v=saved.crates[i];if(v){c.hp=v.hp;c.destroyed=v.destroyed;if(v.destroyed)c.view.destroy();}});for(const id of saved.collected){s.director.collected.add(id);const p=s.director.points.find(p=>p.id===id);p?.art.setAlpha(.25);p?.marker.setText('✓ '+p.label).setAlpha(.5);}}
  for(const p of s.party){const v=this.data.party.find(v=>v.id===p.id);if(v)Object.assign(p,{hp:v.hp,special:v.special,ko:v.ko,x:v.x,y:v.y});}const active=s.party.findIndex(p=>p.id===this.data.activeId&&!p.ko);if(active>=0)s.activeIndex=active;
  s.party.forEach(p=>p.hidden=this.driving);if(this.driving)this.syncPassengers();
 }
 drawVehicle(){this.car?.destroy();if(this.vehicle.zone!==this.zone)return;this.car=drawCar(this.scene,this.vehicle.x,this.vehicle.y,this.vehicle.skin,1.15).setRotation(this.vehicle.angle||0);}
 syncPassengers(){for(const p of this.scene.party){p.x=this.vehicle.x;p.y=this.vehicle.y;p.hidden=true;}}
 save(){const s=this.scene;s.app.progress.zoneRun=this.session.capture(s);s.party.forEach(p=>s.app.progress.equipment[p.id]={...p.loadout.slots});const okay=s.app.save.save(s.app.progress);document.querySelector('#save-status').textContent=okay?'ZONA SALVATA':'SALVATAGGIO NON DISPONIBILE';}
 nearbyDoor(){const p=this.driving?this.vehicle:this.scene.player;return this.doors.find(d=>Math.hypot(d.x-p.x,d.y-p.y)<85);}
 hint(){if(this.busy)return '';const d=this.nearbyDoor();if(d)return 'A / J · '+d.label;if(this.driving)return 'DIREZIONI guida · B precisione · A scendi';const s=this.scene,v=this.vehicle;if(v.zone===this.zone&&Math.hypot(s.player.x-v.x,s.player.y-v.y)<105)return s.player.id==='spit'?'A / J · SALI IN AUTO':'Q / CAMBIA · Serve Spit';return '';}
 interact(){const s=this.scene;if(this.busy)return true;const d=this.nearbyDoor();if(d){this.travel(d);return true;}
  if(this.zone==='street'&&Math.hypot(s.player.x-s.gate.x,s.player.y-s.gate.y)<100){if(!this.driving){s.toast('Raggiungi il circuito al volante con Spit.');return true;}if(!s.mission.canExit()){s.toast('Prima completa il lavoro nel forno dell’officina.');return true;}this.save();s.finishChapter();return true;}
  if(this.driving){this.exitCar();return true;}
  const v=this.vehicle;if(v.zone===this.zone&&Math.hypot(s.player.x-v.x,s.player.y-v.y)<105){if(s.player.id!=='spit'){s.toast('Serve Spit al volante · Q / CAMBIA');return true;}if(!s.mission.complete('parts')){s.toast('Prima cerca i tre componenti nell’officina.');return true;}if(!s.mission.complete('guards')){s.toast('Prima libera il deposito dalle guardie.');return true;}v.owned=true;v.driving=true;v.speed=0;if(!s.mission.complete('car'))s.mission.record('car');this.syncPassengers();this.save();s.toast('Al volante · direzioni per guidare · B manovra lenta · A porte / scendi');return true;}return false;
 }
 exitCar(){const s=this.scene,v=this.vehicle;const spots=[[0,90],[0,-90],[100,0],[-100,0]].map(([x,y])=>({x:v.x+x,y:v.y+y}));const spot=spots.find(p=>!s.map.blocked(p.x,p.y)&&!s.map.blocked(p.x+42,p.y));if(!spot){s.toast('Fai spazio accanto all’auto prima di scendere.');return;}v.driving=false;v.speed=0;s.app.input.clear();s.lastInteraction=s.now;s.party.forEach((p,i)=>{p.hidden=false;p.x=spot.x+i*42;p.y=spot.y;});this.save();}
 travel(door){if(this.busy)return;const s=this.scene;this.busy=true;this.save();s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();s.audio.stop();s.bus.emit('zone:loading',ZONE_NAMES[door.to]);s.time.delayedCall(s.app.settings.reduceMotion?0:220,()=>{this.session.enter(door.to,door.spawn);s.app.progress.zoneRun=this.session.data;s.loadChapter(s.mission.state.index,{zoneTransition:true});s.bus.emit('zone:loaded');});}
 update(dt){const s=this.scene,v=this.vehicle;if(this.busy)return;
  if(this.driving){const input=s.app.input;input.consume('special');input.consume('switch');const m=input.movement(),speed=input.held.has('special')?75:185;v.speed=Math.hypot(m.x,m.y)*speed;if(v.speed){const angle=Math.atan2(m.y,m.x);if(vehicleFits(s.map,v.x,v.y,angle))v.angle=angle;const dx=m.x*speed*dt,dy=m.y*speed*dt;if(vehicleFits(s.map,v.x+dx,v.y,v.angle))v.x+=dx;if(vehicleFits(s.map,v.x,v.y+dy,v.angle))v.y+=dy;}this.car?.setPosition(v.x,v.y).setRotation(v.angle).setDepth(v.y+1);this.syncPassengers();if(input.consume('attack')){this.interact();if(!s.activeMission)return;}
   if(this.zone==='workshop'&&!s.mission.complete('tuned')&&s.mission.complete('parts')&&parkedInside(v,PARKING)){this.paint();return;}}
  if(s.now-this.autosave>2000){this.save();this.autosave=s.now;}
 }
 paint(){const s=this.scene;this.busy=true;s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();this.vehicle.speed=0;s.mission.record('parked');const glow=s.add.rectangle(1010,270,160,160,0xd99ce3,.5).setDepth(1800);s.audio.effect('special');s.tweens.add({targets:glow,alpha:0,duration:s.app.settings.reduceMotion?250:1200,onComplete:()=>{glow.destroy();this.vehicle.skin='tuned';s.mission.record('tuned');this.drawVehicle();this.save();s.playDialogue({kicker:'SPIT CUSTOMS · TRASFORMAZIONE COMPLETATA',art:SPIT_REVEAL,lines:[zoneLine('spit.zone.transformed.01'),zoneLine('click.zone.transformed.01')],onComplete:()=>{this.busy=false;s.resumeAction();}});}});}
}
