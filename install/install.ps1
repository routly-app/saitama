$ErrorActionPreference = "Stop"

$lockFile = "$env:TEMP\install.lock"

if (Test-Path $lockFile) {
    Write-Output "Install already in progress."
    exit 1
}

New-Item -ItemType File -Path $lockFile | Out-Null
try {
    # Prefer bun, fallback to npm
    $manager = "npm"
    if (Get-Command bun -ErrorAction SilentlyContinue) {
        $manager = "bun"
    }

    Push-Location packages/sdk
    if ($manager -eq "bun") {
        bun install --no-scripts
    } else {
        npm install --ignore-scripts
    }
    Pop-Location

    if ($manager -eq "bun") {
        bun install --no-scripts
        bun x turbo build --filter=@saitamafun/sdk
    } else {
        npm install --ignore-scripts
        npx turbo build --filter=@saitamafun/sdk
    }

} finally {
    Remove-Item $lockFile -ErrorAction SilentlyContinue
}
