# Roadmap di sviluppo — Gioco degli Aggettivi

Aggiornata al **17 novembre 2026**.

Obiettivo: passare dalla demo attuale a una PWA utilizzabile per una stagione
completa da 50–100 persone, su telefono e computer, con amministrazione,
notifiche push e recupero delle giocate di emergenza.

La scelta PWA, React/TypeScript e Cloudflare Workers/D1 resta confermata.
Le notifiche push sono una funzionalità richiesta: devono essere implementate
e collaudate prima del torneo ufficiale. Le email di promemoria restano opzionali.
Le regole del gioco e le eccezioni sono decise dal loro autore.

Questa roadmap è il riferimento per l'ordine delle attività e il loro stato.
Il [piano webapp](PIANO_WEBAPP.md) descrive l'architettura; il
[piano B](PIANO_B_WHATSAPP.md) dettaglia la procedura di emergenza.
La valutazione iniziale conserva anche ipotesi tecnologiche superate.

## Stato e traguardi

| Fase | Risultato | Stato | Dipendenze principali |
| --- | --- | --- | --- |
| 0 | Demo e strumenti di lavoro | Base disponibile | — |
| 1 | Regole operative ed esempi approvati | Da completare | Autore del gioco |
| 2 | Design dei percorsi completi | In corso | Demo; regole per i testi definitivi |
| 3 | Ambiente Workers/D1 e controlli automatici | Da fare | Architettura scelta |
| 4 | Accessi, ruoli, persone e gruppi | Da fare | 3; decisioni su partecipazione e privacy |
| 5 | Stagioni, calendario e gestione turni | Da fare | 4; regole sulle scadenze |
| 6 | Raccolta ufficiale delle giocate | Da fare | 4–5; regole di invio e booster |
| 7 | Sondaggisti, recuperi e revisione del campione | Da fare | 6; regole del campione e piano B |
| 8 | Motore dei punteggi verificato | Da fare | 1; contratto dati del campione |
| 9 | Risultati, classifiche e rettifiche | Da fare | 7–8 |
| 10 | Notifiche push e installazione collaudata | Da fare | 4–6; 9 per gli avvisi sui risultati |
| 11 | Spareggi e chiusura della stagione | Da fare | 1, 8–9 |
| 12 | Verifiche complete e pilota | Da fare | 4–11 |
| 13 | Avvio del torneo e manutenzione | Da fare | Pilota superato |

Le fasi non corrispondono a settimane. Design, chiarimenti del regolamento e
preparazione dell'infrastruttura possono procedere insieme. Il motore può essere
sviluppato su dati di prova approvati mentre si completa la raccolta online.
Il lavoro sulle push può iniziare dopo accessi e turni, senza attendere gli
spareggi; l'avviso «risultati pubblicati» si collega alla fase 9.

Traguardi da verificare:

- **Anteprima di design:** percorsi comprensibili e schermate concordate.
- **Prima prova online:** inviti, turni, giocate riservate e ricevute server.
- **Turno completo di prova:** raccolta, recupero WhatsApp, revisione, calcolo,
  pubblicazione e notifiche funzionano insieme.
- **Pilota:** prima 10–15 persone, poi 50–100, con risultati confrontati con
  un riferimento indipendente e simulazione di una stagione completa.
- **Torneo ufficiale:** superati tutti i criteri di avvio della fase 13.

## 0. Base già disponibile

- [x] Frontend React, TypeScript e Vite con dati dimostrativi.
- [x] Inserimento e riordino delle parole, quattro booster, validazione di base.
- [x] Bozza e conferma dimostrativa sul dispositivo, storico locale.
- [x] Esempi di classifiche, regole e amministrazione.
- [x] Manifest, icone, service worker per le risorse statiche e guida PWA.
- [x] Test della logica dimostrativa e build eseguibili.
- [x] Base FigCraft e variante mobile «Proposta 2» disponibili localmente.
- [x] React Grab integrato nell'ambiente di sviluppo per indicare gli elementi
  da modificare tramite copia e incolla nella chat.

