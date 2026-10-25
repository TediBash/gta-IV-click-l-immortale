import {MISSIONS} from '../data/campaign.js';
export const MISSION_IDS=Object.keys(MISSIONS).map(Number).sort((a,b)=>a-b);
export function completedMissions(value){return Array.isArray(value)?[...new Set(value.filter(id=>Number.isInteger(id)&&MISSION_IDS.includes(id)))].sort((a,b)=>a-b):[];}
export function canPlayMission(id,completed=[],unlockAll=false){return MISSION_IDS.includes(Number(id))&&(unlockAll===true||MISSION_IDS.filter(n=>n<Number(id)).every(n=>completedMissions(completed).includes(n)));}
export function suggestedMission(completed,saved,unlockAll=false){if(saved&&!saved.complete&&canPlayMission(saved.mission,completed,unlockAll))return Number(saved.mission);return MISSION_IDS.find(id=>!completedMissions(completed).includes(id)&&canPlayMission(id,completed,unlockAll))||MISSION_IDS.at(-1);}
export function lockedMessage(id,completed){const previous=MISSION_IDS.filter(n=>n<Number(id)&&!completedMissions(completed).includes(n));return `Gioca e completa le missioni precedenti: potrai giocare questa missione dopo averle terminate.${previous.length?' La prossima è la missione '+String(previous[0]).padStart(2,'0')+'.':''}`;}
