import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {FACILITY_ZONES,facilityConfig} from '../dist/js/data/facility.js';
import {ADVENTURE_ZONES,adventureConfig} from '../dist/js/data/adventures.js';
import {INDUSTRIAL_PROFILES,industrialArea,buildIndustrialLayout,drawIndustrialDistrict} from '../dist/js/world/IndustrialDistrict.js';
import {GameMap} from '../dist/js/world/GameMap.js';
const rooms=Object.keys(INDUSTRIAL_PROFILES).map(area=>{const [id,zone]=area.split(':'),mission=MISSIONS[id],stage=(id==='3'?FACILITY_ZONES:ADVENTURE_ZONES[id])[zone].stage;return {area,mission,stage,config:id==='3'?facilityConfig(mission.chapters[stage],zone,stage):adventureConfig(mission,zone,stage)};});
function fakeScene(mission){const views=[];const add=()=>{const view=new Proxy({alpha:1},{get:(t,k)=>k==='setAlpha'?a=>{t.alpha=a;return view;}:k==='alpha'?t.alpha:(...args)=>view});views.push(view);return view;};return {mission,views,add:{graphics:add,text:add}};}
test('Industrial scope covers all 19 existing zones in missions 3, 6 and 8, excluding hideout and other missions',()=>{
 assert.equal(rooms.length,19);
 for(const {area,mission,config}of rooms){assert.equal(industrialArea({mission},config),area);assert.equal(industrialArea({mission,isHideout:true},config),null);}
 for(const id of [1,2,4,5,7,9,10])assert.equal(industrialArea({mission:MISSIONS[id]},{zone:'workshop'}),null);
 assert.equal(industrialArea({mission:MISSIONS[3]},{zone:'unrecognized'}),null);
});
test('Industrial artwork preserves geometry, objective IDs and save data with a bounded native draw budget',()=>{
 for(const {area,config}of rooms){const before=JSON.stringify(config),layout=buildIndustrialLayout(area,config);assert.equal(JSON.stringify(config),before);assert.ok(layout.commands.length<2600,area);assert.ok(new Set(layout.commands.map(c=>c.depth)).size<20,area);for(const c of layout.commands){for(const n of Object.values(c))if(typeof n==='number')assert.ok(Number.isFinite(n),area);if(c.kind==='rect'||c.kind==='ellipse')assert.ok(c.w>0&&c.h>0,area);}for(const b of layout.occluders)assert.ok(config.obstacles.some(([x,y,w,h])=>b.x===x&&b.w===w&&b.y+b.h===y+h),area);}
});
test('Every industrial room mounts through GameMap and preserves collision and navigation',()=>{
 for(const {area,mission,stage,config}of rooms){const map=new GameMap(fakeScene(mission),config,stage);assert.equal(map.district.layout.area,area);for(const [x,y,w,h]of config.obstacles)assert.ok(map.blocked(x+w/2,y+h/2));const [x,y]=config.start;assert.ok(!map.blocked(x,y),area);for(const d of config.doors||[]){assert.ok(!map.blocked(d.x,d.y),area);assert.ok(map.nextStep(x,y,d.x,d.y));}map.district.update({x,y});}
});
test('Industrial facades fade for a player behind them and restore when the player leaves',()=>{
 const {area,mission,config}=rooms.find(r=>r.area==='3:courtyard'),scene=fakeScene(mission),district=drawIndustrialDistrict(scene,config,area),b=district.layout.occluders[0];district.update({x:b.x+10,y:b.y+10});assert.ok(scene.views.some(v=>v.alpha===.32));district.update({x:40,y:750});assert.ok(scene.views.every(v=>v.alpha===1));
});
