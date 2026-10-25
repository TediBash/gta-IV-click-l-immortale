import {MISSIONS} from '../data/campaign.js';
export class ChapterState {constructor(index){Object.assign(this,{index,guards:0,cash:0,terminal:false,prototype:false,exit:false});}}
export class MissionManager {
 constructor(bus,missionId=3){this.bus=bus;this.selectMission(missionId);}
 selectMission(id){this.override=null;this.id=MISSIONS[id]?Number(id):3;this.state=new ChapterState(0);}
 get mission(){return MISSIONS[this.id];}
 begin(index){this.state=new ChapterState(index);for(const key of Object.keys(this.config.targets||{}))this.state[key]=0;this.bus.emit('chapter:started',this.state);}
 get config(){return this.override||this.mission.chapters[this.state.index];}
 target(key){return key==='guards'?(this.config.guardTarget??this.config.guards.length)+(this.config.extraGuardCount||0):key==='cash'?this.config.cashTarget:this.config.targets?.[key];}
 complete(key){const target=this.target(key);return target!==undefined?this.state[key]>=target:!!this.state[key];}
 canExit(){return this.config.objectives.filter(([key])=>key!=='exit').every(([key])=>this.complete(key));}
 record(key){if(this.target(key)!==undefined)this.state[key]=(this.state[key]||0)+1;else this.state[key]=true;this.bus.emit('mission:updated',this.state);}
}
