"""
Sentinel Antivirus Core Daemon
Runs silently in the background, coordinates real-time file monitoring,
threat detection, automated neutralization, heartbeat metrics, and process auditing.
"""

import os
import sys
import time
import json
import signal
import threading
from datetime import datetime
from typing import Dict, Any

from engine import AntivirusEngine
from quarantine import QuarantineManager
from watcher import RealtimeWatcher


class AntivirusDaemon:
    def __init__(self, config_file: str = "config.json"):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.config_path = os.path.join(self.base_dir, config_file)
        self.config = self._load_config()

        self.pid_file = os.path.join(self.base_dir, "agent.pid")
        self.log_file = os.path.join(self.base_dir, self.config.get("log_file", "agent_log.txt"))
        self.status_file = os.path.join(self.base_dir, self.config.get("status_file", "agent_status.json"))
        self.signatures_path = os.path.join(self.base_dir, "signatures.json")
        self.quarantine_dir = os.path.join(self.base_dir, self.config.get("quarantine_dir", "quarantine"))
        self.threats_db = os.path.join(self.base_dir, self.config.get("threats_db", "threats_detected.json"))

        self.running = False
        self.scanned_count = 0
        self.threats_neutralized_count = 0
        self._stats_lock = threading.Lock()

        # Initialize engines
        self.engine = AntivirusEngine(
            signatures_file=self.signatures_path,
            entropy_threshold=self.config.get("entropy_threshold", 7.75),
            max_file_size_mb=self.config.get("max_file_size_mb", 150)
        )

        self.quarantine = QuarantineManager(
            quarantine_dir=self.quarantine_dir,
            threats_db_file=self.threats_db,
            show_notifications=self.config.get("show_notifications", True)
        )

        self.watcher = RealtimeWatcher(
            watch_paths=self.config.get("watch_paths", []),
            exclude_paths=self.config.get("exclude_paths", []) + [self.base_dir],
            on_file_detected=self.handle_file_event,
            periodic_interval_seconds=self.config.get("periodic_scan_interval_seconds", 30)
        )

    def _load_config(self) -> Dict[str, Any]:
        default_cfg = {
            "watch_paths": [
                os.path.expanduser("~/Downloads"),
                os.path.expanduser("~/Desktop"),
                os.path.expandvars("%TEMP%")
            ],
            "exclude_paths": [],
            "auto_quarantine": True,
            "show_notifications": True,
            "periodic_scan_interval_seconds": 30,
            "max_file_size_mb": 150,
            "entropy_threshold": 7.75
        }
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    default_cfg.update(data)
            except Exception:
                pass
        return default_cfg

    def log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        entry = f"[{timestamp}] [{level.upper()}] {message}\n"
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(entry)
        except Exception:
            pass

    def handle_file_event(self, file_path: str):
        """Called whenever a file is created, modified, or discovered."""
        if not self.running:
            return

        with self._stats_lock:
            self.scanned_count += 1

        scan_result = self.engine.scan_file(file_path)

        if scan_result.get("is_infected"):
            threat_name = scan_result.get("threat_name")
            severity = scan_result.get("severity")
            details = scan_result.get("details")

            self.log(
                f"THREAT INTERCEPTED: {threat_name} (Severity: {severity}) at {file_path}. Details: {details}",
                level="SECURITY_ALERT"
            )

            if self.config.get("auto_quarantine", True):
                remediation = self.quarantine.neutralize_and_remove(scan_result)
                status = remediation.get("status")
                if status == "REMOVED_AND_QUARANTINED":
                    with self._stats_lock:
                        self.threats_neutralized_count += 1
                    self.log(
                        f"SUCCESSFULLY NEUTRALIZED: {threat_name} at {file_path} -> isolated into vault and deleted from disk.",
                        level="REMEDIATED"
                    )
                else:
                    self.log(
                        f"REMEDIATION WARNING: Status {status} for {file_path}.",
                        level="WARNING"
                    )

    def _heartbeat_worker(self):
        """Periodically writes live telemetry and heartbeat to agent_status.json."""
        start_time = datetime.now().isoformat()
        while self.running:
            with self._stats_lock:
                status_data = {
                    "agent_name": "Sentinel Background Antivirus Agent",
                    "status": "ACTIVE_MONITORING",
                    "pid": os.getpid(),
                    "started_at": start_time,
                    "last_heartbeat": datetime.now().isoformat(),
                    "scanned_files_count": self.scanned_count,
                    "threats_neutralized_count": self.threats_neutralized_count,
                    "active_watch_paths": self.watcher.watch_paths,
                    "version": "1.0.0"
                }
            try:
                with open(self.status_file, "w", encoding="utf-8") as f:
                    json.dump(status_data, f, indent=2)
            except Exception:
                pass

            time.sleep(5)

    def _process_audit_worker(self):
        """Periodic scan of running processes to catch malicious disguised binaries in Temp/AppData."""
        while self.running:
            try:
                # Audit running processes for suspicious paths (e.g. running from Temp pretending to be system executables)
                temp_dir = os.path.expandvars("%TEMP%").lower()
                suspicious_system_names = {"svchost.exe", "explorer.exe", "csrss.exe", "services.exe", "lsass.exe"}

                import subprocess
                cmd = ["powershell", "-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command",
                       "Get-CimInstance Win32_Process | Select-Object ProcessId, Name, ExecutablePath | ConvertTo-Json"]
                res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
                if res.returncode == 0 and res.stdout.strip():
                    try:
                        procs = json.loads(res.stdout)
                        if isinstance(procs, dict):
                            procs = [procs]
                        for p in procs:
                            exe_path = p.get("ExecutablePath") or ""
                            p_name = (p.get("Name") or "").lower()
                            p_id = p.get("ProcessId")
                            if exe_path:
                                # If fake system process is running from temp directory:
                                if p_name in suspicious_system_names and temp_dir in exe_path.lower():
                                    self.log(
                                        f"MALICIOUS PROCESS DETECTED: {p_name} masquerading from Temp ({exe_path}) [PID: {p_id}]. Terminating immediately.",
                                        level="CRITICAL"
                                    )
                                    subprocess.run(["taskkill", "/F", "/PID", str(p_id)], capture_output=True)
                    except Exception:
                        pass
            except Exception:
                pass

            for _ in range(20):
                if not self.running:
                    break
                time.sleep(1)

    def start(self):
        self.running = True

        # Write PID file
        try:
            with open(self.pid_file, "w", encoding="utf-8") as f:
                f.write(str(os.getpid()))
        except Exception:
            pass

        self.log(
            f"Sentinel Antivirus Agent activated in background (PID: {os.getpid()}). Real-time protection is LIVE.",
            level="SYSTEM"
        )

        # Register signals
        def handle_exit(signum, frame):
            self.stop()
            sys.exit(0)

        try:
            signal.signal(signal.SIGINT, handle_exit)
            signal.signal(signal.SIGTERM, handle_exit)
        except Exception:
            pass

        # Start watcher
        self.watcher.start()

        # Start heartbeat
        hb_thread = threading.Thread(target=self._heartbeat_worker, daemon=True, name="HeartbeatWorker")
        hb_thread.start()

        # Start process auditor
        pa_thread = threading.Thread(target=self._process_audit_worker, daemon=True, name="ProcessAuditor")
        pa_thread.start()

        # Main loop
        try:
            while self.running:
                time.sleep(1)
        except (KeyboardInterrupt, SystemExit):
            self.stop()

    def stop(self):
        self.running = False
        self.watcher.stop()
        self.log("Sentinel Antivirus Agent safely shutting down.", level="SYSTEM")
        try:
            if os.path.exists(self.pid_file):
                os.remove(self.pid_file)
        except Exception:
            pass

        # Update status
        try:
            if os.path.exists(self.status_file):
                with open(self.status_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                data["status"] = "STOPPED"
                data["last_heartbeat"] = datetime.now().isoformat()
                with open(self.status_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
        except Exception:
            pass


if __name__ == "__main__":
    daemon = AntivirusDaemon()
    daemon.start()
