# Resoconto DESIGN — primo ciclo

21 novembre 2026. Consegna locale per la sessione Master, relativa a
[INCARICO_DESIGN.md](INCARICO_DESIGN.md).

**Implementazione disponibile; revisione visiva ancora aperta.** Il percorso
turno → aggettivi → booster → riepilogo → conferma DEMO è stato rivisto in
React. Test della logica, verifiche delle interazioni in DOM isolato e build
passano. Non è stato possibile controllare il rendering nel browser automatico.
La fase 2 della roadmap resta aperta.

## Confronto e decisioni

La demo di partenza aveva un titolo molto alto, una tessera della lettera
inclinata, booster sempre aperti e l’azione di riepilogo prima dei booster
nell’ordine mobile. [Proposta 2](design/mobile_turn_proposta_2_confronto.png)
è stata ripresa per compattare l’intestazione mobile, rendere richiudibili i booster
e collocare l’azione dopo la loro consultazione su mobile.

**Scelta confermata dall’utente:** «Preferisco i booster aperti all’avvio».
Lo stato iniziale è quindi aperto a ogni caricamento. La chiusura è opzionale
e non modifica parole, selezione o formato del salvataggio locale.

**Ulteriore scelta confermata dall’utente:** la versione compatta riguarda
solo il mobile (fino a 760 px). Sul desktop sono ripristinati il titolo ampio
su due righe, il contatore del turno, gli spazi originali della scheda e la
tessera gialla inclinata della lettera con la decorazione «Aa». I campi
desktop hanno maggiore altezza; booster richiudibili e nuovo percorso di
riepilogo restano disponibili su entrambi i formati.

**Scelta confermata dall’utente:** a sezione chiusa rimangono visibili le
quattro icone dei booster in una fila orizzontale, con i nomi e un bordo
con segno di spunta sul booster eventualmente selezionato. Questa fila
riassume lo stato; per scegliere o rimuovere un booster si riaprono le opzioni.

Le altre scelte sono implementate come prima proposta da rivedere:

- Solo su mobile: titolo più breve in altezza; parola, lettera, turno 01/20 e scadenza di
  esempio raggruppati nella scheda del turno.
- Solo su mobile: lettera in tessera chiara, non inclinata; stessi font DM Sans/DM Serif Display,
  colori di base e icone esistenti.
- Campi e comandi leggibili, riordino a pulsanti, istruzioni esplicite.
- Azione «Rivedi la giocata»: apre il riepilogo, poi «Conferma la prova DEMO».
- Booster selezionato o assenza di booster sempre dichiarati anche da chiusi;
  pulsante esplicito di rimozione quando le opzioni sono aperte.
- Conferma che mostra parole e booster effettivamente registrati; le modifiche
  successive restano chiaramente una bozza distinta dalla prova precedente.

React Grab: l’utente ha copiato nella chat il contesto
`[<div /> in App (at App.tsx)]`. La prima prova di copia/incolla è quindi
avvenuta; il frammento non distingue l’elemento né fornisce una riga precisa.
Si è proceduto dall’intestazione annunciata nella revisione. Resta da ripetere
una selezione più specifica e verificare il risultato visivo con l’utente.

## File interessati e confini

- [App.tsx](../webapp/src/App.tsx): struttura del turno, apertura booster,
  riepilogo e conferma, focus sugli errori e ritorno al comando di riepilogo,
  annuncio del riordino e focus sul campo spostato.
- [styles.css](../webapp/src/styles.css): blocco finale dedicato al ciclo
  DESIGN, layout responsive, testi e contrasto, focus, finestre scorrevoli;
  alcuni aggiustamenti alla leggibilità della navigazione mobile condivisa.
- [verify_design.mjs](../scripts/verify_design.mjs): verifica ripetibile delle
  interazioni React in Happy DOM con memoria locale isolata.
- [revisioni](design/revisioni/README.md): confronto, anteprime HTML e risultati
  della verifica DOM. Questo resoconto completa la consegna.

Non sono stati modificati `src/lib/game.ts`, punteggi, regole, disponibilità dei
booster, chiave `aggettivi.demo.v1` o formato dei dati. Restano invariati anche
il dialogo di avvertimento quando si torna da dieci a cinque parole e la
conservazione delle parole dalla sesta alla decima nella bozza.

