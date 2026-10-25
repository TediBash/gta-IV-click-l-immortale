/** Audio files stay on this device, per stable character/line ID. */
export class VoiceStore{
 constructor(){this.db=null;this.cache=new Map();this.available=true;}
 async init(){try{this.db=await new Promise((resolve,reject)=>{const r=indexedDB.open('gtaclick-voices',1);r.onupgradeneeded=()=>r.result.createObjectStore('clips',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const entries=await this.request('readonly',s=>s.getAll());entries.forEach(e=>this.cache.set(e.id,e));}catch{this.available=false;}return this;}
 request(mode,operation){return new Promise((resolve,reject)=>{const tx=this.db.transaction('clips',mode);const req=operation(tx.objectStore('clips'));let result;req.onsuccess=()=>{result=req.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
 get(id){return this.cache.get(id);}
 async put(id,file){if(!this.db)throw new Error('Archiviazione audio non disponibile in questo browser.');if(file.size>8*1024*1024)throw new Error('La registrazione deve essere inferiore a 8 MB.');if(!file.type.startsWith('audio/')&&!/\.(mp3|wav|m4a|ogg|webm|aac)$/i.test(file.name))throw new Error('Scegli un file audio MP3, WAV, M4A o OGG.');const entry={id,blob:file,name:file.name};await this.request('readwrite',s=>s.put(entry));this.cache.set(id,entry);}
 async remove(id){await this.request('readwrite',s=>s.delete(id));this.cache.delete(id);}
}
