import {steeringAt} from '../core/RaceDriving.js';
/** Race-only touch surface; shares reset/keyboard state with the normal controls. */
export class RaceTouchControls{
 constructor(app,doc=document,win=window){
  this.app=app;this.input=app.input;this.doc=doc;this.root=doc.querySelector('.race-controls');this.steer=this.root.querySelector('.race-steering');this.pedals=[...this.root.querySelectorAll('[data-race-action]')];this.pointers=new Map();this.active=false;
  this.input.resetListeners.add(()=>this.reset());
  this.root.addEventListener('pointerdown',e=>this.down(e));this.root.addEventListener('pointermove',e=>this.move(e));
  for(const event of ['pointerup','pointercancel','lostpointercapture'])this.root.addEventListener(event,e=>this.release(e.pointerId));
  for(const event of ['contextmenu','selectstart','dragstart','dblclick'])this.root.addEventListener(event,e=>e.preventDefault());
  this.root.querySelectorAll('[data-race-system]').forEach(b=>{b.addEventListener('pointerdown',e=>{if(!this.active)return;e.preventDefault();e.stopPropagation();this.input.systemAction(b.dataset.raceSystem);});b.addEventListener('click',e=>{if(e.detail===0&&this.active)this.input.systemAction(b.dataset.raceSystem);});});
  this.root.querySelectorAll('[data-race-action]').forEach(b=>{b.addEventListener('keydown',e=>{if(!this.active||!this.input.enabled||!['Space','Enter'].includes(e.code))return;e.preventDefault();this.input.setSource('race:key:'+b.dataset.raceAction,[b.dataset.raceAction]);this.render();});b.addEventListener('keyup',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();this.input.setSource('race:key:'+b.dataset.raceAction,[]);this.render();}});b.addEventListener('blur',()=>{this.input.setSource('race:key:'+b.dataset.raceAction,[]);this.render();});});
  this.steer.addEventListener('keydown',e=>{if(!this.active||!this.input.enabled||!['ArrowLeft','ArrowRight','Home'].includes(e.code))return;e.preventDefault();e.stopPropagation();this.input.raceSteeringActive=true;this.input.raceSteering=e.code==='Home'?0:Math.max(-1,Math.min(1,this.input.raceSteering+(e.code==='ArrowLeft'?-.2:.2)));this.render();});
  this.steer.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.code)){e.preventDefault();this.input.raceSteering=0;this.input.raceSteeringActive=false;this.render();}});
  this.steer.addEventListener('blur',()=>{this.input.raceSteering=0;this.input.raceSteeringActive=false;this.render();});
  win.addEventListener('orientationchange',()=>this.input.clear());
 }
 setActive(active){this.input.clear();this.active=!!active;this.doc.body.classList.toggle('is-racing',this.active);this.root.hidden=!this.active;this.syncSettings();}
 syncSettings(){this.root.classList.toggle('manual-acceleration',this.app.settings.raceAutoAccelerate===false);this.root.querySelector('[data-race-status]').textContent=`${this.app.settings.raceAutoAccelerate!==false?'GAS AUTO':'GAS MANUALE'} · ${this.app.settings.raceAssist!==false?'ASSISTITA':'LIBERA'}`;this.input.clear();this.app.fullscreen?.resize();}
 pedalAt(x,y){return this.pedals.find(b=>{if(b.dataset.raceAction==='raceAccelerate'&&this.app.settings.raceAutoAccelerate!==false)return false;const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});}
 down(e){
  if(!this.active||!this.input.enabled||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();
  const steering=this.steer.contains(e.target),pedal=this.pedalAt(e.clientX,e.clientY);if(!steering&&!pedal)return;
  if(steering&&[...this.pointers.values()].some(p=>p==='steer'))return;
  this.pointers.set(e.pointerId,steering?'steer':'pedal');this.root.setPointerCapture(e.pointerId);this.move(e);
 }
 move(e){
  const kind=this.pointers.get(e.pointerId);if(!kind||!this.active||!this.input.enabled)return;e.preventDefault();
  if(kind==='steer'){const r=this.steer.getBoundingClientRect();this.input.raceSteeringActive=true;this.input.raceSteering=e.clientY<r.top-50||e.clientY>r.bottom+50?0:steeringAt(e.clientX,r);}
  else this.input.setSource('race:pointer:'+e.pointerId,[this.pedalAt(e.clientX,e.clientY)?.dataset.raceAction].filter(Boolean));this.render();
 }
 release(id){
  if(!this.pointers.has(id))return;const kind=this.pointers.get(id);this.pointers.delete(id);
  if(kind==='steer'){this.input.raceSteering=0;this.input.raceSteeringActive=false;}else this.input.setSource('race:pointer:'+id,[]);
  if(this.root.hasPointerCapture(id))this.root.releasePointerCapture(id);this.render();
 }
 reset(){const ids=[...this.pointers.keys()];this.pointers.clear();this.input.raceSteering=0;this.input.raceSteeringActive=false;for(const id of ids)if(this.root.hasPointerCapture(id))this.root.releasePointerCapture(id);this.render();}
 render(){const turn=this.input.raceSteering||0;this.steer.style.setProperty('--steer',turn);this.steer.setAttribute('aria-valuenow',String(Math.round(turn*100)));for(const b of this.pedals){const on=this.input.held.has(b.dataset.raceAction);b.classList.toggle('is-held',on);b.setAttribute('aria-pressed',String(on));}}
}
