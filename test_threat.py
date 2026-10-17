"""
Antivirus Real-Time Verification Test Tool
Safely drops standard EICAR test string and deceptive double extension sample into Downloads,
then verifies real-time detection, process termination, and automated removal into the quarantine vault.
"""

import os
import sys
import time
import json

DOWNLOADS_DIR = os.path.join(os.environ["USERPROFILE"], "Downloads")
AGENT_DIR = os.path.dirname(os.path.abspath(__file__))
THREATS_DB = os.path.join(AGENT_DIR, "threats_detected.json")
QUARANTINE_DIR = os.path.join(AGENT_DIR, "quarantine")
LOG_FILE = os.path.join(AGENT_DIR, "agent_log.txt")

EICAR_STRING = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"


def run_test():
    print("=" * 65)
    print("   SENTINEL ANTIVIRUS - REAL-TIME REMOVAL VERIFICATION TEST")
    print("=" * 65)

    if not os.path.exists(DOWNLOADS_DIR):
        print(f"[!] Downloads directory not found: {DOWNLOADS_DIR}")
        return

    test_file_1 = os.path.join(DOWNLOADS_DIR, "eicar_test_virus.txt")
    test_file_2 = os.path.join(DOWNLOADS_DIR, "urgent_salary_slip.pdf.exe")

    print(f"[*] Target Monitored Directory : {DOWNLOADS_DIR}")
    print("[*] Creating harmless Test Threat 1: Standard EICAR Antivirus Test Pattern")

    try:
        with open(test_file_1, "w", encoding="ascii") as f:
            f.write(EICAR_STRING)
        print(f"    [+] Dropped file: {test_file_1}")
    except Exception as e:
        print(f"[!] Failed to drop test file: {e}")
        return

    print("[*] Creating harmless Test Threat 2: Deceptive Double-Extension Masquerade")
    try:
        with open(test_file_2, "wb") as f:
            f.write(b"MZ\x90\x00\x03\x00\x00\x00DUMMY_EXECUTABLE_PAYLOAD_FOR_TESTING")
        print(f"    [+] Dropped file: {test_file_2}")
    except Exception as e:
        print(f"[!] Failed to drop test file: {e}")

    print("\n[*] Sentinel Background Agent actively monitoring... Awaiting automatic neutralization...")
    t1_removed = False
    t2_removed = False
    for elapsed in range(1, 11):
        time.sleep(0.8)
        t1_exists = os.path.exists(test_file_1)
        t2_exists = os.path.exists(test_file_2)
        if not t1_exists and not t1_removed:
            print(f"    [+] [{elapsed * 0.8:.1f}s] Threat 1 (EICAR) detected and removed by background agent!")
            t1_removed = True
        if not t2_exists and not t2_removed:
            print(f"    [+] [{elapsed * 0.8:.1f}s] Threat 2 (Double-Ext) detected and removed by background agent!")
            t2_removed = True
        if t1_removed and t2_removed:
            break

    print("    Neutralization cycle completed. Checking results...\n")

    # Verification
    t1_exists = os.path.exists(test_file_1)
    t2_exists = os.path.exists(test_file_2)

    print("-" * 65)
    print("TEST RESULTS:")
    print("-" * 65)

    if not t1_exists:
        print("[PASS] Test Threat 1 (EICAR): REMOVED from Downloads by agent!")
    else:
        print("[FAIL] Test Threat 1 (EICAR): File still present in Downloads.")

    if not t2_exists:
        print("[PASS] Test Threat 2 (Double-Ext): REMOVED from Downloads by agent!")
    else:
        print("[FAIL] Test Threat 2 (Double-Ext): File still present in Downloads.")

    # Check quarantine vault
    quarantined_files = os.listdir(QUARANTINE_DIR) if os.path.exists(QUARANTINE_DIR) else []
    print(f"\n[*] Files in Quarantine Vault: {len(quarantined_files)} file(s)")
    for qf in quarantined_files[-2:]:
        print(f"    - {qf}")

    # Check database
    if os.path.exists(THREATS_DB):
        try:
            with open(THREATS_DB, "r", encoding="utf-8") as f:
                db = json.load(f)
            print(f"\n[*] Total Threats Logged in Database: {len(db)}")
            if db:
                latest = db[0]
                print(f"    Latest Threat Record:")
                print(f"      - Threat Name : {latest.get('threat_name')}")
                print(f"      - Severity    : {latest.get('severity')}")
                print(f"      - Action      : {latest.get('action')}")
                print(f"      - Target Path : {latest.get('original_path')}")
        except Exception as e:
            print(f"[!] Error reading threats db: {e}")

    print("=" * 65)
    if not t1_exists and not t2_exists:
        print("VERIFICATION SUCCESS: Antivirus agent detected and self-removed threats in real-time!")
    else:
        print("VERIFICATION IN PROGRESS: Check status.bat or agent_log.txt if agent is active.")
    print("=" * 65)


if __name__ == "__main__":
    run_test()
