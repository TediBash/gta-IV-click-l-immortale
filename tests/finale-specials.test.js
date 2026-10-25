import test from 'node:test';
import assert from 'node:assert/strict';
import {DroneStrikeAbility} from '../dist/js/combat/SpecialAbility.js';
import {ROME_ZONES} from '../dist/js/data/romeFinale.js';
import {zoneArrivals} from '../dist/js/core/AdventureSession.js';
import {GameMap} from '../dist/js/world/GameMap.js';
function view(){let v;v=new Proxy({},{get:()=>()=>v});return v;}
test('Ted flies above the target, dives, then explodes; distant and obstructed targets avoid damage',()=>{
 const tweens=[],hits=[0,0,0];const a={id:'ted',x:100,y:100,special:100,stunUntil:0,data:{name:'Ted',special:'Drone'},stats:{specialLevel:1}};
 const s={now:0,app:{settings:{}},fx:{special(){},burst(){},word(){}},bus:{emit(){}},audio:{say(){},effect(){}},toast(){},party:[a],map:{clearLine:(x,y,tx)=>tx!==320},enemies:[{x:300,y:100,hit(){hits[0]++;}},{x:320,y:100,hit(){hits[1]++;}},{x:900,y:600,hit(){hits[2]++;}}],add:{container:view,graphics:view,circle:view},tweens:{add:t=>tweens.push(t)}};
 const ability=new DroneStrikeAbility(s);assert.equal(ability.activate(a),true);assert.equal(a.special,0);assert.deepEqual(hits,[0,0,0]);
 tweens.shift().onComplete();assert.deepEqual(hits,[0,0,0]);const dive=tweens.shift();assert.equal(dive.y,100);dive.onComplete();assert.deepEqual(hits,[1,0,0]);
 a.special=100;s.enemies=[];ability.activate(a);assert.equal(a.special,100);
});
test('Every final door safely accommodates all eleven friends, even near right and bottom edges',()=>{
 for(const zones of Object.values(ROME_ZONES))for(const z of Object.values(zones))for(const d of z.doors){
  const destination=zones[d.to],map=Object.assign(Object.create(GameMap.prototype),{width:1280,height:800,obstacles:destination.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});
  const arrivals=zoneArrivals(destination,d.spawn,11);assert.equal(new Set(arrivals.map(p=>p.join(','))).size,11);for(const p of arrivals)assert.equal(map.blocked(...p,18),false);
 }
});
