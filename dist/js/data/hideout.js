export const STATIONS=[
 ['click','Play e pugilato',180,245,'sofa','Il piano si prepara qui. I pugni li proviamo sul sacco.','anna','E il controller lo disinfetto io.'],
 ['spit','Motori e ricambi',470,245,'vehicle-lift','Qui si ripara tutto. Tranne il tuo rapporto con i paraurti.','click','L’ultimo aveva iniziato lui.'],
 ['ted','Droni e collegamenti',800,245,'server','Ho aggiornato il sistema. Non toccate il cavo giallo.','luca','Il cavo giallo era importante?'],
 ['luca','Banco prototipi',1100,245,'mechanic-bench','Il prototipo è pronto. Il cerotto è in fase di collaudo.','anna','Il cerotto funziona. Lo stai usando al contrario.'],
 ['bruce','Ispezioni e pizza',160,505,'pizza','Ispezione completata. La pizza è a temperatura regolamentare.','carlitos','Cioè abbastanza calda da mettere KO qualcuno?'],
 ['carlitos','Pietre e metalli',420,505,'diamonds','Queste pietre le conto due volte. Poi controlliamo le tasche di Bruce.','bruce','Sono campioni per la sicurezza.'],
 ['ale','Dossier e traduzioni',850,505,'desk','Ho tradotto il piano in cinque lingue. Click, vuoi un disegno?','click','Basta che la porta sia segnata. Stavolta la apro normalmente.'],
 ['andy','Chiavi e incarichi',1120,505,'luxury','Le chiavi sono qui. Il bagagliaio non è un posto passeggeri.','spit','Finalmente qualcuno lo mette per iscritto.'],
 ['anna','Punto medico',200,715,'heal','Kit pronti. Al prossimo giro tornate con tutti i pezzi.','click','Vale anche per la macchina?'],
 ['paula','Area dei gemelli',790,715,'map','Nico, ripassiamo il tempismo. Al tre, insieme.','nico','Il tre lo dici tu o lo devo indovinare di nuovo?'],
 ['nico','Area dei gemelli',1080,715,'tires','Il colpo dei gemelli è una questione di fiducia.','paula','E di non stare davanti al mio gomito.']
].map(([id,label,x,y,skin,text,replyCharacter,reply])=>({id,label,x,y,skin,lines:[{character:id,text,event:'hideout',id:`${id}.hideout.01`},{character:replyCharacter,text:reply,event:'hideout',id:`${replyCharacter}.hideout.reply.${id}`}]}));
export const HIDEOUT_VOICES=STATIONS.flatMap(s=>s.lines);
export const HUB_ACTIONS=[{id:'powerups',x:540,y:550,label:'Prepara i potenziamenti'},{id:'briefing',x:640,y:390,label:'Scegli una missione'},{id:'training',x:100,y:360,label:'Prova il sacco da boxe'},{id:'exit',x:640,y:740,label:'Torna alla schermata iniziale'}];
export const HIDEOUT_CONFIG={
 name:'Il covo della banda',short:'COVO',description:'Esplora le postazioni, parla con la banda e scegli il prossimo colpo al tavolo centrale.',theme:'workshop',zone:'hideout',
 start:[580,660],guards:[],crates:[],gate:[-500,-500],points:[],objectives:[],
 rooms:[[55,100,570,185,'concrete','MOTORI & CONTROLLER'],[665,100,560,185,'concrete','LABORATORIO'],[55,360,490,190,'parquet','PIETRE & PIZZA'],[735,360,490,190,'parquet','DOSSIER & INCARICHI'],[55,590,450,165,'marble','PUNTO MEDICO'],[735,590,490,165,'parquet','I GEMELLI']],
 obstacles:STATIONS.map(s=>[s.x-48,s.y-125,96,52]),
 furniture:STATIONS.map(s=>[s.skin,s.x,s.y-73,95])
};
