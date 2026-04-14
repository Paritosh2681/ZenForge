# =============================================================================
# 🚀 HACKATHON STARTUP SCRIPT - ZenForge Complete System Launcher
# =============================================================================
# This script starts the entire ZenForge system with health monitoring
# and automatic recovery if services fail or become unresponsive.

param(
    [switch]$Monitor = $false,      # Keep running and monitor for failures
    [int]$HealthCheckInterval = 10  # Seconds between health checks
)

# Colors for output
$colors = @{
    Success = 'Green'
    Error   = 'Red'
    Warning = 'Yellow'
    Info    = 'Cyan'
}

function Write-Status {
    param([string]$Message, [string]$Type = 'Info')
    Write-Host $Message -ForegroundColor $colors[$Type]
}

function Test-ServiceHealth {
    param([string]$Name, [string]$Url)
    
    try {
        $response = curl -s -m 2 $Url 2>&1
        if ($response -and $response -notlike "*curl*error*") {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Stop-Service-Safe {
    param([string]$ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            try {
                $proc | Stop-Process -Force -ErrorAction SilentlyContinue
                Start-Sleep -Milliseconds 500
            } catch {}
        }
    }
}

# =============================================================================
# 1. CLEANUP & PREPARATION
# =============================================================================
Write-Status "`n[STARTUP] Cleaning up old processes..." Info
Stop-Service-Safe python
Stop-Service-Safe node
Get-Job -ErrorAction SilentlyContinue | Stop-Job -Force
Start-Sleep -Seconds 1

# =============================================================================
# 2. START BACKEND SERVICE
# =============================================================================
Write-Status "[BACKEND] Starting FastAPI backend on port 8000..." Info
$backendJob = Start-Job -ScriptBlock {
    cd 'd:\Hackethon\AMD\ZenForge\backend'
    python -m uvicorn app.main:app `
        --host 0.0.0.0 `
        --port 8000 `
        --reload `
        --timeout-keep-alive 75 `
        --interface asyncio
} -Name BackendService

Start-Sleep -Seconds 3

# Test backend health
$maxAttempts = 10
$attempt = 0
while ($attempt -lt $maxAttempts) {
    if (Test-ServiceHealth "Backend" "http://localhost:8000/api/v1/health") {
        Write-Status "✓ Backend is responding" Success
        break
    }
    $attempt++
    if ($attempt -eq $maxAttempts) {
        Write-Status "✗ Backend failed to start" Error
        Get-Job -Name BackendService | Stop-Job
        exit 1
    }
    Start-Sleep -Seconds 1
}

# =============================================================================
# 3. START FRONTEND SERVICE
# =============================================================================
Write-Status "[FRONTEND] Starting Next.js frontend on port 3000..." Info
$frontendJob = Start-Job -ScriptBlock {
    cd 'd:\Hackethon\AMD\ZenForge\frontend'
    npm run dev
} -Name FrontendService

Start-Sleep -Seconds 5

# =============================================================================
# 4. VERIFY OLLAMA
# =============================================================================
Write-Status "[OLLAMA] Checking Ollama service..." Info
if (Test-ServiceHealth "Ollama" "http://localhost:11434/api/tags") {
    Write-Status "✓ Ollama is running" Success
} else {
    Write-Status "⚠ Ollama not responding, attempting to start..." Warning
    Get-Process -Name ollama -ErrorAction SilentlyContinue | Stop-Process -Force 2>&1 | Out-Null
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# =============================================================================
# 5. HEALTH CHECK LOOP (if monitoring enabled)
# =============================================================================
if ($Monitor) {
    Write-Status "`n[MONITORING] Starting continuous health checks (Ctrl+C to stop)..." Info
    Write-Status "Health check interval: $HealthCheckInterval seconds" Info
    
    $systemHealthy = $true
    
    while ($true) {
        Write-Host "`n$(Get-Date -Format 'HH:mm:ss') - Checking system health..."
        
        # Check Backend
        $backendOk = Test-ServiceHealth "Backend" "http://localhost:8000/api/v1/health"
        if ($backendOk) {
            Write-Host "  ✓ Backend: Healthy" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Backend: UNHEALTHY - RESTARTING!" -ForegroundColor Red
            Stop-Job -Name BackendService -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            $backendJob = Start-Job -ScriptBlock {
                cd 'd:\Hackethon\AMD\ZenForge\backend'
                python -m uvicorn app.main:app `
                    --host 0.0.0.0 `
                    --port 8000 `
                    --reload `
                    --timeout-keep-alive 75
            } -Name BackendService
            Start-Sleep -Seconds 3
        }
        
        # Check Frontend
        $frontendOk = Test-ServiceHealth "Frontend" "http://localhost:3000"
        if ($frontendOk) {
            Write-Host "  ✓ Frontend: Healthy" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Frontend: UNHEALTHY - RESTARTING!" -ForegroundColor Red
            Stop-Job -Name FrontendService -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            $frontendJob = Start-Job -ScriptBlock {
                cd 'd:\Hackethon\AMD\ZenForge\frontend'
                npm run dev
            } -Name FrontendService
            Start-Sleep -Seconds 5
        }
        
        # Check Ollama
        $ollamaOk = Test-ServiceHealth "Ollama" "http://localhost:11434/api/tags"
        if ($ollamaOk) {
            Write-Host "  ✓ Ollama: Healthy" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Ollama: UNHEALTHY" -ForegroundColor Red
        }
        
        Start-Sleep -Seconds $HealthCheckInterval
    }
} else {
    Write-Status "`n" Green
    Write-Status "╔════════════════════════════════════════════════════════════╗" Green
    Write-Status "║           🎉 ZENFORGE SYSTEM IS RUNNING 🎉                ║" Green
    Write-Status "╠════════════════════════════════════════════════════════════╣" Green
    Write-Status "║  Frontend: http://localhost:3000/dashboard                 ║" Green
    Write-Status "║  Backend:  http://localhost:8000                           ║" Green
    Write-Status "║  Ollama:   http://localhost:11434                          ║" Green
    Write-Status "╚════════════════════════════════════════════════════════════╝" Green
    Write-Status "`nRun with -Monitor flag to enable continuous health checks:" Info
    Write-Status "  .\Hackathon-Startup.ps1 -Monitor" Info
    
    Write-Status "`nKeep this window open. Press Ctrl+C to stop all services." Warning
    Get-Job | Wait-Job
}
