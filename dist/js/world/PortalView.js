import {NAV_COLORS} from './NavigationModel.js';
/** Neon, irregular vortex with a recessed center and a foreground lower lip. */
export class PortalView{
 constructor(s,d){this.s=s;this.d=d;this.floor=s.add.graphics().setDepth(3);this.back=s.add.graphics().setDepth(d.presentation?d.y-1:d.y-100);this.frame=s.add.graphics().setDepth(d.y+2);this.label=s.add.text(d.x,d.y-(d.presentation==='garage'?95:d.presentation==='threshold'?48:126),d.label,{fontFamily:'Arial',fontStyle:'bold',fontSize:d.presentation?12:13,color:'#eafff8',backgroundColor:'#10242e',padding:{x:8,y:5},wordWrap:{width:190},align:'center'}).setOrigin(.5,1).setDepth(1500);this.update(false,false);this.render(0);}
 update(locked,active,alarm=false){this.dirty=this.dirty||this.locked!==locked||this.active!==active||this.alarm!==alarm;this.locked=locked;this.active=active;this.alarm=alarm;this.label.setText((alarm?'ALLARME · ':locked?'BLOCCATO · ':active?'QUI → ':'ENTRA · ')+this.d.label).setColor(alarm?'#ff7c85':locked?'#d9b7ff':active?'#ffda69':'#c3ff97');}
 render(time){const reduced=!!this.s.app.settings.reduceMotion;if(!this.dirty&&this.lastMotion===reduced&&(reduced||time-(this.lastRender||0)<50))return;this.dirty=false;this.lastRender=time;this.lastMotion=reduced;const {x,y}=this.d,locked=this.locked,active=this.active,phase=this.s.app.settings.reduceMotion?0:time/1400,c=this.alarm?0xff515c:locked?NAV_COLORS.locked:NAV_COLORS.door;
  if(this.d.presentation){this.renderEntrance(x,y,c,active,phase,locked);return;}
  this.floor.clear().fillStyle(c,.14).fillEllipse(x,y+10,134,48).lineStyle(active?3:2,active?NAV_COLORS.objective:c,.9).strokeEllipse(x,y+10,134,48);
  for(let i=0;i<2;i++)this.floor.lineStyle(3,c,.8).beginPath().moveTo(x-12,y+42-i*14).lineTo(x,y+32-i*14).lineTo(x+12,y+42-i*14).strokePath();
  const g=this.back;g.clear().fillStyle(0x152819).fillEllipse(x,y-48,102,133).fillStyle(c,.22).fillEllipse(x,y-48,94,125);
  for(let ring=0;ring<3;ring++){g.lineStyle(ring===0?8:3,c,ring===0?.8:.48).beginPath();for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,r=1+Math.sin(a*7+phase*2)*.045+Math.sin(a*11-phase)*.025,px=x+Math.cos(a)*(52-ring*8)*r,py=y-48+Math.sin(a)*(68-ring*10)*r;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.closePath().strokePath();}
  for(let strand=0;strand<3;strand++){g.lineStyle(3,strand===0?0xe3ffa1:c,.8).beginPath();for(let i=0;i<80;i++){const t=i/79,a=t*Math.PI*4+phase+strand*Math.PI*2/3,r=3+t*40,px=x+Math.cos(a)*r,py=y-48+Math.sin(a)*r*1.32;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.strokePath();}
  this.frame.clear().lineStyle(6,c,.9).beginPath();for(let i=0;i<=24;i++){const a=i/24*Math.PI,px=x+Math.cos(a)*52,py=y-48+Math.sin(a)*68;if(i===0)this.frame.moveTo(px,py);else this.frame.lineTo(px,py);}this.frame.strokePath();
  if(locked)this.frame.fillStyle(0x15202b,.9).fillRoundedRect(x-15,y-62,30,29,4).lineStyle(3,c).strokeCircle(x,y-67,9).fillStyle(c).fillRect(x-3,y-53,6,11);
 }
 renderEntrance(x,y,c,active,phase,locked){
  const garage=this.d.presentation==='garage',f=this.floor,b=this.back,g=this.frame;
  f.clear().fillStyle(c,.12).fillRect(x-72,y+4,144,20).lineStyle(active?3:2,active?NAV_COLORS.objective:c,.9).strokeRect(x-72,y+4,144,20);
  b.clear();g.clear();
  if(garage){b.fillStyle(0x1e3039).fillRect(x-62,y-82,124,87).fillStyle(0x355052).fillRect(x-56,y-76,112,70).fillStyle(0x192a31).fillRect(x-48,y-62,96,61);g.fillStyle(0xbdb39a).fillRect(x-70,y-90,140,8).fillRect(x-70,y-82,8,87).fillRect(x+62,y-82,8,87);for(let i=0;i<3;i++)g.lineStyle(2,0x738680).lineBetween(x-59,y-77+i*5,x+59,y-77+i*5);}
  // A compact green vortex sits inside the physical entrance, leaving the frontage readable.
  const cy=y-(garage?32:4),rx=garage?38:55,ry=garage?29:16;
  for(let ring=0;ring<2;ring++){g.lineStyle(ring?2:4,c,ring?.55:.9).beginPath();for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,r=1+Math.sin(a*7+phase*2)*.04,px=x+Math.cos(a)*(rx-ring*8)*r,py=cy+Math.sin(a)*(ry-ring*5)*r;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.closePath().strokePath();}
  g.lineStyle(2,0xe0ffaf,.8).beginPath();for(let i=0;i<48;i++){const t=i/47,a=t*Math.PI*4+phase,px=x+Math.cos(a)*rx*t*.75,py=cy+Math.sin(a)*ry*t*.75;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.strokePath();
  if(locked)g.fillStyle(0x15202b).fillRect(x-10,cy-9,20,18).lineStyle(2,c).strokeCircle(x,cy-12,7);
 }
}
