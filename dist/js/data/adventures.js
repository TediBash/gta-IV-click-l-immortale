import {applyEnemySet} from './enemySets.js';
import {scaleConfig,enemyCount} from '../world/DifficultyEncounters.js';
import {ROME_ZONES,ROME_START} from './romeFinale.js';
import {PREPARATION_ZONES,PREPARATION_START} from './romePreparation.js';
import {UNDERWORLD_ZONES,UNDERWORLD_START} from './underworld.js';
const door=(id,x,y,to,spawn,label,extra={})=>({id,x,y,to,spawn,label,...extra});
const point=(ref,x,y,extra={})=>({ref,x,y,...extra});
export const ADVENTURE_START={...ROME_START,...PREPARATION_START,...UNDERWORLD_START,1:['village','ridge','home'],4:['forecourt','hall','garage']};
export const ADVENTURE_ZONES={
 ...ROME_ZONES,...UNDERWORLD_ZONES,...PREPARATION_ZONES,
 1:{
  village:{stage:0,name:'Il villaggio sul mare',theme:'village',start:[150,650],obstacles:[[300,150,250,150],[760,170,240,140]],furniture:[['olive',650,380,115],['garden',470,710,120]],points:[point('footprints',610,490)],doors:[door('olives-in',1120,470,'olives',[160,650],'Sentiero degli ulivi')]},
  olives:{stage:0,name:'Il sentiero degli ulivi',theme:'greece',start:[160,650],obstacles:[[330,210,110,200],[700,390,140,160]],buildingSkins:[null,null],furniture:[['olive',385,410,145],['olive',770,550,160],['olive',1040,150,110]],points:[point('fence',1000,300)],doors:[door('village-out',100,700,'village',[1040,560],'Torna al villaggio'),door('base-in',1120,250,'base',[160,650],'Varco della vecchia base',{requires:['fence']})]},
  base:{pursuers:[[740,380,'soldier'],[500,650,'soldier']],stage:0,name:'Il deposito abbandonato',theme:'greece',start:[160,650],obstacles:[[360,170,240,160],[840,150,280,180],[600,510,120,80]],buildingSkins:['depot','depot',null],furniture:[['ruin-gate',175,420,120]],points:[point('depot',970,410),point('story',1080,540,{action:'firecracker'})],doors:[door('olives-out',100,700,'olives',[1040,340],'Torna agli ulivi'),door('ridge-in',1120,700,'ridge',[150,650],'Scappa verso le colline')]},
  ridge:{guards:[[580,520,'soldier'],[1030,580,'soldier']],lights:[[650,470,90,.45]],stage:1,name:'La fuga sulle colline',theme:'greece',mode:'escape',start:[150,650],obstacles:[[330,180,130,210],[700,350,130,150]],buildingSkins:[null,null],furniture:[['olive',395,390,140],['olive',765,500,140]],route:[[520,620],[970,410]],routeOffset:0,doors:[door('base-out',100,700,'base',[1030,650],'Verso la base',{closedAfter:0,blocked:'Il deposito è alle spalle: continuate verso il mare.'}),door('coast-in',1120,240,'coast',[160,650],'Belvedere sul mare',{route:2})]},
  coast:{guards:[[650,380,'soldier'],[1050,500,'soldier']],stage:1,name:'Il bagliore oltre il mare',theme:'greece',mode:'escape',start:[160,650],obstacles:[[350,210,120,160],[750,470,150,95]],buildingSkins:[null,null],furniture:[['olive',410,370,140],['olive',825,565,125]],route:[[1030,300]],routeOffset:2,lights:[[490,530,180,.55],[860,360,150,.8],[1050,180,100,1.1]],doors:[door('ridge-out',100,700,'ridge',[1040,330],'Torna al sentiero alto'),door('home-in',1130,150,'home',[160,650],'Raggiungi casa')]},
  home:{stage:2,name:'Casa dei tre fratelli',theme:'interior',start:[160,650],rooms:[[110,120,1060,580,'parquet','GLI ULTIMI RICORDI']],obstacles:[[320,180,200,95],[780,180,180,100]],furniture:[['sofa',420,275,180],['bed',870,280,180],['desk',650,370,110]],points:[point('bag',590,470),point('photo',1030,470)],doors:[door('coast-out',100,700,'coast',[1050,240],'Verso la collina',{closedAfter:1,blocked:'È ora di partire. I bagagli vi aspettano qui.'}),door('departure-in',1120,650,'departure',[160,650],'Piazza della partenza')]},
  departure:{stage:2,name:'Prossima fermata: Fossano',theme:'village',start:[160,650],obstacles:[[340,160,250,150],[760,170,230,140]],furniture:[['bus-stop',1020,120,130],['garden',620,660,110]],points:[point('map',710,470)],gate:[1110,520],gateVan:true,doors:[door('home-out',100,700,'home',[1040,560],'Rientra a casa')]}
 },
 4:{
  forecourt:{stage:0,name:'Preparazione della consegna',theme:'estate',start:[150,650],obstacles:[[310,150,240,130],[760,130,240,150]],buildingSkins:['garage','villa'],furniture:[['tires',650,190,100]],parkedCar:[490,570,'luxury'],points:[point('papers',260,390),point('ready',490,550),point('hide',570,650)],doors:[door('gatehouse-in',1120,470,'gatehouse',[160,650],'Cancello della villa',{requires:['hidden'],blocked:'Andy e Spit preparano la consegna, poi Click si nasconde nell’auto.'})]},
  gatehouse:{stage:0,name:'Il cancello e il giardino',theme:'estate',start:[160,650],obstacles:[[330,150,230,150],[800,150,250,170]],buildingSkins:['villa','villa'],furniture:[['fountain',640,350,145],['hedge',610,700,160]],parkedCar:[250,590,'luxury'],points:[point('entry',1000,430)],doors:[door('forecourt-out',100,700,'forecourt',[1040,560],'Torna alla consegna'),door('hall-in',1130,300,'hall',[160,650],'Portone del salone')]},
  hall:{stage:1,name:'Il salone della villa',theme:'interior',start:[160,650],rooms:[[100,115,1070,580,'marble','SALONE / GALLERIA']],obstacles:[[340,190,210,80],[740,440,210,80]],furniture:[['sofa',445,270,180],['sofa',845,520,180],['fountain',650,200,100]],guards:[[580,420,'guard'],[1050,470,'bruiser']],crates:[[300,530,'heal']],doors:[door('gatehouse-out',100,700,'gatehouse',[1050,390],'Torna al giardino'),door('bedroom-in',1120,190,'bedroom',[160,650],'Camera al piano terra'),door('study-in',1120,650,'study',[160,650],'Apri lo studio',{requires:['key'],blocked:'La chiave dello studio è nella camera.'})]},
  bedroom:{stage:1,name:'La camera degli ospiti',theme:'interior',start:[160,650],rooms:[[100,115,1070,580,'parquet','CAMERA']],obstacles:[[350,180,220,140],[800,180,220,80]],furniture:[['bed',460,320,210],['desk',910,260,160]],guards:[[650,420,'guard'],[1030,520,'technician']],crates:[[300,450,'cash'],[740,650,'charge']],points:[point('key',1060,370,{who:'click'})],doors:[door('hall-out',100,700,'hall',[1040,280],'Torna al salone')]},
  study:{stage:1,name:'Lo studio riservato',theme:'interior',start:[160,650],rooms:[[100,115,1070,580,'parquet','STUDIO / DOCUMENTI']],obstacles:[[330,180,250,90],[770,410,240,80]],furniture:[['desk',455,270,195],['sofa',890,490,190],['terminal',1010,200,110]],guards:[[650,360,'bruiser'],[1070,580,'guard']],crates:[[680,180,'cash'],[300,460,'heal']],points:[point('dossier',1040,310)],doors:[door('hall-study-out',100,700,'hall',[1030,560],'Torna al salone'),door('garage-in',1120,650,'garage',[160,650],'Passaggio verso il garage')]},
  garage:{stage:2,name:'Il garage della villa',theme:'garage',start:[160,650],obstacles:[[330,170,250,90],[750,350,210,95]],buildingSkins:[null,null],furniture:[['vehicle-lift',455,260,180],['mechanic-bench',855,445,170],['wheel-rack',1030,170,115]],guards:[[590,410,'bruiser'],[970,540,'technician'],[1080,300,'guard']],crates:[[260,430,'heal'],[680,650,'charge']],doors:[door('study-out',100,700,'study',[1030,560],'Torna allo studio'),door('driveway-in',1120,650,'driveway',[160,650],'Piazzale di uscita')]},
  driveway:{stage:2,name:'Il prezzo dell’uscita',theme:'estate',start:[160,650],obstacles:[[350,150,230,130],[750,370,160,110]],buildingSkins:['villa',null],furniture:[['hedge',670,190,130],['garden',980,720,130]],guards:[[520,460,'guard'],[770,230,'technician'],[1060,420,'captain'],[940,650,'bruiser']],crates:[[300,400,'heal'],[670,660,'charge']],points:[point('gateKey',1040,200),point('escapeCar',1050,540)],gate:[1140,680],gateVan:true,gateSkin:'luxury',doors:[door('garage-out',100,700,'garage',[1030,560],'Torna al garage')]}
 }
};
function baseConfig(mission,id,chapter){
 const z=ADVENTURE_ZONES[mission.id][id],base=mission.chapters[chapter],original=mission.chapters[z.stage];
 const points=(z.points||[]).map(({ref,...location})=>({...original.points.find(p=>p.id===ref),...location}));
 return {...base,mode:'explore',rooms:[],furniture:[],buildingSkins:[],route:[],lights:[],routeOffset:0,parkedCar:null,...z,zone:id,points,terminal:null,guards:z.guards||[],crates:z.crates||[],extraGuardCount:Object.values(ADVENTURE_ZONES[mission.id]).filter(v=>v.stage===chapter).reduce((n,v)=>n+(v.extraGuardCount||0),0),guardTarget:Object.values(ADVENTURE_ZONES[mission.id]).filter(v=>v.stage===chapter).reduce((n,v)=>n+(v.guards||[]).length,0),enemySpecialReady:mission.id!==1&&z.stage===2,gate:z.gate||[-500,-500],gateVan:!!z.gateVan};
}
const lines={
 flight:['click','Correte sul sentiero! Prima allontaniamoci dalla base.','paula','Nico, resta con noi. Verso il mare!'],
 explosion:['nico','Guardate laggiù… è esploso tutto!','paula','Gli elicotteri! Seguiamo il sentiero e stiamo lontani dai fari.'],
 villaResume:['andy','La consegna e gli accessi sono ancora a posto.','click','Io non mi sono mosso. Ma qui dietro si sta stretti.'],
 resume:['click','Ripartiamo da qui. Quello che abbiamo trovato è ancora con noi.']
};
export const ADVENTURE_DIALOGUES=Object.fromEntries(Object.entries(lines).map(([key,flat])=>[key,Array.from({length:flat.length/2},(_,i)=>({character:flat[i*2],text:flat[i*2+1],event:'dialogue',id:`${flat[i*2]}.adventure.${key}.${i+1}`}))]));
export const ADVENTURE_VOICES=Object.values(ADVENTURE_DIALOGUES).flat();

export function adventureConfig(mission,id,chapter,difficulty='easy'){
 const base=baseConfig(mission,id,chapter),total=Object.values(ADVENTURE_ZONES[mission.id]).filter(z=>z.stage===chapter).reduce((n,z)=>n+enemyCount((z.guards||[]).length,difficulty),0);
 return scaleConfig(applyEnemySet(base,mission.id,id),difficulty,total);
}
