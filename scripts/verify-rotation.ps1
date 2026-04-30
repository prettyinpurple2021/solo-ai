param(
  [string]$BaseUrl = "https://www.solosuccessai.fun",
  [string]$RailwayUrl = ""
)

$pass = 0
$fail = 0
$pending = 0

function Pass-Check($label) {
  Write-Host "  PASS  $label" -ForegroundColor Green
  $script:pass++
}
function Fail-Check($label, $reason) {
  Write-Host "  FAIL  $label -- $reason" -ForegroundColor Red
  $script:fail++
}
function Pend-Check($label, $instruction) {
  Write-Host "  PEND  $label" -ForegroundColor Yellow
  Write-Host "        $instruction" -ForegroundColor DarkYellow
  $script:pending++
}

function Read-EnvKey($file, $name) {
  if (-not (Test-Path $file)) { return $null }
  $prefix = "${name}="
  $line = Get-Content $file | Where-Object { $_.StartsWith($prefix) } | Select-Object -Last 1
  if ($line) { return $line.Substring($prefix.Length).Trim().Trim('"') }
  return $null
}

Write-Host ""
Write-Host "=== SoloSuccess AI -- Post-Rotation Verification ===" -ForegroundColor Cyan
Write-Host "  Target: $BaseUrl"
Write-Host "  Time:   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss' -AsUTC) UTC"
Write-Host ""

# 1. Health checks
Write-Host "[ Health ]" -ForegroundColor Cyan
foreach ($path in @("/api/health", "/api/health/deps")) {
  try {
    $r = Invoke-WebRequest -Uri "$BaseUrl$path" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    if ($r.StatusCode -eq 200 -and $r.Content -match '"status"') {
      Pass-Check "GET $path => $($r.StatusCode)"
    } else {
      Fail-Check "GET $path" "status=$($r.StatusCode) body missing 'status'"
    }
  } catch {
    Fail-Check "GET $path" $_.Exception.Message
  }
}

if ($RailwayUrl) {
  foreach ($path in @("/api/health", "/api/health/deps")) {
    try {
      $r = Invoke-WebRequest -Uri "$RailwayUrl$path" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
      if ($r.StatusCode -eq 200) { Pass-Check "Railway GET $path" } else { Fail-Check "Railway GET $path" $r.StatusCode }
    } catch {
      Fail-Check "Railway GET $path" $_.Exception.Message
    }
  }
}

# 2. Auth session baseline
Write-Host ""
Write-Host "[ Auth ]" -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "$BaseUrl/api/auth/session" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
  if ($r.StatusCode -eq 200) { Pass-Check "GET /api/auth/session => 200 (unauthenticated baseline ok)" } else { Fail-Check "GET /api/auth/session" $r.StatusCode }
} catch {
  Fail-Check "GET /api/auth/session" $_.Exception.Message
}
Pend-Check "Authenticated login flow" "Sign out then sign back in at $BaseUrl/login and confirm the session cookie is present"

# 3. OpenAI
Write-Host ""
Write-Host "[ OpenAI ]" -ForegroundColor Cyan
$k = Read-EnvKey ".env.local" "OPENAI_API_KEY"
if ($k) {
  try {
    $body = '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"ping"}],"max_tokens":1}'
    $r = Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" -Method POST `
      -Headers @{ Authorization = "Bearer $k" } -Body $body -ContentType "application/json" -TimeoutSec 20 -ErrorAction Stop
    Pass-Check "OpenAI API key valid"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) { Fail-Check "OpenAI" "401 Unauthorized -- rotate key at platform.openai.com/api-keys" }
    else { Fail-Check "OpenAI" "HTTP $code -- $($_.Exception.Message)" }
  }
} else {
  Write-Host "  SKIP  OPENAI_API_KEY not in .env.local" -ForegroundColor DarkGray
}

