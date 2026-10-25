import {drawCar} from '../world/RaceController.js';
export function signature(scene,actor){
 if(!scene.add?.graphics)return;
 const color={click:0xffd35c,andy:0xf29aca,ale:0xffa75e,carlitos:0x89f0e8,paula:0xdc9eff,nico:0x98b9ff}[actor.id];if(!color)return;
 const duration=scene.app?.settings?.reduceMotion?180:650;
 if(actor.id==='andy'){
  const car=drawCar(scene,actor.x-100,actor.y-45,'luxury',.9).setDepth(actor.y+25);
  scene.tweens.add({targets:car,x:actor.x+80,alpha:0,duration:duration+250,onComplete:()=>car.destroy()});return;
 }
 if(actor.id==='carlitos'){
  for(let i=0;i<8;i++){const angle=i*Math.PI/4,g=scene.add.graphics().setDepth(actor.y+15);g.fillStyle(color,.9).fillTriangle(-8,0,0,-13,8,0).fillTriangle(-8,0,0,13,8,0);g.setPosition(actor.x,actor.y-30);scene.tweens.add({targets:g,x:actor.x+Math.cos(angle)*230,y:actor.y+Math.sin(angle)*230,angle:180,alpha:0,duration,onComplete:()=>g.destroy()});}return;
 }
 for(let i=0;i<3;i++){
  const ring=scene.add.graphics().setDepth(actor.y+15);ring.lineStyle(5-i,color,.85).strokeCircle(0,0,30+i*16);ring.setPosition(actor.x,actor.y-25);
  scene.tweens.add({targets:ring,scale:actor.id==='ale'?5:3.5,alpha:0,duration:duration+i*100,onComplete:()=>ring.destroy()});
 }
 if(['paula','nico'].includes(actor.id)){
  const partner=scene.party.find(p=>p.id===(actor.id==='paula'?'nico':'paula')&&!p.ko&&!p.hidden&&Math.hypot(p.x-actor.x,p.y-actor.y)<280);
  if(partner){const arc=scene.add.graphics().setDepth(1800).lineStyle(12,color,.6).lineBetween(actor.x,actor.y,partner.x,partner.y);scene.tweens.add({targets:arc,alpha:0,duration,onComplete:()=>arc.destroy()});}
 }
}
export function crashDrone(scene,actor,target,delay=0){
 scene.audio.effect('drone');
 const aim={x:target.x,y:target.y},drone=scene.add.container(actor.x,actor.y-80).setDepth(2000),g=scene.add.graphics();
 g.lineStyle(4,0x9de0df).lineBetween(-22,0,22,0).lineBetween(0,-14,0,14);g.fillStyle(0x277980).fillRect(-9,-7,18,14);g.lineStyle(2,0xe0fffa).strokeEllipse(-22,0,20,8).strokeEllipse(22,0,20,8);drone.add(g);
 const reduced=scene.app?.settings?.reduceMotion,impact=()=>{
  drone.destroy();scene.fx?.burst(aim.x,aim.y,0xffbd64,120);scene.fx?.word(aim.x,aim.y,'BOOM!',0xffbd64,true);scene.audio.effect('explosion');
  const flash=scene.add.circle(aim.x,aim.y,25,0xffe1a3,.7).setDepth(1900);scene.tweens.add({targets:flash,scale:4,alpha:0,duration:reduced?150:450,onComplete:()=>flash.destroy()});
  for(const e of scene.enemies)if(!e.ko&&Math.hypot(e.x-aim.x,e.y-aim.y)<120&&scene.map.clearLine(aim.x,aim.y,e.x,e.y))e.hit(90,actor);
 };
 scene.tweens.add({targets:drone,x:aim.x,y:aim.y-100,duration:reduced?100:450,delay,onComplete:()=>{scene.audio.effect('dive');scene.tweens.add({targets:drone,y:aim.y,angle:35,duration:reduced?100:320,onComplete:impact});}});
}
