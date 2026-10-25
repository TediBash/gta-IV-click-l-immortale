/** A visible, collision-aware lunge. A locked destination makes dodging possible. */
export function launchFlyingKick(s,actor,start){
 const target=s.enemies.filter(e=>!e.ko&&s.map.clearLine(actor.x,actor.y,e.x,e.y)).sort((a,b)=>Math.hypot(a.x-actor.x,a.y-actor.y)-Math.hypot(b.x-actor.x,b.y-actor.y))[0];
 if(!target){s.toast('Nessun bersaglio raggiungibile: avvicinati e conserva il calcio.');return true;}
 start();const origin={x:actor.x,y:actor.y},dx=target.x-origin.x,dy=target.y-origin.y,length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length;
 const end={x:target.x-ux*35,y:target.y-uy*35},progress={t:0};let hit=false;
 actor.face(dx,dy);actor.actionLocked=true;actor.moving=false;actor.kickAngle=ux<0?-24:24;
 const leg=s.add.graphics().setDepth(actor.y+5);leg.lineStyle(16,0x152c3b).lineBetween(0,0,37,0);leg.lineStyle(10,0x344b68).lineBetween(0,0,36,0);leg.fillStyle(0xf6ecd7).fillRoundedRect(28,-7,28,16,5);
 const duration=Math.min(1100,Math.max(550,length*1.65));actor.invulnerableUntil=s.now+duration+120;
 const cleanup=()=>{actor.actionLocked=false;actor.kickLift=0;actor.kickAngle=0;leg.destroy();actor.render?.(actor===s.player,s.now);};
 s.tweens.add({targets:progress,t:1,duration,onUpdate:()=>{
  if(!s.activeMission||actor.ko)return;const flight=Math.max(0,Math.min(1,(progress.t-.16)/.7)),desired={x:origin.x+(end.x-origin.x)*flight,y:origin.y+(end.y-origin.y)*flight};
  const steps=Math.ceil(Math.hypot(desired.x-actor.x,desired.y-actor.y)/7);for(let i=0;i<steps;i++){const mx=desired.x-actor.x,my=desired.y-actor.y,d=Math.hypot(mx,my)||1;s.map.move(actor,mx/d*Math.min(d,7),my/d*Math.min(d,7));}
  actor.kickLift=Math.sin(flight*Math.PI)*(s.app.settings.reduceMotion?8:42);leg.setPosition(actor.x,actor.y-24-actor.kickLift).setRotation(Math.atan2(dy,dx)).setDepth(actor.y+5).setAlpha(flight>0&&progress.t<.94?1:0);actor.render?.(actor===s.player,s.now);
  if(!hit&&flight>.1&&!target.ko&&Math.hypot(target.x-actor.x,target.y-actor.y)<90&&s.map.clearLine(actor.x,actor.y,target.x,target.y)){
   hit=true;target.hit(95+10*actor.stats.specialLevel,actor);target.stunUntil=s.now+850;s.fx?.word(target.x,target.y,'WHAM!',0xf5d090,true);s.fx?.burst(target.x,target.y,0xf5d090,90);
  }
 },onComplete:cleanup,onStop:cleanup});return true;
}
