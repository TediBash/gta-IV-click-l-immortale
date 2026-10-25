import {InputState,padDirections} from './InputState.js';
export class GBAInputController extends InputState {
 constructor(onPause,onSelect=onPause){
  super();this._enabled=false;this.onPause=onPause;this.onSelect=onSelect;this.pointers=new Map();
  this.map={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyJ:'attack',KeyZ:'attack',Space:'attack',KeyK:'special',KeyX:'special',KeyQ:'switch',Tab:'switch',Escape:'pause',Enter:'pause',KeyM:'journal',KeyR:'reverse'};
  this.controls=document.querySelector('.touch-controls');this.pad=this.controls.querySelector('.dpad');this.buttons=[...this.controls.querySelectorAll('[data-control]')];
  window.addEventListener('keydown',e=>{
   if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||(e.target.tagName==='BUTTON'&&['Enter','Space'].includes(e.code)))return;
   const key=this.map[e.code];if(!key)return;
   if(key==='pause'||key==='journal'){e.preventDefault();if(!e.repeat)this.systemAction(key);return;}
   if(!this.enabled)return;e.preventDefault();
   this.setSource('key:'+e.code,[key]);this.render();
  });
  for(const button of this.buttons)if(['pause','journal'].includes(button.dataset.control))button.addEventListener('click',e=>{if(e.detail===0)this.systemAction(button.dataset.control);});
  window.addEventListener('keyup',e=>{if(this.map[e.code]){this.setSource('key:'+e.code,[]);this.render();}});
  window.addEventListener('blur',()=>{this.clear();if(this.enabled)this.onPause(true);});
  window.addEventListener('pagehide',()=>this.clear());
  window.addEventListener('resize',()=>this.clear());
  this.controls.addEventListener('pointerdown',e=>this.pointerDown(e));
  this.controls.addEventListener('pointermove',e=>this.pointerMove(e));
  for(const event of ['pointerup','pointercancel','lostpointercapture'])this.controls.addEventListener(event,e=>this.release(e.pointerId));
  // Keep game surfaces free of text selection, drag handles and long-press menus.
  for(const surface of [this.controls,document.querySelector('#game-canvas')]){
   for(const event of ['contextmenu','selectstart','dragstart'])surface?.addEventListener(event,e=>e.preventDefault());
  }
 }
 get enabled(){return this._enabled;}
 set enabled(value){this._enabled=!!value;if(!value)this.clear();}
 systemAction(key){this.clear();if(key==='pause')this.onPause();else this.onSelect();}
 pointerDown(e){
  if(!this.enabled||(e.pointerType==='mouse'&&e.button!==0))return;
  const isPad=this.pad.contains(e.target),button=e.target.closest('[data-control]');
  e.preventDefault();if(!isPad&&!button)return;
  if(button&&['pause','journal'].includes(button.dataset.control)){this.systemAction(button.dataset.control);return;}
  // One steering thumb; additional fingers remain available for A/B and change.
  if(isPad&&[...this.pointers.values()].some(p=>p.kind==='pad'))return;
  this.pointers.set(e.pointerId,{kind:isPad?'pad':'action'});
  this.controls.setPointerCapture(e.pointerId);this.pointerMove(e);
 }
 pointerMove(e){
  const pointer=this.pointers.get(e.pointerId);if(!pointer||!this.enabled)return;e.preventDefault();
  let keys=[];
  if(pointer.kind==='pad')keys=padDirections(e.clientX,e.clientY,this.pad.getBoundingClientRect());
  else{
   const button=this.buttons.find(b=>{if(this.pad.contains(b))return false;const r=b.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;});
   if(button&&!['pause','journal'].includes(button.dataset.control))keys=[button.dataset.control];
  }
  this.setSource('pointer:'+e.pointerId,keys);this.render();
 }
 release(id){this.pointers.delete(id);this.setSource('pointer:'+id,[]);this.render();}
 render(){for(const button of this.buttons||[]){const active=this.held.has(button.dataset.control);button.classList.toggle('is-held',active);button.setAttribute('aria-pressed',String(active));}}
 clear(){
  const ids=[...(this.pointers?.keys()||[])];this.pointers?.clear();super.clear();
  for(const id of ids)if(this.controls?.hasPointerCapture(id))this.controls.releasePointerCapture(id);
  this.render();
 }
}
