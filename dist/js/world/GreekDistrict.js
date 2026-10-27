import {drawEnvironment} from './EnvironmentArt.js';

/** Original Mediterranean pixel scenery; all solid footprints remain mission-owned. */
export const GREEK_PATHS={
 village:[[[100,700],[150,650],[260,570],[610,490],[690,400],[1120,470]],[[610,490],[640,350],[640,125]]],
 olives:[[[100,700],[160,650],[270,570],[560,570],[570,300],[1000,300],[1120,250]]],
 base:[[[100,700],[160,650],[260,650],[480,450],[970,410],[1080,540],[1120,700]]],
 ridge:[[[100,700],[150,650],[520,620],[590,540],[590,300],[970,300],[970,410],[1120,240]]],
 coast:[[[100,700],[160,650],[580,650],[620,440],[620,200],[1030,300],[1130,150]]],
 home:[],
 departure:[[[100,700],[160,650],[460,520],[710,470],[1110,520]]]
};
const TITLES={village:'GRECIA / IL VILLAGGIO SUL MARE',olives:'GRECIA / IL SENTIERO DEGLI ULIVI',base:'GRECIA / LA VECCHIA BASE',ridge:'GRECIA / LA FUGA SULLE COLLINE',coast:'GRECIA / IL BELVEDERE',home:'GRECIA / CASA DEI TRE FRATELLI',departure:'GRECIA / PROSSIMA FERMATA: FOSSANO'};
const noise=n=>{let v=Math.imul(n+17,374761393);v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967296;};
const C={ink:0x304744,grass:0x97a76b,grassLight:0xafb779,grassDark:0x7e9561,path:0xd9c595,pathEdge:0xb49f77,stone:0xa9aa8b,stoneLight:0xc4c1a2,stoneDark:0x797f69,blue:0x407e9a,sea:0x367f96,foam:0xace0c9,cream:0xf1e0b5,white:0xf2edce,wall:0xd9c89e,shadow:0x344e49,roof:0xb97451,roofLight:0xd19261,leaf:0x69855d,leafLight:0x90a46b,leafDark:0x476c55,bark:0x706446};
export function greekArea(scene,config){return !scene.isHideout&&scene.mission.id===1&&Object.hasOwn(GREEK_PATHS,config.zone)?config.zone:null;}
export function buildGreekLayout(area,config){
 if(!Object.hasOwn(GREEK_PATHS,area))throw new Error(`Unknown Greek room: ${area}`);
 const commands=[],occluders=[],roads=[],paths=GREEK_PATHS[area].map(path=>path.map(p=>[...p]));let depth=0;
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=C.white,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const plaque=(x,y,w,label,bg=C.blue)=>{rect(x+3,y+4,w,27,C.shadow,.35);rect(x,y,w,27,bg);rect(x+3,y+3,3,21,C.cream);text(x+w/2,y+14,label,11);};
 const stones=(x,y,w,h)=>{rect(x,y,w,h,C.stoneDark);for(let yy=y;yy<y+h;yy+=14)for(let xx=x;xx<x+w;xx+=25){const offset=(Math.floor((yy-y)/14)%2)*8;rect(xx+1,yy+1,Math.min(22,w-(xx-x)),Math.min(11,h-(yy-y)),(xx+yy)%3?C.stone:C.stoneLight);line(xx+3+offset,yy+3,Math.min(x+w,xx+17),yy+3,C.white,1,.18);}};
 const pot=(x,y,scale=1)=>{rect(x-10*scale,y-14*scale,20*scale,14*scale,C.roof);rect(x-12*scale,y-18*scale,24*scale,5*scale,C.roofLight);ellipse(x,y-23*scale,23*scale,17*scale,C.leafDark);for(const [dx,dy]of[[-6,-26],[5,-30],[8,-21]])rect(x+dx*scale,y+dy*scale,5*scale,5*scale,0xe7b1a1);};
 const olive=(x,y,w,h)=>{
  ellipse(x,y-7,w*.95,22,C.shadow,.19);rect(x-7,y-h*.65,14,h*.65,C.bark);line(x-3,y-12,x-19,y-h*.62,C.bark,7);line(x+1,y-17,x+22,y-h*.68,C.bark,7);
  const cy=y-h*.67;poly([[x-w*.48,cy+6],[x-w*.40,cy-26],[x-w*.15,cy-39],[x+w*.2,cy-36],[x+w*.48,cy-12],[x+w*.43,cy+15],[x+w*.13,cy+28],[x-w*.2,cy+25]],C.leafDark);
  ellipse(x-w*.15,cy-10,w*.6,h*.46,C.leaf);ellipse(x+w*.19,cy-7,w*.46,h*.4,C.leafLight);ellipse(x-w*.14,cy-22,w*.38,h*.28,C.leafLight);
  for(let i=0;i<12;i++){const xx=x-w*.32+(i*19)%(w*.65),yy=cy-22+(i*13)%40;line(xx,yy,xx+7,yy-2,C.cream,2,.27);rect(xx+3,yy+5,3,4,C.ink,.55);}
 };
 const shutter=(x,y,w=34,h=40)=>{rect(x-3,y-3,w+6,h+6,C.cream);rect(x,y,w,h,C.blue);rect(x+w*.46,y,3,h,C.ink);for(let yy=y+5;yy<y+h;yy+=7)line(x+3,yy,x+w-3,yy,C.white,1,.35);};
 const house=(box,label,index=0,military=false)=>{
  const [x,y,w,h]=box,foot=y+h,top=y-46,z=foot+x/10000,face=military?0x9b9d83:C.wall;
  occluders.push({x,y:top,w,h:h+46,depth:z});
  at(z,()=>{
   rect(x,y-12,w,h+12,face);rect(x,foot-9,w,9,C.stoneDark);rect(x+5,y-7,w-10,6,C.white,.3);
   rect(x-2,top,w+4,h-34,military?0x718272:C.roof);rect(x+4,top+5,w-8,h-46,military?0x839483:C.roofLight);
   for(let yy=top+12;yy<foot-80;yy+=13){line(x+4,yy,x+w-4,yy,military?0x51675d:C.roof,3);for(let xx=x+9;xx<x+w-6;xx+=22)line(xx,yy-9,xx,yy,C.white,1,.18);}
   line(x-4,foot-76,x+w+4,foot-76,C.ink,4,.55);rect(x+10,top+9,30,23,military?C.stoneDark:C.cream);rect(x+8,top+7,34,6,military?C.stone:C.white);
   if(military){
    rect(x+w*.28,foot-68,w*.44,59,C.ink);rect(x+w*.28+4,foot-65,w*.44-8,54,0x60766b);for(let yy=foot-60;yy<foot-16;yy+=8)line(x+w*.28+6,yy,x+w*.72-6,yy,C.stoneDark,3);
    text(x+w*.5,foot-37,'0'+(index+1),20,C.cream);rect(x+15,foot-56,32,18,0x456162);rect(x+w-48,foot-56,32,18,0x456162);line(x+31,foot-56,x+31,foot-38,C.ink,3);line(x+w-32,foot-56,x+w-32,foot-38,C.ink,3);
    for(let k=0;k<3;k++)line(x+6+k*9,foot-24,x+12+k*9,foot-12,C.roof,3);plaque(x+w/2-62,foot-90,124,label,0x586e60);
   }else{
    shutter(x+17,foot-62,34,37);shutter(x+w-51,foot-62,34,37);rect(x+w/2-22,foot-61,44,52,C.blue);rect(x+w/2-15,foot-54,30,35,0x35667c);rect(x+w/2+11,foot-34,3,4,C.cream);
    rect(x+w/2-29,foot-10,58,10,C.cream);line(x+w/2-29,foot-5,x+w/2+29,foot-5,C.stoneDark,2);pot(x+22,foot-9,.75);pot(x+w-22,foot-9,.75);
    plaque(x+w/2-57,foot-84,114,label,index?0x6e8872:C.blue);
    if(index===0){rect(x+w-65,top+15,45,24,C.blue);for(let yy=top+18;yy<top+37;yy+=6)rect(x+w-65,yy,45,3,C.white);rect(x+w-65,top+15,19,15,C.blue);rect(x+w-57,top+15,3,15,C.white);rect(x+w-65,top+21,19,3,C.white);}
   }
  });
 };
 const grove=(box,rocky=false)=>{
  const [x,y,w,h]=box,foot=y+h,z=foot+x/10000;occluders.push({x,y:y-18,w,h:h+18,depth:z});
  at(1,()=>{rect(x-7,y-5,w+14,h+12,C.grassDark,.35);});
  at(z,()=>{
   stones(x,y,w,h);rect(x+6,y+6,w-12,h-18,rocky?0x9a9d7e:C.grassDark);
   const treeW=Math.min(w-14,98);olive(x+w/2,y+Math.min(h-9,104),treeW,88);
   if(h>170)olive(x+w/2+3,foot-12,treeW-8,86);
   else if(rocky){poly([[x+8,foot-24],[x+22,foot-47],[x+49,foot-42],[x+61,foot-21]],C.stoneLight);line(x+23,foot-43,x+39,foot-22,C.stoneDark,2);}
  });
 };
 const nearbyPath=(x,y)=>paths.some(path=>path.some(([ax,ay],i)=>{if(!i)return false;const [bx,by]=path[i-1],dx=ax-bx,dy=ay-by,t=Math.max(0,Math.min(1,((x-bx)*dx+(y-by)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-bx-t*dx,y-by-t*dy)<50;}));
 rect(0,0,1280,800,C.sea);
 // Sea and cliff faces stay outside the playable rectangle, never suggesting walkable water.
 for(let y=7;y<50;y+=13)for(let x=15+(y%3)*13;x<1260;x+=80)line(x,y,x+31,y,C.foam,2,.3);
 rect(36,52,1208,717,C.stoneDark);rect(40,55,1200,710,area==='base'?0xa6a58b:C.grass);
 for(let x=43;x<1240;x+=36){poly([[x,765],[x+27,765],[x+21,793],[x+4,784]],C.stone);line(x+7,772,x+10,784,C.stoneLight,3);}
 for(let y=60;y<755;y+=42){poly([[4,y+7],[35,y],[35,y+35],[12,y+30]],C.stone);poly([[1244,y],[1276,y+10],[1270,y+33],[1244,y+35]],C.stone);}
 if(area!=='home'){
  // Fine terrain noise is flat and deterministic; tree trunks occupy only solid islands.
  for(let i=0;i<30;i++){const x=100+noise(i+700)*1080,y=150+noise(i+1300)*540;if(!nearbyPath(x,y))ellipse(x,y,65+noise(i+40)*70,32+noise(i+60)*30,i%2?C.grassLight:C.grassDark,.15);}
  for(let i=0;i<230;i++){const x=Math.round(65+noise(i)*1150),y=Math.round(120+noise(i+300)*610);if(nearbyPath(x,y))continue;
   rect(x,y,9+i%9,3,i%3?C.grassDark:C.grassLight,.45);if(i%4===0){line(x+2,y,x,y-5,C.grassDark,2,.65);line(x+3,y,x+6,y-6,C.grassDark,2,.65);}if(i%13===0){rect(x+7,y-4,3,3,C.cream);rect(x+10,y-8,3,3,0xd7ac7a);}
  }
  for(const width of [84,72])for(const path of paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];line(...a,...b,width===84?C.pathEdge:C.path,width);ellipse(...a,width,width,width===84?C.pathEdge:C.path);ellipse(...b,width,width,width===84?C.pathEdge:C.path);}
  for(const path of paths){
   for(let i=1;i<path.length;i++){const [x,y]=path[i-1],[xx,yy]=path[i],len=Math.hypot(xx-x,yy-y);for(let j=0;j<=len;j+=30){const t=j/len,px=x+(xx-x)*t,py=y+(yy-y)*t;roads.push({x:px-34,y:py-34,w:68,h:68,color:0x8f9a77});line(px-4,py+12,px+6,py+10,C.pathEdge,2,.35);}}
  }
 }
 if(area==='village'||area==='departure'){
  at(1,()=>{rect(190,366,910,67,C.stoneLight,.5);for(let x=200;x<1100;x+=32)line(x,367,x,432,C.stoneDark,1,.25);for(let y=374;y<433;y+=18)line(190,y,1100,y,C.stoneDark,1,.25);});
  config.obstacles.forEach((b,i)=>house(b,area==='village'?(i?'BOTTEGA':'IL VILLAGGIO'):(i?'CAFFÈ':'LA PIAZZA'),i));
  at(2,()=>{rect(570,370,145,66,C.path);text(642,402,area==='departure'?'VERSO FOSSANO':'PLATEIA',14,C.stoneDark);});
  if(area==='departure'){
   at(2,()=>{rect(935,440,258,168,0x939b86);for(let x=945;x<1185;x+=38)rect(x,590,24,5,C.cream);rect(942,449,244,4,C.cream);text(1007,477,'BUS',18,C.cream);});
   at(150,()=>{rect(1018,81,5,65,C.blue);rect(999,70,42,26,C.blue);text(1020,83,'BUS',12);});
  }
 }else if(['olives','ridge','coast'].includes(area)){
  config.obstacles.forEach(b=>grove(b,area!=='olives'));
  // Low, broken terrace stones are ground markings, outside the travelling lanes.
  at(1,()=>{for(let y=145;y<730;y+=190)for(let x=70;x<1200;x+=42)if(!nearbyPath(x,y)&&!config.obstacles.some(([bx,by,bw,bh])=>x>bx-22&&x<bx+bw+22&&y>by-20&&y<by+bh+20)){rect(x,y,23,7,C.stoneDark,.35);rect(x+1,y-2,21,5,C.stoneLight,.65);}});
  if(area==='olives')at(4,()=>{plaque(920,215,165,'VECCHIO DEPOSITO →',0x797d5d);});
  if(area==='coast'){
   at(1,()=>{rect(925,200,190,120,C.stoneLight,.33);for(let x=940;x<1100;x+=30)line(x,207,x,313,C.stoneDark,1,.2);text(1025,227,'BELVEDERE',12,C.stoneDark);});
   at(4,()=>{plaque(1035,89,165,'← MARE / CASA →',C.blue);});
  }
 }else if(area==='base'){
  house(config.obstacles[0],'DEPOSITO A',0,true);house(config.obstacles[1],'DEPOSITO B',1,true);
  const [x,y,w,h]=config.obstacles[2];at(y+h,()=>{rect(x,y,w,h,C.stoneDark);rect(x+4,y+4,w-8,h-8,0x8b9277);for(let xx=x+9;xx<x+w-30;xx+=35){rect(xx,y+10,28,47,0x69785e);rect(xx+4,y+14,20,6,C.stone);rect(xx+5,y+42,18,3,C.cream,.45);}});
  at(2,()=>{rect(100,91,1080,15,C.stoneDark);for(let x=100;x<1180;x+=22){line(x,58,x+23,92,C.stoneLight,2);line(x+23,58,x,92,C.stoneLight,2);}for(let x=100;x<1180;x+=110)rect(x,54,5,52,C.ink);
   for(let x=870;x<1100;x+=25){rect(x,351,14,6,C.pathEdge);line(x,357,x+12,357,C.ink,2,.6);}text(980,379,'DEPOSITO / AREA DISMESSA',12,C.ink);
   line(160,455,1050,455,C.stoneDark,3,.25);for(let x=170;x<1100;x+=91)rect(x,455,27,3,C.cream,.45);
  });
 }else if(area==='home'){
  rect(0,0,1280,800,C.ink);
  rect(40,55,1200,710,0xb69872);
  for(let y=65;y<765;y+=27){line(40,y,1240,y,0x917a5d,2);for(let x=50+((y/27|0)%2)*60;x<1240;x+=135)line(x,y,x,y+25,0x927b5e,1);}
  rect(40,55,1200,61,C.wall);rect(40,110,1200,8,C.cream);rect(40,118,1200,6,C.shadow,.15);
  for(const x of [185,655,1085]){rect(x,62,82,38,C.blue);rect(x+5,66,72,30,C.sea);rect(x+38,65,4,32,C.cream);rect(x+5,81,72,3,C.cream);}
  at(1,()=>{rect(505,374,575,203,0x677d73);rect(513,382,559,187,0xc7ae82);for(let x=524;x<1060;x+=24){rect(x,388,11,5,0x7e9381);rect(x,557,11,5,0x7e9381);}for(let y=400;y<550;y+=28){rect(519,y,6,12,C.blue);rect(1060,y,6,12,C.blue);}text(790,407,'GLI ULTIMI RICORDI',13,0x75694f);});
  const [sofa,bed]=config.obstacles;
  at(sofa[1]+sofa[3],()=>{const [x,y,w,h]=sofa;rect(x,y,w,h,0x556f69);rect(x+9,y+10,w-18,h-24,0x97a38a);rect(x+6,y+6,w-12,18,0xa8b396);for(let i=0;i<3;i++){rect(x+15+i*59,y+30,52,43,0xb2b89b);rect(x+19+i*59,y+33,44,2,C.cream,.6);}rect(x,y,9,h,C.blue);rect(x+w-9,y,9,h,C.blue);});
  at(bed[1]+bed[3],()=>{const [x,y,w,h]=bed;rect(x,y,w,h,0x826e51);rect(x+7,y+7,w-14,h-14,C.cream);rect(x+12,y+12,43,h-24,C.white);rect(x+61,y+8,w-70,h-16,0x70999a);for(let xx=x+69;xx<x+w-15;xx+=21)line(xx,y+12,xx, y+h-12,0x95b5ad,4);rect(x,y,7,h,C.stoneDark);});
  at(120,()=>{rect(555,68,54,33,0x8d7452);rect(560,73,44,23,C.cream);poly([[564,92],[575,79],[586,89],[594,81],[601,92]],C.leaf);});
 }
 // Door floor landings align exactly with authoritative quest portals and minimap targets.
 at(3,()=>{for(const d of config.doors||[]){rect(d.x-43,d.y+6,86,17,C.stoneLight);line(d.x-43,d.y+23,d.x+43,d.y+23,C.stoneDark,3);}});
 at(10,()=>plaque(50,13,Math.min(390,TITLES[area].length*8+14),TITLES[area],area==='base'?0x586e60:C.blue));
 return {area,commands,occluders,roads,paths};
}
export function drawGreekDistrict(scene,config,area){return drawEnvironment(scene,buildGreekLayout(area,config));}
