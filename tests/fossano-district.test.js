import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {workshopConfig,DOORS} from '../dist/js/data/zones.js';
import {buildFossanoLayout,drawFossanoDistrict,fossanoArea} from '../dist/js/world/FossanoDistrict.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {vehicleFits} from '../dist/js/core/ZoneSession.js';
import {guidePath} from '../dist/js/world/NavigationModel.js';

test('Fossano art is limited to the forecourt and connected workshop chapter, never the race or hideout',()=>{
 for(const m of Object.values(MISSIONS))for(let i=0;i<m.chapters.length;i++){
  const scene={mission:{id:m.id}};
  const result=fossanoArea(scene,m.chapters[i],i);
  assert.equal(result,m.id===2&&i===0?'forecourt':null);
 }
 for(const id of ['street','workshop','depot'])assert.equal(fossanoArea({mission:{id:2}},workshopConfig(MISSIONS[2].chapters[1],id),1),id);
 assert.equal(fossanoArea({isHideout:true,mission:{id:2}},{zone:'workshop'},1),null);
});

test('District decorations do not mutate mission obstacles, IDs, pickups or saved locations',()=>{
 for(const area of ['forecourt','street','workshop','depot']){
  const config=area==='forecourt'?MISSIONS[2].chapters[0]:workshopConfig(MISSIONS[2].chapters[1],area);
  const before=JSON.stringify(config),layout=buildFossanoLayout(area,config);
  assert.equal(JSON.stringify(config),before);
  assert.ok(layout.commands.length<2400,'bounded native draw budget');
  assert.ok(new Set(layout.commands.filter(c=>c.kind!=='text').map(c=>c.depth)).size<40,'batch static geometry');
  for(const c of layout.commands){for(const value of Object.values(c))if(typeof value==='number')assert.ok(Number.isFinite(value));assert.ok(['rect','ellipse','poly','text','line'].includes(c.kind));}
 }
});

test('The district road and its circuit branch contain the original car arrivals and exit',()=>{
 const config=workshopConfig(MISSIONS[2].chapters[1],'street'),layout=buildFossanoLayout('street',config);
 const map=Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:config.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});
 for(const point of [...DOORS.workshop.map(d=>d.spawn),...DOORS.depot.map(d=>d.spawn),config.gate]){
  const [x,y]=point;assert.ok(layout.roads.some(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h));assert.ok(vehicleFits(map,x,y));
 }
 for(const d of DOORS.street){assert.ok(guidePath(map,{x:540,y:650},d).length>1);assert.equal(d.presentation,'garage');}
});

test('A saved player behind one facade remains visible without fading the other facade',()=>{
 const graphics=[],drawable=()=>{const target={alpha:1,depth:0};let view;view=new Proxy(target,{get(t,k){if(k in t)return t[k];return (...args)=>{if(k==='setDepth')t.depth=args[0];if(k==='setAlpha')t.alpha=args[0];return view;};}});return view;};
 const s={add:{graphics(){const g=drawable();graphics.push(g);return g;},text:drawable}};
 const district=drawFossanoDistrict(s,workshopConfig(MISSIONS[2].chapters[1],'street'),'street');
 const [left,right]=district.layout.occluders;
 district.update({x:left.x+25,y:left.y+25});
 assert.equal(graphics.find(g=>g.depth===left.depth).alpha,.32);
 assert.equal(graphics.find(g=>g.depth===right.depth).alpha,1);
 district.update({x:540,y:650});
 assert.equal(graphics.find(g=>g.depth===left.depth).alpha,1);
});
