import {NAV_COLORS} from './NavigationModel.js';
/** Neon, irregular vortex with a recessed center and a foreground lower lip. */
export class PortalView{
 constructor(s,d){this.s=s;this.d=d;this.floor=s.add.graphics().setDepth(3);this.back=s.add.graphics().setDepth(d.y-100);this.frame=s.add.graphics().setDepth(d.y+2);this.label=s.add.text(d.x,d.y-126,d.label,{fontFamily:'Arial',fontStyle:'bold',fontSize:13,color:'#eafff8',backgroundColor:'#10242e',padding:{x:8,y:5},wordWrap:{width:190},align:'center'}).setOrigin(.5,1).setDepth(1500);this.update(false,false);this.render(0);}
 update(locked,active,alarm=false){this.dirty=this.dirty||this.locked!==locked||this.active!==active||this.alarm!==alarm;this.locked=locked;this.active=active;this.alarm=alarm;this.label.setText((alarm?'ALLARME · ':locked?'BLOCCATO · ':active?'QUI → ':'ENTRA · ')+this.d.label).setColor(alarm?'#ff7c85':locked?'#d9b7ff':active?'#ffda69':'#c3ff97');}
 render(time){const reduced=!!this.s.app.settings.reduceMotion;if(!this.dirty&&this.lastMotion===reduced&&(reduced||time-(this.lastRender||0)<50))return;this.dirty=false;this.lastRender=time;this.lastMotion=reduced;const {x,y}=this.d,locked=this.locked,active=this.active,phase=this.s.app.settings.reduceMotion?0:time/1400,c=this.alarm?0xff515c:locked?NAV_COLORS.locked:NAV_COLORS.door;
  this.floor.clear().fillStyle(c,.14).fillEllipse(x,y+10,134,48).lineStyle(active?3:2,active?NAV_COLORS.objective:c,.9).strokeEllipse(x,y+10,134,48);
  for(let i=0;i<2;i++)this.floor.lineStyle(3,c,.8).beginPath().moveTo(x-12,y+42-i*14).lineTo(x,y+32-i*14).lineTo(x+12,y+42-i*14).strokePath();
  const g=this.back;g.clear().fillStyle(0x152819).fillEllipse(x,y-48,102,133).fillStyle(c,.22).fillEllipse(x,y-48,94,125);
  for(let ring=0;ring<3;ring++){g.lineStyle(ring===0?8:3,c,ring===0?.8:.48).beginPath();for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,r=1+Math.sin(a*7+phase*2)*.045+Math.sin(a*11-phase)*.025,px=x+Math.cos(a)*(52-ring*8)*r,py=y-48+Math.sin(a)*(68-ring*10)*r;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.closePath().strokePath();}
  for(let strand=0;strand<3;strand++){g.lineStyle(3,strand===0?0xe3ffa1:c,.8).beginPath();for(let i=0;i<80;i++){const t=i/79,a=t*Math.PI*4+phase+strand*Math.PI*2/3,r=3+t*40,px=x+Math.cos(a)*r,py=y-48+Math.sin(a)*r*1.32;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.strokePath();}
  this.frame.clear().lineStyle(6,c,.9).beginPath();for(let i=0;i<=24;i++){const a=i/24*Math.PI,px=x+Math.cos(a)*52,py=y-48+Math.sin(a)*68;if(i===0)this.frame.moveTo(px,py);else this.frame.lineTo(px,py);}this.frame.strokePath();
  if(locked)this.frame.fillStyle(0x15202b,.9).fillRoundedRect(x-15,y-62,30,29,4).lineStyle(3,c).strokeCircle(x,y-67,9).fillStyle(c).fillRect(x-3,y-53,6,11);
 }
}
