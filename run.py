import os
import sys
import threading
import webbrowser
import socket
import urllib.request
from dotenv import load_dotenv

# Ensure console supports UTF-8 on Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

load_dotenv()


def is_port_in_use(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
            return False
        except OSError:
            return True


def is_server_running(url: str, timeout: float = 1.5) -> bool:
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status < 500
    except Exception:
        return False


def find_available_port(host: str, preferred_port: int, max_tries: int = 20) -> int:
    for port in range(preferred_port, preferred_port + max_tries):
        if not is_port_in_use(host, port):
            return port
    raise RuntimeError(f"No free port found in range {preferred_port}-{preferred_port + max_tries - 1} for host {host}.")


def ensure_desktop_runtime():
    try:
        import webview
        return webview
    except ImportError:
        print("[!] pywebview not found. Installing desktop runtime...")
        try:
            import subprocess

            subprocess.check_call([sys.executable, "-m", "pip", "install", "pywebview>=4.4.0"])
            import webview
            print("[*] pywebview installed successfully.")
            return webview
        except Exception as exc:
            print(f"[!] Failed to install pywebview automatically: {exc}")
            raise


def start_server(host: str, port: int, reload_enabled: bool):
    import uvicorn

    config = uvicorn.Config(
        "app:app",
        host=host,
        port=port,
        reload=reload_enabled,
        log_level="warning",
    )
    server = uvicorn.Server(config)
    server.run()


def main():
    host = os.environ.get("HOST", "127.0.0.1")
    preferred_port = int(os.environ.get("PORT", 8000))
    reload_enabled = os.environ.get("RELOAD", "false").lower() in {"1", "true", "yes", "on"}

    try:
        port = find_available_port(host, preferred_port)
    except RuntimeError as exc:
        print(f"[!] {exc}")
        sys.exit(1)

    url = f"http://{host}:{port}"

    if is_server_running(url):
        print(f"[!] A server is already responding at {url}. Reusing the existing instance.")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        return

    if port != preferred_port:
        print(f"[!] Port {preferred_port} is already in use; using {port} instead.")

    print("=" * 60)
    print("  [*] Gemini AI Desktop Agent")
    print(f"  [>] Desktop app URL: {url}")
    print(f"  [>] Hot reload: {'ON' if reload_enabled else 'OFF'}")
    print("  [>] Starting local backend server...")
    print("  [!] Close the app window to exit")
    print("=" * 60)

    try:
        try:
            webview = ensure_desktop_runtime()

            backend_thread = threading.Thread(
                target=start_server,
                args=(host, port, reload_enabled),
                daemon=True,
            )
            backend_thread.start()

            webview.create_window(
                "Gemini AI Agent",
                url,
                width=1400,
                height=900,
                resizable=True,
                min_size=(1100, 700),
                text_select=False,
            )
            webview.start(debug=False, gui="default")
            print(f"[>] Window launched successfully: {url}")
            return
        except ImportError:
            print("[!] pywebview unavailable; opening the app in the browser instead.")

        backend_thread = threading.Thread(
            target=start_server,
            args=(host, port, reload_enabled),
            daemon=True,
        )
        backend_thread.start()

        try:
            webbrowser.open(url)
        except Exception:
            pass

        print(f"[>] Opened in browser: {url}")
        threading.Event().wait()

    except KeyboardInterrupt:
        print("\n[*] Desktop app stopped.")
    except Exception as e:
        print(f"Error starting desktop app: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()