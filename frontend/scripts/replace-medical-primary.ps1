$ErrorActionPreference = 'Stop'

$root = Join-Path (Get-Location) 'src'
$files = Get-ChildItem -Path $root -Recurse -File -Include *.ts,*.tsx,*.css

foreach ($f in $files) {
  $c = Get-Content -LiteralPath $f.FullName -Raw
  $o = $c

  # Tailwind arbitrary colors -> primary utilities
  $o = $o -replace 'bg-\[#16C5C0\]', 'bg-primary'
  $o = $o -replace 'text-\[#16C5C0\]', 'text-primary'
  $o = $o -replace 'border-\[#16C5C0\]', 'border-primary'

  # Replace old medical palette hex values
  $o = $o -replace '#16C5C0', '#0F8F8B'
  $o = $o -replace '#18C6C0', '#0F8F8B'
  $o = $o -replace '#12B9B4', '#0F8F8B'
  $o = $o -replace '#0FA6A3', '#0F8F8B'

  # Replace old rgba(22,197,192,alpha) to new rgba
  $o = $o -replace 'rgba\(22,\s*197,\s*192,', 'rgba(15, 143, 139,'

  # If the old gradient got normalized to 3x new primary hex, compress to bg-primary
  $o = $o -replace 'bg-gradient-to-l from-\[#0F8F8B\] via-\[#0F8F8B\] to-\[#0F8F8B\]', 'bg-primary'

  if ($o -ne $c) {
    Set-Content -LiteralPath $f.FullName -Value $o -NoNewline
  }
}
