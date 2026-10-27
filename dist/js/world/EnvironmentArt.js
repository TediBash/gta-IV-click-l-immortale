/** Shared native renderer: batch by depth and fade occluding facades only. */
export function drawEnvironment(scene,layout){
 const layers=new Map(),labels=[];
 const graphic=z=>{if(!layers.has(z))layers.set(z,scene.add.graphics().setDepth(z));return layers.get(z);};
 for(const c of layout.commands){
  if(c.kind==='text'){labels.push({depth:c.depth,view:scene.add.text(c.x,c.y,c.value,{fontFamily:'monospace',fontStyle:'bold',fontSize:c.size,color:'#'+c.color.toString(16).padStart(6,'0'),resolution:2}).setOrigin(c.align==='left'?0:.5,.5).setDepth(c.depth)});continue;}
  const g=graphic(c.depth);
  if(c.kind==='line'){g.lineStyle(c.width,c.color,c.alpha).lineBetween(c.x,c.y,c.x2,c.y2);continue;}
  g.fillStyle(c.color,c.alpha);
  if(c.kind==='rect')g.fillRect(c.x,c.y,c.w,c.h);
  if(c.kind==='ellipse')g.fillEllipse(c.x,c.y,c.w,c.h);
  if(c.kind==='poly'){g.beginPath().moveTo(...c.points[0]);for(const p of c.points.slice(1))g.lineTo(...p);g.closePath().fillPath();}
 }
 let previous='';
 return {layout,update(player){
  // Fade high facades only when they overlap the controlled actor; no per-frame redraw.
  const hidden=layout.occluders.filter(b=>player.x>b.x-18&&player.x<b.x+b.w+18&&player.y>b.y-5&&player.y<b.y+b.h).map(b=>b.depth),key=hidden.join(',');
  if(key===previous)return;previous=key;
  for(const b of layout.occluders){const alpha=hidden.includes(b.depth)?.32:1;layers.get(b.depth)?.setAlpha(alpha);for(const label of labels)if(label.depth===b.depth)label.view.setAlpha(alpha);}
 }};
}
