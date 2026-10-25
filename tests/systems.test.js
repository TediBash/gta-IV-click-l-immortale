import test from 'node:test';
import assert from 'node:assert/strict';
import {MissionManager} from '../dist/js/core/MissionManager.js';
import {EventBus} from '../dist/js/core/EventBus.js';
import {EquipmentLoadout} from '../dist/js/characters/EquipmentLoadout.js';
import {ComboSystem} from '../dist/js/combat/ComboSystem.js';
import {isInAttackArc} from '../dist/js/combat/PunchAttack.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {VOICE_LINES} from '../dist/js/data/voices.js';

test('Mission doors require every chapter-specific objective',()=>{const m=new MissionManager(new EventBus());m.begin(0);assert.equal(m.canExit(),false);for(let i=0;i<m.target('guards');i++)m.record('guards');assert.equal(m.canExit(),false);m.record('terminal');assert.equal(m.canExit(),true);m.begin(1);for(let i=0;i<3;i++)m.record('cash');assert.equal(m.canExit(),false);m.record('prototype');assert.equal(m.canExit(),true);m.begin(2);for(let i=0;i<m.target('guards')-1;i++)m.record('guards');assert.equal(m.canExit(),false);m.record('guards');assert.equal(m.canExit(),true);});
test('Equipment recalculates from base without stacking and removes exactly',()=>{const e=new EquipmentLoadout({strength:25,defense:6,speed:165});e.equip('gloves');assert.equal(e.stats().strength,30);assert.equal(e.stats().strength,30);e.equip('gloves');assert.equal(e.stats().strength,25);e.equip('controller');assert.equal(e.stats().specialLevel,2);});
test('Combo belongs to its character, expires, and is consumed once',()=>{const c=new ComboSystem();c.push('click',0);c.push('click',300);assert.equal(c.consume('ted',400),false);assert.equal(c.consume('click',400),true);assert.equal(c.consume('click',401),false);c.push('click',500);c.push('click',800);assert.equal(c.consume('click',2500),false);});
test('Punch hitbox respects facing and range',()=>{const p={x:100,y:100,direction:'right'};assert.equal(isInAttackArc(p,{x:160,y:100}),true);assert.equal(isInAttackArc(p,{x:40,y:100}),false);assert.equal(isInAttackArc(p,{x:200,y:100}),false);});
test('Companion pathfinding routes around a wall',()=>{const m=Object.create(GameMap.prototype);m.width=400;m.height=400;m.obstacles=[{x:160,y:80,w:40,h:180}];let x=100,y=180;for(let i=0;i<20&&Math.hypot(x-280,y-180)>45;i++){const p=m.nextStep(x,y,280,180);assert.equal(m.blocked(p.x,p.y,18),false);x=p.x;y=p.y;}assert.ok(Math.hypot(x-280,y-180)<45);});
test('Every voice line has a unique stable ID and all eleven characters',()=>{assert.equal(new Set(VOICE_LINES.map(l=>l.id)).size,VOICE_LINES.length);assert.equal(new Set(VOICE_LINES.map(l=>l.character)).size,11);assert.ok(VOICE_LINES.every(l=>l.text.length>3));});
