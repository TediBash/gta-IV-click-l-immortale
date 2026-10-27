# GTA CLick — copia locale v0.30

La cartella contiene il progetto modificabile, le immagini e il motore Phaser già incluso. Non servono account, chiavi API, compilazione o `npm install` per giocare.

## Avvio su Windows, macOS o Linux

1. Estrai completamente lo ZIP in una cartella, per esempio `GTA-Click`.
2. Installa Node.js dal sito ufficiale nodejs.org se non è già presente. Usa una versione LTS supportata, almeno Node 22.
3. Apri il terminale **nella cartella che contiene `package.json`**. Su Windows puoi aprire la cartella in Esplora file, scrivere `cmd` nella barra del percorso e premere Invio. Su macOS/Linux apri il terminale e usa `cd` seguito dal percorso della cartella.
4. Esegui:

```sh
npm start
```

5. Apri **http://localhost:8080** nel browser. Lascia il terminale aperto durante la partita. Per fermare il gioco premi Ctrl+C nel terminale.

Su Windows è incluso anche `Avvia-GTA-Click.bat`: dopo aver installato Node.js puoi avviarlo con un doppio clic. Se PowerShell blocca `npm.ps1`, usa il Prompt dei comandi oppure `npm.cmd start`.

Non aprire `dist/index.html` con doppio clic: il gioco usa moduli JavaScript che richiedono un indirizzo HTTP. Se la porta 8080 è occupata, chiudi l’altra istanza del gioco o imposta la variabile PORT prima dell’avvio.

## Smartphone sulla stessa rete Wi-Fi

Sul computer esegui `npm run start:lan`. Cerca l’indirizzo IPv4 locale del computer nelle impostazioni di rete (per esempio 192.168.1.20). Sul telefono apri `http://192.168.1.20:8080`, sostituendo l’indirizzo con quello reale. Computer e telefono devono essere sulla stessa rete e il terminale deve restare aperto. Se il sistema chiede di consentire Node.js attraverso il firewall, limita l’accesso alla rete privata. Non occorre aprire porte sul router.

L’avvio normale ascolta solo sul computer; `start:lan` rende il gioco raggiungibile dai dispositivi della rete locale.

## Salvataggi e voci

Il progetto e tutti gli asset di gioco sono inclusi. **Progressi e registrazioni caricati nella versione online non vengono copiati automaticamente**: appartengono ai dati di quel browser e di quell’indirizzo. La copia locale ha dati separati; usa sempre lo stesso browser e `http://localhost:8080` per ritrovare i suoi salvataggi. Anche il telefono ha dati propri.

Le registrazioni personali si caricano da «Le voci della banda». Conserva gli audio originali. Dove manca un file, il gioco usa la voce disponibile nel browser. Le immagini e il gioco sono locali; la disponibilità offline della sintesi vocale dipende dal dispositivo e dalle voci installate.

## Dove modificare il gioco

- `dist/index.html` e `dist/style.css`: pagina, menu e impaginazione.
- `dist/js/data/`: missioni, personaggi, dialoghi, scene del manuale e covo.
- `dist/js/world/`: mappe, porte, veicoli e logica delle scene.
- `dist/js/combat/`: attacchi ed effetti.
- `dist/assets/`: immagini, atlanti e Phaser.
- `ROADMAP_MAPPE.md`: stato delle tappe e prossime attività.
- `tests/`: verifiche automatiche; esegui `npm test`.

Salva un file modificato e ricarica il browser per vedere la modifica. Il pacchetto è indipendente dalla copia online: le modifiche locali non la aggiornano automaticamente.


## Stato della versione

Vedi README.md per la versione 0.30 e ROADMAP_MAPPE.md per gli interventi sulle mappe.
