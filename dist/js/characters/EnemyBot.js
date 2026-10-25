import {drawEnemyGear} from './EnemyAppearance.js';
import {EnemySpecial} from '../combat/EnemySpecial.js';
import {ENEMY_TYPES,enemyType} from '../data/enemies.js';
export class EnemyBot {
 constructor(scene,x,y,type='guard') {
  Object.assign(this,{scene,x,y,type:enemyType(type),ko:false,stunUntil:0,attackAt:0,cooldown:0,nextPath:0,waypoint:null,direction:'down',moving:false});
  this.profile=ENEMY_TYPES[this.type];this.boss=!!this.profile.boss||this.type==='captain'||this.type==='alligator';
  this.maxHp=this.profile.hp*scene.difficulty.multiplier;this.hp=this.maxHp;
  this.speed=this.profile.speed;this.damage=this.profile.damage*scene.difficulty.multiplier;
  this.shadow=scene.add.ellipse(x,y,38,13,0x081820,.5);
  this.view=scene.add.image(x,y,this.profile.texture||'enemies',`${this.profile.skin||this.type}-down`).setOrigin(.5,.97).setDisplaySize(this.profile.size,this.profile.size);
  if(this.profile.tint)this.view.setTint(this.profile.tint);
  this.bar=scene.add.rectangle(x,y-this.profile.size,40,4,Phaser.Display.Color.HexStringToColor(this.profile.color).color);
  this.label=scene.add.text(x,y-this.profile.size-13,this.profile.name.toUpperCase(),{fontFamily:'monospace',fontSize:9,color:this.profile.color}).setOrigin(.5);
  this.military=this.profile.military?scene.add.graphics():null;
  this.gear=this.profile.gear?scene.add.graphics():null;
  this.specialAbility=new EnemySpecial(this);
  this.warning=scene.add.ellipse(x,y,this.profile.range*2,this.profile.range*1.2).setStrokeStyle(2,0xf1be65).setVisible(false);
 }
 update(dt) {
  const s=this.scene;this.moving=false;if(this.ko)return;
  if(s.now<this.stunUntil){this.specialAbility.cancel();this.render();return;}
  if(!this.boss&&this.powerLure&&s.now<this.powerLure.until){this.attackAt=0;const goal=s.map.nextStep(this.x,this.y,this.powerLure.x,this.powerLure.y),dx=goal.x-this.x,dy=goal.y-this.y,d=Math.hypot(dx,dy)||1;if(Math.hypot(this.x-this.powerLure.x,this.y-this.powerLure.y)>35){s.map.move(this,dx/d*this.speed*dt*(s.now<(this.hasteUntil||0)?1.25:1),dy/d*this.speed*dt*(s.now<(this.hasteUntil||0)?1.25:1));this.moving=true;this.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';}this.render();return;}
  const target=s.party.filter(p=>!p.ko&&!p.hidden).sort((a,b)=>Math.hypot(a.x-this.x,a.y-this.y)-Math.hypot(b.x-this.x,b.y-this.y))[0];
  if(this.specialAbility.update(dt,target)){this.render();return;}
  if(!target)return;const dx=target.x-this.x,dy=target.y-this.y,distance=Math.hypot(dx,dy);
  this.direction=Math.abs(dx)>Math.abs(dy)?dx<0?'left':'right':dy<0?'up':'down';
  if(this.attackAt){
   if(s.now>=this.attackAt){this.attackAt=0;this.cooldown=s.now+this.profile.recovery;
    s.party.forEach(p=>{if(!p.ko&&!p.hidden&&Math.hypot(p.x-this.x,p.y-this.y)<this.profile.range+8&&s.map.clearLine(this.x,this.y,p.x,p.y))p.damage(Math.round(this.damage),this);});}
   this.render();return;
  }
  if(distance<this.profile.range&&s.now>this.cooldown&&s.map.clearLine(this.x,this.y,target.x,target.y))this.attackAt=s.now+this.profile.windup;
  else if(distance<470&&distance>45){
   if(s.now>this.nextPath){this.waypoint=s.map.nextStep(this.x,this.y,target.x,target.y);this.nextPath=s.now+400;}
   const waypoint=this.waypoint||target;let mx=waypoint.x-this.x,my=waypoint.y-this.y,d=Math.hypot(mx,my)||1;
   if(d<12){this.nextPath=0;mx=dx;my=dy;d=distance||1;}
   s.map.move(this,mx/d*this.speed*dt*(s.now<(this.hasteUntil||0)?1.25:1),my/d*this.speed*dt*(s.now<(this.hasteUntil||0)?1.25:1));this.moving=true;
  }
  this.render();
 }
 hit(damage,actor){
  if(this.ko)return;
  if(this.specialAbility.charge){damage=this.specialAbility.charge.limitDamage(damage);if(damage<=0)return;}
  if(this.specialAbility.rage){damage=this.specialAbility.rage.limitDamage(damage);if(damage<=0)return;}
  if(this.scene.now<(this.specialAbility.shieldUntil||0))damage*=.25;
  this.specialAbility.cancel();this.hp=Math.max(0,this.hp-damage);this.stunUntil=this.scene.now+(this.type==='bruiser'?180:290);this.attackAt=0;
  const dx=this.x-actor.x,dy=this.y-actor.y,d=Math.hypot(dx,dy)||1;this.scene.map.move(this,dx/d*22,dy/d*22);
  this.scene.floatText(this.x,this.y-85,Math.round(damage).toString(),this.profile.color);
  if(!this.hp){this.ko=true;this.bar.setVisible(false);this.label.setVisible(false);this.warning.setVisible(false);this.scene.onEnemyKO(this);}
  this.render();
 }
 render(){
  this.specialAbility.render();drawEnemyGear(this);
  this.view.setPosition(this.x,this.y+(this.moving?Math.sin(this.scene.now/90)*2:0)-(this.powerLift||0)).setDepth(this.y).setFrame(`${this.profile.skin||this.type}-${this.direction}`).setAngle(this.ko?80:(this.powerAngle||0)).setAlpha(this.ko?.35:1);
  if(this.military){const g=this.military;g.clear().setPosition(this.x,this.y).setDepth(this.y+.5).setAlpha(this.ko?.35:1).setAngle(this.ko?80:0).fillStyle(0x3f5837).fillRoundedRect(-18,-82,36,18,7).fillStyle(0x7c9654).fillRect(-20,-68,40,5).fillStyle(0x4c653e).fillRect(-13,-49,26,20).fillStyle(0x8da96b).fillRect(-10,-44,7,10).fillRect(3,-44,7,10).fillStyle(0xb6c28a).fillRect(-8,-79,8,4);}
  this.shadow.setPosition(this.x,this.y).setDepth(this.y-1);
  this.bar.setPosition(this.x,this.y-this.profile.size).setDisplaySize(Math.max(.1,40*this.hp/this.maxHp),4).setDepth(this.y+1);
  this.label.setPosition(this.x,this.y-this.profile.size-13).setDepth(this.y+1);
  this.warning.setPosition(this.x,this.y).setDepth(this.y-1).setVisible(!!this.attackAt&&!this.ko);
 }
}
