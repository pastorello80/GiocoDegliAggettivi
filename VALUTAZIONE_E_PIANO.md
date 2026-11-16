# Gioco degli Aggettivi — valutazione tecnica e piano di sviluppo

**Aggiornamento del 16 novembre 2026:** è stata scelta la direzione webapp/PWA. La parte di questo documento relativa a React Native, Expo e distribuzione attraverso gli store descrive l'ipotesi iniziale, ora superata per la prima versione. Il riferimento operativo aggiornato è [Piano webapp](docs/PIANO_WEBAPP.md); per l'organizzatore è disponibile [il rapporto in linguaggio semplice](docs/RAPPORTO_ORGANIZZATORE.md). Le questioni sul regolamento restano riservate al suo autore.

**Architettura e costi aggiornati:** è stato scelto di concentrare l'infrastruttura su Cloudflare, usando Workers con Static Assets per frontend e codice server e D1 per il database. Questa decisione sostituisce la precedente opzione Cloudflare Pages più Supabase. Si può partire con i piani gratuiti entro le quote; Workers Paid da 5 USD/mese, oltre a imposte ed eventuali consumi aggiuntivi, è un'opzione da valutare dopo le prove o per le email native. Le fasce di 30-90 euro mensili e l'ipotesi Supabase Pro riportate più avanti sono storiche e superate. È previsto un piano B via WhatsApp con recupero amministrativo: criteri e scadenze saranno definiti dall'autore. Il dettaglio aggiornato è nel [piano webapp](docs/PIANO_WEBAPP.md) e nel [piano B](docs/PIANO_B_WHATSAPP.md).

Documento preliminare del 16 novembre 2026, basato sul regolamento della 7ª edizione fornito dall'organizzatore. Le scelte proposte non modificano automaticamente il regolamento. Prezzi dei fornitori verificati alla data del documento, in USD ove indicato, prima di imposte e possibili consumi aggiuntivi.

Decisione di pianificazione confermata dall'organizzatore il 16 novembre 2026: la formula della classifica degli aggettivi è da definire prima dello sviluppo del calcolo. Nessuna formula proposta in futuro dovrà essere trattata come già approvata.

## 1. Fattibilità e dimensionamento

Il progetto è tecnicamente fattibile come applicazione Android e iOS collegata a un servizio online. Il gioco è asincrono: non richiede grafica tridimensionale, connessioni persistenti o sincronizzazione al millisecondo fra i telefoni. Per 50–100 utenti è sufficiente una piccola infrastruttura gestita.

L'impegno principale riguarda correttezza del regolamento, riservatezza delle risposte, gestione delle scadenze e lavoro dell'amministratore. Il rischio progettuale più importante è implementare una formula di classifica non ancora specificata.

Con 100 concorrenti e 20 turni si hanno circa 2.000 giocate definitive nella stagione. Anche ipotizzando dieci parole per ogni giocata, si tratta di 20.000 righe di risposta, cui aggiungere sondaggisti, revisioni e spareggi: volumi modesti per PostgreSQL. Gli accessi concentrati prima della scadenza vanno comunque provati con un test mirato.

Assunzioni della stima: un torneo iniziale, lingua italiana, accesso a invito, nessun pagamento, nessuna chat pubblica, nessuna elaborazione automatica obbligatoria del linguaggio. Coppie e gruppi restano previsti. Si assume un campione comune fra le due serie solo come ipotesi da confermare.

## 2. Framework e architettura proposti

| Componente | Scelta proposta | Funzione |
| --- | --- | --- |
| App mobile | React Native con Expo e TypeScript | Una base di codice per Android e iOS |
| Navigazione | Expo Router | Accesso, turno, booster, classifiche e storico |
| Pannello amministratore | React con Vite e TypeScript | Gestione da browser, preferibilmente da computer |
| Servizio online | Supabase gestito | Autenticazione, database PostgreSQL, API e funzioni server |
| Logica applicativa | TypeScript nelle Edge Functions; transazioni SQL per le scritture critiche | Verifica giocate, calcolo e pubblicazione |
| Regole del gioco | Libreria TypeScript indipendente dall'interfaccia | Calcoli ripetibili, verificabili e versionati |
| Notifiche | Expo Notifications, attraverso APNs e FCM | Apertura turno, promemoria, pubblicazione risultati |
| Build e distribuzione | Expo EAS, App Store Connect, Google Play Console | Produzione e firma delle app, collaudo e rilascio |
| Versionamento e controlli | Git e pipeline CI | Controlli automatici prima delle pubblicazioni |

