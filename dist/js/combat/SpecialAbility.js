import {PowerupSystem} from './PowerupSystem.js';
import {selectedPower} from '../data/powerups.js';
import {signature,crashDrone} from './SignatureEffects.js';
import {launchFlyingKick} from './FlyingKick.js';
import {nearestEnemy,driftPoint} from './DriftPath.js';
import {drawCar} from '../world/RaceController.js';
import {directionVector} from './PunchAttack.js';
export class SpecialAbility{constructor(scene){this.scene=scene;}canActivate(actor){return !actor.ko&&!actor.hidden&&!actor.actionLocked&&actor.special>=100&&this.scene.now>=actor.stunUntil;}get powers(){return this.scene.powers??=new PowerupSystem(this.scene);}start(actor){actor.special=0;this.scene.fx?.special(actor);signature(this.scene,actor);this.scene.bus.emit('special:activated',{name:actor.data.name,ability:selectedPower(this.scene.app?.settings,actor.id)?.name||actor.data.special});this.scene.audio.say(actor.id,'special',3);this.scene.audio.effect('special');}}
export class FuriaImmortaleAbility extends SpecialAbility{
 activate(actor){if(!this.canActivate(actor))return false;if(this.powers.click(actor,()=>this.start(actor)))return true;this.start(actor);this.powers.pose(actor,'boxer',750);actor.invulnerableUntil=this.scene.now+800;for(let i=0;i<actor.stats.specialLevel;i++)this.scene.time.delayedCall(i*180,()=>{if(!this.scene.activeMission)return;const ring=this.scene.add.circle(actor.x,actor.y-20,30,0xf7d84a,.12).setStrokeStyle(5,0xf7d84a).setDepth(actor.y+10);this.scene.tweens.add({targets:ring,scale:7,alpha:0,duration:500,onComplete:()=>ring.destroy()});this.scene.enemies.forEach(e=>{if(!e.ko&&Math.hypot(e.x-actor.x,e.y-actor.y)<230)e.hit(65,actor);});});if(!this.scene.app.settings.reduceMotion)this.scene.cameras.main.shake(180,.003);return true;}
}
export class DroneStrikeAbility extends SpecialAbility{
 activate(actor){if(!this.canActivate(actor))return false;if(this.powers.squad(actor,()=>this.start(actor)))return true;const s=this.scene,targets=nearbyEnemies(s,actor,700).sort((a,b)=>Math.hypot(a.x-actor.x,a.y-actor.y)-Math.hypot(b.x-actor.x,b.y-actor.y));if(!targets.length){s.toast('Nessun bersaglio libero per il drone.');return true;}this.start(actor);actor.invulnerableUntil=this.scene.now+800;for(let i=0;i<actor.stats.specialLevel;i++)crashDrone(s,actor,targets[i%targets.length],i*180);return true;}
}

export class RecoveryDriftAbility extends SpecialAbility {
 activate(actor){
  if(!this.canActivate(actor))return false;if(this.powers.squad(actor,()=>this.start(actor)))return true;const s=this.scene,target=nearestEnemy(actor,s.enemies);if(!target){s.toast('Nessun nemico da recuperare: conserva la derapata!');return true;}this.start(actor);
  const start={x:actor.x,y:actor.y},car=drawCar(s,start.x,start.y,'tuned',1.2).setDepth(actor.y+20),progress={t:0},hit=new Set();let smokeAt=0,previous={...start};
  const route=[{...start}];let cursor={...start};
  const direct=s.map.clearLine(start.x,start.y,target.x,target.y),curveClear=direct&&Array.from({length:21},(_,i)=>driftPoint(start,target,i/20)).every(p=>!s.map.blocked(p.x,p.y));
  if(!direct){for(let i=0;i<90&&Math.hypot(cursor.x-target.x,cursor.y-target.y)>45;i++){const next=s.map.nextStep(cursor.x,cursor.y,target.x,target.y);if(Math.hypot(next.x-cursor.x,next.y-cursor.y)<1)break;cursor={...next};route.push(cursor);}route.push({x:target.x,y:target.y});}
  s.tweens.add({targets:progress,t:1,duration:Math.min(2400,Math.max(900,(direct?Math.hypot(target.x-start.x,target.y-start.y):route.length*40)*2.2)),onUpdate:()=>{
   if(!s.activeMission)return;let desired;
   if(direct)desired=curveClear?driftPoint(start,target,progress.t):{x:start.x+(target.x-start.x)*progress.t,y:start.y+(target.y-start.y)*progress.t};else{const q=progress.t*(route.length-1),i=Math.min(route.length-2,Math.floor(q)),f=q-i;desired={x:route[i].x+(route[i+1].x-route[i].x)*f,y:route[i].y+(route[i+1].y-route[i].y)*f};}
   const proxy={x:car.x,y:car.y},steps=Math.ceil(Math.hypot(desired.x-proxy.x,desired.y-proxy.y)/7);
   for(let i=0;i<steps;i++){const dx=desired.x-proxy.x,dy=desired.y-proxy.y,d=Math.hypot(dx,dy)||1;s.map.move(proxy,dx/d*Math.min(d,7),dy/d*Math.min(d,7));}
   car.setPosition(proxy.x,proxy.y).setDepth(proxy.y+10).setRotation(Math.atan2(proxy.y-previous.y,proxy.x-previous.x)+Math.sin(progress.t*Math.PI)*.4);
   if(s.now>smokeAt){s.fx?.burst(proxy.x,proxy.y,0xd1c9af,24);smokeAt=s.now+110;}previous={...proxy};
   for(const e of s.enemies)if(!e.ko&&!hit.has(e)&&Math.hypot(e.x-car.x,e.y-car.y)<95&&s.map.clearLine(car.x,car.y,e.x,e.y)){hit.add(e);e.hit(150+actor.stats.specialLevel*10,actor);e.stunUntil=s.now+1300;s.fx?.word(e.x,e.y,'SKRRT!',0xf7d84a,true);}
  },onComplete:()=>car.destroy()});return true;
 }
}

