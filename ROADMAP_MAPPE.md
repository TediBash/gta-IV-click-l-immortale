# GTA CLick — mappe collegate e direzione visiva

## Stato v0.12 — 24 ottobre 2026

| Tappa | Stato | Risultato e prossimo passo |
|---|---|---|
| 1. Selezione visuale | Realizzata | Dieci missioni sulla mappa, ripresa e completamenti |
| 2. Zone persistenti | Realizzata nel primo caso | Porte bidirezionali, nemici e oggetti persistenti, veicolo salvato |
| 3. Percorso completo di Spit | Realizzato | Strada → officina → pezzi → deposito → auto → forno → trasformazione → circuito |
| 4. Kit grafici | In corso | Pavimenti e atlanti esistenti riutilizzati nel covo; nuove inquadrature curate per 62 momenti narrativi. Da ampliare architetture e sotterranei |
| 5a. Covo visitabile | Prima versione realizzata | Undici postazioni, 22 battute, personaggio selezionabile, allenamento e tavolo missioni. Non sovrascrive il checkpoint |
| 5b. Missione 03 a zone | Realizzata | Sei ambienti collegati, accesso con Ted, tre casse, prototipo e carico del furgone |
| 5c. Missioni 01 e 04 a zone | Realizzata | Sette zone in Grecia e sette nella villa, eventi ordinati e stato persistente |
| 6a. Missioni 05–06 a zone | Realizzata | Sette zone per Bruce e sette per Carlitos, acqua, boss, pizza e recupero di Spit |
| 6b. Missioni 07–08 a zone | Realizzata | Sei zone per Ale e sei per Luca; archivio, componenti, banco, collaudo e telemetria |
| 6c. Missione 09 a zone | Realizzata | Sei zone: ingresso, salone, vicolo, cortile, sagrato e incontro |
| 7. Finale corale a zone | Realizzato | Otto zone, tre squadre, viaggio, notiziario e festa a Fossano |
| 8. Collaudo su smartphone | Da completare | Verifica reale su iOS/Android, fullscreen, layout e prestazioni |

Le dieci missioni e i 31 capitoli sono già giocabili nella loro forma arcade. La tabella riguarda la successiva trasformazione in ambienti collegati: non indica missioni mancanti. Il covo è esplorazione/dialogo/briefing; personalizzazione, ricordi sbloccati e gestione dell’equipaggiamento dal covo sono ancora futuri.

### Intervento sui riquadri illustrati

Il ritaglio percentuale generico tagliava i volti ed esponeva le didascalie inferiori. Ora le immagini sono selezionate per missione e capitolo in `scene-art.js`; un viewport SVG conserva l’intera area selezionata in entrambe le dimensioni. Eliminato lo zoom automatico. Il titolo della scena è fuori dall’immagine e il dialogo cresce sui display ampi. La trasformazione di Spit usa la vignetta dell’auto svelata; la vittoria usa il saluto fra i due con i visi interi. Le vignette mantengono eventuali fumetti o titoletti interni quando eliminarli taglierebbe i personaggi. Il materiale resta quello del manuale, con la sua risoluzione originale.

### Missione 03 completata nella v0.8

- **Cortile e sicurezza:** sette avversari, arredi e rifornimenti distinti; Ted sblocca l’accesso al laboratorio. Le porte diventano verdi quando il passaggio è disponibile.
- **Laboratorio e sala server:** prototipo utilizzabile solo da Ted, tre casse di denaro suddivise nelle stanze. Il prototipo scompare dal banco quando viene raccolto. Guardie, salute e casse rimangono nello stato lasciato.
- **Area di carico e piazzale:** otto rinforzi, incluso il caposquadra; speciali già cariche. Dopo il combattimento, A avvia l’animazione che carica tre casse e il prototipo. Il carico resta visibile sul furgone anche dopo un salvataggio/ripresa.
- **Ritorni:** tutte le porte sono bidirezionali; tornando alle stanze dei capitoli precedenti non si azzerano gli obiettivi e gli avversari di quei capitoli non contano come rinforzi del finale.
- **Compatibilità:** un vecchio checkpoint resta nel suo capitolo; le ricompense dei capitoli già superati sono considerate consumate. I nuovi salvataggi includono stanza, salute, carica, nemici, casse, accessi e carico.

