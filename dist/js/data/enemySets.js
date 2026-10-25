import {ENEMY_TYPES} from './enemies.js';
export const ENEMY_SETS={
 1:{name:'Pattuglia della base greca',troops:['soldier','ranger','riot'],boss:'major',final:'coast',note:'Argo sorveglia la fuga: raggiungi il varco, non serve combatterlo.'},
 2:{name:'Rivali di Spit',troops:['duelist','sapper','bruiser','guard'],boss:'scrapking',final:'depot',note:'Il Re della lamiera difende il deposito; la gara resta una gara.'},
 3:{name:'Sicurezza del centro',troops:['dronepilot','medic','sapper','technician','guard'],boss:'volt',final:'escape'},
 4:{name:'Scorta della villa',troops:['riot','duelist','medic','warden'],boss:'onyx',final:'driveway'},
 5:{name:'Banda dei sotterranei',troops:['duelist','riot','medic','pulse','bruiser'],boss:'scrapking',final:'dining',note:'L’alligatore mantiene le due cariche e il suo incontro nel collettore.'},
 6:{name:'Guardiani dei diamanti',troops:['sapper','riot','medic','dronepilot','warden'],boss:'onyx',final:'street'},
 7:{name:'Squadra di contenimento',troops:['ranger','riot','dronepilot','pulse'],boss:'major',final:'pickup'},
 8:{name:'Sabotatori del laboratorio',troops:['sapper','dronepilot','medic','technician'],boss:'volt',final:'departure'},
 9:{name:'Scorta del ricevimento',troops:['duelist','riot','medic','pulse','bruiser'],boss:'onyx',final:'meeting'},
 10:{name:'Unità speciale di Roma',troops:['ranger','sapper','riot','medic','duelist','dronepilot'],boss:'major',final:'convoy',note:'Dopo l’ultimo scontro, strada e casa restano dedicate al finale.'}
};
/** Keep positions, counts and save indices. Only the role in an existing slot changes. */
export function missionGuards(guards,mission,zone=''){
 const set=ENEMY_SETS[mission];if(!set)return guards.map(g=>[...g]);
 const offset=[...zone].reduce((n,c)=>n+c.charCodeAt(0),0),existingBoss=guards.findIndex(g=>ENEMY_TYPES[g[2]]?.boss||g[2]==='captain'||g[2]==='boss');
 const bossIndex=zone===set.final?(existingBoss<0?guards.length-1:existingBoss):existingBoss;
 return guards.map(([x,y,type],i)=>[x,y,type==='alligator'?type:i===bossIndex&&zone===set.final?set.boss:(ENEMY_TYPES[type]?.boss||type==='captain'||type==='boss')?(type==='boss'?'captain':type):set.troops[(offset+i)%set.troops.length]]);
}
export function applyEnemySet(config,mission,zone=config.zone||''){
 return {...config,enemySet:mission,guards:missionGuards(config.guards||[],mission,zone),...(config.pursuers?{pursuers:missionGuards(config.pursuers,mission,zone)}:{})};
}