La disponibilità del codice PWA non equivale al collaudo sui telefoni.
React Grab è integrato, ma il suo utilizzo effettivo nel browser resta da
verificare con l'utente. La Proposta 2 non è ancora riportata nel frontend.
Backend, accessi, ricevute ufficiali e notifiche non sono implementati.
Le modifiche locali ancora da registrare in Git vanno riviste e organizzate
in commit prima delle successive consegne.

## 1. Definire le regole operative

- [ ] Raccogliere il regolamento vigente e registrare le decisioni dell'autore
  in un documento versionato, distinguendo decisioni approvate e domande aperte.
- [ ] Definire formula della classifica degli aggettivi, pari merito e confini
  della top 10; composizione e pesi del campione, serie A/B, gruppi ed extra.
- [ ] Precisare Jolly, Estensore, Top, 5su10, bonus posizione, en plein e destino
  dei booster inutilizzati al turno 15, con esempi anche in caso di parità.
- [ ] Risolvere iscrizioni tardive, punteggi iniziali, assenti, turno senza invii,
  cambi nei gruppi, validità delle parole e correzioni consentite.
- [ ] Fissare l'istante esatto di chiusura, la finestra dei sondaggisti,
  le revisioni tardive ammesse e le regole del piano B WhatsApp.
- [ ] Definire spareggi di classifica, playoff/playout, promozioni,
  retrocessioni e casi con pochi partecipanti o parità persistenti.
- [ ] Preparare almeno tre campioni di esempio con graduatorie e punteggi
  attesi approvati, aggiungendo esempi dedicati ai casi limite.

**Completata quando:** le decisioni necessarie al calcolo e agli invii sono
esplicite e gli esempi attesi sono confermati dall'autore. Le parti indipendenti
del progetto possono avanzare prima, senza introdurre regole implicite.

## 2. Definire e realizzare il design

- [ ] Provare React Grab con l'utente e concordare il flusso di revisione:
  elemento selezionato, richiesta, modifica React/CSS, controllo nell'anteprima.
- [ ] Valutare la Proposta 2: intestazione compatta, campi, booster richiudibili
  e visibilità dell'azione di conferma. Riportare in React le scelte concordate.
- [ ] Uniformare colori, tipografia, spaziature, pulsanti e componenti condivisi.
- [ ] Completare accesso/invito, profilo e gruppo, turno, riepilogo, ricevuta,
  sondaggisti, risultati, storico, regolamento e preferenze delle notifiche.
- [ ] Progettare l'amministrazione: partecipanti, calendario, invii mancanti,
  recuperi, revisione, anteprima dei risultati, pubblicazione e rettifiche.
- [ ] Disegnare gli stati vuoti, caricamento, errore, offline, scadenza,
  invio dall'esito incerto e sessione scaduta; distinguere sempre bozza e ricevuta.
- [ ] Verificare telefono e desktop, tastiera, focus, etichette, contrasto,
  ingrandimento del testo e riordino utilizzabile senza trascinamento.

**Completata quando:** concorrente e organizzatore riescono a percorrere
le operazioni principali nell'anteprima, anche nelle condizioni di errore.

## 3. Preparare infrastruttura e ambiente di sviluppo

- [ ] Configurare Workers con Static Assets e D1, iniziando dall'ambiente locale.
- [ ] Separare sviluppo, collaudo e produzione; predisporre configurazioni,
  segreti e dati fittizi senza versionare credenziali o materiale degli account.
- [ ] Progettare schema SQL, migrazioni, vincoli, indici e dati iniziali per
  account, persone, gruppi, stagioni, turni, revisioni, booster, risultati,
  recuperi, operazioni amministrative e sottoscrizioni push.
- [ ] Definire contratti API, errori, versioni dei dati e confini della logica
  delle regole; separare le parti dimostrative dal percorso ufficiale.
