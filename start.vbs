' Silent VBScript background launcher for Sentinel Antivirus Agent
' Runs pythonw.exe completely invisible: 0 console window, 0 taskbar icon.

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strAgentScript = strScriptDir & "\agent_core.py"

' Run with pythonw.exe (window style 0 = hidden, waitOnReturn = false)
objShell.CurrentDirectory = strScriptDir
objShell.Run "pythonw.exe """ & strAgentScript & """", 0, False
