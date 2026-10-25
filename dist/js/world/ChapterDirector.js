import {HelicopterSearch} from './HelicopterSearch.js';
import {pointLines,pointArt,CHILD_PHOTO} from '../data/dialogues.js';
import {drawCar} from './RaceController.js';
import {prop,pointSkin} from '../data/skins.js';
import {EnemyBot} from '../characters/EnemyBot.js';
export function canUsePoint(scene,p){return (!p.who||p.who===scene.player.id)&&!(p.requires||[]).some(key=>!scene.mission.complete(key));}
export class ChapterDirector {
 constructor(scene){
  this.scene=scene;this.config=scene.mission.config;this.collected=new Set();this.exposure=0;
  this.points=(this.config.points||[]).map(p=>({...p,art:prop(scene,pointSkin(p),p.x,p.y,57),marker:scene.add.text(p.x,p.y-62,'◇ '+p.label,{fontFamily:'monospace',fontSize:10,color:'#f7e29b',backgroundColor:'#203b39',padding:{x:6,y:4}}).setOrigin(.5).setDepth(p.y+10)}));
  this.routes=(this.config.route||[]).map(([x,y],i)=>({x,y,marker:scene.add.text(x,y,'◇ '+(i+1+(this.config.routeOffset||0)),{fontFamily:'monospace',fontSize:24,color:'#f7d84a',backgroundColor:'#254c43',padding:{x:7,y:3}}).setOrigin(.5).setDepth(5)}));
  this.lights=[];this.helicopters=(this.config.lights||[]).length?new HelicopterSearch(scene,this.config.lights,scene.adventureSession?.data.zones[scene.adventureSession.data.current]?.searchlight):null;
  if(this.config.mode==='escape')this.alert=scene.add.text(480,18,'',{fontFamily:'monospace',fontSize:13,color:'#fff3c7',backgroundColor:'#183c40',padding:{x:10,y:6}}).setOrigin(.5,0).setScrollFactor(0).setDepth(3100);
  if(this.config.mode==='heist')this.car=drawCar(scene,1080,400,'classic');
  if(this.config.parkedCar){const [x,y,skin]=this.config.parkedCar;this.car=drawCar(scene,x,y,skin,1.3);}
 }
 nearest(){const p=this.scene.player;return this.points.filter(v=>!this.collected.has(v.id)&&Math.hypot(v.x-p.x,v.y-p.y)<85).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];}
 hint(){const point=this.nearest();if(!point)return '';return point.who&&point.who!==this.scene.player.id?'CAMBIA / Q · '+this.scene.party.find(p=>p.id===point.who)?.data.name:'A / J · '+point.label;}
 interact(){
  const s=this.scene,p=this.nearest();if(!p)return false;
  if(p.who&&p.who!==s.player.id){s.toast('Serve '+s.party.find(a=>a.id===p.who)?.data.name+' · CAMBIA / Q');return true;}
  if(!canUsePoint(s,p)){s.toast('Prima completa: '+s.mission.config.objectives.filter(([k])=>p.requires?.includes(k)&&!s.mission.complete(k)).map(([,text])=>text).join(' · '));return true;}
  this.collected.add(p.id);p.marker.setText('✓ '+p.label).setColor('#a3d9aa').setAlpha(.55);p.art.setAlpha(.3);s.audio.effect('loot');
  if(p.action==='pizza'){this.throwPizza(p);return true;}
  if(p.action==='demo'){
   const bee=prop(s,'bee',s.player.x,s.player.y-70,58,2200);
   s.fx.beam(s.player.x,s.player.y,p.x,p.y,0xf7d84a);
   s.tweens.add({targets:bee,x:p.x,y:p.y-45,duration:s.app.settings.reduceMotion?0:700,alpha:0,onComplete:()=>bee.destroy()});
  }
  if(p.action==='celebrate'){for(const a of s.party)s.fx.burst(a.x,a.y,parseInt(a.data.color.slice(1),16),90);}
  s.mission.record(p.flag);s.app.music?.cue(p.id==='birthday'?'birthday':'objective');if(p.voice)s.audio.play(p.voice,{force:true});
  if(p.flag==='car')this.car?.setPosition(270,585);
  if(p.flag==='tuned'){this.car?.destroy();this.car=drawCar(s,270,585,'tuned');}
  if(p.action==='hide'){this.riding=true;s.party.forEach(actor=>{if(actor.id==='click'||actor.id==='spit')actor.hidden=true;});s.activeIndex=s.party.findIndex(actor=>actor.id==='andy');s.renderWorld();}
  const show=()=>s.playDialogue({kicker:p.label,lines:pointLines(s.mission.id,p),art:pointArt(s.mission.id,p)});
  const found=/bag|photo|map|engine|wheels|paint|key|dossier|diamond|component|tool|part|lost|kit|case|papers|crystal/.test(p.id)||['parts','bags','cash','prototype'].includes(p.flag);
  if(s.adventureController?.animatePoint(p,show)){s.adventureController.save();s.bus.emit('hud:update',s);return true;}
  if(found||p.action==='demo'||p.action==='celebrate'){
   s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();
   if(found)s.celebratePickup(s.player,{name:p.id==='photo'?'Foto dei tre fratelli':p.label,skin:pointSkin(p),art:p.id==='photo'?CHILD_PHOTO:null});
   s.time.delayedCall(s.app.settings.reduceMotion?450:900,show);
  }else show();
  s.zoneController?.save();s.adventureController?.save();s.bus.emit('hud:update',s);return true;
 }
 throwPizza(point){
  const s=this.scene,actor=s.player,target=new EnemyBot(s,actor.x+145,actor.y-20,'guard');s.enemies.push(target);target.stunUntil=s.now+1300;
  const pizza=s.add.image(actor.x,actor.y-40,'props','pizza').setDisplaySize(64,64).setDepth(2100);
  s.bus.emit('special:activated',{name:'Bruce',ability:'Consegna molto calda'});s.audio.play(point.voice,{force:true});
  s.tweens.add({targets:pizza,x:target.x,y:target.y-35,rotation:5,duration:650,onComplete:()=>{pizza.destroy();if(!s.activeMission)return;if(!target.ko)target.hit(target.hp,actor);s.mission.record(point.flag);s.playDialogue({kicker:'CONSEGNA COMPLETATA',lines:pointLines(s.mission.id,point)});s.bus.emit('hud:update',s);}});
 }
 updateSearchlights(dt){this.helicopters?.update(dt);}
 begin(){
  if(this.config.mode==='escape'&&!this.scene.adventureController){
   const s=this.scene,flash=s.add.rectangle(640,60,1280,180,0xffd999,.85).setDepth(1600);
   s.tweens.add({targets:flash,alpha:0,duration:1600,onComplete:()=>flash.destroy()});if(!s.app.settings.reduceMotion)s.cameras.main.shake(300,.004);
   s.audio.effect('special');s.toast('L’esplosione è alle spalle. Segui il sentiero verso il villaggio.');
  }
 }
 update(dt){
  const s=this.scene,p=s.player;if(s.mission.mission.children)p.special=Math.min(100,p.special+dt*16);
  if(this.riding&&this.car){
   if(s.now>(this.carPathAt||0)){this.carWaypoint=s.map.nextStep(this.car.x,this.car.y,p.x,p.y);this.carPathAt=s.now+350;}
   const target=this.carWaypoint||p,dx=target.x-this.car.x,dy=target.y-this.car.y,d=Math.hypot(dx,dy);
   if(Math.hypot(p.x-this.car.x,p.y-this.car.y)>70&&d>2){const proxy={x:this.car.x,y:this.car.y};s.map.move(proxy,dx/d*Math.min(d,170*dt),dy/d*Math.min(d,170*dt));this.car.setPosition(proxy.x,proxy.y).setDepth(proxy.y);if(Math.abs(dx)>10)this.car.setRotation(dx>0?0:Math.PI);if(d<12)this.carPathAt=0;}
   s.party.filter(a=>a.hidden).forEach(a=>{a.x=this.car.x;a.y=this.car.y;});
  }
  const index=s.mission.state.route||0,next=this.routes[index-(this.config.routeOffset||0)];
  if(next&&Math.hypot(next.x-p.x,next.y-p.y)<70){s.mission.record('route');next.marker.setText('✓').setColor('#b1e2bd');s.audio.effect('gate');s.toast('Sentiero '+(index+1)+' / '+(s.mission.target('route')||this.routes.length));s.adventureController?.save();}

 }
}
