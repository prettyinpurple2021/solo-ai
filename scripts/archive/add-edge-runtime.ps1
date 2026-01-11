# Add Edge Runtime export to all API routes

# Get all API route files
$apiFiles = Get-ChildItem -Path "app/api" -Recurse -Include "*.ts", "*.tsx" | Where-Object { $_.Name -eq "route.ts" }

Write-Host "Found $($apiFiles.Count) API route files"

foreach ($file in $apiFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Check if runtime export already exists
    if ($content -notmatch "export const runtime") {
        Write-Host "Adding Edge Runtime to: $($file.FullName)"
        
        # Add the runtime export at the top, after imports
        $lines = $content -split "`n"
        $insertIndex = 0
        
        # Find the last import line
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match "^import " -or $lines[$i] -match "^const " -or $lines[$i].Trim() -eq "") {
                $insertIndex = $i + 1
            } elseif ($lines[$i] -match "^export|^function|^class") {
                break
            }
        }
        
        # Insert the runtime export
        $newLines = @()
        $newLines += $lines[0..($insertIndex-1)]
        $newLines += ""
        $newLines += "export const runtime = 'edge'"
        $newLines += ""
        $newLines += $lines[$insertIndex..($lines.Count-1)]
        
        # Write back to file
        $newContent = $newLines -join "`n"
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
    } else {
        Write-Host "Runtime export already exists in: $($file.FullName)"
    }
}

Write-Host "Completed adding Edge Runtime exports to all API routes"