export class LuxuryDistractionAbility extends SpecialAbility {
 activate(actor){if(!this.canActivate(actor))return false;if(this.powers.squad(actor,()=>this.start(actor)))return true;this.start(actor);const s=this.scene;for(const e of s.enemies)if(!e.ko&&Math.hypot(e.x-actor.x,e.y-actor.y)<300&&s.map.clearLine(actor.x,actor.y,e.x,e.y)){e.specialAbility?.cancel();e.attackAt=0;e.stunUntil=s.now+2600;s.floatText(e.x,e.y-90,'DISTRATTO','#e8add7');}for(const p of s.party)if(!p.ko)p.hp=Math.min(p.data.hp,p.hp+18);return true;}
}
export class FlyingKickAbility extends SpecialAbility {
 activate(actor){if(!this.canActivate(actor))return false;if(this.powers.squad(actor,()=>this.start(actor)))return true;return launchFlyingKick(this.scene,actor,()=>this.start(actor));}
}

export function nearbyEnemies(scene,actor,radius){return scene.enemies.filter(e=>!e.ko&&Math.hypot(e.x-actor.x,e.y-actor.y)<=radius&&scene.map.clearLine(actor.x,actor.y,e.x,e.y));}
export class DiamondStormAbility extends SpecialAbility{
 activate(actor){if(!this.canActivate(actor))return false;if(this.powers.squad(actor,()=>this.start(actor)))return true;this.start(actor);const s=this.scene;for(const e of nearbyEnemies(s,actor,300)){s.fx?.beam(actor.x,actor.y,e.x,e.y,0x89dfdf);s.fx?.burst(e.x,e.y,0x89dfdf,65);e.hit(70+10*actor.stats.specialLevel,actor);e.stunUntil=Math.max(e.stunUntil||0,s.now+700);}return true;}
}
export class VoiceWaveAbility extends SpecialAbility{
 activate(actor){if(!this.canActivate(actor))return false;if(this.powers.squad(actor,()=>this.start(actor)))return true;this.start(actor);const s=this.scene;for(const e of nearbyEnemies(s,actor,300)){e.hit(45,actor);e.attackAt=0;e.stunUntil=s.now+2300;s.fx?.word(e.x,e.y,'ZITTO!',0xffb967);}for(const p of s.party)if(!p.ko&&p!==actor)p.special=Math.min(100,p.special+20);return true;}
}
export class BeeJudoAbility extends SpecialAbility{
 activate(actor){if(!this.canActivate(actor))return false;return this.powers.luca(actor,()=>this.start(actor));}
}
export class VitalPulseAbility extends SpecialAbility{
 activate(actor){if(!this.canActivate(actor))return false;return this.powers.anna(actor,()=>this.start(actor));}
}
export class TwinStrikeAbility extends SpecialAbility{
 activate(actor){if(!this.canActivate(actor))return false;if(this.powers.squad(actor,()=>this.start(actor)))return true;this.start(actor);const s=this.scene,partner=s.party.find(p=>p.id===(actor.id==='paula'?'nico':'paula')&&!p.ko&&!p.hidden&&Math.hypot(p.x-actor.x,p.y-actor.y)<280);if(partner){actor.invulnerableUntil=s.now+800;partner.invulnerableUntil=s.now+800;s.fx?.beam(actor.x,actor.y,partner.x,partner.y,0xc9b7f0);s.fx?.word(partner.x,partner.y,'DOPPIO!',0xc9b7f0,true);}const targets=new Set([...nearbyEnemies(s,actor,190),...(partner?nearbyEnemies(s,partner,190):[])]);for(const e of targets){const before=e.hp;e.hit(partner?130:75,actor);if(actor.id==='paula'&&e.hp<before)this.powers.mark(actor,e);e.stunUntil=Math.max(e.stunUntil||0,s.now+(partner?1400:700));s.fx?.burst(e.x,e.y,0xc9b7f0,85);}return true;}
}
