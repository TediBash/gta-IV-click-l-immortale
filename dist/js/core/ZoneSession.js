export const copy=value=>JSON.parse(JSON.stringify(value));
export class ZoneSession{
 constructor(saved){this.data=saved?.version===1&&['street','workshop','depot'].includes(saved.current)?copy(saved):{version:1,current:'street',zones:{},missionState:null,party:[],activeId:'click',vehicle:{zone:'depot',x:1050,y:420,angle:0,owned:false,driving:false,skin:'classic'}};}
 capture(scene){const d=this.data;d.missionState=copy(scene.mission.state);d.activeId=scene.player.id;d.party=scene.party.map(p=>({id:p.id,hp:p.hp,special:p.special,ko:p.ko,x:p.x,y:p.y}));d.zones[d.current]={enemies:scene.enemies.map(e=>({x:e.x,y:e.y,hp:e.hp,ko:e.ko,energy:e.specialAbility.energy,specialState:e.specialAbility.snapshot?.(),bossRage:!!e.specialAbility.rage?.completed})),crates:scene.crates.map(c=>({destroyed:c.destroyed,hp:c.hp})),collected:[...scene.director.collected]};return copy(d);}
 enter(id,spawn){this.data.current=id;if(this.data.vehicle.driving)Object.assign(this.data.vehicle,{zone:id,x:spawn[0],y:spawn[1],speed:0});this.data.party.forEach((p,i)=>{p.x=spawn[0]+i*42;p.y=spawn[1];});}
}
export function vehicleFits(map,x,y,angle=0){
 const c=Math.cos(angle),s=Math.sin(angle),axes=[[1,0],[0,1],[c,s],[-s,c]];
 if(![[-45,-26],[-45,26],[45,-26],[45,26],[0,0]].every(([dx,dy])=>!map.blocked(x+dx*c-dy*s,y+dx*s+dy*c,2)))return false;
 return !(map.obstacles||[]).some(b=>{const dx=b.x+b.w/2-x,dy=b.y+b.h/2-y;return axes.every(([ax,ay])=>Math.abs(dx*ax+dy*ay)<45*Math.abs(c*ax+s*ay)+26*Math.abs(-s*ax+c*ay)+b.w/2*Math.abs(ax)+b.h/2*Math.abs(ay)+1);});
}
export function parkedInside(v,box){const c=Math.abs(Math.cos(v.angle||0)),s=Math.abs(Math.sin(v.angle||0)),hw=45*c+26*s,hh=45*s+26*c;return Math.abs(v.speed||0)<8&&v.x-hw>=box.x&&v.x+hw<=box.x+box.w&&v.y-hh>=box.y&&v.y+hh<=box.y+box.h;}