Verifica: percorso completo con ritorni, ripresa nel server e dopo il carico del furgone; controlli di raggiungibilità per tutte le porte, arrivi, dispositivi e casse. 59 test complessivi superati. Anteprima gestita non disponibile: nessuna verifica visiva nel browser o su telefono reale dichiarata.

### Missioni 01 e 04 completate nella v0.9

- **Grecia, sette zone:** villaggio, sentiero degli ulivi, base, collina, belvedere sul mare, casa e piazza della partenza. Paula legge le tracce, Nico trova il varco, Click esamina il deposito. Il lancio del petardo ha una breve animazione; i fratelli devono attraversare i primi due segnali prima di vedere l’esplosione distante. La vignetta corretta compare al belvedere, poi i fari degli elicotteri sorvegliano il terzo tratto. Il ritorno alla base è chiuso durante la fuga.
- **Ricordi:** zaino a Paula e foto a Click dentro casa; cartina a Nico nella piazza. Restano raccolti dopo una porta o una ripresa, con le animazioni e il banner della foto già presenti.
- **Villa, sette zone:** preparazione, cancello/giardino, salone, camera, studio, garage e piazzale. Andy presenta la consegna; Click e Spit restano nascosti e la vettura conserva posizione e direzione anche dopo il caricamento. Entrando nel salone i passeggeri tornano visibili, lasciando l’auto nel giardino.
- **Interni e fuga:** Click trova la chiave nella camera, Andy prende il dossier nello studio. Due casse e sei avversari sono distribuiti nelle stanze. Garage e piazzale ospitano altri sette nemici, con speciali già cariche; Andy apre il cancello dopo averli fermati e Spit prepara l’auto.
- **Persistenza:** porte con ritorno, salute, carica, oggetti, avversari e obiettivi conservati. I vecchi checkpoint mantengono il capitolo corretto e le ricompense già superate non ricompaiono.

Verifica v0.9: 63 test automatici, inclusi i due percorsi completi, i ritorni nelle stanze, la ripresa con Click nascosto, la sequenza dell’esplosione e la raggiungibilità di tutte le porte e interazioni. L’anteprima gestita non è disponibile: resa visiva e uso su smartphone reale restano da verificare.

### Missioni 05 e 06 completate nella v0.10

- **Bruce, sette zone:** accesso, valvola ovest, valvola est, collettore, corridoio di servizio, cucina e sala della pizzeria. Le due valvole abbassano visibilmente l’acqua; i livelli restano salvati. La pizza ha una scena animata con rinforzo e vignetta; interromperla prima dell’impatto non blocca la missione.
- **Calcio volante:** Bruce sceglie il nemico vivo più vicino con linea libera, si solleva, mostra la gamba distesa, attraversa lo spazio rispettando le collisioni e colpisce una sola volta. Senza un bersaglio raggiungibile conserva la carica. Il movimento e gli attacchi normali sono bloccati soltanto durante lo slancio.
- **Alligatore:** due cariche totali, rispettivamente a due terzi e a un terzo della vita residua. Una corsia arancione indica la direzione per 1,1 secondi; la corsa può essere schivata lateralmente, si ferma contro gli ostacoli e colpisce ogni personaggio al massimo una volta per carica. Le soglie impediscono di saltare le due fasi con un singolo colpo. Il conteggio è salvato. Al KO compare la vignetta originale di Bruce, Click e l’alligatore; non viene ripetuta dopo una ripresa.
- **Carlitos, sette zone:** reception, produzione, spedizioni, controllo accessi, caveau, vicolo e strada. Bruce esamina il registro, Carlitos riconosce i diamanti, Ted apre la porta e i tre lotti vengono recuperati. Dopo la fuga, Carlitos e Click raccolgono i sacchetti, mentre Spit arriva con l’auto animata. I personaggi temporaneamente assenti mantengono salute e carica quando tornano nel gruppo.
- **Nuovi avversari:** Scudiero blu con Baluardo, riduzione del danno e respinta; Pulsar viola con due onde sul punto segnalato. Sono presenti nelle nuove zone e negli incontri delle missioni 07–10. I prossimi capitoli dovranno continuare ad ampliare nemici e poteri, come richiesto.

