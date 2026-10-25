import {prop} from '../data/skins.js';
/** Visual feedback for the archive and Luca's workshop, driven by saved objectives. */
export class PreparationEffects{
 constructor(controller){this.controller=controller;this.scene=controller.scene;this.session=controller.session;this.displays=[];this.draw();}
 draw(){
  const s=this.scene,z=this.controller.zone;
  if(s.mission.id===8&&z==='workshop'){
   this.bee=prop(s,'bee',1050,265,62,1000);this.counter=s.add.text(650,125,'',{fontFamily:'monospace',fontSize:13,color:'#f7e29b',backgroundColor:'#173840',padding:{x:8,y:6}}).setOrigin(.5).setDepth(1000);
  }
  if(s.mission.id===8&&z==='range')this.targets=[[680,360],[980,230],[1040,580]].map(([x,y],i)=>{const ring=s.add.circle(x,y,27,0x6ca8be,.18).setStrokeStyle(3,0x8cd7e0).setDepth(4);s.add.text(x,y,String(i+1),{fontSize:15,color:'#f7e29b'}).setOrigin(.5).setDepth(5);return ring;});
  if(['archive','telemetry'].includes(z))this.status=s.add.text(650,125,'',{fontFamily:'monospace',fontSize:13,color:'#a8e7cb',backgroundColor:'#173840',padding:{x:8,y:6}}).setOrigin(.5).setDepth(1000);
  this.refresh();
 }
 refresh(){
  if(this.controller.busy)return;
  const built=this.session.has('bench');this.bee?.setVisible(built);
  const count=['part0','part1','part2'].filter(id=>this.session.has(id)).length;
  this.counter?.setText(built?'APE ASSEMBLATA · PRONTA AL COLLAUDO':`COMPONENTI ${count}/3 · TORNA AL BANCO CON LUCA`);
  this.status?.setText(this.session.has(this.scene.mission.id===7?'check':'data')?'VERIFICA COMPLETA · DATI SALVATI':'TERMINALE · SERVE TED');
  if(this.session.has('test'))this.targets?.forEach(t=>t.setStrokeStyle(3,0x9be5a3));
 }
 animatePoint(p,show){
  if(!['scan','assemble','flight','pack'].includes(p.action))return false;
  const s=this.scene,c=this.controller;c.busy=true;s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();
  const done=()=>{c.busy=false;this.refresh();show();};
  const duration=n=>s.app.settings.reduceMotion?0:n;
  if(p.action==='scan'){
   const bar=s.add.rectangle(p.x,p.y-55,110,5,0x9ce6dc,.85).setDepth(1700);
   s.tweens.add({targets:bar,y:p.y+25,duration:duration(900),onComplete:()=>{bar.destroy();done();}});
  }
  if(p.action==='assemble'){
   const parts=[[-90,0],[80,20],[0,70]].map(([x,y])=>prop(s,'upgrade',p.x+x,p.y+y,35,1700));this.bee?.setVisible(false);
   s.bus.emit('special:activated',{name:'Luca',ability:'APE · ASSEMBLAGGIO COMPLETATO'});
   s.tweens.add({targets:parts,x:p.x,y:p.y-40,scale:.3,duration:duration(1100),onComplete:()=>{parts.forEach(v=>v.destroy());s.fx.burst(p.x,p.y-40,0xf7d84a,65);s.celebratePickup(s.player,{name:'APE pronta!',skin:'bee'});done();}});
  }
  if(p.action==='flight'){
   const bee=prop(s,'bee',p.x,p.y-45,56,1700),points=[[p.x,p.y-45],[680,325],[980,195],[1040,545]],progress={t:0};let reached=0;
   s.tweens.add({targets:progress,t:3,duration:duration(1800),onUpdate:()=>{const i=Math.min(2,Math.floor(progress.t)),f=progress.t-i;bee.setPosition(points[i][0]+(points[i+1][0]-points[i][0])*f,points[i][1]+(points[i+1][1]-points[i][1])*f);while(reached<Math.floor(progress.t)){const target=this.targets[reached++];target.setStrokeStyle(3,0x9be5a3);s.fx.burst(target.x,target.y,0x9be5a3,35);}},onComplete:()=>{bee.destroy();done();}});
  }
  if(p.action==='pack'){
   const bee=prop(s,'bee',p.x,p.y-70,58,1700),caseArt=prop(s,'bag',p.x,p.y,66,1600);
   s.tweens.add({targets:bee,y:p.y,alpha:0,duration:duration(800),onComplete:()=>{bee.destroy();caseArt.destroy();s.celebratePickup(s.player,{name:'Custodia APE',skin:'bag'});done();}});
  }
  return true;
 }
}
