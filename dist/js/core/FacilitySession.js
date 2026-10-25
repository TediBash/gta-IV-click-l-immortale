import {FACILITY_ZONES,FACILITY_START} from '../data/facility.js';
import {copy} from './ZoneSession.js';

export class FacilitySession{
 constructor(saved,chapter){
  const valid=saved?.version===1&&FACILITY_ZONES[saved.current]&&saved.zones&&saved.states&&Array.isArray(saved.party);
  this.data=valid?copy(saved):{version:1,chapter,current:FACILITY_START[chapter],states:{},zones:{},party:[],activeId:'click',flags:{terminal:chapter>0,prototype:chapter>1,loaded:false}};
  if(!valid&&chapter>0)for(const [id,z]of Object.entries(FACILITY_ZONES))if(z.stage<chapter)this.data.zones[id]={enemies:z.guards.map(([x,y])=>({x,y,hp:0,ko:true,energy:0})),crates:z.crates.map(()=>({destroyed:true,hp:0}))};
  if(this.data.chapter!==chapter){this.data.chapter=chapter;this.enter(FACILITY_START[chapter],FACILITY_ZONES[FACILITY_START[chapter]].start);}
  if(FACILITY_ZONES[this.data.current].stage>chapter)this.enter(FACILITY_START[chapter],FACILITY_ZONES[FACILITY_START[chapter]].start);
  // Old chapter checkpoints imply the prior chapter's required actions were completed.
  this.data.flags??={};if(chapter>0)this.data.flags.terminal=true;if(chapter>1)this.data.flags.prototype=true;
 }
 capture(scene){
  const d=this.data;d.states[d.chapter]=copy(scene.mission.state);d.activeId=scene.player.id;
  d.party=scene.party.map(p=>({id:p.id,hp:p.hp,special:p.special,ko:p.ko,x:p.x,y:p.y}));
  d.zones[d.current]={enemies:scene.enemies.map(e=>({x:e.x,y:e.y,hp:e.hp,ko:e.ko,energy:e.specialAbility.energy,specialState:e.specialAbility.snapshot?.(),bossRage:!!e.specialAbility.rage?.completed})),crates:scene.crates.map(c=>({destroyed:c.destroyed,hp:c.hp}))};
  return copy(d);
 }
 enter(id,spawn){this.data.current=id;this.data.party.forEach((p,i)=>{p.x=spawn[0]+i*44;p.y=spawn[1];});}
 get countsCurrentStage(){return FACILITY_ZONES[this.data.current].stage===this.data.chapter;}
}
