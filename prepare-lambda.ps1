# prepare-lambda.ps1

# Ensure we're in the project root
Set-Location $PSScriptRoot

# Clean up previous builds
Remove-Item -Recurse -Force .\lambda-package -ErrorAction SilentlyContinue
Remove-Item -Force .\lambda-function.zip -ErrorAction SilentlyContinue

# Install dependencies and build
npm install
npx tsc

# Create and populate lambda-package directory
New-Item -ItemType Directory -Force -Path .\lambda-package
Copy-Item package.json .\lambda-package\
Set-Location .\lambda-package
npm install --omit=dev
Set-Location ..

# Copy compiled JS files
Copy-Item -Recurse .\dist\* .\lambda-package\

# Ensure index.js is in the root of lambda-package
if (Test-Path .\lambda-package\app\index.js) {
    Move-Item .\lambda-package\app\index.js .\lambda-package\index.js -Force
}

# Copy config file (if it exists)
if (Test-Path .\config.js) {
    Copy-Item .\config.js .\lambda-package\
}

# Copy ABI files (if they exist)
if (Test-Path .\abis) {
    Copy-Item -Recurse .\abis .\lambda-package\
}

# Create zip file
Compress-Archive -Path .\lambda-package\* -DestinationPath .\lambda-function.zip

# Clean up
Remove-Item -Recurse -Force .\lambda-package

Write-Host "Lambda package created: lambda-function.zip"