# Gioco degli Aggettivi

Webapp per organizzare il Gioco degli Aggettivi con un primo gruppo di 50-100 persone. Si apre da browser su telefono o computer e può essere aggiunta alla schermata iniziale come PWA.

Repository: https://github.com/pastorello80/GiocoDegliAggettivi

## Stato del progetto

È disponibile una prima anteprima interattiva del frontend con dati dimostrativi: inserimento e riordino degli aggettivi, scelta dei booster, conferma di prova, storico locale, classifiche di esempio e area amministrativa dimostrativa.

Account, invii ufficiali, backend, database e calcolo dei punteggi non sono ancora collegati. Le prove rimangono nel browser del dispositivo. Non inserire dati personali o giocate reali nella demo.

## Avvio in locale

Richiede Node.js 22.12 o successivo e npm.

```powershell
cd webapp
npm ci
npm run dev
```

Il terminale mostra l'indirizzo dell'anteprima. Dalla stessa cartella:

```powershell
npm test
npm run build
npm run preview
```

Il frontend si può sviluppare senza account Cloudflare né dominio. L'ambiente locale Workers/D1 è una delle prossime attività; non è ancora configurato in questo primo commit.

## Architettura scelta

- React, TypeScript e Vite per il frontend, con manifest e service worker PWA.
- Cloudflare Workers con Static Assets per pubblicare frontend e API.
- Cloudflare D1 come database SQL gestito.
- Gestione degli accessi nell'applicazione, senza richiedere account Cloudflare ai giocatori.

L'ambiente definitivo concentrerà l'infrastruttura nell'account Cloudflare. Si prevede di partire nelle quote gratuite, verificandone i limiti durante le prove. Dominio ed eventuali email sono voci separate. Nessun abbonamento a pagamento è stato attivato.

## Regolamento e piano B

L'autore del gioco decide tutte le regole. La formula della classifica degli aggettivi resta da definire prima di sviluppare il calcolo ufficiale.

È pianificata una procedura di emergenza: raccolta privata via WhatsApp e successivo caricamento amministrativo delle giocate approvate. La funzionalità non è ancora implementata e le condizioni di ammissione devono essere stabilite dall'autore.

## Documentazione

- [Piano aggiornato della webapp](docs/PIANO_WEBAPP.md)
- [Procedura proposta per il piano B](docs/PIANO_B_WHATSAPP.md)
- [Rapporto per l'organizzatore](docs/RAPPORTO_ORGANIZZATORE.md)
- [Rapporto PDF da condividere](output/report/Rapporto_Gioco_degli_Aggettivi.pdf)
- [Dettagli e limiti del frontend](webapp/README.md)
- [Template modificabile in FigCraft e guida MCP](docs/design/README.md)
- [Valutazione iniziale con note sugli aggiornamenti](VALUTAZIONE_E_PIANO.md)

## Organizzazione dei file

```text
webapp/          frontend e test
docs/            decisioni, pianificazione e template FigCraft in design/
scripts/         generazione del rapporto e del template grafico
output/report/   rapporto PDF
```

Lo script di generazione del rapporto usa Python, ReportLab e i font Arial di Windows; non è necessario per eseguire o compilare la webapp.

## Materiale locale

Credenziali, materiale degli account, dipendenze, build, database locali e cache sono esclusi dal versionamento. Lo storico Git della prima anteprima privata è conservato separatamente nel workspace locale; questa repository raccoglie il progetto completo con frontend e documentazione.
