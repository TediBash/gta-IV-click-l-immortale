import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {ADVENTURE_ZONES,adventureConfig} from '../dist/js/data/adventures.js';
import {CIVIL_PROFILES,civilArea,buildCivilLayout} from '../dist/js/world/CivilDistrict.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {guidePath} from '../dist/js/world/NavigationModel.js';
const rooms=Object.keys(CIVIL_PROFILES).map(area=>{const [id,zone]=area.split(':'),stage=ADVENTURE_ZONES[id][zone].stage;return {area,id,stage,config:adventureConfig(MISSIONS[id],zone,stage)};});
function scene(id){const views=[];const add=()=>{const view=new Proxy({alpha:1},{get:(t,k)=>k==='setAlpha'?v=>{t.alpha=v;return view;}:k==='alpha'?t.alpha:()=>view});views.push(view);return view;};return {mission:MISSIONS[id],views,add:{graphics:add,text:add}};}
test('Civic scenery covers every mission 4 and 7 room, with other missions and the hideout excluded',()=>{
 assert.equal(rooms.length,13);
 for(const id of [4,7])assert.deepEqual(rooms.filter(r=>+r.id===id).map(r=>r.config.zone),Object.keys(ADVENTURE_ZONES[id]));
 for(const {area,id,config}of rooms){assert.equal(civilArea(scene(id),config),area);assert.equal(civilArea({...scene(id),isHideout:true},config),null);}
 for(const id of [1,2,3,5,6,8,9,10])assert.equal(civilArea(scene(id),{zone:'archive'}),null);
});
test('Civic decorative layers retain save/quest geometry with bounded static draw calls',()=>{
 for(const {area,config}of rooms){const before=JSON.stringify(config),layout=buildCivilLayout(area,config);assert.equal(JSON.stringify(config),before);assert.ok(layout.commands.length<2400,area);assert.ok(new Set(layout.commands.map(c=>c.depth)).size<20,area);for(const c of layout.commands){for(const v of Object.values(c))if(typeof v==='number')assert.ok(Number.isFinite(v));if(['rect','ellipse'].includes(c.kind))assert.ok(c.w>0&&c.h>0,area);}for(const b of layout.occluders)assert.ok(config.obstacles.some(([x,y,w,h])=>x===b.x&&w===b.w&&y+h===b.y+b.h));}
});
test('All civic entrances, objectives and painted route centerlines remain accessible',()=>{
 for(const {area,id,stage,config:c}of rooms){const map=new GameMap(scene(id),c,stage),layout=map.district.layout;assert.equal(layout.area,area);for(const [x,y,w,h]of c.obstacles)assert.ok(map.blocked(x+w/2,y+h/2));
  for(const p of [...c.doors,...c.points])assert.ok(guidePath(map,{x:c.start[0],y:c.start[1]},p).length>1,`${area}: ${p.id||p.label}`);
  for(const path of layout.paths)for(let i=1;i<path.length;i++){const [x,y]=path[i-1],[tx,ty]=path[i],steps=Math.ceil(Math.hypot(tx-x,ty-y)/8);for(let n=0;n<=steps;n++){const px=x+(tx-x)*n/steps,py=y+(ty-y)*n/steps;assert.equal(map.blocked(px,py,18),false,`${area}: ${px},${py}`);assert.ok(layout.roads.some(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h),area);}}
 }
});
test('Villa facades fade independently and restore without affecting neighboring art',()=>{
 const room=rooms[0],s=scene(room.id),map=new GameMap(s,room.config,room.stage),b=map.district.layout.occluders[0];map.district.update({x:b.x+20,y:b.y+5});assert.ok(s.views.some(v=>v.alpha===.32));assert.ok(s.views.some(v=>v.alpha===1));map.district.update({x:150,y:650});assert.ok(s.views.every(v=>v.alpha===1));
});
