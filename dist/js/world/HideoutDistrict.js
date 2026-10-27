import {STATIONS,HUB_ACTIONS} from '../data/hideout.js';
import {drawEnvironment} from './EnvironmentArt.js';
/** Workstations are drawn inside the existing eleven solid furniture footprints. */
export function buildHideoutLayout(config){
 const commands=[],roads=[],occluders=[],stations=STATIONS.map(s=>({id:s.id,x:s.x,y:s.y}));let depth=0;
 const C={ink:0x2d454b,light:0xe5dbb9,gold:0xc8ac72,wood:0xa58b6b,blue:0x7197a1,green:0x759084,rose:0xb78379};
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=C.light,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const screen=(x,y,w=35,h=25)=>{rect(x,y,w,h,C.ink);rect(x+3,y+3,w-6,h-6,C.blue);for(let yy=y+7;yy<y+h-4;yy+=5)line(x+6,yy,x+w-6,yy,C.light,1,.5);};
 const paper=(x,y)=>{rect(x,y,22,15,C.light);for(let i=0;i<3;i++)line(x+3,y+4+i*4,x+18,y+4+i*4,C.ink,1,.5);};
 const label=(x,y,value,w)=>{rect(x,y,w,23,C.ink);rect(x,y,4,23,C.gold);text(x+12,y+12,value,11,C.light,'left');};
 rect(0,0,1280,800,C.ink);rect(40,55,1200,710,0x899d91);
 for(const [i,[x,y,w,h,material,title]]of config.rooms.entries()){
  const bg=material==='parquet'?0xb39a79:material==='marble'?0xc0c6ae:i===1?0x8fa7a2:0x9eab98;rect(x,y,w,h,bg);
  if(material==='parquet'){for(let yy=y;yy<y+h;yy+=23){line(x,yy,x+w,yy,0x7d705c,1,.25);for(let xx=x+10+((yy/23|0)%2)*50;xx<x+w;xx+=100)line(xx,yy,xx,Math.min(yy+23,y+h),0x7d705c,1,.25);}}
  else{for(let yy=y;yy<y+h;yy+=36)line(x,yy,x+w,yy,C.ink,1,.14);for(let xx=x;xx<x+w;xx+=36)line(xx,y,xx,y+h,C.ink,1,.14);}
  line(x,y+h,x+w,y+h,C.gold,3,.65);at(3,()=>label(x+7,y-25,title,Math.min(w-14,title.length*7+25)));
 }
 for(const r of [{x:575,y:285,w:130,h:470},{x:55,y:290,w:1170,h:60},{x:55,y:550,w:1170,h:35}]){rect(r.x,r.y,r.w,r.h,0xb8b8a1,.7);roads.push({...r,color:0x9da995});}
 at(1,()=>{
  // Floor pads frame existing actors and interactions; they do not add new blocking objects.
  STATIONS.forEach((s,i)=>{rect(s.x-59,s.y-43,118,70,[0x698e81,0x8a8f7f,0x658c96][i%3],.17);line(s.x-55,s.y+21,s.x+55,s.y+21,C.light,2,.45);});
  rect(565,335,150,120,C.ink,.2);rect(575,345,130,100,C.gold,.4);rect(580,350,120,90,0x8aa497);text(640,438,'LA PROSSIMA MISSIONE',10,C.ink);
  rect(485,510,115,66,C.green,.18);line(495,572,590,572,C.gold,3);rect(58,281,86,109,C.ink,.1);
 });
 for(let i=0;i<STATIONS.length;i++){
  const s=STATIONS[i],[x,y,w,h]=config.obstacles[i],z=y+h;
  at(z,()=>{
   rect(x,y,w,h,C.ink);rect(x+4,y+4,w-8,h-12,s.id==='anna'?C.light:C.wood);rect(x+5,y+5,w-10,3,C.light,.35);rect(x+9,y+h-12,w-18,7,0x68827d);
   if(s.id==='click'){
    screen(x+7,y+7,46,29);rect(x+60,y+8,10,27,C.light);rect(x+64,y+12,2,18,C.ink);ellipse(x+79,y+29,21,12,C.ink);line(x+73,y+29,x+79,y+29,C.light,2);line(x+76,y+26,x+76,y+32,C.light,2);ellipse(x+85,y+29,3,3,C.rose);
   }else if(s.id==='spit'){
    rect(x+9,y+11,7,26,C.blue);rect(x+w-16,y+11,7,26,C.blue);line(x+16,y+21,x+w-16,y+21,C.gold,5);rect(x+32,y+11,30,24,C.ink);rect(x+36,y+15,22,16,0x9da99a);for(let j=0;j<3;j++)rect(x+38+j*6,y+17,3,10,C.ink);
   }else if(s.id==='ted'){
    screen(x+7,y+7);screen(x+49,y+7);line(x+11,y+39,x+81,y+39,C.blue,2);for(let j=0;j<4;j++)rect(x+14+j*19,y+37,8,3,C.light);
   }else if(s.id==='luca'){
    rect(x+6,y+6,w-12,15,C.blue);for(let xx=x+15;xx<x+w-10;xx+=15){line(xx,y+9,xx,y+18,C.light,2);line(xx-3,y+9,xx+3,y+9,C.light,2);}rect(x+11,y+27,27,12,C.ink);line(x+47,y+28,x+68,y+37,C.gold,4);ellipse(x+79,y+30,12,12,C.blue);
   }else if(s.id==='bruce'){
    paper(x+9,y+9);ellipse(x+65,y+23,34,26,0xd2b477);ellipse(x+65,y+23,27,20,C.rose);ellipse(x+65,y+23,21,15,0xe2cf93);for(let j=0;j<3;j++)ellipse(x+59+j*5,y+20+j%2*6,4,4,C.rose);
   }else if(s.id==='carlitos'){
    rect(x+9,y+8,w-18,29,0x6c8b88);for(const [dx,dy]of[[24,20],[47,25],[70,19]])poly([[x+dx,y+dy-8],[x+dx+9,y+dy-2],[x+dx,y+dy+8],[x+dx-9,y+dy-2]],0xc1e0d4);line(x+12,y+37,x+82,y+37,C.light,2);
   }else if(s.id==='ale'){
    paper(x+10,y+9);paper(x+39,y+18);for(let j=0;j<3;j++){rect(x+69+j*5,y+9,4,26,[C.blue,C.rose,C.gold][j]);}text(x+22,y+34,'A / Z',8,C.ink);
   }else if(s.id==='andy'){
    rect(x+8,y+7,w-16,31,C.green);for(let j=0;j<4;j++){ellipse(x+19+j*18,y+17,7,7,C.gold);line(x+19+j*18,y+20,x+19+j*18,y+30,C.gold,2);rect(x+19+j*18,y+27,4,2,C.gold);}
   }else if(s.id==='anna'){
    rect(x+8,y+8,32,28,C.green);rect(x+21,y+12,6,20,C.light);rect(x+14,y+19,20,6,C.light);for(let j=0;j<3;j++){rect(x+50+j*12,y+17,9,19,C.blue);rect(x+51+j*12,y+13,7,5,C.light);}
   }else if(s.id==='paula'){
    rect(x+8,y+7,56,29,C.light);line(x+13,y+28,x+26,y+14,C.blue,2);line(x+26,y+14,x+52,y+29,C.blue,2);ellipse(x+52,y+29,6,6,C.rose);rect(x+72,y+11,13,24,C.green);
   }else{
    for(let j=0;j<3;j++){ellipse(x+22+j*23,y+22,23,25,C.ink);ellipse(x+22+j*23,y+22,13,14,0x82988e);ellipse(x+22+j*23,y+22,6,7,C.ink);}line(x+10,y+38,x+82,y+38,C.gold,3);
   }
  });
 }
 at(2,()=>{
  rect(40,55,1200,31,C.ink);for(let x=90;x<1200;x+=190){rect(x,62,79,6,C.light);rect(x-10,68,99,14,C.gold,.06);}
  // A single floor link identifies the shared twin station without adding another action.
  line(800,680,1070,680,C.gold,3,.5);text(940,675,'IL COLPO DEI GEMELLI',10,C.ink);
  for(const p of HUB_ACTIONS.filter(p=>p.id==='exit')){rect(p.x-40,p.y-3,80,20,C.light,.5);poly([[p.x-9,p.y+1],[p.x+9,p.y+1],[p.x,p.y+13]],C.ink,.5);}
 });
 at(10,()=>label(48,15,'FOSSANO / IL COVO DELLA BANDA',310));
 return {area:'hideout',commands,occluders,roads,stations};
}
export function drawHideoutDistrict(scene,config){return drawEnvironment(scene,buildHideoutLayout(config));}
