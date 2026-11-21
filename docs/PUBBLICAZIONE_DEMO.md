# Prima pubblicazione con Cloudflare Access

**Configurazione precedente, sostituita il 21 novembre 2026.**
La demo attuale usa email e password dedicate: vedi
[accesso alla demo con password](ACCESSO_DEMO_PASSWORD.md).
Il vecchio collegamento descritto sotto è stato disattivato dopo la verifica
del nuovo accesso. Le informazioni seguenti documentano la prima configurazione.

Aggiornato il **21 novembre 2026** dalla sessione Master.

La bozza dell'interfaccia è online nell'account Cloudflare del progetto,
**protetta da Cloudflare Access** per il solo indirizzo autorizzato.

Link della demo:
https://gioco-aggettivi-demo.cloudflare-demo-20261121.workers.dev

La pagina di autenticazione propone attualmente **Sign in with: Cloudflare**.
Questo metodo predefinito deve essere sostituito, per questa applicazione,
con **One-time PIN** via email: l'accesso alla demo deve essere separato
dall'account che gestisce Cloudflare. La modifica non è ancora applicata.
L'apertura della demo dopo il login e la revisione visiva restano da provare.

Per completare la separazione, aggiungere One-time PIN in Zero Trust →
Integrations → Identity providers, quindi modificare l'applicazione:
in Authentication disattivare Accept all available identity providers e
selezionare solo One-time PIN. Conservare la policy Allow per la sola email
`vitoagrosi@protonmail.com`. Verificare il login con codice dalla casella
autorizzata e controllare nuovamente la protezione delle risorse.
Vedi la [guida One-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/).

## Configurazione attuale

- Account: `39f3ad5fa00c8987477530436bf58801`.
- Worker: `gioco-aggettivi-demo`.
- Configurazione: [wrangler.demo.jsonc](../webapp/wrangler.demo.jsonc).
- Versione corrente: `675b8b24-721b-4396-98a4-b07c17ae60d5`.
- `workers_dev: true` e `preview_urls: false`.
- Applicazione Access: `Gioco degli aggettivi demo privata`.
- Login Access: `misty-mode-0f7a.cloudflareaccess.com`.
- Nessun dominio personalizzato collegato al Worker.

La riattivazione tramite API ha restituito `enabled: true` e
`previews_enabled: false`. Il nome `workers_dev` abilita l'indirizzo, mentre
la riservatezza è applicata dalla policy Access collegata al Worker.
Non rimuovere quella protezione durante aggiornamenti o nuove pubblicazioni.

## Visitatori autorizzati

L'utente ha indicato un solo indirizzo da autorizzare:
`vitoagrosi@protonmail.com`, account preparato per il collega.
Questa è la destinazione richiesta per la regola di accesso alla demo;
non aggiungere altri indirizzi o interi domini email.

Al primo controllo le API segnalavano che Cloudflare Access non era attivo.
Dopo la procedura dell'utente, la lettura delle applicazioni Access restituisce
200 e un elenco vuoto. Il tentativo di creare la regola per la demo è stato
rifiutato con `403 auth.forbidden`: l'autorizzazione di Wrangler non consente
questa modifica. La lettura dell'organizzazione Access restituisce ancora 403.
Il collegamento automatico al browser non è disponibile. L'utente ha creato
l'applicazione e la policy dal dashboard e fornito gli screenshot e l'URL
del dashboard, che conferma lo stesso account della demo.

La configurazione mostrata nel dashboard è:

- Applicazione: `Gioco degli Aggettivi demo privata`, tipo Self-hosted.
- Destinazione `gioco-aggettivi-demo`, identificativo Worker
  `f60c0244f894445fbcad7ba203afdb18`, tipo
  `A Worker's production and preview URLs`.
- Policy `Accesso Vito`, azione Allow, con un'unica regola
  Include → Emails → `vitoagrosi@protonmail.com`.
- La durata sessione proposta è 8 ore; il valore salvato non è stato verificato.
- Nessuna regola Bypass, Everyone o autorizzazione per l'intero dominio ProtonMail.

La credenziale API di Wrangler continua a restituire un elenco Access vuoto:
non usarlo per concludere che la protezione manca o per ricreare l'applicazione.
La policy è stata verificata negli screenshot dell'utente; il funzionamento
della protezione è stato verificato tramite richieste HTTP senza sessione.

## Verifica della protezione

Le seguenti richieste hanno ricevuto **302 verso il login Cloudflare Access**,
senza restituire le risorse della demo:

- `/` e `/index.html`;
- `/manifest.webmanifest` e `/sw.js`;
- `/icons/icon-192.png` e `/fonts/dm-sans-400.ttf`;
- JavaScript `/assets/index-DFBzHVtR.js`;
- CSS `/assets/index-DZr9vWdW.css`.

La pagina di login ha risposto HTTP 200 e mostra il nome dell'applicazione e
il metodo Cloudflare. Durante la riattivazione il primo 404 era transitorio;
il controllo è stato ripetuto attendendo la propagazione del collegamento.
La prova con l'account autorizzato e quella con un'altra identità non sono
state eseguite: devono confermare rispettivamente ingresso e rifiuto.

## Versione caricata

È inclusa la prima revisione React della sessione DESIGN, con booster aperti
all'avvio, intestazione compatta, riepilogo e conferma DEMO. Vedi il
[resoconto DESIGN](RESOCONTO_DESIGN.md) per scelte e verifiche ancora aperte.

Sono stati caricati i file compilati della demo, senza credenziali o documenti
degli account. Le prove sono salvate nel browser del visitatore; non sono
collegati database, accessi dei giocatori, invii ufficiali o calcolo dei punteggi.
I cinque test della logica e la build sono stati completati con successo.

## Accesso e prossima pubblicazione

Il primo caricamento aveva abilitato il collegamento pubblico `workers.dev`.
Dopo la richiesta dell'utente di mantenere privato il materiale, la Master
ha disattivato sia quel collegamento sia gli indirizzi di anteprima e verificato
il risultato tramite API. Durante i controlli iniziali il collegamento HTTPS
aveva restituito un errore TLS, poi risolto. Dopo la creazione della protezione
Access nel dashboard, il collegamento è stato riattivato e verificato come sopra.

La preferenza del progetto per questa prova è **accesso riservato**, anche
per le successive pubblicazioni. Conservare la policy per il solo indirizzo
indicato e ricontrollare che le richieste senza autenticazione non restituiscano
HTML, JavaScript, CSS o altre risorse della demo. Se il controllo fallisce,
disattivare il collegamento con `workers_dev: false`, mantenendo anche
`preview_urls: false`, e correggere Access prima di ripubblicare.

Cloudflare documenta la disponibilità pubblica degli indirizzi `workers.dev`
e la protezione tramite Access nella
[guida workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/).
Le credenziali di Wrangler restano nella configurazione locale dell'utente,
fuori dal repository.
