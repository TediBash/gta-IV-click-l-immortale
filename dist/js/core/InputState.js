/** Merge independent fingers and keyboard keys; releasing one never releases another. */
export class InputState {
 constructor(){this.resetListeners=new Set();this.raceSteering=0;this.raceSteeringActive=false;this.sources=new Map();this.held=new Set();this.pressed=new Set();}
 setSource(id,keys){
  const next=new Set(keys);if(next.size)this.sources.set(id,next);else this.sources.delete(id);
  const combined=new Set([...this.sources.values()].flatMap(keys=>[...keys]));
  for(const key of combined)if(!this.held.has(key))this.pressed.add(key);
  this.held.clear();for(const key of combined)this.held.add(key);
 }
 consume(key){const value=this.pressed.has(key);this.pressed.delete(key);return value;}
 movement(){const x=Number(this.held.has('right'))-Number(this.held.has('left')),y=Number(this.held.has('down'))-Number(this.held.has('up')),n=Math.hypot(x,y)||1;return {x:x/n,y:y/n};}
 clear(){this.sources.clear();this.held.clear();this.pressed.clear();this.raceSteering=0;this.raceSteeringActive=false;for(const reset of this.resetListeners)reset();}
}
/** Eight directions across one continuous pad, with a neutral center and an outer release zone. */
export function padDirections(x,y,rect){
 const margin=22;if(!rect.width||!rect.height||x<rect.left-margin||x>rect.right+margin||y<rect.top-margin||y>rect.bottom+margin)return [];
 const dx=(x-rect.left-rect.width/2)/(rect.width/2),dy=(y-rect.top-rect.height/2)/(rect.height/2);
 if(Math.hypot(dx,dy)<.2)return [];
 const keys=[],ratio=Math.tan(Math.PI/8);
 if(Math.abs(dx)>=Math.abs(dy)*ratio)keys.push(dx<0?'left':'right');
 if(Math.abs(dy)>=Math.abs(dx)*ratio)keys.push(dy<0?'up':'down');
 return keys;
}
