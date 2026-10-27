import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {ADVENTURE_ZONES,adventureConfig} from '../dist/js/data/adventures.js';
import {SEWER_PROFILES,sewerArea,buildSewerLayout,waterRipples} from '../dist/js/world/SewerDistrict.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {guidePath} from '../dist/js/world/NavigationModel.js';
const configFor=area=>adventureConfig(MISSIONS[5],area,ADVENTURE_ZONES[5][area].stage);
function scene(){const views=[];const add=()=>{const view=new Proxy({alpha:1},{get:(t,k)=>k==='setAlpha'?v=>{t.alpha=v;return view;}:k==='alpha'?t.alpha:()=>view});views.push(view);return view;};return {mission:MISSIONS[5],views,add:{graphics:add,text:add}};}
test('Bruce artwork covers seven rooms and preserves all existing story, collision and water data',()=>{
 assert.deepEqual(Object.keys(SEWER_PROFILES),Object.keys(ADVENTURE_ZONES[5]));
 for(const area of Object.keys(SEWER_PROFILES)){const c=configFor(area),before=JSON.stringify(c),layout=buildSewerLayout(area,c);assert.equal(sewerArea(scene(),c),area);assert.equal(sewerArea({...scene(),isHideout:true},c),null);assert.equal(JSON.stringify(c),before);assert.ok(layout.commands.length<2600,area);assert.ok(new Set(layout.commands.map(c=>c.depth)).size<20,area);for(const cmd of layout.commands){for(const v of Object.values(cmd))if(typeof v==='number')assert.ok(Number.isFinite(v),area);if(['rect','ellipse'].includes(cmd.kind))assert.ok(cmd.w>0&&cmd.h>0,area);}}
 for(const id of [1,2,3,4,6,7,8,9,10])assert.equal(sewerArea({mission:MISSIONS[id]},{zone:'kitchen'}),null);
});
test('Sewer route paint avoids solid walls, including the boss room lower obstacle',()=>{
 for(const area of Object.keys(SEWER_PROFILES)){const c=configFor(area),map=new GameMap(scene(),c,c.stage),layout=map.district.layout;assert.equal(layout.area,area);
  for(const path of layout.paths)for(let i=1;i<path.length;i++){const [x,y]=path[i-1],[tx,ty]=path[i],steps=Math.ceil(Math.hypot(tx-x,ty-y)/8);for(let n=0;n<=steps;n++){const px=x+(tx-x)*n/steps,py=y+(ty-y)*n/steps;assert.equal(map.blocked(px,py,18),false,`${area}: ${px},${py}`);assert.ok(layout.roads.some(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h),area);}}
  for(const p of [...c.doors,...c.points])assert.ok(guidePath(map,{x:c.start[0],y:c.start[1]},p).length>1,`${area}: ${p.id||p.label}`);
 }
});
test('Minimap channels mirror live water geometry without changing controller-owned water rendering',()=>{
 for(const area of Object.keys(SEWER_PROFILES)){const c=configFor(area),layout=buildSewerLayout(area,c);assert.deepEqual(layout.channels.map(({x,y,w,h})=>[x,y,w,h]),c.waterChannels||[]);if(!layout.channels.length)continue;
  // Art leaves the channel interior to UnderworldEffects, except the one narrow grate.
  const channel=layout.channels[0],cover=layout.commands.filter(p=>p.kind==='rect'&&p.depth>=3&&p.x<=channel.x&&p.x+p.w>=channel.x+channel.w&&p.y>=channel.y&&p.y+p.h<=channel.y+channel.h);assert.ok(cover.every(p=>p.h<=34));assert.ok(!layout.commands.some(p=>p.depth===3),'animated fill remains controller-owned');
 }
});
test('The raised pizza oven fades when it covers the player and restores afterward',()=>{
 const s=scene(),c=configFor('kitchen'),map=new GameMap(s,c,2),oven=map.district.layout.occluders[0];assert.equal(map.district.layout.occluders.length,1);map.district.update({x:oven.x+40,y:oven.y+5});assert.ok(s.views.some(v=>v.alpha===.32));map.district.update({x:160,y:650});assert.ok(s.views.every(v=>v.alpha===1));
});

test('Water ripple strokes stay inside the live fill at full, transitioning and drained levels',()=>{
 const c={x:570,y:130,w:130,h:570};
 for(const level of [0,.01,.13,.3,.55,.87,1])for(const phase of [0,5,20,100])for(const line of waterRipples(c,level,phase)){
  for(const [x,y]of [[line.x,line.y],[line.x2,line.y2]]){assert.ok(x>=c.x&&x<=c.x+c.w);assert.ok(y>=c.y+c.h*(1-level)&&y<=c.y+c.h);}
 }
 assert.deepEqual(waterRipples(c,0),[]);
});

test('Live ripples use simulation time, respect reduced motion and track water scale without a new save field',()=>{
 const s=scene();let strokes=0;s.add.graphics=()=>{let self;self=new Proxy({},{get:(t,k)=>k==='lineBetween'?()=>{strokes++;return self;}:()=>self});return self;};
 s.app={settings:{reduceMotion:false}};s.now=0;s.adventureController={effects:{water:[{scaleY:1}]}};
 const map=new GameMap(s,configFor('access'),0),p={x:160,y:650};let before=strokes;map.district.update(p);assert.ok(strokes>before);
 before=strokes;s.now=179;map.district.update(p);assert.equal(strokes,before);s.now=180;map.district.update(p);assert.ok(strokes>before);
 s.app.settings.reduceMotion=true;map.district.update(p);before=strokes;s.now=4000;map.district.update(p);assert.equal(strokes,before);
 s.adventureController.effects.water[0].scaleY=.13;map.district.update(p);assert.ok(strokes>before);
});
