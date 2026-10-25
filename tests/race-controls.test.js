import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {InputState} from '../dist/js/core/InputState.js';
import {steeringAt,raceInput,driveRace} from '../dist/js/core/RaceDriving.js';
import {RaceTouchControls} from '../dist/js/ui/RaceTouchControls.js';
import {RaceController,TRACK} from '../dist/js/world/RaceController.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';
const road={offroad:false,boost:false,target:[1080,650],next:[1130,550]};
const car=()=>({x:190,y:650,angle:0,speed:0});
const tick=(c,input,settings={},n=1,r=road)=>{for(let i=0;i<n;i++)driveRace(c,.04,raceInput(input,settings),settings,r);};
test('Auto acceleration works without an up key; manual driving waits for its gas pedal',()=>{
 const input=new InputState(),auto=car(),manual=car();tick(auto,input,{},25);assert.ok(auto.x>240&&auto.speed>140);tick(manual,input,{raceAutoAccelerate:false},25);assert.equal(manual.speed,0);input.setSource('gas',['raceAccelerate']);tick(manual,input,{raceAutoAccelerate:false},25);assert.ok(manual.speed>140);
});
test('Brake wins against gas/auto/turbo and never becomes reverse, even when held at zero',()=>{
 const input=new InputState(),c={...car(),speed:250};input.setSource('gas',['up']);input.setSource('brake',['raceBrake']);tick(c,input,{},50,{...road,boost:true});assert.equal(c.speed,0);assert.equal(raceInput(input).accelerate,false);input.setSource('brake',[]);tick(c,input);assert.ok(c.speed>0);
 const reverse={...car(),speed:-50};input.setSource('brake',['down']);tick(reverse,input,{},50);assert.equal(Math.abs(reverse.speed),0);
});
test('Reverse requires its own input, brakes forward motion first and stays speed-limited',()=>{
 const input=new InputState(),c={...car(),speed:100};input.setSource('reverse',['reverse']);tick(c,input,{},9);assert.equal(c.speed,0);tick(c,input,{},30);assert.equal(c.speed,-70);input.clear();tick(c,input,{},30);assert.ok(c.speed>0);
});
test('Analog steering has a neutral zone, smooth changes and returns neutral immediately on release',()=>{
 const rect={left:20,width:160};assert.equal(steeringAt(100,rect),0);assert.equal(steeringAt(105,rect),0);assert.equal(steeringAt(20,rect),-1);assert.equal(steeringAt(180,rect),1);assert.equal(steeringAt(900,rect),1);assert.ok(steeringAt(125,rect)>0&&steeringAt(125,rect)<1);
 const input=new InputState(),c={...car(),speed:140};input.raceSteeringActive=true;input.raceSteering=.7;tick(c,input);assert.ok(c.steering>0&&c.steering<.7);const angle=c.angle;input.clear();tick(c,input);assert.equal(c.steering,0);assert.equal(c.angle,angle);
});
test('Assist eases tight approaches without selecting a direction or changing rival difficulty',()=>{
 const input=new InputState(),assisted={...car(),x:950,speed:260},free={...assisted};tick(assisted,input,{},15);tick(free,input,{raceAssist:false},15);assert.ok(assisted.speed<free.speed);assert.equal(assisted.angle,0);assert.equal(free.angle,0);
 input.setSource('key',['right']);const a={...car(),speed:160},b={...a};tick(a,input,{},1);tick(b,input,{raceAssist:false},1);assert.ok(a.angle>0&&a.angle<b.angle);
});
class El{
 constructor(name,rect={left:0,right:0,top:0,bottom:0,width:0,height:0}){this.name=name;this.rect=rect;this.children=[];this.dataset={};this.events={};this.classes=new Set();this.classList={toggle:(k,v)=>v?this.classes.add(k):this.classes.delete(k)};this.attrs={};this.captures=new Set();this.style={setProperty:(k,v)=>this.attrs[k]=v};}
 add(e){this.children.push(e);return e;}contains(e){return e===this||this.children.some(c=>c.contains(e));}
 querySelector(s){return this.querySelectorAll(s)[0];}
 querySelectorAll(s){return this.children.flatMap(c=>[(s==='.race-steering'&&c.name==='steer'||s==='[data-race-action]'&&c.dataset.raceAction||s==='[data-race-system]'&&c.dataset.raceSystem||s==='[data-race-status]'&&c.name==='status')?c:null,...c.querySelectorAll(s)].filter(Boolean));}
 addEventListener(k,f){(this.events[k]??=[]).push(f);}emit(k,p={}){const e={target:this,preventDefault(){this.prevented=true;},stopPropagation(){},...p};for(const f of this.events[k]||[])f(e);return e;}
 setAttribute(k,v){this.attrs[k]=v;}getBoundingClientRect(){return this.rect;}setPointerCapture(id){this.captures.add(id);}hasPointerCapture(id){return this.captures.has(id);}releasePointerCapture(id){this.captures.delete(id);this.emit('lostpointercapture',{pointerId:id});}
}
const box=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
function fixture(){
 const root=new El('root'),steer=root.add(new El('steer',box(0,60,160,140))),status=root.add(new El('status'));
 const pedal=(id,r)=>{const b=root.add(new El(id,r));b.dataset.raceAction=id;return b;};
 const brake=pedal('raceBrake',box(180,100,76,110)),turbo=pedal('special',box(264,100,76,110)),gas=pedal('raceAccelerate',box(180,46,160,48)),reverse=pedal('reverse',box(100,0,60,44));
 const start=root.add(new El('start'));start.dataset.raceSystem='pause';const select=root.add(new El('select'));select.dataset.raceSystem='journal';
 const win=new El('window'),body=new El('body'),input=new InputState();let system='';input.enabled=true;input.systemAction=k=>{input.clear();system=k;};
 const app={input,settings:{raceAutoAccelerate:true,raceAssist:true}},doc={body,querySelector:()=>root},controls=new RaceTouchControls(app,doc,win);controls.setActive(true);
 const event=(pointerId,clientX,clientY,target=steer)=>({pointerId,clientX,clientY,target,pointerType:'touch',button:0});
 return {root,steer,status,brake,turbo,gas,reverse,start,select,win,body,input,app,controls,event,system:()=>system};
}
test('Two race thumbs steer continuously and independently activate enlarged brake/turbo faces',()=>{
 const f=fixture();f.root.emit('pointerdown',f.event(1,20,110));f.root.emit('pointerdown',f.event(2,267,102,f.turbo));assert.ok(f.input.raceSteering<0);assert.equal(f.input.consume('special'),true);assert.equal(f.root.captures.size,2);
 f.root.emit('pointermove',f.event(1,150,110));assert.ok(f.input.raceSteering>0);f.root.emit('pointermove',f.event(2,182,102,f.turbo));assert.equal(f.input.held.has('special'),false);assert.equal(f.input.held.has('raceBrake'),true);assert.equal(f.brake.attrs['aria-pressed'],'true');
 f.root.emit('pointerup',f.event(1,150,110));assert.equal(f.input.raceSteering,0);assert.equal(f.input.held.has('raceBrake'),true);f.root.emit('pointerup',f.event(2,182,102,f.brake));assert.equal(f.input.held.size,0);
});
test('Only one thumb owns steering; moving away releases pedals and neutralizes the wheel',()=>{
 const f=fixture();f.root.emit('pointerdown',f.event(1,20,110));f.root.emit('pointerdown',f.event(2,150,110));assert.equal(f.controls.pointers.size,1);assert.ok(f.input.raceSteering<0);f.root.emit('pointermove',f.event(1,150,350));assert.equal(f.input.raceSteering,0);
 f.root.emit('pointerdown',f.event(3,190,150,f.brake));f.root.emit('pointermove',f.event(3,500,150,f.brake));assert.equal(f.input.held.size,0);
});
test('Pause, orientation, lost capture and return home release race state without stuck pedals',()=>{
 const f=fixture();const hold=()=>{f.root.emit('pointerdown',f.event(1,150,110));f.root.emit('pointerdown',f.event(2,190,150,f.brake));};
 hold();f.start.emit('pointerdown');assert.equal(f.system(),'pause');assert.equal(f.input.held.size,0);assert.equal(f.root.captures.size,0);assert.equal(f.input.raceSteeringActive,false);
 hold();f.win.emit('orientationchange');assert.equal(f.input.held.size,0);assert.equal(f.controls.pointers.size,0);
 hold();f.root.emit('lostpointercapture',{pointerId:1});assert.equal(f.input.raceSteering,0);assert.equal(f.input.held.has('raceBrake'),true);
 f.controls.setActive(false);assert.equal(f.root.hidden,true);assert.equal(f.body.classes.has('is-racing'),false);assert.equal(f.input.held.size,0);f.root.emit('pointerdown',f.event(4,150,110));assert.equal(f.controls.pointers.size,0);
});
test('Manual gas toggles persist and the hidden pedal cannot intercept touches in auto mode',()=>{
 const f=fixture();assert.equal(f.controls.pedalAt(200,70),undefined);f.app.settings.raceAutoAccelerate=false;f.controls.syncSettings();assert.equal(f.root.classes.has('manual-acceleration'),true);f.root.emit('pointerdown',f.event(3,200,70,f.gas));assert.equal(f.input.held.has('raceAccelerate'),true);f.app.settings.raceAutoAccelerate=true;f.controls.syncSettings();assert.equal(f.input.held.size,0);assert.equal(f.controls.pedalAt(200,70),undefined);
 const data=new Map();globalThis.localStorage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};globalThis.matchMedia=()=>({matches:false});const save=new SaveManager();assert.equal(save.settings().raceAutoAccelerate,true);assert.equal(save.settings().raceAssist,true);save.saveSettings({raceAutoAccelerate:false,raceAssist:false,voicesEnabled:false});assert.equal(save.settings().raceAutoAccelerate,false);assert.equal(save.settings().raceAssist,false);assert.equal(save.settings().voicesEnabled,false);
});
test('Race keyboard accessibility and blank taps preserve neutral state and suppress selection/zoom',()=>{
 const f=fixture();f.steer.emit('keydown',{code:'ArrowRight'});assert.equal(f.steer.attrs['aria-valuenow'],'20');f.steer.emit('keyup',{code:'ArrowRight'});assert.equal(f.steer.attrs['aria-valuenow'],'0');
 f.brake.emit('keydown',{code:'Space'});assert.ok(f.input.held.has('raceBrake'));f.brake.emit('keyup',{code:'Space'});assert.equal(f.input.held.has('raceBrake'),false);
 f.select.emit('click',{detail:0});assert.equal(f.system(),'journal');f.input.enabled=false;f.root.emit('pointerdown',f.event(1,150,110));assert.equal(f.controls.pointers.size,0);
 for(const k of ['contextmenu','selectstart','dragstart','dblclick'])assert.equal(f.root.emit(k).prevented,true);
});
function view(){let v;v=new Proxy({},{get:()=>()=>v});return v;}
function raceFixture(){
 const input=new InputState(),events=[];const s={app:{input,settings:{raceAutoAccelerate:true,raceAssist:true},progress:{difficulty:'easy',cash:0}},add:{graphics:view,text:view,container:view,image:view},audio:{effect(){}},party:[{sprite:view(),shadow:view(),ring:view(),label:view(),hpBack:view(),hpFill:view()}],gate:{view:view(),marker:view()},mission:{record:k=>events.push(k)},finishChapter(){events.push('finish');},failChapter(){events.push('fail');}};return {s,input,events,race:new RaceController(s)};
}
test('Real race waits for countdown, consumes premature turbo and supports brake over active boost',()=>{
 const {race,input}=raceFixture();input.setSource('boost',['special']);race.update(.04);assert.equal(race.x,190);assert.equal(race.turbo,100);assert.equal(input.consume('special'),false);
 for(let i=0;i<76;i++)race.update(.04);assert.ok(race.x>190);input.setSource('boost',[]);input.setSource('boost',['special']);race.update(.04);assert.ok(race.turbo<70);input.setSource('brake',['raceBrake']);for(let i=0;i<20;i++)race.update(.04);assert.equal(race.speed,0);assert.equal(race.boostUntil,0);
});
test('Win/loss still require race progress and clear all touch state on completion',()=>{
 for(const win of [true,false]){const {race,input,events}=raceFixture();race.countdown=0;(win?race.progress:race.rivalProgress).laps=2;input.setSource('test',['raceBrake']);input.raceSteering=1;input.raceSteeringActive=true;race.update(.04);assert.ok(events.includes(win?'finish':'fail'));assert.equal(race.done,true);assert.equal(input.held.size,0);assert.equal(input.raceSteering,0);}
});
test('Markup exposes dedicated race controls and both responsive layouts keep controls outside the frame',()=>{
 const h=readFileSync('dist/index.html','utf8'),css=readFileSync('dist/race.css','utf8');assert.match(h,/class="race-controls" hidden/);for(const id of ['raceBrake','special','reverse','raceAccelerate'])assert.ok(h.includes('data-race-action="'+id+'"'));assert.match(css,/grid-area:2\/2/);assert.match(css,/\.race-steer-zone\{grid-area:2\/1/);assert.match(css,/\.race-pedals\{grid-area:2\/3/);assert.match(css,/body\.is-racing \.touch-controls\{display:none!important/);
});
test('The assisted race can complete two ordered laps using only analog steering and automatic gas',()=>{
 const {race,input,events}=raceFixture();input.raceSteeringActive=true;
 for(let i=0;i<3000&&!race.done;i++){
  const target=TRACK[race.progress.next],heading=Math.atan2(target[1]-race.y,target[0]-race.x),error=Math.atan2(Math.sin(heading-race.angle),Math.cos(heading-race.angle));
  input.raceSteering=Math.max(-1,Math.min(1,error*1.8));race.update(.04);
 }
 assert.ok(events.includes('finish'));assert.equal(race.progress.laps,2);assert.equal(input.held.has('up'),false);
});
