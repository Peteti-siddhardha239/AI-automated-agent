"""
Quarantine & Remediation Manager
Handles automated process termination, file isolation, XOR payload neutralization,
threat database logging, and silent Windows toast alerts.
"""

import os
import sys
import time
import json
import uuid
import subprocess
import threading
from datetime import datetime
from typing import Dict, Any, Optional


class QuarantineManager:
    def __init__(self, quarantine_dir: str, threats_db_file: str, show_notifications: bool = True):
        self.quarantine_dir = os.path.abspath(quarantine_dir)
        self.threats_db_file = os.path.abspath(threats_db_file)
        self.show_notifications = show_notifications
        self._lock = threading.Lock()
        os.makedirs(self.quarantine_dir, exist_ok=True)
        self._init_db()

    def _init_db(self):
        with self._lock:
            if not os.path.exists(self.threats_db_file):
                try:
                    with open(self.threats_db_file, "w", encoding="utf-8") as f:
                        json.dump([], f, indent=2)
                except Exception as e:
                    print(f"[!] Failed to initialize threats database: {e}")

    def terminate_process_by_path(self, file_path: str) -> bool:
        """Find and terminate any process running from the specified malicious file path."""
        norm_path = os.path.abspath(file_path).replace("\\", "\\\\")
        terminated_any = False

        # Attempt 1: Terminate via PowerShell query on ExecutablePath
        try:
            cmd = [
                "powershell",
                "-NoProfile",
                "-NonInteractive",
                "-WindowStyle", "Hidden",
                "-Command",
                f"Get-CimInstance Win32_Process | Where-Object {{ $_.ExecutablePath -like '*{os.path.basename(file_path)}*' }} | ForEach-Object {{ Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $_.ProcessId }}"
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            if result.returncode == 0 and result.stdout.strip():
                terminated_any = True
        except Exception:
            pass

        # Attempt 2: Taskkill by image name
        try:
            base_name = os.path.basename(file_path)
            subprocess.run(
                ["taskkill", "/F", "/IM", base_name],
                capture_output=True,
                timeout=3
            )
        except Exception:
            pass

        return terminated_any

    @staticmethod
    def _neutralize_bytes(data: bytes, key: int = 0xA5) -> bytes:
        """XOR neutralize byte contents so file cannot be executed as a valid PE or script."""
        return bytes([b ^ key for b in data])

    def send_windows_notification(self, threat_name: str, file_name: str):
        """Silently pop up a native Windows notification balloon without showing any taskbar app."""
        if not self.show_notifications:
            return

        def _notify():
            try:
                # Silent PowerShell balloon notification (hidden window, no taskbar presence)
                escaped_threat = threat_name.replace("'", "''")
                escaped_file = file_name.replace("'", "''")
                ps_script = (
                    "[reflection.assembly]::loadwithpartialname('System.Windows.Forms') | Out-Null; "
                    "$n = New-Object System.Windows.Forms.NotifyIcon; "
                    "$n.Icon = [System.Drawing.SystemIcons]::Shield; "
                    "$n.Visible = $true; "
                    f"$n.ShowBalloonTip(4000, 'Antivirus Sentinel: Threat Removed', 'Detected & Neutralized: {escaped_file}`nThreat: {escaped_threat}', [System.Windows.Forms.ToolTipIcon]::Warning); "
                    "Start-Sleep -Seconds 4; "
                    "$n.Dispose()"
                )
                subprocess.run(
                    ["powershell", "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", ps_script],
                    capture_output=True,
                    timeout=8
                )
            except Exception:
                pass

        threading.Thread(target=_notify, daemon=True).start()

    def neutralize_and_remove(self, scan_result: Dict[str, Any]) -> Dict[str, Any]:
        """Isolate, neutralize, and securely remove infected file from host system."""
        file_path = scan_result.get("file_path", "")
        threat_name = scan_result.get("threat_name", "Unknown.Threat")
        severity = scan_result.get("severity", "HIGH")
        sha256 = scan_result.get("sha256", "UNKNOWN")

        if not os.path.exists(file_path):
            return {"status": "FILE_NOT_FOUND", "file_path": file_path}

        base_name = os.path.basename(file_path)

        # Step 1: Kill any running instances of this executable/script
        self.terminate_process_by_path(file_path)
        time.sleep(0.1)

        # Step 2: Read raw contents and create neutralized vault copy
        quarantine_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}_{base_name}.quarantined"
        quarantine_target = os.path.join(self.quarantine_dir, quarantine_filename)

        removed_successfully = False
        try:
            with open(file_path, "rb") as f_in:
                raw_bytes = f_in.read()

            # Neutralize payload using XOR scramble
            neutralized_data = self._neutralize_bytes(raw_bytes)
            with open(quarantine_target, "wb") as f_out:
                f_out.write(neutralized_data)

            # Step 3: Remove the original malicious file
            for attempt in range(5):
                try:
                    if os.path.exists(file_path):
                        # Overwrite original before unlinking if possible
                        try:
                            with open(file_path, "wb") as f_clear:
                                f_clear.write(b"\x00" * min(len(raw_bytes), 4096))
                        except Exception:
                            pass
                        os.remove(file_path)
                    removed_successfully = True
                    break
                except PermissionError:
                    self.terminate_process_by_path(file_path)
                    time.sleep(0.3)
                except Exception:
                    time.sleep(0.2)

        except Exception as e:
            return {"status": "FAILED", "error": str(e), "file_path": file_path}

        # Step 4: Record threat details in database
        record = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "threat_name": threat_name,
            "threat_type": scan_result.get("threat_type", "Generic"),
            "severity": severity,
            "original_path": file_path,
            "original_name": base_name,
            "quarantine_vault_path": quarantine_target,
            "sha256": sha256,
            "md5": scan_result.get("md5"),
            "file_size": scan_result.get("file_size", 0),
            "detection_details": scan_result.get("details", ""),
            "action": "AUTO_REMOVED_AND_QUARANTINED" if removed_successfully else "QUARANTINED_VAULT_COPIED"
        }

        with self._lock:
            try:
                db_data = []
                if os.path.exists(self.threats_db_file):
                    try:
                        with open(self.threats_db_file, "r", encoding="utf-8") as f:
                            db_data = json.load(f)
                    except Exception:
                        db_data = []
                db_data.insert(0, record)
                with open(self.threats_db_file, "w", encoding="utf-8") as f:
                    json.dump(db_data, f, indent=2)
            except Exception as e:
                print(f"[!] Failed to log threat record: {e}")

        # Step 5: Send silent Windows alert
        self.send_windows_notification(threat_name, base_name)

        return {
            "status": "REMOVED_AND_QUARANTINED",
            "record": record,
            "removed_from_disk": removed_successfully
        }

    def get_history(self) -> list:
        with self._lock:
            try:
                if os.path.exists(self.threats_db_file):
                    with open(self.threats_db_file, "r", encoding="utf-8") as f:
                        return json.load(f)
            except Exception:
                pass
            return []
