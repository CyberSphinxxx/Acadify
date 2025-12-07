$files = git status --porcelain | ForEach-Object { $_.Substring(3) }

foreach ($file in $files) {
    if ($file -match "node_modules") { continue }
    
    $msg = "Add $file"
    
    if ($file -match "src/components/ui/(.*)\.tsx") {
        $name = $matches[1]
        $msg = "Add $name UI component"
    } elseif ($file -match "src/components/features/(.*)/(.*)\.tsx") {
        $feature = $matches[1]
        $name = $matches[2]
        $msg = "Add $name component for $feature"
    } elseif ($file -match "src/pages/(.*)\.tsx") {
        $name = $matches[1]
        $msg = "Add $name page"
    } elseif ($file -match "src/services/(.*)\.ts") {
        $name = $matches[1]
        $msg = "Add $name service"
    } elseif ($file -match "src/types/(.*)\.ts") {
        $name = $matches[1]
        $msg = "Add $name type definitions"
    } elseif ($file -match "src/hooks/(.*)\.ts") {
        $name = $matches[1]
        $msg = "Add $name hook"
    } elseif ($file -match "src/store/(.*)\.ts") {
        $name = $matches[1]
        $msg = "Add $name store"
    }

    Write-Host "Committing $file with message: $msg"
    git add "$file"
    git commit -m "$msg"
}
