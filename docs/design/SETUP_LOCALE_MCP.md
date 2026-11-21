# MCP FigCraft: configurazione locale del progetto

Configurato il 17 novembre 2026 per lavorare insieme nell’editor visibile.
La versione portable ufficiale 0.18.1 si trova in `.tools/figcraft/0.18.1/`.
Questa cartella contiene gli eseguibili e le licenze originali ed è esclusa da Git.
Non è un’installazione di Windows e non richiede un account.

## Utilizzo

1. Avvia FigCraft da PowerShell nella cartella del progetto:

   ```powershell
   .\scripts\start_figcraft.ps1
   ```

   Lo script apre il template del gioco e abilita il controllo locale sulla porta
   **7979**. Carica anche i font del progetto nella sessione, senza installarli in
   Windows. Se FigCraft è già in ascolto, riutilizza l’app e non cambia il documento
   selezionato. Per salvare una proposta conserva il template e usa **Save as**.

2. Dopo la prima configurazione riavvia Codex, oppure usa il comando di riavvio
   del server disponibile nelle impostazioni MCP. La registrazione del server è
   già presente: non occorre aggiungerne un secondo.
3. In questo progetto verifica che l’elenco MCP mostri **figcraft**. Puoi chiedere:

   > Usa l’MCP FigCraft per leggere le schermate del documento aperto. Prima di
   > modificarle, duplica la schermata del turno e lavora sulla copia.

Lascia FigCraft aperto mentre lavori con l’MCP. Se lo chiudi, riavvialo con lo
script prima di riprendere. Non serve avviare il server Vite della webapp.

Per aprire una variante già salvata:

```powershell
.\scripts\start_figcraft.ps1 -Document '.\docs\design\La_mia_proposta.figcraft'
```

Se l’app è già aperta con il controllo attivo, scegli il file direttamente
nell’editor. Lo script non chiude né riapre documenti con modifiche in corso.

## Configurazione

Il file locale `.codex/config.toml` registra:

```toml
[mcp_servers.figcraft]
command = 'D:\2026\GiocoDegliAggettivi26\.tools\figcraft\0.18.1\figcraft-cli.exe'
args = ['mcp', '--attach', '7979']
startup_timeout_sec = 20
tool_timeout_sec = 120
```

La configurazione riguarda questo progetto e resta fuori da Git perché contiene
un percorso specifico del PC. Le impostazioni globali di Codex non sono state
modificate. Su un altro PC occorre scaricare la portable dal
[sito ufficiale](https://getartcraft.com/apps/figcraft), estrarre i contenuti nella
cartella prevista e adattare il percorso nel file locale. Il progetto deve essere
considerato attendibile da Codex per caricare una configurazione di progetto.

La modalità `--attach` usa il canale dell’app in ascolto soltanto su
`127.0.0.1`: non apre un servizio sulla rete Wi-Fi. L’MCP permette di leggere e
modificare il documento grafico; non sincronizza automaticamente il disegno con
il frontend React e non distribuisce la webapp.

## Verifica eseguita

- Codex CLI riconosce il server `figcraft` come abilitato per il progetto.
- L’inizializzazione MCP e l’elenco dei 19 strumenti rispondono.
- L’MCP legge il documento aperto con le cinque tavole e le dodici variabili.
- I due font del progetto risultano disponibili nella sessione dell’editor.

Il test di protocollo non ricarica gli strumenti già assegnati a una chat Codex:
il riavvio/ricaricamento serve a renderli disponibili anche nell’assistente.

Riferimenti:
[MCP ufficiale FigCraft](https://github.com/storytold/figcraft/blob/v0.18.1/docs/mcp.md),
[canale di controllo](https://github.com/storytold/figcraft/blob/v0.18.1/docs/control-protocol.md),
[configurazione MCP in Codex](https://learn.chatgpt.com/docs/extend/mcp?surface=app).
