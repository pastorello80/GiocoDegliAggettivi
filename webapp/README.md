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

## Lavorare sul design con React Grab

React Grab è incluso fra le dipendenze di sviluppo e si carica solo con
`npm run dev`. Per iniziare, apri nel browser l'indirizzo mostrato da Vite.

1. Porta il puntatore sull'elemento che vuoi modificare e premi **Ctrl+C**
   (su Mac **Cmd+C**). Se necessario, tieni premuti i tasti finché compare
   la selezione, poi fai clic sull'elemento da copiare.
2. Incolla il contesto nella chat e descrivi il risultato desiderato, per esempio:
   «Riduci lo spazio sopra questo titolo» oppure «Rendi richiudibile questo riquadro».
3. Le modifiche al codice si vedono nell'anteprima mentre Vite è in esecuzione.

Il contesto copiato identifica l'elemento e, quando disponibile, il componente
React con la posizione nel sorgente. La selezione serve a indicare dove
intervenire; la modifica viene eseguita nel progetto tramite la chat.
Per uscire dalla selezione premi **Esc**. Per copiare normalmente il testo di
un campo, selezionalo nel campo prima di usare Ctrl+C.

React Grab non viene incluso nella build di produzione né nell'anteprima
`npm run preview`. Il flusso usa copia e incolla, senza configurare un agente
esterno o un collegamento automatico alla chat.

Riferimento: [documentazione ufficiale React Grab](https://github.com/aidenybai/react-grab).

## Limiti della demo

Non sono collegati accessi dei giocatori, database, invii all'organizzatore, notifiche o calcolo ufficiale. La protezione temporanea della demo con password è distinta dagli account del torneo. La navigazione nell'area amministrativa è liberamente disponibile dopo l'accesso alla demo e non rappresenta un sistema di autorizzazione. Dati, nomi, punteggi, numero di iscritti e calendario sono dimostrativi.

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

La demo di prova è pubblicata su Cloudflare Workers con email e password
dedicate, senza richiedere al visitatore un account Cloudflare.
Configurazione e verifiche sono nella [guida all'accesso della demo](../docs/ACCESSO_DEMO_PASSWORD.md).
Il file `wrangler.demo-login.jsonc` identifica il Worker con protezione server;
`wrangler.demo.jsonc` conserva invece la precedente demo Access, ora disattivata.

Per compilare questa bozza usare `npm run build:demo`: la modalità `demo`
disabilita registrazione del service worker e generazione della PWA offline.
La normale `npm run build` continua a generare la PWA per lo sviluppo successivo.
Non pubblicare una build ordinaria sul Worker con password. Dopo le verifiche,
pubblicare con `npx --yes wrangler@4.166.0 deploy --config wrangler.demo-login.jsonc`.
Il segreto `DEMO_CREDENTIALS_SHA256` deve essere già configurato nel Worker;
non inserirlo nel sorgente o nelle variabili `VITE_`.

`.openai/hosting.json` conserva separatamente l'identità della precedente
demo Sites, mantenuta privata per il proprietario.
