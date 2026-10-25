/** Three uninterrupted seconds outside every spotlight; simulation time only. */
export class SearchlightAlert{
 constructor(lights,saved={}){this.lights=lights.map(([x,y,amplitude,speed],i)=>({x:saved.centers?.[i]?.x??x,y:saved.centers?.[i]?.y??y,homeX:x,homeY:y,amplitude,speed,phase:i*2,radius:75}));this.alert=!!saved.alert;this.outsideMs=Math.min(2999,Math.max(0,saved.outsideMs||0));this.inside=false;}
 contains(p){return this.lights.some(l=>Math.hypot(p.x-l.x,p.y-l.y)<=l.radius);}
 update(dt,now,p){
  const step=Math.max(0,Math.min(dt,.04));
  for(const l of this.lights){const sweep={x:l.homeX+Math.sin(now/1000*l.speed+l.phase)*l.amplitude,y:l.homeY+Math.cos(now/1300+l.phase)*45};const distance=Math.hypot(p.x-l.x,p.y-l.y),tracking=distance<300;const dx=tracking?p.x-sweep.x:0,dy=tracking?p.y-sweep.y:0,n=Math.hypot(dx,dy)||1,reach=Math.min(115,n)*.8;const tx=Math.max(80,Math.min(1200,sweep.x+dx/n*reach)),ty=Math.max(90,Math.min(710,sweep.y+dy/n*reach)),mx=tx-l.x,my=ty-l.y,d=Math.hypot(mx,my)||1,travel=Math.min(d,(tracking?52:38)*step);l.x+=mx/d*travel;l.y+=my/d*travel;}
  this.inside=this.contains(p);if(this.inside){this.alert=true;this.outsideMs=0;}else if(this.alert){this.outsideMs+=step*1000;if(this.outsideMs>=3000){this.alert=false;this.outsideMs=0;}}
 }
 get remaining(){return Math.max(0,3-this.outsideMs/1000);}
 snapshot(){return {alert:this.alert,outsideMs:this.outsideMs,centers:this.lights.map(l=>({x:l.x,y:l.y}))};}
}
export class HelicopterSearch{
 constructor(s,lights,saved){this.s=s;this.state=new SearchlightAlert(lights,saved);this.views=this.state.lights.map(l=>({beam:s.add.circle(l.x,l.y,l.radius,0xffef9d,.16).setStrokeStyle(3,0xffedaa,.9).setDepth(5),aircraft:s.add.graphics().setDepth(1800)}));}
 get alert(){return this.state.alert;}
 snapshot(){return this.state.snapshot();}
 update(dt){const s=this.s,before=this.alert;this.state.update(dt,s.now,s.player);if(before!==this.alert){s.navigation&&(s.navigation.next=0);s.adventureController?.save();s.toast(this.alert?'INDIVIDUATO! Esci dai fari: varchi bloccati.':'ALLARME RIENTRATO · Varchi riaperti');}this.render();}
 render(){const s=this.s;this.state.lights.forEach((l,i)=>{const v=this.views[i],color=this.alert?0xff515c:0xffef9d;v.beam.setPosition(l.x,l.y).setFillStyle(color,this.alert?.25:.16).setStrokeStyle(3,color,1);const g=v.aircraft;g.clear().setPosition(l.x-22,l.y-135).fillStyle(0x233734).fillEllipse(0,0,42,22).fillStyle(0x98c9bb).fillRect(6,-6,11,10).lineStyle(5,0x233734).lineBetween(-15,0,-47,0).lineBetween(-47,-12,-47,12);const a=s.app.settings.reduceMotion?0:s.now/90;g.lineStyle(3,0xb4c9a6).lineBetween(Math.cos(a)*38,Math.sin(a)*10,-Math.cos(a)*38,-Math.sin(a)*10).fillStyle(this.alert?0xff515c:0xc2f6d3).fillCircle(20,0,3);});
  s.director?.alert?.setText(this.alert?(this.state.inside?'ALLARME · ESCI DAL CERCHIO ROSSO':`RESTA FUORI DAI FARI · ${this.state.remaining.toFixed(1)} s`):'FARI IN RICERCA · B / K SCATTO');
 }
 guidance(p,map){if(!this.alert)return null;let target={x:p.x,y:p.y};if(this.state.contains(p)){
  outer:for(let radius=100;radius<=500;radius+=40)for(let i=0;i<16;i++){const angle=i*Math.PI/8,q={x:p.x+Math.cos(angle)*radius,y:p.y+Math.sin(angle)*radius};if(!map.blocked(q.x,q.y,20)&&!this.state.lights.some(l=>Math.hypot(q.x-l.x,q.y-l.y)<l.radius+35)&&map.clearLine(p.x,p.y,q.x,q.y)){target=q;break outer;}}
 }return {...target,kind:'objective',label:this.state.inside?'Esci dai fari rossi':`Resta al riparo · ${this.state.remaining.toFixed(1)} s`};}
}
