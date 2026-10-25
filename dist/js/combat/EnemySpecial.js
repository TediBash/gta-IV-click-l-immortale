import {BossRage} from './BossRage.js';
import {AlligatorCharge} from './AlligatorCharge.js';
import {ENEMY_ABILITIES,ENEMY_LOADOUTS,abilityIds} from '../data/enemyAbilities.js';
export const ENEMY_SPECIALS=Object.fromEntries(Object.entries(ENEMY_LOADOUTS).map(([type,ids])=>[type,ENEMY_ABILITIES[ids[0]]]));
/** A rotation of 1–3 abilities; Extreme telegraphs and executes two in one cast. */
export class EnemySpecial{
 constructor(actor){
  this.actor=actor;this.scene=actor.scene;this.shieldUntil=0;this.echo=null;this.cursor=0;
  if(actor.type==='alligator')this.charge=new AlligatorCharge(actor);
  if(actor.boss&&actor.type!=='alligator')this.rage=new BossRage(actor);
  this.ids=abilityIds(actor.type,this.scene.difficulty);this.profile=ENEMY_SPECIALS[actor.type]||ENEMY_SPECIALS.guard;
  this.energy=this.scene.mission.config.enemySpecialReady?100:20;this.readyAt=0;this.pending=null;
  this.marker=this.scene.add.circle(actor.x,actor.y,this.profile.radius,0xc9a0ff,.14).setStrokeStyle(3,0xe0b8ff).setDepth(4).setVisible(false);
  this.extra=this.scene.add.graphics().setDepth(5);this.bar=this.scene.add.rectangle(actor.x,actor.y,40,3,0xd1a5ff);
 }
 cancel(){this.pending=null;this.echo=null;this.charge?.cancel();this.rage?.cancel();this.marker.setVisible(false);this.extra.clear();}
 snapshot(){return {cursor:this.cursor,cooldown:Math.max(0,this.readyAt-this.scene.now)};}
 restore(saved){if(!saved)return;this.cursor=Number.isInteger(saved.cursor)?saved.cursor%this.ids.length:0;this.readyAt=this.scene.now+Math.max(0,Math.min(8000,Number(saved.cooldown)||0));}
 center(p,aim){return ['self','shield','heal','rally'].includes(p.kind)?{x:this.actor.x,y:this.actor.y}:{x:aim.x,y:aim.y};}
 update(dt,target){
  const a=this.actor,s=this.scene;if(a.ko){this.cancel();this.bar.setVisible(false);return false;}
  if(!a.boss&&s.now<(a.powerSilencedUntil||0)){this.cancel();return false;}
  if(this.charge?.update(dt,target)){this.pending=null;this.echo=null;this.marker.setVisible(false);this.extra.clear();return true;}
  if(this.rage?.update(dt,target)){this.pending=null;this.echo=null;this.marker.setVisible(false);this.extra.clear();return true;}
  if(this.echo){if(s.now<this.echo.at)return true;const e=this.echo;this.echo=null;this.marker.setVisible(false);this.extra.clear();this.strike(e,e.profile);return true;}
  this.energy=Math.min(100,this.energy+dt*7);
  if(this.pending){
   if(s.now<this.pending.at){this.telegraph(this.pending);return true;}
   const cast=this.pending;this.pending=null;this.marker.setVisible(false);this.extra.clear();this.readyAt=s.now+8000;a.cooldown=s.now+900;
   // Both effects use the announced positions, even if a dash moves their caster.
   for(const {profile:p,center}of cast.moves){
    if(p.kind==='dash'){const steps=Math.ceil(Math.hypot(center.x-a.x,center.y-a.y)/8);for(let i=0;i<steps;i++){const dx=center.x-a.x,dy=center.y-a.y,n=Math.hypot(dx,dy)||1;s.map.move(a,dx/n*Math.min(8,n),dy/n*Math.min(8,n));}this.strike(a,p);}
    else this.strike(center,p);
    if(p.kind==='echo'){this.echo={...center,profile:p,at:s.now+1450};s.enemySpecialUntil=s.now+1700;this.marker.setPosition(center.x,center.y).setRadius(p.radius).setVisible(true);}
   }return true;
  }
  if(this.energy<100||s.now<this.readyAt||s.now<(s.enemySpecialUntil||0)||s.now<a.stunUntil||!target)return false;
  const count=Math.min(this.ids.length,s.difficulty.simultaneous||1),ids=Array.from({length:count},(_,i)=>this.ids[(this.cursor+i)%this.ids.length]);
  if(Math.hypot(a.x-target.x,a.y-target.y)>Math.max(...ids.map(id=>ENEMY_ABILITIES[id].range))||!s.map.clearLine(a.x,a.y,target.x,target.y))return false;
  this.cursor=(this.cursor+count)%this.ids.length;this.energy=0;
  this.pending={at:s.now+(s.mission.mission?.children?1400:1000),started:s.now,moves:ids.map(id=>({id,profile:ENEMY_ABILITIES[id],center:this.center(ENEMY_ABILITIES[id],target)}))};
  a.attackAt=0;s.enemySpecialUntil=this.pending.at+700;this.telegraph(this.pending);
  const names=ids.map(id=>ENEMY_ABILITIES[id].name).join(' + ');
  s.floatText(a.x,a.y-a.profile.size-25,'⚠ '+names,'#e0b8ff');s.bus.emit('special:activated',{name:a.profile.name,ability:names+' · SCHIVA O INTERROMPI'});return true;
 }
 telegraph(cast){
  const g=this.extra;g.clear();this.marker.setVisible(false);
  for(const {profile:p,center:c}of cast.moves){g.lineStyle(3,p.color,.9).fillStyle(p.color,.14);
   if(p.kind==='cross')g.fillRect(c.x-210,c.y-32,420,64).strokeRect(c.x-210,c.y-32,420,64).fillRect(c.x-32,c.y-210,64,420).strokeRect(c.x-32,c.y-210,64,420);
   else g.fillCircle(c.x,c.y,p.radius).strokeCircle(c.x,c.y,p.radius);
   if(p.kind==='dash')g.lineBetween(this.actor.x,this.actor.y,c.x,c.y);
   if(p.kind==='drone'){const t=this.scene.app?.settings?.reduceMotion?0:Math.min(1,(this.scene.now-cast.started)/(cast.at-cast.started)),x=this.actor.x+(c.x-this.actor.x)*t,y=this.actor.y-65+(c.y-this.actor.y+65)*t;g.lineStyle(3,p.color).lineBetween(x-16,y-10,x+16,y+10).lineBetween(x+16,y-10,x-16,y+10).fillStyle(p.color).fillRect(x-6,y-5,12,10);for(const dx of [-16,16])for(const dy of [-10,10])g.strokeCircle(x+dx,y+dy,7);}
   if(p.kind==='slow')for(let i=-1;i<=1;i++)g.lineBetween(c.x-65,c.y+i*25,c.x+65,c.y+i*25).lineBetween(c.x+i*25,c.y-65,c.x+i*25,c.y+65);
   if(p.kind==='heal')g.fillStyle(p.color,.8).fillRect(c.x-5,c.y-22,10,44).fillRect(c.x-22,c.y-5,44,10);
  }
 }
 strike(center,p=this.profile){
  const a=this.actor,s=this.scene;s.fx?.burst(center.x,center.y,p.color,p.radius);s.fx?.word(center.x,center.y,p.name,p.color,true);
  if(p.kind==='shield')this.shieldUntil=s.now+2400;
  if(['heal','rally'].includes(p.kind)){
   for(const e of s.enemies||[])if(!e.ko&&Math.hypot(e.x-center.x,e.y-center.y)<p.radius&&s.map.clearLine(center.x,center.y,e.x,e.y)){
    if(p.kind==='heal'){e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.16);s.fx?.burst(e.x,e.y,p.color,45);}else e.hasteUntil=s.now+3200;
   }return;
  }
  for(const hero of s.party){const dx=Math.abs(hero.x-center.x),dy=Math.abs(hero.y-center.y),inside=p.kind==='cross'?(dx<210&&dy<32)||(dy<210&&dx<32):Math.hypot(dx,dy)<p.radius;
   if(hero.ko||hero.hidden||!inside||!s.map.clearLine(center.x,center.y,hero.x,hero.y))continue;
   const child=!!s.mission.mission?.children,damage=Math.round((child?Math.min(8,p.damage):p.damage)*s.difficulty.multiplier),hit=hero.damage(damage,a);
   if(hit!==false&&p.kind==='slow')hero.enemySlowUntil=s.now+(child?600:1500);
   if(hit!==false&&p.kind==='drain')hero.special=Math.max(0,hero.special-25);
   if(p.kind==='shield'){const d=Math.hypot(hero.x-a.x,hero.y-a.y)||1;s.map.move(hero,(hero.x-a.x)/d*35,(hero.y-a.y)/d*35);}
  }
 }
 render(){const a=this.actor;if(a.ko)this.cancel();else if(this.scene.now<this.shieldUntil)this.marker.setPosition(a.x,a.y).setRadius(65).setVisible(true);else if(!this.echo)this.marker.setVisible(false);this.bar.setPosition(a.x,a.y-a.profile.size+7).setDisplaySize(Math.max(.1,this.energy*.4),3).setDepth(a.y+2).setVisible(!a.ko);}
}
