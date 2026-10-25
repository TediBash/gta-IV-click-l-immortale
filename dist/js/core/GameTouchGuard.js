/** Suppress accidental double-tap zoom on the game shell, including empty rails.
 * Keep browser gestures on the home, settings, form fields and deliberate pinches.
 * Pointer Events continue to own multitouch gameplay; never synthesize clicks.
 */
export class GameTouchGuard {
 constructor(active,root=document.body){
  const blank=e=>active()&&!e.target.closest?.('dialog,button,a,input,select,textarea,label,[role="button"],[contenteditable="true"]');
  root.addEventListener('dblclick',e=>{if(blank(e))e.preventDefault();});
  let pinching=false;
  root.addEventListener('touchstart',e=>{if(e.touches.length>1)pinching=true;},{passive:true});
  root.addEventListener('touchend',e=>{
   if(blank(e)&&!pinching&&e.changedTouches.length===1&&e.touches.length===0)e.preventDefault();
   if(e.touches.length===0)pinching=false;
  },{passive:false});
  root.addEventListener('touchcancel',()=>{pinching=false;},{passive:true});
 }
}
