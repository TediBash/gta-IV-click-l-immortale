import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {canPlayMission,completedMissions,suggestedMission,lockedMessage,MISSION_IDS} from '../dist/js/core/CampaignAccess.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';
import {JourneyMap,missionNodes} from '../dist/js/ui/JourneyMap.js';
import {UIManager} from '../dist/js/ui/UIManager.js';
globalThis.Phaser={Scene:class{}};
const {ClickGame}=await import('../dist/js/main.js');
test('New players get only mission 1; completing each mission unlocks exactly the next one',()=>{
 const done=[];for(let next=1;next<=10;next++){assert.deepEqual(MISSION_IDS.filter(id=>canPlayMission(id,done)),MISSION_IDS.slice(0,next));assert.equal(suggestedMission(done),next);done.push(next);}assert.ok(MISSION_IDS.every(id=>canPlayMission(id,done)));
});
test('Legacy out-of-order completions are kept but cannot bypass missing prerequisites or replay invalid IDs',()=>{
 assert.equal(canPlayMission(6,[1,6]),false);assert.equal(canPlayMission(7,[1,6]),false);assert.equal(canPlayMission(2,[1,6]),true);assert.match(lockedMessage(6,[1,6]),/missione 02/);for(const id of [0,11,NaN,'bad'])assert.equal(canPlayMission(id,[1,2,3,4,5,6,7,8,9,10]),false);assert.deepEqual(completedMissions([1,1,6,99,'2',null]),[1,6]);assert.deepEqual(completedMissions({}),[]);
});
test('Saved completions survive refresh; checkpoints do not unlock missions by themselves',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};const save=new SaveManager();save.markComplete(1);save.markComplete(6);const again=new SaveManager();assert.deepEqual(again.completed(),[1,6]);assert.equal(suggestedMission(again.completed(),{mission:6,chapter:1}),2);assert.equal(suggestedMission(again.completed(),{mission:2,chapter:1}),2);assert.equal(suggestedMission([],{mission:10}),1);
});
test('App entry guard blocks both direct launches and locked checkpoints before touching the running game',()=>{
 const calls=[],app=Object.create(ClickGame.prototype);Object.assign(app,{selectedMission:9,save:{completed:()=>[],load:()=>({mission:8,chapter:2})},journey:{renderSelection:id=>calls.push(id)},ui:{toast:t=>calls.push(t)}});
 assert.equal(app.start(false,9),false);assert.equal(app.start(true),false);assert.deepEqual(calls.filter(x=>typeof x==='number'),[9,8]);assert.equal(app.playing,undefined);assert.equal(app.pendingRun,undefined);
});
class Node{constructor(){this.textContent='';this.hidden=false;this.classes=new Set();this.classList={toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.attrs={};}setAttribute(k,v){this.attrs[k]=v;}focus(){}scrollIntoView(){}}
function mapFixture(){const nodes=new Map(),buttons=MISSION_IDS.map(id=>Object.assign(new Node(),{dataset:{mission:String(id)}})),host=new Node();host.querySelector=k=>{if(!nodes.has(k))nodes.set(k,new Node());return nodes.get(k);};host.querySelectorAll=()=>buttons;globalThis.document={querySelector:k=>k==='.mission-picker'?host:host.querySelector(k)};let done=[],saved=null;const app={selectedMission:1,settings:{},save:{completed:()=>done,load:()=>saved}},map=new JourneyMap(app);return {map,app,host,nodes,buttons,setDone:v=>done=v,setSaved:v=>saved=v};}
test('Inline map shows nine locks, explains a locked click, disables play and refreshes after completion',()=>{
 assert.equal((missionNodes([],null).match(/class="mission-lock"/g)||[]).length,9);const x=mapFixture();x.buttons[5].onclick();assert.equal(x.app.selectedMission,6);assert.equal(x.nodes.get('#start-game').disabled,true);assert.equal(x.nodes.get('#journey-feedback').hidden,false);assert.match(x.nodes.get('#journey-feedback').textContent,/missioni precedenti/);x.setDone([1]);x.map.refresh(true);assert.equal(x.app.selectedMission,2);assert.equal(x.nodes.get('#start-game').disabled,false);assert.equal(x.nodes.get('#journey-feedback').hidden,true);x.setSaved({mission:2,chapter:1});x.map.refresh(true);assert.equal(x.nodes.get('#continue-game').hidden,false);
});
test('Campaign journal also labels locks and cannot dispatch its locked mission button',()=>{
 const feedback=new Node(),locked={dataset:{lockedMission:'5'}},play=[];const content={innerHTML:'',querySelector:()=>feedback,querySelectorAll:s=>s==='[data-locked-mission]'?[locked]:[]};const ui={app:{save:{completed:()=>[]},playing:false},content,close(){play.push('closed');}};UIManager.prototype.journal.call(ui);assert.match(content.innerHTML,/data-locked-mission="5"/);locked.onclick();assert.match(feedback.textContent,/precedenti/);assert.equal(play.length,0);
});
test('Home opens on the map, follows with a guide and retains the rest of the existing sections',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.indexOf('class="mission-picker"')<html.indexOf('class="game-guide"'));assert.ok(!html.includes('FOSSANO<br>NON ERA'));for(const id of ['home-enemies','home-world','home-hideout','home-voices','home-campaign'])assert.ok(html.includes('id="'+id+'"'));assert.match(html,/15% di vita/);assert.match(html,/2 secondi/);
});
test('Unlock override allows valid missions only and never rewrites completion records',()=>{
 const done=[1,2,6];assert.ok(MISSION_IDS.every(id=>canPlayMission(id,done,true)));assert.deepEqual(done,[1,2,6]);assert.deepEqual(MISSION_IDS.filter(id=>canPlayMission(id,done,false)),[1,2,3]);for(const id of [0,11,NaN,'bad'])assert.equal(canPlayMission(id,done,true),false);assert.equal(canPlayMission(9,done,'true'),false);assert.equal(suggestedMission(done,{mission:9,chapter:1},true),9);assert.equal(suggestedMission(done,{mission:9,chapter:1},false),3);
});
test('Map removes locks immediately, retains real completion count and restores locks/checkpoint rules on disable',()=>{
 const x=mapFixture();x.setDone([1,2]);x.setSaved({mission:8,chapter:1});x.map.select(8);assert.equal(x.nodes.get('#start-game').disabled,true);
 x.app.settings.unlockAllMissions=true;x.map.refresh();assert.equal(x.app.selectedMission,8);assert.equal(x.nodes.get('#start-game').disabled,false);assert.equal(x.nodes.get('#continue-game').hidden,false);assert.equal(x.nodes.get('#campaign-count').textContent,'2 / 10');assert.equal((x.nodes.get('.journey-nodes').innerHTML.match(/class="mission-lock"/g)||[]).length,0);assert.match(x.nodes.get('.journey-legend').textContent,/SBLOCCO LIBERO/);
 x.app.settings.unlockAllMissions=false;x.map.refresh();assert.equal(x.nodes.get('#start-game').disabled,true);assert.equal(x.nodes.get('#continue-game').hidden,true);assert.equal(x.nodes.get('#campaign-count').textContent,'2 / 10');assert.equal((x.nodes.get('.journey-nodes').innerHTML.match(/class="mission-lock"/g)||[]).length,7);
});
test('Actual settings checkbox persists both values without changing checkpoint, completions or active game',()=>{
 const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};globalThis.matchMedia=()=>({matches:false});const save=new SaveManager();save.markComplete(1);save.markComplete(2);save.save({mission:8,chapter:1,cash:900,inventory:['gloves'],difficulty:'hard'});const checkpoint=memory.get('gtaclick.save.v1'),completed=memory.get('gtaclick.completed.v1');const elements=new Map();globalThis.document={querySelector:k=>{if(k==='#return-home')return null;if(!elements.has(k))elements.set(k,{});return elements.get(k);}};
 let refresh=0;const app={settings:save.settings(),save,playing:true,journey:{refresh:()=>refresh++}},ui={app,content:{innerHTML:''}};assert.equal(app.settings.unlockAllMissions,false);UIManager.prototype.settings.call(ui);assert.match(ui.content.innerHTML,/Sblocca tutte le missioni/);
 elements.get('#unlock-all-missions').onchange({target:{checked:true}});assert.equal(save.settings().unlockAllMissions,true);assert.equal(refresh,1);UIManager.prototype.settings.call(ui);assert.match(ui.content.innerHTML,/id="unlock-all-missions"[^>]*checked/);
 elements.get('#unlock-all-missions').onchange({target:{checked:false}});assert.equal(save.settings().unlockAllMissions,false);assert.equal(refresh,2);assert.equal(memory.get('gtaclick.save.v1'),checkpoint);assert.equal(memory.get('gtaclick.completed.v1'),completed);assert.equal(app.playing,true);
});
test('Unlocked journal exposes every mission without falsely marking unplayed missions complete',()=>{
 const ui={app:{settings:{unlockAllMissions:true},save:{completed:()=>[1,2]},playing:false},content:{innerHTML:'',querySelectorAll:()=>[]}};UIManager.prototype.journal.call(ui);assert.equal((ui.content.innerHTML.match(/data-mission=/g)||[]).length,10);assert.ok(!ui.content.innerHTML.includes('data-locked-mission='));assert.equal((ui.content.innerHTML.match(/✓ RIGIOCA/g)||[]).length,2);ui.app.settings.unlockAllMissions=false;UIManager.prototype.journal.call(ui);assert.equal((ui.content.innerHTML.match(/data-mission=/g)||[]).length,3);
});
test('Central launch and checkpoint resume respect override and block again after disable',()=>{
 const started=[],checkpoint={mission:8,chapter:1},el={textContent:'',classList:{add(){},remove(){}}};globalThis.document={body:el,querySelector:()=>el};globalThis.window={Phaser:true,scrollTo(){}};
 const app=Object.create(ClickGame.prototype);Object.assign(app,{settings:{unlockAllMissions:true},selectedMission:1,save:{completed:()=>[1],load:()=>checkpoint},audio:{unlock(){},stop(){}},journey:{select(){},renderSelection(){}},ui:{toast(){}},game:{scale:{refresh(){}}},scene:{scene:{resume(){}},beginRun:r=>started.push(r)},fullscreen:{sync(){}}});app.start(false,9);assert.equal(app.selectedMission,9);app.start(true);assert.equal(app.selectedMission,8);assert.deepEqual(started,[null,checkpoint]);app.settings.unlockAllMissions=false;assert.equal(app.start(false,9),false);assert.equal(app.start(true),false);assert.equal(started.length,2);
});
