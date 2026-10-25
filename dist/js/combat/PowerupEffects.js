/** Small vector props attach to the existing character skin in every facing direction. */
export function powerGraphic(s){return s.add?.graphics?.().setDepth(1850)||null;}
export function drawPower(g,s,a,kind,phase=0,target=null){
 if(!g)return;const reduced=!!s.app?.settings?.reduceMotion;
 g.clear().setPosition(a.x,a.y-38).setDepth(a.y+20);
 const direction=target?Math.atan2(target.y-a.y,target.x-a.x):({right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[a.direction]||0);
 if(kind==='boxer'||kind==='guard'){
  g.setRotation(direction);const reach=kind==='guard'?9:reduced?18:10+Math.sin(Math.min(1,phase)*Math.PI)*30;
  g.lineStyle(6,0xffd35c,.65).lineBetween(0,-10,reach,-10).lineBetween(-4,10,reach*.65,10);
  g.fillStyle(0xf8d55a).fillRoundedRect(reach-3,-18,19,15,5).fillRoundedRect(reach*.65-7,3,19,15,5);
  g.lineStyle(2,0xffffff,.8).strokeRoundedRect(reach-3,-18,19,15,5);
 }else if(kind==='kit'){
  g.fillStyle(0xf3f6e8).fillRoundedRect(-18,-8,36,26,5).lineStyle(3,0x87bd9f).strokeRoundedRect(-18,-8,36,26,5);
  g.fillStyle(0x46a77b).fillRect(-3,-3,6,16).fillRect(-8,2,16,6);g.lineStyle(3,0xd9e8de).strokeRect(-8,-15,16,7);
 }else if(kind==='shield'){
  g.lineStyle(3,0x8af0bd,.9).strokeEllipse(0,0,60,82);g.lineStyle(2,0xc9ffdd,.7).strokeEllipse(0,0,49,70);
 }else if(kind==='judo'){
  g.setRotation(direction);g.lineStyle(7,0x90beee).lineBetween(-5,-10,28,-16).lineBetween(-6,12,28,12);g.fillStyle(0xf3cfb2).fillCircle(28,-16,5).fillCircle(28,12,5);
 }else if(kind==='bee'){
  const orbit=reduced?0:phase*Math.PI*2,ox=target?target.x-a.x:Math.cos(orbit)*42,oy=target?target.y-a.y:Math.sin(orbit)*13-45;
  g.setPosition(a.x+ox,a.y+oy-32);g.fillStyle(0xc6efff,.8).fillEllipse(-8,-8,18,10).fillEllipse(8,-8,18,10);g.fillStyle(0xffd56c).fillEllipse(0,0,22,14);g.lineStyle(3,0x34444c).lineBetween(-3,-6,-3,6).lineBetween(3,-6,3,6);g.fillStyle(0x243d48).fillCircle(10,-2,3);
 }
}
export function pulseHeart(s,p,revived=false){
 s.fx?.burst(p.x,p.y,0x8ce5ac,revived?95:55);
 const g=powerGraphic(s);if(!g)return;
 g.setPosition(p.x,p.y-76).fillStyle(0x8ce5ac).fillCircle(-5,-3,7).fillCircle(5,-3,7).fillTriangle(-12,0,12,0,0,14);
 s.tweens.add({targets:g,y:p.y-(s.app.settings.reduceMotion?76:110),alpha:0,duration:600,onComplete:()=>g.destroy()});
}
