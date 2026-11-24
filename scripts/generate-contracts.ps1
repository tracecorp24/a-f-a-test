# Script to validate and maintain contracts
Write-Host "Validating and synchronizing contracts..." -ForegroundColor Cyan

$schemaFiles = Get-ChildItem -Path "packages/contracts/schemas/*.json"
Write-Host "Found $($schemaFiles.Count) JSON Schema contracts."

foreach ($file in $schemaFiles) {
    try {
        $content = Get-Content $file.FullName -Raw | ConvertFrom-Json
        Write-Host "  Valid JSON: $($file.Name)" -ForegroundColor Gray
    } catch {
        Write-Error "Invalid JSON in schema: $($file.Name)"
        exit 1
    }
}

Write-Host "Contracts validated successfully!" -ForegroundColor Green