# 4. Anthropic
Write-Host ""
Write-Host "[ Anthropic ]" -ForegroundColor Cyan
$k = Read-EnvKey ".env.local" "ANTHROPIC_API_KEY"
if ($k) {
  try {
    $body = '{"model":"claude-haiku-20240307","max_tokens":1,"messages":[{"role":"user","content":"ping"}]}'
    $r = Invoke-RestMethod -Uri "https://api.anthropic.com/v1/messages" -Method POST `
      -Headers @{ "x-api-key" = $k; "anthropic-version" = "2023-06-01" } -Body $body -ContentType "application/json" -TimeoutSec 20 -ErrorAction Stop
    Pass-Check "Anthropic API key valid"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) { Fail-Check "Anthropic" "401 Unauthorized -- rotate at console.anthropic.com/settings/keys" }
    else { Fail-Check "Anthropic" "HTTP $code -- $($_.Exception.Message)" }
  }
} else {
  Write-Host "  SKIP  ANTHROPIC_API_KEY not in .env.local" -ForegroundColor DarkGray
}

# 5. Stripe (read-only list)
Write-Host ""
Write-Host "[ Stripe ]" -ForegroundColor Cyan
$k = Read-EnvKey ".env.local" "STRIPE_SECRET_KEY"
if ($k) {
  try {
    $r = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products?limit=1" -Method GET `
      -Headers @{ Authorization = "Bearer $k" } -TimeoutSec 15 -ErrorAction Stop
    Pass-Check "Stripe secret key valid (GET /v1/products succeeded)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Fail-Check "Stripe" "HTTP $code -- key may need rotation at dashboard.stripe.com/apikeys"
  }
} else {
  Write-Host "  SKIP  STRIPE_SECRET_KEY not in .env.local" -ForegroundColor DarkGray
}
Pend-Check "Stripe checkout flow" "Complete a checkout at $BaseUrl/dashboard/billing and confirm a payment intent in Stripe Dashboard"
Pend-Check "Stripe webhook delivery" "Run: stripe listen --forward-to $BaseUrl/api/stripe/webhook  then trigger an event and confirm 200"

# 6. Upstash Redis PING
Write-Host ""
Write-Host "[ Upstash Redis ]" -ForegroundColor Cyan
$url   = Read-EnvKey ".env.local" "UPSTASH_REDIS_REST_URL"
$token = Read-EnvKey ".env.local" "UPSTASH_REDIS_REST_TOKEN"
if ($url -and $token) {
  try {
    $r = Invoke-RestMethod -Uri "$url/ping" -Method GET `
      -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 10 -ErrorAction Stop
    if ($r.result -eq "PONG") {
      Pass-Check "Upstash Redis PING => PONG"
    } else {
      Fail-Check "Upstash Redis" "Unexpected response: $($r | ConvertTo-Json -Compress)"
    }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Fail-Check "Upstash Redis" "HTTP $code -- rotate token at console.upstash.com"
  }
} else {
  Write-Host "  SKIP  UPSTASH_REDIS_REST_URL or TOKEN not in .env.local" -ForegroundColor DarkGray
}

# 7. Resend (list domains -- read-only)
Write-Host ""
Write-Host "[ Resend ]" -ForegroundColor Cyan
$k = Read-EnvKey ".env.local" "RESEND_API_KEY"
if ($k) {
  try {
    $r = Invoke-RestMethod -Uri "https://api.resend.com/domains" -Method GET `
      -Headers @{ Authorization = "Bearer $k" } -TimeoutSec 10 -ErrorAction Stop
    Pass-Check "Resend API key valid (GET /domains succeeded)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) { Fail-Check "Resend" "401 Unauthorized -- rotate at resend.com/api-keys" }
    else { Fail-Check "Resend" "HTTP $code" }
  }
} else {
  Write-Host "  SKIP  RESEND_API_KEY not in .env.local" -ForegroundColor DarkGray
}

# 8. Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  PASSED:  $pass" -ForegroundColor $(if ($pass -gt 0) { "Green" } else { "DarkGray" })
Write-Host "  FAILED:  $fail" -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Green" })
Write-Host "  PENDING: $pending (require manual browser/dashboard action)" -ForegroundColor Yellow
Write-Host ""
if ($fail -gt 0) {
  Write-Host "  --> Rotate failing keys, update Vercel + Railway env vars, redeploy" -ForegroundColor Red
}
Write-Host "================================================"
Write-Host ""
