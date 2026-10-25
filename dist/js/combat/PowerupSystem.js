import {runSquadPower,markTwin} from './SquadPowerups.js';
import {selectedPower} from '../data/powerups.js';
import {powerGraphic,drawPower,pulseHeart} from './PowerupEffects.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const level=a=>Math.max(1,Math.min(4,a.stats.specialLevel||1));
export class PowerupSystem{
 constructor(scene){this.scene=scene;this.jobs=new Set();this.effects=new Set();}
 squad(a,start){return runSquadPower(this,a,start);}
 mark(a,e){markTwin(this,a,e);}
 mode(a){return selectedPower(this.scene.app?.settings,a.id)?.id||'base';}
 enemies(a,r){return this.scene.enemies.filter(e=>!e.ko&&distance(a,e)<=r&&this.scene.map.clearLine(a.x,a.y,e.x,e.y)).sort((x,y)=>distance(a,x)-distance(a,y));}
 job(a,duration,step,cleanup=()=>{}){const j={a,start:this.scene.now,duration,step,cleanup};this.jobs.add(j);return j;}
 pose(a,kind,duration,target=null){const g=powerGraphic(this.scene);this.job(a,duration,t=>{a.powerAngle=this.scene.app?.settings?.reduceMotion?0:Math.sin(t*Math.PI)*-10;drawPower(g,this.scene,a,kind,t,target);},()=>{a.powerAngle=0;g?.destroy();});}
 clear(){for(const j of this.jobs)j.cleanup();this.jobs.clear();for(const a of this.effects){a.powerGuard=null;a.powerShield=null;a.powerShard=null;a.powerLure=null;a.powerSilencedUntil=0;a.twinMark=null;}this.effects.clear();}
 update(){const s=this.scene;if(!s.activeMission)return;for(const j of [...this.jobs]){if(!this.jobs.has(j))continue;if(j.a.ko||j.a.hidden){j.cleanup();this.jobs.delete(j);continue;}const t=Math.min(1,Math.max(0,(s.now-j.start)/j.duration));j.step(t);if(t>=1&&this.jobs.has(j)){j.cleanup();this.jobs.delete(j);}}}
 hit(e,a,damage,stun=0){if(e.ko||!this.scene.map.clearLine(a.x,a.y,e.x,e.y))return;const before=e.hp;e.hit(damage,a);if(e.hp===before)return;const capped=e.boss?Math.min(stun,350):stun;e.stunUntil=Math.max(e.stunUntil||0,this.scene.now+capped);}
 moveToward(a,x,y,max){const s=this.scene,dist=Math.hypot(x-a.x,y-a.y),steps=Math.ceil(Math.min(dist,max)/6);for(let i=0;i<steps;i++){const dx=x-a.x,dy=y-a.y,d=Math.hypot(dx,dy)||1;s.map.move(a,dx/d*Math.min(6,d),dy/d*Math.min(6,d));}}
 click(a,start){const s=this.scene,mode=this.mode(a);if(mode==='base')return false;
  if(mode==='guard'){start();a.powerGuard={until:s.now+2400};this.effects.add(a);const token=a.powerGuard,g=powerGraphic(s);this.job(a,2400,()=>{if(a.powerGuard===token)drawPower(g,s,a,'guard');else g?.clear();},()=>{if(a.powerGuard===token)a.powerGuard=null;g?.destroy();});return true;}
  const target=this.enemies(a,210)[0];if(!target){s.toast('Avvicinati a un nemico libero: conservi la carica.');return true;}
  start();a.actionLocked=true;a.moving=false;a.invulnerableUntil=s.now+650;const g=powerGraphic(s);let hits=0,last=0;
  this.job(a,1050,t=>{a.face?.(target.x-a.x,target.y-a.y);if(t<.31&&!target.ko&&distance(a,target)>65)this.moveToward(a,target.x,target.y,Math.min(8,(t-last)*500));last=t;drawPower(g,s,a,'boxer',(t*3)%1,target);a.powerAngle=s.app.settings.reduceMotion?0:Math.sin(t*6*Math.PI)*11;
   for(const threshold of [.36,.58,.8]){const index=[.36,.58,.8].indexOf(threshold);if(t>=threshold&&hits===index){hits++;if(!target.ko&&distance(a,target)<120){this.hit(target,a,(index===2?60:30)+5*(level(a)-1),index===2?700:200);s.fx?.word(target.x,target.y,index===2?'BAM!':'POW!',0xf7d84a,true);}}}
  },()=>{a.actionLocked=false;a.powerAngle=0;g?.destroy();});return true;
 }
 absorb(a,amount,source){const s=this.scene;
  if(a.powerShard&&s.now<a.powerShard.until){a.powerShard=null;s.fx?.word(a.x,a.y,'CRACK!',0x85eeef,true);return 0;}
  if(a.powerGuard&&s.now<a.powerGuard.until){a.powerGuard=null;a.invulnerableUntil=s.now+300;s.fx?.word(a.x,a.y,'PARATA!',0xf7d84a,true);if(source&&!source.ko&&typeof source.hit==='function'&&distance(a,source)<160&&s.map.clearLine(a.x,a.y,source.x,source.y)){this.hit(source,a,90+10*(level(a)-1),600);this.pose(a,'boxer',400,source);}return 0;}
  const shield=a.powerShield;if(shield&&s.now<shield.until){const used=Math.min(amount,shield.hp);shield.hp-=used;amount-=used;if(shield.hp<=0)a.powerShield=null;s.fx?.word(a.x,a.y,'SCUDO',0xa3d1a2);}return amount;
 }
 shield(a,hp,duration){const s=this.scene;a.powerShield={hp,until:s.now+duration};this.effects.add(a);const token=a.powerShield,g=powerGraphic(s);this.job(a,duration,()=>{if(a.powerShield===token)drawPower(g,s,a,'shield');else g?.clear();},()=>{if(a.powerShield===token)a.powerShield=null;g?.destroy();});}
 luca(a,start){const s=this.scene,mode=this.mode(a),targets=this.enemies(a,320).slice(0,3);
  if(mode==='sentinel'){start();this.sentinel(a);return true;}
  if(!targets.length){s.toast('Nessun bersaglio raggiungibile: conservi la carica.');return true;}
  if(mode==='chain'&&!targets.some(e=>distance(a,e)<125)){s.toast('Avvicinati per la presa da judo: conservi la carica.');return true;}
  start();a.invulnerableUntil=s.now+700;
  if(mode==='chain'){const close=targets.find(e=>distance(a,e)<125);if(close){this.throwEnemy(a,close,true);return true;}}
  for(const e of targets){if(distance(a,e)<125)this.throwEnemy(a,e,false);else this.bee(a,e,75+5*(level(a)-1));}return true;
 }
 throwEnemy(a,e,chain){const s=this.scene,g=powerGraphic(s),origin={x:e.x,y:e.y},other=chain?this.enemies(e,185).find(n=>n!==e):null;
  const dx=e.x-a.x,dy=e.y-a.y,n=Math.hypot(dx,dy)||1,end=other?{x:other.x,y:other.y}:{x:e.x+dx/n*65,y:e.y+dy/n*65};let hit=false;
  a.actionLocked=true;a.moving=false;if(!e.boss){e.stunUntil=Math.max(e.stunUntil||0,s.now+800);e.attackAt=0;e.specialAbility?.cancel();}
  this.job(a,700,t=>{a.face?.(e.x-a.x,e.y-a.y);drawPower(g,s,a,'judo',t,e);a.powerAngle=s.app.settings.reduceMotion?0:Math.sin(t*Math.PI)*20;
   if(!e.boss&&!e.ko){const q=Math.max(0,Math.min(1,(t-.2)/.6));this.moveToward(e,origin.x+(end.x-origin.x)*q,origin.y+(end.y-origin.y)*q,14);e.powerLift=s.app.settings.reduceMotion?0:Math.sin(q*Math.PI)*38;e.powerAngle=s.app.settings.reduceMotion?0:q*200;e.render?.();}
   if(t>=.8&&!hit){hit=true;if(!e.ko){this.hit(e,a,115+5*(level(a)-1),900);s.fx?.word(e.x,e.y,e.boss?'COLPO!':'IPPON!',0xffdf68,true);s.fx?.burst(e.x,e.y,0x90beee,70);if(other&&!other.ko&&distance(e,other)<95&&s.map.clearLine(e.x,e.y,other.x,other.y))this.hit(other,a,70,650);}}
  },()=>{a.actionLocked=false;a.powerAngle=0;e.powerAngle=0;e.powerLift=0;e.render?.();g?.destroy();});
 }
 bee(a,target,damage){const s=this.scene,g=powerGraphic(s),origin={x:a.x,y:a.y};let hit=false;this.job(a,550,t=>{const point={x:origin.x+(target.x-origin.x)*t,y:origin.y+(target.y-origin.y)*t};drawPower(g,s,a,'bee',t,point);if(t>=1&&!hit){hit=true;if(!target.ko){this.hit(target,a,damage,650);s.fx?.word(target.x,target.y,'ZZZT!',0xffdf68,true);}}},()=>g?.destroy());}
 sentinel(a){const s=this.scene,g=powerGraphic(s);let shots=0,next=s.now+450;this.pose(a,'judo',400);this.job(a,4000,t=>{drawPower(g,s,a,'bee',t*3);if(shots<3&&s.now>=next){const e=this.enemies(a,230)[0];if(e){this.bee(a,e,40+5*(level(a)-1));shots++;next=s.now+1050;}}},()=>g?.destroy());}
 heal(p,amount,revive=true){if(p.ko&&!revive)return;const s=this.scene,wasKO=p.ko,before=p.hp;p.hp=Math.min(p.data.hp,p.hp+amount);if(revive){p.ko=false;p.state='IDLE';p.stunUntil=0;p.invulnerableUntil=s.now+1300;}
  s.floatText(p.x,p.y-90,'+'+(p.hp-before),'#a3d1a2');pulseHeart(s,p,wasKO);if(wasKO){const tilt=80;this.job(p,500,t=>{p.reviveAngle=s.app.settings.reduceMotion?0:tilt*(1-t);},()=>{p.reviveAngle=0;});}
 }
 anna(a,start){const s=this.scene,mode=this.mode(a),allies=s.party.filter(p=>!p.hidden&&distance(a,p)<=380&&s.map.clearLine(a.x,a.y,p.x,p.y));if(!allies.some(p=>p.ko||p.hp<p.data.hp)){s.toast('La squadra vicina è in forma: conservi la cura.');return true;}
  start();this.pose(a,'kit',750);const priority=[...allies].sort((x,y)=>Number(y.ko)-Number(x.ko)||x.hp/x.data.hp-y.hp/y.data.hp)[0];
  for(const p of allies){this.heal(p,mode==='triage'?(p===priority?90:35):mode==='renew'?35:65);if(mode==='renew'){let ticks=0;this.job(p,3000,t=>{while(ticks<3&&t>=(ticks+1)/3){ticks++;if(distance(a,p)<=380&&s.map.clearLine(a.x,a.y,p.x,p.y))this.heal(p,10,false);}});}}
  if(mode==='triage')this.shield(priority,40,3000);
  for(const e of this.enemies(a,150)){e.attackAt=0;if(!e.boss)e.stunUntil=Math.max(e.stunUntil||0,s.now+1000);}return true;
 }
}
