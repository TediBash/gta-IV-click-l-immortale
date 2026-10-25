export const SPECIAL_FX={click:['BOOM!',0xf7d84a],ted:['ZAP!',0x66d7d0],spit:['SKRREE!',0xd9a6ee],bruce:['WHAM!',0xeebc8e],andy:['BLING!',0xeea6db],carlitos:['SHING!',0x89dfdf],ale:['BASTA!',0xffb967],luca:['ZZZT!',0x90beee],anna:['VITA!',0xa3d1a2],paula:['GEMELLI!',0xc9b7f0],nico:['GEMELLI!',0x7d9bdf]};
/** Bounded ephemeral objects; scene teardown also cancels their tweens. */
export class CombatEffects{
 constructor(scene){this.scene=scene;this.objects=new Set();this.lastWord=-Infinity;}
 get reduced(){return !!this.scene.app.settings.reduceMotion;}
 track(view,options={}){while(this.objects.size>=80){const old=this.objects.values().next().value;this.scene.tweens.killTweensOf(old);old.destroy();this.objects.delete(old);}this.objects.add(view);this.scene.tweens.add({targets:view,alpha:0,duration:this.reduced?380:550,...options,onComplete:()=>{this.objects.delete(view);view.destroy();}});return view;}
 word(x,y,text,color=0xf7d84a,force=false){if(!force&&this.scene.now-this.lastWord<160)return;this.lastWord=this.scene.now;const view=this.scene.add.text(x,y-65,text,{fontFamily:'Impact,Arial Black,sans-serif',fontStyle:'bold',fontSize:text.length>7?23:30,color:'#'+color.toString(16).padStart(6,'0'),stroke:'#14212c',strokeThickness:6}).setOrigin(.5).setDepth(2300);if(!this.reduced)view.setAngle(-9);this.track(view,this.reduced?{}:{y:y-105,scale:1.2,duration:650});}
 burst(x,y,color=0xf7d84a,radius=90){
  const s=this.scene,ring=s.add.circle(x,y-22,12,color,.12).setStrokeStyle(3,color).setDepth(y+15);this.track(ring,this.reduced?{}:{scale:radius/12});
  if(this.reduced)return;
  for(let i=0;i<8;i++){const angle=i*Math.PI/4,star=s.add.rectangle(x,y-22,5,12,color).setRotation(angle).setDepth(y+16);this.track(star,{x:x+Math.cos(angle)*radius,y:y-22+Math.sin(angle)*radius,angle:i*45+100,duration:430});}
 }
 beam(x,y,tx,ty,color){const g=this.scene.add.graphics().setDepth(2100);g.lineStyle(5,color,.85).lineBetween(x,y-25,tx,ty-25);this.track(g,{duration:this.reduced?180:320});}
 special(actor){const [word,color]=SPECIAL_FX[actor.id];this.word(actor.x,actor.y,word,color,true);this.burst(actor.x,actor.y,color,130);}
 hit(x,y,finisher=false){this.word(x,y,finisher?'BAM!!':'POW!',finisher?0xf7d84a:0xffefcc);this.burst(x,y,0xffefcc,finisher?75:35);}
 ko(enemy){this.word(enemy.x,enemy.y,'KO!',0xffb46b,true);this.burst(enemy.x,enemy.y,0xffb46b,100);}
}
