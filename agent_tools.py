import os
import sys
import glob
import json
import time
import shutil
import urllib.request
import platform
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, List


def execute_command(command: str, cwd: Optional[str] = None, timeout: int = 60) -> Dict[str, Any]:
    """
    Executes a shell command via PowerShell on Windows.
    Captures stdout, stderr, returncode, and execution duration.

    Args:
        command: The shell or PowerShell command line string to execute.
        cwd: Optional working directory for the command.
        timeout: Maximum execution time in seconds (default 60).
    """
    start_time = time.time()
    work_dir = os.path.expanduser(cwd) if cwd else os.getcwd()
    
    if not os.path.exists(work_dir):
        return {
            "status": "error",
            "error": f"Working directory does not exist: {work_dir}",
            "stdout": "",
            "stderr": "",
            "exit_code": -1,
            "duration_ms": 0,
        }

    # Use PowerShell on Windows
    shell_cmd = ["powershell.exe", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", command]

    try:
        process = subprocess.run(
            shell_cmd,
            cwd=work_dir,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )
        duration_ms = int((time.time() - start_time) * 1000)
        return {
            "status": "success" if process.returncode == 0 else "failed",
            "exit_code": process.returncode,
            "stdout": process.stdout.strip(),
            "stderr": process.stderr.strip(),
            "duration_ms": duration_ms,
            "cwd": work_dir,
        }
    except subprocess.TimeoutExpired:
        duration_ms = int((time.time() - start_time) * 1000)
        return {
            "status": "timeout",
            "error": f"Command timed out after {timeout} seconds.",
            "stdout": "",
            "stderr": "",
            "exit_code": -1,
            "duration_ms": duration_ms,
        }
    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        return {
            "status": "error",
            "error": str(e),
            "stdout": "",
            "stderr": "",
            "exit_code": -1,
            "duration_ms": duration_ms,
        }


def read_file(path: str, start_line: Optional[int] = None, end_line: Optional[int] = None) -> Dict[str, Any]:
    """
    Reads content from a file on the local filesystem.

    Args:
        path: Absolute or relative file path.
        start_line: Optional 1-indexed starting line number.
        end_line: Optional 1-indexed ending line number (inclusive).
    """
    try:
        expanded_path = Path(os.path.expanduser(path)).resolve()
        if not expanded_path.exists():
            return {"status": "error", "error": f"File not found: {expanded_path}"}
        if expanded_path.is_dir():
            return {"status": "error", "error": f"Target path is a directory, not a file: {expanded_path}"}

        # Handle binary or large files
        size_bytes = expanded_path.stat().st_size
        if size_bytes > 5 * 1024 * 1024:
            return {"status": "error", "error": f"File is too large to read in full ({size_bytes / (1024*1024):.2f} MB). Specify line ranges."}

        with open(expanded_path, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()

        total_lines = len(lines)
        s_line = max(1, start_line) if start_line else 1
        e_line = min(total_lines, end_line) if end_line else total_lines

        selected_lines = lines[s_line - 1 : e_line]
        content = "".join(selected_lines)

        return {
            "status": "success",
            "path": str(expanded_path),
            "total_lines": total_lines,
            "start_line": s_line,
            "end_line": e_line,
            "content": content,
            "size_bytes": size_bytes,
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def write_file(path: str, content: str, mode: str = "w") -> Dict[str, Any]:
    """
    Creates or updates a file on the filesystem with the provided content.

    Args:
        path: Target file path.
        content: The text content to write.
        mode: Write mode ('w' for overwrite, 'a' for append).
    """
    try:
        expanded_path = Path(os.path.expanduser(path)).resolve()
        expanded_path.parent.mkdir(parents=True, exist_ok=True)

        write_mode = "a" if mode == "a" else "w"
        with open(expanded_path, write_mode, encoding="utf-8") as f:
            f.write(content)

        return {
            "status": "success",
            "path": str(expanded_path),
            "bytes_written": len(content.encode("utf-8")),
            "mode": "appended" if write_mode == "a" else "written",
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def list_directory(path: str = ".", max_depth: int = 1) -> Dict[str, Any]:
    """
    Lists the contents of a directory with file sizes, types, and modification dates.

    Args:
        path: Path to directory to list (default current directory).
        max_depth: Maximum recursion depth (default 1).
    """
    try:
        target_path = Path(os.path.expanduser(path)).resolve()
        if not target_path.exists():
            return {"status": "error", "error": f"Directory not found: {target_path}"}
        if not target_path.is_dir():
            return {"status": "error", "error": f"Path is not a directory: {target_path}"}

        items = []
        for root, dirs, files in os.walk(target_path):
            current_depth = len(Path(root).relative_to(target_path).parts)
            if current_depth >= max_depth:
                dirs.clear()  # Don't recurse deeper

            for d in dirs:
                full_d = Path(root) / d
                items.append({
                    "name": d,
                    "relative_path": str(full_d.relative_to(target_path)),
                    "is_dir": True,
                    "last_modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(full_d.stat().st_mtime)),
                })
            for f in files:
                full_f = Path(root) / f
                try:
                    stat = full_f.stat()
                    items.append({
                        "name": f,
                        "relative_path": str(full_f.relative_to(target_path)),
                        "is_dir": False,
                        "size_bytes": stat.st_size,
                        "last_modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
                    })
                except Exception:
                    pass

            if current_depth >= max_depth:
                break

        return {
            "status": "success",
            "directory": str(target_path),
            "total_items": len(items),
            "items": items[:150],  # cap at 150 to keep payload manageable
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def search_files(path: str = ".", pattern: str = "*") -> Dict[str, Any]:
    """
    Searches recursively for files matching a glob pattern.

    Args:
        path: Directory to search in.
        pattern: Glob pattern like '*.py', '*config*', or '*.log'.
    """
    try:
        target_path = Path(os.path.expanduser(path)).resolve()
        if not target_path.exists():
            return {"status": "error", "error": f"Path not found: {target_path}"}

        matches = []
        for p in target_path.rglob(pattern):
            try:
                matches.append({
                    "path": str(p),
                    "relative_path": str(p.relative_to(target_path)),
                    "is_dir": p.is_dir(),
                    "size_bytes": p.stat().st_size if p.is_file() else 0,
                })
            except Exception:
                pass
            if len(matches) >= 100:
                break

        return {
            "status": "success",
            "pattern": pattern,
            "root": str(target_path),
            "count": len(matches),
            "matches": matches,
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def grep_search(path: str = ".", query: str = "", extension: Optional[str] = None) -> Dict[str, Any]:
    """
    Searches for a text string inside files under a directory.

    Args:
        path: Root directory to search.
        query: Text to search for.
        extension: Optional file extension filter, e.g. '.py' or '.json'.
    """
    try:
        target_path = Path(os.path.expanduser(path)).resolve()
        if not target_path.exists():
            return {"status": "error", "error": f"Path not found: {target_path}"}

        results = []
        for p in target_path.rglob("*"):
            if not p.is_file():
                continue
            if extension and not p.name.endswith(extension):
                continue
            if p.stat().st_size > 2 * 1024 * 1024:
                continue  # Skip files larger than 2MB

            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    for line_num, line in enumerate(f, start=1):
                        if query.lower() in line.lower():
                            results.append({
                                "file": str(p.relative_to(target_path)),
                                "line_number": line_num,
                                "line_content": line.strip()[:200],
                            })
                            if len(results) >= 50:
                                break
            except Exception:
                continue
            if len(results) >= 50:
                break

        return {
            "status": "success",
            "query": query,
            "total_matches": len(results),
            "matches": results,
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def system_info() -> Dict[str, Any]:
    """
    Retrieves system specifications, OS info, disk drives, memory, and active user stats.
    """
    try:
        os_info = {
            "system": platform.system(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "hostname": platform.node(),
            "username": os.environ.get("USERNAME", "unknown"),
        }

        # Disk space via shutil
        disk_info = []
        if platform.system() == "Windows":
            # Check drive letters
            import string
            for letter in string.ascii_uppercase:
                drive = f"{letter}:\\"
                if os.path.exists(drive):
                    try:
                        total, used, free = shutil.disk_usage(drive)
                        disk_info.append({
                            "drive": drive,
                            "total_gb": round(total / (1024**3), 2),
                            "used_gb": round(used / (1024**3), 2),
                            "free_gb": round(free / (1024**3), 2),
                            "percent_used": round((used / total) * 100, 1),
                        })
                    except Exception:
                        pass
        else:
            total, used, free = shutil.disk_usage("/")
            disk_info.append({
                "drive": "/",
                "total_gb": round(total / (1024**3), 2),
                "free_gb": round(free / (1024**3), 2),
            })

        # Memory info via powershell (no external psutil dependency needed)
        memory_stats = {}
        try:
            ps_mem = subprocess.run(
                [
                    "powershell.exe",
                    "-NoProfile",
                    "-Command",
                    "Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory | ConvertTo-Json",
                ],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if ps_mem.returncode == 0 and ps_mem.stdout.strip():
                mem_data = json.loads(ps_mem.stdout)
                total_kb = mem_data.get("TotalVisibleMemorySize", 0)
                free_kb = mem_data.get("FreePhysicalMemory", 0)
                used_kb = total_kb - free_kb
                memory_stats = {
                    "total_gb": round(total_kb / (1024 * 1024), 2),
                    "used_gb": round(used_kb / (1024 * 1024), 2),
                    "free_gb": round(free_kb / (1024 * 1024), 2),
                    "percent_used": round((used_kb / total_kb) * 100, 1) if total_kb else 0,
                }
        except Exception:
            pass

        return {
            "status": "success",
            "os": os_info,
            "disks": disk_info,
            "memory": memory_stats,
            "python_version": platform.python_version(),
            "working_directory": os.getcwd(),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def manage_processes(action: str = "list", filter_name: Optional[str] = None, pid: Optional[int] = None) -> Dict[str, Any]:
    """
    Inspects running processes or terminates a specific process.

    Args:
        action: 'list' or 'kill'.
        filter_name: Optional process name filter (e.g. 'chrome', 'python').
        pid: Process ID to terminate if action is 'kill'.
    """
    try:
        if action == "kill":
            if not pid and not filter_name:
                return {"status": "error", "error": "Must specify either pid or filter_name to kill a process."}
            cmd = f"Stop-Process -Id {pid} -Force" if pid else f"Stop-Process -Name '{filter_name}' -Force"
            res = execute_command(cmd)
            return {
                "status": "success" if res["exit_code"] == 0 else "failed",
                "message": f"Process termination attempted for {pid or filter_name}.",
                "details": res,
            }

        # Default action: list processes
        ps_cmd = "Get-Process | Sort-Object CPU -Descending | Select-Object -First 25 Id, ProcessName, WorkingSet64, CPU | ConvertTo-Json"
        if filter_name:
            ps_cmd = f"Get-Process -Name '*{filter_name}*' | Select-Object -First 25 Id, ProcessName, WorkingSet64, CPU | ConvertTo-Json"

        res = subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command", ps_cmd],
            capture_output=True,
            text=True,
            timeout=10,
            encoding="utf-8",
            errors="replace",
        )

        processes = []
        if res.returncode == 0 and res.stdout.strip():
            try:
                data = json.loads(res.stdout)
                if isinstance(data, dict):
                    data = [data]
                for p in data:
                    processes.append({
                        "pid": p.get("Id"),
                        "name": p.get("ProcessName"),
                        "memory_mb": round((p.get("WorkingSet64") or 0) / (1024 * 1024), 1),
                        "cpu_time_sec": round(p.get("CPU") or 0, 1),
                    })
            except Exception:
                processes = [{"raw": res.stdout.strip()[:500]}]

        return {
            "status": "success",
            "total_listed": len(processes),
            "processes": processes,
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def launch_application(app: str, args: Optional[str] = "") -> Dict[str, Any]:
    """
    Launches a desktop application or utility on Windows.

    Args:
        app: Application executable name or full path (e.g. 'notepad', 'calc', 'chrome', 'explorer.exe').
        args: Optional command line arguments.
    """
    try:
        cmd = f"Start-Process '{app}'"
        if args:
            cmd += f" -ArgumentList '{args}'"

        res = subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command", cmd],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return {
            "status": "success" if res.returncode == 0 else "failed",
            "app": app,
            "message": f"Application '{app}' launch triggered.",
            "stderr": res.stderr.strip() if res.stderr else None,
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def fetch_web_content(url: str, max_chars: int = 4000) -> Dict[str, Any]:
    """
    Fetches raw text or HTML from a public URL.

    Args:
        url: The web URL to fetch.
        max_chars: Maximum characters to return (default 4000).
    """
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) GeminiStudio/1.0"},
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            html = response.read().decode(charset, errors="replace")

        # Strip heavy scripts/styles for cleaner text
        import re
        clean_text = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", html, flags=re.DOTALL | re.IGNORECASE)
        clean_text = re.sub(r"<[^>]+>", " ", clean_text)
        clean_text = re.sub(r"\s+", " ", clean_text).strip()

        return {
            "status": "success",
            "url": url,
            "length": len(clean_text),
            "content": clean_text[:max_chars],
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


# Tool registry dictionary for easy dynamic execution
ALL_TOOLS = {
    "execute_command": execute_command,
    "read_file": read_file,
    "write_file": write_file,
    "list_directory": list_directory,
    "search_files": search_files,
    "grep_search": grep_search,
    "system_info": system_info,
    "manage_processes": manage_processes,
    "launch_application": launch_application,
    "fetch_web_content": fetch_web_content,
}

TOOL_METADATA = [
    {
        "name": "execute_command",
        "description": "Executes shell / PowerShell commands on the system. Returns stdout, stderr, and exit code.",
        "icon": "💻",
    },
    {
        "name": "read_file",
        "description": "Reads text content from a file with optional start and end line ranges.",
        "icon": "📖",
    },
    {
        "name": "write_file",
        "description": "Creates or updates a file on the local filesystem with specified text.",
        "icon": "✍️",
    },
    {
        "name": "list_directory",
        "description": "Lists contents of a directory with file sizes and timestamps.",
        "icon": "📁",
    },
    {
        "name": "search_files",
        "description": "Recursively searches for files matching a glob pattern (e.g. *.py, *.txt).",
        "icon": "🔍",
    },
    {
        "name": "grep_search",
        "description": "Searches for text content within files under a specified directory.",
        "icon": "🔎",
    },
    {
        "name": "system_info",
        "description": "Fetches system specifications, OS, CPU, RAM, disk space, and active user.",
        "icon": "📊",
    },
    {
        "name": "manage_processes",
        "description": "Lists running processes sorted by CPU/Memory or terminates a process.",
        "icon": "⚡",
    },
    {
        "name": "launch_application",
        "description": "Launches a Windows desktop application (e.g. notepad, calc, chrome, explorer).",
        "icon": "🚀",
    },
    {
        "name": "fetch_web_content",
        "description": "Fetches and extracts clean text content from a web URL.",
        "icon": "🌐",
    },
]

