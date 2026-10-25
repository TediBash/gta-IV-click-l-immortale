import {STATIONS,HUB_ACTIONS,HIDEOUT_CONFIG} from '../data/hideout.js';
import {characterById,DIFFICULTIES} from '../data/characters.js';
import {appearance} from '../data/appearance.js';
import {PlayableCharacter} from '../characters/Character.js';
import {GameMap} from './GameMap.js';
import {CombatEffects} from '../combat/CombatEffects.js';
import {prop} from '../data/skins.js';

// The hideout owns no campaign checkpoint. Visiting or leaving never calls save().
export function beginHideout(scene,saved){
 const s=scene;s.app.raceControls?.setActive(false);
 s.isHideout=true;s.bus.emit('dialogue:cancel');s.bus.emit('loot:clear');s.activeMission=false;s.app.input.clear();s.audio.stop();s.revival?.cancel();s.revival=null;s.powers?.clear();s.time.removeAllEvents();s.tweens.killAll();s.children.removeAll(true);
 s.navigation=null;s.adventureController=null;s.adventureSession=null;s.facilityController=null;s.facilitySession=null;s.zoneController=null;s.zoneSession=null;s.race=null;s.terminal=null;
 s.app.progress=structuredClone(saved||{mission:1,chapter:0,cash:0,inventory:['gloves','boots'],equipment:{},difficulty:'normal'});
 s.app.progress.equipment??={};s.app.progress.inventory??=['gloves','boots'];s.difficulty=DIFFICULTIES.normal;
 s.mission={id:8,mission:{name:HIDEOUT_CONFIG.name,children:false},config:HIDEOUT_CONFIG,state:{index:0},complete:()=>false,target:()=>undefined,canExit:()=>false};
 s.fx=new CombatEffects(s);s.map=new GameMap(s,HIDEOUT_CONFIG,1);s.cameras.main.setBounds(0,0,1280,800);
 s.party=STATIONS.map(t=>new PlayableCharacter(s,{...characterById(t.id),...appearance(t.id)},t.x,t.y,s.app.progress.equipment[t.id]));
 s.activeIndex=0;s.player.x=580;s.player.y=660;s.enemies=[];s.crates=[];s.director={points:[],collected:new Set()};s.gate={x:-500,y:-500,update:()=>{}};
 s.minimap=s.add.graphics().setScrollFactor(0).setDepth(3000);
 s.prompt=s.add.text(0,0,'',{fontFamily:'Arial',fontSize:12,color:'#152d35',backgroundColor:'#ffe49d',padding:{x:7,y:5}}).setOrigin(.5).setDepth(2500).setVisible(false);
 prop(s,'map',640,390,108);prop(s,'upgrade',270,210,55);prop(s,'bee',1180,170,54);
 const bag=s.add.graphics().setDepth(360);bag.lineStyle(4,0xb7c6be).lineBetween(100,255,100,285);bag.fillStyle(0xb47b4f).fillRoundedRect(83,285,34,65,10);bag.lineStyle(3,0xf3d489).strokeRoundedRect(83,285,34,65,10);
 s.add.text(640,340,'TAVOLO MISSIONI',{fontFamily:'monospace',fontSize:12,color:'#fff1bb',backgroundColor:'#193139',padding:{x:6,y:4}}).setOrigin(.5).setDepth(390);
 s.add.text(540,525,'✦ POTENZIAMENTI',{fontFamily:'monospace',fontSize:12,color:'#b4f4d5',backgroundColor:'#193139',padding:{x:6,y:4}}).setOrigin(.5).setDepth(550);
 s.add.text(640,750,'↓ USCITA',{fontFamily:'monospace',fontSize:12,color:'#fff1bb',backgroundColor:'#193139',padding:{x:6,y:4}}).setOrigin(.5).setDepth(750);
 for(const t of STATIONS)s.add.text(t.x,t.y+27,t.label,{fontFamily:'Arial',fontSize:11,color:'#fff3ce',backgroundColor:'#193139dd',padding:{x:4,y:3}}).setOrigin(.5).setDepth(t.y+30);
 document.querySelector('.game-heading .eyebrow').textContent='FOSSANO · BASE DELLA BANDA';document.querySelector('.game-heading h2').textContent='Casa, finalmente.';
 document.querySelector('#save-status').textContent='CAMPAGNA CONSERVATA';document.querySelector('#chapter-card').classList.add('hidden');
 document.querySelector('.control-tip>b').textContent='OGNUNO HA IL SUO POSTO.';document.querySelector('.control-tip p').textContent='A / J parla e interagisce. Q cambia personaggio. Il tavolo centrale apre le missioni; il banco Potenziamenti prepara le speciali.';
 s.hubVisited=new Set();s.resumeAction();s.renderWorld();s.bus.emit('hud:update',s);s.app.fullscreen?.resize();
 s.toast('Benvenuto al covo · parla con la banda con A / J');
}
export function hideoutTarget(s){
 const options=[...HUB_ACTIONS,...STATIONS.map(t=>({...t,label:`Parla con ${characterById(t.id).name}`}))];
 return options.map(t=>({...t,distance:Math.hypot(s.player.x-t.x,s.player.y-t.y)})).filter(t=>t.distance<85).sort((a,b)=>a.distance-b.distance)[0];
}
export function interactHideout(s){
 const target=hideoutTarget(s);if(!target)return false;
 if(target.id==='briefing'){s.app.goHome();s.app.journey.open();return true;}
 if(target.id==='exit'){s.app.goHome();return true;}
 if(target.id==='powerups'){s.app.ui.open('powerups');return true;}
 if(target.id==='training'){s.fx.burst(100,320,0xf7d84a,60);s.floatText(100,295,'BAM!','#ffe58b');s.audio.effect('hit');s.player.celebrate();return true;}
 s.hubVisited.add(target.id);s.playDialogue({kicker:target.label,lines:target.lines,lastLabel:'TORNA AL COVO'});return true;
}
export function updateHideout(s,dt){
 const input=s.app.input;if(input.consume('switch'))s.switchCharacter();
 const v=input.movement();s.player.move(v.x,v.y,dt);
 if(input.consume('attack')&&s.now-(s.lastInteraction||0)>340){s.lastInteraction=s.now;interactHideout(s);}
 input.consume('special');
 if(!s.activeMission)return;
 const target=hideoutTarget(s);s.prompt.setText(target?'A / J · '+target.label:'').setPosition(s.player.x,s.player.y+36).setVisible(!!target);
 s.renderWorld();s.refreshHud(s.now);
}
