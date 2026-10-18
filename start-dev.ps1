$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Include tools installed since this terminal was opened.
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
    [Environment]::GetEnvironmentVariable('Path', 'User')

if (-not (Get-Command pnpm.cmd -ErrorAction SilentlyContinue)) {
    throw 'Install Node.js 22+ and enable pnpm with: corepack enable'
}
if (-not (Test-Path -LiteralPath 'apps/web/.env')) {
    throw 'Create apps/web/.env using .env.example before starting.'
}

# Keep existing database and media; do not run the sample seed.
docker compose up -d --wait --wait-timeout 240 sqlserver azurite
if ($LASTEXITCODE -ne 0) { throw 'Could not start local dependencies. Check Docker Desktop.' }
docker compose stop web
if ($LASTEXITCODE -ne 0) { throw 'Could not stop the production web container.' }

pnpm.cmd --filter @tm/web prisma:generate
if ($LASTEXITCODE -ne 0) { throw 'Prisma client generation failed.' }

pnpm.cmd dev
exit $LASTEXITCODE
