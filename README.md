# GTA CLick — L’Immortale

Un gioco arcade in pixel art per browser, nato da una storia illustrata e da un regalo per il trentesimo compleanno di Klaudio. Click e la sua banda attraversano Grecia, Fossano e Roma tra combattimenti, gare, colpi improbabili e battute tra amici.

## Versione 0.30

- Dieci missioni, 31 capitoli e undici personaggi giocabili.
- Ambienti collegati: officine, laboratori, villa, archivi, fogne, pizzeria e città.
- Mappe rinnovate fino a Roma, al covo con undici postazioni e al circuito.
- Mosse speciali, powerup, boss, rianimazione dei compagni e quattro difficoltà.
- Mappa delle missioni, salvataggi, guida agli obiettivi e sblocco libero opzionale.
- Comandi touch per combattimento e guida, tastiera e vista fullscreen.
- Musiche, effetti e voci con interruttori separati; registrazioni caricabili per battuta.
- Dialoghi e barre del personaggio più grandi sui display ampi.

## Estrarre e avviare

Estrai completamente lo ZIP. All’interno trovi una cartella **GTA-Click** contenente `index.html`, `package.json` e `dist/`.

Con Node.js installato, apri il terminale nella cartella GTA-Click ed esegui:

```sh
npm start
```

Apri `http://localhost:8080`. Non servono compilazione o installazione delle dipendenze per giocare: Phaser è incluso. Non aprire direttamente l’HTML dal disco; i moduli JavaScript richiedono un server HTTP. Su Windows puoi usare `Avvia-GTA-Click.bat`.

Per il telefono nella stessa rete, usa `npm run start:lan` e visita l’indirizzo IP del computer sulla porta 8080.

## GitHub

Carica **il contenuto della cartella GTA-Click** nella radice del repository, non lo ZIP e non una cartella aggiuntiva. `index.html`, `dist/` e `README.md` devono essere allo stesso livello.

Il file `index.html` nella radice apre il gioco in `dist/`. Per GitHub Pages pubblica il ramo che contiene questi file dalla cartella radice. Se utilizzi già un workflow che pubblica `dist/`, la cartella contiene il gioco completo anche per quel metodo. Usa un solo metodo di pubblicazione.

Guida ufficiale: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Struttura logica

Il gioco usa JavaScript ES modules e Phaser 3.90. I sorgenti leggibili sono direttamente in `dist/js/`. Non servono backend o chiavi API.

| Percorso | Funzione |
|---|---|
| `dist/index.html` e CSS | Home, menu, dialoghi e controlli responsive |
| `dist/js/core/` | Input, eventi, salvataggi e stato missioni |
| `dist/js/data/` | Missioni, personaggi, dialoghi e scene illustrate |
| `dist/js/world/` | Scene, mappe, collisioni, porte, navigazione e veicoli |
| `dist/js/world/*District.js` | Disegno delle diverse ambientazioni |
| `dist/js/characters/` | Stato e comportamento di giocatori, alleati e nemici |
| `dist/js/combat/` | Attacchi, combo, speciali ed effetti |
| `dist/js/audio/` | Musica, registrazioni e sintesi vocale |
| `dist/js/ui/` | Interfaccia e menu |
| `dist/assets/` | Immagini, atlanti, suoni e Phaser |
| `scripts/serve.mjs` | Server per l’avvio locale |
| `tests/` | Verifiche automatiche |

I dati definiscono obiettivi e zone. Le scene costruiscono il mondo e coordinano le regole; input, personaggi e combattimento aggiornano lo stato. Interfaccia e audio presentano gli eventi. La geometria dei percorsi è condivisa con collisioni e minimappa.

## Dati personali e verifica

I progressi sono locali al browser e all’indirizzo del sito. Le registrazioni personali sono salvate in IndexedDB e non sono incluse nell’archivio. Caricare un audio associa una registrazione a una battuta: non clona la voce. Dove manca una registrazione, viene usata la sintesi vocale disponibile nel browser. I font Google richiedono la rete e hanno alternative di sistema.

Esegui `npm test` per le verifiche automatiche. Il collaudo visivo completo su telefoni reali resta da completare. Cronologia tecnica: [CHANGELOG.md](CHANGELOG.md). Roadmap: [ROADMAP_MAPPE.md](ROADMAP_MAPPE.md).

## Diritti

Progetto personale per portfolio, non ufficiale e non affiliato a Rockstar Games, Take-Two o Sony. Le parti originali restano riservate all’autore: [LICENSE.md](LICENSE.md). I componenti di terzi mantengono le proprie licenze e diritti.
