export class CompanionAI{
 constructor(actor,index=0){this.actor=actor;this.index=index;this.nextPath=0;this.waypoint=null;}
 update(dt){const a=this.actor,s=a.scene;if(a.ko||a.hidden||a.actionLocked)return;const p=s.player;const enemies=s.mission.mission.children?[]:s.enemies.filter(e=>!e.ko&&Math.hypot(e.x-p.x,e.y-p.y)<230).sort((b,c)=>Math.hypot(b.x-a.x,b.y-a.y)-Math.hypot(c.x-a.x,c.y-a.y));const target=enemies[0];let tx=target?.x??p.x+Math.cos(this.index*2.4)*85,ty=target?.y??p.y+Math.sin(this.index*2.4)*65;let distance=Math.hypot(tx-a.x,ty-a.y);if(target&&distance<75){a.face(tx-a.x,ty-a.y);a.moving=false;if(s.now-a.lastAttack>640)s.combat.attack(a);return;}if(!target&&distance<65){a.moving=false;return;}
  if(s.now>this.nextPath){this.waypoint=s.map.nextStep(a.x,a.y,tx,ty);this.nextPath=s.now+400;}const waypoint=this.waypoint||{x:tx,y:ty};let dx=waypoint.x-a.x,dy=waypoint.y-a.y,d=Math.hypot(dx,dy)||1;if(d<12){this.nextPath=0;dx=tx-a.x;dy=ty-a.y;d=Math.hypot(dx,dy)||1;}a.move(dx/d,dy/d,dt);
 }
}
