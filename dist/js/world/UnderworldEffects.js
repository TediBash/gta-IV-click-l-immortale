import {prop} from '../data/skins.js';
import {pointLines,outroLines,chapterArt,BRUCE_ALLIGATOR,PIZZA_KO} from '../data/dialogues.js';
import {EnemyBot} from '../characters/EnemyBot.js';
/** Persistent world changes for sewers and the diamond job; no new assets required. */
export class UnderworldEffects{
 constructor(controller){this.controller=controller;this.scene=controller.scene;this.session=controller.session;this.zone=controller.config;this.draw();}
 waterLevel(){return [1,.55,.13][Number(this.session.has('valveA'))+Number(this.session.has('valveB'))];}
 draw(){
  const s=this.scene;this.water=(this.zone.waterChannels||[]).map(([x,y,w,h])=>{
   s.add.rectangle(x+w/2,y+h/2,w+12,h+12,0x102e32,.8).setStrokeStyle(4,0x617c73).setDepth(2);
   return s.add.rectangle(x+w/2,y+h,w,h,0x54aaa4,.55).setOrigin(.5,1).setScale(1,this.waterLevel()).setDepth(3);
  });
  if(this.water.length)this.waterLabel=s.add.text(640,110,'',{fontFamily:'monospace',fontSize:11,color:'#b7f5e2',backgroundColor:'#173840',padding:{x:5,y:4}}).setOrigin(.5).setDepth(6);
  this.sparkles=new Map();for(const p of s.director.points.filter(p=>p.skin==='diamonds'))if(!s.director.collected.has(p.id))this.sparkles.set(p.id,[-28,15,37].map((dx,i)=>s.add.rectangle(p.x+dx,p.y+8-i*14,8,8,0xd3ffff,.85).setAngle(45).setDepth(p.y+1)));
  if(s.mission.id===6&&controllerZone(this)==='security'){this.vaultDoor=s.add.rectangle(1120,630,95,110,0x788c9a).setStrokeStyle(5,0xb6d1d6).setDepth(650);this.vaultDoor.setScale(this.session.has('access')?.14:1,1);}
  this.refresh();
 }
 refresh(){
  this.waterLabel?.setText(this.waterLevel()<.2?'ACQUA BASSA · PASSAGGIO LIBERO':this.waterLevel()<1?'UNA VALVOLA APERTA':'ACQUA ALTA · APRI LE VALVOLE');
  if(this.scene.mission.id===6&&controllerZone(this)==='street'){const arrived=this.session.has('pickup');this.scene.gate.view.setVisible(arrived);this.scene.gate.marker.setVisible(arrived);}
  for(const [id,views]of this.sparkles)if(this.scene.director.collected.has(id)){views.forEach(v=>v.destroy());this.sparkles.delete(id);}
 }
 animatePoint(p,show){
  const s=this.scene,c=this.controller;if(p.skin==='diamonds')p.art.setVisible(false);
  if(!['valve','vault','pickup'].includes(p.action))return false;
  c.save();c.busy=true;s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();
  const done=()=>{c.busy=false;this.refresh();show();};
  if(p.action==='valve')s.tweens.add({targets:this.water,scaleY:this.waterLevel(),duration:s.app.settings.reduceMotion?0:900,onComplete:done});
  if(p.action==='vault')s.tweens.add({targets:this.vaultDoor,scaleX:.14,duration:s.app.settings.reduceMotion?0:700,onComplete:done});
  if(p.action==='pickup'){
   s.gate.view.setVisible(false);s.gate.marker.setVisible(false);const car=prop(s,'tuned',1280,s.gate.y,145,1600);
   s.tweens.add({targets:car,x:s.gate.x,duration:s.app.settings.reduceMotion?0:950,onComplete:()=>{car.destroy();c.busy=false;this.refresh();s.playDialogue({kicker:'SPIT EXPRESS',lines:pointLines(6,p),art:chapterArt(6,2,true)});}});
  }return true;
 }
 pizza(p){
  const s=this.scene,c=this.controller;if(s.player.id!=='bruce'){s.toast('Serve Bruce · Q / CAMBIA');return true;}
  if(s.director.collected.has(p.id))return false;
  c.busy=true;s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();const [x,y]=this.zone.pizzaSpawn;
  const target=new EnemyBot(s,x,y,'guard');target.cinematicOnly=true;s.enemies.push(target);
  const pizza=prop(s,'pizza',s.player.x,s.player.y-30,65,2000);s.bus.emit('special:activated',{name:'Bruce',ability:'MARGHERITA DA KO'});s.audio.effect('special');
  s.tweens.add({targets:pizza,x,y:y-30,rotation:5,duration:s.app.settings.reduceMotion?0:800,onComplete:()=>{
   pizza.destroy();if(s.adventureController!==c)return;
   s.director.collected.add(p.id);p.art.setVisible(false);p.marker.setText('✓ '+p.label);s.mission.record(p.flag);target.hit(target.hp+1,s.player);c.busy=false;c.save();s.bus.emit('hud:update',s);
   s.playDialogue({kicker:'CONSEGNA COMPLETATA',lines:pointLines(5,p),art:PIZZA_KO});
  }});return true;
 }
 onEnemyKO(enemy){
  if(enemy.type!=='alligator'||this.session.data.flags.alligatorDown)return;
  this.session.data.flags.alligatorDown=true;this.controller.save();
  this.scene.playDialogue({kicker:'BRUCE VS ALLIGATORE · KO',lines:outroLines(5,1),art:BRUCE_ALLIGATOR});
 }
}
function controllerZone(e){return e.controller.zone;}
