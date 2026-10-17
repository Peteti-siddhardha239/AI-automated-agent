@echo off
setlocal
cd /d "%~dp0"

echo =========================================================
echo       STOPPING SENTINEL ANTIVIRUS BACKGROUND AGENT
echo =========================================================

python -c "
import os, json, subprocess

killed = False
pid = None
if os.path.exists('agent.pid'):
    try:
        with open('agent.pid', 'r') as f:
            pid = int(f.read().strip())
    except:
        pass

if pid:
    try:
        subprocess.run(['taskkill', '/F', '/PID', str(pid)], capture_output=True)
        print(f'[OK] Terminated agent process PID: {pid}')
        killed = True
    except:
        pass

# Also terminate any pythonw process executing agent_core.py
try:
    cmd = ['powershell', '-NoProfile', '-Command', 'Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like \"*agent_core.py*\" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; $_.ProcessId }']
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.stdout.strip():
        for p in res.stdout.strip().splitlines():
            print(f'[OK] Terminated background agent PID: {p.strip()}')
            killed = True
except:
    pass

if os.path.exists('agent.pid'):
    try:
        os.remove('agent.pid')
    except:
        pass

if os.path.exists('agent_status.json'):
    try:
        with open('agent_status.json', 'r', encoding='utf-8') as f:
            st = json.load(f)
        st['status'] = 'STOPPED'
        with open('agent_status.json', 'w', encoding='utf-8') as f:
            json.dump(st, f, indent=2)
    except:
        pass

print('[OK] Sentinel Antivirus Agent is completely STOPPED.')
"

echo =========================================================
exit /b 0
