import test from 'node:test';
import assert from 'node:assert/strict';
import {STATIONS,HUB_ACTIONS,HIDEOUT_CONFIG} from '../dist/js/data/hideout.js';
import {MISSIONS} from '../dist/js/data/campaign.js';
import {buildHideoutLayout} from '../dist/js/world/HideoutDistrict.js';
import {buildCircuitLayout} from '../dist/js/world/CircuitDistrict.js';
import {TRACK,TRACK_HALF_WIDTH,trackDistance} from '../dist/js/data/raceTrack.js';
import {TRACK as LEGACY_TRACK,trackDistance as legacyDistance,RaceProgress} from '../dist/js/world/RaceController.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {guidePath} from '../dist/js/world/NavigationModel.js';
function scene(id,hideout=false){const add=()=>{let view;view=new Proxy({},{get:()=>()=>view});return view;};return {mission:MISSIONS[id],isHideout:hideout,add:{graphics:add,text:add}};}
test('Hideout art preserves every station and action, keeps paths reachable and does not mutate config',()=>{
 const before=JSON.stringify(HIDEOUT_CONFIG),layout=buildHideoutLayout(HIDEOUT_CONFIG),map=new GameMap(scene(8,true),HIDEOUT_CONFIG,1);
 assert.equal(layout.stations.length,11);assert.deepEqual(layout.stations.map(s=>s.id),STATIONS.map(s=>s.id));assert.equal(map.district.layout.area,'hideout');assert.equal(JSON.stringify(HIDEOUT_CONFIG),before);
 for(const t of [...STATIONS,...HUB_ACTIONS])assert.ok(guidePath(map,{x:580,y:660},t).length>1,t.id);
});
test('Circuit drawing and legacy driving exports share exact checkpoint geometry and width',()=>{
 const layout=buildCircuitLayout();assert.deepEqual(layout.track,TRACK);assert.equal(LEGACY_TRACK,TRACK);assert.equal(legacyDistance,trackDistance);assert.equal(layout.halfWidth,TRACK_HALF_WIDTH);assert.equal(TRACK_HALF_WIDTH,66);
 assert.equal(trackDistance(600,650+66),66);assert.ok(trackDistance(600,650+67)>TRACK_HALF_WIDTH);
 const progress=new RaceProgress();for(let lap=0;lap<2;lap++)for(let i=1;i<=TRACK.length;i++)progress.visit(...TRACK[i%TRACK.length]);assert.equal(progress.finished,true);assert.equal(progress.laps,2);
 const config=MISSIONS[2].chapters.find(c=>c.mode==='race'),map=new GameMap(scene(2),config,2);assert.equal(map.district.layout.area,'circuit');
});
test('All circuit infield buildings and stands stay beyond the driveable track and below cars',()=>{
 const layout=buildCircuitLayout();for(const b of layout.scenery)for(let x=b.x;x<=b.x+b.w;x+=5)for(let y=b.y;y<=b.y+b.h;y+=5)assert.ok(trackDistance(x,y)>TRACK_HALF_WIDTH,`${b.id}: ${x},${y}`);
 for(const c of layout.commands.filter(c=>c.role==='curb'))for(let i=0;i<=10;i++){const t=i/10;assert.ok(trackDistance(c.x+(c.x2-c.x)*t,c.y+(c.y2-c.y)*t)>=TRACK_HALF_WIDTH+c.width/2,'curbs must not intrude into the driving lane');}
 assert.ok(layout.commands.every(c=>c.depth<=2));assert.deepEqual(layout.occluders,[]);
 for(let i=0;i<TRACK.length;i++){const [x,y]=TRACK[i],[tx,ty]=TRACK[(i+1)%TRACK.length];for(let j=0;j<=20;j++){const px=x+(tx-x)*j/20,py=y+(ty-y)*j/20;assert.ok(layout.roads.some(r=>px>=r.x&&px<=r.x+r.w&&py>=r.y&&py<=r.y+r.h));}}
});
test('Hub and circuit draw data is finite, deterministic and bounded for mobile rendering',()=>{
 for(const build of [()=>buildHideoutLayout(HIDEOUT_CONFIG),buildCircuitLayout]){const a=build();assert.deepEqual(a,build());assert.ok(a.commands.length<2300);assert.ok(new Set(a.commands.map(c=>c.depth)).size<20);for(const c of a.commands){for(const v of Object.values(c))if(typeof v==='number')assert.ok(Number.isFinite(v));if(['rect','ellipse'].includes(c.kind))assert.ok(c.w>0&&c.h>0);}}
});
