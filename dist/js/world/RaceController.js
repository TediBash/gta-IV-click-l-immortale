import {raceInput,driveRace} from '../core/RaceDriving.js';
import {TRACK,TRACK_HALF_WIDTH,trackDistance} from '../data/raceTrack.js';
export {TRACK,segmentDistance,trackDistance} from '../data/raceTrack.js';
export class RaceProgress {
 constructor(){this.next=1;this.laps=0;}
 visit(x,y){const p=TRACK[this.next];if(Math.hypot(x-p[0],y-p[1])>82)return false;const lap=this.next===0;this.next=(this.next+1)%TRACK.length;if(lap)this.laps++;return lap;}
 get finished(){return this.laps>=2;}
}
export function drawCar(scene,x,y,color=0xb888dc,scale=1){
 const skin=typeof color==='string'?color:color===0xe8ad63?'classic':color===0x8c9a9d?'classic':'tuned';
 const car=scene.add.container(x,y).setDepth(y),sprite=scene.add.image(0,0,'props',skin).setDisplaySize(102,102);
 car.add(sprite).setScale(scale);car.skin=skin;return car;
}
export class RaceController {
 constructor(scene){
  this.scene=scene;this.x=190;this.y=650;this.angle=0;this.speed=0;this.turbo=100;this.progress=new RaceProgress();this.rivalProgress=new RaceProgress();this.rival={x:230,y:675};this.elapsed=0;this.done=false;this.countdown=3;
  this.markers=TRACK.map((p,i)=>scene.add.text(p[0],p[1]-43,String(i+1),{fontFamily:'monospace',fontSize:18,color:'#e2e6d9',backgroundColor:'#20333a',padding:{x:6,y:3}}).setOrigin(.5).setDepth(4));
  this.car=drawCar(scene,this.x,this.y);this.rivalCar=drawCar(scene,this.rival.x,this.rival.y,0xe8ad63);
  this.info=scene.add.text(480,18,'',{fontFamily:'monospace',fontSize:14,color:'#fff2c2',backgroundColor:'#14212cee',padding:{x:12,y:8}}).setOrigin(.5,0).setScrollFactor(0).setDepth(3100);
  scene.party.forEach(p=>[p.sprite,p.shadow,p.ring,p.label,p.hpBack,p.hpFill].forEach(v=>v.setVisible(false)));
  scene.gate.view.setVisible(false);scene.gate.marker.setVisible(false);
 }
 update(dt){
  if(this.done)return;const s=this.scene,input=s.app.input;
  if(this.countdown>0){input.consume('special');this.countdown-=dt;this.info.setText(`PARTENZA TRA ${Math.max(1,Math.ceil(this.countdown))} · ${s.app.settings.raceAutoAccelerate!==false?'GAS AUTO · PREPARA LO STERZO':'↑ / GAS PER ACCELERARE'}`);return;}
  this.elapsed+=dt;const controls=raceInput(input,s.app.settings),requested=input.consume('special');
  if(controls.brake||controls.reverse)this.boostUntil=0;
  const boosted=requested&&!controls.brake&&!controls.reverse&&this.speed>=0&&this.turbo>=35;if(boosted){this.boostUntil=this.elapsed+1.4;this.turbo-=35;s.audio.effect('special');}
  this.turbo=Math.min(100,this.turbo+dt*8);const boost=this.elapsed<(this.boostUntil||0),offroad=trackDistance(this.x,this.y)>TRACK_HALF_WIDTH;
  driveRace(this,dt,controls,s.app.settings,{offroad,boost,target:TRACK[this.progress.next],next:TRACK[(this.progress.next+1)%TRACK.length]});
  if(this.progress.visit(this.x,this.y)){s.mission.record('laps');s.audio.effect('gate');}
  const target=TRACK[this.rivalProgress.next],dx=target[0]-this.rival.x,dy=target[1]-this.rival.y,d=Math.hypot(dx,dy)||1;
  const speed=s.app.progress.difficulty==='easy'?135:s.app.progress.difficulty==='extreme'?215:s.app.progress.difficulty==='hard'?190:160;
  this.rival.x+=dx/d*speed*dt;this.rival.y+=dy/d*speed*dt;this.rivalProgress.visit(this.rival.x,this.rival.y);
  this.car.setPosition(this.x,this.y).setRotation(this.angle).setDepth(this.y+10);
  this.rivalCar.setPosition(this.rival.x,this.rival.y).setRotation(Math.atan2(dy,dx)).setDepth(this.rival.y+10);
  s.party.forEach(p=>{p.x=this.x;p.y=this.y;p.special=this.turbo;});
  this.markers.forEach((m,i)=>m.setColor(i===this.progress.next?'#f7d84a':'#7f9594').setScale(i===this.progress.next?1.3:1));
  this.info.setText(`GIRO ${Math.min(2,this.progress.laps+1)}/2 · ${Math.round(Math.abs(this.speed)*.8)} km/h · TURBO ${Math.round(this.turbo)}%${this.speed<0?' · RETRO':offroad?' · FUORI PISTA':''}`);
  if(this.progress.finished){this.done=true;input.clear();s.mission.record('won');s.app.progress.cash+=1500;s.finishChapter();}
  else if(this.rivalProgress.finished){this.done=true;input.clear();s.failChapter('SPIT VUOLE LA RIVINCITA.','Il rivale è arrivato prima. Segui i varchi numerati e usa il turbo nei rettilinei.');}
 }
}
