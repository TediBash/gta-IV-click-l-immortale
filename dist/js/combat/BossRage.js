/** One health-triggered attack. Saving mid-warning restarts its readable telegraph. */
export class BossRage {
 constructor(actor){this.actor=actor;this.scene=actor.scene;this.completed=false;this.pending=null;this.marker=this.scene.add.graphics().setDepth(5);}
 limitDamage(damage){return this.completed?damage:Math.min(damage,Math.max(0,this.actor.hp-Math.ceil(this.actor.maxHp/2)));}
 cancel(){this.pending=null;this.marker.clear();}
 update(dt,target){
  const a=this.actor,s=this.scene;if(a.ko){this.cancel();return false;}
  if(this.completed)return false;
  if(this.pending){
   if(s.now<this.pending.at)return true;
   const aim=this.pending,cross=a.profile.rage==='cross';this.cancel();this.completed=true;a.cooldown=s.now+1400;
   s.fx?.burst(aim.x,aim.y,0xffb865,cross?100:220);s.fx?.word(aim.x,aim.y,cross?'INCROCIO!':'ONDA!',0xffb865,true);
   if(cross){const flash=s.add.graphics().setDepth(6).fillStyle(0xffcc8c,.5).fillRect(aim.x-300,aim.y-44,600,88).fillRect(aim.x-44,aim.y-300,88,600);s.tweens.add({targets:flash,alpha:0,duration:300,onComplete:()=>flash.destroy()});}
   for(const hero of s.party){const dx=Math.abs(hero.x-aim.x),dy=Math.abs(hero.y-aim.y),inside=cross?(dx<300&&dy<44)||(dy<300&&dx<44):Math.hypot(dx,dy)<220;
    if(!hero.ko&&!hero.hidden&&inside&&s.map.clearLine(aim.x,aim.y,hero.x,hero.y))hero.damage(Math.round(36*s.difficulty.multiplier),a);
   }
   s.adventureController?.save();s.facilityController?.save();s.zoneController?.save();return true;
  }
  if(a.hp>Math.ceil(a.maxHp/2)||!target)return false;
  const cross=a.profile.rage==='cross',x=cross?target.x:a.x,y=cross?target.y:a.y;
  this.pending={x,y,at:s.now+1200};a.attackAt=0;s.enemySpecialUntil=s.now+2000;
  this.marker.clear().fillStyle(0xffb865,.22).lineStyle(3,0xffcf8e,.9);
  if(cross)this.marker.fillRect(x-300,y-44,600,88).fillRect(x-44,y-300,88,600).strokeRect(x-300,y-44,600,88).strokeRect(x-44,y-300,88,600);
  else this.marker.fillCircle(x,y,220).strokeCircle(x,y,220);
  s.bus.emit('special:activated',{name:a.profile.name,ability:cross?'50% · INCROCIO · SCHIVA IN DIAGONALE':'50% · ONDA D’URTO · ESCI DAL CERCHIO'});return true;
 }
}
