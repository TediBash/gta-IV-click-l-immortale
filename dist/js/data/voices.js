import {ADVENTURE_VOICES} from './adventures.js';
import {FACILITY_VOICES} from './facility.js';
import {HIDEOUT_VOICES} from './hideout.js';
import {ZONE_LINES} from './zones.js';
const banks={
 click:{explore:['Prima guardo. Poi entro.','Ho un piano. E anche le braccia.','Vediamo quanto vale questo posto.'],attack:['Saldato a freddo!','Passaggio libero.','Basta chiedere.'],hurt:['Quando tutto va storto, ragiono meglio.','Sono ancora qui.'],special:['Furia Immortale!'],switch:['Adesso ci penso io.'],loot:['Questo viene con noi.'],victory:['Tutti interi. Tutto preso.'],intro:['Due cervelli. E una pessima idea.'],banter:['Ted, la porta aveva davvero un pulsante?'],ko:['Ted, tocca a te.']},
 ted:{explore:['Pianifico prima di agire.','Il sistema funziona. Siete voi l’imprevisto.','Il terminale lo lascio a me.'],attack:['Statisticamente sì, fa male!','Calcolo completato.','Errore di valutazione. Tuo.'],hurt:['Attento all’attrezzatura!','Questo non era nel piano.'],special:['Attacco Droni!'],switch:['Passiamo al metodo scientifico.'],loot:['Tecnologia acquisita.'],victory:['Operazione riuscita. Miracolosamente.'],intro:['Il terminale è a nord-est. Cerchiamo di arrivarci interi.'],banter:['Click, la porta aveva un pulsante.'],ko:['Click, salva almeno il computer.']},
 spit:{explore:['Dove sei? Arrivo.','Non toccare la vernice.'],attack:['Ti rifaccio la carrozzeria!'],hurt:['Quello era nuovo!'],special:['Derapata di recupero!'],victory:['La macchina è da recuperare. Di nuovo.'],banter:['Ti salvo, ma paghi il paraurti.','L’uscita è questa.']},
 paula:{explore:['Ho trovato un passaggio.','Il piano? Lo stesso. In stereo.'],attack:['Nico, al mio tre!'],hurt:['Era meglio l’altro passaggio.'],special:['Colpo dei Gemelli!'],victory:['Alla fine è sempre colpa nostra, vero?'],banter:['Click, stavolta seguici tu.','Due ingressi. Nessuna scusa.']},
 nico:{explore:['Paula, ti copro.','È un vizio di famiglia.'],attack:['Uno per te, uno per me.'],hurt:['Mi hai preso di sorpresa. Una volta.'],special:['Colpo dei Gemelli!'],victory:['Tutti interi? Allora possiamo ridere.'],banter:['Siamo in due. Quando ti va bene.','Click, lascia spazio.']},
 andy:{explore:['I miei clienti non chiedono mai il prezzo.','Consegna a domicilio esclusiva.'],attack:['Questo affare è personale.'],hurt:['Il vestito, per favore.'],special:['Affare di lusso!'],victory:['Una vittoria così merita una fattura.'],banter:['Spit, cerca di non graffiarla.','Click, sembri quasi presentabile.']},
 bruce:{explore:['Questo tunnel non è sulle planimetrie!','Alligatore: rischio non segnalato.'],attack:['Guardate i miei calci volanti!'],hurt:['La sicurezza prima di tutto. Dopo questo salto.'],special:['Calcio volante!'],victory:['Ispezione conclusa. Più o meno.'],banter:['Carlitos, coprimi il fianco!','Consegna pizza. Molto calda.']},
 carlitos:{explore:['Qual è la mia percentuale?','Quelli per terra sono soldi.'],attack:['Questa è una pietra dura.'],hurt:['Ma quindi questa sarebbe una vittoria?'],special:['Tempesta di Diamanti!'],victory:['Amici come prima. Conti separati.'],banter:['Bruce, io raccolgo. Tu fai il ninja.','Click, chiudi quella borsa!']},
 ale:{explore:['Manca soltanto un voto!','Questa volta servono tutti!'],attack:['Non alzare la voce con me.'],hurt:['Non ho ancora finito di parlare.'],special:['Ultimo Voto!'],victory:['Vi avevo detto di seguirmi.'],banter:['Spit, intendevo aggirarli.','Anna, adesso tocca a noi.']},
 luca:{explore:['Perché conosco gente come voi?','Non pronunciate più la parola prototipo!'],attack:['Ti presento il pavimento.'],hurt:['Quel martello era rivolto dall’altra parte.'],special:['Sciame APE!'],victory:['È sporco, ma funziona.'],banter:['Non è unto. È finitura opaca.','Il motore regge più della vostra pazienza.']},
 anna:{explore:['Fermati, sei stanco!','Ci penso io a rimetterti in sesto.'],attack:['Spostati. Ti mostro io.'],hurt:['Conosco una brava infermiera.'],special:['Impulso Vitale!'],victory:['Prima tornate vivi. Poi discutete.'],banter:['Click, un’uscita elegante. Per una volta.','Salvi la situazione o fai scena?']}
};
banks.click.child=['Sembra tutto vuoto. Guardiamo e poi andiamo.','Via! Correte verso il sentiero!','La foto viene con noi. Anche a Fossano.','Paula, Nico, restiamo insieme.'];
banks.paula.child=['Di qua! Ci sono delle impronte.','Click, stavolta seguici tu!','Ho chiuso lo zaino. Si parte.','Nico, guarda: si vede tutto il mare!'];
banks.nico.child=['Qui la rete è aperta. C’è un passaggio.','Non fermatevi sotto i fari!','Fossano. È scritto qui, sulla cartina.','Paula, sono dietro di te.'];
banks.spit.story=['Serve una macchina seria. E qualcuno che non mi rovini la vernice.','Presa. Adesso la facciamo diventare un’altra macchina.','Carrozzeria, motore, assetto. Adesso sì che si corre.'];
banks.spit.switch=['Lascia fare al carrozziere.'];
banks.andy.story=['Consegna esclusiva. Il passeggero extra non è sul preventivo.','La consegna è attesa. Fateci passare.','Dossier trovato. Click, cerchiamo un’uscita elegante.','L’uscita era inclusa nel prezzo.'];
banks.andy.switch=['Ora lasciate parlare me.'];
banks.bruce.story=['Questo passaggio non è sulle planimetrie!','Valvola aperta. Fin qui è quasi un lavoro normale.','Alligatore: rischio non segnalato.','Consegna pizza. Molto calda.','Un’azienda di pietre preziose. Domani passo per un controllo.'];
banks.bruce.switch=['Ispezione in corso. Fate spazio.'];
banks.click.story=['Qui dietro non c’è nemmeno il portabicchieri.','Finalmente una porta che posso aprire senza smontarla.'];
banks.spit.story.push('Non graffiate niente. Soprattutto dall’interno.','Tutti a bordo. Click, questa volta sul sedile.');
import {DIALOGUE_VOICES} from './dialogues.js';
/** Stable IDs make recordings replaceable without changing mission or combat code. */
export const VOICE_LINES=Object.entries(banks).flatMap(([character,groups])=>Object.entries(groups).flatMap(([event,texts])=>texts.map((text,i)=>({id:`${character}.${event}.${String(i+1).padStart(2,'0')}`,character,event,text})))).concat(DIALOGUE_VOICES,ZONE_LINES,HIDEOUT_VOICES,FACILITY_VOICES,ADVENTURE_VOICES);
export const linesFor=(character,event)=>VOICE_LINES.filter(l=>l.character===character&&(!event||l.event===event));
export const lineById=id=>VOICE_LINES.find(l=>l.id===id);
