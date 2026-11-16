# Piano aggiornato per la webapp

Aggiornamento del 16 novembre 2026. Questo documento aggiorna l'impostazione originaria con app Android/iOS descritta in `VALUTAZIONE_E_PIANO.md`.

## Decisioni confermate

- Realizzare una PWA utilizzabile da Android, iPhone e computer e aggiungibile alla Home.
- Distribuire direttamente tramite web, senza passare dagli store nella prima fase.
- Dimensionare il pilota per 50-100 utenti.
- Affidare ogni decisione sul regolamento al suo autore.
- Definire la formula della classifica degli aggettivi prima di sviluppare il calcolo ufficiale.
- Preparare un frontend dimostrativo per valutare la GUI mentre prosegue la definizione delle regole.
- Concentrare hosting, logica server e database nell'account Cloudflare: Workers per codice e file della webapp, D1 per i dati. Questa scelta sostituisce Cloudflare Pages più Supabase. Attivazione e collegamento sono ancora da svolgere.
- Prevedere la raccolta di emergenza tramite messaggi WhatsApp privati all'organizzatore e il successivo caricamento amministrativo. Attivazione, scadenze e criteri di validità del piano B saranno definiti dall'autore del regolamento.

## Architettura proposta

- Frontend React, TypeScript e Vite, con manifest PWA e service worker.
- Interfaccia giocatore e area amministrativa nello stesso progetto.
- Cloudflare Workers con Static Assets proposto come singola pubblicazione del frontend e delle API; Cloudflare Pages resta tecnicamente possibile ma non è necessario avere due progetti per l'app.
- Cloudflare D1 scelto come database SQL gestito, in luogo di PostgreSQL/Supabase. Migrazioni, vincoli e query saranno adattati alla semantica SQLite di D1.
- Account e autorizzazioni applicative saranno implementati nel backend usando componenti di autenticazione consolidati e compatibili con Workers/D1. Non si assume che D1 fornisca da solo accessi e ruoli o che ogni giocatore debba acquistare un account Cloudflare.
- La gestione amministrativa dell'infrastruttura rimane nel solo account Cloudflare. L'attuale anteprima privata Sites è distinta dall'ambiente definitivo, che non è ancora attivato.
- Ricevute ufficiali e controllo delle scadenze sul server, mai sul telefono.
- Web Push e possibili promemoria email in una fase successiva; gestione specifica dell'installazione su iPhone.
- L'invio email nativo Cloudflare è un'opzione da verificare sull'account e sul dominio: l'invio a destinatari arbitrari richiede Workers Paid; non si presume gratuito sul piano Free. Nel prototipo inviti e assistenza possono essere gestiti manualmente dall'organizzatore.

React Native, Expo/EAS e i canali Apple/Google della valutazione iniziale sono alternative future e non fanno parte del percorso scelto. Nessun account store è necessario per distribuire direttamente questa PWA.

## Stato della prima anteprima

Il codice è in `webapp/`. Sono presenti turno, parole riordinabili, quattro booster selezionabili, validazione della lista, conferma dimostrativa, bozza persistente sul dispositivo, storico locale, classifiche di esempio, guida di installazione e anteprima amministrativa.

Non sono attivati accessi reali, ruoli, database, invii ufficiali, promemoria o calcolo dei punteggi. L'area amministrativa della demo è navigabile e non deve essere usata per dati reali. Il collegamento privato Sites è per l'anteprima del proprietario; non è già un servizio per il gruppo di amici.

## Prossime attività

1. Far valutare all'organizzatore le schermate e il percorso di invio.
2. Chiarire formula, pari merito, campione, extra, booster, bonus e altri casi del regolamento.
3. Approvare esempi con risultati attesi prima di implementare i calcoli.
4. Confermare accesso a invito, gestione dei gruppi, privacy e partecipazione dei minori.
5. Attivare backend Workers, D1, autorizzazioni, ricevute, scadenze e ripristino.
6. Implementare piano B, copia della giocata, inserimento e importazione amministrativa con controllo dei conflitti e audit.
7. Integrare revisione, calcolo e pubblicazione dei risultati, includendo le giocate di emergenza approvate.
8. Collaudare prima con 10-15 persone, poi con 50-100, confrontando i risultati con il metodo attuale e simulando un'interruzione del portale.

Le stime temporali iniziali vanno aggiornate per questa architettura e per il tempo effettivamente disponibile. Workers e D1 consentono di partire a 0 euro entro i limiti Free, da verificare anche per tempo di elaborazione e quote delle query. Workers Paid parte da 5 USD/mese, oltre a imposte e consumi aggiuntivi, ed è da valutare con le prove o per attivare email native verso gli utenti. D1 offre ripristino Time Travel di 7 giorni su Free e 30 su Paid; sono previste anche esportazioni conservate fuori dal servizio. Dominio, sviluppo, manutenzione ed eventuali servizi opzionali sono separati. Nessun piano a pagamento è stato scelto. La procedura proposta è in `PIANO_B_WHATSAPP.md`; il rapporto per l'organizzatore è in `RAPPORTO_ORGANIZZATORE.md` e nella relativa versione PDF.
