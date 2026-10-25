/** Equipment silhouettes are drawn over the established four-direction sprites. */
export function drawEnemyGear(actor){
 const g=actor.gear;if(!g)return;const p=actor.profile,c=parseInt(p.color.slice(1),16),left=actor.direction==='left'?-1:1;
 g.clear().setPosition(actor.x,actor.y).setDepth(actor.y+.7).setAlpha(actor.ko?.35:1).setAngle(actor.ko?80:0).lineStyle(3,0x172738).fillStyle(c);
 if(p.gear==='shield')g.fillRoundedRect(left*12-18,-62,36,50,6).strokeRoundedRect(left*12-18,-62,36,50,6).fillStyle(0x173449).fillRect(left*12-10,-51,20,9);
 if(p.gear==='visor')g.fillRect(-15,-68,30,9).fillStyle(0x172b26).fillRect(-10,-65,8,4).fillRect(3,-65,8,4);
 if(p.gear==='pack'||p.gear==='medic'){g.fillRoundedRect(-29,-58,20,35,4).strokeRoundedRect(-29,-58,20,35,4);if(p.gear==='medic')g.fillStyle(0x135a45).fillRect(-22,-52,6,22).fillRect(-28,-44,18,6);else g.fillStyle(0x624529).fillRect(-25,-50,12,5).fillRect(-25,-38,12,5);}
 if(p.gear==='blades')g.lineStyle(6,c).lineBetween(-26,-16,-18,-55).lineBetween(26,-16,18,-55);
 if(p.gear==='hammer')g.lineStyle(6,0x795845).lineBetween(28,-15,28,-82).fillStyle(c).fillRoundedRect(6,-90,44,20,3).strokeRoundedRect(6,-90,44,20,3);
 if(p.gear==='command')g.fillRect(-23,-66,46,7).fillStyle(0xffe49a).fillTriangle(0,-90,-9,-72,9,-72).fillRect(-22,-45,12,7).fillRect(10,-45,12,7);
 if(p.gear==='diamond')g.fillTriangle(0,-62,-13,-47,13,-47).fillTriangle(0,-28,-13,-47,13,-47);
 if(p.gear==='drone'){const bob=actor.scene.app?.settings?.reduceMotion?0:Math.sin(actor.scene.now/180)*3;g.fillStyle(0x233846).fillRect(-15,-35,30,16).fillStyle(c).fillRect(-10,-32,20,7).lineStyle(3,c).lineBetween(20,-93+bob,48,-75+bob).lineBetween(48,-93+bob,20,-75+bob);for(const [x,y]of[[20,-93],[48,-75],[48,-93],[20,-75]])g.strokeCircle(x,y+bob,7);g.fillRect(28,-89+bob,12,10);}
 if(actor.scene.now<(actor.hasteUntil||0))g.lineStyle(3,0xf7e6a0).lineBetween(-22,-10,-30,-3).lineBetween(22,-10,30,-3);
}