Verifica: 70 test automatici superati, comprese entrambe le missioni complete, ripresa durante la pizza, cariche del boss salvate, slancio di Bruce nelle quattro direzioni, ostacoli e nuovi poteri. Il controllo visivo nel browser e su smartphone resta non eseguito per indisponibilità dell’anteprima gestita.

### Prossimo blocco di lavoro

1. **Missione 07 — Ale:** quartiere, incontro, archivio e uffici collegati, confronto dei documenti e avversari con nuove capacità.
2. **Missione 08 — Luca:** laboratorio, deposito, costruzione e collaudo visibile dell’APE, mosse di judo e gag con gli attrezzi.
3. **Missione 09 — Anna:** ricevimento, vicoli e punto d’incontro a Roma, mantenendo Click elegante.
4. Finale corale a zone e collaudo reale di layout, fullscreen e comandi touch.

### Copia locale e verifiche

La v0.7 include `npm start`, `npm run start:lan` e `AVVIO_LOCALE.md`; gli asset sono inclusi e non occorrono chiavi API. Salvataggi e audio online restano separati dai dati di localhost. 55 test automatici superati, incluso il giro delle undici postazioni e il ritorno alla campagna senza salvare il covo sopra il checkpoint. La verifica visiva nel browser resta non eseguita per indisponibilità dell’anteprima gestita.

## Interpretazione dei riferimenti

| Riferimento | Applicazione al gioco | Dettagli da mantenere |
|---|---|---|
| 1 — mappa di selezione | Sostituire soltanto il menu «Scegli la tua storia» con una mappa illustrata navigabile | Tappe numerate, percorso, missione selezionata, progressi e ripresa; il resto della home resta com’è |
| 2 — interno arredato | Villa, fabbrica, scuola dell’ispezione e altri edifici | Stanze leggibili, pavimenti diversi, muri con aperture, mobili che aiutano a capire la funzione del luogo |
| 3 — sotterraneo scuro | Fogne, passaggi clandestini, accessi al caveau | Pietra umida, archi, acqua, luci locali, profondità; interazioni e avversari devono restare leggibili |
| 4 — esterno verde | Grecia, aree aperte, ingresso della missione 3, percorsi e spazi esterni di Roma | Sentieri, alberi, recinzioni, dislivelli visivi e punti riconoscibili; palazzi e strade adeguati quando la scena è urbana |
| 5 — edifici pixel art | Libreria coerente di edifici e oggetti modulari | Scala, prospettiva, densità dei pixel e luce uniformi. Soggetti contemporanei italiani/greci, coerenti con la storia |
| 6 — stanza operativa | Covo della banda a Fossano | Ogni persona ha una postazione utile: briefing, preparazione, equipaggiamento, dialoghi |
| 7 — quartiere urbano | Strade davanti a officina, fabbrica, scuola e luoghi di Roma | Marciapiedi, attraversamenti, parcheggi, insegne e porte effettivamente utilizzabili |

Direzione comune: 2D dall’alto con facciate visibili, personaggi leggibili, ombre coerenti e oggetti ordinati per profondità. Le immagini sono riferimenti per composizione e atmosfera; i luoghi rappresentati appartengono alla storia di Click. Il manuale continua a fornire le illustrazioni delle sequenze narrative.

