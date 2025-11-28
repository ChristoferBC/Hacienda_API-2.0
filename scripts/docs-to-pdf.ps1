<#
  PowerShell convenience script to convert all docs to PDF.
  - First tries `pandoc` if available
  - Otherwise uses `npm run docs:pdf` which in turn runs the Node converter
#>

param (
  [string] $DocsPath = "docs"
)

function Has-Command($cmd) {
  try { Get-Command $cmd -ErrorAction Stop | Out-Null; return $true } catch { return $false }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

if (Has-Command 'pandoc') {
  Write-Host "pandoc found. Rendering with pandoc..."
  $mdFiles = Get-ChildItem -Path $DocsPath -Recurse -Include *.md | Where-Object { $_.FullName -notmatch '\\pdfs\\' }
  foreach ($file in $mdFiles) {
    $relative = $file.FullName.Substring((Get-Location).Path.Length + 1)
    $outDir = Join-Path $DocsPath 'pdfs' -Resolve
    if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
    $outFile = Join-Path $outDir ($file.Name -replace '\.md$','.pdf')
    Write-Host "Converting $($file.FullName) -> $outFile"
    pandoc $file.FullName -o $outFile
  }
  Write-Host "Done. PDFs are in $DocsPath\pdfs"
} else {
  Write-Host "pandoc not found. Running npm script that uses Node + md-to-pdf..."
  npm run docs:pdf
}
