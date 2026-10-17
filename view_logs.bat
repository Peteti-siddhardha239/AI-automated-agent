@echo off
setlocal
cd /d "%~dp0"

echo =========================================================
echo             SENTINEL ANTIVIRUS - RECENT LOGS
echo =========================================================

if exist "agent_log.txt" (
    powershell -NoProfile -Command "Get-Content agent_log.txt -Tail 30"
) else (
    echo [i] No log entries recorded yet.
)

echo =========================================================
pause
