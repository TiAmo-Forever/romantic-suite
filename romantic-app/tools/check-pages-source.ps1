param(
    [string]$Root = "D:\JavaProject\romantic-suite\romantic-app\pages"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $Root)) {
    Write-Error "Root path not found: $Root"
    exit 2
}

$replacementChar = [string][char]0xFFFD
$tofuToken = [string][char]0x951F

$findings = New-Object System.Collections.Generic.List[object]

function Add-Finding {
    param(
        [string]$Path,
        [int]$LineNumber,
        [string]$Reason,
        [string]$Text
    )

    $findings.Add([pscustomobject]@{
        Path = $Path
        Line = $LineNumber
        Reason = $Reason
        Text = $Text.Trim()
    })
}

$files = Get-ChildItem -LiteralPath $Root -Recurse -Filter *.vue | Sort-Object FullName

foreach ($file in $files) {
    $lineNumber = 0
    foreach ($line in Get-Content -LiteralPath $file.FullName -Encoding UTF8) {
        $lineNumber += 1

        if ($line.Contains($replacementChar) -or $line.Contains($tofuToken)) {
            Add-Finding -Path $file.FullName -LineNumber $lineNumber -Reason "suspicious-text" -Text $line
        }

        if ($line -match 'placeholder="[^"]*$') {
            Add-Finding -Path $file.FullName -LineNumber $lineNumber -Reason "unterminated-placeholder" -Text $line
        }

        if ($line.Contains("'")) {
            $quoteCount = ([regex]::Matches($line, "'")).Count
            if (($quoteCount % 2) -ne 0 -and $line -notmatch '^\s*//') {
                Add-Finding -Path $file.FullName -LineNumber $lineNumber -Reason "odd-single-quote-count" -Text $line
            }
        }
    }
}

if ($findings.Count -eq 0) {
    Write-Host "OK: no suspicious page-source findings under $Root"
    exit 0
}

Write-Host "Found $($findings.Count) suspicious page-source findings:`n"
foreach ($item in $findings) {
    Write-Host ("[{0}] {1}:{2}" -f $item.Reason, $item.Path, $item.Line)
    Write-Host ("  {0}" -f $item.Text)
}

exit 1
