/** Native fullscreen with a reversible, viewport-filling fallback. */
export function gameViewport(width,height,immersive){
 if(!immersive||width<=0||height<=0)return {width:960,height:560};
 const factor=Math.min(560/Math.min(width,height),1280/width,800/height);
 return {width:Math.round(width*factor),height:Math.round(height*factor)};
}
export class FullscreenController{
 constructor(app,doc=document,win=window){
  this.app=app;this.doc=doc;this.win=win;this.fallback=false;this.busy=false;
  this.button=doc.querySelector('#fullscreen-toggle');this.button.onclick=()=>this.toggle();
  this.changed=()=>{if(!this.native)this.fallback=false;this.sync();};
  doc.addEventListener('fullscreenchange',this.changed);doc.addEventListener('webkitfullscreenchange',this.changed);
  win.addEventListener('resize',()=>this.resize());win.addEventListener('orientationchange',()=>this.resize());win.visualViewport?.addEventListener('resize',()=>this.resize());
  doc.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.fallback){this.fallback=false;this.sync();}});
 }
 get native(){return !!(this.doc.fullscreenElement||this.doc.webkitFullscreenElement);}
 get active(){return this.native||this.fallback;}
 async toggle(){
  if(this.busy)return;this.busy=true;this.app.input.clear();
  try{
   if(this.active){await this.exit();return;}
   const root=this.doc.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;
   try{if(!request)throw new Error('unsupported');await request.call(root);this.fallback=!this.native;}
   catch{this.fallback=true;this.app.ui.toast('Vista estesa attiva · il browser non consente il fullscreen.');}
   this.sync();
  }finally{this.busy=false;}
 }
 async exit(){
  this.fallback=false;
  try{if(this.native){const exit=this.doc.exitFullscreen||this.doc.webkitExitFullscreen;await exit?.call(this.doc);}}
  catch{this.app.ui.toast('Usa il comando del browser per uscire dallo schermo intero.');}
  this.sync();
 }
 sync(){
  const active=this.active&&this.app.playing;this.doc.body.classList.toggle('immersive',active);
  this.button.textContent=active?'⤡ RIDUCI':'⛶ FULL SCREEN';this.button.setAttribute('aria-pressed',String(active));
  this.button.setAttribute('aria-label',active?'Esci dalla vista a schermo intero':'Gioca a schermo intero');
  this.app.input.clear();this.resize();
 }
 resize(){
  this.app.input.clear();
  const height=this.win.visualViewport?.height||this.win.innerHeight;
  if(height&&this.active)this.doc.documentElement.style?.setProperty('--play-height',height+'px');
  this.win.requestAnimationFrame(()=>{
   if(!this.app.playing)return;
   const box=this.doc.querySelector('#game-canvas').getBoundingClientRect(),size=gameViewport(box.width,box.height,this.active&&this.app.playing);
   this.app.game?.scale.setGameSize(size.width,size.height);this.app.game?.scale.refresh();
  });
 }
}
