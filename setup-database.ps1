# Supabase Database Setup Script
# This script executes SQL commands via Supabase REST API

$supabaseUrl = "https://xzfydiunbdkjxtbbztdc.supabase.co"
$serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6ZnlkaXVuYmRranh0YmJ6dGRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDkwMzAzMywiZXhwIjoyMDc2NDc5MDMzfQ.BQ-edXOo8Z-8xFYf91sVTFrSnLNGSXDhIIa_mDBJCTU"

$sqlFile = "supabase\COMPLETE_SETUP.sql"
Write-Host "Reading SQL file: $sqlFile" -ForegroundColor Cyan

# Read the SQL file
$sql = Get-Content $sqlFile -Raw

Write-Host "`nExecuting SQL commands..." -ForegroundColor Yellow
Write-Host "This may take 10-20 seconds...`n" -ForegroundColor Yellow

# Execute SQL via Supabase REST API
$headers = @{
    "apikey" = $serviceRoleKey
    "Authorization" = "Bearer $serviceRoleKey"
    "Content-Type" = "application/json"
}

$body = @{
    "query" = $sql
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/xzfydiunbdkjxtbbztdc" -ForegroundColor White
    Write-Host "2. Click 'Table Editor' to verify 11 tables exist" -ForegroundColor White
    Write-Host "3. Test authentication at http://localhost:9002/register-user" -ForegroundColor White
}
catch {
    Write-Host "⚠️  REST API method not available. Using direct SQL execution..." -ForegroundColor Yellow
    Write-Host "`nPlease run the SQL manually:" -ForegroundColor Cyan
    Write-Host "1. Open: https://supabase.com/dashboard/project/xzfydiunbdkjxtbbztdc/sql" -ForegroundColor White
    Write-Host "2. Copy contents of: supabase\COMPLETE_SETUP.sql" -ForegroundColor White
    Write-Host "3. Paste and click 'Run'" -ForegroundColor White
}