Sono state preservate le modifiche locali preesistenti a `.gitignore`, README,
piano, materiale FigCraft, dipendenze e `src/main.tsx`, inclusa React Grab.
I file FigCraft originali non sono stati toccati. Nessun commit, ripristino,
pubblicazione o attivazione di servizi online.
Nel controllo finale è comparso anche `webapp/wrangler.demo.jsonc`, assente
dal controllo iniziale: non è stato creato né modificato dalla sessione DESIGN.

## Anteprime e avvio

Demo locale avviata su **http://127.0.0.1:5173/**, risposta HTTP 200 verificata.
Se il processo è terminato, dalla cartella `webapp` eseguire `npm run dev`.
Per React Grab usare questa versione di sviluppo, puntare un elemento,
premere Ctrl+C e incollare il contesto nella sessione DESIGN.

Aprire [confronto.html](design/revisioni/confronto.html) nel browser per
affiancare prima e dopo e scegliere larghezze di 360, 390 o 1440 px.
Sono inclusi turno iniziale con booster aperti, booster chiusi, cinque e dieci
aggettivi, riepilogo e conferma. Sono HTML statici generati dai componenti,
non screenshot né versioni interattive della demo.

La vista «prima» usa App e CSS dal commit
`ad3d1802278337db115cb64605b10d0553272784`, identici a questi due file
all’avvio dell’incarico. Le finestre statiche non riproducono il comportamento
modale nativo: quello va verificato nella demo. Gli screenshot prima/dopo
richiesti dall’incarico non sono stati acquisiti.

## Verifiche e limiti

| Verifica | Esito |
| --- | --- |
| `npm test` | 5 test superati |
| `npm run build` | TypeScript, Vite e generazione PWA completati |
| Script DOM | 21 verifiche superate, [risultati](design/revisioni/verifiche-dom.json) |
| `git diff --check` | Nessun errore; soli avvisi Git sulle terminazioni di riga Windows |
| HTTP di sviluppo | 200 |
| Contrasto dei testi principali rivisti | Calcolo sui colori CSS: sette coppie tra 4,79:1 e 9,55:1 |
| Rendering a 360/390/1440 px, overflow e sovrapposizioni | Da verificare nel browser |
| Zoom/testo al 200%, tastiera, screen reader e comportamento modale nativo | Da verificare nel browser |
| Telefono reale, tastiera virtuale, menu e navigazione fissa | Da verificare su dispositivo |

Le prove DOM coprono avvio aperto dei booster, scelta dei quattro booster,
chiusura/riapertura senza perdita delle dieci parole, riordino e focus,
completezza, iniziale errata, duplicati e locuzioni, riepilogo e conferma con
cinque e dieci parole, conservazione della conferma precedente quando cambia
la bozza, annullamento e accettazione della rimozione di un booster da dieci
parole. La memoria del browser dell’utente non è stata utilizzata.

Happy DOM 21.0.4 è stato installato in una cartella temporanea esterna al
progetto. Nessuna dipendenza aggiunta a `webapp/package.json` o al lockfile.
Il suo motore non calcola il layout né simula il comportamento nativo di
tastiera e dialoghi: le prove non sostituiscono il browser.

Il browser automatico ha segnalato `The browser access host is unavailable`.
Il tentativo della prima parte della sessione tramite la finestra Chrome era
stato fermato perché non poteva verificare con sicurezza l’URL corrente.
Non sono state aggirate queste limitazioni.

## Ritorno alla Master e prossimo passo

La parte React del primo ciclo è disponibile per revisione. Non segnare come
completate le voci aggregate della fase 2: confronto approvato, percorsi
completi e verifica di accessibilità/dispositivi richiedono ancora lavoro.
Sono confermati i booster aperti e la versione compatta riservata al mobile; i restanti dettagli
grafici e i nuovi testi dei comandi attendono riscontro.

Prossimo intervento: fare la revisione visiva nella demo, completare una
selezione mirata con React Grab e salvare screenshot mobile/desktop dopo
aver verificato overflow, zoom, menu, tastiera e finestre con dieci parole.
Poi consolidare con la Master le scelte approvate nella roadmap.

Non sono emerse nuove decisioni di regolamento necessarie a questo ciclo.
Restano da confermare dall’autore i testi definitivi e le regole operative
già elencate nella roadmap; i valori mostrati continuano a essere dimostrativi.
