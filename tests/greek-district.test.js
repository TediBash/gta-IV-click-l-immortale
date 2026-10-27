import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {ADVENTURE_ZONES,adventureConfig} from '../dist/js/data/adventures.js';
import {GREEK_PATHS,greekArea,buildGreekLayout,drawGreekDistrict} from '../dist/js/world/GreekDistrict.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {guidePath} from '../dist/js/world/NavigationModel.js';
const configFor=area=>adventureConfig(MISSIONS[1],area,ADVENTURE_ZONES[1][area].stage);
function scene(){const views=[];const add=()=>{const view=new Proxy({alpha:1},{get:(t,k)=>k==='setAlpha'?v=>{t.alpha=v;return view;}:k==='alpha'?t.alpha:()=>view});views.push(view);return view;};return {mission:MISSIONS[1],views,add:{graphics:add,text:add}};}
test('Greek environments cover exactly the seven original rooms and preserve saved mission data',()=>{
 assert.deepEqual(Object.keys(GREEK_PATHS),Object.keys(ADVENTURE_ZONES[1]));
 for(const area of Object.keys(GREEK_PATHS)){
  const c=configFor(area),before=JSON.stringify(c);assert.equal(greekArea(scene(),c),area);assert.equal(greekArea({...scene(),isHideout:true},c),null);
  const layout=buildGreekLayout(area,c);assert.equal(JSON.stringify(c),before);assert.ok(layout.commands.length<2100,area);assert.ok(new Set(layout.commands.map(c=>c.depth)).size<20,area);
  for(const cmd of layout.commands){for(const v of Object.values(cmd))if(typeof v==='number')assert.ok(Number.isFinite(v));if(['rect','ellipse'].includes(cmd.kind))assert.ok(cmd.w>0&&cmd.h>0,area);}
 }
 for(const id of [2,3,4,5,6,7,8,9,10])assert.equal(greekArea({mission:MISSIONS[id]},{zone:'home'}),null);
});
test('Painted Greek path centerlines remain walkable and match the minimap route',()=>{
 for(const area of Object.keys(GREEK_PATHS)){
  const c=configFor(area),map=new GameMap(scene(),c,c.stage),layout=map.district.layout;assert.equal(layout.area,area);
  for(const path of layout.paths)for(let i=1;i<path.length;i++){
   const [x,y]=path[i-1],[tx,ty]=path[i],steps=Math.ceil(Math.hypot(tx-x,ty-y)/8);
   for(let n=0;n<=steps;n++){const px=x+(tx-x)*n/steps,py=y+(ty-y)*n/steps;assert.equal(map.blocked(px,py,18),false,`${area}: ${px}, ${py}`);assert.ok(layout.roads.some(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h),area);}
  }
  for(const target of [...c.doors,...c.points]){assert.ok(guidePath(map,{x:c.start[0],y:c.start[1]},target).length>1,`${area}: ${target.id||target.label}`);}
 }
});
test('Greek roof art fades independently and never changes the solid footprint',()=>{
 const s=scene(),c=configFor('village'),map=new GameMap(s,c,0),roof=map.district.layout.occluders[0];map.district.update({x:roof.x+30,y:roof.y+5});assert.ok(s.views.some(v=>v.alpha===.32));assert.ok(s.views.some(v=>v.alpha===1));map.district.update({x:150,y:650});assert.ok(s.views.every(v=>v.alpha===1));for(const [x,y,w,h]of c.obstacles)assert.ok(map.blocked(x+w/2,y+h/2));
});
