import test from 'node:test';
import assert from 'node:assert/strict';
import {InputState,padDirections} from '../dist/js/core/InputState.js';
import {GBAInputController} from '../dist/js/core/GBAInputController.js';
const rect={left:0,top:0,right:144,bottom:144,width:144,height:144};

test('Sliding across a continuous pad changes direction and permits diagonals',()=>{
 assert.deepEqual(padDirections(72,10,rect),['up']);
 assert.deepEqual(padDirections(132,15,rect),['right','up']);
 assert.deepEqual(padDirections(135,72,rect),['right']);
 assert.deepEqual(padDirections(72,135,rect),['down']);
 assert.deepEqual(padDirections(10,72,rect),['left']);
 assert.deepEqual(padDirections(72,72,rect),[]);
 assert.deepEqual(padDirections(220,72,rect),[]);
});
test('Independent fingers and keyboard aliases never release each other',()=>{
 const input=new InputState();input.setSource('thumb',['up']);input.setSource('action',['attack']);input.setSource('KeyW',['up']);
 input.setSource('thumb',['right']);assert.deepEqual([...input.held].sort(),['attack','right','up']);
 input.setSource('action',[]);assert.equal(input.held.has('right'),true);
 input.setSource('thumb',[]);assert.equal(input.held.has('up'),true);input.setSource('KeyW',[]);assert.equal(input.held.size,0);
});
test('A quick tap remains available for one frame, diagonals keep walking speed constant',()=>{
 const input=new InputState();input.setSource('button',['special']);input.setSource('button',[]);
 assert.equal(input.consume('special'),true);assert.equal(input.consume('special'),false);
 input.setSource('thumb',['right','down']);const {x,y}=input.movement();assert.ok(Math.abs(Math.hypot(x,y)-1)<1e-9);
 input.clear();assert.equal(input.held.size,0);assert.equal(input.pressed.size,0);assert.equal(input.sources.size,0);
});

