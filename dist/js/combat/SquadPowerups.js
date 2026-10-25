import {powerGraphic} from './PowerupEffects.js';
import {drawCar} from '../world/RaceController.js';
import {driftPoint} from './DriftPath.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),level=a=>Math.max(1,Math.min(4,a.stats.specialLevel||1));
const friends=(s,a,r)=>s.party.filter(b=>!b.ko&&!b.hidden&&dist(a,b)<=r&&s.map.clearLine(a.x,a.y,b.x,b.y));
function missing(s,text='Nessun bersaglio adatto: conservi la carica.'){s.toast(text);return true;}
function draw(g,s,a,kind,t=0,target=a){if(!g)return;g.clear().setPosition(a.x,a.y-35).setRotation(0);const motion=s.app.settings.reduceMotion?0:t;
 if(kind==='kick'){g.setPosition(a.x,a.y-25-(a.kickLift||0)).setRotation(Math.atan2(target.y-a.y,target.x-a.x)).lineStyle(13,0x243f60).lineBetween(0,0,42,0).fillStyle(0xffe9b9).fillRoundedRect(30,-8,27,17,4);}
 if(kind==='drone'){g.lineStyle(4,0x92dadd).lineBetween(-18,-10,18,10).lineBetween(-18,10,18,-10).fillStyle(0x243f60).fillRect(-10,-8,20,16);for(const x of [-19,19])for(const y of [-12,12])g.lineStyle(2,0xa6f4ed).strokeEllipse(x,y,22,6+Math.abs(Math.sin(motion*25))*8);}
 if(kind==='diamond'||kind==='orbit'){const count=kind==='orbit'?5:1;for(let i=0;i<count;i++){const angle=i*Math.PI*2/count+motion*7,x=count===1?0:Math.cos(angle)*45,y=count===1?0:Math.sin(angle)*25;g.fillStyle(0x85eeef).fillTriangle(x,y-13,x-9,y,x+9,y).fillStyle(0xbbffff).fillTriangle(x,y+13,x-9,y,x+9,y);}}
 if(kind==='voice'){for(let i=0;i<3;i++)g.lineStyle(4,0xffbf83,1-i*.2).strokeCircle(0,0,15+i*18+motion*15);}
 if(kind==='keys')g.lineStyle(5,0xffd767).strokeCircle(0,0,12).lineBetween(11,0,39,0).lineBetween(29,0,29,9).lineBetween(38,0,38,9);
 if(kind==='twin')g.lineStyle(5,0xd6b5ff).lineBetween(-27,-24,27,24).lineBetween(27,-24,-27,24).lineStyle(2,0xd6b5ff).strokeCircle(0,0,40+motion*8);
 if(kind==='controller')g.fillStyle(0x192d43).fillRoundedRect(-24,-12,48,28,7).lineStyle(3,0x8edee7).lineBetween(-17,0,-5,0).lineBetween(-11,-6,-11,6).fillStyle(0xffa3cf).fillCircle(13,0,4);
}
function pose(p,a,kind,duration){const g=powerGraphic(p.scene);p.job(a,duration,t=>draw(g,p.scene,a,kind,t),()=>g?.destroy());}
function silence(p,a,e){if(e.boss)return;e.specialAbility?.cancel();e.attackAt=0;const until=p.scene.now+3000;e.powerSilencedUntil=until;p.effects.add(e);p.job(a,3000,()=>{},()=>{if(e.powerSilencedUntil===until)e.powerSilencedUntil=0;});}
export function markTwin(p,a,e){if(e.ko)return;const s=p.scene,token={until:s.now+6000};e.twinMark=token;p.effects.add(e);const g=powerGraphic(s);p.job(a,6000,()=>{g?.clear();if(e.twinMark===token&&!e.ko)g?.setPosition(e.x,e.y-95).lineStyle(3,0xd6b5ff).strokeCircle(0,0,9).lineBetween(-5,-5,5,5).lineBetween(-5,5,5,-5);},()=>{if(e.twinMark===token)e.twinMark=null;g?.destroy();});}
function kick(p,a,e,inspection,done=()=>{}){const s=p.scene,origin={x:a.x,y:a.y},d=dist(a,e)||1,end={x:e.x-(e.x-a.x)/d*35,y:e.y-(e.y-a.y)/d*35},duration=Math.min(1050,Math.max(600,d*1.8)),g=powerGraphic(s);let hit=false;
 a.actionLocked=true;a.moving=false;a.invulnerableUntil=s.now+duration;
 p.job(a,duration,t=>{const q=Math.max(0,Math.min(1,(t-.15)/.7));p.moveToward(a,origin.x+(end.x-origin.x)*q,origin.y+(end.y-origin.y)*q,22);a.face?.(e.x-a.x,e.y-a.y);a.kickLift=s.app.settings.reduceMotion?0:Math.sin(q*Math.PI)*42;draw(g,s,a,'kick',t,e);
 if(!hit&&q>.1&&!e.ko&&dist(a,e)<90&&s.map.clearLine(a.x,a.y,e.x,e.y)){hit=true;if(inspection&&e.specialAbility)e.specialAbility.shieldUntil=0;p.hit(e,a,(inspection?125:90)+10*(level(a)-1),inspection?1100:600);s.fx?.word(e.x,e.y,inspection?'NON A NORMA!':'WHAM!',0xffd36d,true);s.fx?.burst(e.x,e.y,0xffd36d,75);}
 },()=>{a.actionLocked=false;a.kickLift=0;a.kickAngle=0;g?.destroy();});
 p.job(a,duration+25,t=>{if(t>=1&&hit)done();});
}
function drone(p,a,e,emp,delay){const s=p.scene,g=powerGraphic(s),reticle=powerGraphic(s),origin={x:a.x,y:a.y-65};let aim={x:e.x,y:e.y},hit=false;
 p.job(a,delay+900,t=>{const q=Math.max(0,(t*(delay+900)-delay)/900);if(t*(delay+900)<delay)return;if(!emp&&q<.6&&!e.ko)aim={x:e.x,y:e.y};const dive=Math.max(0,(q-.6)/.4),position={x:origin.x+(aim.x-origin.x)*Math.min(1,q/.6),y:q<.6?origin.y+(aim.y-100-origin.y)*q/.6:aim.y-100+100*dive};draw(g,s,position,'drone',q);reticle?.clear().setPosition(aim.x,aim.y).lineStyle(2,emp?0xc49cff:0xffd36d).strokeCircle(0,0,23);
 if(q>=1&&!hit){hit=true;s.fx?.burst(aim.x,aim.y,emp?0xc49cff:0xffcf83,115);s.fx?.word(aim.x,aim.y,emp?'EMP!':'BOOM!',emp?0xc49cff:0xffcf83,true);s.audio.effect('explosion');for(const target of p.enemies(aim,115)){p.hit(target,a,emp?45:90,500);if(emp)silence(p,a,target);}}
 },()=>{g?.destroy();reticle?.destroy();});
}
function carRun(p,a,target,rescue,double){const s=p.scene,car=drawCar(s,a.x,a.y,'tuned',1.2),hit=new Set(),proxy={x:a.x,y:a.y};
 const leg=(goal,done)=>{const origin={...proxy},end={x:goal.x,y:goal.y},duration=Math.min(1800,Math.max(750,dist(origin,end)*2)),curve=Array.from({length:21},(_,i)=>driftPoint(origin,end,i/20)).every(v=>!s.map.blocked(v.x,v.y));
 p.job(a,duration,t=>{const v=curve?driftPoint(origin,end,t):{x:origin.x+(end.x-origin.x)*t,y:origin.y+(end.y-origin.y)*t},before={...proxy};p.moveToward(proxy,v.x,v.y,28);car.setPosition(proxy.x,proxy.y).setRotation(Math.atan2(proxy.y-before.y,proxy.x-before.x)).setDepth(proxy.y+10);
 for(const e of p.enemies(proxy,rescue?105:90))if(!hit.has(e)){hit.add(e);p.hit(e,a,rescue?55:105+5*(level(a)-1),650);s.fx?.word(e.x,e.y,'SKRRT!',0xffd36d,true);if(rescue&&!e.boss){const d=dist(proxy,e)||1;p.moveToward(e,e.x+(e.x-proxy.x)/d*45,e.y+(e.y-proxy.y)/d*45,45);}}
 if(t>=1)done(dist(proxy,goal)<140);
 });return duration;};
 let second=null;const duration=leg(target,reached=>{if(rescue&&reached&&!target.ko){p.shield(target,30,2000);s.fx?.word(target.x,target.y,'RECUPERATO!',0x8fe2d0,true);}if(double&&hit.has(target))second=p.enemies(proxy,300).find(e=>!hit.has(e));});
 p.job(a,duration+25,t=>{if(t>=1){if(second)leg(second,()=>car.destroy());else car.destroy();}});p.job(a,duration+1900,()=>{},()=>car.destroy());
}
export function runSquadPower(p,a,start){const s=p.scene,mode=p.mode(a);if(mode==='base')return false;
 if(a.id==='bruce'){const e=p.enemies(a,650)[0];if(!e)return missing(s);start();kick(p,a,e,mode==='inspection',()=>{if(mode==='bounce'){const next=p.enemies(a,280).find(n=>n!==e);if(next)kick(p,a,next,false);}});return true;}
 if(a.id==='ted'){const targets=p.enemies(a,700);if(!targets.length)return missing(s);start();pose(p,a,'controller',800);for(let i=0;i<level(a);i++)drone(p,a,targets[i%targets.length],mode==='emp',i*160);return true;}
 if(a.id==='spit'){const target=mode==='rescue'?friends(s,a,650).filter(b=>b!==a&&b.hp<b.data.hp).sort((b,c)=>dist(a,b)-dist(a,c))[0]:p.enemies(a,700)[0];if(!target)return missing(s);start();carRun(p,a,target,mode==='rescue',mode==='double');return true;}
 if(a.id==='carlitos'){
  if(mode==='orbit'){start();for(const e of p.enemies(a,250))p.hit(e,a,45,300);const token={until:s.now+4000};a.powerShard=token;p.effects.add(a);const g=powerGraphic(s);p.job(a,4000,t=>{if(a.powerShard===token)draw(g,s,a,'orbit',t);else g?.clear();},()=>{if(a.powerShard===token)a.powerShard=null;g?.destroy();});return true;}
  const e=p.enemies(a,360).sort((b,c)=>c.hp-b.hp)[0];if(!e)return missing(s);start();for(let i=0;i<3;i++){const g=powerGraphic(s),origin={x:a.x,y:a.y},delay=i*150;let hit=false;p.job(a,delay+450,t=>{const q=Math.max(0,(t*(delay+450)-delay)/450);draw(g,s,{x:origin.x+(e.x-origin.x)*q,y:origin.y+(e.y-origin.y)*q},'diamond');if(q>=1&&!hit){hit=true;p.hit(e,a,48+3*(level(a)-1),250);s.fx?.burst(e.x,e.y,0x85eeef,40);}},()=>g?.destroy());}return true;
 }
 if(a.id==='ale'){const enemies=p.enemies(a,300),team=friends(s,a,350).filter(b=>b!==a);if(!enemies.length&&!(mode==='rally'&&team.length))return missing(s);start();pose(p,a,'voice',750);for(const e of enemies){p.hit(e,a,mode==='silence'?35:20,500);if(mode==='silence')silence(p,a,e);}if(mode==='rally')for(const b of team){b.special=Math.min(100,b.special+35);p.shield(b,20,2000);s.fx?.beam(a.x,a.y,b.x,b.y,0xffbf83);}return true;}
 if(a.id==='andy'){const targets=p.enemies(a,320),common=targets.filter(e=>!e.boss);if(mode==='lure'&&!common.length)return missing(s);start();pose(p,a,'keys',700);
  if(mode==='contract'){for(const b of friends(s,a,350))p.shield(b,30,3000);for(const e of targets){e.attackAt=0;if(!e.boss)e.specialAbility?.cancel();e.stunUntil=Math.max(e.stunUntil||0,s.now+(e.boss?250:600));}return true;}
  const position={x:a.x,y:a.y};p.moveToward(position,a.x+140,a.y,140);const car=drawCar(s,position.x,position.y,'luxury');for(const e of common){e.specialAbility?.cancel();e.attackAt=0;const token={...position,until:s.now+2300};e.powerLure=token;p.effects.add(e);p.job(a,2300,()=>{},()=>{if(e.powerLure===token)e.powerLure=null;});}p.job(a,2300,()=>{},()=>car.destroy());return true;
 }
 if(a.id==='paula'||a.id==='nico'){
  if(mode==='closing'){const e=p.enemies(a,280).find(e=>e.twinMark?.until>s.now);if(!e)return missing(s,'Serve un nemico marcato da Paula: conservi la carica.');start();e.twinMark=null;pose(p,a,'twin',650);let hit=false;p.job(a,650,t=>{if(t>=.75&&!hit){hit=true;if(dist(a,e)<=300){p.hit(e,a,175,800);s.fx?.word(e.x,e.y,'CERCHIO CHIUSO!',0xd6b5ff,true);}}});return true;}
  const partner=friends(s,a,mode==='bond'?420:280).find(b=>b.id===(a.id==='paula'?'nico':'paula')&&!b.actionLocked);if(!partner)return missing(s,'Avvicina il gemello libero: conservi la carica.');const targets=[...new Set([...p.enemies(a,190),...p.enemies(partner,190)])];if(!targets.length)return missing(s);start();a.actionLocked=partner.actionLocked=true;a.moving=partner.moving=false;a.invulnerableUntil=partner.invulnerableUntil=s.now+800;const g=powerGraphic(s),h=powerGraphic(s),target=targets[0];let hit=false;
  p.job(a,750,t=>{draw(g,s,a,'twin',t);draw(h,s,partner,'twin',t);if(partner.ko)return;if(mode==='mirror'&&t<.6){const d=dist(partner,target)||1;p.moveToward(a,target.x+(target.x-partner.x)/d*60,target.y+(target.y-partner.y)/d*60,12);}if(t>=.75&&!hit){hit=true;for(const e of targets)if(dist(a,e)<210||dist(partner,e)<210){const before=e.hp;p.hit(e,a,mode==='together'?110:130,900);if(a.id==='paula'&&e.hp<before)markTwin(p,a,e);}if(mode==='together'){p.shield(a,25,2500);p.shield(partner,25,2500);}s.fx?.word(a.x,a.y,'GEMELLI!',0xd6b5ff,true);}},()=>{a.actionLocked=partner.actionLocked=false;g?.destroy();h?.destroy();});return true;
 }return false;
}
