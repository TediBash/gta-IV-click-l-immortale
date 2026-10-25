import {floor,prop,LANDSCAPE_SKINS} from '../data/skins.js';
import {MISSION_LOOKS} from '../data/atmosphere.js';
export function overlapsCircleRect(x,y,r,box){const px=Math.max(box.x,Math.min(x,box.x+box.w)),py=Math.max(box.y,Math.min(y,box.y+box.h));return Math.hypot(x-px,y-py)<r;}
export class GameMap{
 constructor(scene,config,index){this.scene=scene;this.config=config;this.width=1280;this.height=800;this.index=index;this.obstacles=config.obstacles.map(([x,y,w,h])=>({x,y,w,h}));this.draw();}
 blocked(x,y,r=15){return x<40||y<55||x>this.width-40||y>this.height-35||this.obstacles.some(b=>overlapsCircleRect(x,y,r,b));}
 clearLine(x,y,tx,ty){const steps=Math.max(1,Math.ceil(Math.hypot(tx-x,ty-y)/8));for(let i=1;i<steps;i++)if(this.blocked(x+(tx-x)*i/steps,y+(ty-y)*i/steps,2))return false;return true;}
 move(actor,dx,dy){if(!this.blocked(actor.x+dx,actor.y))actor.x+=dx;if(!this.blocked(actor.x,actor.y+dy))actor.y+=dy;}
 /** Breadth-first route over the collision grid. Used only when the direct route is blocked. */
 nextStep(x,y,tx,ty){const cell=40,sx=Math.floor(x/cell),sy=Math.floor(y/cell),gx=Math.floor(tx/cell),gy=Math.floor(ty/cell);const start=`${sx},${sy}`,queue=[[sx,sy]],parents=new Map([[start,null]]);let end=null;
  for(let i=0;i<queue.length&&i<700;i++){const [cx,cy]=queue[i];if(cx===gx&&cy===gy){end=`${cx},${cy}`;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy,key=`${nx},${ny}`;if(!parents.has(key)&&!this.blocked(nx*cell+cell/2,ny*cell+cell/2,18)){parents.set(key,`${cx},${cy}`);queue.push([nx,ny]);}}}
  if(!end)return {x:tx,y:ty};while(parents.get(end)&&parents.get(end)!==start)end=parents.get(end);const [nx,ny]=end.split(',').map(Number);return {x:nx*cell+cell/2,y:ny*cell+cell/2};
 }
 draw(){
  const s=this.scene,c=this.config,theme=c.theme,look=MISSION_LOOKS[s.mission.id],g=s.add.graphics().setDepth(0),indoor=theme==='interior'||theme==='lab',sewer=theme==='sewer',greek=theme==='greece'||theme==='village';
  g.fillStyle(greek?0xa7b883:theme==='estate'?0x67836a:0x253e42).fillRect(0,0,1280,800);
  if(indoor||sewer||['garage','race','facility'].includes(theme))floor(s,sewer?'sewer':theme==='interior'?'marble':'concrete',30,48,1220,730);
  if(['factory','vault','night','assembly','archive','workshop','reception','rome','jubilee','birthday'].includes(theme))floor(s,theme==='birthday'?'parquet':theme==='night'?'concrete':look.floor,30,48,1220,730);
  if(greek||theme==='estate')floor(s,'grass',30,48,1220,730);
  const scenery=s.add.graphics().setDepth(2);
  if(theme==='street'){scenery.fillStyle(0xadae9f).fillRect(35,285,1210,115).fillRect(35,620,1210,135);scenery.fillStyle(0x343f48).fillRect(35,400,1210,220);for(let x=60;x<1220;x+=100)scenery.fillStyle(0xe8d99a).fillRect(x,505,45,5);for(let y=410;y<600;y+=26)scenery.fillStyle(0xe9e6d4).fillRect(770,y,90,13);}
  if(['night','rome','jubilee','assembly'].includes(theme)){
   scenery.fillStyle(theme==='night'?0x132933:0x9d8274,.7).fillRect(40,350,1200,115);
   for(let x=80;x<1230;x+=100)scenery.fillStyle(0xf5d9ab,.4).fillRect(x,403,42,4);
  }
  if(['factory','vault','lab','facility','workshop'].includes(theme)){
   for(let x=70;x<1230;x+=42)scenery.fillStyle(look.color,.35).fillRect(x,97,20,5).fillRect(x,748,20,5);
   scenery.lineStyle(2,look.color,.22).strokeRect(60,100,1160,640);
  }
  if(['rome','jubilee'].includes(theme)){
   for(let x=90;x<1200;x+=180){scenery.fillStyle(0xffd49c,.15).fillCircle(x,130,55);scenery.fillStyle(0xffdb9f).fillRect(x-3,107,6,8);}
  }
  if(sewer&&!c.waterChannels){const water=s.add.graphics().setDepth(2);water.fillStyle(0x193f42,.65).fillRect(75,80,180,640).fillRect(1020,80,170,640);for(let y=100;y<750;y+=80)water.lineStyle(2,0x70aaa2,.2).lineBetween(85,y,230,y);}
  if(greek){scenery.fillStyle(0x378eab).fillRect(0,0,1280,95);scenery.lineStyle(60,0xd8c69a,.8).beginPath().moveTo(100,700).lineTo(600,610).lineTo(850,380).lineTo(1160,130).strokePath();}
  if(theme==='estate'){floor(s,'cobble',90,320,1100,100);floor(s,'cobble',120,120,120,560);for(let x=320;x<1180;x+=180){prop(s,'hedge',x,95,120);prop(s,'garden',x,770,115);}}
  for(const [x,y,w,h,skin,label]of c.rooms||[]){floor(s,s.mission.id===4?(skin==='parquet'?'villa-wood':'villa-marble'):skin,x,y,w,h);const border=s.add.graphics().setDepth(2);border.lineStyle(4,0x7a6f62).strokeRect(x,y,w,h);s.add.text(x+15,y+12,label,{fontFamily:'monospace',fontSize:11,color:'#615b54',backgroundColor:'#f1e7c9',padding:{x:6,y:3}}).setDepth(3);}
  const furnitureBoxes=new Set((c.furniture||[]).map(([,x,y])=>`${x},${y}`));
  this.obstacles.forEach((b,i)=>{
   const original=c.buildingSkins?.[i],custom=s.mission.id===4&&theme==='estate'&&original?(original==='garage'?'estate-garage':'manor'):original!==undefined?original:greek&&b.w>=170?(theme==='village'?'coast-house':'depot'):original,building=custom!==undefined?custom:greek&&b.w>=170?(theme==='village'?'greek':'country'):theme==='garage'&&b.w>=150?'garage':null;
   if(building){s.add.image(b.x+b.w/2,b.y+b.h,LANDSCAPE_SKINS.includes(building)?'landscape':'environment',building).setOrigin(.5,1).setDisplaySize(b.w+12,Math.max(b.h+25,b.w*.9)).setDepth(b.y+b.h);return;}
   if(furnitureBoxes.has(`${b.x+b.w/2},${b.y+b.h}`))return;
   const wall=s.add.graphics().setDepth(b.y+b.h);
   wall.fillStyle(0x112a32,.3).fillRect(b.x+6,b.y+7,b.w,b.h);
   wall.fillStyle(sewer?0x3f5650:indoor?0x817a6d:0x455e52).fillRect(b.x,b.y,b.w,b.h);
   wall.lineStyle(2,sewer?0x7f9b7b:indoor?0xd3c4a6:0x86a18a).strokeRect(b.x,b.y,b.w,b.h);
   if(look&&b.w>=90&&b.h>=70)prop(s,look.props[i%look.props.length],b.x+b.w/2,b.y+b.h-5,Math.min(b.w,125),b.y+b.h+1);
   if(theme==='lab')prop(s,'terminal',b.x+b.w/2,b.y+b.h,Math.min(90,b.w+10),b.y+b.h+1);
  });
  for(const [skin,x,y,size]of c.furniture||[])prop(s,skin,x,y,size);
  if(greek){prop(s,theme==='village'?'bus-stop':'ruin-gate',1190,105,100);for(const [x,y]of[[80,230],[1200,320],[80,520]])prop(s,'olive',x,y,95);}
  if(theme==='race'){for(const [x,y]of[[90,300],[1190,300],[600,100]])prop(s,'tires',x,y,70);}
  if(theme==='birthday'){prop(s,'birthday',690,270,140);prop(s,'bunting',650,120,180);prop(s,'sofa',490,280,125);prop(s,'desk',910,280,125);}
  else if(s.mission.id>=4){prop(s,look.props[0],90,155,90);prop(s,look.props[2],1200,715,90);}
  const labels={greece:'GRECIA / COLLINE SUL MARE',village:'GRECIA / ULTIMO GIORNO',garage:'FOSSANO / OFFICINA SPIT',race:'CIRCUITO / DUE GIRI',facility:'TORINO / CENTRO TECNOLOGICO',lab:'TORINO / LABORATORIO',estate:'CUNEO / LA VILLA',interior:this.scene.mission.id===5?'TORINO / USCITA DI SERVIZIO':'CUNEO / INTERNO VILLA',sewer:'TORINO / FUORI PLANIMETRIA'};
  s.add.text(55,60,c.zone?c.name.toUpperCase():theme==='birthday'?'FOSSANO / CASA, FINALMENTE':labels[theme]||look.label,{fontFamily:'monospace',fontSize:13,color:'#f5eac7',backgroundColor:'#1c343bcf',padding:{x:8,y:5}}).setDepth(10);
 }
}
