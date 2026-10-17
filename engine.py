"""
Antivirus Detection Engine
Handles signature hashing, EICAR identification, heuristic script analysis,
double-extension masquerade detection, ransomware indicators, and Shannon entropy checks.
"""

import os
import math
import json
import re
import hashlib
from typing import Dict, Any, Tuple, Optional


class AntivirusEngine:
    def __init__(self, signatures_file: str, entropy_threshold: float = 7.75, max_file_size_mb: int = 150):
        self.signatures_file = signatures_file
        self.entropy_threshold = entropy_threshold
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024
        self.signatures = self._load_signatures()

    def _load_signatures(self) -> Dict[str, Any]:
        try:
            if os.path.exists(self.signatures_file):
                with open(self.signatures_file, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            print(f"[!] Warning: Failed to load signatures: {e}")
        return {
            "file_hashes": {},
            "eicar_string": "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
            "ransomware_extensions": [".locked", ".crypto", ".wannacry", ".wncry", ".lockbit", ".stop", ".crypted"],
            "ransom_notes": ["readme_decrypt", "how_to_decrypt", "how_to_recover", "decrypt_files"],
            "fake_extensions": [".pdf", ".docx", ".xlsx", ".pptx", ".jpg", ".jpeg", ".png", ".txt", ".mp3"],
            "dangerous_executable_extensions": [".exe", ".scr", ".bat", ".cmd", ".vbs", ".js", ".ps1", ".hta", ".pif"],
            "malicious_script_patterns": []
        }

    @staticmethod
    def calculate_hashes(file_path: str) -> Tuple[Optional[str], Optional[str]]:
        """Calculate SHA-256 and MD5 hashes of file in 64KB chunks."""
        sha256 = hashlib.sha256()
        md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                while chunk := f.read(65536):
                    sha256.update(chunk)
                    md5.update(chunk)
            return sha256.hexdigest().lower(), md5.hexdigest().lower()
        except Exception:
            return None, None

    @staticmethod
    def calculate_entropy(data: bytes) -> float:
        """Calculate Shannon entropy of a byte stream (0.0 to 8.0)."""
        if not data:
            return 0.0
        entropy = 0.0
        length = len(data)
        counts = [0] * 256
        for b in data:
            counts[b] += 1
        for count in counts:
            if count > 0:
                p_x = float(count) / length
                entropy -= p_x * math.log2(p_x)
        return entropy

    def _check_eicar(self, file_path: str) -> bool:
        """Check for EICAR standard antivirus test signature."""
        eicar_seq = self.signatures.get("eicar_string", "").encode("ascii", errors="ignore")
        if not eicar_seq:
            return False
        try:
            with open(file_path, "rb") as f:
                head = f.read(512)
                if eicar_seq in head:
                    return True
        except Exception:
            pass
        return False

    def _check_deceptive_extension(self, file_name: str) -> Tuple[bool, Optional[str]]:
        """Detect malware disguised as documents/images with double extensions (e.g. invoice.pdf.exe)."""
        lower_name = file_name.lower()
        for fake in self.signatures.get("fake_extensions", []):
            for dangerous in self.signatures.get("dangerous_executable_extensions", []):
                compound = f"{fake}{dangerous}"
                if lower_name.endswith(compound):
                    return True, f"Deceptive Extension Masquerade ({compound})"
        return False, None

    def _check_ransomware_extension(self, file_name: str) -> Tuple[bool, Optional[str]]:
        """Detect known ransomware file extension suffixes or ransom notes."""
        lower_name = file_name.lower()
        for ext in self.signatures.get("ransomware_extensions", []):
            if lower_name.endswith(ext.lower()):
                return True, f"Known Ransomware Encrypted Extension ({ext})"
        for note in self.signatures.get("ransom_notes", []):
            if note.lower() in lower_name:
                return True, f"Ransomware Extortion Note Pattern ({note})"
        return False, None

    def _check_script_content(self, file_path: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """Analyze scripts (.bat, .cmd, .ps1, .vbs, .js, .hta) for high-risk malicious primitives."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read(250000)  # Read first 250KB
        except Exception:
            return False, None, None

        for item in self.signatures.get("malicious_script_patterns", []):
            pat = item.get("pattern")
            sec = item.get("secondary")
            name = item.get("name", "Heuristic.SuspiciousScript")
            severity = item.get("severity", "HIGH")

            if pat and re.search(pat, content, re.IGNORECASE):
                if sec:
                    if re.search(sec, content, re.IGNORECASE):
                        return True, name, severity
                else:
                    return True, name, severity

        return False, None, None

    def _is_pe_signed(self, file_path: str) -> bool:
        """Check if PE binary has an embedded Authenticode digital signature table."""
        try:
            with open(file_path, "rb") as f:
                # Read DOS header
                dos_hdr = f.read(64)
                if len(dos_hdr) < 64 or dos_hdr[:2] != b"MZ":
                    return False
                pe_offset = int.from_bytes(dos_hdr[0x3C:0x40], byteorder="little")
                f.seek(pe_offset)
                pe_sig = f.read(4)
                if pe_sig != b"PE\x00\x00":
                    return False
                # Skip COFF File Header (20 bytes)
                coff_hdr = f.read(20)
                # Read Optional Header Magic (2 bytes)
                magic = f.read(2)
                if magic == b"\x0b\x01":  # PE32
                    sec_dir_offset = pe_offset + 4 + 20 + 128
                elif magic == b"\x0b\x02":  # PE32+
                    sec_dir_offset = pe_offset + 4 + 20 + 144
                else:
                    return False

                f.seek(sec_dir_offset)
                sec_entry = f.read(8)
                if len(sec_entry) == 8:
                    cert_va = int.from_bytes(sec_entry[0:4], byteorder="little")
                    cert_sz = int.from_bytes(sec_entry[4:8], byteorder="little")
                    if cert_va > 0 and cert_sz > 0:
                        return True
        except Exception:
            pass
        return False

    def _check_pe_entropy(self, file_path: str) -> Tuple[bool, Optional[str], float]:
        """Examine unsigned standalone executables for abnormal Shannon entropy (crypted/packed malware)."""
        ext = os.path.splitext(file_path)[1].lower()
        # Only inspect standalone executables, not libraries or drivers
        if ext not in [".exe", ".scr", ".pif"]:
            return False, None, 0.0

        # If file is digitally signed by a recognized vendor, do not flag for entropy
        if self._is_pe_signed(file_path):
            return False, None, 0.0

        try:
            size = os.path.getsize(file_path)
            # Focus on small-to-medium crypted droppers (< 10 MB)
            if size > 10 * 1024 * 1024:
                return False, None, 0.0

            with open(file_path, "rb") as f:
                header = f.read(2)
                if header != b"MZ":
                    return False, None, 0.0
                f.seek(0)
                sample = f.read(1048576)  # Read up to 1MB
            entropy = self.calculate_entropy(sample)
            if entropy >= 7.88:  # High threshold indicating encrypted/packed raw payload
                return True, f"Suspicious Unsigned Crypted Binary (Entropy: {entropy:.2f}/8.0)", entropy
            return False, None, entropy
        except Exception:
            return False, None, 0.0

    def scan_file(self, file_path: str) -> Dict[str, Any]:
        """Perform comprehensive multi-tier antivirus scan on the specified file."""
        norm_path = os.path.abspath(file_path)
        base_name = os.path.basename(norm_path)
        result = {
            "is_infected": False,
            "threat_name": None,
            "severity": "CLEAN",
            "threat_type": "Clean",
            "details": "",
            "sha256": None,
            "md5": None,
            "file_size": 0,
            "file_path": norm_path
        }

        if not os.path.isfile(norm_path):
            return result

        try:
            file_size = os.path.getsize(norm_path)
            result["file_size"] = file_size
        except Exception:
            return result

        # Check maximum file size to preserve real-time low latency
        if file_size > self.max_file_size_bytes:
            return result

        # Tier 1: Check deceptive double extensions (e.g., photo.jpg.exe)
        is_deceptive, dec_details = self._check_deceptive_extension(base_name)
        if is_deceptive:
            result.update({
                "is_infected": True,
                "threat_name": "Trojan.Masquerade.DoubleExtension",
                "severity": "HIGH",
                "threat_type": "TrojanDropper",
                "details": dec_details
            })
            sha256, md5 = self.calculate_hashes(norm_path)
            result["sha256"] = sha256
            result["md5"] = md5
            return result

        # Tier 2: Check ransomware file extension indicators
        is_ransom, ransom_details = self._check_ransomware_extension(base_name)
        if is_ransom:
            result.update({
                "is_infected": True,
                "threat_name": "Ransom.Generic.EncryptedPayload",
                "severity": "CRITICAL",
                "threat_type": "Ransomware",
                "details": ransom_details
            })
            sha256, md5 = self.calculate_hashes(norm_path)
            result["sha256"] = sha256
            result["md5"] = md5
            return result

        # Tier 3: Standard EICAR Antivirus Test Pattern check
        if self._check_eicar(norm_path):
            sha256, md5 = self.calculate_hashes(norm_path)
            result.update({
                "is_infected": True,
                "threat_name": "EICAR-Standard-AV-Test-File",
                "severity": "TEST_ALERT",
                "threat_type": "AntivirusTestVector",
                "details": "Standard international antivirus verification test string matched",
                "sha256": sha256,
                "md5": md5
            })
            return result

        # Compute file cryptographic hashes
        sha256, md5 = self.calculate_hashes(norm_path)
        result["sha256"] = sha256
        result["md5"] = md5

        # Tier 4: Known Malware Hash Database lookup
        file_hashes = self.signatures.get("file_hashes", {})
        if sha256 and sha256 in file_hashes:
            sig = file_hashes[sha256]
            result.update({
                "is_infected": True,
                "threat_name": sig.get("name", "Malware.SignatureMatch"),
                "severity": sig.get("severity", "CRITICAL"),
                "threat_type": sig.get("type", "MalwareHashMatch"),
                "details": f"Matched known malicious SHA-256 signature [{sha256[:16]}...]"
            })
            return result

        if md5 and md5 in file_hashes:
            sig = file_hashes[md5]
            result.update({
                "is_infected": True,
                "threat_name": sig.get("name", "Malware.SignatureMatch"),
                "severity": sig.get("severity", "CRITICAL"),
                "threat_type": sig.get("type", "MalwareHashMatch"),
                "details": f"Matched known malicious MD5 signature [{md5}]"
            })
            return result

        # Tier 5: Script Heuristic Behavior Analysis
        ext = os.path.splitext(norm_path)[1].lower()
        if ext in [".bat", ".cmd", ".ps1", ".vbs", ".vbe", ".js", ".jse", ".wsf", ".hta"]:
            is_mal_script, script_name, script_sev = self._check_script_content(norm_path)
            if is_mal_script:
                result.update({
                    "is_infected": True,
                    "threat_name": script_name,
                    "severity": script_sev,
                    "threat_type": "MaliciousScript",
                    "details": "Detected high-risk execution pattern / evasion technique"
                })
                return result

        # Tier 6: High Entropy / Packed Binary Analysis for standalone executables
        if ext in [".exe", ".scr", ".pif"]:
            is_high_entropy, ent_details, _ = self._check_pe_entropy(norm_path)
            if is_high_entropy:
                result.update({
                    "is_infected": True,
                    "threat_name": "Suspicious.Crypted.HighEntropy",
                    "severity": "HIGH",
                    "threat_type": "PackedPayload",
                    "details": ent_details
                })
                return result

        return result
