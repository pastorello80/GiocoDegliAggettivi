# Gioco degli Aggettivi

Prima anteprima interattiva della webapp, costruita con React, TypeScript e Vite.

## Avvio

Richiede Node.js 22.12 o successivo.

```powershell
npm ci
npm run dev
```

Il terminale mostra l'indirizzo locale. Per la versione compilata:

```powershell
npm run build
npm run preview
```

## Cosa si può provare

- Compilazione e riordino di cinque aggettivi, o dieci con Estensore e 5su10.
- Selezione di un solo booster e controlli di completezza, iniziale e duplicati.
- Riepilogo e conferma dimostrativa; storico della prova sul dispositivo.
- Classifiche di esempio filtrabili per serie.
- Regole sintetiche e anteprima del pannello amministrativo.
- Preparazione di un turno nell'anteprima amministrativa, senza modificare il turno pubblico.
- Guida di installazione per iPhone e Android e richiesta nativa dove il browser la rende disponibile.
- Manifest PWA, icone, schermata standalone e risorse statiche disponibili offline dopo il primo caricamento della build.

I font sono serviti dal progetto con le rispettive licenze OFL. Nessun font viene richiesto a Google durante l'utilizzo. Le immagini delle icone si generano durante la build dal file SVG originale.

## Limiti della demo

Non sono collegati autenticazione, database, invii all'organizzatore, notifiche o calcolo ufficiale. La navigazione nell'area amministrativa è liberamente disponibile nell'anteprima e non rappresenta un sistema di autorizzazione. Dati, nomi, punteggi, numero di iscritti e calendario sono dimostrativi.

La bozza e la conferma DEMO rimangono nel localStorage del browser, su quel dispositivo e per quell'origine. La data della conferma proviene dal dispositivo e non ha valore di ricevuta ufficiale. Il blocco alla scadenza sarà un controllo server nella fase successiva; la demo resta provabile anche dopo la data di esempio.

Non inserire dati personali o giocate reali. Nel servizio definitivo i permessi e le scadenze saranno applicati dal backend. Le regole vengono decise dall'autore del gioco; la formula del sondaggio è ancora da definire.

## Verifiche

```powershell
npm test
npm run build
npm audit --omit=dev
```

I test coprono controlli della giocata, riordino, dati locali corrotti e differenza fra una conferma e modifiche successive. La build verifica TypeScript e genera il service worker. L'installazione e il comportamento sui telefoni reali richiedono ancora collaudo: la verifica automatica tramite browser non è stata autorizzata in questa sessione.

L'anteprima di sviluppo non registra il service worker; per provare installazione e cache usare una build servita con HTTPS, o un ambiente locale sicuro compatibile. Un indirizzo localhost aperto sul telefono indica il telefono stesso: per prove sul dispositivo usare l'indirizzo HTTPS pubblicato, secondo le autorizzazioni del sito.

## Pubblicazione

`.openai/hosting.json` conserva l'identità Sites del progetto e la directory `dist`. Il sito viene mantenuto privato per il proprietario. La condivisione con il gruppo e il collaudo dell'installazione attraverso il relativo sistema di accesso andranno verificati prima del pilota.
