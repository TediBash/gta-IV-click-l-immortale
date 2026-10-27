import {applyEnemySet} from '../data/enemySets.js';
import {RevivalSystem} from '../combat/RevivalSystem.js';
import {scaleConfig,scaleGuards} from './DifficultyEncounters.js';
import {NavigationGuide} from './NavigationGuide.js';
import {PowerupSystem} from '../combat/PowerupSystem.js';
import {AdventureSession} from '../core/AdventureSession.js';
import {AdventureController} from './AdventureController.js';
import {adventureConfig,ADVENTURE_DIALOGUES} from '../data/adventures.js';
import {FacilitySession} from '../core/FacilitySession.js';
import {FacilityController} from './FacilityController.js';
import {facilityConfig,FACILITY_DIALOGUES} from '../data/facility.js';
import {beginHideout,updateHideout,interactHideout} from './Hideout.js';
import {ZoneSession} from '../core/ZoneSession.js';
import {ZoneController} from './ZoneController.js';
import {workshopConfig,zoneLine} from '../data/zones.js';
import {introLines,outroLines,pointLines,chapterArt,resumeArt} from '../data/dialogues.js';
import {CombatEffects} from '../combat/CombatEffects.js';
import {CHARACTER_ATLASES,appearance} from '../data/appearance.js';
import {GameMap} from './GameMap.js';
import {LootCrate,LevelGate} from './EnvironmentObject.js';
import {PlayableCharacter} from '../characters/Character.js';
import {CompanionAI} from '../characters/CompanionAI.js';
import {EnemyBot} from '../characters/EnemyBot.js';
import {PunchAttack} from '../combat/PunchAttack.js';
import {ComboSystem} from '../combat/ComboSystem.js';
import {FuriaImmortaleAbility,DroneStrikeAbility,RecoveryDriftAbility,LuxuryDistractionAbility,FlyingKickAbility,DiamondStormAbility,VoiceWaveAbility,BeeJudoAbility,VitalPulseAbility,TwinStrikeAbility} from '../combat/SpecialAbility.js';
import {MissionManager} from '../core/MissionManager.js';
import {characterById,DIFFICULTIES} from '../data/characters.js';
import {registerWorldSkins,prop} from '../data/skins.js';
import {ChapterDirector} from './ChapterDirector.js';
import {RaceController} from './RaceController.js';
export class GameScene extends Phaser.Scene {
 constructor(app){super('mission');this.app=app;this.activeMission=false;this.now=0;}
 preload(){for(const key of ['duo','enemies','cast','cast45','cast678','castFinal','props','environment','details','celebration','landscape','workshop'])this.load.image(key,`assets/${key}-atlas.png`);}
 atlas(key,rows){const t=this.textures.get(key),w=t.source[0].width/4,h=t.source[0].height/rows.length;rows.forEach((id,row)=>['down','up','left','right'].forEach((dir,col)=>t.add(`${id}-${dir}`,0,Math.floor(col*w),Math.floor(row*h),Math.floor(w),Math.floor(h))));}
 create(){
  this.app.scene=this;this.bus=this.app.bus;this.audio=this.app.audio;this.mission=new MissionManager(this.bus);
  for(const [key,names]of Object.entries(CHARACTER_ATLASES))this.atlas(key,names);this.atlas('enemies',['guard','bruiser','technician','captain']);registerWorldSkins(this);
  this.abilities={click:new FuriaImmortaleAbility(this),ted:new DroneStrikeAbility(this),spit:new RecoveryDriftAbility(this),andy:new LuxuryDistractionAbility(this),bruce:new FlyingKickAbility(this),carlitos:new DiamondStormAbility(this),ale:new VoiceWaveAbility(this),luca:new BeeJudoAbility(this),anna:new VitalPulseAbility(this),paula:new TwinStrikeAbility(this),nico:new TwinStrikeAbility(this)};
  this.beginRun(this.app.pendingRun);
 }
 beginRun(saved){
  if(saved?.hub){beginHideout(this,saved.campaign);return;}
  if(this.isHideout)this.mission=new MissionManager(this.bus);this.isHideout=false;
  this.mission.selectMission(saved?.mission??this.app.selectedMission??1);
  this.app.progress={mission:this.mission.id,chapter:saved?.chapter??0,cash:saved?.cash??0,inventory:saved?.inventory??['gloves','boots'],equipment:saved?.equipment??{},zoneRun:saved?.zoneRun??null,facilityRun:saved?.facilityRun??null,adventureRun:saved?.adventureRun??null,difficulty:saved?.difficulty??document.querySelector('#difficulty').value,complete:false};
  this.difficulty=DIFFICULTIES[this.app.progress.difficulty]||DIFFICULTIES.normal;
  document.querySelector('.game-heading .eyebrow').textContent=`MISSIONE ${String(this.mission.id).padStart(2,'0')}`;
  document.querySelector('.game-heading h2').textContent=this.mission.mission.name;
  this.loadChapter(this.app.progress.chapter);
 }
 get player(){return this.party?.[this.activeIndex];}
 loadChapter(index,options={}){
  this.bus.emit('dialogue:cancel');this.bus.emit('loot:clear');this.enemySpecialUntil=0;document.querySelector('#chapter-card').classList.add('hidden');
  this.activeMission=false;this.app.input.enabled=false;this.app.input.clear();this.audio.stop();this.revival?.cancel();this.powers?.clear();this.time.removeAllEvents();this.tweens.killAll();this.children.removeAll(true);
  this.navigation=null;this.zoneController=null;this.facilityController=null;this.adventureController=null;this.mission.override=null;
  this.fx=new CombatEffects(this);this.powers=new PowerupSystem(this);this.combo=new ComboSystem();this.combat=new PunchAttack(this,this.combo);this.mission.begin(index);if(this.mission.id===2&&index===1){this.zoneSession=new ZoneSession(this.app.progress.zoneRun);this.mission.override=workshopConfig(this.mission.config,this.zoneSession.data.current,this.app.progress.difficulty);if(this.zoneSession.data.missionState)this.mission.state={...this.zoneSession.data.missionState,index};}else{this.zoneSession=null;this.app.progress.zoneRun=null;}if(this.mission.id===3){this.resumingFacility=!!this.app.progress.facilityRun?.states?.[index];this.facilitySession=new FacilitySession(this.app.progress.facilityRun,index);this.mission.override=facilityConfig(this.mission.config,this.facilitySession.data.current,index,this.app.progress.difficulty);const state=this.facilitySession.data.states[index];if(state)this.mission.state={...state,index};}else{this.facilitySession=null;this.app.progress.facilityRun=null;}if([1,4,5,6,7,8,9,10].includes(this.mission.id)){this.resumingAdventure=!!this.app.progress.adventureRun?.states?.[index];this.adventureSession=new AdventureSession(this.app.progress.adventureRun,this.mission.id,index);this.mission.override=adventureConfig(this.mission.mission,this.adventureSession.data.current,index,this.app.progress.difficulty);const state=this.adventureSession.data.states[index];if(state)this.mission.state={...state,index};}else{this.adventureSession=null;this.app.progress.adventureRun=null;}if(!this.mission.override)this.mission.override=scaleConfig(applyEnemySet(this.mission.config,this.mission.id),this.app.progress.difficulty);
  if(this.mission.id===1&&this.mission.config.pursuers&&this.adventureSession.has('firecracker'))this.mission.override={...this.mission.config,guards:scaleGuards(this.mission.config.pursuers,this.mission.config,this.app.progress.difficulty)};
  const c=this.mission.config;
  this.map=new GameMap(this,c,index);this.cameras.main.setBounds(0,0,1280,800);
  this.party=(c.party||this.mission.mission.party).map((id,i)=>{
   const data={...characterById(id)};if(this.mission.mission.children)Object.assign(data,{child:true,texture:'cast',skin:'child-'+id,hp:100,speed:175,strength:0,role:'Fratelli in fuga',special:'Scatto'});else Object.assign(data,appearance(id,this.mission.mission));
   return new PlayableCharacter(this,data,c.start[0]+(i%4)*44,c.start[1]+Math.floor(i/4)*36,data.child?{}:this.app.progress.equipment[id]);
  });
  this.companions=this.party.map((p,i)=>new CompanionAI(p,i));this.activeIndex=0;
  this.enemies=c.guards.map(([x,y,type])=>new EnemyBot(this,x,y,type));this.crates=c.crates.map(([x,y,type])=>new LootCrate(this,x,y,type));
  this.gate=new LevelGate(this,...c.gate,!!c.gateVan);this.terminal=null;
  if(c.terminal){const [x,y]=c.terminal,g=this.add.graphics().setDepth(y);g.fillStyle(0x102a35).fillRect(x-25,y-45,50,45);g.fillStyle(0x7fd7c8).fillRect(x-20,y-39,40,22);g.fillStyle(0x355d65).fillRect(x-23,y-13,46,9);this.add.text(x,y-66,index===0?'TERMINALE':'PROTOTIPO',{fontFamily:'monospace',fontSize:10,color:'#a3e4d1'}).setOrigin(.5).setDepth(y);g.destroy();prop(this,'terminal',x,y,77);this.terminal={x,y};}
  this.prompt=this.add.text(0,0,'',{fontFamily:'Arial',fontSize:12,color:'#14212c',backgroundColor:'#f7d84a',padding:{x:8,y:5}}).setOrigin(.5).setDepth(2500).setVisible(false);
  this.minimap=this.add.graphics().setScrollFactor(0).setDepth(3000);this.director=new ChapterDirector(this);this.race=c.mode==='race'?new RaceController(this):null;this.app.raceControls?.setActive(!!this.race);
  if(this.zoneSession)this.zoneController=new ZoneController(this,this.zoneSession);
  if(this.facilitySession)this.facilityController=new FacilityController(this,this.facilitySession);
  if(this.adventureSession)this.adventureController=new AdventureController(this,this.adventureSession);
  this.revival=new RevivalSystem(this);this.navigation=new NavigationGuide(this);
  this.app.progress.chapter=index;this.facilityController?.save();this.adventureController?.save();if(this.zoneController)this.zoneController.save();this.checkpoint=JSON.parse(JSON.stringify(this.app.progress));const saved=this.app.save.save(this.checkpoint);
  document.querySelector('#save-status').textContent=saved?'CHECKPOINT SALVATO':'SALVATAGGIO NON DISPONIBILE';
  document.querySelector('.control-tip>b').textContent=this.race?'DUE GIRI, UN VINCITORE.':this.mission.id===1?'RESTATE INSIEME.':'OGNUNO HA IL SUO TALENTO.';
  document.querySelector('.control-tip p').textContent=this.race?'Gas automatico · trascina per sterzare · FRENO · TURBO. START apre le opzioni di guida.':this.mission.id===1?'Q cambia fratello · J esamina · K scatto':this.mission.id===2?'Spit sistema le auto. Click apre la strada.':this.mission.id===4?'Andy gestisce gli accessi. Spit prepara la fuga.':this.mission.id===5?'Bruce apre le valvole e risolve i problemi con un calcio.':'Cambia personaggio per le azioni dedicate. B / K attiva la sua mossa speciale.';
  this.bus.emit('hud:update',this);if(options.zoneTransition){this.resumeAction();this.adventureController?.onEnter();}else this.showChapterCard(index);this.renderWorld();this.app.fullscreen?.resize();
 }
 card(kicker,title,text,label,action){
  this.activeMission=false;this.app.input.enabled=false;this.app.input.clear();
  const el=document.querySelector('#chapter-card');el.classList.remove('hidden');el.innerHTML=`<small>${kicker}</small><h2>${title}</h2><p>${text}</p><button class="primary">${label} ↗</button>`;
  el.querySelector('button').onclick=()=>{el.classList.add('hidden');action();};
 }
 resumeAction(){this.activeMission=true;this.app.input.enabled=true;this.app.input.clear();this.lastInteraction=this.now;this.lastAmbient=this.now;}
 showChapterCard(index){
  this.playDialogue({kicker:`MISSIONE ${String(this.mission.id).padStart(2,'0')} · ${this.mission.config.name}`,lines:this.adventureController?(this.resumingAdventure?(this.adventureSession.data.vehicle.riding?ADVENTURE_DIALOGUES.villaResume:ADVENTURE_DIALOGUES.resume):this.mission.id===1&&index===1?ADVENTURE_DIALOGUES.flight:introLines(this.mission.id,index)):this.facilityController&&this.resumingFacility?FACILITY_DIALOGUES.resume:this.zoneController?(this.mission.state.parts||this.mission.state.guards||this.mission.state.car?[zoneLine('spit.zone.resume.01'),zoneLine('click.zone.resume.01')]:[zoneLine('spit.zone.intro.01'),zoneLine('click.zone.intro.01')]):introLines(this.mission.id,index),art:this.resumingAdventure?resumeArt(this.mission.id,this.adventureController?.zone,index):chapterArt(this.mission.id,index),lastLabel:'GIOCA',onComplete:()=>{this.resumeAction();this.audio.unlock();this.director.begin();this.adventureController?.onEnter();}});
 }
 playDialogue(options){this.activeMission=false;this.app.input.enabled=false;this.app.input.clear();this.audio.stop();this.bus.emit('dialogue:open',{...this.mission.mission,...options,onComplete:options.onComplete||(()=>this.resumeAction())});}
 celebratePickup(actor,item){if(!actor||actor.ko||actor.hidden)return;actor.celebrate();this.audio.effect('loot');this.fx.burst(actor.x,actor.y,0xf7d84a,65);this.bus.emit('loot:found',{...item,character:actor.data.name});}
 failChapter(title,text){this.app.music?.cue('defeat');this.card('RIPARTI DAL CHECKPOINT',title,text,'RIPROVA',()=>{this.app.progress=JSON.parse(JSON.stringify(this.checkpoint));this.loadChapter(this.checkpoint.chapter);});}
 update(time,delta){
  if(!this.activeMission)return;this.now+=Math.min(delta,40);time=this.now;const dt=Math.min(delta,40)/1000,input=this.app.input;
  if(this.isHideout){updateHideout(this,dt);return;}
  if(this.zoneController?.driving){this.zoneController.update(dt);if(this.activeMission){this.updateContext();this.renderWorld();this.refreshHud(time);}return;}
  if(this.race){this.race.update(dt);if(this.activeMission){this.renderWorld();this.refreshHud(time);}return;}
  if(input.consume('switch'))this.switchCharacter();const movement=input.movement();this.player.move(movement.x,movement.y,dt);this.director.updateSearchlights(dt);
  const attackPressed=input.consume('attack');
  if((input.held.has('attack')||attackPressed)&&time-(this.lastInteraction||0)>340){this.lastInteraction=time;if(!this.interact(attackPressed)){if(this.mission.mission.children)this.audio.say(this.player.id,'child',0);else this.combat.attack(this.player);}}
  if(!this.activeMission)return;
  if(input.consume('special')&&!this.player.actionLocked){
   if(this.mission.mission.children){if(this.player.special>=45){this.player.special-=45;const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[this.player.direction];for(let i=0;i<12;i++)this.map.move(this.player,v[0]*7,v[1]*7);this.audio.effect('gate');}else this.toast('Riprendi fiato: lo scatto si ricarica.');}
   else if(this.combo.consume(this.player.id,time))this.combat.attack(this.player,true);
   else if(!this.abilities[this.player.id]?.activate(this.player))this.toast('Barra speciale non pronta · colpisci i nemici per caricarla');
  }
  this.powers?.update();if(!this.activeMission)return;
  this.party.forEach((p,i)=>{if(i!==this.activeIndex)this.companions[i].update(dt);});this.enemies.forEach(e=>e.update(dt));this.revival?.update();
  if(!this.activeMission)return;this.zoneController?.update(dt);this.facilityController?.update(dt);this.adventureController?.update(dt);if(!this.activeMission)return;this.director.update(dt);if(!this.activeMission)return;this.updateContext();this.renderWorld();this.refreshHud(time);
  if(time-this.lastAmbient>22000){this.audio.say(this.player.id,this.mission.mission.children?'child':'explore',0);this.lastAmbient=time;}
 }
 refreshHud(time){if(time-(this.lastHud||0)>130){this.lastHud=time;this.bus.emit('hud:update',this);}}
 renderWorld(){
  this.map?.district?.update(this.player);
  if(!this.race)this.party.forEach((p,i)=>p.render(i===this.activeIndex,this.now));
  const camera=this.cameras.main;camera.scrollX=Phaser.Math.Clamp(this.player.x-camera.width/2,0,Math.max(0,1280-camera.width));camera.scrollY=Phaser.Math.Clamp(this.player.y-camera.height*.55,0,Math.max(0,800-camera.height));
  if(this.race)this.race.info.setPosition(camera.width/2,12).setWordWrapWidth(camera.width-40).setAlign('center');
  if(this.director.alert)this.director.alert.setPosition(camera.width/2,12).setWordWrapWidth(camera.width-40).setAlign('center');
  this.revival?.render();this.navigation?.update();if(!this.race)this.gate.update(this.mission.canExit()&&!this.exitBlocked(),this.now);this.drawMinimap();
 }
 drawMinimap(){
  const g=this.minimap,x=this.cameras.main.width-148,y=16,w=132,h=82;g.clear();g.fillStyle(0x0c2029,.85).fillRect(x,y,w,h);g.lineStyle(1,0x729b92).strokeRect(x,y,w,h);
  for(const c of this.map.district?.layout.channels||[])g.fillStyle(c.color).fillRect(x+c.x/1280*w,y+c.y/800*h,c.w/1280*w,c.h/800*h);
  for(const r of this.map.district?.layout.roads||[])g.fillStyle(r.color??0x3d505a).fillRect(x+r.x/1280*w,y+r.y/800*h,r.w/1280*w,r.h/800*h);
  for(const b of this.map.obstacles)g.fillStyle(0x52706b).fillRect(x+b.x/1280*w,y+b.y/800*h,b.w/1280*w,b.h/800*h);
  this.enemies.filter(e=>!e.ko).forEach(e=>g.fillStyle(0xe8a18b).fillRect(x+e.x/1280*w-1,y+e.y/800*h-1,3,3));
  if(this.navigation)this.navigation.drawMinimap(g,x,y,w,h);else this.party.forEach(p=>g.fillStyle(p===this.player?0xffffff:0x84d6d0).fillCircle(x+p.x/1280*w,y+p.y/800*h,2.5));
 }
 updateContext(){
  if(this.revival?.hint()){this.prompt.setVisible(false);return;}
  const p=this.player,t=this.terminal;let message=this.revival?.hint()||this.adventureController?.hint()||this.facilityController?.hint()||this.zoneController?.hint()||this.director.hint();
  if(!message&&t&&Math.hypot(p.x-t.x,p.y-t.y)<90&&!this.mission.complete(this.mission.state.index===0?'terminal':'prototype'))message=p.id==='ted'?'J / A · Apri terminale':'Q · Passa a Ted';
  else if(!message&&Math.hypot(p.x-this.gate.x,p.y-this.gate.y)<100)message=this.exitBlocked()||(this.mission.canExit()?'J / A · Prosegui':'Completa gli obiettivi');
  this.prompt.setText(message).setPosition(p.x,p.y+30).setVisible(!!message);
 }
 exitBlocked(){return this.director?.helicopters?.alert?'ALLARME · Resta fuori dai fari per 3 secondi.':'';}
 interact(fresh=true){if(this.player?.actionLocked)return true;
  if(this.player?.actionLocked)return true;if(this.isHideout)return interactHideout(this);if(this.revival?.tryStart(fresh))return true;
  if(this.adventureController?.interact())return true;if(this.facilityController?.interact())return true;if(this.zoneController?.interact())return true;if(this.director.interact())return true;const p=this.player,t=this.terminal,index=this.mission.state.index;
  if(t&&Math.hypot(p.x-t.x,p.y-t.y)<90){const key=index===0?'terminal':'prototype';if(this.mission.complete(key))return false;if(p.id!=='ted'){this.toast('Serve Ted · Q cambia personaggio');return true;}if(index===0&&!this.mission.complete('guards')){this.toast('Prima libera il cortile dalle guardie.');return true;}this.mission.record(key);this.audio.effect('gate');this.activeMission=false;this.app.input.enabled=false;this.app.input.clear();if(index!==0)this.celebratePickup(p,{name:'Prototipo recuperato',skin:'upgrade'});this.time.delayedCall(index===0?0:900,()=>this.playDialogue({kicker:index===0?'ACCESSO APERTO':'PROTOTIPO ACQUISITO',lines:pointLines(3,{id:key})}));return true;}
  if(Math.hypot(p.x-this.gate.x,p.y-this.gate.y)<100){if(this.exitBlocked()){this.toast(this.exitBlocked());return true;}if(!this.mission.canExit()){this.toast('Prima completa gli obiettivi nel diario');return true;}this.finishChapter();return true;}return false;
 }
 switchCharacter(id){
  if(this.zoneController?.driving){this.toast('Spit è al volante. Scendi con A prima di cambiare personaggio.');return;}
  if(this.race){this.toast('Click guida, Spit controlla l’assetto.');return;}
  const next=id?this.party.findIndex(p=>p.id===id):this.party.findIndex((p,i)=>i>this.activeIndex&&!p.ko&&!p.hidden);
  const target=next>=0?next:id?-1:this.party.findIndex(p=>!p.ko&&!p.hidden);
  if(target<0||this.party[target].ko||this.party[target].hidden){this.toast(this.party[target]?.hidden?'Questo compagno è nascosto nell’auto. Prosegui con Andy.':'Il compagno è KO. Avvicinati con un alleato e premi A / J per rianimarlo.');return;}
  this.revival?.cancel();this.activeIndex=target;this.party.forEach(p=>p.moving=false);this.audio.say(this.player.id,this.mission.mission.children?'child':'switch',1);this.bus.emit('hud:update',this);
 }
 onEnemyKO(enemy){if(enemy.boss)this.app.music?.cue('boss');this.fx.ko(enemy);if((!this.facilityController||this.facilitySession.countsCurrentStage)&&(!this.adventureController||this.adventureSession.countsCurrentStage))this.mission.record('guards');this.audio.effect('hit');this.app.progress.cash+=enemy.boss?250:50;this.party.forEach(p=>p.special=Math.min(100,p.special+8));this.facilityController?.save();this.adventureController?.save();this.adventureController?.effects?.onEnemyKO?.(enemy);if(enemy.boss)this.toast(enemy.type==='alligator'?'ALLIGATORE KO · Il passaggio è libero':enemy.profile.name.toUpperCase()+' KO · Proseguite con gli obiettivi');}
 onLoot(type,x,y,actor=this.player){this.app.music?.cue('chest');
  this.celebratePickup(actor,{name:{cash:"500 euro",heal:"Kit medico",charge:"Energia speciale",upgrade:"Controller"}[type],skin:type});
  this.audio.effect('loot');if(type==='cash'){this.mission.record('cash');this.app.progress.cash+=500;this.floatText(x,y-35,'+ € 500','#f7d84a');this.audio.say(this.player.id,'loot',0);}
  if(type==='heal'){this.party.forEach(p=>{p.hp=Math.min(p.data.hp,p.hp+50);if(p.ko){p.ko=false;p.state='IDLE';p.invulnerableUntil=this.now+1500;}});this.toast('KIT MEDICO · +50 salute alla squadra');}
  if(type==='charge'){this.party.forEach(p=>p.special=100);this.toast('ENERGIA · Speciali pronte!');}
  if(type==='upgrade'){if(!this.app.progress.inventory.includes('controller'))this.app.progress.inventory.push('controller');this.toast('CONTROLLER TROVATO · Equipaggialo dal menu');}
  this.facilityController?.save();this.adventureController?.save();
 }
 onKO(actor){this.audio.say(actor.id,'ko',3);if(this.party.every(p=>p.ko))this.failChapter('NON FINISCE QUI.','Tutta la squadra è a terra. Riprova: rianima i compagni con A / J prima che cadano tutti.');else if(actor===this.player){this.activeIndex=this.party.findIndex(p=>!p.ko&&!p.hidden);this.toast('Compagno KO · controllo passato a '+this.player.data.name);}}
 finishChapter(){
  if(!this.activeMission)return;if(this.exitBlocked()){this.toast(this.exitBlocked());return;}this.activeMission=false;this.app.input.clear();this.mission.record('exit');this.facilityController?.save();this.adventureController?.save();this.bus.emit('hud:update',this);document.querySelector('#quick-journal').textContent='✓ Capitolo completato';
  if(!this.mission.mission.children)this.party.forEach(p=>this.app.progress.equipment[p.id]={...p.loadout.slots});
  const index=this.mission.state.index,final=index===this.mission.mission.chapters.length-1;this.app.music?.cue(final?(this.mission.id===2?'race':'victory'):'chapter');
  this.playDialogue({kicker:final?'MISSIONE COMPLETATA':'CAPITOLO COMPLETATO',lines:outroLines(this.mission.id,index),art:chapterArt(this.mission.id,index,true),lastLabel:final?'TORNA AL GARAGE':'PROSSIMO CAPITOLO',onComplete:()=>{
   if(!final){this.loadChapter(index+1);return;}
   this.app.progress.complete=true;this.app.save.save(this.app.progress);this.app.save.markComplete(this.mission.id);this.app.goHome();
  }});
 }
 toast(text){this.bus.emit('toast',text);}
 floatText(x,y,text,color){const label=this.add.text(x,y,text,{fontFamily:'Arial',fontStyle:'bold',fontSize:16,color,stroke:'#14212c',strokeThickness:3}).setOrigin(.5).setDepth(2200);this.tweens.add({targets:label,y:y-35,alpha:0,duration:700,onComplete:()=>label.destroy()});}
}
