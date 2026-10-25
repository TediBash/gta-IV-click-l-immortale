export class LootCrate{
 constructor(scene,x,y,type){
  Object.assign(this,{scene,x,y,type,hp:35,destroyed:false});this.view=scene.add.container(x,y).setDepth(y);
  const shadow=scene.add.ellipse(0,0,44,15,0x0b1f26,.35),sprite=scene.add.image(0,0,'props',type).setOrigin(.5,.85).setDisplaySize(67,67);
  this.view.add([shadow,sprite]);
 }

 hit(damage,actor){if(this.destroyed)return;this.hp-=damage;this.scene.floatText(this.x,this.y-45,`${Math.ceil(damage)}`,'#f7d84a');if(this.hp<=0){this.destroyed=true;this.view.destroy();this.scene.onLoot(this.type,this.x,this.y,actor);}else{this.view.setAngle(-5);this.scene.tweens.add({targets:this.view,angle:0,duration:110});}}
}
export class LevelGate{
 constructor(scene,x,y,isVan=false){Object.assign(this,{scene,x,y,isVan});this.view=scene.add.container(x,y).setDepth(y-40);const g=scene.add.graphics();if(isVan){const skin=scene.mission.config.gateSkin||'van';this.view.add(scene.add.image(0,-25,'props',skin).setDisplaySize(145,145));}else{g.fillStyle(0x132733).fillRect(-46,-70,92,80);g.lineStyle(4,0x84a698).strokeRect(-46,-70,92,80);g.fillStyle(0x314b59).fillRect(-39,-64,78,68);for(let y=-60;y<0;y+=12)g.lineStyle(2,0x1b3340).lineBetween(-39,y,39,y);}this.view.add(g);this.label=scene.add.text(0,isVan?-105:-92,isVan?'USCITA':'INGRESSO',{fontSize:11,fontFamily:'monospace',color:'#a8c0b3'}).setOrigin(.5);this.view.add(this.label);this.marker=scene.add.text(x,y+35,'◇',{fontSize:30,color:'#f7d84a'}).setOrigin(.5).setDepth(y+50);}
 update(open,time){this.label.setText(open?(this.isVan?'A / J · SALI':'A / J · ENTRA'):this.isVan?'MEZZO DI FUGA':'COMPLETA GLI OBIETTIVI');this.marker.setColor(open?'#70e6d0':'#c99cff').setAlpha(.55+Math.sin(time/350)*.3);}
}
