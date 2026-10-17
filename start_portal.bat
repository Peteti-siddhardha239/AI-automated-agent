@echo off
setlocal
cd /d "%~dp0"
echo =========================================================
echo       STARTING SENTINEL WEB PORTAL (LOGIN / ADMIN)
echo =========================================================
python portal.py
pause
