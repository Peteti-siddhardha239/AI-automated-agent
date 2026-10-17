"""
Real-Time File System Sentinel
Watches directories using Windows kernel API (ReadDirectoryChangesW) for sub-millisecond
event dispatch, combined with a periodic deep background sweeper.
"""

import os
import time
import ctypes
from ctypes import wintypes
import threading
import queue
from typing import List, Callable, Set, Dict, Any, Tuple

# Windows API Constants for ReadDirectoryChangesW
FILE_LIST_DIRECTORY = 0x0001
FILE_SHARE_READ = 0x00000001
FILE_SHARE_WRITE = 0x00000002
FILE_SHARE_DELETE = 0x00000004
OPEN_EXISTING = 3
FILE_FLAG_BACKUP_SEMANTICS = 0x02000000
INVALID_HANDLE_VALUE = -1

FILE_NOTIFY_CHANGE_FILE_NAME = 0x00000001
FILE_NOTIFY_CHANGE_DIR_NAME = 0x00000002
FILE_NOTIFY_CHANGE_LAST_WRITE = 0x00000010
FILE_NOTIFY_CHANGE_SIZE = 0x00000008

FILE_ACTION_ADDED = 0x00000001
FILE_ACTION_REMOVED = 0x00000002
FILE_ACTION_MODIFIED = 0x00000003
FILE_ACTION_RENAMED_OLD_NAME = 0x00000004
FILE_ACTION_RENAMED_NEW_NAME = 0x00000005


class FILE_NOTIFY_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("NextEntryOffset", wintypes.DWORD),
        ("Action", wintypes.DWORD),
        ("FileNameLength", wintypes.DWORD),
        ("FileName", wintypes.WCHAR * 1),
    ]


class RealtimeWatcher:
    def __init__(
        self,
        watch_paths: List[str],
        exclude_paths: List[str],
        on_file_detected: Callable[[str], None],
        periodic_interval_seconds: int = 30
    ):
        self.watch_paths = [os.path.abspath(p) for p in watch_paths if os.path.isdir(p)]
        self.exclude_paths = [os.path.abspath(p) for p in exclude_paths]
        self.on_file_detected = on_file_detected
        self.periodic_interval = periodic_interval_seconds

        self.running = False
        self._threads: List[threading.Thread] = []
        self._dispatch_queue = queue.Queue()
        self._scanned_cache: Dict[str, Tuple[float, int]] = {}  # path -> (mtime, size)
        self._cache_lock = threading.Lock()

    def _is_excluded(self, path: str) -> bool:
        norm = os.path.abspath(path)
        for exc in self.exclude_paths:
            if norm == exc or norm.startswith(exc + os.sep):
                return True
        return False

    def _kernel_watch_worker(self, directory: str):
        """Worker thread executing Win32 ReadDirectoryChangesW for a directory."""
        kernel32 = ctypes.windll.kernel32
        h_dir = kernel32.CreateFileW(
            directory,
            FILE_LIST_DIRECTORY,
            FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
            None,
            OPEN_EXISTING,
            FILE_FLAG_BACKUP_SEMANTICS,
            None
        )

        if h_dir == INVALID_HANDLE_VALUE:
            return

        buffer = ctypes.create_string_buffer(65536)
        bytes_returned = wintypes.DWORD()

        filter_flags = (
            FILE_NOTIFY_CHANGE_FILE_NAME
            | FILE_NOTIFY_CHANGE_LAST_WRITE
            | FILE_NOTIFY_CHANGE_SIZE
        )

        while self.running:
            success = kernel32.ReadDirectoryChangesW(
                h_dir,
                buffer,
                len(buffer),
                True,  # recursive
                filter_flags,
                ctypes.byref(bytes_returned),
                None,
                None
            )

            if not success or bytes_returned.value == 0:
                time.sleep(0.5)
                continue

            offset = 0
            while True:
                fni = FILE_NOTIFY_INFORMATION.from_buffer_copy(buffer, offset)
                action = fni.Action
                file_name_len = fni.FileNameLength // 2
                wchar_array = (wintypes.WCHAR * file_name_len).from_buffer_copy(buffer, offset + 12)
                file_name = "".join(wchar_array)

                if action in (FILE_ACTION_ADDED, FILE_ACTION_MODIFIED, FILE_ACTION_RENAMED_NEW_NAME):
                    full_path = os.path.join(directory, file_name)
                    if not self._is_excluded(full_path):
                        self._dispatch_queue.put(full_path)

                if fni.NextEntryOffset == 0:
                    break
                offset += fni.NextEntryOffset

        kernel32.CloseHandle(h_dir)

    def _queue_dispatcher(self):
        """Dequeues paths and dispatches them to on_file_detected callback."""
        while self.running:
            try:
                file_path = self._dispatch_queue.get(timeout=1.0)
            except queue.Empty:
                continue

            # Give a fraction of a second for file handle writes to flush
            time.sleep(0.15)

            if not os.path.exists(file_path) or not os.path.isfile(file_path):
                continue

            if self._is_excluded(file_path):
                continue

            try:
                stat = os.stat(file_path)
                mtime, size = stat.st_mtime, stat.st_size

                with self._cache_lock:
                    cached = self._scanned_cache.get(file_path)
                    if cached and cached[0] == mtime and cached[1] == size:
                        continue
                    self._scanned_cache[file_path] = (mtime, size)

                self.on_file_detected(file_path)
            except Exception:
                pass

    def _periodic_sweeper(self):
        """Safety net: periodically sweeps configured watch paths to catch any missed files."""
        while self.running:
            for directory in self.watch_paths:
                if not os.path.isdir(directory):
                    continue
                try:
                    # Shallow and 1-level deep walk for key watch paths
                    for root, dirs, files in os.walk(directory):
                        # Filter out excluded subtrees
                        dirs[:] = [d for d in dirs if not self._is_excluded(os.path.join(root, d))]
                        for fname in files:
                            if not self.running:
                                return
                            fpath = os.path.join(root, fname)
                            if self._is_excluded(fpath):
                                continue
                            try:
                                stat = os.stat(fpath)
                                mtime, size = stat.st_mtime, stat.st_size
                                with self._cache_lock:
                                    cached = self._scanned_cache.get(fpath)
                                    if cached and cached[0] == mtime and cached[1] == size:
                                        continue
                                    self._scanned_cache[fpath] = (mtime, size)
                                self.on_file_detected(fpath)
                            except Exception:
                                pass
                except Exception:
                    pass

            for _ in range(self.periodic_interval):
                if not self.running:
                    break
                time.sleep(1)

    def start(self):
        """Starts real-time monitoring threads."""
        self.running = True

        # Start queue dispatcher thread
        disp_t = threading.Thread(target=self._queue_dispatcher, daemon=True, name="WatcherDispatcher")
        disp_t.start()
        self._threads.append(disp_t)

        # Start kernel directory event watcher for each watch path
        for p in self.watch_paths:
            t = threading.Thread(target=self._kernel_watch_worker, args=(p,), daemon=True, name=f"KernelWatch_{os.path.basename(p)}")
            t.start()
            self._threads.append(t)

        # Start periodic sweeper thread
        sweep_t = threading.Thread(target=self._periodic_sweeper, daemon=True, name="PeriodicSweeper")
        sweep_t.start()
        self._threads.append(sweep_t)

    def stop(self):
        """Stops all watcher threads."""
        self.running = False
