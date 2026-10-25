import {pulseHeart} from './PowerupEffects.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
/** One press starts a two-second rescue. Simulation time freezes while paused. */
export class RevivalSystem{
 constructor(scene){this.scene=scene;this.active=null;this.glow=scene.add.graphics().setDepth(2400);this.label=scene.add.text(0,0,'',{fontFamily:'Arial',fontSize:14,fontStyle:'bold',color:'#142b27',backgroundColor:'#a8ffd2',padding:{x:10,y:6},align:'center'}).setOrigin(.5).setDepth(2450).setVisible(false);}
 nearest(actor=this.scene.player){if(!actor||actor.ko||actor.hidden||this.scene.race||this.scene.zoneController?.driving)return null;return this.scene.party.filter(p=>p!==actor&&p.ko&&!p.hidden&&distance(actor,p)<=90&&this.scene.map.clearLine(actor.x,actor.y,p.x,p.y)).sort((a,b)=>distance(actor,a)-distance(actor,b))[0]||null;}
 hint(){if(this.active)return `RIANIMAZIONE · ${Math.max(0,2-(this.scene.now-this.active.at)/1000).toFixed(1)} s`;const target=this.nearest();return target?'A / J · RIANIMA '+target.data.name.toUpperCase():'';}
 tryStart(fresh=true){if(this.active)return true;const s=this.scene,a=s.player,target=this.nearest(a);if(!target)return false;if(!fresh)return true;if(a.actionLocked||s.now<a.stunUntil){s.toast('Riprenditi dal colpo, poi premi A / J per rianimare.');return true;}
  a.actionLocked=true;a.moving=false;a.face?.(target.x-a.x,target.y-a.y);this.active={actor:a,target,at:s.now};s.app.input.consume('special');s.fx?.word(target.x,target.y,'SOCCORSO',0xa8ffd2);return true;
 }
 cancel(reason=''){if(!this.active)return;const a=this.active.actor;a.actionLocked=false;a.powerAngle=0;this.active=null;this.glow.clear();this.label.setVisible(false);if(reason)this.scene.toast(reason);}
 onHit(actor){if(this.active?.actor===actor)this.cancel('RIANIMAZIONE INTERROTTA · Sei stato colpito. Premi di nuovo A / J per riprovare.');}
 update(){const s=this.scene;if(!s.activeMission)return;const job=this.active;if(!job)return;const {actor,target,at}=job;
  if(actor!==s.player||actor.ko||actor.hidden||!target.ko||target.hidden||distance(actor,target)>100||!s.map.clearLine(actor.x,actor.y,target.x,target.y)){this.cancel();return;}
  actor.moving=false;actor.powerAngle=s.app.settings.reduceMotion?0:Math.sin((s.now-at)/180)*5;
  if(s.now-at<2000)return;
  this.cancel();target.hp=target.data.hp*.15;target.special=100;target.ko=false;target.state='IDLE';target.stunUntil=0;target.actionLocked=false;target.moving=false;target.invulnerableUntil=s.now+750;
  pulseHeart(s,target,true);s.fx?.word(target.x,target.y,'RIANIMATO!',0xa8ffd2,true);s.audio.effect('heal');s.floatText(target.x,target.y-95,'15% VITA · SPECIALE 100%','#b1ffce');
  target.reviveAngle=s.app.settings.reduceMotion?0:80;s.powers?.job(target,500,t=>{target.reviveAngle=s.app.settings.reduceMotion?0:80*(1-t);},()=>{target.reviveAngle=0;});
  s.bus.emit('hud:update',s);s.adventureController?.save();s.facilityController?.save();s.zoneController?.save();
 }
 render(){const s=this.scene,target=this.active?.target||this.nearest();this.glow.clear();if(!target){this.label.setVisible(false);return;}
  const g=this.glow,x=target.x,y=target.y,progress=this.active?Math.min(1,(s.now-this.active.at)/2000):0;
  g.fillStyle(0x63e7ac,.2).fillEllipse(x,y+2,100,38).lineStyle(3,0xb1ffce).strokeEllipse(x,y+2,100,38).fillStyle(0xb1ffce).fillRect(x-5,y-62,10,30).fillRect(x-15,y-52,30,10);
  if(this.active){g.fillStyle(0x173a32).fillRoundedRect(x-44,y-100,88,9,4).fillStyle(0xa8ffd2).fillRoundedRect(x-42,y-98,Math.max(1,84*progress),5,2);}
  this.label.setPosition(Math.max(110,Math.min(s.map.width-110,x)),Math.min(y+40,s.map.height-20)).setText(this.active?`RIANIMAZIONE · ${Math.max(0,2-(s.now-this.active.at)/1000).toFixed(1)} s`:'RIANIMA '+target.data.name.toUpperCase()+' · A / J').setVisible(true);
 }
}
