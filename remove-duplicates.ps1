# PowerShell script to remove duplicate payment method entries
# Remove duplicates of BNI, BRI, and Mandiri from paymentChannels.ts

$filePath = "src/config/paymentChannels.ts"
$content = Get-Content $filePath

# Find lines with duplicate entries
$bniLines = @()
$briLines = @()
$mandiriLines = @()

for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i] -match "id: 'bni',") {
        $bniLines += $i
    } elseif ($content[$i] -match "id: 'bri',") {
        $briLines += $i
    } elseif ($content[$i] -match "id: 'mandiri',") {
        $mandiriLines += $i
    }
}

Write-Host "BNI found at lines: $($bniLines -join ', ')"
Write-Host "BRI found at lines: $($briLines -join ', ')"
Write-Host "Mandiri found at lines: $($mandiriLines -join ', ')"

# We need to remove the second occurrence of each
# Since we found duplicates at lines 130/234 for BNI, etc.

# Let's create a backup first
Copy-Item $filePath "$filePath.backup"

# Now let's manually remove the duplicate section
# We'll remove from the second BNI (around line 234) to just before the next unique entry

# Read the file content
$lines = Get-Content $filePath

# Find the range to remove (from second BNI to just before first non-duplicate)
$startRemove = -1
$endRemove = -1

for ($i = 200; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "id: 'bni'," -and $startRemove -eq -1) {
        # Found second BNI, start removal from previous line (the opening brace)
        $startRemove = $i - 1
    }
    if ($startRemove -ne -1 -and $lines[$i] -match "id: 'permata',") {
        # Found Permata, end removal at previous line
        $endRemove = $i - 2
        break
    }
}

Write-Host "Will remove lines $startRemove to $endRemove"

if ($startRemove -ne -1 -and $endRemove -ne -1) {
    # Create new content without the duplicate lines
    $newContent = @()
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($i -lt $startRemove -or $i -gt $endRemove) {
            $newContent += $lines[$i]
        }
    }
    
    # Write the new content
    $newContent | Set-Content $filePath
    Write-Host "Successfully removed duplicate entries!"
    Write-Host "Original file backed up as $filePath.backup"
} else {
    Write-Host "Could not determine removal range safely"
}
