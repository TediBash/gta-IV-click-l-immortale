import {linesFor,lineById} from '../data/voices.js';
import {characterById} from '../data/characters.js';
export class SoundAndVoiceManager{
 constructor(bus,store,settings){this.bus=bus;this.store=store;this.settings=settings;this.ctx=null;this.current=null;this.currentUrl=null;this.last=0;this.lastId='';this.priority=0;this.timer=null;this.token=0;}
 unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});}catch{} }
 stop(){this.token++;window.speechSynthesis?.cancel();if(this.current){this.current.pause();this.current=null;}if(this.currentUrl){URL.revokeObjectURL(this.currentUrl);this.currentUrl=null;}clearTimeout(this.timer);this.priority=0;this.bus.emit('voice:clear');}
 effect(kind='hit'){if(this.settings.muted||this.settings.effectsEnabled===false||!this.ctx)return;const now=this.ctx.currentTime;const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.connect(gain);gain.connect(this.ctx.destination);osc.type=['loot','heal'].includes(kind)?'sine':['drone','dive'].includes(kind)?'sawtooth':'triangle';const f={drone:95,dive:780,explosion:65,hit:130,loot:660,heal:740,special:180,hurt:80,gate:440}[kind]||160;osc.frequency.setValueAtTime(f,now);osc.frequency.exponentialRampToValueAtTime(['loot','heal'].includes(kind)?1100:40,now+.16);gain.gain.setValueAtTime(.07*this.settings.volume*(this.settings.effectsVolume??1),now);gain.gain.exponentialRampToValueAtTime(.001,now+.2);osc.start();osc.stop(now+.21);}
 say(character,event,priority=0){const options=linesFor(character,event);if(!options.length)return;const choices=options.filter(l=>l.id!==this.lastId);const line=(choices.length?choices:options)[Math.floor(Math.random()*(choices.length||options.length))];return this.play(line.id,{priority});}
 async play(id,{priority=2,force=false}={}){
  const line=lineById(id);if(!line)return;const now=Date.now(),gap=this.settings.frequency==='low'?14000:6500;
  if(!force&&((priority===0&&now-this.last<gap)||this.priority>priority))return;
  this.stop();const token=this.token;this.priority=priority;this.last=now;this.lastId=id;const person=characterById(line.character);
  this.bus.emit('voice:line',{...line,name:person.name});this.timer=setTimeout(()=>{if(this.token===token){this.bus.emit('voice:clear');this.priority=0;}},Math.max(3000,Math.min(8500,line.text.length*65)));
  if(this.settings.muted||this.settings.voicesEnabled===false)return;
  const clip=this.store.get(id);if(clip){this.currentUrl=URL.createObjectURL(clip.blob);this.current=new Audio(this.currentUrl);this.current.volume=this.settings.volume*(this.settings.voiceVolume??1);try{await this.current.play();return;}catch{if(this.token!==token)return;}}
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;
  const speech=new SpeechSynthesisUtterance(line.text);speech.lang='it-IT';speech.rate=person.rate;speech.pitch=line.event==='child'?Math.min(1.4,person.pitch+.2):person.pitch;speech.volume=this.settings.volume*(this.settings.voiceVolume??1);
  const voices=speechSynthesis.getVoices();speech.voice=voices.find(v=>v.voiceURI===this.settings.voices[line.character])||voices.find(v=>/^it/i.test(v.lang))||null;
  speechSynthesis.speak(speech);
 }
}
