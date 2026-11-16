# Disegnare l’interfaccia con FigCraft

Questa cartella contiene la base modificabile del Gioco degli Aggettivi per
[FigCraft di ArtCraft](https://getartcraft.com/apps/figcraft).
Il file è stato generato e riaperto con il motore ufficiale FigCraft 0.18.1.
Le anteprime PNG sono state controllate visivamente. L’apertura nell’app grafica
su questo PC non è stata verificata.

## Inizia da qui

1. Installa FigCraft dal sito ufficiale, oppure scarica la versione Windows
   **Portable (64-bit)** e decomprimi l’archivio. Non serve l’MCP per disegnare.
2. Per avere gli stessi caratteri delle anteprime, installa i file `.ttf` della
   cartella `fonts`: selezionali in Esplora file e scegli **Installa**, eventualmente
   dal menu **Mostra altre opzioni**. Se FigCraft è già aperto, riaprilo dopo
   l’installazione. I font sono DM Sans e DM Serif Display, con licenze OFL incluse.
   Senza questi font l’editor può mostrarne altri e cambiare le misure dei testi.
3. In FigCraft apri `Gioco_degli_Aggettivi.figcraft` con **File → Open**.
4. Nell’elenco dei livelli seleziona una schermata. **Shift+2** ingrandisce la
   selezione. Il tasto **T** attiva lo strumento testo; il doppio clic su un testo
   permette di modificarlo. Duplica la schermata prima di sperimentare.
5. Salva la tua variante con un nome diverso, per esempio
   `Gioco_degli_Aggettivi_proposta_Alessio.figcraft`.

## Cosa contiene

| Tavola | Uso |
| --- | --- |
| 01 · Mobile / il mio turno | Pagina completa larga 390 px, più alta dello schermo del telefono per mostrare tutti i contenuti |
| 02 · Mobile / classifica | Classifica di esempio, 390 × 844 px |
| 03 · Mobile / riepilogo | Controllo della giocata, 390 × 844 px |
| 04 · Desktop / il mio turno | Versione ampia, 1440 × 1120 px |
| 05 · Kit grafico | Colori, tipografia, pulsanti e quattro booster |

I testi sono testo reale e le forme sono livelli separati. Il documento contiene
sette componenti principali, con istanze per pulsanti e booster, e dodici variabili
di colore. I pulsanti e il filtro serie usano auto layout. Le schermate hanno un
layout esplicito: la modifica del desktop non ridisegna automaticamente il mobile.

Per cambiare il tema, modifica le variabili della collezione **Tema Aggettivi**:
`paper` è il fondo, `ink` il testo, `green` i pulsanti, `orange` l’accento.
Questi colori sono collegati ai livelli. Le etichette con i codici esadecimali
nel kit sono invece testo illustrativo: se cambi un colore, aggiorna anche quelle.

Per cambiare tutti i pulsanti di invio insieme, modifica il componente principale
**Pulsante / Prova la giocata** nel kit. Le sue istanze seguono la modifica.
Per una modifica limitata a una sola schermata, modifica l’istanza.

## Dal disegno alla webapp

Il file è un progetto grafico statico: i campi non raccolgono giocate e i pulsanti
non inviano nulla. Le schermate non hanno collegamenti di navigazione configurati.
La webapp React già realizzata resta il prototipo funzionante separato.

Quando hai una proposta, salva il file `.figcraft` in questa cartella e indica
le schermate da usare. Si possono esportare anche PNG o SVG come riferimento.
Posso poi riportare il disegno in React e CSS, verificando le diverse larghezze
dei telefoni. Il salvataggio in FigCraft non modifica automaticamente il codice.
Le regole e i testi sul punteggio restano soggetti alla conferma dell’autore.

Gli SVG inclusi sono un’alternativa per importare singole tavole: mantengono testi
e forme, ma non conservano tutti i collegamenti alle variabili e ai componenti
del documento nativo. I PNG servono solo come anteprime.

## MCP ufficiale: disponibile, opzionale

FigCraft comprende un server MCP ufficiale nella CLI, avviato con
`figcraft-cli mcp`. La modalità **headless** lavora senza finestra; quella
**attached** modifica il documento nell’app aperta, così puoi vedere il lavoro.
È documentato dal [progetto ufficiale](https://github.com/storytold/figcraft/blob/v0.18.1/docs/mcp.md).
La versione Portable Windows 0.18.1 contiene sia `figcraft.exe` sia
`figcraft-cli.exe`. Nessun MCP FigCraft è stato configurato in Codex durante
questa preparazione e non risultava un plugin FigCraft nel catalogo consultato.

Per configurare l’MCP in Codex usa i percorsi reali degli eseguibili. Questi sono
esempi: `C:\Strumenti\FigCraft` va sostituito con la cartella scelta da te.

Senza finestra, da un terminale in cui è disponibile il comando `codex`:

```powershell
codex mcp add figcraft -- 'C:\Strumenti\FigCraft\figcraft-cli.exe' mcp
```

Oppure, per lavorare insieme nel documento visibile, avvia FigCraft da PowerShell:

```powershell
& 'C:\Strumenti\FigCraft\figcraft.exe' --control 7979
```

Apri il file del gioco nell’app, poi registra questa modalità **al posto** della
precedente (con un nome diverso se vuoi mantenere entrambe):

```powershell
codex mcp add figcraft-live -- 'C:\Strumenti\FigCraft\figcraft-cli.exe' mcp --attach 7979
```

Codex documenta la configurazione da **Settings → MCP** e con `codex mcp add`
nella [guida MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=app).
Un esempio di configurazione TOML è incluso in `codex-mcp.example.toml`;
non è una configurazione attivata. La verifica del collegamento in Codex
si fa dopo averlo aggiunto e aver aggiornato la sessione.

Un primo incarico utile per l’agente collegato:

> Apri il file Gioco_degli_Aggettivi.figcraft. Duplica la schermata mobile del
> turno e chiamala Proposta 2. Mantieni i testi e le regole del gioco. Prova una
> variante con intestazione più compatta e booster richiudibili, disegnandone
> entrambi gli stati. Conserva l’originale e mostra un’anteprima PNG.

## Rigenerare la base (per sviluppo)

Dalla radice del repository, con Python e la CLI ufficiale:

```powershell
python scripts/create_figcraft_template.py --cli 'C:\Strumenti\FigCraft\figcraft-cli.exe'
```

Il generatore legge i font della webapp, ricrea il file nativo e le anteprime di
questa cartella. Sovrascrive la base generata: salva le tue varianti con un altro
nome. Il generatore non installa font né modifica le impostazioni MCP o la webapp.

Riferimenti verificati il 16 novembre 2026:
[download ufficiali](https://getartcraft.com/apps/figcraft),
[CLI 0.18.1](https://github.com/storytold/figcraft/blob/v0.18.1/docs/cli.md),
[MCP 0.18.1](https://github.com/storytold/figcraft/blob/v0.18.1/docs/mcp.md).
