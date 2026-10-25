/** Two health-gated charges, saved by completed count; interrupted loads replay the warning. */
export class AlligatorCharge{
 constructor(actor){this.actor=actor;this.scene=actor.scene;this.completed=0;this.pending=null;this.running=null;this.readyAt=0;this.trailAt=0;this.lane=this.scene.add.graphics().setDepth(5);}
 threshold(){return Math.ceil(this.actor.maxHp*(2-this.completed)/3);}
 limitDamage(damage){return this.completed<2?Math.min(damage,Math.max(0,this.actor.hp-this.threshold())):damage;}
 cancel(){this.pending=null;this.running=null;this.lane.clear();}
 update(dt,target){
  const a=this.actor,s=this.scene;if(a.ko){this.cancel();return false;}
  if(this.pending){if(s.now<this.pending.at)return true;this.running={...this.pending,hit:new Set(),distance:0};this.pending=null;this.lane.clear();s.fx?.word(a.x,a.y,'TRAVOLGE!',0xffb56e,true);}
  if(this.running){
   const run=this.running,steps=Math.ceil(520*dt/7);let blocked=false;
   for(let i=0;i<steps;i++){
    const x=a.x,y=a.y,step=520*dt/steps;s.map.move(a,run.ux*step,run.uy*step);const moved=Math.hypot(a.x-x,a.y-y);run.distance+=moved;if(moved<step*.4){blocked=true;break;}
    for(const hero of s.party)if(!hero.ko&&!hero.hidden&&!run.hit.has(hero)&&Math.hypot(hero.x-a.x,hero.y-a.y)<75&&s.map.clearLine(a.x,a.y,hero.x,hero.y)){run.hit.add(hero);hero.damage(Math.round(34*s.difficulty.multiplier),a);s.map.move(hero,run.ux*28,run.uy*28);}
   }
   a.moving=true;a.direction=Math.abs(run.ux)>Math.abs(run.uy)?run.ux<0?'left':'right':run.uy<0?'up':'down';
   if(s.now>this.trailAt){s.fx?.burst(a.x,a.y,0x78beb3,24);this.trailAt=s.now+130;}
   if(blocked||run.distance>=run.length){this.completed++;this.running=null;this.readyAt=s.now+1200;a.cooldown=this.readyAt;s.adventureController?.save();}return true;
  }
  if(this.completed>=2||a.hp>this.threshold()||s.now<this.readyAt||!target)return false;
  const dx=target.x-a.x,dy=target.y-a.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,length=Math.min(580,Math.max(220,d+140));
  this.pending={ux,uy,length,at:s.now+1100};a.attackAt=0;s.enemySpecialUntil=s.now+2400;
  this.lane.clear().lineStyle(90,0xffaf6e,.18).lineBetween(a.x,a.y,a.x+ux*length,a.y+uy*length).lineStyle(3,0xffcf8e,.8).lineBetween(a.x,a.y,a.x+ux*length,a.y+uy*length);
  s.bus.emit('special:activated',{name:'Alligatore',ability:`CARICA ${this.completed+1}/2 · SPOSTATI DI LATO`});return true;
 }
}