Questa è una raccomandazione progettuale per un piccolo team senza competenze pregresse dichiarate: TypeScript consente di riutilizzare tipi e regole fra le parti del sistema. Flutter con Dart è un'alternativa valida se chi sviluppa lo conosce già; il modello del servizio online e del database rimarrebbe sostanzialmente uguale. Due app native separate aumenterebbero il lavoro senza un vantaggio evidente per questo gioco.

PostgreSQL è adatto alle relazioni fra persone, squadre, stagioni, turni, giocate e risultati. Supabase riduce il lavoro operativo iniziale; resta necessario progettare permessi, migrazioni e procedure di ripristino.

Schema dei flussi:

```text
App Android/iOS ───────┐
                      ├── autenticazione e API ── funzioni server ── PostgreSQL
Pannello web admin ────┘                               │
                                                     └── notifiche/email
```

Le letture autorizzate possono usare le API del servizio. Invii, consumo dei booster, rettifiche e pubblicazione devono attraversare operazioni server controllate. Il telefono non decide mai il punteggio ufficiale.

Expo permette di compilare iOS su macchine macOS nel cloud: si può iniziare lo sviluppo da Windows. Un Mac resta necessario per usare localmente Xcode e il simulatore iOS; un iPhone reale serve per un collaudo attendibile. Fonte: [Expo Build](https://docs.expo.dev/build/introduction/).

Non servono inizialmente microservizi, Kubernetes, un server da amministrare, una cache distribuita o un sistema di intelligenza artificiale.

## 3. Decisioni sul regolamento prima del motore dei punteggi

| Tema | Questione da risolvere | Conseguenza sul software |
| --- | --- | --- |
| Classifica degli aggettivi | Il testo cita frequenza, preferenze e ordine, ma non definisce la formula | Serve un algoritmo preciso o il foglio di calcolo oggi utilizzato |
| Pari merito fra aggettivi | Non è stabilito come ordinare due parole equivalenti | Serve una regola deterministica, anche ai confini della top 10 |
| Campione | È comune ad A e B? Che peso hanno concorrenti, sondaggisti e gruppi? | Definisce quali risposte entrano nel calcolo e quante volte |
| Dieci parole ed extra | Le dieci parole dei booster entrano tutte nel sondaggio? Come pesano gli extra dei sondaggisti? | Evita di introdurre un vantaggio statistico involontario |
| Iscrizioni tardive | Sono ammesse fino al quarto turno all'inizio del testo, ma vietate dopo il primo più avanti | Va scelta la regola vigente, precisando anche quale classifica usare per il punteggio iniziale |
| Scadenza | «Fino alle 12.00» e «alle 12.01 non valida» lasciano ambiguo il minuto 12.00 | Va definito il secondo esatto e il confronto inclusivo/esclusivo |
| Prova dell'invio | Il testo ammette un invio precedente ricevuto dopo | Va stabilito se l'app usa la ricevuta server o mantiene una procedura eccezionale documentata |
| Booster al turno 15 | Sono obbligatoriamente da esaurire o quelli inutilizzati scadono? | Non attribuire automaticamente un booster senza una regola esplicita |
| Estensore e ordine | Il bonus posizione vale per tutte e dieci le parole? Come si applica l'en plein? | Serve una specifica dedicata |
| 5su10 | Come si scelgono cinque parole quando il punteggio è pari? Dopo il filtro le posizioni vengono ricompattate? | Serve un esempio approvato, preservando l'ordine relativo previsto |
| En plein | I 10 punti si aggiungono ai 5 punti posizione oppure li sostituiscono? | L'interpretazione proposta è aggiuntiva, da confermare |
| Assenti | Il minimo è calcolato per serie o su tutti? Cosa succede se nessuno invia? | I punteggi potrebbero anche essere negativi: non applicare un limite a zero inventato |
| Spareggi Serie A con più concorrenti | Ogni gara ha un vincitore unico? Come si attribuisce una vittoria nei pareggi parziali? | Il testo non determina completamente il formato multi-concorrente |
| Altri casi degli spareggi | Campione delle gare, parità persistenti, numero ridotto di iscritti in B | Necessari prima di automatizzare tutti i tabelloni |
| Correzioni dopo la scadenza | Quali sostituzioni sono ammesse e fino a quando? | Le correzioni autorizzate devono essere distinte dalle normali modifiche tardive |

Sono da chiarire anche: duplicati nella stessa giocata dopo la normalizzazione; parole con iniziale errata; conteggio delle parole ottenute con Estensore/5su10 negli spareggi di classifica della stagione; cambi di componenti delle squadre e loro effetto sull'unicità della partecipazione.

Non occorre fermare tutte le attività in attesa delle risposte: accesso, prototipi e modello dati possono avanzare. Non si deve però dichiarare definitivo il calcolo finché questi punti non sono chiusi.

## 4. Funzioni della prima versione

### Concorrente

- Accesso a invito con email verificata e nome pubblico scelto dall'utente.
- Profilo individuale oppure partecipazione a una coppia/gruppo.
- Turno corrente con parola, iniziale, data e ora di chiusura.
- Inserimento ordinato di cinque parole, oppure dieci quando consentito dal booster; spostamento accessibile anche senza trascinamento.
- Salvataggio della bozza, invio esplicito, conferma con ricevuta server e revisione accettata.
- Modifica della giocata e della scelta del booster entro la scadenza.
- Vista dei quattro booster e della loro disponibilità.
- Classifiche della serie, risultati di turno e dettaglio dei punti.
- Storico, regolamento della stagione e notifiche.

La schermata deve distinguere «bozza sul telefono», «in invio» e «giocata ricevuta». Una bozza offline non è una giocata valida. Nella prima versione non proporrei invii offline con validità retroattiva.

### Sondaggista puro

- Accesso identificato, cinque risposte ordinate ed eventuali parole extra separate.
- Invio possibile nella finestra successiva alla scadenza dei concorrenti, finché il campione resta aperto.
- Nessun accesso alle risposte altrui o ai risultati provvisori prima del congelamento del campione.

Un concorrente contribuisce al campione con la propria giocata: non deve poter aggiungere un secondo voto fingendosi sondaggista puro. L'amministratore può avere anche il ruolo di sondaggista, come previsto.

### Amministratore

- Approvazione iscritti, controllo dei componenti dei gruppi, Serie A/B e punteggi iniziali.
- Creazione della stagione, calendario con pause, parola e iniziale di ogni turno.
- Controllo degli invii e gestione dei sondaggisti.
- Revisione di refusi, troncamenti e concordanze, conservando l'originale.
- Richiesta di sostituzione nei casi ammessi dal regolamento.
- Anteprima dei risultati, controlli, pubblicazione e rettifiche motivate.
- Export CSV, storico delle operazioni e gestione degli spareggi.

Il pannello amministrativo è parte essenziale del prodotto. Un'app per i concorrenti con un foglio esterno per tutto il calcolo lascerebbe irrisolta la parte più delicata.

Per limitare il perimetro iniziale rinvierei chat, pagamenti, pubblicità, profili social, avatar complessi, tornei pubblici aperti e suggerimenti automatici di parole. La prima stagione completa deve comunque supportare gli spareggi prima del loro inizio.

## 5. Identità, squadre e modello dati

Occorre distinguere l'account che accede dalla persona che partecipa e dal concorrente iscritto alla stagione. Un concorrente può essere una persona, una coppia o un gruppo, ma presenta una sola giocata e possiede un solo insieme di booster.

Per il pilota propongo un capitano autorizzato a inviare per il gruppo e una lista di componenti approvata dall'amministratore. La stessa persona non deve appartenere a due concorrenti nella medesima stagione, neppure attraverso un profilo individuale e uno di gruppo. I componenti possono essere censiti senza imporre un account a ciascuno, secondo la politica da concordare.

Email diverse non provano che due persone siano diverse. Nel gruppo chiuso il controllo ragionevole è invito più verifica dell'organizzatore, evitando raccolte sproporzionate di documenti personali.

| Entità | Dati principali |
| --- | --- |
| Account, persone e ruoli | Identità di accesso, nome pubblico, autorizzazioni |
| Stagioni e versioni delle regole | Formula, parametri, calendario e impostazioni |
| Concorrenti e componenti | Tipo individuale/gruppo, capitano, serie, iscrizione e punteggio iniziale |
| Turni | Parola, iniziale, fase, scadenza concorrenti, chiusura campione |
| Revisioni delle giocate | Autore, concorrente, parole ordinate, booster, istante di accettazione |
| Risposte dei sondaggisti | Lista ordinata, extra, versione e stato di inclusione |
| Mappature delle parole | Testo originale, forma canonica, autore e ragione della correzione |
| Booster | Disponibilità stagionale e utilizzo definitivo, con vincolo di unicità |
| Elaborazioni e risultati | Campione congelato, classifica aggettivi, versione algoritmo, dettaglio punti |
| Gare degli spareggi | Partecipanti, collegamenti del tabellone, risultati e vittorie |
| Audit e notifiche | Operazioni, motivazioni, tentativi di consegna |

Le classifiche devono derivare dai risultati pubblicati. Il totale può essere memorizzato per velocizzare la lettura, ma deve essere sempre ricostruibile.

## 6. Ciclo del turno e correttezza del servizio

Flusso principale: bozza del turno → aperto → concorrenti chiusi → revisione del campione → campione congelato → calcolato → pubblicato.

La chiusura delle giocate e quella del campione sono eventi distinti. Nella finestra intermedia possono arrivare i sondaggisti puri, senza vedere graduatorie provvisorie. Se occorre riaprire il campione prima della pubblicazione, l'operazione è esplicita e genera un nuovo calcolo.

Requisiti tecnici:

1. Salvare gli istanti in UTC e mostrare il calendario con fuso `Europe/Rome`, compresi i cambi fra ora solare e legale.
2. Controllare la scadenza sul server/database, in modo atomico con l'accettazione della giocata. Non basta disabilitare il pulsante nell'app o attendere un processo pianificato.
3. Definire precisamente quando una richiesta diventa accettata: proposta, al controllo della scrittura sul database. L'orario del telefono non è una prova affidabile.
4. Restituire ricevuta con ID, orario server e revisione. Se la risposta di rete si perde, un nuovo tentativo con la stessa chiave restituisce la ricevuta già registrata, anche dopo la scadenza, senza creare una nuova giocata.
5. Gestire invii contemporanei e revisioni da più dispositivi; un invio obsoleto non deve sovrascrivere silenziosamente quello nuovo.
6. Contare nel campione una sola revisione valida per concorrente/sondaggista. Lo storico delle modifiche non moltiplica i voti.
7. Consentire la modifica del booster prima della chiusura; renderne definitivo il consumo sulla giocata valida del turno. Vincoli e transazioni impediscono doppi utilizzi.
8. Congelare insieme dati del campione, normalizzazioni e versione delle regole prima del calcolo.
9. Pubblicare l'intero insieme dei risultati in modo coerente: nessuna classifica metà vecchia e metà nuova.
10. Registrare rettifiche con motivazione, conservando la versione precedente e ricalcolando le classifiche dipendenti. Se cambiano qualificazioni o gare già iniziate serve una procedura amministrativa esplicita.

Il processo pianificato invia promemoria e aggiorna lo stato visibile, ma la validità di un invio dipende sempre dalla verifica server. Un guasto del processo pianificato non deve aprire una proroga involontaria.

### Calcolo dei punti

La tabella definita dal regolamento è: 50, 30, 20, 15, 12, 10, 8, 7, 6, 5 punti per i primi dieci aggettivi; un punto per gli altri validamente inclusi nel campione.

Prima si costruisce la classifica degli aggettivi con la formula ancora da confermare. Solo dopo si applicano questi valori alle giocate: la graduatoria del sondaggio e il punteggio del concorrente sono due calcoli distinti.

Proposta di sequenza, subordinata alle decisioni del paragrafo 3:

- Giocata normale: somma delle cinque parole.
- Jolly: doppio della somma base.
- Estensore: somma delle dieci parole.
- Top: somma base più un ulteriore valore della prima parola comunicata.
- 5su10: selezione delle cinque parole con valore migliore, mantenendo il loro ordine relativo di invio; criterio per i pari punteggio da fissare.
- Dopo il booster: aggiunta dei punti per posizione e dell'eventuale en plein.

Nell'esempio del regolamento la base è 74. Senza booster, «CONTABILE» è nella posizione corretta: il risultato diventa 75. Con Jolly diventa 148 + 1 = 149, se si mantiene quella lista e la classifica dell'esempio. Questo è un caso di collaudo, non risolve le ambiguità delle altre modalità.

### Trattamento delle parole

Normalizzare automaticamente spazi accidentali, maiuscole/minuscole e codifica Unicode, senza eliminare accenti o assimilare grafie diverse. Conservare sempre il testo ricevuto. Non unire sinonimi, superlativi e diminutivi. Le forme troncate e le correzioni di concordanza richiedono mappature controllate, anche specifiche del turno.

Le eccezioni del testo, come VITE e QUALITÀ, impediscono una correzione grammaticale globale affidabile. Un dizionario o un modello linguistico può eventualmente suggerire controlli, ma non deve cambiare automaticamente risultati e parole valide. Il regolamento non autorizza a respingere ogni parola che un dizionario non riconosce come aggettivo.

## 7. Sicurezza, privacy e gestione operativa

- RLS e permessi di database per isolare giocate, campioni e ruoli; controlli server anche per gli endpoint amministrativi.
- Verifica che risposte altrui e risultati provvisori non siano esposti da API, viste, log, notifiche o sottoscrizioni realtime.
- Chiavi pubblicabili nell'app solo dove previste; segreti amministrativi esclusivamente sul server. Le chiavi segrete di Supabase possono bypassare RLS. Fonte: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- MFA per gli amministratori, recupero account e accessi di emergenza documentati.
- HTTPS, memorizzazione sicura delle sessioni sul dispositivo, limite dei tentativi e degli invii abusivi.
- Ambienti sviluppo, collaudo e produzione separati; nel collaudo usare dati fittizi.
- Backup automatici e copia periodica esportabile separata; prova di ripristino prima del pilota e prima della stagione. Obiettivo iniziale da concordare: perdita dati massima 24 ore e ripristino entro una giornata; se inaccettabile serve una strategia più frequente. Conservare anche esportazioni del turno congelato/pubblicato.
- Monitoraggio errori e avvisi all'amministratore su mancati invii, errori del calcolo e processi falliti; escludere le risposte riservate dai log ordinari.
- Procedura per indisponibilità vicino alla scadenza, coerente con l'assenza di proroghe del regolamento; non inventare una deroga tecnica automatica.

Per la privacy occorre identificare il titolare, definire finalità, base giuridica, conservazione, diritti e accordi con i fornitori. Proporrei nickname nelle classifiche, email riservate e una regione UE per il database, verificando separatamente tutti i servizi e gli eventuali trasferimenti: la sola regione UE non rende l'intero sistema automaticamente conforme. Predisporre cancellazione dell'account e politica di anonimizzazione degli storici compatibile con la conservazione necessaria. La minimizzazione va progettata dall'inizio: [Commissione europea, privacy by design](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en).

La dicitura «qualsiasi età» richiede una scelta esplicita sull'accesso dei minori e l'eventuale gestione dei genitori; la soglia e gli obblighi dipendono da paese e base giuridica. Questo punto va verificato per il lancio, senza trattare il consenso come soluzione universale: [Commissione europea, dati dei minori](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data/are-there-any-specific-safeguards-data-about-children_en).

Non sono previsti acquisti, quote o premi monetari nelle assunzioni tecniche. Se si introducono, occorre rivalutare separatamente il perimetro del prodotto e le condizioni applicabili.

## 8. Account, strumenti e distribuzione

Da predisporre a nome del proprietario del progetto:

- Repository Git e accessi di collaborazione.
- Account Supabase e scelta della regione.
- Account Expo/EAS e credenziali di firma protette.
- Apple Developer Program e Google Play Console.
- Dominio, pagina privacy/supporto e servizio di email transazionali.
- Credenziali APNs e FCM per le notifiche.
- Telefono Android e iPhone reali per le prove.
- Ambiente Node.js LTS, package manager, editor, tool Android; Docker/WSL2 se si sceglie Supabase locale.

L'invio email va impostato realmente: il servizio SMTP predefinito di Supabase è per prove e limita destinatari e frequenza. Per inviti e recupero accesso serve un SMTP esterno, con dominio verificato, SPF/DKIM e limiti adeguati ai 100 inviti iniziali. Fonte: [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

Per il pilota: TestFlight con tester esterni su iOS e test chiuso su Google Play per Android. Il limite di 100 tester interni Apple riguarda utenti di App Store Connect, non un normale gruppo di giocatori. TestFlight ammette fino a 10.000 tester esterni; la prima build esterna richiede revisione. Ogni build dura 90 giorni: una stagione di 20 settimane richiede aggiornamenti della beta. Fonti: [TestFlight](https://developer.apple.com/testflight/), [durata delle build](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).

Per gli account personali Google Play creati dopo il 13 novembre 2023, l'accesso alla produzione richiede prima almeno 12 tester iscritti continuativamente al test chiuso per 14 giorni e successiva richiesta di accesso. Non è un divieto di iniziare il pilota nel canale chiuso. Fonte: [requisiti Google Play](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

Per l'uso continuativo, prevedere app sugli store con iscrizione al torneo a invito, valutando la visibilità più adatta. Il fatto che l'app sia scaricabile non concede automaticamente l'accesso al torneo. Preparare schermate, descrizione, classificazione di età, dichiarazioni privacy, contatti di supporto e accesso dimostrativo per la revisione quando necessario.

Le notifiche Expo non hanno costo di invio, ma la consegna al telefono non è garantita: sono un promemoria, non una prova che l'utente abbia ricevuto la scadenza. Fonte: [Expo notifiche](https://docs.expo.dev/push-notifications/faq/).

## 9. Costi indicativi

| Voce | Importo o budget iniziale | Osservazioni |
| --- | --- | --- |
| Supabase per prototipo | Free | Utile per sviluppo; limiti e sospensione per inattività |
| Supabase per torneo reale | Da 25 USD/mese | Pro, primo progetto base; ulteriori progetti/consumi possono aumentare il conto |
| Expo/EAS | Free oppure Starter da 19 USD/mese | Build gratuite limitate; consumi aggiuntivi sul piano a pagamento |
| Hosting pannello, SMTP, monitoraggio | Riserva progettuale 0–30 EUR/mese | Da verificare sul fornitore e sul piano adatto all'uso effettivo |
| Dominio | Riserva progettuale 10–30 EUR/anno | Dipende da estensione e registrar |
| Apple Developer Program | 99 USD/anno o prezzo locale | Account necessario per la distribuzione proposta |
| Google Play Console | 25 USD una tantum | Registrazione sviluppatore |

Budget operativo orientativo: circa 30–90 EUR/mese per una configurazione piccola, oltre a store, dominio e lavoro di sviluppo; non è un preventivo contrattuale e dipende da cambio, IVA, email, build e numero di ambienti paganti. Il dimensionamento ipotizzato non richiede piani costosi, ma un piano gratuito non è una garanzia di continuità. Supabase Free può sospendersi per inattività e non include i backup automatici previsti da Pro.

Fonti dei prezzi: [Supabase](https://supabase.com/pricing), [Expo](https://expo.dev/pricing), [Apple](https://developer.apple.com/help/account/membership/program-enrollment), [Google Play](https://support.google.com/googleplay/android-developer/answer/6112435/).

## 10. Piano di sviluppo

Stima preliminare per uno sviluppatore esperto a tempo pieno, con organizzatore disponibile per chiarimenti e collaudo: 11–15 settimane di lavoro per la prima versione completa, circa 55–75 giornate. Le fasi sotto sommano 11–13 settimane; il limite superiore include fino a due settimane di margine per correzioni emerse dal pilota. Sono stime progettuali, non durate garantite; revisioni store, verifica account e attese decisionali possono allungare il calendario. Se lo sviluppo avviene nel tempo libero va ricalcolato il calendario.

| Fase | Durata stimata | Consegna e condizione di uscita |
| --- | --- | --- |
| 0 — Specifica | 1 settimana | Regolamento operativo versionato, decisioni critiche, esempi di calcolo approvati |
| 1 — Prototipo e impianto | 1 settimana | Schermate essenziali, repository, ambienti, schema dati e primi permessi |
| 2 — Accessi e turni | 2 settimane | Inviti, persone/gruppi, ruoli, serie, calendario e raccolta riservata delle giocate |
| 3 — Motore e booster | 2–3 settimane | Normalizzazione controllata, campione, punteggi, booster, assenti e spareggi di classifica |
| 4 — Pannello e pubblicazione | 2 settimane | Revisione, anteprima, pubblicazione coerente, storico, export, rettifiche e notifiche |
| 5 — Pilota controllato | 2 settimane | Prima 10–15 persone, poi 50–100; turni di prova abbreviati e confronto con calcolo indipendente |
| 6 — Fine stagione e rilascio | 1–2 settimane | Playoff/playout, promozioni, retrocessioni, prove finali e pacchetti per gli store |

L'apertura degli account store e la preparazione privacy partono nelle prime settimane, in parallelo al lavoro tecnico. Nella fase 5 si può svolgere il periodo di test richiesto da Google, se applicabile. Pubblicazione e approvazioni non sono garantite entro queste durate.

La prima beta utilizzabile arriva indicativamente in 6–8 settimane, con regole definite e senza pretendere che l'intera stagione sia già automatizzata. Il pilota completo da 50–100 persone è previsto nella fase 5. Gli spareggi possono arrivare dopo la raccolta dei turni settimanali, ma vanno progettati e simulati in anticipo: non serve attendere 20 settimane per provarli.

La fase 0 va dettagliata così:

1. Confermare la formula attuale del sondaggio con almeno tre dataset di esempio, inclusi pareggi ed extra.
2. Risolvere le contraddizioni del regolamento e registrare le decisioni.
3. Definire accesso dei minori, componenti dei gruppi e poteri dell'amministratore.
4. Produrre schermate di accesso, turno, booster, ricevuta, risultati e revisione amministrativa.
5. Definire criteri di accettazione e backlog ordinato prima di avviare lo sviluppo completo.

### Verifiche necessarie

- Calcoli normali e tutti i booster, con verifica che i bonus posizione arrivino dopo il booster.
- Casi di parità, en plein, troncamenti, eccezioni di concordanza, assenti e tardivi se ammessi.
- Unicità della partecipazione e assenza di voti doppi fra concorrente e sondaggista.
- Impossibilità di leggere risposte altrui, anche chiamando direttamente le API.
- Invii immediatamente prima/dopo la scadenza, cambio d'ora, modifiche concorrenti e rete interrotta dopo il salvataggio.
- Consumo unico del booster, restituzione della ricevuta a un tentativo ripetuto e rifiuto di un nuovo invio tardivo.
- Calcolo ripetuto sullo stesso campione con identico risultato; nessuna duplicazione per riavvio del processo.
- Confronto dei risultati di almeno due turni di prova con un riferimento indipendente concordato con l'organizzatore.
- Prova di 100 invii ravvicinati, con soglie di tempo ed errori stabilite prima del test.
- Ripristino del backup e simulazione di una rettifica che cambia la classifica.
- Simulazione completa della stagione e di tutti gli spareggi con dati fittizi.
- Prove su Android e iPhone reali, notifiche, accessibilità di base e recupero account.

Il criterio di avvio del torneo reale è avere superato le verifiche su calcolo, segretezza, scadenze e ripristino, con formula approvata e senza anomalie critiche aperte.

## 11. Struttura iniziale del repository e manutenzione

Struttura proposta, da creare dopo la specifica:

```text
apps/mobile/           app Expo Android/iOS
apps/admin/            pannello React/Vite
packages/rules/        logica pura, esempi e test dei punteggi
packages/contracts/    tipi e validazione condivisi
supabase/migrations/   schema, vincoli e permessi
supabase/functions/    operazioni applicative server
supabase/tests/        verifiche database e autorizzazioni
docs/                  regolamento operativo e procedure
```

La libreria delle regole deve essere compatibile con l'ambiente delle Edge Functions, senza dipendenze inutili da Node. I vincoli di invio e la validità temporale restano transazionali sul database; la libreria di calcolo non li sostituisce. Le migrazioni consentono di ricreare gli ambienti e revisionare ogni modifica ai permessi.

Dopo il rilascio occorre prevedere un referente per gli aggiornamenti di Expo/React Native e degli SDK richiesti dagli store, controllo dei backup, supporto agli utenti e gestione delle rettifiche. Come riserva iniziale, 1–2 giornate al mese di manutenzione ordinaria, oltre a incidenti o nuove funzionalità, da rivedere dopo il pilota.

Il primo passo concreto è rendere eseguibile e verificabile il regolamento: formula del sondaggio, esempi attesi e scadenze precise. La scelta tecnologica proposta è già adeguata al gruppo iniziale e lascia spazio a successive stagioni senza introdurre infrastruttura sproporzionata.
