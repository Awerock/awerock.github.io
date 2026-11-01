$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$branch = git branch --show-current
if ($branch -ne 'dev') { throw 'Expected branch dev. Publication cancelled.' }
$remote = git remote get-url origin
if ($remote -ne 'https://github.com/Awerock/awerock.github.io.git') { throw 'Unexpected repository. Publication cancelled.' }
git status --short
$answer = Read-Host 'Publish these site changes to GitHub? Type YES'
if ($answer -ne 'YES') { Write-Host 'Cancelled'; exit }
git add -- src/index.html src/css/afterhours.css src/js/afterhours.js src/data src/img/uploads editor start-editor.cmd publish.cmd README.md DESIGN.md .gitignore
if ($LASTEXITCODE -ne 0) { throw 'Could not prepare changes.' }
git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
 git commit -m 'Update Sleepwalking website and roster'
 if ($LASTEXITCODE -ne 0) { throw 'Commit failed. Check Git name and email settings.' }
}
git push origin dev
if ($LASTEXITCODE -ne 0) { throw 'Publication failed. Local changes are safe. Check GitHub sign-in and remote changes.' }
Write-Host 'Sent to GitHub. Wait for GitHub Pages deployment before checking the public website.'
