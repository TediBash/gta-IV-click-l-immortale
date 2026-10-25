import {navigationState,guidePath,remainingPath,NAV_COLORS} from './NavigationModel.js';
import {PortalView} from './PortalView.js';
const same=(a,b)=>!!a&&!!b&&Math.hypot(a.x-b.x,a.y-b.y)<4;
export class NavigationGuide{
 constructor(s){this.s=s;this.g=s.add.graphics().setDepth(6);this.pointer=s.add.graphics().setDepth(2450);this.portals=new Map();this.status=s.add.text(12,12,'',{fontFamily:'Arial',fontStyle:'bold',fontSize:12,color:'#ffdf7d',backgroundColor:'#10242ee8',padding:{x:8,y:6}}).setScrollFactor(0).setDepth(3050);this.legend=s.add.text(0,0,'◇ Obiettivo · ▯ Porta\nViola: bloccata · ● Tu\nPunti rosa: nemici\nRosso: allarme',{fontFamily:'Arial',fontSize:10,color:'#d0e4e4',backgroundColor:'#10242ee8',padding:{x:5,y:4}}).setScrollFactor(0).setDepth(3050);this.next=0;
  if(s.gate.x>0&&!s.gate.isVan&&!s.race){this.gatePortal=new PortalView(s,{x:s.gate.x,y:s.gate.y,label:'PROSEGUI'});s.gate.view.setVisible(false);s.gate.marker.setVisible(false);}
 }
 update(){const s=this.s;if(s.isHideout)return;const width=s.cameras.main.width;
  if(s.now>=this.next||!this.state){this.state=navigationState(s);this.path=guidePath(s.map,s.player,this.state.target);this.next=s.now+250;
   for(const d of this.state.doors){if(!this.portals.has(d.id))this.portals.set(d.id,new PortalView(s,d));this.portals.get(d.id).update(d.locked,same(d,this.state.target),!!d.alarm);}
  }
  for(const portal of this.portals.values())portal.render(s.now);
  if(this.gatePortal){this.gatePortal.update(!s.mission.canExit()||!!s.exitBlocked(),same(this.state.target,s.gate),!!s.director.helicopters?.alert);this.gatePortal.render(s.now);}
  const target=this.state.target,color=target?.kind==='door'?NAV_COLORS.door:NAV_COLORS.objective;this.g.clear();this.pointer.clear();
  const statusWidth=Math.max(100,width-180);this.status.setWordWrapWidth(statusWidth).setPosition(10,s.race||s.director.alert?58:12).setText(target?'PROSSIMO · '+target.label:'Consulta il diario della missione').setVisible(s.activeMission);
  this.legend.setPosition(width-148,100).setVisible(true);
  if(!target)return;
  this.g.lineStyle(3,color,.8).strokeCircle(target.x,target.y+4,28).lineStyle(2,color,.3).strokeCircle(target.x,target.y+4,34);
  const path=remainingPath(this.path||[],s.player);
  // At most the first 240 pixels of trail, leaving enemies and the scene legible.
  let budget=240;for(let i=1;i<path.length&&budget>0;i++){const a=path[i-1],b=path[i],len=Math.hypot(b.x-a.x,b.y-a.y);for(let d=14;d<len&&d<budget;d+=23)this.g.fillStyle(color,.65).fillCircle(a.x+(b.x-a.x)*d/len,a.y+(b.y-a.y)*d/len,3);budget-=len;}
  const near=Math.hypot(target.x-s.player.x,target.y-s.player.y)<64;
  const next=path.slice(1).find(p=>Math.hypot(p.x-s.player.x,p.y-s.player.y)>25);
  if(next&&!near){const angle=Math.atan2(next.y-s.player.y,next.x-s.player.x),cx=s.player.x+Math.cos(angle)*57,cy=s.player.y+Math.sin(angle)*57;this.pointer.setPosition(cx,cy).setRotation(angle).fillStyle(0x10242e).fillTriangle(14,0,-9,-11,-9,11).fillStyle(color).fillTriangle(10,0,-6,-7,-6,7);}
 }
 drawMinimap(g,x,y,w,h){const s=this.s,state=this.state||navigationState(s),px=p=>x+p.x/1280*w,py=p=>y+p.y/800*h;
  for(const p of state.points)g.lineStyle(1,NAV_COLORS.objective).strokeRect(px(p)-2,py(p)-2,4,4);
  const doors=[...state.doors,...(s.gate.x>0?[{x:s.gate.x,y:s.gate.y,locked:!s.mission.canExit()||!!s.director.helicopters?.alert,alarm:!!s.director.helicopters?.alert}]:[])];
  for(const d of doors)g.lineStyle(2,d.alarm?0xff515c:d.locked?NAV_COLORS.locked:NAV_COLORS.door).strokeRect(px(d)-3,py(d)-3,6,6);
  for(const light of s.director.helicopters?.state.lights||[])g.lineStyle(1,s.director.helicopters.alert?0xff515c:0xffef9d).strokeCircle(px(light),py(light),light.radius/1280*w);
  const t=state.target;if(t){g.lineStyle(1,NAV_COLORS.objective).strokeCircle(px(t),py(t),6);const path=this.path||[];g.lineStyle(1,NAV_COLORS.objective,.7);for(let i=1;i<path.length;i++)g.lineBetween(px(path[i-1]),py(path[i-1]),px(path[i]),py(path[i]));}
  for(const p of s.party.filter(a=>!a.ko&&!a.hidden&&a!==s.player))g.fillStyle(0x88b9c2).fillCircle(px(p),py(p),2);
  const p=s.player;g.lineStyle(2,0x10242e).fillStyle(NAV_COLORS.player).fillCircle(px(p),py(p),3.5).strokeCircle(px(p),py(p),4);
 }
}