- [ ] Predisporre controlli automatici per TypeScript, test, build e migrazioni,
  più una procedura ripetibile di distribuzione e ripristino della versione.
- [ ] Valutare e risolvere le segnalazioni nelle dipendenze. Il controllo del
  17 novembre ha rilevato quattro segnalazioni moderate nella catena PWA
  già presente; verificare aggiornamenti compatibili senza correzioni forzate.
- [ ] Verificare quote, tempi di esecuzione, costi, dominio e HTTPS prima di
  scegliere eventuali servizi a pagamento o attivare l'ambiente per il gruppo.

**Completata quando:** una nuova installazione riproduce app e database locale;
l'ambiente di collaudo serve frontend e API e applica le migrazioni previste.

## 4. Implementare accessi e partecipanti

- [ ] Scegliere una soluzione di autenticazione consolidata e compatibile con
  Workers/D1; definire invito, verifica, recupero accesso e gestione delle sessioni.
- [ ] Implementare ruoli e controlli server per concorrente, sondaggista e
  amministratore, comprese le combinazioni ammesse dal regolamento.
- [ ] Gestire persone, nickname, concorrenti individuali, coppie/gruppi,
  componenti, referente autorizzato, serie e stato dell'iscrizione.
- [ ] Impedire partecipazioni multiple e il doppio contributo come concorrente
  e sondaggista puro; gestire le variazioni dei gruppi secondo le regole approvate.
- [ ] Proteggere sessioni ed endpoint, limitare i tentativi abusivi e predisporre
  accesso amministrativo rafforzato e recupero di emergenza.
- [ ] Definire informativa, gestione dei minori, conservazione e cancellazione
  dei dati con il responsabile del progetto, prima di raccogliere dati reali.

**Completata quando:** gli utenti di prova accedono soltanto ai propri dati
e alle operazioni autorizzate; i tentativi tramite API ricevono gli stessi controlli.

## 5. Gestire stagioni e turni

- [ ] Creare stagioni con versione del regolamento, iscritti, serie,
  dotazione dei booster e punteggi iniziali approvati.
- [ ] Preparare calendario, pause, parola, iniziale e scadenze distinte per
  concorrenti e sondaggisti, con visualizzazione nel fuso Europe/Rome.
- [ ] Implementare gli stati: preparazione → aperto → concorrenti chiusi →
  revisione del campione → campione congelato → calcolato → pubblicato.
- [ ] Definire quali modifiche sono ammesse in ciascuno stato e tracciarle,
  comprese riaperture e variazioni del calendario autorizzate.
- [ ] Registrare gli istanti in UTC e gestire i cambi d'ora; coordinare
  aperture, chiusure visibili e attività programmate.

**Completata quando:** l'organizzatore prepara e conduce un turno di prova;
un errore dell'attività programmata non rende validi invii fuori termine.

## 6. Raccogliere le giocate ufficiali

- [ ] Collegare la schermata del turno a dati, permessi e booster reali.
- [ ] Salvare le bozze separatamente dalle giocate ricevute; isolare i dati
  locali per account e turno ed evitare residui di un altro utente sul dispositivo.
- [ ] Validare lato server parole, numero, ordine, iniziale, duplicati,
  iscrizione e disponibilità del booster secondo il regolamento approvato.
- [ ] Accettare invio, revisione e utilizzo del booster con un'operazione
  atomica; preservare lo storico e una sola revisione efficace per turno.
- [ ] Restituire ID, orario server e revisione della ricevuta; rendere ripetibili
  i tentativi dopo un errore di rete senza duplicare giocate o consumare booster.
- [ ] Rifiutare nuovi invii tardivi, rilevare modifiche contemporanee da più
  dispositivi e permettere di verificare l'esito di un invio dalla risposta persa.
