# Apply Pricing System to Supabase
Write-Host "=====================================  " -ForegroundColor Cyan
Write-Host "  Applying Pricing System to Database " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your Supabase credentials" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content ".env.local" | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if ([string]::IsNullOrWhiteSpace($SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($SUPABASE_SERVICE_KEY)) {
    Write-Host "ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "Supabase URL: $SUPABASE_URL" -ForegroundColor Green
Write-Host ""

# Read SQL file
$sqlFile = "supabase/pricing-system-enhanced.sql"
if (-Not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Executing pricing system SQL..." -ForegroundColor Yellow
Write-Host ""

# Execute SQL via Supabase REST API
$headers = @{
    "apikey" = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    "query" = $sqlContent
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "✓ Pricing system applied successfully!" -ForegroundColor Green
} catch {
    # If exec_sql doesn't exist, try direct SQL editor endpoint
    Write-Host "Attempting alternative method..." -ForegroundColor Yellow
    
    # Note: You'll need to run this manually in Supabase SQL Editor
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "MANUAL ACTION REQUIRED" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run the following SQL file in your Supabase SQL Editor:" -ForegroundColor White
    Write-Host "  supabase/pricing-system-enhanced.sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor White
    Write-Host "  1. Go to: $SUPABASE_URL" -ForegroundColor Gray
    Write-Host "  2. Navigate to: SQL Editor" -ForegroundColor Gray
    Write-Host "  3. Click: New Query" -ForegroundColor Gray
    Write-Host "  4. Copy content from: supabase/pricing-system-enhanced.sql" -ForegroundColor Gray
    Write-Host "  5. Click: Run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Verify tables created: events (pricing columns), team_pricing_tiers, registrations (payment columns)" -ForegroundColor Gray
Write-Host "  2. Test price calculation function" -ForegroundColor Gray
Write-Host "  3. Create events with pricing from the organizer dashboard" -ForegroundColor Gray
Write-Host "  4. Test payment flow on registration page" -ForegroundColor Gray
Write-Host ""
