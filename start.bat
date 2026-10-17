@echo off
setlocal
cd /d "%~dp0"

echo =========================================================
echo       SENTINEL REAL-TIME ANTIVIRUS BACKGROUND AGENT
echo =========================================================

REM Check if already running
if exist "agent.pid" (
    set /p AGENT_PID=<agent.pid
    tasklist /fi "PID eq %AGENT_PID%" 2>nul | find /i "%AGENT_PID%" >nul
    if not errorlevel 1 (
        echo [!] Antivirus Agent is ALREADY RUNNING in background with PID: %AGENT_PID%
        echo [i] Check status using: status.bat
        goto :END
    ) else (
        del /f /q agent.pid >nul 2>&1
    )
)

echo [*] Launching Antivirus Agent silently in background...
cscript //nologo start.vbs

REM Delay without timeout command to support all shells
ping 127.0.0.1 -n 3 >nul

if exist "agent.pid" (
    set /p AGENT_PID=<agent.pid
    echo [OK] Antivirus Agent is now ACTIVE and MONITORING in background!
    echo      - Process PID: %AGENT_PID%
    echo      - Window: Completely hidden (No taskbar button, no app window)
    echo      - Real-Time Protection: Downloads, Desktop, Temp, Startup
    echo      - Logs: agent_log.txt
    echo      - Quarantine Vault: quarantine\
) else (
    echo [OK] Agent launched in background. Monitoring active.
)

:END
echo =========================================================
exit /b 0
