// Headless integration against a lightweight rendering double, NOT browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {EventBus} from '../dist/js/core/EventBus.js';
import {EnemyBot} from '../dist/js/characters/EnemyBot.js';
import {POWERUPS} from '../dist/js/data/powerups.js';
import {InputState} from '../dist/js/core/InputState.js';
const noop=()=>{};
function drawable(x=0,y=0){let proxy;const o={x,y,destroy:noop};proxy=new Proxy(o,{get(t,k){if(k in t)return t[k];return(...args)=>{if(k==='setPosition'){t.x=args[0];t.y=args[1];}return proxy;};}});return proxy;}
globalThis.Phaser={Scene:class {},Math:{Clamp:(n,min,max)=>Math.max(min,Math.min(max,n))},Display:{Color:{HexStringToColor:s=>({color:parseInt(s.slice(1),16)})}}};
const {GameScene}=await import('../dist/js/world/GameScene.js');
const awaitHideout=await import('../dist/js/data/hideout.js');
test('All 31 chapter scenes on all four difficulties construct, resolve textures, update and accept specials',()=>{
 const els=new Map();globalThis.document={querySelector(key){if(!els.has(key))els.set(key,{value:'easy',textContent:'',innerHTML:'',classList:{add:noop,remove:noop},querySelector:()=>({onclick:null})});return els.get(key);}};
 const bus=new EventBus(),input=new InputState();input.clear();const app={bus,input,settings:{reduceMotion:false},audio:{stop:noop,say:noop,effect:noop,unlock:noop,play:noop},selectedMission:1,progress:null,save:{save:()=>true,markComplete:noop},fullscreen:{resize:noop}};
 const s=new GameScene(app),textures=new Map(),delays=[],tweens=[];let imageCount=0;
 s.load={image(key,path){const png=readFileSync(new URL('../dist/'+path,import.meta.url));const w=png.readUInt32BE(16),h=png.readUInt32BE(20),frames=new Map();textures.set(key,{source:[{width:w,height:h}],add(name,index,x,y,width,height){frames.set(name,{width,height});},get:name=>frames.get(name),has:name=>frames.has(name)});}};
 s.textures={get:key=>{assert.ok(textures.has(key),'missing texture '+key);return textures.get(key);}};
 const image=(x,y,key,frame)=>{assert.ok(textures.has(key),'missing texture '+key);assert.ok(!frame||textures.get(key).has(frame),'missing frame '+key+':'+frame);imageCount++;return drawable(x,y);};
 s.add={graphics:()=>drawable(),image,container:drawable,text:drawable,circle:drawable,ellipse:drawable,rectangle:drawable,tileSprite:(x,y,w,h,key,frame)=>image(x,y,key,frame)};
 s.time={delayedCall:(ms,fn)=>delays.push(fn),removeAllEvents:()=>{delays.length=0;}};s.tweens={add:t=>tweens.push(t),killAll:()=>{tweens.length=0;},killTweensOf:noop};s.children={removeAll:noop};s.cameras={main:{width:560,height:800,setBounds:noop,shake:noop}};
 let raceControlsActive=false;app.raceControls={setActive:v=>raceControlsActive=v};
 s.preload();s.create();
 for(const difficulty of ['easy','normal','hard','extreme'])for(const m of Object.values(MISSIONS))for(let index=0;index<m.chapters.length;index++){
  app.selectedMission=m.id;s.beginRun({mission:m.id,chapter:index,difficulty});s.resumeAction();s.update(1000,16);
  assert.equal(raceControlsActive,!!s.race);assert.ok(s.player);assert.ok(Number.isFinite(s.cameras.main.scrollX));assert.ok(Number.isFinite(s.cameras.main.scrollY));
  if(!m.children&&!s.race)for(const p of s.party){assert.ok(s.abilities[p.id]);s.abilities[p.id].activate(p);}
  for(const p of s.party){assert.ok(Number.isFinite(p.hp));assert.ok(Number.isFinite(p.x));}
 }
 const defeat=()=>{for(const e of s.enemies)if(!e.ko){e.hit(e.hp+20,s.player);if(e.specialAbility.rage&&!e.specialAbility.rage.completed){s.now+=1500;e.specialAbility.update(.016,s.player);s.now+=1201;e.specialAbility.update(.016,s.player);e.hit(e.hp+20,s.player);}}};
 // Exercise the complete connected-workshop progression using the real scene.
 let dialogue;bus.on('dialogue:open',o=>dialogue=o);
 s.beginRun({mission:2,chapter:1,difficulty:'easy'});s.resumeAction();assert.equal(s.zoneController.zone,'street');
 const travel=id=>{const door=s.zoneController.doors.find(d=>d.id===id);s.zoneController.travel(door);delays.pop()();assert.equal(s.activeMission,true);};
 travel('workshop-in');s.switchCharacter('spit');
 for(const id of ['engine','wheels','paint']){const point=s.director.points.find(p=>p.id===id);s.player.x=point.x;s.player.y=point.y;assert.equal(s.director.interact(),true);delays.pop()();dialogue.onComplete();}
 assert.equal(s.mission.state.parts,3);travel('workshop-out');travel('workshop-in');assert.equal(s.director.collected.size,3);assert.equal(s.mission.state.parts,3);travel('workshop-out');travel('depot-in');
 defeat();assert.equal(s.mission.complete('guards'),true);
 s.player.x=s.zoneController.vehicle.x;s.player.y=s.zoneController.vehicle.y;s.zoneController.interact();assert.equal(s.zoneController.driving,true);
 travel('depot-out');travel('workshop-in');assert.equal(s.zoneController.driving,true);Object.assign(s.zoneController.vehicle,{x:1010,y:270,angle:-Math.PI/2,speed:0});s.zoneController.update(.016);assert.equal(s.mission.complete('parked'),true);assert.equal(s.mission.complete('tuned'),false);
 tweens.at(-1).onComplete();assert.equal(s.mission.complete('tuned'),true);assert.equal(s.zoneController.vehicle.skin,'tuned');dialogue.onComplete();travel('workshop-out');assert.equal(s.mission.canExit(),true);
 const resume=JSON.parse(JSON.stringify(app.progress));s.beginRun(resume);s.resumeAction();assert.equal(s.zoneController.driving,true);assert.equal(s.zoneController.vehicle.skin,'tuned');assert.equal(s.mission.state.parts,3);assert.equal(s.mission.canExit(),true);
 s.zoneController.vehicle.x=1170;s.zoneController.vehicle.y=660;s.zoneController.syncPassengers();s.zoneController.interact();dialogue.onComplete();assert.equal(s.mission.state.index,2);assert.ok(s.race);assert.equal(app.progress.zoneRun,null);
 // Visit every station, return to a mission, and preserve the stored campaign.
 const campaign=JSON.parse(JSON.stringify(app.progress));let saveCalls=0;app.save.save=()=>{saveCalls++;return true;};
 s.beginRun({hub:true,campaign});assert.equal(s.isHideout,true);assert.equal(raceControlsActive,false);assert.equal(s.party.length,11);assert.equal(saveCalls,0);
 const {STATIONS}=awaitHideout;
 for(const station of STATIONS){s.player.x=station.x;s.player.y=station.y;assert.equal(s.interact(),true);assert.ok(dialogue.lines.length>=2);dialogue.onComplete();s.update(100,16);}
 assert.equal(s.hubVisited.size,11);assert.equal(saveCalls,0);assert.deepEqual(app.progress,campaign);
 s.switchCharacter('luca');s.update(100,16);assert.equal(s.player.id,'luca');assert.equal(saveCalls,0);
 let home=0,map=0;app.goHome=()=>home++;app.journey={open:()=>map++};s.player.x=640;s.player.y=390;s.interact();assert.equal(home,1);assert.equal(map,1);assert.equal(saveCalls,0);
 s.beginRun(campaign);assert.equal(s.isHideout,false);assert.equal(s.mission.id,2);assert.equal(s.mission.state.index,2);assert.ok(s.race);assert.equal(saveCalls,1);
 // Complete the six-zone technology heist, including backtracking across chapters.
 s.beginRun({mission:3,chapter:0,difficulty:'easy'});s.resumeAction();
 const facilityTravel=id=>{const controller=s.facilityController,d=controller.doors.find(d=>d.id===id);assert.ok(d,id);const old=s.mission.state.index;controller.travel(d);if(s.activeMission)return; if(dialogue?.kicker?.includes('COMPLETATO')&&s.mission.state.exit){dialogue.onComplete();assert.equal(s.mission.state.index,old+1);dialogue.onComplete();}else delays.pop()();assert.equal(s.facilityController.zone,d.to);assert.equal(s.activeMission,true);};
 const device=()=>{const d=s.facilityController.config.device;s.player.x=d.x;s.player.y=d.y;return s.facilityController.interact();};

 s.enemies[0].hit(999,s.player);s.player.hp=82;s.player.special=31;s.facilityController.save();
 facilityTravel('security-in');assert.equal(s.player.hp,82);assert.equal(s.player.special,31);s.switchCharacter('ted');device();assert.equal(s.facilitySession.data.flags.terminal,false);defeat();
 facilityTravel('courtyard-out');assert.equal(s.enemies[0].ko,true);defeat();facilityTravel('security-in');assert.ok(s.enemies.every(e=>e.ko));assert.equal(s.mission.state.guards,7);
 s.switchCharacter('click');device();assert.equal(s.facilitySession.data.flags.terminal,false);s.switchCharacter('ted');device();delays.pop()();dialogue.onComplete();assert.equal(s.mission.complete('terminal'),true);
 facilityTravel('lab-in');assert.equal(s.mission.state.index,1);assert.equal(s.party.find(p=>p.id==='click').hp,82);
 const cashCrates=()=>s.crates.filter(c=>c.type==='cash');cashCrates()[0].hit(999,s.player);assert.equal(s.mission.state.cash,1);
 s.switchCharacter('click');device();assert.equal(s.facilitySession.data.flags.prototype,false);s.switchCharacter('ted');device();delays.pop()();dialogue.onComplete();assert.equal(s.mission.complete('prototype'),true);
 facilityTravel('server-in');for(const c of cashCrates())c.hit(999,s.player);assert.equal(s.mission.state.cash,3);const cashTotal=app.progress.cash;
 facilityTravel('lab-out');assert.ok(cashCrates().every(c=>c.destroyed));device();assert.equal(s.mission.state.cash,3);assert.equal(app.progress.cash,cashTotal);facilityTravel('server-in');
 // A reload must preserve the prototype, every opened cash crate, and the current room.
 s.facilityController.save();const mid=JSON.parse(JSON.stringify(app.progress));s.beginRun(mid);s.resumeAction();assert.equal(s.facilityController.zone,'server');assert.ok(cashCrates().every(c=>c.destroyed));assert.equal(s.mission.state.cash,3);assert.equal(s.facilitySession.data.flags.prototype,true);
 facilityTravel('dock-in');assert.equal(s.mission.state.index,2);assert.ok(s.enemies.every(e=>e.specialAbility.energy===100));
 // Defeating an earlier chapter's survivor must not satisfy the final reinforcements objective.
 facilityTravel('server-out');assert.ok(s.enemies.some(e=>!e.ko));defeat();assert.equal(s.mission.state.guards,0);facilityTravel('dock-in');defeat();assert.equal(s.mission.state.guards,4);
 facilityTravel('escape-in');assert.ok(s.enemies.some(e=>e.type==='volt'));s.player.x=1110;s.player.y=190;s.facilityController.interact();assert.equal(s.facilitySession.data.flags.loaded,false);defeat();assert.equal(s.mission.state.guards,8);
 s.player.x=1110;s.player.y=190;s.facilityController.interact();assert.equal(s.activeMission,false);assert.equal(s.mission.complete('loaded'),false);tweens.at(-1).onComplete();assert.equal(s.mission.complete('loaded'),true);dialogue.onComplete();
 const loaded=JSON.parse(JSON.stringify(app.progress));s.beginRun(loaded);s.resumeAction();assert.equal(s.facilityController.cargo.length,4);assert.equal(s.mission.complete('loaded'),true);assert.ok(s.enemies.every(e=>e.ko));
 s.player.x=1110;s.player.y=190;s.facilityController.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);
 // Complete Greece through all seven zones. Story beats happen only in the proper order.
 let explosionCount=0;bus.on('dialogue:open',o=>{if(o.kicker==='LONTANO DALLA BASE')explosionCount++;});
 const adventureTravel=id=>{const controller=s.adventureController,d=controller.doors.find(d=>d.id===id);assert.ok(d,id);controller.travel(d);assert.equal(controller.busy||s.mission.state.exit,true,id+' should be open');if(s.mission.state.exit){dialogue.onComplete();dialogue.onComplete();}else {delays.pop()();if(!s.activeMission)dialogue.onComplete();}assert.equal(s.adventureController.zone,d.to);assert.equal(s.activeMission,true);};
 const collect=id=>{const p=s.director.points.find(p=>p.id===id);assert.ok(p,id);if(p.who)s.switchCharacter(p.who);s.player.x=p.x;s.player.y=p.y;const n=delays.length;s.director.interact();if(p.action==='firecracker')tweens.findLast(t=>t.duration===600).onComplete();else if(['valve','vault','pickup','assemble','flight','scan','pack','reveal','arrival','storyScene','homeward'].includes(p.action))tweens.at(-1).onComplete();else if(delays.length>n)delays.pop()();dialogue.onComplete();assert.ok(s.director.collected.has(id));};
 const reloadAdventure=()=>{s.adventureController.save();s.beginRun(JSON.parse(JSON.stringify(app.progress)));dialogue.onComplete();};
 s.beginRun({mission:1,chapter:0,difficulty:'easy'});dialogue.onComplete();assert.equal(explosionCount,0);collect('footprints');adventureTravel('olives-in');
 const baseDoor=s.adventureController.doors.find(d=>d.id==='base-in');s.adventureController.travel(baseDoor);assert.equal(s.adventureController.zone,'olives');collect('fence');adventureTravel('village-out');assert.ok(s.director.collected.has('footprints'));assert.equal(s.mission.state.clues,2);adventureTravel('olives-in');adventureTravel('base-in');assert.equal(s.enemies.length,0);collect('depot');collect('story');assert.equal(s.enemies.length,2);assert.ok(s.enemies.every(e=>e.profile.military&&e.military));assert.equal(s.mission.state.clues,3);assert.equal(explosionCount,0);reloadAdventure();assert.ok(s.director.collected.has('story'));assert.equal(s.enemies.length,2);
 adventureTravel('ridge-in');assert.equal(s.mission.state.index,1);assert.equal(explosionCount,0);const coastDoor=s.adventureController.doors.find(d=>d.id==='coast-in');s.adventureController.travel(coastDoor);assert.equal(s.adventureController.zone,'ridge');
 s.player.x=970;s.player.y=410;s.director.update(.016);assert.equal(s.mission.state.route,0,'cannot skip the first marker');
 for(const r of s.director.routes){s.player.x=r.x;s.player.y=r.y;s.director.update(.016);}assert.equal(s.mission.state.route,2);adventureTravel('coast-in');assert.equal(explosionCount,1);
 // Flares lock the actual exit; leaving for 2.98s is not enough, reentry resets, save/reload retains the alarm.
 let lamp=s.director.helicopters.state.lights[0];s.player.x=lamp.x;s.player.y=lamp.y;s.director.updateSearchlights(.02);assert.ok(s.exitBlocked());assert.ok(s.adventureController.blocked(s.adventureController.doors.find(d=>d.id==='home-in')));s.adventureController.save();reloadAdventure();assert.ok(s.director.helicopters.alert);
 s.player.x=150;s.player.y=700;for(let i=0;i<149;i++){s.now+=20;s.director.updateSearchlights(.02);}assert.ok(s.exitBlocked());lamp=s.director.helicopters.state.lights[0];s.player.x=lamp.x;s.player.y=lamp.y;s.director.updateSearchlights(.02);assert.equal(s.director.helicopters.state.outsideMs,0);s.player.x=150;s.player.y=700;for(let i=0;i<150;i++){s.now+=20;s.director.updateSearchlights(.02);}assert.equal(s.exitBlocked(),'');

 adventureTravel('ridge-out');assert.equal(s.mission.state.route,2);adventureTravel('coast-in');reloadAdventure();assert.equal(explosionCount,1,'explosion does not repeat on backtrack/reload');
 s.player.x=1030;s.player.y=300;s.director.update(.016);assert.equal(s.mission.state.route,3);adventureTravel('home-in');collect('bag');collect('photo');assert.equal(s.mission.state.bags,2);adventureTravel('departure-in');collect('map');assert.equal(s.mission.canExit(),true);adventureTravel('home-out');assert.equal(s.director.collected.size,2);adventureTravel('departure-in');reloadAdventure();assert.equal(s.mission.state.bags,3);s.player.x=s.gate.x;s.player.y=s.gate.y;s.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);
 // Complete the seven villa zones, including hidden passengers, locked study and loaded checkpoint.
 s.beginRun({mission:4,chapter:0,difficulty:'easy'});dialogue.onComplete();collect('papers');collect('ready');collect('hide');assert.equal(s.player.id,'andy');assert.equal(s.party.find(p=>p.id==='click').hidden,true);s.director.car.setPosition(650,570);reloadAdventure();assert.equal(s.director.car.x,650);assert.equal(s.director.riding,true);s.switchCharacter('click');assert.equal(s.player.id,'andy');
 adventureTravel('gatehouse-in');assert.equal(s.player.id,'andy');assert.equal(s.director.riding,true);assert.ok(s.party.filter(p=>p.id!=='andy').every(p=>p.hidden));collect('entry');reloadAdventure();assert.ok(s.director.collected.has('entry'));assert.equal(s.player.id,'andy');adventureTravel('hall-in');assert.ok(s.party.every(p=>!p.hidden));assert.equal(s.mission.state.index,1);
 const studyDoor=s.adventureController.doors.find(d=>d.id==='study-in');s.adventureController.travel(studyDoor);assert.equal(s.adventureController.zone,'hall');defeat();assert.equal(s.mission.state.guards,2);s.player.hp=77;s.adventureController.save();adventureTravel('bedroom-in');assert.equal(s.player.hp,77);defeat();collect('key');cashCrates()[0].hit(999,s.player);assert.equal(s.mission.state.cash,1);reloadAdventure();assert.ok(s.enemies.every(e=>e.ko));assert.ok(cashCrates().every(c=>c.destroyed));
 adventureTravel('hall-out');assert.ok(s.enemies.every(e=>e.ko));adventureTravel('gatehouse-out');assert.ok(s.party.every(p=>!p.hidden));assert.equal(s.director.riding,false);adventureTravel('hall-in');adventureTravel('study-in');defeat();collect('dossier');cashCrates()[0].hit(999,s.player);assert.equal(s.mission.state.cash,2);assert.equal(s.mission.state.guards,6);assert.equal(s.mission.canExit(),true);const villaCash=app.progress.cash;
 adventureTravel('hall-study-out');adventureTravel('bedroom-in');assert.ok(cashCrates().every(c=>c.destroyed));assert.equal(app.progress.cash,villaCash);adventureTravel('hall-out');adventureTravel('study-in');adventureTravel('garage-in');assert.equal(s.mission.state.index,2);assert.ok(s.enemies.every(e=>e.specialAbility.energy===100));
 adventureTravel('study-out');assert.ok(s.enemies.every(e=>e.ko));assert.equal(s.mission.state.guards,0);adventureTravel('garage-in');defeat();assert.equal(s.mission.state.guards,3);adventureTravel('driveway-in');s.switchCharacter('andy');const gatePoint=s.director.points.find(p=>p.id==='gateKey');s.player.x=gatePoint.x;s.player.y=gatePoint.y;s.director.interact();assert.equal(s.mission.complete('gateKey'),false);defeat();collect('gateKey');collect('escapeCar');assert.equal(s.mission.state.guards,7);reloadAdventure();assert.equal(s.mission.canExit(),true);assert.ok(s.enemies.every(e=>e.ko));s.player.x=s.gate.x;s.player.y=s.gate.y;s.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);
 // Bruce: water controls, a two-charge boss and a pizza cinematic that can safely be interrupted.
 let bossArt=0;bus.on('dialogue:open',o=>{if(o.kicker==='BRUCE VS ALLIGATORE · KO'){bossArt++;assert.match(o.art.alt,/alligatore/);}});
 s.beginRun({mission:5,chapter:0,difficulty:'easy'});dialogue.onComplete();collect('map');defeat();adventureTravel('west-in');assert.equal(s.adventureController.effects.waterLevel(),1);collect('valveA');assert.equal(s.adventureController.effects.waterLevel(),.55);defeat();adventureTravel('east-in');collect('valveB');defeat();assert.equal(s.mission.state.guards,5);assert.equal(s.mission.state.valves,2);adventureTravel('west-out');assert.equal(s.adventureController.effects.waterLevel(),.13);reloadAdventure();assert.equal(s.adventureController.effects.waterLevel(),.13);adventureTravel('east-in');adventureTravel('collector-in');
 let boss=s.enemies.find(e=>e.type==='alligator');
 for(let phase=0;phase<2;phase++){
  boss.hit(999,s.player);assert.equal(boss.ko,false);assert.equal(boss.hp,Math.ceil(boss.maxHp*(2-phase)/3));s.now+=1500;s.player.x=boss.x-140;s.player.y=boss.y;boss.specialAbility.update(.016,s.player);assert.ok(boss.specialAbility.charge.pending);s.now+=1101;
  for(let i=0;i<60&&boss.specialAbility.charge.completed===phase;i++){s.now+=40;boss.specialAbility.update(.04,s.player);}assert.equal(boss.specialAbility.charge.completed,phase+1);
  reloadAdventure();boss=s.enemies.find(e=>e.type==='alligator');assert.equal(boss.specialAbility.charge.completed,phase+1);
 }
 boss.hit(999,s.player);assert.equal(boss.ko,true);assert.equal(bossArt,1);assert.equal(s.mission.state.guards,1);dialogue.onComplete();reloadAdventure();assert.equal(bossArt,1);adventureTravel('service-in');defeat();collect('routeKey');adventureTravel('collector-out');assert.ok(s.enemies[0].ko);adventureTravel('service-in');adventureTravel('kitchen-in');defeat();assert.equal(s.mission.state.guards,3);
 const pizzaStart=()=>{s.switchCharacter('bruce');const p=s.director.points.find(p=>p.id==='pizza');s.player.x=p.x;s.player.y=p.y;s.interact();};
 pizzaStart();assert.equal(s.mission.complete('pizzaHit'),false);assert.equal(s.enemies.length,4);reloadAdventure();assert.equal(s.enemies.length,3);assert.equal(s.director.collected.has('pizza'),false);pizzaStart();tweens.at(-1).onComplete();dialogue.onComplete();assert.equal(s.mission.complete('pizzaHit'),true);assert.equal(s.mission.state.guards,4);reloadAdventure();assert.equal(s.director.collected.has('pizza'),true);assert.equal(s.mission.state.guards,4);
 adventureTravel('dining-in');defeat();assert.equal(s.mission.state.guards,7);collect('address');assert.equal(s.mission.canExit(),true);s.player.x=s.gate.x;s.player.y=s.gate.y;s.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);
 // Carlitos: changing teams keep their health, and lots/strewn diamonds never duplicate.
 s.beginRun({mission:6,chapter:0,difficulty:'easy'});dialogue.onComplete();s.switchCharacter('bruce');s.player.hp=71;collect('register');defeat();adventureTravel('production-in');collect('crystal');defeat();adventureTravel('office-in');defeat();assert.equal(s.mission.state.guards,6);adventureTravel('security-in');assert.ok(!s.party.some(p=>p.id==='bruce'));assert.equal(s.adventureSession.data.party.find(p=>p.id==='bruce').hp,71);
 const vaultDoor=s.adventureController.doors.find(d=>d.id==='vault-in');s.adventureController.travel(vaultDoor);assert.equal(s.adventureController.zone,'security');collect('access');defeat();adventureTravel('vault-in');defeat();for(const id of ['diamond0','diamond1','diamond2'])collect(id);assert.equal(s.mission.state.diamonds,3);assert.equal(s.adventureController.effects.sparkles.size,0);reloadAdventure();assert.equal(s.director.collected.size,3);assert.equal(s.adventureController.effects.sparkles.size,0);adventureTravel('security-out');adventureTravel('office-out');assert.equal(s.mission.state.guards,6);adventureTravel('security-in');adventureTravel('vault-in');adventureTravel('alley-in');assert.equal(s.party.find(p=>p.id==='bruce').hp,71);
 collect('lost1');defeat();adventureTravel('street-in');collect('lost2');defeat();assert.equal(s.mission.state.lost,2);assert.equal(s.mission.state.guards,7);collect('pickup');assert.equal(s.mission.canExit(),true);reloadAdventure();assert.equal(s.adventureSession.has('pickup'),true);adventureTravel('alley-out');assert.ok(s.director.collected.has('lost1'));adventureTravel('street-in');assert.ok(s.director.collected.has('lost2'));s.player.x=s.gate.x;s.player.y=s.gate.y;s.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);
 // Ale: witnesses, protected archive, boss threshold persists before and after execution.
 s.beginRun({mission:7,chapter:0,difficulty:'easy'});dialogue.onComplete();collect('witness1');defeat();adventureTravel('assembly-in');collect('witness2');defeat();assert.equal(s.mission.state.clues,2);adventureTravel('archive-in');
 const recordDoor=s.adventureController.doors.find(d=>d.id==='records-in');s.adventureController.travel(recordDoor);assert.equal(s.adventureController.zone,'archive');collect('check');defeat();adventureTravel('records-in');
 let overseer=s.enemies.find(e=>e.type==='overseer');overseer.hit(999,s.player);assert.equal(overseer.hp,Math.ceil(overseer.maxHp/2));reloadAdventure();overseer=s.enemies.find(e=>e.type==='overseer');assert.equal(overseer.specialAbility.rage.completed,false);s.now+=1500;overseer.specialAbility.update(.016,s.player);assert.ok(overseer.specialAbility.rage.pending);s.now+=1201;overseer.specialAbility.update(.016,s.player);reloadAdventure();overseer=s.enemies.find(e=>e.type==='overseer');assert.equal(overseer.specialAbility.rage.completed,true);defeat();collect('papers');assert.equal(s.mission.state.guards,6);
 adventureTravel('archive-out');reloadAdventure();assert.ok(s.director.collected.has('check'));adventureTravel('records-in');assert.ok(s.enemies.every(e=>e.ko));adventureTravel('alley-in');defeat();adventureTravel('pickup-in');defeat();collect('rome');reloadAdventure();assert.equal(s.mission.canExit(),true);s.player.x=s.gate.x;s.player.y=s.gate.y;s.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);
 // Luca: collect throughout the store, return to assemble, test then read telemetry and pack.
 s.beginRun({mission:8,chapter:0,difficulty:'easy'});dialogue.onComplete();const bench=s.director.points.find(p=>p.id==='bench');s.switchCharacter('luca');s.player.x=bench.x;s.player.y=bench.y;s.director.interact();assert.equal(s.mission.complete('built'),false);collect('part0');defeat();adventureTravel('store-in');collect('part1');reloadAdventure();assert.equal(s.mission.state.parts,2);collect('part2');defeat();adventureTravel('workshop-out');assert.equal(s.mission.state.parts,3);collect('bench');reloadAdventure();assert.equal(s.mission.complete('built'),true);adventureTravel('store-in');assert.equal(s.director.collected.size,2);assert.ok(s.enemies.every(e=>e.ko));adventureTravel('workshop-out');adventureTravel('range-in');
 const telemetryDoor=s.adventureController.doors.find(d=>d.id==='telemetry-in');s.adventureController.travel(telemetryDoor);assert.equal(s.adventureController.zone,'range');collect('test');defeat();adventureTravel('telemetry-in');collect('data');defeat();reloadAdventure();assert.equal(s.mission.complete('data'),true);adventureTravel('range-out');assert.ok(s.director.collected.has('test'));adventureTravel('telemetry-in');adventureTravel('loading-in');defeat();adventureTravel('departure-in');defeat();collect('case');reloadAdventure();assert.equal(s.mission.canExit(),true);assert.equal(s.mission.state.guards,7);s.player.x=s.gate.x;s.player.y=s.gate.y;s.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);
 // Finish both final missions across every connected zone, restoring between rooms.
 for(const mission of [9,10]){
  s.beginRun({mission,chapter:0,difficulty:'easy'});dialogue.onComplete();let rooms=0;
  while(rooms++<9){
   defeat();for(const p of [...s.director.points])if(!s.director.collected.has(p.id))collect(p.id);
   reloadAdventure();assert.ok(s.enemies.every(e=>e.ko));assert.ok(s.party.every(p=>!s.map.blocked(p.x,p.y,15)));
   const next=s.adventureController.doors.find(d=>d.id==='forward');
   if(!next){assert.equal(s.mission.canExit(),true);if(mission===10)assert.equal(s.party.length,11);s.player.x=s.gate.x;s.player.y=s.gate.y;s.interact();dialogue.onComplete();assert.equal(app.progress.complete,true);break;}
   adventureTravel('forward');
  }assert.equal(rooms,mission===9?6:8);
 }
 // Exercise the new modes on real actors/maps, including reload cleanup and child isolation.
 for(const [id,mode] of [['click','boxer'],['click','guard'],['luca','chain'],['luca','sentinel'],['anna','triage'],['anna','renew']]){
  app.settings.powerups={[id]:mode};s.beginRun({mission:id==='anna'?9:8,chapter:0,difficulty:'normal'});dialogue.onComplete();s.switchCharacter(id);
  const hero=s.player;hero.x=150;hero.y=650;hero.hp=30;hero.special=100;
  const target=s.enemies[0];target.x=220;target.y=650;target.hp=500;target.ko=false;target.boss=false;
  assert.equal(s.abilities[id].activate(hero),true);assert.equal(hero.special,0);
  if(mode==='guard'){hero.invulnerableUntil=0;hero.damage(30,target);assert.equal(hero.hp,30);}
  for(let i=0;i<130;i++){s.now+=40;s.powers.update();s.renderWorld();}
  if(id==='anna')assert.ok(hero.hp>30);else assert.ok(target.hp<500,mode);
  assert.equal(s.powers.jobs.size,0);s.loadChapter(0);assert.equal(s.powers.jobs.size,0);assert.ok(s.party.every(p=>!p.actionLocked));
 }
 // Triggered military reinforcements scale once and survive checkpoints without respawning.
 for(const [difficulty,count]of [['easy',2],['normal',4],['hard',6],['extreme',9]]){
  s.beginRun({mission:1,chapter:0,difficulty});dialogue.onComplete();collect('footprints');adventureTravel('olives-in');collect('fence');adventureTravel('base-in');collect('depot');assert.equal(s.enemies.length,0);collect('story');assert.equal(s.enemies.length,count,difficulty);assert.ok(s.enemies.every(e=>e.profile.military));
  s.enemies[0].hit(999,s.player);const defeated=s.enemies[0];assert.ok(defeated.ko);reloadAdventure();assert.equal(s.enemies.length,count);assert.ok(s.enemies[0].ko);s.adventureController.startPatrol();assert.equal(s.enemies.length,count);
 }
 // Real scene/actor integration for every remaining special, against existing atlases/maps.
 for(const id of ['bruce','ted','spit','carlitos','ale','andy','paula','nico'])for(const option of POWERUPS[id].slice(1)){
  app.settings.powerups={[id]:option.id};s.beginRun({mission:10,chapter:3,difficulty:'normal'});dialogue.onComplete();s.switchCharacter(id);
  const hero=s.player;Object.assign(hero,{x:150,y:650,hp:40,special:100});
  for(const ally of s.party)if(ally!==hero)Object.assign(ally,{x:190,y:650,hp:30});
  const target=new EnemyBot(s,245,650,'guard');target.hp=target.maxHp=1000;s.enemies=[target,new EnemyBot(s,400,650,'bruiser')];
  if(option.id==='closing')target.twinMark={until:s.now+6000};
  assert.equal(s.abilities[id].activate(hero),true);assert.equal(hero.special,0,id+'/'+option.id);
  for(let i=0;i<230;i++){s.now+=40;s.powers.update();s.renderWorld();}
  assert.equal(s.powers.jobs.size,0,id+'/'+option.id+' finished');assert.ok(s.party.every(a=>!a.actionLocked));
  if(id!=='andy')assert.ok(target.hp<1000,id+'/'+option.id+' impact');
  s.loadChapter(3);assert.equal(s.powers.jobs.size,0);
 }
 // Real A interaction, normal game update loop and checkpoint restoration of a revived teammate.
 s.beginRun({mission:10,chapter:3,difficulty:'easy'});dialogue.onComplete();s.switchCharacter('click');const rescuer=s.player,fallen=s.party.find(a=>a.id==='ted');Object.assign(rescuer,{x:150,y:650,stunUntil:0,hp:100,invulnerableUntil:0});Object.assign(fallen,{x:205,y:650,ko:true,hp:0,special:0});
 assert.ok(s.interact());assert.ok(rescuer.actionLocked);for(let i=0;i<49;i++)s.update(s.now+40,40);assert.ok(fallen.ko);s.update(s.now+40,40);assert.equal(fallen.ko,false);assert.equal(fallen.hp,fallen.data.hp*.15);assert.equal(fallen.special,100);assert.equal(rescuer.actionLocked,false);reloadAdventure();assert.equal(s.party.find(a=>a.id==='ted').ko,false);assert.equal(s.party.find(a=>a.id==='ted').special,100);
 // Chapter transitions discard an unfinished rescue and release the actor.
 const nextRescuer=s.player,nextFallen=s.party.find(a=>a.id!==nextRescuer.id);Object.assign(nextRescuer,{x:150,y:650,stunUntil:0});Object.assign(nextFallen,{x:190,y:650,ko:true,hp:0});s.interact();assert.ok(s.revival.active);s.loadChapter(3);assert.equal(s.revival.active,null);assert.equal(nextRescuer.actionLocked,false);
 s.beginRun({mission:1,chapter:0,difficulty:'normal'});dialogue.onComplete();assert.equal(s.player.data.child,true);assert.equal(s.player.data.special,'Scatto');
 assert.ok(imageCount>200);
});
