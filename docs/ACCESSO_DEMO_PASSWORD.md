# Accesso alla demo con email e password

Configurazione del **21 novembre 2026**, richiesta e consolidata nella sessione Master.

La demo per il collega richiede email e password dedicate nella finestra di
autenticazione del browser. Il visitatore non deve accedere al pannello
Cloudflare e non deve usare la password dell'account che gestisce il server.

## Collegamento e credenziali

https://gioco-aggettivi-demo-login.cloudflare-demo-20261121.workers.dev

- Email da inserire come nome utente: `vitoagrosi@protonmail.com`.
- Password: generata per questa demo e consegnata separatamente all'utente.
  Non è salvata in questo repository né riutilizzata da altri account.
- Le credenziali sono verificate sul server, prima di servire qualsiasi file.
- La chiusura del browser può essere necessaria per dimenticare le credenziali
  memorizzate dalla sua autenticazione HTTP. Per prove distinte usare una finestra privata.

## Protezione del Worker

- Account Cloudflare: `39f3ad5fa00c8987477530436bf58801`.
- Worker corrente: `gioco-aggettivi-demo-login`.
- Configurazione: [wrangler.demo-login.jsonc](../webapp/wrangler.demo-login.jsonc).
- Protezione: [demo-auth.mjs](../webapp/worker/demo-auth.mjs).
- Il segreto `DEMO_CREDENTIALS_SHA256` conserva l'impronta delle credenziali
  con password generata casualmente; il valore non compare nel frontend.
- `run_worker_first: true` applica il controllo anche a JavaScript, CSS,
  font, immagini e percorsi alternativi. Mancanza di segreto o binding: 503.
- Credenziali assenti o errate: 401; tentativi falliti limitati per indirizzo IP
  tramite binding Cloudflare, con risposta 429 al superamento della soglia.
- Le risposte impediscono la memorizzazione HTTP con `Cache-Control: no-store`.
- Anteprime disattivate; nessun dominio personalizzato collegato.

Questa è una protezione temporanea per una bozza. Gli account del torneo,
le sessioni dell'applicazione e il recupero delle password restano da implementare.
La demo continua a usare dati fittizi e salvataggi locali delle giocate.
Un visitatore autorizzato può conservare quanto scarica o vede.

## Compilazione e pubblicazione

Dalla cartella `webapp`:

```powershell
npm test
npm run build:demo
npx --yes wrangler@4.166.0 deploy --config wrangler.demo-login.jsonc
```

La modalità `demo` non genera né registra la PWA offline e il Worker risponde
410 a `/sw.js` dopo l'autenticazione. La build ordinaria resta disponibile
per la futura PWA, ma non è quella da distribuire a questo indirizzo.
Le credenziali devono essere configurate come segreto server, senza inserirle
nei comandi di pubblicazione, nel repository o nelle variabili pubbliche di Vite.
Per cambiare password generare un nuovo valore dedicato e aggiornare il segreto
con la nuova impronta SHA-256 di `email:password`; usare l'email in minuscolo.

## Verifiche eseguite

- 11 test superati: cinque della logica del gioco e sei della protezione server.
- Build TypeScript/Vite in modalità demo completata; anche la build PWA ordinaria passa.
- Simulazione Wrangler e pubblicazione del Worker completate.
- Sul sito online, pagina, favicon, icona, font, JavaScript e CSS restituiscono
  401 senza credenziali e i file attesi con le credenziali corrette.
- Email errata e password errata respinte con 401; risposte con `no-store`.
- Il redirect canonico da `/index.html` a `/` rimane sulla stessa origine.
- Il contenuto autorizzato scaricato coincide con la build pubblicata.
- `/sw.js` restituisce 410 dopo l'autenticazione.
- Il nuovo collegamento è attivo; il precedente è stato disattivato dopo i controlli.

La verifica visiva nel browser e sul telefono resta affidata alla prova
dell'utente e del collega. Il collegamento automatico al browser non era disponibile.

## Configurazione precedente

Il Worker `gioco-aggettivi-demo` usava Cloudflare Access ed è ora disattivato,
comprese le anteprime. Il relativo file `wrangler.demo.jsonc` mantiene
`workers_dev: false`. Non ripubblicarlo per la prova del collega.
La prima configurazione è documentata in [PUBBLICAZIONE_DEMO.md](PUBBLICAZIONE_DEMO.md).

Riferimenti: [autenticazione HTTP sul Worker](https://developers.cloudflare.com/workers/examples/basic-auth/),
[controllo prima delle risorse statiche](https://developers.cloudflare.com/workers/static-assets/binding/)
e [segreti server](https://developers.cloudflare.com/workers/configuration/secrets/).
