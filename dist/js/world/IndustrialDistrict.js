import {drawEnvironment} from './EnvironmentArt.js';

/** Each profile corresponds to an existing saved room; no new collision or quest state. */
export const INDUSTRIAL_PROFILES={
 '3:courtyard':['TECH / CENTRO RICERCA','yard','tech','building','building','storage'],
 '3:security':['TECH / CONTROLLO ACCESSI','tile','tech','reception','divider'],
 '3:lab':['TECH / PROTOTIPI','tile','tech','bench','glass','bench'],
 '3:server':['TECH / SALA DATI','metal','tech','server','server','server'],
 '3:dock':['TECH / BAIA DI CARICO','yard','tech','container','storage'],
 '3:escape':['TECH / USCITA DI SERVIZIO','road','tech','building','container'],
 '6:reception':['CARLITOS / ACCOGLIENZA','marble','diamond','reception','glass'],
 '6:production':['CARLITOS / LINEA DI PRODUZIONE','metal','diamond','machine','machine'],
 '6:office':['CARLITOS / UFFICIO','wood','diamond','desk','archive'],
 '6:security':['CARLITOS / CONTROLLO CAVEAU','metal','diamond','console','archive'],
 '6:vault':['CARLITOS / CAVEAU','metal','diamond','vault','vault'],
 '6:alley':['FOSSANO / VICOLO DELLA FABBRICA','road','night','building','building'],
 '6:street':['FOSSANO / VIA DI FUGA','road','night','building','container'],
 '8:workshop':['LUCA / LABORATORIO ARTIGIANALE','tile','luca','bench','tools'],
 '8:store':['LUCA / MAGAZZINO RICAMBI','tile','luca','storage','storage'],
 '8:range':['LUCA / AREA DI COLLAUDO','tile','luca','console','glass'],
 '8:telemetry':['LUCA / TELEMETRIA','tile','luca','console','server'],
 '8:loading':['LUCA / PREPARAZIONE TRASPORTO','yard','luca','container','storage'],
 '8:departure':['FOSSANO / PARTENZA PER ROMA','road','luca','building','storage']
};
const PALETTES={tech:{floor:0x718889,wall:0x344d59,light:0xabc9c4,accent:0x6dcecc,trim:0x537f89},diamond:{floor:0x8f9590,wall:0x485561,light:0xd1cbb4,accent:0xe7c46f,trim:0x6d8187},night:{floor:0x3f505e,wall:0x344355,light:0x8099a7,accent:0xe8b77b,trim:0x5a7182},luca:{floor:0x9a9885,wall:0x59655e,light:0xd9c69e,accent:0xecb96f,trim:0x7f9688}};
const INK=0x26343d,WHITE=0xe9e5cf;
export function industrialArea(scene,config){const id=`${scene.mission.id}:${config.zone}`;return !scene.isHideout&&INDUSTRIAL_PROFILES[id]?id:null;}
export function buildIndustrialLayout(area,config){
 const profile=INDUSTRIAL_PROFILES[area];if(!profile)throw new Error(`Unknown industrial area: ${area}`);
 const [title,material,palette,...fixtures]=profile,P=PALETTES[palette],commands=[],occluders=[],roads=[];let depth=0;
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=WHITE,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const sign=(x,y,w,label)=>{rect(x+3,y+3,w,26,INK,.5);rect(x,y,w,26,P.wall);rect(x,y,5,26,P.accent);text(x+w/2,y+13,label,11);};
 const stripes=(x,y,w)=>{rect(x,y,w,8,INK);for(let i=0;i<w-8;i+=18)poly([[x+i,y],[x+i+8,y],[x+i+14,y+8],[x+i+6,y+8]],P.accent);};
 const monitor=(x,y,w=44,h=28)=>{rect(x+3,y+4,w,h,INK,.3);rect(x,y,w,h,INK);rect(x+4,y+4,w-8,h-8,0x1e535f);for(let i=7;i<h-5;i+=7)line(x+7,y+i,x+w-8-(i%3)*4,y+i,P.accent,2,.8);rect(x+w/2-3,y+h,6,5,INK);};
 const drain=(x,y,w=70)=>{rect(x,y,w,10,INK);for(let i=3;i<w;i+=7)rect(x+i,y+2,3,6,P.light,.6);};
 const crate=(x,y,w,h)=>{rect(x,y,w,h,0x6f6c58);rect(x+3,y+3,w-6,h-6,0xb59b6d);line(x+5,y+5,x+w-5,y+h-5,0x83714f,3);line(x+w-5,y+5,x+5,y+h-5,0x83714f,3);rect(x+w/2-8,y+5,16,6,WHITE,.7);};
 const lamp=(x,y)=>{ellipse(x,y+12,78,38,P.accent,.06);ellipse(x,y+12,40,22,P.accent,.1);at(y+28,()=>{rect(x-3,y-25,6,50,INK);rect(x-12,y-29,24,9,P.light);rect(x-9,y-26,18,3,P.accent);});};
 const outdoor=['yard','road'].includes(material);
 rect(0,0,1280,800,INK);rect(38,52,1204,714,P.floor);
 // Flat floor textures and painted service paths never masquerade as solid objects.
 if(material==='road'){
  rect(40,350,1200,230,palette==='night'?0x293c4d:0x535e66);roads.push({x:40,y:350,w:1200,h:230});
  for(let x=70;x<1230;x+=100)rect(x,463,46,4,P.light,.7);
  for(let x=40;x<1240;x+=40){line(x,320,x,348,P.wall,1);line(x,584,x,620,P.wall,1);}line(40,347,1240,347,P.light,4);line(40,583,1240,583,P.light,4);
  for(let y=370;y<560;y+=30)rect(1060,y,70,12,P.light,.7);
 }else if(material==='wood'){
  rect(40,55,1200,710,0x9e876b);for(let y=58;y<765;y+=24){line(40,y,1240,y,0x766d59,2);for(let x=60+(y%48?70:0);x<1240;x+=145)line(x,y,x,y+24,0x766d59,1);}
 }else{
  const step=material==='metal'?40:64;
  for(let x=40;x<1240;x+=step)for(let y=55;y<765;y+=step){
   if(material==='marble'&&(Math.floor(x/step)+Math.floor(y/step))%2===0)rect(x,y,Math.min(step,1240-x),Math.min(step,765-y),P.light,.2);
   line(x,y,Math.min(x+step,1240),y,P.wall,1,.3);line(x,y,x,Math.min(y+step,765),P.wall,1,.3);
   if(material==='metal'){rect(x+5,y+5,2,2,P.light,.5);rect(x+28,y+26,6,2,P.light,.18);}
  }
 }
 at(1,()=>{
  if(!outdoor){rect(40,55,1200,44,P.wall);rect(40,99,1200,7,P.light);rect(40,106,1200,9,INK,.18);for(let x=100;x<1220;x+=200){rect(x,70,84,8,WHITE);rect(x-8,78,100,15,P.accent,.1);}line(55,750,1220,750,P.trim,6);}
  else{rect(40,55,1200,48,P.wall);for(let x=48;x<1240;x+=24)line(x,60,x,99,P.light,1,.4);line(40,103,1240,103,P.light,3);drain(75,615);drain(1150,330);}
  // Perimeter guide paint leaves the middle open for combat and existing markers.
  line(200,685,1080,685,P.accent,3,.3);line(1080,685,1080,290,P.accent,3,.3);
 });
 for(let i=0;i<config.obstacles.length;i++){
  const [x,y,w,h]=config.obstacles[i],kind=fixtures[i]||'storage',foot=y+h,z=foot+x/10000;
  at(z,()=>{
   // Every bulky prop stays inside its existing collision rectangle.
   rect(x,y,w,h,INK);rect(x+3,y+3,w-6,h-6,P.wall);rect(x+3,foot-16,w-6,13,INK,.35);
   if(kind==='building'||kind==='container'){
    const top=y-38;occluders.push({x,y:top,w,h:h+38,depth:z});
    rect(x,top,w,h-8,P.trim);rect(x+4,top+4,w-8,h-16,P.light);rect(x+7,top+7,w-14,h-22,P.wall,.12);
    rect(x,foot-46,w,46,P.wall);line(x,foot-46,x+w,foot-46,P.light,4);
    if(kind==='building'&&w>150){rect(x+w-74,top+17,54,32,P.trim);ellipse(x+w-47,top+33,23,23,INK);line(x+w-47,top+23,x+w-47,top+43,P.light,3);line(x+w-57,top+33,x+w-37,top+33,P.light,3);line(x+10,top+h-31,x+w-10,top+h-31,P.trim,2,.6);}
    if(kind==='container'){for(let xx=x+10;xx<x+w-5;xx+=15)line(xx,top+5,xx,foot-5,P.wall,3,.4);text(x+w/2,foot-24,'CARGO  /  0'+(i+1),12);}
    else{for(let xx=x+12;xx<x+w-35;xx+=55){rect(xx,foot-34,36,20,INK);rect(xx+3,foot-32,30,8,P.accent,.65);line(xx+18,foot-34,xx+18,foot-14,P.light,2);}rect(x+15,top+14,Math.min(70,w-30),26,P.wall);for(let yy=top+18;yy<top+38;yy+=5)line(x+19,yy,x+Math.min(80,w-14),yy,P.light,2,.5);}
   }else if(kind==='server'){
    for(let yy=y+6;yy<foot-22;yy+=55){rect(x+7,yy,w-14,48,0x2c424c);for(let row=0;row<4;row++){rect(x+12,yy+7+row*9,w-34,4,P.light,.25);rect(x+w-17,yy+7+row*9,4,3,row%2?P.accent:0xd3e49e);}}
    line(x+5,y+3,x+5,foot-5,P.light,3);stripes(x,foot-8,w);
   }else if(kind==='storage'||kind==='archive'){
    for(let yy=y+8;yy<foot-24;yy+=42){rect(x+5,yy+30,w-10,5,P.trim);for(let xx=x+10;xx<x+w-35;xx+=46){if(kind==='archive'){rect(xx,yy,32,29,P.light);line(xx+4,yy+14,xx+28,yy+14,P.wall,2);rect(xx+13,yy+17,9,3,INK);}else crate(xx,yy,34,29);}}
    rect(x+3,y+3,4,h-6,P.light);rect(x+w-7,y+3,4,h-6,P.light);
   }else if(kind==='machine'){
    rect(x+9,y+9,w-18,h-30,P.trim);rect(x+17,y+18,w-34,h-60,0x354a53);for(let xx=x+25;xx<x+w-20;xx+=24)line(xx,y+25,xx,foot-47,P.light,5,.4);
    ellipse(x+w/2,y+h/2,Math.min(w-40,82),Math.min(h-40,70),P.light);ellipse(x+w/2,y+h/2,34,34,INK);ellipse(x+w/2,y+h/2,17,17,P.accent);stripes(x+4,foot-18,w-8);rect(x+w-24,y+15,8,8,P.accent);
   }else if(kind==='vault'){
    for(let xx=x+8;xx<x+w-44;xx+=48){rect(xx,y+8,40,h-30,P.trim);for(let yy=y+14;yy<foot-28;yy+=22){rect(xx+3,yy,34,18,P.light);rect(xx+16,yy+7,10,3,INK);}}
    stripes(x+3,foot-10,w-6);
   }else if(kind==='glass'){
    rect(x+6,y+6,w-12,h-24,0x517d86);rect(x+10,y+10,w-20,h-32,0x8bb8b6,.6);line(x+12,y+12,x+w-22,foot-28,WHITE,3,.35);line(x+35,y+12,x+w-8,foot-30,WHITE,2,.18);for(let xx=x+6;xx<x+w;xx+=60)rect(xx,y+5,4,h-21,P.light);
   }else if(kind==='divider'){
    for(let yy=y+8;yy<foot-20;yy+=42){rect(x+5,yy,w-10,32,0x76a3a4);line(x+7,yy+3,x+w-8,yy+29,WHITE,2,.35);}
   }else{
    rect(x+5,y+5,w-10,h-23,kind==='tools'||kind==='bench'?0xba9d70:P.light);
    if(kind==='bench'||kind==='tools'){
     rect(x+7,y+7,w-14,20,P.wall);for(let xx=x+17;xx<x+w-12;xx+=20){line(xx,y+11,xx,y+23,P.light,3);rect(xx-4,y+10,8,3,P.light);}rect(x+14,y+33,38,12,0x6f8483);line(x+65,y+36,x+87,y+45,INK,4);ellipse(x+w-27,y+40,16,16,P.trim);rect(x+w-28,y+30,3,20,WHITE);
    }else{monitor(x+14,y+9,Math.min(60,w-28),Math.min(30,h-32));for(let xx=x+94;xx<x+w-30;xx+=42){rect(xx,y+14,27,21,WHITE);line(xx+4,y+20,xx+23,y+20,P.trim,2);}}
    for(let xx=x+10;xx<x+w-40;xx+=50){rect(xx,foot-15,40,10,P.trim);rect(xx+14,foot-12,12,2,WHITE);}
   }
  });
 }
 // Maintenance details sit on the perimeter or lie flat; collision routes stay unchanged.
 at(2,()=>{
  for(const [x,y,w,h]of config.obstacles){
   const xx=x-8,yy=y+h+8;line(xx,yy,xx+w+16,yy,P.light,2,.38);line(xx,yy-14,xx,yy,P.light,2,.38);line(xx+w+16,yy-14,xx+w+16,yy,P.light,2,.38);
  }
  if(!outdoor){
   line(60,116,60,660,P.trim,8,.7);line(70,116,70,660,P.light,3,.4);
   for(let y=170;y<660;y+=120){rect(50,y,29,5,INK,.5);ellipse(62,y+35,13,13,P.accent,.8);ellipse(62,y+35,6,6,P.wall);}
   for(let y=180;y<660;y+=155){rect(1195,y,26,58,P.trim);for(let i=0;i<6;i++)line(1199,y+8+i*8,1217,y+8+i*8,P.light,2,.6);}
   // Wall notices are scenery, visually unlike the green quest markers.
   rect(905,63,45,31,P.light);rect(910,68,35,6,P.accent);for(let y=80;y<90;y+=5)line(910,y,939,y,P.wall,2);
   rect(965,63,54,31,P.trim);text(992,78,palette==='luca'?'APE':palette==='diamond'?'D / 06':'R&D',13);
  }
  // Subtle foot traffic, scuffs and repair plates; deterministic across reloads.
  for(let i=0;i<22;i++){const x=145+(i*173)%990,y=235+(i*97)%470;line(x,y,x+8+(i%4)*3,y-2,P.wall,1,.15);}
  for(const [x,y]of[[210,535],[1090,600]]){rect(x,y,36,23,P.wall,.14);for(const dx of [4,30])for(const dy of [4,17])rect(x+dx,y+dy,2,2,P.light,.5);}
 });
 if(config.device?.key==='terminal')at(config.device.y-12,()=>{const {x,y}=config.device;rect(x-22,y-48,44,35,P.trim);monitor(x-25,y-67,50,30);rect(x-24,y-13,48,8,INK);});
 // Room-specific floor details: decorative, flat and separate from active objectives.
 at(2,()=>{
  if(area==='3:server'){for(const [x,y,w,h]of config.obstacles){line(x-16,y-10,x-16,y+h+12,P.accent,3,.6);line(x-16,y+h+12,x+w+12,y+h+12,P.accent,3,.6);}text(640,725,'DATACENTER  /  ACCESSO AUTORIZZATO',13,P.light);}
  if(area==='6:production'){stripes(550,300,180);text(640,330,'TAGLIO  →  CONTROLLO QUALITÀ',12,P.light);rect(540,350,200,44,P.wall,.2);for(let x=545;x<735;x+=12)line(x,355,x,390,P.light,3,.25);}
  if(area==='6:vault'){rect(570,355,150,125,P.wall,.28);for(let x=580;x<720;x+=20)line(x,360,x,475,P.light,2,.2);text(645,415,'AREA BLINDATA',13,P.light);}
  if(area==='8:range'){for(const y of [360,520,660]){line(530,y,1130,y,P.accent,2,.4);for(let x=540;x<1120;x+=80)line(x,y-5,x,y+5,P.light,2,.7);}text(650,710,'PISTA APE  /  TEST DI VOLO',13,P.wall);}
  if(area==='8:workshop'){rect(930,370,210,180,P.trim,.17);text(1035,520,'BANCO PROTOTIPO',13,P.wall);}
  if(area==='8:telemetry'){for(let x=500;x<740;x+=28)rect(x,345,14,4,P.trim,.4);text(620,370,'ANALISI DATI',14,P.wall);}
  if(outdoor&&material!=='road'){for(let y=595;y<675;y+=36){line(750,y,1000,y,P.light,3,.65);line(1000,y,1000,y+26,P.light,3,.65);}stripes(1030,315,130);text(885,570,'CARICO / SCARICO',13,P.light);}
 });
 if(outdoor)for(const [x,y]of[[65,300],[1210,300],[65,650],[1210,720]])lamp(x,y);
 at(8,()=>{
  sign(55,116,Math.min(340,title.length*8+22),title);
  // Existing portals retain their authoritative state and labels; a recessed floor marks each arrival.
  for(const d of config.doors||[]){rect(d.x-34,d.y-12,68,36,P.wall,.45);line(d.x-34,d.y+25,d.x+34,d.y+25,P.accent,4);}
 });
 return {area,commands,occluders,roads};
}
export function drawIndustrialDistrict(scene,config,area){return drawEnvironment(scene,buildIndustrialLayout(area,config));}
