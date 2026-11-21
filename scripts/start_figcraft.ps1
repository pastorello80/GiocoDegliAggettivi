param(
    [string]$Document = '',
    [int]$Port = 7979
)

$ErrorActionPreference = 'Stop'
$taskProjectRoot = Split-Path -Parent $PSScriptRoot
$taskFigcraftExe = Join-Path $taskProjectRoot '.tools/figcraft/0.18.1/figcraft.exe'

function Import-ProjectFonts {
    # Protocollo ufficiale locale: docs/control-protocol.md di FigCraft 0.18.1.
    # I font restano nella sessione dell'editor, senza installazione in Windows.
    $taskClient = [System.Net.Sockets.TcpClient]::new()
    $taskReader = $null
    $taskWriter = $null
    try {
        $taskClient.Connect('127.0.0.1', $Port)
        $taskStream = $taskClient.GetStream()
        $taskStream.ReadTimeout = 5000
        $taskStream.WriteTimeout = 5000
        $taskEncoding = [System.Text.UTF8Encoding]::new($false)
        $taskReader = [System.IO.StreamReader]::new($taskStream, $taskEncoding, $false, 1024, $true)
        $taskWriter = [System.IO.StreamWriter]::new($taskStream, $taskEncoding, 1024, $true)
        $taskWriter.AutoFlush = $true
        $taskFonts = @(Get-ChildItem -LiteralPath (Join-Path $taskProjectRoot 'docs/design/fonts') -Filter '*.ttf' -File)
        $taskRequestId = 0
        foreach ($taskFont in $taskFonts) {
            $taskRequestId++
            $taskRequest = @{
                id = $taskRequestId
                method = 'engine.execute'
                params = @{ command = 'text.loadFont'; params = @{ path = $taskFont.FullName } }
            }
            $taskWriter.WriteLine(($taskRequest | ConvertTo-Json -Depth 8 -Compress))
            $taskReplyLine = $taskReader.ReadLine()
            if (-not $taskReplyLine) { throw 'Il canale di controllo FigCraft si è chiuso.' }
            $taskReply = $taskReplyLine | ConvertFrom-Json
            if (-not $taskReply.ok) { throw "Caricamento font fallito: $($taskReply.error)" }
        }
        Write-Output "Font del progetto caricati nella sessione: $($taskFonts.Count)."
    } finally {
        if ($taskWriter) { $taskWriter.Dispose() }
        if ($taskReader) { $taskReader.Dispose() }
        $taskClient.Dispose()
    }
}

if (-not (Test-Path -LiteralPath $taskFigcraftExe)) {
    throw "FigCraft portable non trovato: $taskFigcraftExe. Vedi docs/design/SETUP_LOCALE_MCP.md."
}
if (-not $Document) {
    $Document = Join-Path $taskProjectRoot 'docs/design/Gioco_degli_Aggettivi.figcraft'
}
$taskDocumentPath = (Resolve-Path -LiteralPath $Document).Path
$taskListener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($taskListener) {
    $taskProcess = Get-Process -Id $taskListener[0].OwningProcess
    if ($taskProcess.ProcessName -ne 'figcraft') {
        throw "La porta $Port è occupata da un altro programma."
    }
    Write-Output "FigCraft è già in ascolto sulla porta $Port. Puoi selezionare il documento nell'app."
    Import-ProjectFonts
    exit 0
}

# La finestra è visibile perché è l'editor con cui l'utente lavora.
$taskArguments = @('--control', "$Port", ('"' + $taskDocumentPath + '"'))
$taskProcess = Start-Process -FilePath $taskFigcraftExe -ArgumentList $taskArguments -PassThru
$taskDeadline = (Get-Date).AddSeconds(20)
do {
    if ($taskProcess.HasExited) { throw "FigCraft si è chiuso durante l'avvio." }
    $taskListener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($taskListener) {
        if ($taskListener[0].OwningProcess -ne $taskProcess.Id) {
            throw "La porta $Port è stata occupata da un altro processo durante l'avvio."
        }
        Write-Output "FigCraft pronto. Controllo MCP locale sulla porta $Port."
        Write-Output "Documento: $taskDocumentPath"
        Import-ProjectFonts
        exit 0
    }
    Start-Sleep -Milliseconds 250
} while ((Get-Date) -lt $taskDeadline)
throw 'FigCraft non ha aperto il canale di controllo entro 20 secondi.'
