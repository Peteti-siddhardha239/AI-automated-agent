import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def ensure_dependency(module: str, package: str):
    try:
        __import__(module)
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", package], check=True)


def main():
    ensure_dependency("webview", "pywebview")
    ensure_dependency("PyInstaller", "pyinstaller")

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--onefile",
        "--windowed",
        "--clean",
        "--noconfirm",
        "--name",
        "GeminiAIAgent",
        "--distpath",
        str(ROOT / "dist"),
        "--workpath",
        str(ROOT / "build"),
        "--specpath",
        str(ROOT),
        "--collect-all",
        "webview",
        "--hidden-import",
        "webview",
        "--add-data",
        f"{ROOT / 'static'};static",
        str(ROOT / "run.py"),
    ]

    print("Building desktop executable...")
    subprocess.run(cmd, cwd=str(ROOT), check=True)
    exe_path = ROOT / "dist" / "GeminiAIAgent.exe"
    print(f"Executable created: {exe_path}")


if __name__ == "__main__":
    main()
