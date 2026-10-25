import test from 'node:test';
import assert from 'node:assert/strict';
import {AudioToggles} from '../dist/js/ui/AudioToggles.js';
import {GameTouchGuard} from '../dist/js/core/GameTouchGuard.js';
import {SaveManager} from '../dist/js/core/SaveManager.js';
function fixture(){
 const buttons=['voices','music','voices','music'].map(channel=>({dataset:{audioChannel:channel},attributes:{},state:{},setAttribute(k,v){this.attributes[k]=v;},querySelector(){return this.state;}}));
 const app={settings:{muted:false,voicesEnabled:true,musicEnabled:true,effectsEnabled:true},audio:{unlock(){},stop(){app.stopped++;}},stopped:0,save:{saveSettings(s){app.saved={...s};}},updateSound(){app.ticks=(app.ticks||0)+1;app.toggles.render();}};
 app.toggles=new AudioToggles(app,{querySelectorAll:()=>buttons});return {app,buttons};
}
test('Home and fullscreen switches are independent, synchronized and persist both settings',()=>{
 const {app,buttons}=fixture();buttons[0].onclick();assert.equal(app.settings.voicesEnabled,false);assert.equal(app.settings.musicEnabled,true);assert.equal(app.settings.effectsEnabled,true);assert.equal(app.stopped,1);
 assert.equal(buttons[2].state.textContent,'OFF');assert.equal(buttons[1].state.textContent,'ON');assert.equal(buttons[2].attributes['aria-pressed'],'false');
 buttons[3].onclick();assert.equal(app.saved.musicEnabled,false);assert.equal(app.saved.voicesEnabled,false);assert.equal(app.stopped,1);
 buttons[2].onclick();assert.equal(app.saved.voicesEnabled,true);assert.equal(app.saved.musicEnabled,false);assert.equal(buttons[0].state.textContent,'ON');
 const store=new Map();globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};globalThis.matchMedia=()=>({matches:false});const save=new SaveManager();save.saveSettings(app.saved);const reloaded=save.settings();assert.equal(reloaded.voicesEnabled,true);assert.equal(reloaded.musicEnabled,false);
});
test('Turning on one channel after global mute never unmutes the other channels',()=>{
 for(const channel of ['voices','music']){const {app,buttons}=fixture();app.settings.muted=true;app.toggles.render();assert.ok(buttons.every(b=>b.state.textContent==='OFF'));app.toggles.toggle(channel);assert.equal(app.settings.muted,false);assert.equal(app.settings[channel+'Enabled'],true);assert.equal(app.settings[(channel==='voices'?'music':'voices')+'Enabled'],false);assert.equal(app.settings.effectsEnabled,false);}
});
test('Existing settings changes refresh both quick controls without changing their channel states',()=>{
 const {app,buttons}=fixture();app.settings.voicesEnabled=false;app.updateSound();assert.equal(buttons[0].state.textContent,'OFF');assert.equal(buttons[2].state.textContent,'OFF');assert.equal(buttons[1].state.textContent,'ON');app.settings.muted=true;app.updateSound();assert.ok(buttons.every(b=>b.state.textContent==='OFF'));
});
function touchFixture(){
 let playing=true;const events={};const root={addEventListener(k,fn,options){events[k]={fn,options};}};new GameTouchGuard(()=>playing,root);
 const emit=(type,{interactive=false,...props}={})=>{const e={target:{closest:()=>interactive},touches:[],changedTouches:[{}],preventDefault(){this.prevented=true;},...props};events[type].fn(e);return e;};return {emit,events,home(){playing=false;}};
}
test('Repeated missed A/B taps on empty game areas suppress zoom without swallowing buttons or home gestures',()=>{
 const f=touchFixture();assert.equal(f.events.touchend.options.passive,false);
 for(let i=0;i<5;i++)assert.equal(f.emit('touchend').prevented,true);
 assert.equal(f.emit('dblclick').prevented,true);assert.equal(f.emit('touchend',{interactive:true}).prevented,undefined);assert.equal(f.emit('dblclick',{interactive:true}).prevented,undefined);
 f.home();assert.equal(f.emit('touchend').prevented,undefined);assert.equal(f.emit('dblclick').prevented,undefined);
});
test('Pinches and simultaneous gameplay fingers are not cancelled by the blank-area guard',()=>{
 const f=touchFixture();f.emit('touchstart',{touches:[{},{}]});assert.equal(f.emit('touchend',{touches:[{}]}).prevented,undefined);assert.equal(f.emit('touchend').prevented,undefined);
 assert.equal(f.emit('touchend').prevented,true);f.emit('touchstart',{touches:[{},{}]});f.emit('touchcancel');assert.equal(f.emit('touchend').prevented,true);
});
