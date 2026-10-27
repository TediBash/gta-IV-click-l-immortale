import {drawEnvironment} from './EnvironmentArt.js';

/** Rome and the homecoming: native scenery, without rewriting narrative or squad state. */
export const ROME_PROFILES={
 '9:foyer':['ROMA / INGRESSO DEL RICEVIMENTO','marble','reception','sofa'],
 '9:salon':['ROMA / SALONE DEGLI OSPITI','marble','buffet','fountain'],
 '9:lane':['ROMA / VICOLI AL TRAMONTO','sunset','palazzo','planter'],
 '9:courtyard':['ROMA / CORTILE RISERVATO','cobble','church','arcade'],
 '9:church':['ROMA / IL SAGRATO','piazza','church','fountain'],
 '9:meeting':['ROMA / PUNTO D’INCONTRO','sunset','arcade','planter'],
 '10:service':['ROMA / AREA TECNICA','technical','server','tools'],
 '10:terrace':['ROMA / LA TERRAZZA','terrace','podium','buffet'],
 '10:backstreet':['ROMA / IL PASSAGGIO SUL RETRO','sunset','palazzo','barrier'],
 '10:garage':['ROMA / IL GARAGE DI SPIT','concrete','lift','tools'],
 '10:fountain':['ROMA / LA PIAZZA DELLA FONTANA','piazza','fountain','arcade'],
 '10:convoy':['ROMA / PUNTO DI RACCOLTA','cobble','arcade','barrier'],
 '10:road':['PIEMONTE / LE ALPI OLTRE IL PARABREZZA','alpine','reststop','planter'],
 '10:home':['FOSSANO / KLAUDIO, LIVELLO 30','birthday','sofa','party']
};
const C={ink:0x2e454e,light:0xf0e1bd,stone:0xb6b5a2,stoneDark:0x8a9285,wall:0xcbb394,ochre:0xc59a75,roof:0x997468,gold:0xceaf71,green:0x6f8d71,leaf:0x94a483,blue:0x729aa3,rose:0xbd8880,wood:0x9f856d};
const random=n=>{let x=Math.imul(n+59,374761393);x=Math.imul(x^(x>>>13),1274126177);return ((x^(x>>>16))>>>0)/4294967296;};
export function romeArea(scene,config){const key=`${scene.mission.id}:${config.zone}`;return !scene.isHideout&&ROME_PROFILES[key]?key:null;}
export function buildRomeLayout(area,config){
 const profile=ROME_PROFILES[area];if(!profile)throw new Error(`Unknown Rome room: ${area}`);
 const [title,material,...fixtures]=profile,outdoor=['sunset','cobble','piazza','terrace','alpine','technical'].includes(material),warm=material==='sunset',party=material==='birthday',commands=[],occluders=[],roads=[];let depth=0;
 const paths=outdoor?[[[100,700],[160,650],[640,650],[640,330],[660,230],[1120,170]],[[640,650],[1040,650],[1040,540]]]:[];
 if(outdoor&&config.gate?.[0]>0)paths.push([[1040,650],[config.gate[0],config.gate[1]]]);
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=C.light,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const sign=(x,y,w,label,bg=C.ink)=>{rect(x+3,y+3,w,26,C.ink,.3);rect(x,y,w,26,bg);rect(x+3,y+3,3,20,C.gold);text(x+w/2,y+13,label,11);};
 const star=(x,y,r,color)=>poly(Array.from({length:16},(_,i)=>{const a=i*Math.PI/8,radius=i%2?r*.45:r;return [x+Math.cos(a)*radius,y+Math.sin(a)*radius];}),color,.35);
 const monitor=(x,y,w=48,h=30)=>{rect(x,y,w,h,C.ink);rect(x+4,y+4,w-8,h-8,0x497a86);for(let yy=y+9;yy<y+h-6;yy+=7)line(x+8,yy,x+w-11,yy,0xb4cfb5,2,.7);rect(x+w/2-3,y+h,6,6,C.ink);};
 const lamp=(x,y)=>{at(1,()=>{ellipse(x,y+6,100,50,C.gold,warm?.13:.06);ellipse(x,y+6,48,28,C.light,.08);});at(y+5,()=>{rect(x-3,y-59,6,59,C.ink);rect(x-10,y-68,20,15,C.ink);rect(x-6,y-65,12,9,C.light);poly([[x-14,y-68],[x,y-76],[x+14,y-68]],C.ink);});};
 const facade=(b,kind)=>{const [x,y,w,h]=b,foot=y+h,top=y-(kind==='church'?70:38),z=foot+x/10000;occluders.push({x,y:top-(kind==='church'?14:0),w,h:foot-top+(kind==='church'?14:0),depth:z});at(z,()=>{
  const church=kind==='church';rect(x,y,w,h,warm?C.ochre:C.wall);rect(x,y,w,5,C.light);rect(x,foot-8,w,8,C.stoneDark);
  if(church){
   rect(x+8,top+28,w-16,61,C.light);poly([[x-3,top+30],[x+w/2,top+4],[x+w+3,top+30]],C.stone);poly([[x+19,top+27],[x+w/2,top+14],[x+w-19,top+27]],C.light);line(x+w/2,top+3,x+w/2,top-12,C.stoneDark,4);line(x+w/2-6,top-7,x+w/2+6,top-7,C.stoneDark,3);
   ellipse(x+w/2,top+55,29,29,C.ink);ellipse(x+w/2,top+55,22,22,C.blue);line(x+w/2-10,top+55,x+w/2+10,top+55,C.gold,2);line(x+w/2,top+45,x+w/2,top+65,C.gold,2);
  }else{
   rect(x-3,top,w+6,h-29,kind==='reststop'?0x687e79:C.roof);rect(x+3,top+5,w-6,h-41,kind==='reststop'?0x8fa59b:0xb08c77);for(let yy=top+13;yy<foot-69;yy+=12)line(x+4,yy,x+w-4,yy,C.roof,2,.65);rect(x+13,top+10,35,20,C.stone);rect(x+10,top+7,41,6,C.light);
  }
  rect(x-4,foot-70,w+8,7,C.light);for(const xx of [x+7,x+w-17]){rect(xx,foot-63,10,55,C.light);rect(xx-2,foot-62,14,5,C.stone);rect(xx-2,foot-12,14,5,C.stone);}
  if(kind==='arcade'){
   for(let xx=x+26;xx<x+w-40;xx+=54){rect(xx,foot-55,37,42,C.ink);ellipse(xx+18.5,foot-54,37,22,C.ink);rect(xx+4,foot-51,29,34,0x617c78);for(let i=0;i<3;i++)rect(xx+8+i*8,foot-50,3,31,C.stoneDark);}
  }else{
   rect(x+w/2-21,foot-59,42,49,church?0x6e6256:C.ink);rect(x+w/2-16,foot-55,32,41,church?0x8f7a61:0x6b8c8e);rect(x+w/2+10,foot-33,3,4,C.gold);
   for(const xx of [x+26,x+w-59]){rect(xx-3,foot-54,38,32,C.stone);rect(xx,foot-51,32,26,C.blue);line(xx+16,foot-51,xx+16,foot-25,C.light,2);line(xx+2,foot-38,xx+30,foot-38,C.light,2);}
  }
  rect(x+w/2-32,foot-8,64,8,C.light);sign(x+w/2-62,foot-95,124,church?'SAGRATO':kind==='reststop'?'SOSTA / PIEMONTE':kind==='arcade'?'PORTICO':'VICOLO ROMANO',warm?0x8b7565:0x657c73);
 });};
 rect(0,0,1280,800,material==='alpine'?0x4e7481:C.ink);rect(40,55,1200,710,material==='birthday'?0xb59a79:material==='concrete'||material==='technical'?0x9aaba1:material==='alpine'?0x80917c:warm?0xb8a58b:0xbfc1aa);
 if(material==='birthday'){
  for(let y=60;y<765;y+=25){line(40,y,1240,y,0x846f59,1,.35);for(let x=50+((y/25|0)%2)*70;x<1240;x+=140)line(x,y,x,Math.min(y+25,765),0x846f59,1,.35);}
 }else if(material==='marble'){
  for(let y=55;y<765;y+=56)for(let x=40;x<1240;x+=56){rect(x+1,y+1,Math.min(54,1240-x),Math.min(54,765-y),((x-40)/56+(y-55)/56)%2?0xe4dbc1:0xb5c3b4);line(Math.min(x+10,1240),Math.min(y+9,765),Math.min(x+33,1240),Math.min(y+31,765),C.light,1,.3);}
 }else{
  const step=outdoor?32:48;for(let y=55;y<765;y+=step)for(let x=40;x<1240;x+=step){line(x,y,Math.min(x+step,1240),y,C.ink,1,.13);line(x,y,x,Math.min(y+step,765),C.ink,1,.13);if(outdoor&&(x+y)%3===0)rect(x+3,y+3,Math.min(step-6,1240-x),Math.min(step-6,765-y),C.light,.08);}
 }
 if(outdoor){
  for(const width of [87,75])for(const p of paths)for(let i=1;i<p.length;i++){line(...p[i-1],...p[i],width===87?C.stoneDark:material==='alpine'?0x52656c:0xd0c5a6,width);ellipse(...p[i-1],width,width,width===87?C.stoneDark:material==='alpine'?0x52656c:0xd0c5a6);ellipse(...p[i],width,width,width===87?C.stoneDark:material==='alpine'?0x52656c:0xd0c5a6);}
  for(const p of paths)for(let i=1;i<p.length;i++){const [x,y]=p[i-1],[tx,ty]=p[i],len=Math.hypot(tx-x,ty-y);for(let d=0;d<=len;d+=30){const xx=x+(tx-x)*d/len,yy=y+(ty-y)*d/len;roads.push({x:xx-35,y:yy-35,w:70,h:70,color:material==='alpine'?0x6c8a92:0x9a9e86});}}
  at(1,()=>{rect(40,55,1200,34,C.stoneDark);rect(40,55,1200,7,C.light);for(let x=50;x<1240;x+=33){rect(x,65,10,24,C.stone);rect(x-2,64,14,4,C.light);}rect(40,89,1200,4,C.light);});
 }else{
  at(1,()=>{rect(40,55,1200,54,C.wall);rect(40,109,1200,8,C.gold);if(!party)for(let x=130;x<1200;x+=220){rect(x,65,68,33,C.wood);rect(x+4,69,60,25,C.light);if(!party)poly([[x+8,90],[x+22,75],[x+34,87],[x+49,77],[x+60,90]],C.green);}line(55,749,1225,749,C.gold,4,.5);});
 }
 if(material==='terrace')at(0,()=>{rect(0,0,1280,52,0xbb9f99);for(let x=60;x<1200;x+=80){rect(x,28+(x%3)*6,55,24,C.stoneDark,.5);rect(x+15,18+(x%3)*6,27,34,C.stoneDark,.5);}ellipse(880,21,84,30,0xd4b69c);rect(838,21,84,31,0xd4b69c);});
 if(material==='alpine')at(0,()=>{
  rect(0,0,1280,53,0x789ba0);for(let x=0;x<1280;x+=180){poly([[x-30,52],[x+62,3+(x%7)],[x+157,52]],0xb4c7bd);poly([[x+12,29],[x+62,3+(x%7)],[x+111,30],[x+77,25],[x+62,14],[x+44,29]],C.light);}
 });
 for(let i=0;i<config.obstacles.length;i++){
  const b=config.obstacles[i],[x,y,w,h]=b,kind=fixtures[i],foot=y+h,z=foot+x/10000;
  if(['church','palazzo','arcade','reststop'].includes(kind)){facade(b,kind);continue;}
  at(z,()=>{
   rect(x,y,w,h,C.ink);rect(x+3,y+3,w-6,h-6,C.wood);rect(x+4,foot-10,w-8,6,C.ink,.3);
   if(kind==='fountain'){
    rect(x+3,y+3,w-6,h-6,C.stone);rect(x+9,y+9,w-18,h-18,C.light);rect(x+16,y+16,w-32,h-32,C.blue);for(let yy=y+22;yy<foot-20;yy+=16)line(x+22,yy,x+w-22,yy,0xbcd5c6,2,.55);ellipse(x+w/2,y+h/2,58,45,C.stone);ellipse(x+w/2,y+h/2-8,44,28,C.light);ellipse(x+w/2,y+h/2-12,33,18,C.blue);rect(x+w/2-3,y+h/2-30,6,18,C.light);
   }else if(kind==='planter'){
    rect(x+5,y+5,w-10,h-10,C.stone);rect(x+12,y+12,w-24,h-24,C.green);for(let j=0;j<28;j++)rect(x+15+random(j)*Math.max(1,w-37),y+15+random(j+150)*Math.max(1,h-35),7,4,j%3?C.leaf:C.light,.8);rect(x+w/2-5,y+25,10,h-38,C.wood);ellipse(x+w/2,y+38,78,48,C.green);ellipse(x+w/2-12,y+29,53,31,C.leaf);
   }else if(kind==='sofa'){
    rect(x+5,y+5,w-10,h-15,party?0x698d87:0x847c77);rect(x+9,y+9,w-18,20,party?0xa0b6a0:0xb2a48b);for(let xx=x+13;xx<x+w-42;xx+=55){rect(xx,y+34,47,h-52,party?0xbcc5a6:0xd0c0a0);line(xx+4,y+38,xx+40,y+38,C.light,2,.5);}rect(x+4,y+6,7,h-15,C.gold);rect(x+w-11,y+6,7,h-15,C.gold);
   }else if(kind==='buffet'||kind==='reception'){
    rect(x+6,y+5,w-12,h-22,C.light);rect(x+8,foot-17,w-16,7,C.gold);for(let xx=x+19;xx<x+w-30;xx+=43){if(kind==='buffet'){ellipse(xx+10,y+31,29,22,C.stone);ellipse(xx+10,y+30,23,16,C.light);rect(xx+4,y+25,13,8,C.rose);}else{rect(xx,y+18,28,21,C.wood);rect(xx+3,y+21,22,14,C.light);line(xx+6,y+25,xx+21,y+25,C.stoneDark,2);}}text(x+w/2,foot-29,kind==='buffet'?'RICEVIMENTO':'BENVENUTI A ROMA',10,C.ink);
   }else if(kind==='server'){
    rect(x+6,y+6,w-12,h-20,0x48636b);for(let yy=y+13;yy<foot-23;yy+=17){rect(x+14,yy,w-44,8,C.stone,.3);rect(x+w-24,yy,6,5,0xb4d5ae);}monitor(x+w/2-25,y+15,50,34);
   }else if(kind==='tools'){
    rect(x+6,y+6,w-12,h-20,C.wood);rect(x+9,y+9,w-18,23,C.blue);for(let xx=x+20;xx<x+w-15;xx+=22){line(xx,y+14,xx,y+28,C.light,3);line(xx-4,y+14,xx+4,y+14,C.light,3);}rect(x+17,y+44,39,18,C.ink);line(x+76,y+44,x+98,y+55,C.gold,4);rect(x+w-44,y+42,22,22,C.blue);
   }else if(kind==='lift'){
    rect(x+5,y+5,w-10,h-14,C.stone);rect(x+13,y+10,13,h-25,C.blue);rect(x+w-26,y+10,13,h-25,C.blue);line(x+26,y+32,x+w-26,y+32,C.gold,7);line(x+26,y+64,x+w-26,y+64,C.gold,7);
   }else if(kind==='podium'){
    rect(x+5,y+5,w-10,h-15,C.light);rect(x+w/2-42,y+19,84,h-36,C.wood);rect(x+w/2-47,y+14,94,17,C.gold);rect(x+w/2-17,y+16,34,13,C.light);line(x+w/2+29,y+21,x+w/2+23,y+4,C.ink,3);
   }else if(kind==='barrier'){
    rect(x+5,y+5,w-10,h-15,C.stoneDark);rect(x+12,y+14,w-24,h-32,C.stone);for(let xx=x+15;xx<x+w-20;xx+=25){poly([[xx,y+17],[xx+10,y+17],[xx+22,foot-20],[xx+12,foot-20]],C.light,.7);}rect(x+8,y+8,w-16,6,C.gold);
   }else if(kind==='party'){
    rect(x+6,y+6,w-12,h-18,C.light);for(let xx=x+9;xx<x+w-9;xx+=20)rect(xx,foot-21,9,7,C.rose);ellipse(x+w/2,y+h/2+7,83,38,C.stone);rect(x+w/2-33,y+24,66,39,C.rose);ellipse(x+w/2,y+24,66,27,C.light);text(x+w/2,y+29,'30',22,C.rose);for(const xx of [x+25,x+w-25]){ellipse(xx,y+37,25,20,C.stone);ellipse(xx,y+36,20,15,C.light);}rect(x+w/2-15,y+4,4,12,C.blue);rect(x+w/2+12,y+4,4,12,C.rose);ellipse(x+w/2-13,y+2,5,8,C.gold);ellipse(x+w/2+14,y+2,5,8,C.gold);
   }
  });
 }
 at(2,()=>{
  if(material==='marble'){rect(575,300,150,320,C.rose,.55);line(584,306,584,612,C.gold,3);line(716,306,716,612,C.gold,3);star(650,460,48,C.light);}
  if(material==='piazza'||material==='cobble'){ellipse(640,430,190,190,C.stoneDark,.15);ellipse(640,430,165,165,C.light,.2);star(640,430,70,C.stoneDark);}
  if(area==='10:service'){line(560,290,730,290,C.blue,4,.6);line(730,290,730,590,C.blue,4,.6);for(let y=350;y<600;y+=35)rect(726,y,8,4,C.light,.5);text(660,179,'AREA TECNICA',12,C.ink);}
  if(area==='10:garage'){for(const x of [430,690])line(x,350,x,610,C.gold,4);line(430,610,690,610,C.gold,4);text(560,635,'SPIT / MOTORE ACCESO',12,C.ink);}
  if(area==='10:convoy'||area==='9:meeting'){rect(1015,545,185,170,C.blue,.17);text(1107,691,'RACCOLTA BANDA',12,C.ink);}
  if(material==='alpine'){for(let x=200;x<1210;x+=87)rect(x,690,34,4,C.light,.55);text(660,193,'NOTIZIARIO / VERSO CASA',12,C.light);}
  if(party){
   rect(490,370,260,220,0x788f86);rect(499,379,242,202,0xa7b39a);star(620,480,65,C.gold);text(620,405,'PLAYER 30',20,C.ink);
   for(let i=0;i<65;i++){const x=220+random(i)*920,y=330+random(i+100)*370;rect(x,y,4,6,[C.rose,C.blue,C.gold,C.light][i%4],.8);}
  }
 });
 if(party)at(4,()=>{
  rect(365,62,170,43,C.ink);rect(370,66,160,35,0x4e7681);text(450,84,'GTA CLICK',19,C.light);rect(550,67,16,35,C.light);rect(556,72,3,23,C.ink);
  // A wall display celebrates the birthday without adding another interactive objective.
  ellipse(602,83,48,26,C.ink);rect(585,80,12,4,C.light);rect(589,76,4,12,C.light);ellipse(614,79,4,4,C.rose);ellipse(619,85,4,4,C.blue);text(895,85,'BUON COMPLEANNO, KLAUDIO!',16,C.ink);
 });
 if(outdoor||party)at(5,()=>{
  const flags=party||['10:terrace','10:backstreet','10:fountain'].includes(area);if(flags){line(80,123,1200,123,C.ink,2,.5);for(let x=100;x<1190;x+=55)poly([[x,124],[x+23,124],[x+11,147]],party?[C.rose,C.blue,C.gold][Math.floor(x/55)%3]:C.light,.85);}
 });
 if(outdoor)for(const [x,y]of[[70,330],[1210,330],[70,740],[1210,740]])lamp(x,y);
 at(4,()=>{for(const d of config.doors||[]){rect(d.x-42,d.y+9,84,19,C.stone);line(d.x-42,d.y+11,d.x+42,d.y+11,C.light,3);line(d.x-42,d.y+26,d.x+42,d.y+26,C.gold,3);}});
 at(10,()=>sign(48,15,Math.min(420,title.length*8+18),title));
 return {area,commands,occluders,roads,paths};
}
export function drawRomeDistrict(scene,config,area){return drawEnvironment(scene,buildRomeLayout(area,config));}
