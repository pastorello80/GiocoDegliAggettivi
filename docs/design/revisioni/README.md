# Anteprime del primo ciclo DESIGN

21 novembre 2026. Aprire [confronto.html](confronto.html) in un browser per
scegliere mobile 360/390 px o desktop 1440 px e confrontare prima e dopo.

Queste anteprime sono **HTML statici generati dal DOM React**, non screenshot.
Non raccolgono parole e non eseguono i comandi della demo. Le viste delle
finestre non riproducono il comportamento modale nativo. Nessuna di queste
anteprime costituisce una verifica del rendering.

- [Prima: turno originale](prima-turno.html).
- [Dopo: booster aperti all’avvio](dopo-turno-booster-aperti.html), preferenza
  confermata dall’utente.
- [Dopo: booster chiusi](dopo-turno-booster-chiusi.html).
- [Dopo: quattro icone ed Estensore selezionato](dopo-turno-dieci-chiusi.html).
- [Dopo: cinque aggettivi](dopo-turno-cinque-compilati.html).
- [Dopo: dieci aggettivi e 5su10](dopo-turno-dieci-aperti.html).
- [Dopo: riepilogo di dieci aggettivi](dopo-riepilogo-dieci.html).
- [Dopo: conferma DEMO di dieci aggettivi](dopo-conferma-dieci.html).
- [Risultati delle verifiche DOM](verifiche-dom.json).

Per provare le interazioni usare http://127.0.0.1:5173/ dopo aver eseguito
`npm run dev` dalla cartella `webapp`. Le pagine statiche usano i font e
l’icona del repository tramite percorsi relativi: conservarne la posizione.

## Ripetere la verifica DOM

Dalla radice del progetto, in PowerShell:

```powershell
$designQaPath = Join-Path $env:TEMP 'aggettivi-design-qa-20261121'
npm install --prefix $designQaPath --no-audit --no-fund --no-save --package-lock=false happy-dom@21.0.4
node scripts/verify_design.mjs $designQaPath
```

Richiede le dipendenze della webapp già installate. La dipendenza di verifica
resta esterna alla webapp. Lo script rigenera le anteprime e il JSON in questa
cartella e conserva una copia temporanea della base in
`webapp/.sites-runtime/design-baseline/`, ignorata da Git. La base fissata è
il commit `ad3d1802278337db115cb64605b10d0553272784`; un eventuale terzo argomento
allo script permette di indicare un’altra revisione Git.

Per stato, scelte confermate e verifiche ancora da eseguire, vedere il
[resoconto per la Master](../../RESOCONTO_DESIGN.md).
