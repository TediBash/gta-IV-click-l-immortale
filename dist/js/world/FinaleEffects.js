import {prop} from '../data/skins.js';
import {chapterArt,pointLines} from '../data/dialogues.js';
export class FinaleEffects{
 constructor(controller){this.controller=controller;this.scene=controller.scene;this.session=controller.session;this.refresh();}
 refresh(){if(this.controller.busy)return;const s=this.scene;if(s.mission.id===9&&this.controller.zone==='meeting'){s.gate.view.setVisible(this.session.has('meet'));s.gate.marker.setVisible(this.session.has('meet'));}}
 animatePoint(p,show){
  if(!p.action)return false;const s=this.scene,c=this.controller;c.busy=true;s.activeMission=false;s.app.input.enabled=false;s.app.input.clear();
  const done=()=>{c.busy=false;this.refresh();if(s.mission.id===10){show();return;}s.playDialogue({kicker:p.label,lines:pointLines(s.mission.id,p),art:chapterArt(s.mission.id,s.mission.state.index,true)});};
  const duration=s.app.settings.reduceMotion?0:900;
  if(p.action==='arrival'||p.action==='homeward'){
   const car=prop(s,p.action==='homeward'?'van':'tuned',1200,600,150,1800);s.tweens.add({targets:car,x:720,duration,onComplete:()=>{car.destroy();done();}});
  }else if(p.action==='partyTogether'||p.action==='birthdayFinale'||p.action==='regroup'){
   if(p.action==='partyTogether')s.party.forEach(a=>{a.hp=a.data.hp;a.ko=false;a.state='IDLE';});
   if(p.action==='regroup')s.party.forEach(a=>{a.hp=Math.min(a.data.hp,a.hp+50);if(a.hp>0)a.ko=false;});
   for(const a of s.party){if(!a.ko)a.celebrate();s.fx.burst(a.x,a.y,0xf7d84a,70);}
   s.time.delayedCall(duration,done);
  }else{
   const mark=s.add.circle(p.x,p.y-30,25,0xf7d84a,.22).setStrokeStyle(3,0xf7d84a).setDepth(1800);
   s.tweens.add({targets:mark,scale:3,alpha:0,duration,onComplete:()=>{mark.destroy();done();}});
  }
  return true;
 }
}
