"""Original deterministic chiptune score renderer. Requires Python + numpy; no samples."""
import json, wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'dist/assets/music'; OUT.mkdir(parents=True,exist_ok=True)
SR=22050
# Each melody is an original scale-degree phrase; E1/E8/E9 share the family motif.
family=[0,2,4,2,5,4,2,1,0,2,3,4,2,1,0,-1]
tracks=[
 ('E1','Tre fratelli tra gli ulivi',78,60,'major',family,'flute'),
 ('E2','Motori a Fossano',104,62,'major',[0,0,2,4,5,4,2,6,4,2,1,2,4,2,0,-1],'pulse'),
 ('E3','Due cervelli, zero prudenza',108,57,'minor',[0,4,2,6,4,2,1,4,0,2,5,4,6,4,2,1],'bell'),
 ('E4','Entrare senza bussare',88,59,'minor',[0,-1,2,-1,1,4,2,-1,0,6,4,-1,3,2,1,-1],'pluck'),
 ('E5','Sotto la città',76,55,'minor',[0,-1,-1,4,1,-1,2,-1,0,-1,6,-1,4,3,1,-1],'flute'),
 ('E6','Diamanti e documenti',96,64,'minor',[0,2,4,6,5,4,2,-1,1,3,5,4,2,1,0,-1],'bell'),
 ('E7','Roma non era pronta',96,65,'major',[0,4,5,4,2,3,4,-1,5,6,7,6,4,2,1,0],'flute'),
 ('E8','Verso casa',82,60,'major',family,'bell'),
 ('E9','Trenta, e un altro livello',116,62,'major',family,'pulse'),
 ('B1','Via di corsa!',144,62,'minor',[0,2,4,2,5,4,6,4,7,6,4,2,3,2,1,4],'pulse'),
 ('B2','La banda all’opera',136,57,'minor',[0,0,4,2,0,3,5,4,2,4,6,5,4,2,1,0],'pulse'),
 ('B3','Qui comando io!',152,54,'minor',[0,1,0,4,3,2,1,0,6,4,5,3,4,2,1,0],'pulse')]
scales={'major':[0,2,4,5,7,9,11],'minor':[0,2,3,5,7,8,10]}
def pitch(root,degree,scale): return root+scale[degree%7]+12*(degree//7)
def render(code,bpm,root,mode,motif,timbre,bars):
 beat=60/bpm; duration=bars*4*beat; n=round(duration*SR); mix=np.zeros(n); rng=np.random.default_rng(sum(map(ord,code)))
 scale=scales[mode]
 def add(when,length,midi,amp,voice='flute'):
  t=np.arange(max(1,int(length*SR)))/SR; f=440*2**((midi-69)/12);phase=2*np.pi*f*t
  if voice=='noise': v=rng.uniform(-1,1,len(t))
  elif voice=='kick':v=np.sin(2*np.pi*(48*t+55*.035*(1-np.exp(-t/.035))))
  elif voice=='pulse':v=np.sin(phase)+.3*np.sin(3*phase)+.12*np.sin(5*phase)
  elif voice=='bell':v=np.sin(phase)+.35*np.sin(2*phase)*np.exp(-t*8)
  else:v=np.sin(phase)+.15*np.sin(2*phase)
  env=np.minimum(1,t/.008)*np.minimum(1,np.maximum(0,(length-t)/.045))
  env*=np.exp(-t*(7 if voice in ['pluck','bell','noise','kick'] else 1.4))
  idx=(int(when*SR)+np.arange(len(t)))%n;np.add.at(mix,idx,v*env*amp)
 progression=[0,5,3,4] if mode=='major' else [0,5,2,6]
 for bar in range(bars):
  chord=progression[(bar//2)%4];section=(bar//8)%3
  for step in range(8):
   degree=motif[(bar*8+step)%len(motif)]
   if degree>=0:
    variation=(2 if section==1 and step%3==0 else 0)+(7 if section==2 and step<2 else 0)
    add((bar*4+step*.5)*beat,.42*beat,pitch(root+12,degree+variation,scale),.115,timbre)
   arp=[0,2,4,2,0,4,2,4][step]
   add((bar*4+step*.5)*beat,.3*beat,pitch(root,chord+arp,scale),.035 if code in ['E1','E5','E8'] else .05,'bell')
  for step in [0,2]:add((bar*4+step)*beat,1.6*beat,pitch(root-12,chord+(4 if step==2 else 0),scale),.13,'flute')
  if code not in ['E1','E5','E8'] or section==2:
   for step in [0,2]:add((bar*4+step)*beat,.18,36,.17,'kick')
   for step in [1,3]:add((bar*4+step)*beat,.1,36,.065,'noise')
   for step in range(8):add((bar*4+step*.5)*beat,.035,36,.024,'noise')
  if section==1:
   add((bar*4+1)*beat,1.4*beat,pitch(root+12,chord+4,scale),.045,'flute')
 return mix,duration
manifest={}
def write(code,a):
 peak=max(.001,float(np.max(np.abs(a))));a=np.tanh(a*1.4);a*=.78/max(.78,float(np.max(np.abs(a))))
 with wave.open(str(OUT/(code+'.wav')),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((a*32767).astype('<i2').tobytes())
 return {'duration':round(len(a)/SR,3),'peak':round(float(np.max(np.abs(a))),4),'rms':round(float(np.sqrt(np.mean(a*a))),4)}
for code,title,bpm,root,mode,motif,timbre in tracks:
 a,d=render(code,bpm,root,mode,motif,timbre,24 if bpm<100 else 32);manifest[code]={'title':title,'bpm':bpm,'loop':True,**write(code,a)}
# Event phrases have their own cadence and an actual silent release, never loop.
jingles={'room':('Passaggio',.55,[72,79]),'chapter':('Nuovo capitolo',2.5,[60,64,67,72,76]),'found':('Oggetto trovato',1.5,[67,72,76,79]),'photo':('Ricordo dei fratelli',2,[60,64,67,64,60]),'objective':('Obiettivo completato',1,[72,76,79]),'boss':('Boss sconfitto',4,[55,62,67,71,74,79]),'victory':('Missione completata',6,[60,64,67,72,71,69,67,72,76]),'race':('Primo posto',5,[62,66,69,74,78,81,78,74]),'defeat':('Ci riproviamo',3,[67,63,60,55]),'birthday':('Buon compleanno, Immortale',7,[62,66,69,66,71,69,66,64,62]),'chest':('Baule aperto',.8,[60,67,76])}
for code,(title,d,notes) in jingles.items():
 n=int(d*SR);a=np.zeros(n);step=(d-.25)/len(notes)
 for i,midi in enumerate(notes):
  length=min(step*1.6,d-i*step);t=np.arange(int(length*SR))/SR;f=440*2**((midi-69)/12);v=(np.sin(2*np.pi*f*t)+.22*np.sin(4*np.pi*f*t))*np.minimum(1,t/.008)*np.exp(-t*4)*np.minimum(1,(length-t)/.06)*.23
  start=int(i*step*SR);end=min(n,start+len(v));a[start:end]+=v[:end-start]
 manifest[code]={'title':title,'loop':False,**write(code,a)}
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('Rendered',len(manifest),'original tracks and cues;',round(sum(p.stat().st_size for p in OUT.glob('*.wav'))/1024**2,1),'MiB')
