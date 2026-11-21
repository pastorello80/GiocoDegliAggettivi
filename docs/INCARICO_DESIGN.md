# Incarico per la sessione DESIGN

Preparato dalla sessione Master il **21 novembre 2026**.
Stato: pronto da assegnare; lavoro della sessione DESIGN da avviare.

Realizzare il primo ciclo di revisione dell'interfaccia del Gioco degli
Aggettivi: rendere più chiaro e compatto il percorso **turno → inserimento
aggettivi → booster → riepilogo → conferma dimostrativa**, partendo dalla
Proposta 2. La consegna deve essere utilizzabile nella webapp React locale.

## Contesto e riferimenti

La sessione Master mantiene priorità, decisioni generali e coordinamento.
La sessione DESIGN cura le scelte dell'interfaccia e la loro realizzazione.
Le regole del gioco spettano al loro autore.

Il progetto si trova in `D:\2026\GiocoDegliAggettivi26`.
È una PWA React/TypeScript con dati dimostrativi. La bozza e la conferma
restano sul dispositivo: accessi, backend e ricevute ufficiali devono ancora
essere implementati. Workers/D1 è l'infrastruttura scelta per le fasi successive.

Leggere prima di intervenire:

- [Roadmap](ROADMAP.md), soprattutto fase 2 e prossimo lavoro.
- [Guida del frontend](../webapp/README.md), inclusi React Grab e limiti della demo.
- [Materiale FigCraft](design/README.md) e, se necessario,
  [configurazione locale](design/SETUP_LOCALE_MCP.md).
- [Componente attuale](../webapp/src/App.tsx) e
  [stili](../webapp/src/styles.css).

Riferimenti grafici da confrontare con il frontend:

- [Proposta 2 modificabile](design/Gioco_degli_Aggettivi_Proposta_2.figcraft).
- [Confronto degli stati](design/mobile_turn_proposta_2_confronto.png).
- [Booster aperti](design/mobile_turn_proposta_2_aperti.png) e
  [booster chiusi](design/mobile_turn_proposta_2_chiusi.png).

La Proposta 2 è un punto di partenza da valutare con l'utente. Il file FigCraft
e il frontend sono separati: salvare il disegno non aggiorna React.

## Primo ciclo di lavoro

1. Esaminare `git status` e le modifiche già presenti, quindi avviare
   l'anteprima dalla cartella `webapp` con `npm run dev`. Se mancano le
   dipendenze, usare `npm ci`.
2. Confrontare il turno attuale e la Proposta 2; mostrare all'utente il punto
   di partenza e indicare la prima modifica concreta. Provare React Grab
   con un elemento scelto dall'utente, seguendo la guida del frontend.
   Se lo strumento non è disponibile, proseguire sui componenti individuati
   nel codice e riportare la prova come ancora da completare.
3. Realizzare in React e CSS un'intestazione più compatta, mantenendo evidenti
   parola, iniziale, turno e scadenza dimostrativa. Conservare leggibilità e
   spazio utile per gli aggettivi.
4. Rendere richiudibile la sezione dei booster. Anche da chiusa deve essere
   chiaro quale booster è selezionato, oppure che non ne è selezionato nessuno.
   Aprire e chiudere la sezione deve conservare selezione e parole inserite.
5. Curare il percorso con cinque e dieci aggettivi, il riordino e gli errori
   già gestiti dalla demo. Rendere facile trovare l'azione che apre il
   riepilogo, anche dopo aver consultato i booster.
6. Allineare riepilogo e conferma dimostrativa alle scelte grafiche del turno.
   Rendere comprensibile la differenza fra bozza, conferma DEMO e modifiche
   successive. Conservare le avvertenze che spiegano il salvataggio locale.
7. Verificare il risultato su mobile e desktop, raccogliere il riscontro
   dell'utente e consegnare alla Master il riepilogo del lavoro.

