import {ENEMY_SETS} from '../data/enemySets.js';
import {DIFFICULTIES} from '../data/characters.js';
import {ENEMY_TYPES,enemyType} from '../data/enemies.js';
export const enemyCount=(count,difficulty='easy')=>Math.ceil(count*(DIFFICULTIES[difficulty]?.count||1));
/** Stable prefix/order keeps existing enemy snapshots compatible. Boss copies become escorts. */
export function scaleGuards(guards,config,difficulty='easy'){
 const result=guards.map(g=>[...g]),wanted=enemyCount(guards.length,difficulty);if(!guards.length)return result;
 const blocked=(x,y)=>x<55||x>1225||y<70||y>745||(config.obstacles||[]).some(([bx,by,w,h])=>Math.hypot(x-Math.max(bx,Math.min(x,bx+w)),y-Math.max(by,Math.min(y,by+h)))<24);
 for(let i=guards.length;i<wanted;i++){
  const [gx,gy,type]=guards[(i-guards.length)%guards.length],kind=enemyType(type),boss=ENEMY_TYPES[kind].boss||['captain','alligator'].includes(kind);let spawn=null;
  const valid=(x,y)=>!blocked(x,y)&&Math.hypot(x-config.start[0],y-config.start[1])>140&&!result.some(([px,py])=>Math.hypot(x-px,y-py)<44)&&!(config.doors||[]).some(d=>Math.hypot(x-d.x,y-d.y)<90)&&!(config.points||[]).some(p=>Math.hypot(x-p.x,y-p.y)<50);
  for(let radius=64;radius<=500&&!spawn;radius+=48)for(let angle=0;angle<Math.PI*2;angle+=Math.PI/6){const x=Math.round(gx+Math.cos(angle)*radius),y=Math.round(gy+Math.sin(angle)*radius);if(valid(x,y)){spawn=[x,y,boss?(ENEMY_SETS[config.enemySet]?.troops[i%ENEMY_SETS[config.enemySet].troops.length]||'guard'):kind];break;}}
  if(!spawn)for(let y=80;y<=740&&!spawn;y+=48)for(let x=64;x<=1216;x+=48)if(valid(x,y)){spawn=[x,y,boss?(ENEMY_SETS[config.enemySet]?.troops[i%ENEMY_SETS[config.enemySet].troops.length]||'guard'):kind];break;}
  if(!spawn)throw new Error('Nessuno spazio per i rinforzi: '+config.name);result.push(spawn);
 }return result;
}
export function scaleConfig(config,difficulty='easy',guardTarget){return {...config,guards:scaleGuards(config.guards||[],config,difficulty),...(guardTarget===undefined?{}:{guardTarget})};}
