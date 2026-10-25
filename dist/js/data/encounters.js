export function enrichEncounters(mission){
 if(mission.children)return;
 const last=mission.chapters.findLastIndex(c=>c.guards.length>0);
 mission.chapters.forEach((c,index)=>{
  c.enemySpecialReady=index===last&&last>=0;if(!c.guards.length)return;
  const blocked=(x,y)=>x<55||x>1225||y<70||y>750||c.obstacles.some(([bx,by,w,h])=>Math.hypot(x-Math.max(bx,Math.min(x,bx+w)),y-Math.max(by,Math.min(y,by+h)))<22);
  c.guards=c.guards.map(([x,y,type])=>{if(!blocked(x,y))return [x,y,type];for(let r=40;r<=400;r+=40)for(let angle=0;angle<Math.PI*2;angle+=Math.PI/4){const nx=Math.round(x+Math.cos(angle)*r),ny=Math.round(y+Math.sin(angle)*r);if(!blocked(nx,ny))return [nx,ny,type];}throw new Error('No enemy spawn');});
  const wanted=index===last?3:2;let added=0;
  for(let y=180;y<720&&added<wanted;y+=120)for(let x=180;x<1180&&added<wanted;x+=140){
   if(Math.hypot(x-c.start[0],y-c.start[1])<330||Math.hypot(x-c.gate[0],y-c.gate[1])<90||blocked(x,y))continue;
   if(c.guards.some(([gx,gy])=>Math.hypot(x-gx,y-gy)<100)||(c.points||[]).some(p=>Math.hypot(x-p.x,y-p.y)<80))continue;
   c.guards.push([x,y,['guard','technician','bruiser'][added++%3]]);
  }
  if(mission.id>=5){const indices=c.guards.map((g,i)=>['guard','bruiser','technician'].includes(g[2])?i:-1).filter(i=>i>=0);for(const [offset,type]of [[1,'pulse'],[2,'warden']])if(indices.length>=offset)c.guards[indices.at(-offset)][2]=type;}
 });
}
