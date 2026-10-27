import {applyEnemySet} from './enemySets.js';
import {scaleConfig,enemyCount} from '../world/DifficultyEncounters.js';
export const WORKSHOP_SKINS=['engine-stand','wheel-rack','paint-cabinet','paint-booth','tool-cabinet','vehicle-lift','mechanic-bench','compressor'];
export const ZONE_LINES=[
{id:"spit.zone.resume.01",character:"spit",event:"dialogue",text:"Riprendiamo da qui. I pezzi raccolti e la macchina sono dove li abbiamo lasciati."},
{id:"click.zone.resume.01",character:"click",event:"dialogue",text:"Controlliamo il diario. Sappiamo già cosa manca."},
{id:'spit.zone.intro.01',character:'spit',event:'dialogue',text:'Prima passiamo in officina: motore, gomme e vernice. Poi recuperiamo l’auto nel deposito.'},
{id:'click.zone.intro.01',character:'click',event:'dialogue',text:'Tu cerca i pezzi. Alle guardie penso io.'},
{id:'spit.zone.transformed.01',character:'spit',event:'dialogue',text:'Eccola qui! Carrozzeria, colore e assetto completamente nuovi.'},
{id:'click.zone.transformed.01',character:'click',event:'dialogue',text:'Non la riconosceranno. Portiamola al circuito!'}];
export const zoneLine=id=>ZONE_LINES.find(l=>l.id===id);
export const DOORS={
 street:[{id:'workshop-in',x:300,y:330,to:'workshop',spawn:[620,640],label:'OFFICINA DI SPIT',vehicle:true,presentation:'garage'},{id:'depot-in',x:1030,y:330,to:'depot',spawn:[160,650],label:'DEPOSITO AUTO',vehicle:true,presentation:'garage'}],
 workshop:[{id:'workshop-out',x:620,y:710,to:'street',spawn:[300,420],label:'STRADA DI FOSSANO',vehicle:true,presentation:'threshold'}],
 depot:[{id:'depot-out',x:90,y:650,to:'street',spawn:[1030,420],label:'STRADA DI FOSSANO',vehicle:true,presentation:'threshold'}]
};
export const ZONE_NAMES={street:'Fossano · via delle officine',workshop:'Officina Spit · ricambi e forno',depot:'Deposito · la supercar'};
export const PARKING={x:930,y:190,w:160,h:160};
function baseConfig(base,id){
 const common={...base,zone:id,name:ZONE_NAMES[id],mode:'zone',guardTarget:base.guards.length,points:[],guards:[],crates:[],obstacles:[],rooms:[],furniture:[],buildingSkins:[],gateVan:false,parkedCar:null,gate:[-1000,-1000],targets:{parts:3},objectives:[['parts','Cerca tre componenti nell’officina'],['guards','Libera il deposito'],['car','Recupera l’auto con Spit'],['parked','Parcheggia nel forno'],['tuned','Trasforma la macchina'],['exit','Guida fino al circuito']],description:'A: interagisci / porta / sali o scendi. In auto: direzioni per guidare, B per manovrare lentamente. I progressi restano salvati tra le zone.'};
 if(id==='street')return {...common,theme:'street',start:[540,650],gate:[1170,660],obstacles:[[130,100,340,180],[850,100,330,180],[560,100,140,140]],buildingSkins:['estate-garage','garage','country'],furniture:[['tires',180,310,75],['garden',650,280,115],['classic',720,660,115]]};
 if(id==='workshop')return {...common,theme:'workshop',start:[620,640],rooms:[[70,95,1140,640,'concrete','OFFICINA SPIT']],obstacles:[[90,95,1100,20],[70,95,20,600],[1190,95,20,600],[140,150,110,65],[450,150,110,65],[140,440,110,65],[900,140,220,20],[900,140,20,240],[1100,140,20,240]],furniture:[['engine-stand',195,215,110],['wheel-rack',505,215,115],['paint-cabinet',195,505,125],['vehicle-lift',650,350,160],['mechanic-bench',370,120,115],['tool-cabinet',820,120,90],['compressor',1140,600,80]],points:base.points.filter(p=>['engine','wheels','paint'].includes(p.id)).map(p=>({...p,who:'spit',x:p.id==='wheels'?505:195,y:p.id==='paint'?560:270,skin:p.id==='engine'?'engine-stand':p.id==='wheels'?'wheel-rack':'paint-cabinet'}))};
 return {...common,theme:'garage',start:[160,650],guards:base.guards.map(g=>[...g]),crates:base.crates.map(c=>[...c]),obstacles:base.obstacles.map(b=>[...b]),furniture:[['tires',1140,110,100],['tool-cabinet',110,130,100]]};
}

export function workshopConfig(base,id,difficulty='easy'){return scaleConfig(applyEnemySet(baseConfig(base,id),2,id),difficulty,enemyCount(base.guards.length,difficulty));}
