import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRACKS,CHAPTER_MUSIC,explorationTrack,threatTrack} from '../dist/js/audio/MusicScore.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {Soundtrack} from '../dist/js/audio/Soundtrack.js';
import {EventBus} from '../dist/js/core/EventBus.js';
const manifest=JSON.parse(readFileSync(new URL('../dist/assets/music/manifest.json',import.meta.url)));
test('All 31 chapters map to rendered original music, plus 11 real event files',()=>{
 assert.equal(Object.keys(TRACKS).length,12);assert.equal(Object.keys(manifest).length,23);
 for(const m of Object.values(MISSIONS)){assert.equal(CHAPTER_MUSIC[m.id].length,m.chapters.length);for(const id of CHAPTER_MUSIC[m.id])assert.ok(manifest[id].loop);}
 for(const [id,m]of Object.entries(manifest)){
  const wav=readFileSync(new URL('../dist/assets/music/'+id+'.wav',import.meta.url));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(24),22050);assert.ok(m.peak<.95&&m.rms>.01);assert.ok(m.loop?m.duration>=45&&m.duration<=90:m.duration<=7);
  if(m.loop){const first=wav.readInt16LE(44),last=wav.readInt16LE(wav.length-2);assert.ok(Math.abs(first-last)<500,'clean loop boundary '+id);}
 }
});
test('Quiet zones, races and threats select the intended themes without fighting in Greece',()=>{
 const s={mission:{id:1,state:{index:0},config:{zone:'olives'},mission:{children:true}},party:[{x:100,y:100}],enemies:[{x:150,y:100,boss:true}],map:{clearLine:()=>true}};
 assert.equal(explorationTrack(s),'E1');assert.equal(threatTrack(s),null);s.mission.config.zone='base';assert.equal(explorationTrack(s),'E4');
 s.mission={id:10,state:{index:3},config:{zone:'home'},mission:{}};assert.equal(explorationTrack(s),'E9');assert.equal(threatTrack(s),'B3');s.enemies[0].boss=false;assert.equal(threatTrack(s),'B2');s.map.clearLine=()=>false;assert.equal(threatTrack(s),null);
});
function setup(){
 globalThis.document={hidden:false};const sources=[];const param=()=>({value:0,setTargetAtTime(v){this.value=v;},cancelScheduledValues(){}});
 const ctx={currentTime:0,destination:{},createGain:()=>({gain:param(),connect(){},disconnect(){}}),createBufferSource:()=>{const n={connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;this.onended?.();}};sources.push(n);return n;}};
 const app={bus:new EventBus(),settings:{volume:1,musicVolume:1,musicEnabled:true},audio:{ctx,unlock(){},effect(){}},playing:true,ui:{dialog:{open:false}},scene:{activeMission:true,isHideout:true,mission:{id:1,state:{index:0},config:{}},party:[],enemies:[]}};
 const music=new Soundtrack(app);clearInterval(music.timer);music.buffer=async()=>({duration:2});return {app,music,sources};
}
test('Repeated selection does not restart a loop; ducking, mute and menu pause stop the right audio',async()=>{
 const {app,music,sources}=setup();await music.track('E1');await music.track('E1');assert.equal(sources.length,1);const before=music.current.gain.gain.value;app.bus.emit('voice:line',{});assert.ok(music.current.gain.gain.value<before);app.bus.emit('voice:clear');assert.equal(music.current.gain.gain.value,before);
 app.settings.voicesEnabled=false;music.tick();assert.equal(music.enabled(),true);app.settings.musicEnabled=false;music.tick();assert.ok(sources[0].stopped);assert.equal(music.current,null);
 app.settings.musicEnabled=true;await music.track('E2');app.ui.dialog.open=true;music.tick();assert.equal(music.current,null);
});
test('Stale asynchronous loads cannot start after mute or replace a newer track',async()=>{
 const {app,music,sources}=setup();let done;music.buffer=()=>new Promise(r=>done=r);const pending=music.track('E1');app.settings.muted=true;music.tick();done({duration:2});await pending;assert.equal(sources.length,0);
 app.settings.muted=false;let first;music.buffer=id=>id==='E1'?new Promise(r=>first=r):Promise.resolve({duration:2});const old=music.track('E1');await music.track('B3');first({duration:2});await old;assert.equal(music.current.id,'B3');assert.equal(sources.length,1);
});
test('Victory supersedes pickup jingles and lower-priority cues cannot overlap',async()=>{
 const {music,sources}=setup();await music.cue('victory');await music.cue('found');assert.equal(sources.length,1);await music.cue('birthday');assert.equal(sources.length,2);assert.ok(sources[0].stopped);music.silence();assert.ok(sources[1].stopped);
});
