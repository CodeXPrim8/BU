# PowerShell script to push code to GitHub
# Run this script in PowerShell from your project directory

Write-Host "🚀 Pushing code to GitHub..." -ForegroundColor Cyan

# Check if git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installing, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$projectPath = "C:\Users\clemx\Downloads\Bison note mobile-app-build"
Set-Location $projectPath

Write-Host "`n📁 Current directory: $(Get-Location)" -ForegroundColor Cyan

# Initialize git repository (if not already initialized)
if (-not (Test-Path ".git")) {
    Write-Host "`n🔧 Initializing git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "`n✅ Git repository already initialized" -ForegroundColor Green
}

# Add README.md
Write-Host "`n📝 Adding README.md..." -ForegroundColor Yellow
git add README.md

# Create first commit
Write-Host "`n💾 Creating first commit..." -ForegroundColor Yellow
git commit -m "first commit"

# Set branch to main
Write-Host "`n🌿 Setting branch to main..." -ForegroundColor Yellow
git branch -M main

# Add remote origin (remove if exists first)
Write-Host "`n🔗 Adding remote origin..." -ForegroundColor Yellow
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Host "Remote already exists: $existingRemote" -ForegroundColor Yellow
    git remote remove origin
}
git remote add origin https://github.com/CodeXPrim8/BU.git

# Push to GitHub
Write-Host "`n⬆️  Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  You may be prompted for GitHub credentials" -ForegroundColor Yellow
Write-Host "   Use your GitHub username and a Personal Access Token (not password)" -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed README.md to GitHub!" -ForegroundColor Green
    Write-Host "`n📦 Next step: Add all other files" -ForegroundColor Cyan
    Write-Host "   Run: git add ." -ForegroundColor White
    Write-Host "   Run: git commit -m 'Add all project files'" -ForegroundColor White
    Write-Host "   Run: git push" -ForegroundColor White
} else {
    Write-Host "`n❌ Push failed. Please check the error above." -ForegroundColor Red
    Write-Host "`nCommon issues:" -ForegroundColor Yellow
    Write-Host "1. Authentication failed - Use Personal Access Token instead of password" -ForegroundColor White
    Write-Host "2. Repository doesn't exist - Create it on GitHub first" -ForegroundColor White
    Write-Host "3. Network issues - Check your internet connection" -ForegroundColor White
}