## Un capitolo contiene più luoghi

Struttura proposta: missione → capitolo → zona → stanza/interazione. Entrare in una porta cambia la zona, senza avanzare automaticamente al capitolo successivo. Le porte hanno destinazione, punto di ingresso, condizioni d’accesso e possibilità di ritorno.

Quando il personaggio raggiunge una porta compare «A · Entra nell’officina». Premendo A: il movimento si ferma, lo schermo sfuma, compare il nome del luogo, vengono caricati gli asset necessari e la squadra appare all’ingresso interno. Uscendo si torna davanti alla stessa porta. Nessuna attesa artificiale lunga se il contenuto è già pronto. Precaricare le zone adiacenti riduce le attese su smartphone.

Ogni zona conserva nemici sconfitti, casse aperte, componenti raccolti, porte sbloccate, oggetti spostati e posizione/stato dei veicoli. La squadra conserva salute, equipaggiamento e carica. I salvataggi devono includere zona e fase corrente; i vecchi checkpoint devono ancora aprire una missione valida. Tornare in una stanza non deve duplicare premi, resuscitare guardie o far rivedere automaticamente una scena già conclusa.

## Missione 02: primo esempio completo

1. **Strada di Fossano.** Click incontra Spit e risolve il problema con i rivali. L’officina ha una facciata e un ingresso riconoscibile.
2. **Ingresso nell’officina.** Transizione a una mappa interna con ponte sollevatore, magazzino, banco, scaffali e forno di verniciatura.
3. **Ricerca dei componenti con Spit.** Motore vicino al banco, gomme nel deposito, vernice nell’armadio. Ogni oggetto produce posa celebrativa, saltello e banner; l’inventario mostra 1/3, 2/3, 3/3.
4. **Ritorno all’esterno.** I pezzi restano raccolti. Il deposito della supercar è un altro punto raggiungibile della zona.
5. **Recupero dell’auto.** Click libera il passaggio. Spit può salire al volante con A. Mentre guida, i comandi controllano il mezzo; la squadra viene trasportata senza restare bloccata fuori dalla mappa.
6. **Rientro in officina con l’auto.** La serranda è un ingresso per veicoli. Serve una collisione dell’auto più larga di quella dei personaggi e una manovra lenta adatta al touch.
7. **Parcheggio nel forno.** Una sagoma indica l’area. Si completa quando l’auto è interamente dentro e quasi ferma; i tre componenti devono essere presenti. Nessuna conferma mentre si passa a velocità elevata.
8. **Trasformazione.** Serranda che si chiude, luci del forno, breve suono di lavoro; quindi illustrazione originale del manuale e Spit: «Eccola qui!». Premendo A si torna al gioco.
9. **Auto trasformata.** Stessa auto persistente, nuova carrozzeria e colore. Esce dal forno, torna sulla strada e raggiunge l’ingresso del circuito.
10. **Gara.** Si usa la macchina effettivamente modificata. Vittoria e scena finale del manuale con dialogo della squadra.

Fasi persistenti: incontro → ricerca pezzi → recupero auto → parcheggio → trasformazione → circuito → vittoria. Le tappe indicano cosa manca e permettono di tornare indietro senza ricominciare il capitolo.

## Estensione alla campagna

