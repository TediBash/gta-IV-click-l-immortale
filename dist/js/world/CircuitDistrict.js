import {TRACK,TRACK_HALF_WIDTH,trackDistance} from '../data/raceTrack.js';
import {drawEnvironment} from './EnvironmentArt.js';
/** All trackside scenery stays outside the 132px driving surface. */
export function buildCircuitLayout(){
 const commands=[],roads=[],occluders=[],scenery=[];let depth=0;
 const C={ink:0x253e49,grass:0x7c947b,light:0xe6dcc0,asphalt:0x354c59,edge:0x82968b,red:0xb77869,teal:0x709d96,gold:0xd5b874};
 const rect=(x,y,w,h,color,alpha=1)=>commands.push({kind:'rect',x,y,w,h,color,alpha,depth});
 const line=(x,y,x2,y2,color,width=2,alpha=1)=>commands.push({kind:'line',x,y,x2,y2,color,width,alpha,depth});
 const ellipse=(x,y,w,h,color,alpha=1)=>commands.push({kind:'ellipse',x,y,w,h,color,alpha,depth});
 const poly=(points,color,alpha=1)=>commands.push({kind:'poly',points,color,alpha,depth});
 const text=(x,y,value,size=12,color=C.light,align='center')=>commands.push({kind:'text',x,y,value,size,color,align,depth});
 const at=(z,fn)=>{const old=depth;depth=z;fn();depth=old;};
 const panel=(x,y,w,h,label,color=C.teal)=>{rect(x,y,w,h,C.ink);rect(x+3,y+3,w-6,h-6,color);text(x+w/2,y+h/2,label,Math.min(18,h*.4));};
 const box=(id,x,y,w,h)=>{scenery.push({id,x,y,w,h});};
 rect(0,0,1280,800,C.ink);rect(40,48,1200,720,C.grass);
 for(let y=75;y<750;y+=32)for(let x=65;x<1230;x+=39)rect(x,y,14,3,0x9daf86,.18);
 // Union of segment strips and round endpoint caps exactly matches trackDistance().
 for(const width of [158,150,TRACK_HALF_WIDTH*2])for(let i=0;i<TRACK.length;i++){
  const a=TRACK[i],b=TRACK[(i+1)%TRACK.length],color=width===158?C.ink:width===150?C.edge:C.asphalt;
  line(...a,...b,color,width);ellipse(...a,width,width,color);ellipse(...b,width,width,color);
 }
 for(let i=0;i<TRACK.length;i++){
  const [x,y]=TRACK[i],[tx,ty]=TRACK[(i+1)%TRACK.length],len=Math.hypot(tx-x,ty-y),ux=(tx-x)/len,uy=(ty-y)/len,nx=-uy,ny=ux;
  for(let d=0;d<len;d+=28){const px=x+ux*d,py=y+uy*d;roads.push({x:px-TRACK_HALF_WIDTH,y:py-TRACK_HALF_WIDTH,w:TRACK_HALF_WIDTH*2,h:TRACK_HALF_WIDTH*2,color:0x78929a});}
  for(let d=12;d<len-12;d+=28){const end=Math.min(d+22,len-8);for(const side of [-1,1]){const a=[x+ux*d+nx*70*side,y+uy*d+ny*70*side],b=[x+ux*end+nx*70*side,y+uy*end+ny*70*side];if([0,.25,.5,.75,1].every(t=>trackDistance(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)>=TRACK_HALF_WIDTH+3.5)){line(...a,...b,Math.floor(d/28)%2?C.light:C.red,7);commands.at(-1).role='curb';}}}
  for(let d=25;d<len-20;d+=70)line(x+ux*d,y+uy*d,x+ux*Math.min(d+25,len-10),y+uy*Math.min(d+25,len-10),C.light,2,.5);
 }
 // Start line, grid and direction hints are paint only.
 at(1,()=>{
  for(let y=590;y<715;y+=15)for(let x=180;x<210;x+=15)rect(x,y,15,15,((x-180)/15+(y-590)/15)%2?C.light:C.ink);
  for(const x of [245,305,365]){line(x,626,x,646,C.light,2,.7);line(x,626,x+26,626,C.light,2,.7);line(x+30,659,x+30,680,C.light,2,.7);line(x+30,680,x+56,680,C.light,2,.7);}
  for(const x of [540,800])poly([[x,644],[x+18,650],[x,656],[x+5,650]],C.light,.45);
 });
 at(2,()=>{
  // Infield paddock; low top-down props cannot hide cars that stray onto the grass.
  box('paddock',305,240,665,275);rect(305,240,665,275,0x789b8d);rect(312,247,651,261,0x8fa896);rect(322,259,631,6,C.light,.35);
  panel(450,275,370,54,'SPIT CUSTOMS / FOSSANO');text(635,355,'DUE GIRI. UNA SOLA BANDA.',17,C.ink);
  for(let i=0;i<3;i++){
   const x=335+i*205;rect(x,397,180,90,C.ink);rect(x+5,402,170,80,i===1?0x7b9b9d:0xa79b80);rect(x+12,409,156,23,C.light);text(x+90,421,['BOX / SPIT','RICAMBI','TELEMETRIA'][i],12,C.ink);
   if(i===0){rect(x+18,446,63,23,C.teal);rect(x+23,450,52,13,C.ink);rect(x+100,443,49,28,C.gold);}
   if(i===1)for(let j=0;j<4;j++){ellipse(x+29+j*39,458,29,29,C.ink);ellipse(x+29+j*39,458,16,16,C.edge);}
   if(i===2){rect(x+20,441,61,33,C.ink);rect(x+25,445,51,23,C.teal);rect(x+100,441,61,33,C.ink);rect(x+105,445,51,23,C.teal);}
  }
  // Grandstands are beyond the start straight's outer curb (y >= 725).
  box('grandstand',310,735,660,38);rect(310,735,660,38,C.ink);for(let row=0;row<3;row++){rect(315,739+row*10,650,6,C.edge);for(let x=323;x<960;x+=20)rect(x,738+row*10,9,4,(x+row)%3?C.teal:C.red);}
  box('timing',335,16,370,26);panel(335,16,370,26,'SPIT CUSTOMS  /  CIRCUITO',C.ink);
  box('banner',760,16,225,26);panel(760,16,225,26,'FOSSANO RACING',C.red);
  // Fence posts sit outside the left/right straight safety strips.
  for(const x of [60,1230])for(let y=190;y<585;y+=29){rect(x,y,4,19,C.ink);line(x+1,y+3,x+1,y+26,C.light,1,.6);}
 });
 return {area:'circuit',commands,occluders,roads,scenery,track:TRACK.map(p=>[...p]),halfWidth:TRACK_HALF_WIDTH};
}
export function drawCircuitDistrict(scene){return drawEnvironment(scene,buildCircuitLayout());}