Per le scelte ordinarie di spaziatura, componenti e adattamento procedere
autonomamente e mostrare il risultato nell'anteprima. Annotare le proposte
che cambiano i percorsi generali o dipendono dal regolamento, continuando
le parti indipendenti.

## Confini e coordinamento

- Conservare l'identità grafica esistente come base: colori, DM Sans,
  DM Serif Display e icone già disponibili.
- Mantenere invariati logica dei punteggi, regole, disponibilità dei booster
  e formato dei dati locali. Segnalare alla Master eventuali problemi emersi.
- Lavorare principalmente su `webapp/src/App.tsx`, `webapp/src/styles.css`
  ed eventuali componenti estratti per questa revisione. Evitare modifiche
  alle dipendenze salvo una necessità concreta da spiegare nella consegna.
- Preservare le modifiche locali preesistenti, compresa l'integrazione di
  React Grab. Non ripristinare o includere in commit modifiche estranee.
  Indicare alla Master quali file si stanno modificando per evitare
  sovrapposizioni con altre sessioni.
- Preservare i file FigCraft originali; salvare eventuali varianti separatamente.
- Tenere in questo ciclo il turno e le finestre di riepilogo e conferma.
  Accesso, sondaggisti, risultati, amministrazione e preferenze delle
  notifiche restano attività successive della fase 2.
- La consegna avviene in locale. Pubblicazione e attivazione dei servizi
  online non fanno parte di questo incarico.

## Criteri di consegna

- Il percorso completo della demo funziona con cinque e dieci aggettivi,
  scelta e rimozione del booster, riordino, errori, riepilogo e conferma.
- La sezione richiudibile mantiene visibili la scelta corrente e un comando
  comprensibile per riaprirla; apertura e chiusura funzionano da tastiera
  e comunicano il proprio stato alle tecnologie assistive.
- A larghezze indicative di 360, 390 e 1440 px non compaiono scorrimenti
  orizzontali o sovrapposizioni. Menu, finestre e navigazione non coprono
  i comandi principali.
- Focus, etichette, contrasto e testo ingrandito restano utilizzabili.
  Il riordino è possibile con i pulsanti, senza trascinamento obbligatorio.
- `npm test` e `npm run build` terminano correttamente. Eventuali verifiche
  non eseguite sono indicate nella consegna; le prove in una finestra ridotta
  non sostituiscono il collaudo su telefono reale.
- Sono disponibili anteprime prima e dopo, preferibilmente salvate in
  `docs/design/revisioni/`, con almeno una vista mobile e una desktop.

Il primo ciclo può essere consegnato anche se il riscontro dell'utente o
la prova di React Grab sono ancora pendenti, specificando cosa resta da
verificare. La fase 2 della roadmap resta aperta finché non sono completi
anche gli altri percorsi previsti.

## Ritorno alla sessione Master

Al termine salvare un resoconto in `docs/RESOCONTO_DESIGN.md`, con:

- modifiche realizzate e file interessati;
- scelte discusse con l'utente, distinguendo quelle confermate dalle proposte;
- collegamenti alle anteprime e istruzioni per aprire la demo;
- verifiche eseguite ed eventuali problemi residui;
- domande per la Master o per l'autore del regolamento;
- prossimo intervento consigliato e punti della roadmap effettivamente completati.

La Master consoliderà il resoconto nella roadmap. L'assegnazione dell'incarico
non costituisce completamento delle attività.

## Messaggio per avviare la sessione

> Questa è la sessione DESIGN del Gioco degli Aggettivi. Leggi
> `docs/INCARICO_DESIGN.md` e svolgi il primo ciclo descritto, preservando le
> modifiche locali già presenti. Parti dal confronto fra la demo e la
> Proposta 2, avvia l'anteprima e accompagnami nella prima revisione con
> React Grab. Realizza le modifiche concordate nel frontend, verifica il
> risultato e lascia il resoconto per la sessione Master.
