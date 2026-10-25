const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
/** Normalized steering with a neutral center and full lock near either edge. */
export function steeringAt(x,rect){
 if(!rect.width)return 0;const raw=clamp((x-rect.left-rect.width/2)/(rect.width*.42),-1,1);
 return Math.abs(raw)<.12?0:Math.sign(raw)*(Math.abs(raw)-.12)/.88;
}
export function raceInput(input,settings={}){
 const brake=input.held.has('down')||input.held.has('raceBrake'),reverse=input.held.has('reverse');
 return {brake,reverse,accelerate:!brake&&!reverse&&(settings.raceAutoAccelerate!==false||input.held.has('up')||input.held.has('raceAccelerate')),turn:input.raceSteeringActive?input.raceSteering:(Number(input.held.has('right'))-Number(input.held.has('left')))};
}
/** Assist smooths the wheel and eases speed before bends; it never steers for you. */
export function driveRace(car,dt,controls,settings,{offroad,boost,target,next}){
 const assisted=settings.raceAssist!==false,turn=controls.turn;
 car.steering=turn===0?0:assisted?(car.steering||0)+(turn-(car.steering||0))*Math.min(1,dt/0.12):turn;
 let limit=offroad?95:boost?340:265;
 if(assisted&&!offroad&&!controls.reverse){
  const dx=target[0]-car.x,dy=target[1]-car.y,distance=Math.hypot(dx,dy),heading=Math.atan2(dy,dx),bend=Math.abs(angleDelta(Math.atan2(next[1]-target[1],next[0]-target[0]),heading)),error=Math.abs(angleDelta(heading,car.angle));
  if(Math.abs(car.steering)>.35||distance<200&&bend>.5||error>.65)limit=Math.min(limit,error>1.1?145:185);
 }
 if(controls.brake){car.speed=Math.sign(car.speed)*Math.max(0,Math.abs(car.speed)-360*dt);}
 else if(controls.reverse){car.speed=car.speed>0?Math.max(0,car.speed-280*dt):Math.max(-70,car.speed-140*dt);}
 else if(controls.accelerate)car.speed+=150*dt;
 else car.speed=Math.sign(car.speed)*Math.max(0,Math.abs(car.speed)-65*dt);
 // Assistance decelerates progressively; entering the grass retains its existing speed cap.
 if(car.speed>limit)car.speed=offroad?limit:Math.max(limit,car.speed-240*dt);
 car.speed=clamp(car.speed,-70,boost?340:265);
 car.angle+=car.steering*dt*(assisted?2.2:2.7)*Math.min(1,Math.abs(car.speed)/60)*(car.speed<0?-1:1);
 car.x=clamp(car.x+Math.cos(car.angle)*car.speed*dt,45,1235);car.y=clamp(car.y+Math.sin(car.angle)*car.speed*dt,55,765);
}
