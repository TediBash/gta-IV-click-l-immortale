# GTA CLick — L’Immortale · versione 0.23

Questo ZIP contiene il gioco completo e modificabile: dieci missioni, 31 capitoli, immagini, musica, motore Phaser, controlli per smartphone, sorgenti e 175 test. Include l’ultima opzione «Sblocca tutte le missioni».

## Giocare sul computer

1. Estrai **tutta** la cartella `GTA-Click-v0.23`.
2. Installa Node.js 22 o successivo, se manca.
3. Apri il terminale nella cartella che contiene `package.json` e scrivi `npm start`.
4. Apri http://localhost:8080 e lascia il terminale aperto.

Su Windows puoi usare `Avvia-GTA-Click.bat` dopo aver installato Node.js. Non servono npm install, chiavi API, account o compilazione: Phaser è già in `dist/assets/`.
Non aprire index.html con doppio clic: i moduli JavaScript richiedono un server HTTP.
Per giocare dal telefono sulla stessa rete Wi-Fi: `npm run start:lan`, poi apri sul telefono `http://IP-DEL-COMPUTER:8080` con l’IP locale del tuo computer.

## Pubblicare gratuitamente su GitHub Pages

GitHub Free supporta Pages per repository pubblici. Il gioco è statico: non necessita di un server applicativo né di un database.

1. Crea un repository **Public**, per esempio `gta-click`, con ramo `main`.
2. Carica **il contenuto** della cartella estratta nella radice del repository. Non caricare lo ZIP come unico file e non aggiungere un livello di cartella esterno.
3. Nella radice devono comparire `dist/`, `scripts/`, `package.json` e `.github/workflows/pages.yml`. La cartella `.github` può essere nascosta nel file manager: assicurati che venga caricata. GitHub Desktop oppure Git aiutano a caricare tutti i file mantenendo la struttura; il solo caricamento dello ZIP non pubblica il gioco.
4. Apri **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Apri **Actions → Pubblica GTA Click su GitHub Pages → Run workflow**, seleziona `main` e avvia. Questa esecuzione manuale serve anche se il primo caricamento è avvenuto prima di attivare Pages.
6. Quando l’esecuzione è verde, apri il link indicato in Settings → Pages. Con un repository chiamato gta-click sarà normalmente `https://TUO-USERNAME.github.io/gta-click/`.

Ogni successivo caricamento su main (o master) pubblica automaticamente `dist/`. Il workflow è predisposto ma non è stato eseguito su un tuo account GitHub. Non sono stati creati repository o pubblicazioni GitHub per te.

### Alternativa senza workflow personalizzato

Puoi creare un secondo repository contenente **soltanto il contenuto di `dist/`**, con `index.html` direttamente nella radice. In Settings → Pages scegli **Deploy from a branch → main → /(root) → Save**. In questo caso non caricare la cartella dist come livello esterno. Questa alternativa pubblica il gioco ma non include nella pagina pubblicata gli script di sviluppo e i test.

## Progressi, audio e aggiornamenti

I progressi, le impostazioni e le voci caricate personalmente appartengono al browser e all’indirizzo del sito. Non vengono trasferiti automaticamente dal sito attuale a localhost o GitHub Pages, né tra dispositivi. Le musiche e le immagini incluse fanno invece parte dello ZIP. La sintesi vocale usa le voci disponibili nel browser.

La checkbox Opzioni → Sblocca tutte le missioni è salvata separatamente: attivarla permette di giocare qualsiasi missione; disattivarla ripristina l’accesso secondo i completamenti effettivi senza cancellarli.

Modificare o pubblicare questa copia non aggiorna il sito originale. Non è stato aggiunto un sistema di sincronizzazione online dei salvataggi.

## File e verifiche

- `dist/`: sito completo pronto per l’hosting statico.
- `dist/js/`: codice del gioco, missioni, controlli, combattimento, interfaccia.
- `dist/assets/`: immagini, musica e motore Phaser.
- `.github/workflows/pages.yml`: pubblicazione di dist su GitHub Pages.
- `scripts/serve.mjs`: server locale, senza dipendenze aggiuntive.
- `tests/`: verifiche automatiche; esegui `npm test`.
- `README.md`: cronologia tecnica del progetto.

Le immagini e il codice del repository saranno accessibili pubblicamente scegliendo un repository Public.

Documentazione GitHub consultata il 25 ottobre 2026:
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
