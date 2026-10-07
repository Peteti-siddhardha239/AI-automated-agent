# 🤖 Gemini AI Studio & Autonomous System Automation Agent

An autonomous, full-stack **AI System Automation Agent** and Web Application built with a **Python FastAPI backend** and a pure **HTML5 / CSS3 / JavaScript frontend** powered by the official **Google GenAI SDK** (`google-genai`) and `gemini-3.8-flash`.

![Status](https://img.shields.io/badge/Status-Agentic%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.14+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688)
![Models](https://img.shields.io/badge/Models-Gemini%203.8%20Flash%20%7C%203.5%20Flash--Lite-orange)
![Agent Loop](https://img.shields.io/badge/Agent-Autonomous%20ReAct-purple)

---

## 🌟 Key Capabilities

### ⚡ Autonomous System Automation Agent
The agent can autonomously plan, execute, and verify operations directly on your computer:
1. **💻 PowerShell & Shell Command Execution (`execute_command`)**: Runs commands, diagnostics, scripts, and software tools.
2. **📖 File Reading (`read_file`)**: Reads any local file with line range indexing.
3. **✍️ File Writing & Editing (`write_file`)**: Creates scripts, configurations, and documents with auto-directory creation.
4. **📁 Directory Inspection (`list_directory`)**: Explores directories, sizes, timestamps, and item trees.
5. **🔍 File Search (`search_files`)**: Recursively finds files matching glob patterns or extensions.
6. **🔎 Content Search (`grep_search`)**: Searches for text or patterns across multiple files.
7. **📊 System Hardware & Health (`system_info`)**: Gathers Windows OS build, CPU model, RAM usage, and disk space across all drives.
8. **⚡ Process Monitoring & Control (`manage_processes`)**: Lists top memory/CPU-heavy processes or safely stops processes.
9. **🚀 Application Launcher (`launch_application`)**: Launches desktop software (Notepad, Calculator, VS Code, Explorer, browser).
10. **🌐 Web Fetcher (`fetch_web_content`)**: Retrieves clean text content from web pages.

### 🎨 Modern Interactive Web Interface
- **Mode Switcher**: Easily toggle between **🤖 Automated Agent** mode (full tool execution) and **💬 Pure Chat** mode.
- **Collapsible Tool Execution Cards**:
  - Live execution badge (Running ⏳ / Success ✅ / Failed ❌).
  - Terminal code box with line formatting and one-click **Copy Output**.
  - Execution runtime duration metrics.
- **Live Agent Step Banner**: Displays real-time planning and execution state.
- **Interactive Tools Drawer**: View documentation for all 10 registered system tools directly in the UI.
- **Persisted Session History**: Chat and multi-turn agent execution cards are saved locally in browser storage.
- **Glassmorphism Design**: Responsive layout, dark/light theme toggle, custom scrollbars, and voice-to-text dictation.
- **Instant Safe Demo Mode**: Works out of the box with safe local system diagnostics even before configuring a Gemini API key.

---

## 📁 Project Structure

```
c:\Users\simha\siddu\
├── app.py              # FastAPI server, agent streaming & system endpoints
├── agent.py            # ReAct autonomous agent loop with Gemini Function Calling
├── agent_tools.py      # 10 native Windows system automation tools
├── run.py              # Convenient one-click launcher script
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── static/             # Static web application files (served at /)
│   ├── index.html      # Responsive UI layout, modals, and prompt chips
│   ├── style.css       # Glassmorphism design, terminal styling & themes
│   └── app.js          # Event-driven SSE client & dynamic card rendering
└── README.md           # Documentation
```

---

## 🚀 Quick Start

### 1. (Optional) Configure your Gemini API Key
Get a free key from [Google AI Studio](https://aistudio.google.com/).
Either create a `.env` file:
```env
GEMINI_API_KEY=your_actual_api_key_here
```
*Or* paste it into the in-app **Settings (⚙️)** dialog in your browser.

### 2. Launch the Agent
Start the server using Python:
```powershell
py run.py
```
This runs in the faster default mode without hot reload. If you want development auto-reload while editing files, use:
```powershell
$env:RELOAD="true"; py run.py
```
*Or with uvicorn directly:*
```powershell
py -m uvicorn app:app --port 8000
```

### 3. Open in Browser
Visit:
```
http://localhost:8000
```

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the web interface (`index.html`) |
| `GET` | `/api/models` | Returns available Gemini models metadata |
| `GET` | `/api/status` | Returns system status, key presence, and registered tool count |
| `GET` | `/api/agent/tools` | Returns detailed catalog of all 10 system tools |
| `GET` | `/api/system/status` | Live host machine metrics (OS, CPU, RAM, Disks) |
| `POST` | `/api/chat/stream` | Streams real-time agent/chat SSE events (`text/event-stream`) |

---

## 📄 License
MIT
