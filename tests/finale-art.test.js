import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {FINALE_ART,FINALE_POINT_ART} from '../dist/js/data/finale-art.js';
import {chapterArt,pointArt,pointLines,introLines,resumeArt} from '../dist/js/data/dialogues.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {dialogueArt,NarrativeUI} from '../dist/js/ui/NarrativeUI.js';
import {artGeometry} from '../dist/js/ui/ManualArt.js';
import {FinaleEffects} from '../dist/js/world/FinaleEffects.js';
test('Every finale interaction has an explicit matching illustration or a deliberate live-gameplay view',()=>{
 const points=MISSIONS[10].chapters.flatMap(c=>c.points||[]);assert.deepEqual(new Set(points.map(p=>p.id)),new Set(Object.keys(FINALE_POINT_ART)));
 for(const p of points)assert.equal(pointArt(10,p),FINALE_POINT_ART[p.id]);
 for(const art of Object.values(FINALE_ART)){artGeometry(art);assert.ok(existsSync('dist/'+art.src));}
 assert.equal(chapterArt(10,0).id,'technical');assert.equal(chapterArt(10,0,true).id,'square');assert.equal(chapterArt(10,1,true).id,'escape-car');assert.equal(chapterArt(10,3).id,'homeward');assert.equal(chapterArt(10,3,true).id,'birthday');
 for(const id of ['route','bag','nico'])assert.equal(pointArt(10,{id}),null);
 for(const p of points.filter(p=>p.id!=='birthday'))assert.notEqual(pointArt(10,p)?.id,'birthday');
});
test('The news dialogue changes from the broadcast to the road when Click mentions the Alps',()=>{
 const lines=pointLines(10,{id:'radio'}),options={art:pointArt(10,{id:'radio'})};assert.equal(dialogueArt(options,lines[0]).id,'news');assert.equal(dialogueArt(options,lines[1]).id,'homeward');
 const twins=introLines(10,2);assert.equal(dialogueArt({art:FINALE_ART.twins},twins[1]),null);
 assert.equal(dialogueArt({art:FINALE_ART.technical},{text:'Unchanged legacy dialogue'}),FINALE_ART.technical);
});
test('Resuming in the garage or at home uses that zone, not the chapter opening image',()=>{
 assert.equal(resumeArt(10,'garage',1).id,'escape-car');assert.equal(resumeArt(10,'home',3).id,'reunion');assert.equal(resumeArt(10,'road',3).id,'homeward');assert.equal(resumeArt(10,'backstreet',1),null);assert.equal(resumeArt(9,'foyer',0),chapterArt(9,0));
});
test('Finale animations call the point-specific dialogue rather than the chapter-ending artwork',()=>{
 const callbacks=[];let shown=0;const shape={setStrokeStyle(){return this;},setDepth(){return this;},destroy(){}};
 const controller={zone:'service',busy:false,scene:{mission:{id:10},app:{settings:{reduceMotion:true},input:{clear(){}}},add:{circle:()=>shape},tweens:{add:t=>callbacks.push(t.onComplete)},playDialogue(){throw Error('Chapter fallback must not replace point art');}}};
 const effects=new FinaleEffects(controller);assert.equal(effects.animatePoint({action:'reveal',id:'link'},()=>shown++),true);callbacks[0]();assert.equal(shown,1);assert.equal(controller.busy,false);
});
test('Narrative rendering replaces the illustrated panel per line and clears it for live action',()=>{
 const button={focus(){}};const stage={classList:{toggle(){}},querySelector:()=>button,innerHTML:''};const ui=Object.create(NarrativeUI.prototype);ui.stage=stage;ui.app={settings:{},audio:{play(){}}};ui.options={art:FINALE_ART.birthday,kicker:'NOTIZIARIO',lines:pointLines(10,{id:'radio'})};ui.index=0;ui.render();assert.match(stage.innerHTML,/m10-2.jpg/);assert.doesNotMatch(stage.innerHTML,/birthday.jpg/);ui.index=1;ui.render();assert.match(stage.innerHTML,/m10-3.jpg/);assert.doesNotMatch(stage.innerHTML,/m10-2.jpg/);
 ui.options={art:FINALE_ART.twins,lines:introLines(10,2)};ui.index=1;ui.render();assert.doesNotMatch(stage.innerHTML,/scene-art/);assert.match(stage.innerHTML,/speech-panel/);
});
