import {drawEnvironment} from './EnvironmentArt.js';

/** Original civic/villa scenery. Gameplay geometry and saved room state remain authoritative. */
export const CIVIL_PROFILES={
 '4:forecourt':['VILLA / LA CONSEGNA','garden','garageFront','manor'],
 '4:gatehouse':['VILLA / CANCELLO E GIARDINI','garden','lodge','fountain'],
 '4:hall':['VILLA / SALONE E GALLERIA','marble','sofa','sofa'],
 '4:bedroom':['VILLA / CAMERA DEGLI OSPITI','wood','bed','desk'],
 '4:study':['VILLA / STUDIO RISERVATO','wood','desk','sofa'],
 '4:garage':['VILLA / GARAGE PRIVATO','concrete','lift','tools'],
 '4:driveway':['VILLA / IL VIALE DI USCITA','garden','manor','garden'],
 '7:square':['ASSOCIAZIONE / LA PIAZZA','plaza','civic','fountain'],
 '7:assembly':['ASSOCIAZIONE / SALA RIUNIONI','wood','podium','seats'],
 '7:archive':['ASSOCIAZIONE / ARCHIVIO DIGITALE','tile','computers','desk'],
 '7:records':['ASSOCIAZIONE / DEPOSITO DOCUMENTI','tile','records','records'],
 '7:alley':['CITTÀ / IL VICOLO SUL RETRO','night','townhouse','arcade'],
 '7:pickup':['CITTÀ / PUNTO DI RECUPERO','night','townhouse','storage']
};
export const CIVIL_PATHS={
 '4:forecourt':[[[100,700],[150,650],[570,650],[670,560],[1120,470]]],
 '4:gatehouse':[[[100,700],[160,650],[250,590],[640,490],[1000,430],[1130,300]]],
 '4:driveway':[[[100,700],[160,650],[570,590],[1050,540],[1140,680]],[[570,590],[620,330],[1040,200]]],
 '7:square':[[[150,650],[600,600],[650,350],[650,240],[1120,200]]],
 '7:alley':[[[100,700],[160,650],[620,620],[650,330],[1120,180]]],
 '7:pickup':[[[100,700],[160,650],[620,620],[650,330],[1120,180]],[[620,620],[1050,600],[1050,480]]]
};
const C={ink:0x293e46,cream:0xe4d3ac,light:0xf0e4c5,gold:0xc5a263,wood:0x9f7d60,woodDark:0x715b4c,green:0x6d8561,leaf:0x527660,leafLight:0x8b9e73,blue:0x668d99,stone:0xb5b09b,brick:0x9d7765};
const random=n=>{let x=Math.imul(n+31,374761393);x=Math.imul(x^(x>>>13),1274126177);return ((x^(x>>>16))>>>0)/4294967296;};
export function civilArea(scene,config){const key=`${scene.mission.id}:${config.zone}`;return !scene.isHideout&&CIVIL_PROFILES[key]?key:null;}
export function buildCivilLayout(area,config){
 const profile=CIVIL_PROFILES[area];if(!profile)throw new Error(`Unknown civic room: ${area}`);
 const [title,material,...fixtures]=profile,villa=area.startsWith('4:'),night=material==='night',outdoor=['garden','plaza','night'].includes(material),accent=villa?C.gold:0x83b2ac;
 const commands=[],occluders=[],roads=[],paths=(CIVIL_PATHS[area]||[]).map(p=>p.map(v=>[...v]));let depth=0;
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=C.light,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const plaque=(x,y,w,label,bg=C.ink)=>{rect(x+3,y+3,w,25,C.ink,.3);rect(x,y,w,25,bg);rect(x,y,4,25,accent);text(x+w/2,y+13,label,11);};
 const rug=(x,y,w,h)=>{rect(x,y,w,h,villa?0x806569:0x5c7c79);rect(x+7,y+7,w-14,h-14,accent);rect(x+11,y+11,w-22,h-22,villa?0x9b7977:0x72968d);for(let xx=x+17;xx<x+w-20;xx+=25){rect(xx,y+15,9,4,C.light,.5);rect(xx,y+h-19,9,4,C.light,.5);}poly([[x+w/2,y+h/2-27],[x+w/2+40,y+h/2],[x+w/2,y+h/2+27],[x+w/2-40,y+h/2]],accent,.4);};
 const monitor=(x,y,w=42)=>{rect(x,y,w,29,C.ink);rect(x+4,y+4,w-8,20,C.blue);for(let yy=y+8;yy<y+23;yy+=6)line(x+7,yy,x+w-10,yy,0xb3d6c0,2,.65);rect(x+w/2-3,y+29,6,7,C.ink);rect(x+w/2-10,y+35,20,3,C.ink);};
 const paper=(x,y)=>{rect(x+2,y+2,25,18,C.ink,.2);rect(x,y,25,18,C.light);for(let i=0;i<3;i++)line(x+4,y+5+i*4,x+20-i*3,y+5+i*4,C.woodDark,1,.5);};
 const shrub=(x,y,w,h)=>{rect(x,y,w,h,C.leaf);rect(x+3,y+3,w-6,h-6,C.leafLight);for(let i=0;i<20;i++){const xx=x+6+random(i+Math.floor(x))*Math.max(1,w-15),yy=y+6+random(i+Math.floor(y))*Math.max(1,h-15);rect(xx,yy,6,3,C.leaf,.65);}};
 const lamp=(x,y)=>{at(1,()=>{ellipse(x,y-4,100,56,0xf2c987,night?.13:.05);ellipse(x,y-4,50,28,0xf2c987,night?.1:.03);});at(y+5,()=>{ellipse(x,y,22,9,C.ink,.3);rect(x-3,y-62,6,62,C.ink);rect(x-11,y-69,22,16,C.ink);rect(x-7,y-67,14,10,0xf2d39f);poly([[x-15,y-70],[x,y-79],[x+15,y-70]],C.ink);});};
 const tile=(x,y,w,h,size=48)=>{for(let xx=x;xx<x+w;xx+=size)line(xx,y,xx,y+h,C.ink,1,.13);for(let yy=y;yy<y+h;yy+=size)line(x,yy,x+w,yy,C.ink,1,.13);};
 const facade=(b,kind,index)=>{const [x,y,w,h]=b,foot=y+h,top=y-35,z=foot+x/10000;occluders.push({x,y:top,w,h:h+35,depth:z});at(z,()=>{
  const face=night?0x697b83:kind==='civic'?0xb9b7a2:C.cream,roof=night?0x455c6b:kind==='garageFront'?0x7d8c7d:0x9d7a69;
  rect(x,y,w,h,face);rect(x,foot-9,w,9,night?C.ink:C.stone);rect(x-3,top,w+6,h-32,roof);rect(x+4,top+5,w-8,h-43,night?0x617783:0xb4937b);
  for(let yy=top+12;yy<foot-77;yy+=12)line(x+4,yy,x+w-4,yy,roof,3);rect(x-5,foot-72,w+10,8,night?0x8b9c9e:C.light);
  for(const xx of [x+5,x+w-14]){rect(xx,foot-63,9,54,night?0x859898:C.light);rect(xx-2,foot-64,13,5,C.stone);}
  if(kind==='garageFront'||kind==='arcade'){
   const gw=Math.min(w-50,140);rect(x+w/2-gw/2,foot-63,gw,54,C.ink);rect(x+w/2-gw/2+4,foot-60,gw-8,48,night?0x596e77:0x85928a);for(let yy=foot-55;yy<foot-14;yy+=7)line(x+w/2-gw/2+6,yy,x+w/2+gw/2-6,yy,C.ink,2,.4);
  }else{
   rect(x+w/2-20,foot-61,40,52,C.woodDark);rect(x+w/2-13,foot-55,26,42,night?0x4a6673:0x8c7961);rect(x+w/2+9,foot-33,3,4,accent);
   for(const xx of [x+23,x+w-61]){rect(xx-3,foot-59,41,35,C.stone);rect(xx,foot-57,35,29,C.ink);rect(xx+3,foot-54,29,23,night?0xb7ab82:C.blue);line(xx+17,foot-55,xx+17,foot-29,C.light,2);line(xx+2,foot-42,xx+33,foot-42,C.light,2);}
  }
  rect(x+w/2-33,foot-7,66,7,C.light);plaque(x+w/2-66,foot-97,132,kind==='civic'?'ASSOCIAZIONE':kind==='garageFront'?'CONSEGNE':kind==='arcade'?'SERVIZI':kind==='townhouse'?'VIA DELLE CARTE':kind==='lodge'?'PORTINERIA':'VILLA / PRIVATO',night?0x354e5b:0x5f7269);
  rect(x+15,top+10,39,23,night?0x72828b:C.cream);rect(x+12,top+8,45,5,C.stone);
  if(kind==='manor'||kind==='civic'){rect(x+w-74,top+14,51,30,0x617d83);for(let i=1;i<4;i++)line(x+w-74+i*12,top+14,x+w-74+i*12,top+44,C.stone,2);}
 });};
 rect(0,0,1280,800,night?0x203944:C.ink);rect(40,55,1200,710,material==='garden'?0x8f9c75:material==='wood'?0xb49a7a:night?0x566d76:material==='concrete'?0x9a9f93:0xc6c5b0);
 if(material==='wood'){
  for(let y=60;y<765;y+=24){line(40,y,1240,y,C.woodDark,1,.35);for(let x=48+((y/24|0)%2)*65;x<1240;x+=140)line(x,y,x,Math.min(y+24,765),C.woodDark,1,.3);}
 }else if(material==='marble'){
  for(let y=55;y<765;y+=54)for(let x=40;x<1240;x+=54){rect(x+1,y+1,Math.min(52,1240-x),Math.min(52,765-y),((x-40)/54+(y-55)/54)%2?0xe1dac2:0xc3c4b3);line(Math.min(x+9,1240),Math.min(y+14,765),Math.min(x+37,1240),Math.min(y+32,765),C.light,1,.3);}
 }else if(material==='garden'){
  for(let i=0;i<180;i++){const x=60+random(i)*1150,y=80+random(i+290)*670;rect(x,y,9,3,i%3?C.leaf:C.light,.2);}
 }else tile(40,55,1200,710,material==='plaza'?36:48);
 if(outdoor){
  const road=night?0x354c59:material==='garden'?0xbbb6a1:0xd2c7a8;
  for(const width of [96,82])for(const path of paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];line(...a,...b,width===96?C.stone:road,width);ellipse(...a,width,width,width===96?C.stone:road);ellipse(...b,width,width,width===96?C.stone:road);}
  for(const path of paths)for(let i=1;i<path.length;i++){const [x,y]=path[i-1],[xx,yy]=path[i],len=Math.hypot(xx-x,yy-y);for(let d=0;d<=len;d+=32){const px=x+(xx-x)*d/len,py=y+(yy-y)*d/len;roads.push({x:px-40,y:py-40,w:80,h:80,color:night?0x66848e:0x959b82});}}
  // Boundary planting and railings stay outside the playable area.
  at(2,()=>{for(let x=45;x<1230;x+=70){if(material==='garden'){shrub(x,55,57,25);rect(x+4,72,4,3,0xd8ab9c);}else{rect(x,55,58,22,night?0x71858a:C.stone);line(x+4,59,x+54,59,C.light,2,.35);}}});
 }else{
  at(1,()=>{rect(40,55,1200,54,villa?C.cream:0xa0b5a9);rect(40,109,1200,7,accent);rect(40,116,1200,7,C.ink,.12);line(55,746,1225,746,accent,5,.55);
   for(let x=120;x<1200;x+=230){rect(x,65,73,34,C.woodDark);rect(x+5,70,63,24,C.light);if(villa)poly([[x+9,90],[x+25,75],[x+42,88],[x+55,78],[x+63,90]],C.green);else{rect(x+9,75,54,4,accent);for(let y=83;y<92;y+=5)line(x+9,y,x+55,y,C.ink,1,.5);}}
   for(let y=175;y<710;y+=160){rect(47,y,10,34,accent);rect(1223,y,10,34,accent);ellipse(62,y+17,29,51,C.light,.1);ellipse(1215,y+17,29,51,C.light,.1);}
  });
 }
 for(let i=0;i<config.obstacles.length;i++){
  const b=config.obstacles[i],[x,y,w,h]=b,foot=y+h,kind=fixtures[i],z=foot+x/10000;
  if(['manor','lodge','garageFront','civic','townhouse','arcade'].includes(kind)){facade(b,kind,i);continue;}
  at(z,()=>{
   rect(x,y,w,h,C.ink);rect(x+3,y+3,w-6,h-6,C.woodDark);rect(x+4,foot-9,w-8,5,C.ink,.4);
   if(kind==='sofa'||kind==='seats'){
    rect(x+6,y+5,w-12,h-15,villa?0x798777:0x6b9390);rect(x+10,y+7,w-20,16,villa?0xa3ab8d:0x90b4a5);
    for(let xx=x+14;xx<x+w-40;xx+=55){rect(xx,y+28,48,h-45,villa?0xc4bd9a:0xa0b6a2);rect(xx+4,y+32,40,3,C.light,.5);}rect(x+4,y+8,8,h-18,accent);rect(x+w-12,y+8,8,h-18,accent);
   }else if(kind==='bed'){
    rect(x+9,y+7,w-18,h-17,C.light);rect(x+14,y+12,42,h-30,0xf0ebd9);rect(x+62,y+10,w-75,h-25,0x819c96);for(let yy=y+18;yy<foot-22;yy+=19)line(x+67,yy,x+w-19,yy,0xb4c4b0,5);rect(x,y,9,h,C.woodDark);rect(x+w-9,y,9,h,C.woodDark);rect(x+4,y+7,4,h-14,accent);
   }else if(kind==='desk'||kind==='computers'){
    rect(x+5,y+5,w-10,h-22,C.wood);rect(x+8,y+8,w-16,3,C.light,.45);monitor(x+16,y+10);paper(x+w-45,y+13);paper(x+w-76,y+36);
    if(kind==='computers')monitor(x+w/2-12,y+10,47);else{rect(x+75,y+18,7,18,accent);ellipse(x+78,y+14,24,14,C.blue);rect(x+71,y+36,14,4,C.ink);}
    for(let xx=x+14;xx<x+w-35;xx+=47){rect(xx,foot-14,35,8,C.woodDark);rect(xx+13,foot-12,9,2,accent);}
   }else if(kind==='records'){
    rect(x+5,y+5,w-10,h-17,0xa9ae98);for(let yy=y+12;yy<foot-30;yy+=32){rect(x+8,yy+23,w-16,4,C.woodDark);for(let xx=x+14;xx<x+w-26;xx+=30){rect(xx,yy,23,21,((xx-x)/30|0)%2?0xccbea0:0x819a91);rect(xx+4,yy+5,15,4,C.light);rect(xx+8,yy+13,7,2,C.ink);}}rect(x,y,5,h,C.woodDark);rect(x+w-5,y,5,h,C.woodDark);
   }else if(kind==='podium'){
    rect(x+5,y+5,w-10,h-13,C.wood);for(let xx=x+8;xx<x+w-5;xx+=20)line(xx,y+8,xx,foot-10,C.woodDark,1,.4);rect(x+w/2-35,y+12,70,h-30,C.woodDark);rect(x+w/2-40,y+8,80,18,accent);paper(x+w/2-12,y+11);line(x+w/2+22,y+14,x+w/2+17,y+1,C.ink,3);rect(x+14,y+14,32,h-32,C.ink);rect(x+w-46,y+14,32,h-32,C.ink);
   }else if(kind==='fountain'){
    rect(x,y,w,h,C.stone);rect(x+8,y+8,w-16,h-16,C.light);rect(x+16,y+16,w-32,h-32,C.blue);for(let yy=y+24;yy<foot-20;yy+=16)line(x+24,yy,x+w-24,yy,0xb5d4c7,2,.5);ellipse(x+w/2,y+h/2,44,44,C.stone);ellipse(x+w/2,y+h/2-7,33,27,C.light);ellipse(x+w/2,y+h/2-11,25,16,C.blue);line(x+w/2,y+h/2-10,x+w/2,y+h/2-28,C.light,4);
   }else if(kind==='garden'){
    rect(x,y,w,h,C.stone);shrub(x+7,y+7,w-14,h-14);for(let j=0;j<16;j++){const xx=x+12+random(j)*Math.max(1,w-30),yy=y+12+random(j+100)*Math.max(1,h-30);rect(xx,yy,5,5,j%2?0xddac9c:C.light);}
   }else if(kind==='lift'){
    rect(x+6,y+6,w-12,h-14,0x8e9b95);rect(x+14,y+12,12,h-24,C.blue);rect(x+w-26,y+12,12,h-24,C.blue);rect(x+26,y+30,w-52,7,accent);rect(x+26,y+53,w-52,7,accent);for(let xx=x+36;xx<x+w-30;xx+=26)rect(xx,y+16,14,3,C.light,.6);
   }else if(kind==='tools'){
    rect(x+7,y+7,w-14,h-22,C.wood);rect(x+9,y+9,w-18,26,C.blue);for(let xx=x+18;xx<x+w-18;xx+=20){line(xx,y+14,xx,y+29,C.light,3);line(xx-4,y+13,xx+4,y+13,C.light,3);}rect(x+20,y+44,36,15,C.ink);line(x+75,y+45,x+100,y+56,accent,5);rect(x+w-40,y+42,18,18,C.blue);
   }else if(kind==='storage'){
    for(let xx=x+9;xx<x+w-35;xx+=41){rect(xx,y+10,32,h-24,0x7e8f80);rect(xx+4,y+15,24,5,C.light,.5);line(xx+4,y+24,xx+27,foot-20,C.ink,3,.35);}
   }
  });
 }
 at(2,()=>{
  if(area==='4:hall'){rug(420,340,280,225);rect(627,345,8,214,C.light,.25);}
  if(area==='4:bedroom')rug(420,375,500,235);
  if(area==='4:study'){rug(360,345,310,210);text(510,380,'STUDIO PRIVATO',13,C.light);}
  if(area==='4:garage'){rect(430,350,260,260,0x8a978f,.3);for(const xx of [440,680])line(xx,360,xx,600,accent,4);for(let yy=360;yy<610;yy+=60)rect(443,yy,20,5,C.light);text(560,625,'AREA MANOVRA',13,C.ink);}
  if(area==='7:assembly'){rug(525,320,220,230);text(635,356,'SALA RIUNIONI',13,C.light);}
  if(area==='7:archive'){rect(560,160,210,120,C.blue,.18);text(665,178,'VERIFICA DATI',12,C.ink);}
  if(area==='7:records'){line(570,170,570,650,accent,3,.4);line(730,170,730,650,accent,3,.4);text(650,345,'CONSULTAZIONE',12,C.ink);}
  if(area==='4:forecourt'){for(const xx of [410,570])line(xx,520,xx,620,C.light,3);line(410,620,570,620,C.light,3);text(490,505,'CONSEGNA',12,C.ink);}
  if(area==='4:gatehouse'){ellipse(660,190,130,130,C.stone,.3);ellipse(660,190,106,106,C.light,.4);text(660,190,'VILLA',16,C.ink);}
  if(area==='7:square'){ellipse(650,440,180,180,C.stone,.35);ellipse(650,440,150,150,C.light,.25);poly([[650,386],[672,440],[650,494],[628,440]],accent,.45);}
  if(night){for(const x of [220,1110]){rect(x,340,60,14,C.ink);for(let i=0;i<7;i++)rect(x+5+i*7,343,3,8,C.stone,.5);}for(let i=0;i<20;i++){const x=140+random(i+700)*1000,y=280+random(i+900)*440;line(x,y,x+14,y-4,C.light,2,.1);}if(area==='7:pickup'){rect(1010,105,205,150,C.blue,.2);line(1020,243,1205,243,accent,3);text(1100,106,'RECUPERO',12,C.light);}}
 });
 // Wall-mounted details add room identity without introducing invisible collision objects.
 at(2,()=>{
  if(['4:study','7:records'].includes(area)){
   for(const x of [350,800]){rect(x,61,175,43,C.woodDark);rect(x+4,65,167,35,0xb7ab8d);for(let i=0;i<16;i++){const xx=x+8+i*10;rect(xx,69,7,27-i%3*3,i%3===0?C.blue:i%3===1?C.wood:0x78917e);rect(xx+1,74,5,2,C.light,.65);}rect(x+3,98,169,4,accent);}
  }
  if(area==='7:archive'){
   for(const x of [350,800]){rect(x,61,175,43,C.ink);rect(x+5,65,165,35,0x416b72);for(let i=0;i<9;i++){rect(x+13+i*16,91-(i%4)*6,9,6+(i%4)*6,0x92bfa8);line(x+10+i*17,68,x+21+i*17,68,C.light,2,.6);}}
  }
  if(['4:bedroom','4:hall','7:assembly'].includes(area)){
   for(const x of [350,800]){rect(x,60,135,44,0x4f7881);rect(x+7,64,121,34,C.blue);line(x+67,64,x+67,99,C.light,3);rect(x-7,61,25,47,villa?0x9b7977:0x6b9185);rect(x+118,61,25,47,villa?0x9b7977:0x6b9185);line(x-4,64,x-4,103,C.light,2,.35);line(x+137,64,x+137,103,C.light,2,.35);}
  }
  if(area==='4:garage'){
   for(const x of [350,800]){rect(x,61,170,43,0x5e7776);for(let i=0;i<12;i++){const xx=x+10+i*13;line(xx,71,xx,91,C.light,3);line(xx-3,71,xx+3,71,C.light,3);}rect(x+2,99,166,3,accent);}
  }
  if(material==='garden'){
   // Garden edging and low floral groundcover stay clear of the driving lanes.
   for(const x of [150,610,1060]){rect(x,100,105,35,0x6e825f,.3);for(let i=0;i<11;i++){const xx=x+8+i*8,yy=109+(i%2)*13;rect(xx,yy,5,3,i%3?0xd8b498:C.light,.75);}}
  }
  if(night){for(const [x,y,w,h]of[[285,570,85,19],[700,230,72,18],[1050,670,90,24]]){ellipse(x,y,w,h,C.blue,.24);line(x-w*.3,y,x+w*.25,y,C.light,2,.14);}}
 });
 if(outdoor)for(const [x,y]of[[70,315],[1210,315],[70,740],[1210,740]])lamp(x,y);
 at(4,()=>{for(const d of config.doors||[]){rect(d.x-44,d.y+8,88,18,night?0x8a9e9b:C.stone);rect(d.x-42,d.y+9,84,3,C.light,.6);line(d.x-44,d.y+26,d.x+44,d.y+26,accent,3);}});
 at(10,()=>plaque(48,15,Math.min(395,title.length*8+18),title));
 return {area,commands,occluders,roads,paths};
}
export function drawCivilDistrict(scene,config,area){return drawEnvironment(scene,buildCivilLayout(area,config));}