- [ ] Offrire riepilogo e storico ufficiale; mostrare chiaramente offline,
  bozza, invio in corso, invio da verificare e giocata ricevuta.

**Completata quando:** le prove attorno alla scadenza, con rete interrotta e
richieste simultanee, producono ricevute coerenti e nessun doppio utilizzo.

## 7. Completare campione, piano B e revisione

- [ ] Implementare il percorso dei sondaggisti con parole ordinate, extra
  separati e finestra dedicata, senza esporre le risposte altrui.
- [ ] Aggiungere «Copia giocata per WhatsApp» e il formato manuale; verificare
  la copia offline quando app e dati del turno sono già disponibili.
- [ ] Creare sessioni amministrative di recupero, inserimento singolo e import
  CSV con anteprima, errori, duplicati, conflitti e approvazione esplicita.
- [ ] Conservare originale, provenienza, ora del messaggio, ora di caricamento,
  responsabile e motivazione; rendere l'import ripetibile senza duplicazioni.
- [ ] Gestire refusi, troncamenti, concordanze e sostituzioni autorizzate
  conservando originali e motivazioni, senza unificare sinonimi automaticamente.
- [ ] Mostrare partecipanti mancanti e anomalie; includere nel campione solo
  le revisioni efficaci e i recuperi approvati, contando ciascun contributo una volta.
- [ ] Congelare campione, mappature e versione delle regole prima del calcolo.

**Completata quando:** un turno con invii online, sondaggisti e recuperi
WhatsApp arriva a un campione verificabile; ripetere un import non cambia i conteggi.

## 8. Implementare il motore dei punteggi

- [ ] Realizzare una libreria di calcolo indipendente dall'interfaccia,
  deterministica e legata alla versione approvata del regolamento.
- [ ] Calcolare prima la classifica degli aggettivi e poi i punti dei concorrenti,
  mantenendo distinti i due passaggi e i relativi pari merito.
- [ ] Applicare tabella punti, booster, ordine, en plein, assenti e casi limite
  esclusivamente secondo le decisioni e gli esempi della fase 1.
- [ ] Produrre un dettaglio comprensibile del contributo di parole e bonus.
- [ ] Verificare tutti gli esempi approvati, compresi dieci aggettivi, extra,
  campione vuoto, parità e condizioni al turno 15.
- [ ] Confrontare almeno due turni con un calcolo indipendente e verificare
  che ripetere l'elaborazione sullo stesso campione produca lo stesso risultato.

**Completata quando:** tutti i risultati attesi concordati coincidono e
ogni punto assegnato è riconducibile a dati e regole conservati.

## 9. Pubblicare risultati e classifiche

- [ ] Fornire all'organizzatore anteprima, anomalie e riepilogo prima della
  pubblicazione; impedire la lettura di risultati provvisori ai giocatori.
- [ ] Pubblicare coerentemente risultati del turno, graduatoria degli aggettivi,
  dettaglio personale e classifiche per serie.
- [ ] Collegare storico, disponibilità dei booster, totali e spareggi di
  classifica ai risultati pubblicati, con possibilità di ricostruire i totali.
- [ ] Esportare partecipanti, giocate e risultati nei formati concordati.
- [ ] Gestire rettifiche motivate con nuove versioni, ricalcolo delle dipendenze
  e conservazione dei risultati precedenti; rendere visibili le correzioni.
- [ ] Registrare l'evento di pubblicazione per attivare gli avvisi della fase 10
  soltanto dopo il completamento effettivo dell'operazione.

**Completata quando:** nessuno vede classifiche parzialmente aggiornate;
una rettifica di prova aggiorna correttamente tutti i risultati dipendenti.

## 10. Implementare notifiche push e completare la PWA

- [ ] Aggiungere preferenze per apertura turno, promemoria di scadenza e
  pubblicazione dei risultati; definire frequenza, orari e destinatari con
  l'organizzatore. Proposta da confermare: promemoria ai soli concorrenti mancanti.
