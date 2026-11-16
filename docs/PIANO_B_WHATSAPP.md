# Piano B per la raccolta delle giocate

Proposta del 16 novembre 2026. La funzionalità tecnica è prevista nel progetto; i criteri di ammissione e le decisioni sul torneo spettano all'autore del regolamento. Nessuna eccezione alle scadenze viene applicata automaticamente.

## Obiettivo

Permettere la raccolta delle giocate anche quando il portale o il dispositivo del giocatore non raggiungono il servizio. Il canale di emergenza è WhatsApp, già usato dal gruppo, con messaggi privati all'organizzatore. La piattaforma importerà successivamente le giocate che l'organizzatore giudica valide.

La soluzione copre l'indisponibilità del portale se WhatsApp resta raggiungibile. Un blackout totale della connessione del giocatore o un'indisponibilità simultanea dei canali richiede una decisione organizzativa: il software non può attestare un invio mai ricevuto.

## Decisioni da far approvare all'autore

- Chi può attivare il piano B e come comunica che è attivo anche quando il portale non funziona.
- Se è applicabile solo per disservizi generali, anche a problemi individuali o a entrambi.
- Quale scadenza si applica e quale orario nei messaggi viene considerato attendibile. L'orario di composizione sul telefono non è una prova di invio.
- Quali prove conservare e come trattare ritardi di consegna, messaggi modificati, cancellati o inoltrati.
- Come confrontare una giocata già ricevuta dal portale con una successiva o precedente inviata su WhatsApp.
- Come gestire revisioni, sostituzioni autorizzate, disponibilità dei booster e differenze rispetto alle scadenze dei sondaggisti puri.
- Come procedere se l'interruzione dura oltre la data prevista per i risultati. È possibile raccogliere e controllare manualmente il turno, mantenendo un elenco da importare, ma validità e pubblicazione restano decisioni dell'autore.

## Procedura proposta

1. L'organizzatore comunica nel gruppo WhatsApp il canale di emergenza, l'ID del turno e le istruzioni approvate. Non dipende da un pulsante sul portale per attivare il piano mentre questo è irraggiungibile.
2. Il giocatore invia privatamente la giocata completa con identificativo del concorrente o del gruppo, turno, parola, lettera, aggettivi numerati ed eventuale booster esplicito. Per gruppi e coppie vale un solo invio autorizzato.
3. Per una modifica si propone di inviare un nuovo messaggio completo, evitando di modificare il messaggio precedente. È una regola operativa da approvare, utile per preservare la sequenza.
4. L'organizzatore conserva il messaggio originale con l'orario visibile e le eventuali revisioni. Una conferma manuale di ricezione aiuta a risolvere dubbi, senza far dipendere la validità dal momento in cui riesce a rispondere.
5. Quando il servizio torna disponibile, apre una sessione amministrativa di recupero per quel turno e indica motivo e periodo del disservizio.
6. Inserisce le giocate singolarmente oppure prepara un CSV nel formato del portale. Un'area per incollare messaggi può aiutare a estrarre i campi, ma ogni interpretazione incerta richiede conferma e il testo originale viene preservato.
7. L'anteprima mostra candidati, errori, duplicati, corrispondenze dei concorrenti e conflitti con gli invii online. Nessuna giocata esistente viene sovrascritta senza una scelta esplicita e motivata.
8. L'organizzatore approva le giocate di recupero. Il sistema registra la provenienza WhatsApp e verifica integrità, booster e unicità prima di applicarle al campione.
9. Il turno resta in revisione finché non sono state riconciliate le giocate. Calcolo e pubblicazione seguono l'inclusione delle risposte approvate e il congelamento del campione.

## Messaggio da copiare

```text
GIOCO DEGLI AGGETTIVI
Stagione: [identificativo]
Turno: [identificativo]
Concorrente: [codice e nome]
Parola: [parola del turno]
Lettera: [iniziale]
Booster: NESSUNO oppure J / E / T / 5
1. [aggettivo]
2. [aggettivo]
3. [aggettivo]
4. [aggettivo]
5. [aggettivo]
[posizioni 6-10 se previste dal booster]
```

