# Sentinel Real-Time Antivirus Background Agent

An autonomous, ultra-lightweight, real-time defensive endpoint security agent designed to run completely silently in the Windows background without opening any app windows, console windows, browser pages, or taskbar icons.

---

## 🚀 Key Features

1. **100% Silent Background Operation**:
   - Executes via Windows `pythonw.exe` and silent VBScript launcher.
   - Absolutely zero console windows, taskbar items, or system tray clutter.
   - Maintains a live background process ID and JSON heartbeat telemetry.

2. **Real-Time Kernel-Level File System Sentinel**:
   - Employs Windows native `ReadDirectoryChangesW` kernel API for sub-millisecond event interception on:
     - `Downloads` (`%USERPROFILE%\Downloads`)
     - `Desktop` (`%USERPROFILE%\Desktop`)
     - `Temp` (`%LOCALAPPDATA%\Temp`)
     - `Startup` (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`)
   - Supplemented by a periodic 30-second background deep-sweeper ensuring 100% coverage.

3. **Multi-Tier Virus & Malware Detection Engine**:
   - **Industry-Standard EICAR Detection**: Recognizes the international standard antivirus test string.
   - **Cryptographic Hash Signatures**: SHA-256 and MD5 database for known ransomware and trojans (WannaCry, Emotet, Locky, Ryuk, Mimikatz, DarkSide).
   - **Deceptive Extension Masquerade**: Intercepts double-extension droppers (e.g., `document.pdf.exe`, `photo.jpg.vbs`).
   - **Ransomware Protection**: Detects known ransomware extension signatures (`.locked`, `.crypto`, `.wannacry`, `.lockbit`, `.stop`, `.crypted`) and extortion notes.
   - **Heuristic Script Analysis**: Inspects `.bat`, `.ps1`, `.vbs`, `.js` for web download cradles, hidden window execution bypasses, Defender tampering, and shadow copy deletion.
   - **Binary Shannon Entropy**: Analyzes PE binaries for packed or encrypted payloads with abnormal entropy (> 7.75/8.0).

4. **Self-Remediation & Automated Threat Removal**:
   - Automatically searches for and terminates any active Windows processes running from the infected file path.
   - Scrambles and neutralizes malicious byte content via XOR masking so files cannot be executed.
   - Moves threats to an isolated, secure vault: `quarantine/`.
   - Shreds/purges the original malicious file from the monitored host directory.
   - Logs detailed forensic records to `threats_detected.json` and `agent_log.txt`.
   - Sends discreet Windows background notification toasts without taskbar presence.

---

## 📂 File Structure

```text
Desktop\agent\
│
├── start_antivirus.bat          --> One-click background launcher
├── stop_antivirus.bat           --> One-click safe shutdown
├── status_antivirus.bat         --> Live status, PID, memory, and telemetry inspector
├── test_antivirus.bat           --> Real-time test tool (drops safe EICAR test threat)
│
└── antivirus_agent\
    ├── agent_core.py            --> Main orchestrator and background daemon
    ├── engine.py                --> Multi-tier detection engine
    ├── watcher.py               --> Windows kernel file monitor & sweeper
    ├── quarantine.py            --> Process terminator, file isolator, XOR scrambler
    ├── config.json              --> Configurable paths and security settings
    ├── signatures.json          --> Known signatures and heuristic rules
    ├── start.vbs                --> Completely silent background launcher
    ├── start.bat                --> Batch launcher with validation
    ├── stop.bat                 --> Safe shutdown script
    ├── status.bat               --> Status and telemetry display
    ├── view_logs.bat            --> Live log tail viewer
    ├── test_threat.py           --> Automated test verification suite
    ├── agent_log.txt            --> Forensic execution and detection log
    ├── agent_status.json        --> Real-time heartbeat and telemetry
    ├── threats_detected.json    --> Quarantined threat records
    └── quarantine\              --> Vault holding neutralized files
```

---

## ⚡ Quick Usage

- **Start Background Protection**: Double-click `start_antivirus.bat`.
- **Check Live Status**: Double-click `status_antivirus.bat`.
- **Test Real-Time Removal**: Double-click `test_antivirus.bat`.
- **Stop Protection**: Double-click `stop_antivirus.bat`.