| Missione | Zone proposte | Cambiamento visibile che conclude l’azione |
|---|---|---|
| 01 — Grecia | Villaggio, sentiero degli ulivi, perimetro/base, collina di fuga, casa e partenza | Raccolta dei ricordi, esplosione lontana dopo la fuga, foto e viaggio verso Fossano |
| 02 — Spit | Strada, officina, magazzino, deposito auto, forno, circuito | Auto diversa dopo il lavoro, poi gara |
| 03 — Ted | Esterno del centro, cortile, ingresso, laboratorio, sala server, uscita | Accesso sbloccato, prototipo visibile, casse caricate sul mezzo |
| 04 — Villa | Quartiere, cancello, giardino, salone, camere, studio, garage | Click nascosto nell’auto, ingresso di Andy, dossier recuperato, cancello aperto per la fuga |
| 05 — Bruce | Accesso di servizio, fogne, sala valvole, collettore, uscita/pizzeria | Livello dell’acqua che scende, passaggio dell’alligatore liberato, pizza e KO comico |
| 06 — Carlitos | Esterno azienda, reception, reparto produttivo, ufficio, caveau, strada | Diamanti raccolti, caveau aperto, borsa e recupero durante la fuga |
| 07 — Ale | Quartiere, luogo dell’incontro, archivio, uffici, piazzale | Documenti confrontati e destinazione Roma scoperta |
| 08 — Luca | Covo, laboratorio, deposito pezzi, area di test, uscita | Prototipo costruito, prova visiva, custodia pronta per il viaggio |
| 09 — Anna | Roma, ingresso ricevimento, sala, vicoli, punto d’incontro | Cambio elegante di Click, inviti verificati, percorso aperto e squadra radunata |
| 10 — Banda | Più settori della piazza, vie laterali, punto di raccolta, viaggio, covo | Passaggi tra gruppi, ricongiungimento, notiziario e festa dei trent’anni |

L’ispezione nella scuola citata nel nuovo riferimento va collocata come zona aggiuntiva di Bruce; la fabbrica dei diamanti resta il luogo dell’incontro con Carlitos. Non sostituire silenziosamente quell’episodio.

## Covo della banda

Un luogo visitabile tra le missioni, organizzato in aree riconoscibili:

- Click: sacco da boxe e zona Play/controller.
- Spit: ponte sollevatore, motori e ricambi.
- Ted: computer, monitor e stazione droni.
- Luca: banco attrezzi, saldatore e prototipi.
- Bruce: scrivania ispezioni, planimetrie e dettagli comici legati alla pizza.
- Carlitos: banco metalli e controllo delle pietre.
- Ale: documenti, traduzioni e dossier.
- Andy: chiavi, incarichi e organizzazione dei mezzi.
- Anna: armadietto medico e kit.
- Paula e Nico: area condivisa per preparazione e mosse combinate.

Ogni postazione apre un dialogo o una funzione concreta. Il briefing seleziona una missione; il covo mostra ricordi e oggetti sbloccati senza diventare un menu obbligatorio a ogni partita.

## Ordine di realizzazione

1. **Selezione visuale della storia.** Mappa con dieci tappe e pannello missione; mostrare selezionata, completata e ripresa. Conservare la possibilità attuale di scegliere le missioni, salvo richiesta esplicita di bloccarle in ordine.
2. **Gestione delle zone.** Porte bidirezionali, transizioni, persistenza e migrazione dei salvataggi. Verificare anche ritorno al garage, pausa, caricamento fallito e ripresa.
3. **Missione 02 completa come modello.** Implementare il percorso descritto sopra, incluso parcheggio reale nel forno e trasformazione persistente.
4. **Kit grafici coerenti.** Esterni naturali, urbano contemporaneo, interni civili/industriali e sotterranei. Separare pavimenti, muri, arredi, collisioni, illuminazione e oggetti davanti al personaggio.
5. **Covo visitabile e missioni 01, 03, 04.** Riutilizzare il sistema verificato e adattare ogni ambiente al suo episodio.
6. **Missioni 05–09.** Sotterranei, fabbrica, archivio, laboratorio, Roma; assegnare a ciascuna trasformazioni del luogo e azioni proprie.
7. **Finale corale.** Zone collegate e gruppi distinti, ricongiungimento e ritorno; conservare il tono cinematografico della storia.
8. **Verifica su smartphone.** Portrait/landscape, fullscreen, passaggio A/B, porte senza rientri involontari, margini di manovra dell’auto, tempi di caricamento e memoria.

