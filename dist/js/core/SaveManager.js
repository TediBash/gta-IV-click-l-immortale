import {completedMissions} from './CampaignAccess.js';
import {MISSIONS} from '../data/campaign.js';
const SAVE_KEY='gtaclick.save.v1', SETTINGS_KEY='gtaclick.settings.v1';
export class SaveManager{
 read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
 write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 load(){const s=this.read(SAVE_KEY);return [1,2].includes(s?.version)&&Number.isInteger(s.chapter)&&s.chapter>=0&&s.chapter<(MISSIONS[s.mission??3]?.chapters.length??0)?{...s,mission:s.mission??3}:null;}
 save(state){return this.write(SAVE_KEY,{...state,version:2,savedAt:Date.now()});}
 completed(){return completedMissions(this.read('gtaclick.completed.v1'));}
 markComplete(id){return this.write('gtaclick.completed.v1',[...new Set([...this.completed(),id])]);}
 clear(){localStorage.removeItem(SAVE_KEY);}
 settings(){return {unlockAllMissions:false,raceAutoAccelerate:true,raceAssist:true,muted:false,volume:.65,musicEnabled:true,musicVolume:.65,effectsEnabled:true,effectsVolume:.8,voicesEnabled:true,voiceVolume:1,voices:{},powerups:{},frequency:'normal',reduceMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,...this.read(SETTINGS_KEY)};}
 saveSettings(value){this.write(SETTINGS_KEY,value);}
}
