// Each pair is one chapter: outdoor approach/interior or two connected mission spaces.
const rows={9:[
 ['foyer','Ingresso del ricevimento','reception',['invite'],'reception','sofa'],['salon','Il salone degli ospiti','reception',['guest'],'desk','fountain'],
 ['lane','I vicoli al tramonto','rome',['kit'],'arch','olive'],['courtyard','Il passaggio di Click','rome',['pass'],'church','arch'],
 ['church','Il sagrato sotto assedio','rome',[],'church','fountain'],['meeting','Anna chiama la banda','rome',['meet'],'arch','tuned']
],10:[
 ['service','Giubileo: area tecnica','jubilee',['link','ready'],'server','workbench'],['terrace','Il ricevimento sulla terrazza','jubilee',['ale','scene'],'lectern','reception'],
 ['backstreet','Bruce e Carlitos: schiena contro schiena','jubilee',['route'],'arch','bunting'],['garage','Spit tiene acceso il motore','garage',['bag','car'],'vehicle-lift','mechanic-bench'],
 ['fountain','Il varco dei gemelli','rome',['paula','nico'],'fountain','arch'],['convoy','L’ultima barriera prima di casa','rome',['ride','aid'],'arch','luxury'],
 ['road','Le Alpi oltre il parabrezza','night',['radio'],'van','olive'],['home','Fossano: trenta candeline','birthday',['party','birthday'],'sofa','desk']
]};
const actions={invite:'reveal',pass:'reveal',meet:'arrival',link:'reveal',scene:'storyScene',route:'reveal',car:'arrival',nico:'reveal',ride:'arrival',aid:'regroup',radio:'homeward',party:'partyTogether',birthday:'birthdayFinale'};
export const ROME_ZONES={},ROME_START={};
for(const [id,list]of Object.entries(rows)){
 const zones=ROME_ZONES[id]={};ROME_START[id]=list.filter((_,i)=>i%2===0).map(r=>r[0]);
 list.forEach(([key,name,theme,refs,skin1,skin2],i)=>{
  const stage=Math.floor(i/2),peace=id==='10'&&stage===3,indoor=['reception','garage','birthday'].includes(theme);
  const z=zones[key]={stage,name,theme,start:[160,650],obstacles:[[330,170,220,110],[790,410,200,100]],furniture:[[skin1,440,280,180],[skin2,890,510,175]],guards:peace?[]:i%2?[[610,390,'guard'],[1040,310,i>=3?'overseer':'captain'],[1040,630,'pulse']]:[[610,400,'warden'],[1040,310,'pulse'],...(stage>0?[[1040,630,'bruiser']]:[])],crates:peace?[]:[[270,440,i%2?'charge':'heal']],points:refs.map((ref,j)=>({ref,x:j?1040:660,y:j?540:230,...(actions[ref]?{action:actions[ref]}:{})})),doors:[]};
  if(indoor)z.rooms=[[100,110,1080,590,theme==='birthday'?'parquet':'marble',name.toUpperCase()]];
  if(!indoor)z.furniture.push(['bunting',650,140,150]);
  if(i>0)z.doors.push({id:'back',x:100,y:700,to:list[i-1][0],spawn:[1040,260],label:'Torna: '+list[i-1][1],...(key==='road'?{closedAfter:2,blocked:'Roma è alle spalle. Si torna a Fossano.'}:{})});
  if(i<list.length-1)z.doors.push({id:'forward',x:1120,y:170,to:list[i+1][0],spawn:[160,650],label:list[i+1][1],...(refs.length&&i%2===0?{requires:refs,blocked:'Completa le azioni della squadra in questa zona.'}:{})});
  else Object.assign(z,{gate:[1120,650],gateVan:id==='9',gateSkin:'tuned'});
 });
}
