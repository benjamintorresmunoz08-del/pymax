# Inyecta preloader anti-flash en todas las plantillas Essential.
# IDEMPOTENTE: si el archivo ya tiene #pymax-preloader, se omite.
# Uso:  powershell -File tools\inject_preloader.ps1 [-TargetDir <ruta>] [-IncludeAll]
param(
  [string]$TargetDir = '',
  [switch]$IncludeAll
)
$ErrorActionPreference = 'Stop'

if ($TargetDir -eq '') { $TargetDir = Join-Path $PSScriptRoot '..\templates\empresa\essential' }

$files = Get-ChildItem -Path $TargetDir -Filter '*.html'
if (-not $IncludeAll) {
  $files = $files | Where-Object { $_.Name -ne 'panel-essential.html' -and $_.Name -ne 'deudas.html' }
}

$criticalCSS = @'
    <style id="pmx-anti-flash">
      html,body{background:#020617!important}
      #pymax-preloader{position:fixed;inset:0;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:radial-gradient(1200px 600px at 50% 40%,#0b1020 0%,#060a14 60%,#020617 100%);overflow:hidden}
      #pymax-preloader::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(148,163,184,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.04) 1px,transparent 1px);background-size:44px 44px;pointer-events:none}
      #pymax-preloader .pm-logos{display:flex;align-items:baseline;gap:8px;z-index:1;letter-spacing:-.05em}
      #pymax-preloader .pm-lo{font-size:44px;font-weight:800;color:#fff;background:linear-gradient(90deg,#fff,#93C5FD);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
      #pymax-preloader .pm-mx{font-size:42px;font-weight:800;color:#fff;letter-spacing:.02em;opacity:.95}
      #pymax-preloader .pm-nm{position:relative;z-index:1;font-size:11px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:rgba(147,197,253,.55);margin-top:-8px}
      #pymax-preloader .pm-bar{position:relative;z-index:1;width:230px;height:4px;background:rgba(148,163,184,.12);border-radius:100px;overflow:hidden}
      #pymax-preloader .pm-bar-fill{height:100%;width:0;border-radius:100px;background:linear-gradient(90deg,#3B82F6,#8B5CF6,#06B6D4);background-size:200% 100%;animation:pmFill 1.5s ease-in-out infinite,pmHue 2.4s linear infinite}
      #pymax-preloader .pm-txt{position:relative;z-index:1;font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(148,163,184,.55)}
      #pymax-preloader.pm-done{opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s}
      @keyframes pmFill{0%{width:8%}55%{width:78%}100%{width:96%}}
      @keyframes pmHue{to{background-position:-200% 0}}
    </style>
'@

$preloaderHTML = @'
    <style id="pmx-anti-flash-inline">html,body{background:#020617!important}body{transition:background .4s ease}</style>
    <div id="pymax-preloader">
      <div class="pm-logos"><span class="pm-lo">Py</span><span class="pm-mx">max</span></div>
      <div class="pm-nm">Quantum ERP</div>
      <div class="pm-bar"><div class="pm-bar-fill"></div></div>
      <div class="pm-txt">Cargando tu espacio seguro</div>
    </div>
'@

$hideScript = @'
    <script>
      (function(){
        function hidePre(){var p=document.getElementById('pymax-preloader');if(p)p.classList.add('pm-done');}
        function onReady(){hidePre();setTimeout(hidePre,400);}
        if(document.readyState==='complete'){hidePre();}
        else{window.addEventListener('load',onReady);}
        setTimeout(hidePre,3500);
      })();
    </script>
'@

$processed = 0
$skipped = 0
$errored = @()

foreach ($f in $files) {
  try {
    $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)

    if (-not ($text -match '<body')) { $skipped++; continue }
    if ($text.Contains('id="pymax-preloader"')) { $skipped++; continue }
    if (-not ($text -match '</head>')) { $errored += $f.Name + ' [sin </head>]'; continue }

    # 1) CSS critico en <head>
    $text = $text -replace '</head>', ($criticalCSS + "`n</head>")

    # 2) Preloader despues de <body ...>
    $bodyOpen = [regex]::Match($text, '(?is)<body[^>]*>')
    if (-not $bodyOpen.Success) { $errored += $f.Name + ' [sin <body>]'; continue }
    $idx = $bodyOpen.Index + $bodyOpen.Length
    $text = $text.Substring(0, $idx) + $preloaderHTML + $text.Substring($idx)

    # 3) Script de ocultado antes de </body>
    if ($text -match '</body>') {
      $text = $text -replace '</body>', ($hideScript + "`n</body>")
    }

    [System.IO.File]::WriteAllText($f.FullName, $text, (New-Object System.Text.UTF8Encoding($false)))
    $processed++
  } catch {
    $errored += $f.Name + ' [' + $_.Exception.Message + ']'
  }
}

Write-Output ("Procesados: " + $processed)
Write-Output ("Omitidos: " + $skipped)
if ($errored.Count) { Write-Output "ERRORES:"; $errored | ForEach-Object { Write-Output "  $_" } }
else { Write-Output "Sin errores." }
