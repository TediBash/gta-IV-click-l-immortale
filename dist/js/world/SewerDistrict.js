import {drawEnvironment} from './EnvironmentArt.js';

/** Bruce's seven rooms. Active water, valves, boss and pizza stay controller-owned. */
export const SEWER_PROFILES={
 access:['TORINO / ACCESSO ALLE FOGNE','sewer','pipes','buttress'],
 west:['FOGNE / VALVOLA OVEST','sewer','pump','pipes'],
 east:['FOGNE / VALVOLA EST','sewer','pipes','pump'],
 collector:['FOGNE / COLLETTORE CENTRALE','sewer','buttress','pipes'],
 service:['FOGNE / CORRIDOIO DI SERVIZIO','sewer','pipes','buttress'],
 kitchen:['PIZZERIA / CUCINA E CONSEGNE','kitchen','prep','oven'],
 dining:['PIZZERIA / SALA E UFFICIO','dining','table','booth']
};
const C={ink:0x243e40,wall:0x3e5b56,stone:0x809389,edge:0xa8afa0,moss:0x698267,rust:0x98775c,metal:0x647f7e,light:0xd4d2ad,teal:0x82b7aa,cream:0xe7d7b0,red:0xb07160,wood:0x9b7d60};
const noise=n=>{let x=Math.imul(n+43,374761393);x=Math.imul(x^(x>>>13),1274126177);return ((x^(x>>>16))>>>0)/4294967296;};
export function sewerArea(scene,config){return !scene.isHideout&&scene.mission.id===5&&Object.hasOwn(SEWER_PROFILES,config.zone)?config.zone:null;}
export function buildSewerLayout(area,config){
 const profile=SEWER_PROFILES[area];if(!profile)throw new Error(`Unknown sewer room: ${area}`);
 const [title,material,...fixtures]=profile,sewer=material==='sewer',accent=area==='east'?0xc8a97b:sewer?C.teal:C.red,commands=[],occluders=[],roads=[],channels=(config.waterChannels||[]).map(([x,y,w,h])=>({x,y,w,h,color:0x428e87}));let depth=0;
 const bottom=area==='collector'?700:650;
 const paths=sewer?[[[100,700],[160,650],[525,650],[525,100],[750,100],[750,bottom],[1120,bottom],[1120,650]],[[750,300],[1120,190]]].map(path=>path.filter((p,i)=>!i||p[0]!==path[i-1][0]||p[1]!==path[i-1][1])):[];
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=C.light,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const sign=(x,y,w,label)=>{rect(x+3,y+3,w,25,C.ink,.4);rect(x,y,w,25,sewer?C.wall:C.red);rect(x+3,y+3,3,19,accent);text(x+w/2,y+13,label,11);};
 const bricks=(x,y,w,h)=>{rect(x,y,w,h,C.ink);for(let yy=y;yy<y+h;yy+=18)for(let xx=x;xx<x+w;xx+=29){rect(xx+1,yy+1,Math.min(26,x+w-xx-1),Math.min(15,y+h-yy-1),(Math.floor((xx-x)/29)+Math.floor((yy-y)/18))%4===0?C.metal:C.wall);line(xx+3,yy+3,Math.min(xx+23,x+w-2),yy+3,C.edge,1,.18);}};
 const pipe=(x,y,w,h,horizontal=false)=>{
  rect(x,y,w,h,C.ink);rect(x+3,y+3,w-6,h-6,C.rust);rect(x+6,y+5,w-12,h-10,C.metal);
  if(horizontal){line(x+5,y+7,x+w-5,y+7,C.edge,3,.55);for(let xx=x+9;xx<x+w-6;xx+=36){rect(xx,y,6,h,C.ink);rect(xx+1,y+2,4,h-4,C.stone);}}
  else{line(x+8,y+5,x+8,y+h-5,C.edge,3,.55);for(let yy=y+12;yy<y+h-6;yy+=39){rect(x,yy,w,7,C.ink);rect(x+2,yy+1,w-4,5,C.stone);}}
 };
 const grate=(x,y,w,h)=>{rect(x,y,w,h,C.ink);rect(x+3,y+3,w-6,h-6,C.wall);for(let xx=x+8;xx<x+w-4;xx+=10)line(xx,y+4,xx,y+h-4,C.edge,2,.55);rect(x,y,w,3,C.stone);rect(x,y+h-3,w,3,C.stone);};
 const pizza=(x,y,r=17)=>{ellipse(x,y,r*2,r*1.6,0xd1a66b);ellipse(x,y,r*1.7,r*1.3,C.red);ellipse(x,y,r*1.45,r*1.1,0xe0c68c);for(const [dx,dy]of[[-6,-3],[5,-5],[7,4],[-4,5]])ellipse(x+dx,y+dy,5,4,0xa7664f);};
 const lamp=(x,y)=>{at(1,()=>{ellipse(x,y+18,110,65,sewer?0x96c9b7:0xf1c798,.055);ellipse(x,y+18,60,37,sewer?0x96c9b7:0xf1c798,.09);});at(5,()=>{rect(x-19,y-5,38,13,C.ink);rect(x-14,y-2,28,6,sewer?0xb9dbc7:0xf2d4a3);for(let xx=x-10;xx<x+16;xx+=10)rect(xx,y-4,2,11,C.wall);});};
 rect(0,0,1280,800,C.ink);rect(40,55,1200,710,sewer?0x62786e:material==='kitchen'?0xb4b7a4:0xc9b798);
 if(sewer){
  for(let y=55;y<765;y+=36)for(let x=40;x<1240;x+=58){rect(x+1,y+1,Math.min(55,1240-x),Math.min(33,765-y),((x-40)/58+(y-55)/36)%3?0x6e8174:0x5f766e);line(x+5,y+5,Math.min(x+43,1240),y+5,C.edge,1,.12);}
  // Broad maintenance strips are ground markings, not additional collision walls.
  for(const path of paths){for(let i=1;i<path.length;i++){line(...path[i-1],...path[i],C.edge,58,.12);const [x,y]=path[i-1],[tx,ty]=path[i],len=Math.hypot(tx-x,ty-y);for(let d=0;d<=len;d+=28){const px=x+(tx-x)*d/len,py=y+(ty-y)*d/len;roads.push({x:px-27,y:py-27,w:54,h:54,color:0x75877a});}}}
  for(let i=0;i<90;i++){const x=70+noise(i)*1120,y=130+noise(i+150)*590;if(channels.some(c=>x>c.x-10&&x<c.x+c.w+10))continue;rect(x,y,8+noise(i+220)*18,3,C.moss,.55);if(i%4===0)line(x,y,x+15,y+5,C.ink,1,.25);}
  at(1,()=>{bricks(40,55,1200,49);rect(40,104,1200,8,C.stone);pipe(70,68,1120,21,true);for(let y=140;y<720;y+=110){rect(40,y,19,45,C.wall);rect(1220,y,19,45,C.wall);}for(const c of channels){rect(c.x-13,c.y-8,c.w+26,c.h+16,C.ink);}});
  at(4,()=>{for(const c of channels){
   // Borders and a narrow grate remain above the controller's animated water layer (depth 3).
   for(const xx of [c.x-11,c.x+c.w+4]){rect(xx,c.y-4,7,c.h+8,C.stone);for(let y=c.y+8;y<c.y+c.h;y+=32)line(xx,y,xx+7,y,C.ink,2,.7);}
   grate(c.x-12,633,c.w+24,34);for(let yy=c.y+30;yy<c.y+c.h;yy+=90){line(c.x-17,yy,c.x-8,yy,C.light,2,.5);line(c.x+c.w+8,yy,c.x+c.w+17,yy,C.light,2,.5);}
  }});
 }else{
  for(let y=55;y<765;y+=44)for(let x=40;x<1240;x+=44){const dark=((x-40)/44+(y-55)/44)%2;rect(x+1,y+1,Math.min(42,1240-x),Math.min(42,765-y),material==='kitchen'?(dark?0xa6b0a2:0xc0c4b0):(dark?0xc5ab86:0xddc69e));}
  at(1,()=>{rect(40,55,1200,50,C.cream);rect(40,105,1200,9,C.red);for(let x=60;x<1200;x+=140){rect(x,64,90,31,C.red);rect(x+4,68,82,23,C.ink);text(x+45,80,x%3?'PIZZA AL FORNO':'DA ASPORTO',9,C.cream);}
   for(let y=160;y<730;y+=150){rect(46,y,9,32,C.red);rect(1224,y,9,32,C.red);}
  });
 }
 for(let i=0;i<config.obstacles.length;i++){
  const [x,y,w,h]=config.obstacles[i],foot=y+h,kind=fixtures[i],z=foot+x/10000;
  at(z,()=>{
   if(['pipes','pump','buttress'].includes(kind)){
    bricks(x,y,w,h);rect(x+5,y+5,w-10,4,C.edge,.5);
    if(kind==='pipes'){
     pipe(x+17,y+9,29,h-18);pipe(x+w-51,y+9,34,h-18);pipe(x+17,y+h*.43,w-34,26,true);
     for(let j=0;j<6;j++)rect(x+8+(j*17)%(w-20),foot-17+j%3*3,8,3,C.moss,.7);
    }else if(kind==='pump'){
     rect(x+15,y+17,w-30,h-35,C.metal);ellipse(x+w/2,y+h/2,Math.min(w-40,84),Math.min(h-43,80),C.ink);ellipse(x+w/2,y+h/2,Math.min(w-52,65),Math.min(h-55,61),C.stone);ellipse(x+w/2,y+h/2,22,22,C.wall);line(x+w/2-20,y+h/2,x+w/2+20,y+h/2,C.wall,6);line(x+w/2,y+h/2-20,x+w/2,y+h/2+20,C.wall,6);rect(x+11,foot-12,w-22,6,accent);
    }else{
     // Closed service recesses, not fake traversable doorways.
     rect(x+15,y+18,w-30,h-29,C.ink);rect(x+20,y+23,w-40,h-39,C.wall);for(let xx=x+25;xx<x+w-23;xx+=16)rect(xx,y+25,5,h-44,C.metal);rect(x+10,y+10,w-20,8,C.stone);rect(x+7,y+12,8,h-20,C.stone);rect(x+w-15,y+12,8,h-20,C.stone);
    }
   }else if(kind==='prep'){
    rect(x,y,w,h,C.ink);rect(x+4,y+4,w-8,h-13,0xb5c4b8);rect(x+7,y+7,w-14,4,C.cream);rect(x+12,y+17,59,36,C.metal);rect(x+17,y+21,49,26,C.ink);line(x+37,y+15,x+37,y+26,C.light,4);rect(x+90,y+19,67,35,0xbea578);pizza(x+120,y+35,17);for(let j=0;j<3;j++){rect(x+w-54+j*13,y+15,10,30,j%2?0x7d986a:C.red);}for(let xx=x+17;xx<x+w-30;xx+=47){rect(xx,foot-15,36,10,C.metal);rect(xx+12,foot-12,12,2,C.light);}
   }else if(kind==='oven'){
    const top=y-39;occluders.push({x,y:top,w,h:h+39,depth:z});rect(x,y,w,h,C.red);poly([[x+9,y+4],[x+29,top+12],[x+w/2,top],[x+w-29,top+12],[x+w-9,y+4]],0xc59673);rect(x+16,y+4,w-32,8,C.cream);rect(x+33,y+13,w-66,h-30,C.ink);rect(x+43,y+25,w-86,h-44,0xc78455);for(let xx=x+50;xx<x+w-40;xx+=23)poly([[xx,foot-18],[xx+5,y+28],[xx+16,foot-18]],0xe4b96d);rect(x+22,foot-14,w-44,9,C.stone);rect(x+7,top+8,29,23,C.red);rect(x+4,top+5,35,6,C.cream);
   }else if(kind==='table'){
    rect(x,y,w,h,C.wood);rect(x+5,y+5,w-10,h-12,C.cream);for(let yy=y+8;yy<foot-9;yy+=15)for(let xx=x+8;xx<x+w-9;xx+=15)if((Math.floor((yy-y)/15)+Math.floor((xx-x)/15))%2)rect(xx,yy,Math.min(12,x+w-9-xx),Math.min(12,foot-9-yy),C.red,.4);ellipse(x+39,y+h/2,32,26,C.light);ellipse(x+w-39,y+h/2,32,26,C.light);pizza(x+w/2,y+h/2,18);
   }else{
    rect(x,y,w,h,C.wood);rect(x+5,y+5,w-10,h-15,C.red);rect(x+10,y+9,w-20,15,0xc99a80);for(let xx=x+13;xx<x+w-40;xx+=50){rect(xx,y+29,43,h-46,0xd1b18d);line(xx+3,y+33,xx+37,y+33,C.cream,2,.5);}
   }
  });
 }
 at(1,()=>{
  if(area==='collector'){
   ellipse(835,350,280,235,0x3b5c56,.3);ellipse(835,350,250,205,0x8c9e89,.15);for(let x=740;x<930;x+=32)line(x,280,x,420,C.ink,1,.13);text(875,475,'COLLETTORE CENTRALE',13,C.edge);
  }
  if(area==='kitchen'){rect(330,310,680,80,C.ink,.13);for(let x=340;x<1000;x+=16)line(x,320,x,378,C.light,2,.2);rect(620,465,170,135,C.red,.15);text(705,605,'CONSEGNE',13,C.ink);}
  if(area==='dining'){rect(560,280,150,300,C.red,.15);line(570,290,570,570,C.cream,3,.5);line(700,290,700,570,C.cream,3,.5);}
 });
 at(4,()=>{
  if(area==='access')sign(145,205,220,'PLANIMETRIA / BRUCE');
  if(area==='west'||area==='east'){const valve=config.points.find(p=>p.action==='valve');if(valve){line(valve.x-55,130,valve.x+55,130,accent,5,.7);sign(valve.x-65,86,130,area==='west'?'CIRCUITO OVEST':'CIRCUITO EST');}}
  if(area==='service')sign(970,570,225,'↑ SCALA / PIZZERIA');
  for(const d of config.doors||[]){rect(d.x-46,d.y+8,92,20,sewer?C.stone:C.cream);for(let i=0;i<3;i++)line(d.x-43,d.y+10+i*6,d.x+43,d.y+10+i*6,C.ink,1,.4);}
 });
 for(const [x,y]of[[75,142],[1205,142],[75,720],[1205,720]])lamp(x,y);
 at(10,()=>sign(48,15,Math.min(400,title.length*8+18),title));
 return {area,commands,occluders,roads,paths,channels};
}
/** Ripple strokes are clipped to the actual animated fill, including partially drained states. */
export function waterRipples(channel,level,phase=0){
 const {x,y,w,h}=channel,fill=Math.max(0,Math.min(1,level)),top=y+h*(1-fill),lines=[];
 for(let yy=top+11;yy<y+h-7;yy+=31){const shift=Math.sin(phase*.42+yy*.07)*7;
  lines.push({x:x+15+shift,y:yy,x2:x+w*.53+shift,y2:yy-2});
  lines.push({x:x+w*.63-shift*.3,y:yy+3,x2:x+w-13-shift*.3,y2:yy+2});
 }
 return lines;
}
export function drawSewerDistrict(scene,config,area){
 const environment=drawEnvironment(scene,buildSewerLayout(area,config));if(!environment.layout.channels.length)return environment;
 const ripple=scene.add.graphics().setDepth(3.5);let previous='';
 return {layout:environment.layout,update(player){
  environment.update(player);
  const water=scene.adventureController?.effects?.water;if(!water?.length)return;
  const phase=scene.app?.settings?.reduceMotion?0:Math.floor((scene.now||0)/180),levels=water.map(v=>Number.isFinite(v.scaleY)?v.scaleY:1),key=phase+':'+levels.join(',');
  if(key===previous)return;previous=key;ripple.clear().lineStyle(2,0xafd4bd,.26);
  environment.layout.channels.forEach((c,i)=>{for(const l of waterRipples(c,levels[i]??1,phase))ripple.lineBetween(l.x,l.y,l.x2,l.y2);});
 }};
}