- [ ] Mostrare «Attiva notifiche» con spiegazione e richiesta del consenso dopo
  un'azione dell'utente; gestire permesso negato, revocato e dispositivo non compatibile.
- [ ] Registrare sottoscrizioni per account e dispositivo nel backend,
  proteggere chiavi ed endpoint e permettere disattivazione e rimozione.
  Su dispositivi condivisi impedire che un cambio account esponga avvisi del precedente.
- [ ] Verificare la soluzione Web Push compatibile con Workers, predisporre
  le chiavi VAPID e adattare il service worker per ricevere e mostrare le notifiche.
- [ ] Implementare invii legati agli eventi e promemoria programmati,
  rileggendo scadenza, stato del turno, preferenze e destinatari prima dell'invio.
- [ ] Gestire tentativi successivi con limiti, scadenza dei messaggi, registrazione
  degli esiti e rimozione delle sottoscrizioni non più valide. Ridurre i duplicati
  e annullare gli avvisi obsoleti quando il calendario cambia.
- [ ] Aprire il turno o i risultati corretti al tocco sulla notifica,
  rispettando autenticazione e permessi; usare testi adatti alla schermata bloccata,
  senza rivelare parole giocate o dati riservati.
- [ ] Completare installazione, aggiornamento e cache PWA: preservare le bozze,
  non memorizzare risposte riservate nelle cache statiche e distinguere l'uso offline.
- [ ] Collaudare su Android e iPhone reali: app in primo piano e chiusa,
  schermo bloccato, permessi negati/revocati, più dispositivi, nuova installazione,
  apertura dall'avviso e aggiornamento del service worker.

**Completata quando:** gli avvisi delle tre categorie arrivano sui dispositivi
compatibili di prova, aprono la destinazione corretta e rispettano le preferenze.
Chi disattiva le notifiche continua a poter giocare normalmente. Un errore del
servizio push non blocca invio delle giocate o pubblicazione dei risultati.

Su iPhone/iPad le push richiedono una webapp aggiunta alla Home, sistema
compatibile da iOS/iPadOS 16.4 e consenso; predisporre una guida e rilevare
le funzionalità disponibili. Installare la PWA non attiva da solo gli avvisi.
La ricezione non è garantita né costituisce prova che il giocatore abbia letto
un avviso: le scadenze restano visibili nell'app e controllate dal server.
Gli esiti del servizio push distinguono accettazione dell'invio e lettura,
senza presentare la prima come prova della seconda.

