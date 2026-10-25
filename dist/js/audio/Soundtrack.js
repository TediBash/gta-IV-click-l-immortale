import {explorationTrack,threatTrack,CUES,TRACKS} from './MusicScore.js';
/** Shared AudioContext, separate buses, cached PCM loops and cancellable async transitions. */
export class Soundtrack{
 constructor(app){this.app=app;this.cache=new Map();this.offsets=new Map();this.live=new Set();this.generation=0;this.current=null;this.wanted=null;this.threatUntil=0;this.threat=null;this.zoneKey='';this.voice=false;this.dialogue=false;this.cueUntil=0;this.cuePriority=-1;this.cueToken=0;
  const b=app.bus;b.on('voice:line',()=>{this.voice=true;this.levels();});b.on('voice:clear',()=>{this.voice=false;this.levels();});b.on('dialogue:open',()=>{this.dialogue=true;this.levels();});b.on('dialogue:cancel',()=>{this.dialogue=false;this.levels();});
  b.on('zone:loading',()=>this.cue('room'));b.on('loot:found',item=>this.cue(item.art?'photo':['cash','heal','charge','upgrade'].includes(item.skin)?'chest':'found'));b.on('special:activated',({ability})=>{if(/50%|CARICA [12]\/2/.test(ability))this.app.audio.effect('gate');});b.on('chapter:started',()=>{this.threatUntil=0;this.cue('chapter');});
  this.timer=setInterval(()=>this.tick(),250);
 }
 get ctx(){return this.app.audio.ctx;}
 async buffer(id){if(!this.cache.has(id)){const job=fetch(`assets/music/${id}.wav`).then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).then(a=>this.ctx.decodeAudioData(a));this.cache.set(id,job);job.catch(()=>this.cache.delete(id));if(this.cache.size>8)this.cache.delete(this.cache.keys().next().value);}return this.cache.get(id);}
 enabled(){const s=this.app.settings;return !!this.ctx&&!s.muted&&s.musicEnabled!==false&&!document.hidden;}
 make(buffer,loop,kind){const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=buffer;source.loop=loop;source.connect(gain);gain.connect(this.ctx.destination);const node={source,gain,kind};this.live.add(node);source.onended=()=>{this.live.delete(node);source.disconnect();gain.disconnect();};return node;}
 end(node,fade=0){if(!node||node.ending)return;if(node.kind==='bg'&&node.id)this.offsets.set(node.id,((node.offset||0)+this.ctx.currentTime-node.startedAt)%node.source.buffer.duration);node.ending=true;const t=this.ctx.currentTime;node.gain.gain.cancelScheduledValues(t);node.gain.gain.setTargetAtTime(0,t,.08);try{node.source.stop(t+fade);}catch{}}
 silence(){this.generation++;this.wanted=null;this.current=null;this.cueToken++;this.cueUntil=0;for(const n of this.live)this.end(n);}
 levels(){if(!this.ctx)return;const s=this.app.settings,base=(s.volume??.65)*(s.musicVolume??.65)*.65;for(const n of this.live)if(!n.ending)n.gain.gain.setTargetAtTime(this.enabled()?base*(n.kind==='bg'&&(this.voice||this.dialogue||Date.now()<this.cueUntil)?.22:1):0,this.ctx.currentTime,.12);}
 async track(id){if(this.wanted===id)return;this.wanted=id;const token=++this.generation;try{const buffer=await this.buffer(id);if(token!==this.generation||!this.enabled())return;const old=this.current,n=this.make(buffer,true,'bg');n.id=id;n.gain.gain.value=0;this.current=n;n.offset=this.offsets.get(id)||0;n.startedAt=this.ctx.currentTime;n.source.start(0,n.offset);this.end(old,.6);this.levels();}catch{if(token===this.generation)this.wanted=null;}}
 async cue(id){if(!this.enabled()||!(id in CUES))return;const priority=CUES[id],now=Date.now();if(now<this.cueUntil&&priority<=this.cuePriority)return;this.cuePriority=priority;this.cueUntil=now+1000;const token=++this.cueToken;try{const buffer=await this.buffer(id);if(token!==this.cueToken||!this.enabled())return;for(const n of this.live)if(n.kind==='cue')this.end(n,.1);const n=this.make(buffer,false,'cue');this.cueUntil=Date.now()+buffer.duration*1000;n.source.start();this.levels();}catch{if(token===this.cueToken)this.cueUntil=0;}}
 preview(id){if(!(id in TRACKS))return;this.app.audio.unlock();this.previewId=id;this.previewUntil=Date.now()+15000;this.wanted=null;this.tick();}
 stopPreview(){this.previewId=null;this.silence();this.tick();}
 tick(){
  if(!this.enabled()){if(this.current||this.wanted||this.live.size)this.silence();return;}
  if(this.previewId&&Date.now()<this.previewUntil){this.track(this.previewId);this.levels();return;}this.previewId=null;
  const s=this.app.scene;if(!this.app.playing||!s?.mission||this.app.ui.dialog.open){if(this.current||this.wanted||this.live.size)this.silence();return;}
  if(s.activeMission)this.dialogue=false;
  const key=`${s.mission.id}/${s.mission.state.index}/${s.mission.config.zone||''}`;if(key!==this.zoneKey){this.zoneKey=key;this.threatUntil=0;}
  const threat=s.activeMission?threatTrack(s):null;if(threat){this.threat=threat;this.threatUntil=Date.now()+3500;}
  this.track(Date.now()<this.threatUntil?this.threat:explorationTrack(s));this.levels();
 }
}
