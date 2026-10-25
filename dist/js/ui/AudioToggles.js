/** The same two channel controls stay in sync on the home and fullscreen HUD. */
export class AudioToggles {
 constructor(app,root=document){this.app=app;this.buttons=[...root.querySelectorAll('[data-audio-channel]')];for(const button of this.buttons)button.onclick=()=>this.toggle(button.dataset.audioChannel);this.render();}
 toggle(channel){
  if(!['voices','music'].includes(channel))return;
  const a=this.app,s=a.settings,key=channel+'Enabled',enabled=!s.muted&&s[key]!==false;
  // Unmute only the requested channel when the old global mute is active.
  if(s.muted){s.musicEnabled=false;s.voicesEnabled=false;s.effectsEnabled=false;s.muted=false;}
  s[key]=!enabled;a.audio.unlock();
  if(channel==='voices'&&!s[key])a.audio.stop();
  a.save.saveSettings(s);a.updateSound();
 }
 render(){
  const s=this.app.settings;
  for(const button of this.buttons){const channel=button.dataset.audioChannel,on=!s.muted&&s[channel+'Enabled']!==false,label=channel==='voices'?'Voci dei personaggi':'Musica di sottofondo';
   button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',`${label}: ${on?'ON':'OFF'}`);button.title=`${on?'Disattiva':'Attiva'} ${label.toLowerCase()}`;
   button.querySelector('[data-audio-state]').textContent=on?'ON':'OFF';
  }
 }
}
