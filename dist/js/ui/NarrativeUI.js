import {artMarkup} from './ManualArt.js';
export {artMarkup} from './ManualArt.js';
// An explicit null leaves the live scene visible; undefined inherits the scene artwork.
export const dialogueArt=(options,line)=>line.art!==undefined?line.art:options.art;
import {WORKSHOP_SKINS} from '../data/zones.js';
import {appearance} from '../data/appearance.js';
import {characterById} from '../data/characters.js';
import {PROP_SKINS,DETAIL_SKINS,CELEBRATION_SKINS} from '../data/skins.js';
const safe=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class NarrativeUI{
 constructor(app){
  this.app=app;this.stage=document.createElement('section');this.stage.className='dialogue-stage hidden';this.stage.setAttribute('aria-label','Dialogo della banda');this.stage.setAttribute('role','region');
  this.loot=document.createElement('aside');this.loot.className='loot-banner hidden';this.loot.setAttribute('role','status');document.querySelector('.game-frame').append(this.stage,this.loot);
  app.bus.on('dialogue:open',options=>this.open(options));app.bus.on('dialogue:cancel',()=>this.cancel());app.bus.on('loot:found',item=>this.found(item));app.bus.on('loot:clear',()=>{clearTimeout(this.lootTimer);this.loot.classList.add('hidden');});
  window.addEventListener('keydown',e=>{if(!this.options||app.ui?.dialog.open||e.repeat||!['KeyJ','KeyZ','Space','Enter'].includes(e.code)||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;e.preventDefault();this.next();});
  document.querySelector('[data-control="attack"]').addEventListener('pointerdown',e=>{if(this.options&&!app.ui?.dialog.open){e.preventDefault();this.next();}});
 }
 open(options){this.cancel();this.options=options;this.index=0;this.previousFocus=document.activeElement;document.body.classList.add('in-dialogue');this.stage.classList.remove('hidden');this.render();}
 cancel(){this.options=null;this.stage.classList.add('hidden');document.body.classList.remove('in-dialogue');this.app.audio.stop();}
 render(){
  const o=this.options,line=o.lines[this.index],person=characterById(line.character),a=appearance(line.character,o),last=this.index===o.lines.length-1,art=dialogueArt(o,line);
  this.stage.classList.toggle('cinematic',!!art);this.stage.classList.toggle('still',!!this.app.settings.reduceMotion);
  this.stage.innerHTML=`${art?`<div class="scene-art">${artMarkup(art)}<span class="scene-caption">${safe(o.kicker)}</span></div>`:''}<div class="speech-panel"><div class="speech-portrait" aria-hidden="true"><div style="background-image:url(assets/${a.texture}-atlas.png);background-size:400% ${a.rows*100}%;background-position:0 ${a.rows>1?a.row/(a.rows-1)*100:0}%"></div></div><div class="speech-copy" aria-live="polite"><small>${safe(art?'DIALOGO':o.kicker)}</small><b>${safe(person?.name||line.character)}</b><p>${safe(line.text)}</p></div><div class="speech-actions"><span>${this.index+1} / ${o.lines.length}</span><button type="button">${safe(last?o.lastLabel||'RIPRENDI':'CONTINUA')} <i> A ›</i></button></div></div>`;
  this.stage.querySelector('button').onclick=()=>this.next();this.stage.querySelector('button').focus({preventScroll:true});this.readyAt=Date.now()+220;this.app.audio.play(line.id,{force:true,priority:4});
 }
 next(){if(!this.options||this.app.ui?.dialog.open||Date.now()<this.readyAt)return;this.app.audio.stop();if(++this.index<this.options.lines.length){this.render();return;}const done=this.options.onComplete;this.cancel();this.previousFocus?.focus?.({preventScroll:true});done?.();}
 found(item){
  let picture=artMarkup(item.art);
  if(!picture){const list=WORKSHOP_SKINS.includes(item.skin)?WORKSHOP_SKINS:item.skin==='backpack'?CELEBRATION_SKINS:DETAIL_SKINS.includes(item.skin)?DETAIL_SKINS:PROP_SKINS,texture=list===WORKSHOP_SKINS?'workshop':item.skin==='backpack'?'celebration':list===DETAIL_SKINS?'details':'props',i=Math.max(0,list.indexOf(item.skin));picture=`<div class="loot-icon" style="background-image:url(assets/${texture}-atlas.png);background-size:400% ${list===WORKSHOP_SKINS?200:400}%;background-position:${i%4/3*100}% ${Math.floor(i/4)/(list===WORKSHOP_SKINS?1:3)*100}%"></div>`;}
  this.loot.innerHTML=`${picture}<div><small>${safe(item.character)} HA TROVATO</small><b>${safe(item.name)}</b></div>`;this.loot.classList.remove('hidden');clearTimeout(this.lootTimer);this.lootTimer=setTimeout(()=>this.loot.classList.add('hidden'),2600);
 }
}