Il pulsante previsto nella PWA è **Copia giocata per WhatsApp**. Una seconda azione può usare la condivisione del dispositivo, se supportata, lasciando all'utente la scelta di WhatsApp e del destinatario. La webapp non invia messaggi automaticamente e non legge le chat. La creazione del messaggio può funzionare offline solo se applicazione e dati del turno erano già stati caricati; in alternativa il formato manuale rimane utilizzabile.

Copiare o condividere il testo non prova che WhatsApp l'abbia consegnato. L'interfaccia non deve mostrare una ricevuta ufficiale dopo questa azione. Le bozze locali possono essere perse cancellando i dati del browser o cambiando dispositivo: il canale di emergenza resta necessario per comunicare la giocata.

## Registrazione e controlli nel portale

Per ogni recupero conservare almeno:

- Stagione, turno, tipo di risposta (concorrente o sondaggista) e identificativo del partecipante.
- Testo originale, parole ordinate, booster e origine `whatsapp`.
- Orario del messaggio dichiarato/verificato dall'organizzatore, con fuso, separato dall'orario effettivo di importazione registrato dal server.
- Identità dell'amministratore che approva, motivazione, riferimento alla prova e versione della politica di emergenza applicata.
- Identificativo dell'importazione e chiave stabile del candidato, per riconoscere un nuovo tentativo dello stesso caricamento.
- Eventuale legame con una giocata precedente sostituita, conservandone lo storico.

Non registrare un import del lunedì come se fosse materialmente arrivato sul portale la domenica. L'ammissione è una decisione amministrativa tracciata, con due orari distinti.

Applicare controlli di numero di parole, ordine, iniziale, duplicati, iscrizione e dotazione dei booster. Le valutazioni linguistiche e le sostituzioni restano nel processo di revisione previsto dall'autore. Le anomalie vanno mostrate; un import non deve scartare righe o scegliere soprannomi simili in silenzio.

Un solo invio efficace per concorrente e turno contribuisce al campione. Importare lo stesso file due volte non deve duplicare voti o consumare due volte il booster. Le scritture sul database devono essere atomiche e protette da vincoli e verifiche lato server; controlli nella sola interfaccia non bastano.

Quando un invio di recupero cambia la scelta di booster o il risultato, verificare anche i turni e le classifiche dipendenti. Per risultati già pubblicati, creare una rettifica con nuova versione; non cambiare silenziosamente il passato. Eventuali effetti su gare già disputate richiedono una decisione dell'autore.

## Protezioni complementari

- Salvataggio delle bozze sul dispositivo e copia della giocata sempre disponibile quando il contenuto del turno è già noto.
- Esportazione amministrativa del registro dei partecipanti, impostazioni del turno e giocate accettate, prima delle scadenze e dopo ogni pubblicazione, con copie conservate fuori da Cloudflare.
- Ripristino D1 Time Travel e prova periodica della procedura. Un backup consente di recuperare dati, ma non rende il portale raggiungibile durante un'interruzione generale del fornitore.
- Limiti, monitoraggio e avvisi per distinguere un errore applicativo, un problema di connessione e il raggiungimento delle quote gratuite.
- Prova completa del piano B prima della stagione: invio online con risposta persa, successivo messaggio WhatsApp, import ripetuto e conflitto sul booster.

Per un gruppo di 50-100 amici si raccomanda questa procedura indipendente e controllata. Un secondo backend su un altro fornitore aggiungerebbe account, sincronizzazione e possibili conflitti; non viene introdotto nella prima fase. Nessuna garanzia di disponibilità assoluta è implicita nella scelta di un unico ambiente.

## Fonti tecniche

- Workers e file dell'applicazione: https://developers.cloudflare.com/workers/static-assets/
- D1 e quote: https://developers.cloudflare.com/d1/platform/pricing/
- Limiti e conservazione Time Travel: https://developers.cloudflare.com/d1/platform/limits/
- Ripristino D1: https://developers.cloudflare.com/d1/reference/time-travel/

Le fonti sono state verificate il 16 novembre 2026. La procedura di ammissione delle giocate rimane una proposta per l'autore.
