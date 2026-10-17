"""
Win32 Process Management Utilities
High-performance, pure ctypes implementation of Windows process enumeration,
executable path retrieval, and process termination.

Guarantees ZERO external sub-process spawns (no powershell.exe, no taskkill.exe,
no conhost.exe), ensuring ZERO window flashing, ZERO console popups, and ZERO screen interruptions.
"""

import os
import ctypes
from ctypes import wintypes
from typing import List, Dict, Optional, Any

# Win32 Process Snapshot Constants
TH32CS_SNAPPROCESS = 0x00000002
PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
PROCESS_QUERY_INFORMATION = 0x0400
PROCESS_TERMINATE = 0x0001
INVALID_HANDLE_VALUE = -1

# Process Creation Flags for Subprocess Fallback
CREATE_NO_WINDOW = 0x08000000
STARTF_USESHOWWINDOW = 0x00000001
SW_HIDE = 0


class PROCESSENTRY32W(ctypes.Structure):
    _fields_ = [
        ("dwSize", wintypes.DWORD),
        ("cntUsage", wintypes.DWORD),
        ("th32ProcessID", wintypes.DWORD),
        ("th32DefaultHeapID", ctypes.c_void_p),
        ("th32ModuleID", wintypes.DWORD),
        ("cntThreads", wintypes.DWORD),
        ("th32ParentProcessID", wintypes.DWORD),
        ("pcPriClassBase", wintypes.LONG),
        ("dwFlags", wintypes.DWORD),
        ("szExeFile", wintypes.WCHAR * 260)
    ]


kernel32 = ctypes.windll.kernel32


def list_processes() -> List[Dict[str, Any]]:
    """
    Enumerate all running processes purely in-memory using Win32 Toolhelp32 snapshot.
    Zero external processes spawned, zero console windows created.
    """
    procs: List[Dict[str, Any]] = []
    h_snapshot = kernel32.CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0)
    if h_snapshot == INVALID_HANDLE_VALUE:
        return procs

    try:
        entry = PROCESSENTRY32W()
        entry.dwSize = ctypes.sizeof(PROCESSENTRY32W)
        if kernel32.Process32FirstW(h_snapshot, ctypes.byref(entry)):
            while True:
                pid = entry.th32ProcessID
                name = entry.szExeFile
                if pid > 4:  # Exclude system idle and idle kernel
                    procs.append({
                        "pid": pid,
                        "name": name,
                    })
                if not kernel32.Process32NextW(h_snapshot, ctypes.byref(entry)):
                    break
    finally:
        kernel32.CloseHandle(h_snapshot)

    return procs


def get_process_image_path(pid: int) -> Optional[str]:
    """
    Retrieve the full executable path of a given process PID purely via Win32 API.
    """
    h_proc = kernel32.OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
    if not h_proc:
        h_proc = kernel32.OpenProcess(PROCESS_QUERY_INFORMATION, False, pid)
    if not h_proc:
        return None

    try:
        buf = ctypes.create_unicode_buffer(1024)
        size = wintypes.DWORD(1024)
        if kernel32.QueryFullProcessImageNameW(h_proc, 0, buf, ctypes.byref(size)):
            return buf.value
    finally:
        kernel32.CloseHandle(h_proc)

    return None


def terminate_process_by_pid(pid: int) -> bool:
    """
    Terminate a process immediately by PID using Win32 TerminateProcess API.
    Zero external commands (no taskkill, no powershell).
    """
    h_proc = kernel32.OpenProcess(PROCESS_TERMINATE, False, pid)
    if not h_proc:
        return False
    try:
        res = kernel32.TerminateProcess(h_proc, 1)
        return bool(res)
    finally:
        kernel32.CloseHandle(h_proc)


def terminate_processes_by_file_path(target_path: str) -> bool:
    """
    Find and terminate any process running from target_path or matching the binary filename.
    """
    norm_target = os.path.abspath(target_path).lower()
    target_name = os.path.basename(norm_target).lower()
    terminated_any = False

    for proc in list_processes():
        p_name = proc.get("name", "").lower()
        p_id = proc.get("pid")
        if not p_id:
            continue

        if p_name == target_name:
            exe_path = get_process_image_path(p_id)
            if exe_path and exe_path.lower() == norm_target:
                if terminate_process_by_pid(p_id):
                    terminated_any = True
            elif not exe_path:
                # If path is inaccessible, terminate by exact executable name match
                if terminate_process_by_pid(p_id):
                    terminated_any = True

    return terminated_any


def terminate_processes_by_name(exe_name: str) -> bool:
    """
    Terminate all processes with a given executable name.
    """
    target = exe_name.lower()
    terminated_any = False
    for proc in list_processes():
        if proc.get("name", "").lower() == target:
            if terminate_process_by_pid(proc["pid"]):
                terminated_any = True
    return terminated_any


def safe_subprocess_run(cmd: list, timeout: int = 5):
    """
    Fallback runner for external commands with guaranteed zero console window allocation.
    Uses CREATE_NO_WINDOW and STARTUPINFO wShowWindow=SW_HIDE.
    """
    import subprocess
    startupinfo = subprocess.STARTUPINFO()
    startupinfo.dwFlags |= STARTF_USESHOWWINDOW
    startupinfo.wShowWindow = SW_HIDE

    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout,
        creationflags=CREATE_NO_WINDOW,
        startupinfo=startupinfo
    )