// Narrow event/element doubles exercise controller ownership and cancellation,
// without claiming a browser rendering or real-device check.
class Element {
 constructor(name,rect={left:0,top:0,right:0,bottom:0,width:0,height:0}){this.name=name;this.rect=rect;this.listeners={};this.children=[];this.dataset={};this.attributes={};this.captures=new Set();this.classes=new Set();this.classList={toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
 emit(name,props={}){const e={target:this,preventDefault(){this.prevented=true;},...props};for(const fn of this.listeners[name]||[])fn(e);return e;}
 contains(el){return el===this||this.children.some(c=>c.contains(el));}
 closest(){return this.dataset.control?this:this.parent?.closest();}
 querySelector(){return this.children.find(c=>c.name==='pad');}
 querySelectorAll(){return this.children.flatMap(c=>c.dataset.control?[c]:c.querySelectorAll());}
 getBoundingClientRect(){return this.rect;}
 setAttribute(k,v){this.attributes[k]=v;}
 setPointerCapture(id){this.captures.add(id);}
 hasPointerCapture(id){return this.captures.has(id);}
 releasePointerCapture(id){this.captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}
 add(child){this.children.push(child);child.parent=this;return child;}
}
function fixture(){
 const controls=new Element('controls'),pad=controls.add(new Element('pad',rect));
 for(const key of ['up','down','left','right']){const b=pad.add(new Element(key));b.dataset.control=key;}
 const a=controls.add(new Element('A',{left:240,right:300,top:0,bottom:60,width:60,height:60}));a.dataset.control='attack';
 const b=controls.add(new Element('B',{left:165,right:225,top:20,bottom:80,width:60,height:60}));b.dataset.control='special';
 const start=controls.add(new Element('start',{left:145,right:205,top:90,bottom:134,width:60,height:44}));start.dataset.control='pause';
 const select=controls.add(new Element('select',{left:210,right:270,top:90,bottom:134,width:60,height:44}));select.dataset.control='journal';
 const canvas=new Element('canvas'),win=new Element('window');globalThis.window=win;globalThis.document={querySelector:s=>s==='.touch-controls'?controls:canvas};
 let pauses=0,selections=0;const input=new GBAInputController(()=>{pauses++;},()=>{selections++;});input.enabled=true;
 const event=(id,x,y,target=pad)=>({pointerId:id,clientX:x,clientY:y,target,pointerType:'touch',button:0});
 return {controls,pad,a,b,start,select,canvas,win,input,event,pauses:()=>pauses,selections:()=>selections};
}
test('One captured finger slides up → diagonal → right while another holds A',()=>{
 const f=fixture();f.controls.emit('pointerdown',f.event(1,72,10));f.controls.emit('pointerdown',f.event(2,260,30,f.a));
 assert.ok(f.input.held.has('up')&&f.input.held.has('attack'));assert.equal(f.controls.captures.size,2);
 f.controls.emit('pointermove',f.event(1,135,10));assert.ok(f.input.held.has('up')&&f.input.held.has('right'));
 f.controls.emit('pointermove',f.event(1,135,72));assert.equal(f.input.held.has('up'),false);assert.ok(f.input.held.has('right')&&f.input.held.has('attack'));
 f.controls.emit('pointerup',f.event(2,260,30,f.a));assert.equal(f.input.held.has('attack'),false);assert.equal(f.input.held.has('right'),true);
 f.controls.emit('pointercancel',f.event(1,135,72));assert.equal(f.input.held.size,0);
});
test('Dragging between A and B releases the first action; moving away releases both',()=>{
 const f=fixture();f.controls.emit('pointerdown',f.event(2,260,30,f.a));f.controls.emit('pointermove',f.event(2,190,45,f.a));
 assert.equal(f.input.held.has('attack'),false);assert.equal(f.input.held.has('special'),true);assert.equal(f.b.attributes['aria-pressed'],'true');
 f.controls.emit('pointermove',f.event(2,400,45,f.a));assert.equal(f.input.held.size,0);assert.equal(f.b.attributes['aria-pressed'],'false');
});
test('Pausing, interrupted capture and blur clear held buttons without sticky movement',()=>{
 const f=fixture();f.controls.emit('pointerdown',f.event(1,72,10));f.controls.emit('pointerdown',f.event(2,260,30,f.a));
 f.input.enabled=false;assert.equal(f.input.held.size,0);assert.equal(f.input.pointers.size,0);assert.equal(f.controls.captures.size,0);
 f.controls.emit('pointermove',f.event(1,135,72));assert.equal(f.input.held.size,0);
 f.input.enabled=true;f.controls.emit('pointerdown',f.event(3,135,72));f.controls.emit('lostpointercapture',f.event(3,135,72));assert.equal(f.input.held.size,0);
 f.controls.emit('pointerdown',f.event(4,72,10));f.win.emit('blur');assert.equal(f.input.held.size,0);assert.equal(f.pauses(),1);
});
test('Long-press menus and text-selection events are cancelled on game controls',()=>{
 const f=fixture();for(const target of [f.controls,f.canvas])for(const event of ['contextmenu','selectstart','dragstart'])assert.equal(target.emit(event).prevented,true);
});
test('Missing an action button cancels the empty control tap without creating an attack',()=>{
 const f=fixture();const e=f.controls.emit('pointerdown',f.event(5,350,90,f.controls));assert.equal(e.prevented,true);assert.equal(f.input.held.size,0);assert.equal(f.input.pointers.size,0);
});

test('START and SELECT have distinct actions and release all gameplay fingers before opening their menus',()=>{
 const f=fixture();f.controls.emit('pointerdown',f.event(1,72,10));f.controls.emit('pointerdown',f.event(2,260,30,f.a));f.controls.emit('pointerdown',f.event(3,170,110,f.start));assert.equal(f.pauses(),1);assert.equal(f.selections(),0);assert.equal(f.input.held.size,0);assert.equal(f.input.pointers.size,0);assert.equal(f.controls.captures.size,0);
 f.controls.emit('pointerdown',f.event(4,235,110,f.select));assert.equal(f.selections(),1);assert.equal(f.pauses(),1);f.start.emit('click',{detail:1});assert.equal(f.pauses(),1);f.start.emit('click',{detail:0});assert.equal(f.pauses(),2);
});
test('Keyboard Start works while paused, Select uses M, and held keys do not repeatedly toggle menus',()=>{
 const f=fixture();f.input.enabled=false;f.win.emit('keydown',{code:'Enter',repeat:false});assert.equal(f.pauses(),1);f.win.emit('keydown',{code:'Enter',repeat:true});assert.equal(f.pauses(),1);f.win.emit('keydown',{code:'KeyM',repeat:false});assert.equal(f.selections(),1);f.win.emit('keydown',{code:'KeyM',repeat:false,target:{tagName:'INPUT'}});assert.equal(f.selections(),1);
 f.input.enabled=true;f.win.emit('keydown',{code:'ArrowRight',target:{tagName:'BUTTON'}});assert.ok(f.input.held.has('right'));
});
