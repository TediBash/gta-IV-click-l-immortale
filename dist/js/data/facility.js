import {applyEnemySet} from './enemySets.js';
import {scaleConfig,enemyCount} from '../world/DifficultyEncounters.js';
const door=(id,x,y,to,spawn,label)=>({id,x,y,to,spawn,label});
export const FACILITY_ZONES={
 courtyard:{stage:0,name:'Cortile del centro',short:'CORTILE',theme:'facility',start:[150,650],
  obstacles:[[310,130,270,140],[700,120,240,130],[430,470,200,85]],buildingSkins:['garage','country'],
  guards:[[410,350,'guard'],[700,380,'bruiser'],[970,490,'technician'],[920,650,'guard'],[1110,150,'guard']],
  crates:[[210,460,'heal'],[760,620,'charge']],furniture:[['hedge',165,150,140],['hedge',1070,720,130],['tires',530,545,90]],
  doors:[door('security-in',1120,270,'security',[160,650],'Ingresso di sicurezza')]},
 security:{stage:0,name:'Ingresso di sicurezza',short:'ACCESSI',theme:'interior',start:[160,650],
  obstacles:[[330,170,290,75],[740,310,55,270]],rooms:[[100,115,1050,530,'marble','CONTROLLO ACCESSI']],
  guards:[[520,410,'technician'],[1020,490,'guard']],crates:[[260,350,'heal']],
  furniture:[['reception',475,245,170],['terminal',1030,420,95],['server',870,195,100]],
  device:{key:'terminal',x:1030,y:440,label:'Sblocca il laboratorio',who:'ted'},
  doors:[door('courtyard-out',100,700,'courtyard',[1060,370],'Torna al cortile'),door('lab-in',1120,190,'lab',[160,650],'Entra nel laboratorio')]},
 lab:{stage:1,name:'Laboratorio prototipi',short:'PROTOTIPO',theme:'lab',start:[160,650],
  obstacles:[[240,200,200,70],[740,200,200,70],[440,460,260,70]],rooms:[[100,120,1080,580,'concrete','RICERCA / PROTOTIPI']],
  guards:[[520,330,'guard'],[860,570,'technician'],[1020,270,'bruiser'],[340,450,'guard']],
  crates:[[580,180,'cash'],[240,600,'heal'],[770,650,'charge']],
  furniture:[['mechanic-bench',340,270,150],['terminal',840,270,140],['workbench',570,530,150]],
  device:{key:'prototype',x:1050,y:440,label:'Recupera il prototipo',who:'ted'},
  doors:[door('security-out',100,700,'security',[1060,290],'Torna alla sicurezza'),door('server-in',1120,190,'server',[160,650],'Sala server e fondi riservati')]},
 server:{stage:1,name:'Sala server',short:'DENARO',theme:'lab',start:[160,650],
  obstacles:[[300,150,80,420],[580,150,80,330],[850,350,80,280]],
  guards:[[490,530,'technician'],[760,270,'guard'],[1090,420,'bruiser']],
  crates:[[460,230,'cash'],[1060,570,'cash'],[740,650,'heal'],[1050,120,'upgrade']],
  furniture:[['server',340,570,145],['server',620,480,145],['server',890,630,145],['terminal',1090,310,100]],
  doors:[door('lab-out',100,700,'lab',[1060,290],'Torna al laboratorio'),door('dock-in',1120,190,'dock',[160,650],'Porta di servizio')]},
 dock:{stage:2,name:'Area di carico',short:'RINFORZI',theme:'facility',start:[160,650],
  obstacles:[[320,160,250,100],[680,360,220,100]],
  guards:[[500,500,'bruiser'],[800,200,'technician'],[1050,520,'guard'],[335,350,'guard']],
  crates:[[240,470,'heal'],[740,640,'charge']],furniture:[['forklift',450,260,160],['tool-cabinet',790,460,120],['van',1050,690,140]],
  doors:[door('server-out',100,700,'server',[1060,290],'Torna alla sala server'),door('escape-in',1120,230,'escape',[160,650],'Piazzale del furgone')]},
 escape:{stage:2,name:'Piazzale di uscita',short:'FURGONE',theme:'facility',start:[160,650],
  obstacles:[[350,160,180,100],[620,430,230,100]],
  guards:[[470,430,'bruiser'],[790,210,'technician'],[1010,470,'captain'],[1050,650,'guard']],
  crates:[[270,350,'heal'],[730,660,'charge']],furniture:[['forklift',440,260,135],['wheel-rack',735,530,135]],
  doors:[door('dock-out',100,700,'dock',[1060,330],'Torna all’area di carico')]}
};
export const FACILITY_START=['courtyard','lab','dock'];
export const FACILITY_VAN={x:1110,y:190};
function baseConfig(base,id,chapter){
 const z=FACILITY_ZONES[id],total=Object.values(FACILITY_ZONES).filter(z=>z.stage===chapter).reduce((n,z)=>n+z.guards.length,0);
 const objectives=chapter===0?[['guards','Libera cortile e sicurezza'],['terminal','Apri l’accesso con Ted'],['exit','Entra nel laboratorio']]:chapter===1?[['cash','Recupera tre casse tra laboratorio e server'],['prototype','Recupera il prototipo con Ted'],['exit','Raggiungi la porta di servizio']]:[['guards','Ferma i rinforzi nei due piazzali'],['loaded','Carica denaro e prototipo nel furgone'],['exit','Parti per Fossano']];
 return {...base,...z,name:z.name,zone:id,facilityStage:z.stage,mode:'facility',terminal:null,points:[],extraGuardCount:0,guardTarget:total,enemySpecialReady:z.stage===2,cashTarget:chapter===1?3:0,objectives,gate:id==='escape'?[FACILITY_VAN.x,FACILITY_VAN.y]:[-500,-500],gateVan:id==='escape'};
}
const lines={
 resume:['ted','Ricominciamo da qui. Gli accessi aperti e il bottino sono conservati.','click','E le guardie che abbiamo steso restano a terra.'],
 terminal:['ted','Accesso sbloccato. Il laboratorio è oltre la porta illuminata.','click','Passaggio libero. Andiamo a prendere quello che ci serve.'],
 prototype:['ted','Prototipo recuperato. Le casse di denaro sono qui e nella sala server.','click','Tu tienilo al sicuro. Io mi occupo delle casse.'],
 loaded:['click','Tre casse e il prototipo. Tutto a bordo.','ted','Furgone pronto. Prossima destinazione: Fossano.']
};
export const FACILITY_DIALOGUES=Object.fromEntries(Object.entries(lines).map(([key,flat])=>[key,Array.from({length:flat.length/2},(_,i)=>({character:flat[i*2],text:flat[i*2+1],event:'dialogue',id:`${flat[i*2]}.facility.${key}.${i+1}`}))]));
export const FACILITY_VOICES=Object.values(FACILITY_DIALOGUES).flat();

export function facilityConfig(base,id,chapter,difficulty='easy'){
 const config=baseConfig(base,id,chapter),total=Object.values(FACILITY_ZONES).filter(z=>z.stage===chapter).reduce((n,z)=>n+enemyCount(z.guards.length,difficulty),0);
 return scaleConfig(applyEnemySet(config,3,id),difficulty,total);
}
