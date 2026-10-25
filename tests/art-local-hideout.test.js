import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {artGeometry,artMarkup} from '../dist/js/ui/ManualArt.js';
import {SCENE_ART} from '../dist/js/data/scene-art.js';
import {STATIONS,HIDEOUT_CONFIG,HUB_ACTIONS} from '../dist/js/data/hideout.js';
import {CHARACTERS} from '../dist/js/data/characters.js';
import {GameMap} from '../dist/js/world/GameMap.js';
import {lineById} from '../dist/js/data/voices.js';
import {serveRequest} from '../scripts/serve.mjs';

test('Every curated scene has a bounded viewport, original asset, and contain rendering',()=>{
 let total=0;
 for(const scenes of Object.values(SCENE_ART))for(const art of scenes){
  const g=artGeometry(art);assert.ok(g.w>0&&g.h>0);assert.ok(existsSync(new URL('../dist/'+art.src,import.meta.url)));
  const html=artMarkup(art);assert.match(html,/preserveAspectRatio="xMidYMid meet"/);assert.match(html,/<clipPath/);assert.doesNotMatch(html,/translateY|scale\(/);total++;
 }
 assert.equal(total,62);
 assert.throws(()=>artGeometry({crop:[.9,0,.5,1]}));
 assert.notEqual(artMarkup(SCENE_ART[2][5]),artMarkup(SCENE_ART[2][5]),'clip IDs must not collide');
 assert.ok(SCENE_ART[2][5].crop[1]<.74,'victory crop includes Click and Spit heads');
 assert.ok(SCENE_ART[2][5].crop[1]+SCENE_ART[2][5].crop[3]<.91,'victory crop excludes bottom printed banner');
});

test('All eleven hideout stations and actions are reachable with valid dialogue voices',()=>{
 assert.deepEqual(new Set(STATIONS.map(s=>s.id)),new Set(CHARACTERS.map(c=>c.id)));
 const map=Object.create(GameMap.prototype);Object.assign(map,{width:1280,height:800,obstacles:HIDEOUT_CONFIG.obstacles.map(([x,y,w,h])=>({x,y,w,h}))});
 for(const t of [...STATIONS,...HUB_ACTIONS]){
  let p={x:580,y:660};assert.equal(map.blocked(t.x,t.y),false,t.id);
  for(let i=0;i<200&&Math.hypot(p.x-t.x,p.y-t.y)>70;i++){const n=map.nextStep(p.x,p.y,t.x,t.y);assert.notDeepEqual(p,n);p=n;}
  assert.ok(Math.hypot(p.x-t.x,p.y-t.y)<85,'reachable '+t.id);
  for(const line of t.lines||[])assert.equal(lineById(line.id)?.text,line.text);
 }
});

async function request(url,method='GET'){
 const r={code:null,headers:{},body:null,writeHead(code,headers={}){this.code=code;this.headers=headers;},end(body){this.body=body;}};
 await serveRequest({url,method},r);return r;
}
test('Portable server serves local assets with correct MIME and restricts files to dist',async()=>{
 let r=await request('/');assert.equal(r.code,200);assert.match(r.headers['Content-Type'],/text\/html/);assert.match(r.body.toString(),/home-hideout/);
 r=await request('/js/main.js');assert.equal(r.code,200);assert.match(r.headers['Content-Type'],/javascript/);
 r=await request('/assets/phaser.min.js','HEAD');assert.equal(r.code,200);assert.equal(r.body,undefined);
 for(const path of ['/../package.json','/%2e%2e%2fpackage.json','/.openai/hosting.json','/unknown'])assert.notEqual((await request(path)).code,200,path);
 assert.equal((await request('/%E0%A4%A')).code,400);assert.equal((await request('/','POST')).code,405);
});
