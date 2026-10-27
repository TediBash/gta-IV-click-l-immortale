import {drawEnvironment} from './EnvironmentArt.js';
/** Original, pixel-aligned environment art. Decoration never changes saved geometry. */
const C={ink:0x28383e,shadow:0x243038,road:0x54565e,roadLight:0x5d6067,walk:0xc3baa3,grout:0xa69e8c,cream:0xd6bb75,creamLight:0xe9d296,brick:0xa66e58,teal:0x527a78,mint:0x92c8ad,pink:0xd992ab,yellow:0xe6c56c,white:0xeee3c6,metal:0x7f9290,glass:0x749ea8,green:0x64735a};

export function fossanoArea(scene,config,index){
 if(scene.isHideout||scene.mission.id!==2)return null;
 if(index===0&&!config.zone)return 'forecourt';
 if(index===1&&['street','workshop','depot'].includes(config.zone))return config.zone;
 return null;
}

/** The same primitives can be inspected offline; Phaser remains the runtime renderer. */
export function buildFossanoLayout(area,config){
 const commands=[],occluders=[],roads=[];
 let depth=0;
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=C.white,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const panel=(x,y,w,h,label,color=C.teal)=>{rect(x+3,y+4,w,h,C.ink);rect(x,y,w,h,color);rect(x+3,y+3,w-6,2,C.white,.35);text(x+w/2,y+h/2,label,Math.min(15,h*.43));};
 const slabs=(x,y,w,h,step=40)=>{rect(x,y,w,h,C.walk);for(let xx=x;xx<x+w;xx+=step)line(xx,y,xx,y+h,C.grout,1);for(let yy=y;yy<y+h;yy+=step)line(x,yy,x+w,yy,C.grout,1);};
 const asphalt=(x,y,w,h)=>{rect(x,y,w,h,C.road);for(let i=0;i<180;i++){const px=x+(i*157%Math.max(1,w-4)),py=y+(i*89%Math.max(1,h-4));rect(px,py,2+(i%3),1,i%2?0x72747b:0x3d444b,.23);}roads.push({x,y,w,h});};
 const drain=(x,y)=>{rect(x,y,32,16,C.ink);for(let i=3;i<29;i+=5)rect(x+i,y+2,2,12,C.metal);};
 const crack=(x,y)=>{line(x,y,x+9,y+5,0x6c7269,1);line(x+9,y+5,x+5,y+13,0x6c7269,1);line(x+9,y+5,x+17,y+2,0x6c7269,1);};
 const weeds=(x,y)=>{line(x,y,x-4,y-9,C.green,2);line(x,y,x+5,y-6,0x8e9b70,2);line(x,y,x,y-12,0x818c64,2);};
 const hazard=(x,y,w,h)=>{rect(x,y,w,h,C.ink);for(let dx=0;dx<w-4;dx+=16)rect(x+dx,y,7,h,C.yellow);};
 const window=(x,y,w=28,h=30)=>{rect(x-3,y-3,w+6,h+7,0x715f4d);rect(x,y,w,h,C.glass);rect(x+3,y+2,5,h-6,0xc4dbd4);line(x+w/2,y,x+w/2,y+h,C.creamLight,2);rect(x-4,y+h,w+8,4,C.white);};
 const shutter=(x,y,w,h)=>{rect(x,y,w,h,C.ink);rect(x+5,y+5,w-10,h-8,0x7e8a8d);for(let yy=y+8;yy<y+h-6;yy+=7)line(x+6,yy,x+w-6,yy,0x53636a,2);rect(x+w/2-12,y+h-13,24,3,C.ink);};
 const roofUnit=(x,y,w=44)=>{rect(x+5,y+5,w,29,C.ink,.25);rect(x,y,w,26,0xa4a9a0);rect(x+3,y+3,w-6,20,0x6b7a7d);for(let i=6;i<w-5;i+=6)line(x+i,y+5,x+i,y+20,0xc5c8b9,2);};
 const rooftopTank=(x,y)=>{ellipse(x+8,y+47,68,23,C.ink,.22);for(const dx of [-21,21]){rect(x+dx,y+17,4,33,C.ink);line(x+dx,y+22,x-dx,y+45,C.metal,2);}rect(x-27,y-21,54,49,0x8a9b98);ellipse(x,y+27,54,15,0x4e676d);ellipse(x,y-21,54,18,0xb6bba7);rect(x-24,y-17,8,41,0xc4c8ae);line(x-27,y+4,x+27,y+4,0x5b7376,3);line(x-27,y+20,x+27,y+20,0x5b7376,3);rect(x-3,y-34,6,9,C.ink);};
 const billboard=(x,y,w,label,color)=>{rect(x+5,y+6,w,38,C.ink,.3);rect(x,y,w,36,C.creamLight);rect(x+4,y+4,w-8,28,color);text(x+w*.64,y+18,label,10);rect(x+9,y+15,25,9,C.yellow);rect(x+14,y+10,14,6,C.yellow);ellipse(x+14,y+25,8,8,C.ink);ellipse(x+30,y+25,8,8,C.ink);};
 const facade=(b,label,color,garageX=null)=>{
  const [x,y,w,h]=b,foot=y+h,z=foot+x/10000,roofY=Math.max(6,y-58),roofH=h*.25+6;
  at(z,()=>{
   rect(x+9,y+8,w,h+5,C.shadow,.28);rect(x,y,w,h,color);rect(x,y,w,8,C.creamLight);rect(x,foot-12,w,12,C.ink);rect(x+4,foot-11,w-8,5,0x8c826b);
   for(let xx=x+20;xx<x+w-25;xx+=53)window(xx,y+h*.25+8,26,h<130?12:28);
   const signY=foot-(h<130?52:65);panel(x+12,signY,w-24,h<130?18:25,label,area==='depot'?0x7b6759:C.teal);
   if(garageX!==null){const gx=garageX-62;rect(gx-6,foot-33,136,38,C.creamLight);rect(gx,foot-29,124,30,C.ink);hazard(gx-5,foot-29,5,29);hazard(gx+124,foot-29,5,29);}
   else shutter(x+w*.3,foot-34,w*.4,28);
   for(let xx=x+10;xx<x+w-5;xx+=22){rect(xx,foot-19,11,2,0x655c50,.32);}
   // Exposed masonry, rain pipe and modest wear on the frontage.
   for(let row=0;row<3;row++)for(let col=0;col<3;col++)rect(x+8+col*12+(row%2)*5,foot-42+row*5,9,3,0x9d785b,.35);
   rect(x+w-9,y+roofH,4,h-roofH-12,0x716e62);rect(x+w-12,foot-17,8,4,C.ink);
   rect(x-4,roofY,w+8,roofH+55,0x5a6264);rect(x,roofY+4,w,roofH+45,0x939081);rect(x+7,roofY+11,w-14,roofH+30,0xaaa18b);
   for(let yy=roofY+16;yy<roofY+roofH+35;yy+=17)line(x+8,yy,x+w-8,yy,0x8e8775,1);
   rect(x-5,roofY+roofH+45,w+10,8,C.ink);rect(x-5,roofY+roofH+44,w+10,3,C.creamLight);
   roofUnit(x+20,roofY+20,Math.min(52,w*.25));if(w>220)roofUnit(x+w-70,roofY+24,40);
   rect(x+w*.45,roofY+14,22,29,0x6b6359);rect(x+w*.45+3,roofY+12,16,5,C.white);
  });
  occluders.push({depth:z,x:x-8,y:roofY,w:w+16,h:foot-roofY});
 };
 const lamp=(x,y)=>at(y,()=>{ellipse(x+6,y+3,28,9,C.ink,.22);rect(x-5,y-5,10,6,C.ink);rect(x-2,y-70,4,66,C.ink);rect(x-10,y-76,20,5,C.ink);rect(x-8,y-72,16,10,0xf4d895);rect(x-12,y-77,24,3,C.metal);});
 const crate=(x,y,w=44,h=38)=>{rect(x+4,y+4,w,h,C.ink,.22);rect(x,y,w,h,0x9d7954);rect(x+3,y+3,w-6,h-6,0xbb9565);line(x+4,y+5,x+w-5,y+h-5,0x7d664d,3);rect(x+4,y+9,w-8,3,0xd7b481);rect(x+4,y+h-12,w-8,3,0x725d47);};
 const drum=(x,y,color=C.teal)=>{rect(x-13,y-26,26,30,C.ink);rect(x-11,y-23,22,25,color);ellipse(x,y-24,24,9,0xa7b2a0);line(x-10,y-14,x+10,y-14,C.ink,2);line(x-10,y-4,x+10,y-4,C.ink,2);};
 const toolbench=(x,y,w,h,color=C.teal)=>{
  rect(x+5,y+5,w,h,C.shadow,.25);rect(x,y,w,h,C.ink);rect(x+3,y+4,w-6,h-7,color);rect(x-3,y-5,w+6,10,0xc1b092);
  for(let xx=x+9;xx<x+w-12;xx+=30){rect(xx,y+15,23,2,C.ink);rect(xx+7,y+10,9,2,C.white);}
  rect(x+8,y-16,18,9,0x6e7675);rect(x+w-30,y-18,16,13,C.pink);
 };
 const tire=(x,y)=>{ellipse(x+3,y+2,32,17,C.shadow,.28);ellipse(x,y-7,30,22,C.ink);ellipse(x,y-10,28,17,0x59626a);ellipse(x,y-10,16,9,0x202d35);line(x-13,y-2,x+13,y-2,0x7e8785,2);};
 const floorMark=(x,y,w,h,color=C.yellow)=>{line(x,y,x+w,y,color,3);line(x,y,x,y+h,color,3);line(x+w,y,x+w,y+h,color,3);};
 const floorLabel=(x,y,label)=>text(x,y,label,13,0xd8d0b8);
 const pegboard=(x,y,w)=>{rect(x,y,w,35,0x978568);for(let yy=y+5;yy<y+32;yy+=8)for(let xx=x+5;xx<x+w-3;xx+=9)rect(xx,yy,1,1,0x524e43);for(let xx=x+9;xx<x+w-10;xx+=23){rect(xx,y+9,3,19,0xc5c9ba);rect(xx-3,y+6,9,5,C.ink);rect(xx+8,y+13,4,15,C.pink);}};
 const pavementDetails=()=>{at(2,()=>{for(const [x,y]of[[95,355],[500,310],[756,348],[1220,690],[375,720],[64,674]]){crack(x,y);weeds(x+12,y+3);}drain(470,365);drain(860,625);ellipse(640,465,34,22,0x39444b);ellipse(640,464,26,15,0x727b7e);for(let i=-7;i<=7;i+=7)line(632,464+i/2,648,464+i/2,C.ink,1);});};

 if(area==='street'){
  rect(0,0,1280,800,0x8d9782);slabs(30,55,1220,320);slabs(30,628,1220,145);asphalt(30,380,1220,240);
  rect(30,373,1220,7,C.white);rect(30,620,1220,8,0x8e8e83);rect(30,628,1220,4,C.white);
  for(let x=55;x<1240;x+=92)rect(x,498,44,4,C.white);
  for(let y=390;y<610;y+=27)rect(755,y,88,14,C.white);
  for(const x of [300,1030]){rect(x-79,280,158,100,0xa49d90);for(let xx=x-74;xx<x+76;xx+=25)line(xx,281,xx,370,0x8e877b,1);rect(x-82,372,164,8,0xa6a69b);}
  // A right-hand bend makes the circuit exit at y=660 part of the road network.
  asphalt(1090,550,160,200);rect(1083,628,7,122,C.white);rect(1090,750,160,5,C.white);
  for(const x of [150,270,390,510,630,875])floorMark(x,650,90,60,0xe2d9bd);
  floorLabel(980,725,'CIRCUITO  →');floorLabel(470,584,'VIA DELLE OFFICINE');pavementDetails();
  facade(config.obstacles[0],'SPIT CUSTOMS',C.cream,300);facade(config.obstacles[1],'DEPOSITO  /  AUTO',C.brick,1030);facade(config.obstacles[2],'RICAMBI',0x9cab93);
  at(280.013,()=>{rooftopTank(251,85);billboard(296,108,150,'SPIT  CUSTOMS',0x6c7e8f);});
  at(280.085,()=>{billboard(888,102,160,'AUTO  /  RICAMBI',0x937566);rect(1134,88,21,48,0x788c87);for(let y=91;y<133;y+=6)rect(1137,y,15,2,0xb4bfad);});
  at(282,()=>{panel(177,291,90,22,'MECCANICA',0x5b7b7b);panel(367,291,80,22,'VERNICE',0x95677d);for(const x of [142,162,458])tire(x,290);drum(886,303);drum(916,303);});
  at(241,()=>{panel(575,242,110,22,'DAL 1986',0x8d6655);});
  for(const [x,y]of[[70,357],[524,352],[1220,350],[65,732],[1015,733]])lamp(x,y);
  at(780,()=>{rect(30,781,1220,19,C.brick);rect(30,777,1220,5,C.white);for(let x=40;x<1250;x+=36)line(x,783,x,800,0x775044,2);});
  at(900,()=>panel(45,9,330,27,'FOSSANO  /  VIA DELLE OFFICINE',0x314b50));
 }else if(area==='workshop'){
  rect(0,0,1280,800,0x283b40);rect(90,115,1100,600,0x82877d);
  for(let x=90;x<1190;x+=48)line(x,115,x,715,0x686f6b,1);
  for(let y=115;y<715;y+=48)line(90,y,1190,y,0x686f6b,1);
  // Pale working bays frame the car lane without introducing new solid geometry.
  rect(120,235,445,130,0x9d9e8a);rect(120,520,170,130,0x9d9e8a);rect(930,160,160,190,0xd0d5bb);
  floorMark(335,300,470,330);floorLabel(565,598,'CORSIA DI MANOVRA');
  line(620,680,620,625,C.yellow,4);poly([[620,615],[611,632],[629,632]],C.yellow);
  for(const [x,y,w,h]of config.obstacles){at(y+h,()=>{rect(x+4,y+6,w,h,C.shadow,.24);rect(x,y,w,h,0x465c60);rect(x,y,w,5,0xb7b5a0);rect(x,y+h-5,w,5,0x33484e);});}
  // Furniture is anchored to the existing three collision benches.
  at(216,()=>{toolbench(140,150,110,65);toolbench(450,150,110,65,0x71615f);panel(135,120,120,20,'01  MOTORE',0x466d70);panel(445,120,120,20,'02  GOMME',0x466d70);tire(470,175);tire(510,175);rect(172,156,42,24,0x929f9a);for(let x=177;x<211;x+=8)rect(x,151,4,18,C.ink);rect(164,166,8,9,C.creamLight);});
  at(506,()=>{toolbench(140,440,110,65,0x976c83);panel(130,402,130,22,'03  VERNICE',0x84647e);for(let x=153;x<236;x+=24){rect(x,429,16,15,x%2?C.mint:C.pink);rect(x-1,427,18,3,C.white);}});
  at(117,()=>{rect(300,82,540,28,0x1f363f);text(570,96,'SPIT CUSTOMS  /  LABORATORIO',18,C.creamLight);pegboard(300,119,135);pegboard(590,119,220);roofUnit(1130,58,42);});
  // The lift is painted on the floor: its arms cannot block the vehicle or companions.
  at(2,()=>{rect(590,300,10,110,0x536e78);rect(700,300,10,110,0x536e78);rect(590,318,120,7,0x9fb9ae);rect(590,390,120,7,0x9fb9ae);ellipse(670,480,80,25,0x454f50,.22);ellipse(320,330,40,13,0x454f50,.25);hazard(920,373,180,7);floorLabel(1010,420,'FORNO  /  INGRESSO');for(const [x,y]of[[270,200],[310,400],[750,280],[850,650]]){crack(x,y);for(let i=0;i<4;i++)rect(x+i*7,y+16,4,2,0x454f50,.25);}drain(1128,470);drain(1128,650);});
  at(382,()=>{rect(895,135,230,7,C.white);panel(918,112,180,22,'SPIT  /  COLOR LAB',0x8c6282);for(let y=170;y<340;y+=40){rect(905,y,8,18,0xe9e3c1);rect(1105,y,8,18,0xe9e3c1);}});
  at(2,()=>{rect(551,692,138,25,0xa6a68f);hazard(551,716,138,5);floorLabel(620,757,'USCITA  /  FOSSANO');});
 }else if(area==='depot'){
  rect(0,0,1280,800,0x737c70);asphalt(40,65,1200,690);
  for(let x=65;x<1200;x+=94)floorMark(x,95,76,115,0xada98e);
  for(const [x,y,w,h]of config.obstacles){at(y+h,()=>{rect(x+6,y+7,w,h,C.shadow,.3);rect(x,y,w,h,0x716f61);rect(x,y,w,7,C.creamLight);rect(x+8,y+14,w-16,h-25,0x5e7e7b);for(let xx=x+16;xx<x+w-8;xx+=14)line(xx,y+16,xx,y+h-13,0x91a5a0,3);panel(x+10,y+24,w-20,22,'RICAMBI',0x3c555c);});}
  at(2,()=>{rect(982,350,155,140,0x727b77);floorMark(975,340,170,155,C.yellow);text(1060,515,'AUTO DA RECUPERARE',13,C.creamLight);for(let y=510;y<630;y+=26)rect(142,y,5,12,C.yellow);line(130,650,240,650,C.yellow,3);poly([[125,650],[143,641],[143,659]],C.yellow);});
  at(3,()=>{for(let x=72;x<1220;x+=26){line(x,66,x+28,110,0x9ba49a,1);line(x,110,x+28,66,0x9ba49a,1);}line(60,65,1220,65,C.ink,4);line(60,111,1220,111,C.ink,3);});
  at(6,()=>{panel(70,118,225,28,'DEPOSITO  /  ACCESSO RISERVATO',0x866d58);panel(60,587,150,23,'←  VIA DELLE OFFICINE',C.teal);});
  // All stacks are confined to already-solid storage footprints.
  at(282,()=>{crate(379,214,53,42);crate(441,214,53,42);});
  at(322,()=>{drum(870,282);drum(900,282);});
  at(532,()=>{tire(650,470);tire(690,470);tire(731,470);});
  for(const [x,y]of[[60,125],[1220,125],[1210,740]])lamp(x,y);
  at(2,()=>{for(const [x,y]of[[80,270],[1200,560],[450,730]]){weeds(x,y);crack(x+10,y+5);}drain(1100,690);});
 }else if(area==='forecourt'){
  rect(0,0,1280,800,0x909c83);asphalt(40,310,1200,370);slabs(40,680,1200,95);slabs(40,275,1200,35);
  rect(40,680,1200,5,C.white);for(let x=65;x<1230;x+=94)rect(x,640,43,4,C.white);
  facade(config.obstacles[0],'SPIT CUSTOMS',C.cream,450);
  // Existing low obstacles become storage and a small service building.
  const b=config.obstacles[1];at(b[1]+b[3],()=>toolbench(...b));
  facade(config.obstacles[2],'RICAMBI',0x9cab93);
  at(2,()=>{floorMark(385,325,160,100);floorLabel(460,447,'SPIT CUSTOMS');for(let y=515;y<630;y+=25)rect(1040,y,90,12,C.white);drain(780,680);});
  at(281,()=>{panel(350,282,100,21,'CARROZZERIA',0x5b7b7b);tire(520,300);tire(550,300);});
  at(3,()=>{rect(240,320,102,65,0xc2b695);text(290,329,'BANCO DI SPIT',11,C.ink);});
  for(const [x,y]of[[70,290],[1230,290],[75,745],[1200,745]])lamp(x,y);
  at(2,()=>{floorLabel(1100,710,'DEPOSITO  ↑');for(const [x,y]of[[110,715],[700,710],[1220,405]])weeds(x,y);});
  at(900,()=>panel(45,12,300,28,'FOSSANO  /  SPIT CUSTOMS',0x314b50));
 }
 return {area,commands,occluders,roads};
}

export function drawFossanoDistrict(scene,config,area){return drawEnvironment(scene,buildFossanoLayout(area,config));}