Riferimenti per l'implementazione:
[WebKit, push nelle webapp Home](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
e [MDN, Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API).
Compatibilità, librerie e condizioni dei servizi vanno ricontrollate quando
si implementa la fase. Un canale email aggiuntivo richiede una scelta separata.

## 11. Gestire spareggi e fine stagione

- [ ] Implementare qualificazioni, tabelloni e gare di playoff/playout
  secondo il formato approvato, compresi confronti con più concorrenti.
- [ ] Gestire campione, parità persistenti, avanzamenti e risultati delle gare.
- [ ] Calcolare promozioni, retrocessioni e classifiche conclusive.
- [ ] Stabilire il percorso per rettifiche che influenzano qualificazioni o gare
  già disputate; richiedere la decisione organizzativa prevista dalle regole.
- [ ] Archiviare la stagione, conservare gli export previsti e preparare
  una nuova stagione con booster e iscrizioni correttamente inizializzati.

**Completata quando:** una simulazione attraversa tutti i turni e gli spareggi,
chiude la stagione e ne apre un'altra senza trascinare consumi o dati impropri.
Questa fase deve essere collaudata prima del torneo, senza attendere il turno 20.

## 12. Verificare il sistema e svolgere il pilota

- [ ] Eseguire test del motore, API, vincoli database e percorsi completi
  con dati fittizi, includendo i casi emersi dalle fasi precedenti.
- [ ] Verificare segretezza prima della pubblicazione, separazione dei ruoli,
  sessioni, accessi amministrativi, log e cache, anche chiamando direttamente le API.
- [ ] Provare 100 invii ravvicinati, revisioni concorrenti, errori di rete,
  cambi d'ora e limiti dell'infrastruttura; fissare prima soglie accettabili di
  latenza, errori e consumi con il responsabile del progetto.
- [ ] Configurare esportazioni fuori da Cloudflare e ripristino D1; provare
  il recupero e concordare perdita dati massima e tempo di ripristino accettabili.
- [ ] Simulare il piano B completo: risposta online persa, messaggio WhatsApp,
  recupero ripetuto, conflitto del booster e riconciliazione prima del calcolo.
- [ ] Verificare Android, iPhone e desktop, accessibilità, installazione,
  aggiornamenti, notifiche, recupero accesso e rimozione dei dati locali.
- [ ] Eseguire prima una prova guidata con 10–15 persone, poi il pilota con
  50–100 e turni abbreviati; raccogliere problemi e confronto con il metodo attuale.
- [ ] Ripetere i controlli interessati dalle correzioni e la simulazione della
  stagione completa; registrare esiti, difetti residui e valutazione dell'organizzatore.

**Completata quando:** il pilota non presenta anomalie critiche aperte su
calcolo, segretezza, invii, booster e recupero; i criteri concordati sono rispettati
e le push sono state provate su entrambi i sistemi mobili.

## 13. Avviare il torneo e organizzare la manutenzione

- [ ] Confermare regolamento, calendario, referenti, partecipanti, istruzioni
  e condizioni del piano B; predisporre assistenza e guida di installazione/notifiche.
- [ ] Verificare ambiente definitivo, dominio/HTTPS, configurazione,
  privacy, backup, monitoraggio, avvisi tecnici e procedura di ritorno alla versione precedente.
- [ ] Caricare i dati iniziali approvati, verificare inviti e gruppi ed eliminare
  i dati dimostrativi dall'ambiente del torneo con una procedura controllata.
- [ ] Eseguire una verifica finale sul rilascio e ottenere il via libera
  dell'organizzatore dopo il superamento del pilota.
- [ ] Attivare il torneo e presidiare i primi turni, controllando invii,
  sottoscrizioni push, errori, tempi, quote e consumi.
- [ ] Pianificare aggiornamenti delle dipendenze, verifiche dei backup e del
  ripristino, assistenza, revoche degli accessi e manutenzione delle sottoscrizioni.
- [ ] A fine stagione rivedere problemi, costi e richieste prima di pianificare
  la successiva, preservando storico e versioni delle regole.

**Criterio di avvio:** regole approvate, verifiche critiche e pilota superati,
nessun difetto critico aperto, recupero provato, notifiche implementate e collaudate,
organizzatore pronto a gestire un turno completo e un eventuale disservizio.

## Prossimo lavoro e aggiornamento della roadmap

1. Provare React Grab sul turno e definire la prima modifica grafica da realizzare.
2. Aprire il registro delle decisioni sul regolamento con le domande della fase 1.
3. Preparare l'ambiente locale Workers/D1 e lo schema iniziale, coordinandolo
   con identità, gruppi, versioni delle giocate e notifiche per dispositivo.

Al termine di ogni consegna aggiornare le caselle e lo stato della fase,
collegare codice o documento prodotto e riportare la verifica effettuata.
Una fase è conclusa quando soddisfa il proprio criterio, non soltanto quando
le schermate sono presenti. Le attività non ancora spuntate sono lavoro pianificato.

Non è fissata una data di consegna. La vecchia stima di 11–15 settimane era
riferita all'ipotesi mobile iniziale: non va riutilizzata come impegno per questa
roadmap. Dopo regole, percorsi e prima prova online stimare l'impegno residuo
in base al tempo disponibile, alle dipendenze esterne e ai risultati delle prove.