Criterio di completamento: ogni ingresso porta a un luogo coerente e visitabile, il ritorno conserva lo stato, gli oggetti richiedono azioni nel mondo e il risultato si vede nella mappa. Una schermata illustrata accompagna la trasformazione, ma la partita deve riprendere mostrando ciò che è cambiato.

### Missioni 07 e 08, boss e fullscreen nella v0.11

- **Ale, sei zone:** piazza, sala riunioni, archivio digitale, deposito documenti, vicolo e recupero. Ale ascolta i due testimoni; Ted sblocca il deposito dopo la verifica; il dossier e l’appuntamento aprono la strada per Roma.
- **Luca, sei zone:** laboratorio, magazzino, sala collaudo, telemetria, piazzale e baia di partenza. I tre pezzi sono distribuiti tra officina e magazzino. Serve tornare al banco con Luca. Assemblaggio, passaggio dell’APE su tre bersagli, scansione dei dati e chiusura della custodia hanno animazioni e dialoghi del manuale.
- **Avversari:** cinque, sei e sette nemici distribuiti nei tre capitoli di ciascuna missione. Scudieri, Pulsar e nuovo Supervisore dorato con scarica a croce. Gli avversari dell’ultimo capitolo partono con la carica piena.
- **Boss al 50%:** Caposquadra e Supervisore bloccano il danno sulla soglia fino all’esecuzione dello speciale. Segnale arancione per 1,2 secondi, impatto una sola volta, controllo della linea libera e salvataggio della fase completata. Un caricamento durante il preavviso ripropone il segnale; dopo l’esecuzione non ripete la fase. L’alligatore conserva le due cariche precedenti.
- **Schermo:** comandi separati sotto la mappa in verticale, due fasce laterali in orizzontale; A/B diagonali, cambio personaggio, pausa e obiettivi accessibili. Altezza aggiornata con la viewport del browser, safe area e proporzioni della camera conservate. Lo scorrimento del dito e il multitouch restano invariati.

Verifica: 74 test automatici, inclusi i percorsi completi di Ale e Luca, i ritorni al banco, le porte bloccate, la ripresa prima e dopo lo speciale del boss, le ricompense uniche e la raggiungibilità di tutte le 40 zone del sistema Adventure. Il daemon dell’anteprima gestita è assente: nessun collaudo visivo nel browser o su dispositivo reale eseguito. Prossima tappa: missione 09 e finale corale 10 a zone.

### v0.12 — Roma, finale e speciali

Missione 09: Click elegante e Anna attraversano ingresso e salone del ricevimento, vicoli, cortile, sagrato e punto d’incontro. L’invito apre l’accesso; kit e passaggio precedono la chiamata della banda.

Missione 10: area tecnica e terrazza; vicolo e garage con Bruce, Carlitos e Spit; fontana e convoglio con i gemelli, Anna, Andy e Click; viaggio e casa di Fossano. Stato delle stanze e dei personaggi assenti conservato. Le porte distribuiscono fino a undici personaggi in posizioni libere anche vicino ai bordi. La riunione a casa ripristina la squadra per il compleanno.

Animazioni: auto di lusso di Andy, tre onde di Ale, otto diamanti di Carlitos, anelli distinti e collegamento tra Paula/Nico, furia dorata di Click. Ted vola fino al bersaglio, scende e si schianta: esplosione e danni avvengono all’impatto; nessun danno attraverso gli ostacoli. Senza bersaglio raggiungibile conserva la carica. I gemelli insieme ricevono protezione breve e stordimento potenziato; Click riceve protezione durante la furia e Carlitos stordisce con i diamanti.

76 test automatici superati: percorsi completi, riprese, tutti gli undici amici, collisioni agli arrivi e sequenza di volo/esplosione. Restano il collaudo visivo su smartphone reale e ulteriori rifiniture grafiche; l’anteprima gestita non è disponibile.
