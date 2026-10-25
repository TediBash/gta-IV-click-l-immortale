# Colonna sonora v0.13

Composizioni originali, senza campioni esterni. 12 loop e 11 segnali musicali; generatore riproducibile in scripts/compose_soundtrack.py.

| ID | Titolo | Durata | BPM | Tipo |
|---|---|---:|---:|---|
| E1 | Tre fratelli tra gli ulivi | 73.846 s | 78 | Loop |
| E2 | Motori a Fossano | 73.846 s | 104 | Loop |
| E3 | Due cervelli, zero prudenza | 71.111 s | 108 | Loop |
| E4 | Entrare senza bussare | 65.455 s | 88 | Loop |
| E5 | Sotto la città | 75.789 s | 76 | Loop |
| E6 | Diamanti e documenti | 60.0 s | 96 | Loop |
| E7 | Roma non era pronta | 60.0 s | 96 | Loop |
| E8 | Verso casa | 70.244 s | 82 | Loop |
| E9 | Trenta, e un altro livello | 66.207 s | 116 | Loop |
| B1 | Via di corsa! | 53.333 s | 144 | Loop |
| B2 | La banda all’opera | 56.471 s | 136 | Loop |
| B3 | Qui comando io! | 50.526 s | 152 | Loop |
| room | Passaggio | 0.55 s | — | Evento |
| chapter | Nuovo capitolo | 2.5 s | — | Evento |
| found | Oggetto trovato | 1.5 s | — | Evento |
| photo | Ricordo dei fratelli | 2.0 s | — | Evento |
| objective | Obiettivo completato | 1.0 s | — | Evento |
| boss | Boss sconfitto | 4.0 s | — | Evento |
| victory | Missione completata | 6.0 s | — | Evento |
| race | Primo posto | 5.0 s | — | Evento |
| defeat | Ci riproviamo | 3.0 s | — | Evento |
| birthday | Buon compleanno, Immortale | 7.0 s | — | Evento |
| chest | Baule aperto | 0.8 s | — | Evento |

Assegnazioni complete: dist/js/audio/MusicScore.js. Tutti i 31 capitoli sono coperti. Ulivi/casa E1; base greca E4; partenza E8; caveau E6; terrazza E4; compleanno E9. Combattimento B2, boss B3, fuga e gara B1.

Opzioni: silenzia tutto; musica/fanfare, effetti, voci ciascuno con interruttore e volume. Voci spente conservano i sottotitoli e valgono anche per audio caricati. Album completo e download: music.html.

Verifiche: 83 test automatici, file WAV/loop non silenziosi e senza clipping, confini dei loop, mappature, precedenze e cancellazione di caricamenti obsoleti, mute indipendenti. Anteprima gestita assente: ascolto nel browser e prova smartphone non eseguiti.
