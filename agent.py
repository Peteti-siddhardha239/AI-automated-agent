import os
import re
import json
import asyncio
import time
import shutil
from typing import List, Dict, Any, Optional, AsyncGenerator

from google import genai
from google.genai import types

import agent_tools

AGY_EXE = (
    os.environ.get("ANTIGRAVITY_AGENTAPI_EXE", "").strip()
    or shutil.which("agy")
    or os.path.join(os.path.expanduser("~"), ".gemini", "bin", "agy.exe")
)

AGENT_SYSTEM_INSTRUCTION = """You are an Autonomous AI System Automation Agent running on the user's Windows computer.
You have direct access to a comprehensive suite of system tools:
- `execute_command(command, cwd, timeout)`: Execute PowerShell / CMD commands (diagnostics, scripts, system tools, CLI utilities).
- `read_file(path, start_line, end_line)`: Read file contents from the local filesystem.
- `write_file(path, content, mode)`: Create or update files/scripts on the filesystem.
- `list_directory(path, max_depth)`: Inspect directories, view file sizes and timestamps.
- `search_files(path, pattern)`: Recursively search for files by pattern or extension.
- `grep_search(path, query, extension)`: Search for text within files.
- `system_info()`: Check OS specs, CPU, RAM, disk space, and user info.
- `manage_processes(action, filter_name, pid)`: Inspect running processes or terminate a process.
- `launch_application(app, args)`: Launch desktop applications (Notepad, Calculator, Chrome, Explorer, etc.).
- `fetch_web_content(url)`: Fetch clean text from a web URL.

EXECUTION INSTRUCTIONS:
1. When asked to perform any task, analyze what needs to be done and immediately call the appropriate tool(s).
2. You can chain multiple tool calls across steps to solve complex multi-step problems (e.g. inspect files -> write script -> execute script -> verify output).
3. Always inspect tool output. If a command or tool returns an error, analyze the error and try a different approach or inform the user.
4. Keep the user informed with clear, concise, well-structured markdown summaries of what actions you took and the results.
5. Be autonomous, accurate, and safe.
"""


async def stream_antigravity_agent(
    messages: List[Dict[str, str]],
    model: str = "gemini-3.8-flash-high",
    system_instruction: Optional[str] = None,
    cwd: Optional[str] = None,
) -> AsyncGenerator[str, None]:
    """
    Executes the autonomous agent directly through the local Antigravity (agy) engine.
    Requires no external API keys, runs natively with full tool-calling and streaming.
    """
    work_dir = cwd or os.getcwd()

    history_lines = []
    for m in messages[:-1]:
        role = "User" if m.get("role") == "user" else "Assistant"
        history_lines.append(f"{role}: {m.get('content', '')}")
    last_user_msg = messages[-1].get("content", "") if messages else "Hello"

    prompt = ""
    if system_instruction:
        prompt += f"System: {system_instruction}\n\n"
    if history_lines:
        prompt += "\n\n".join(history_lines) + "\n\n"
    prompt += f"User: {last_user_msg}"

    yield f"data: {json.dumps({'type': 'status', 'status': 'Antigravity Agent analyzing request...'})}\n\n"
    await asyncio.sleep(0.1)

    # Normalize model identifier
    agy_model = model
    if not any(model.endswith(s) for s in ["-high", "-medium", "-low"]):
        if "pro" in model:
            agy_model = "gemini-3.1-pro-high"
        elif "claude" in model:
            agy_model = "claude-sonnet-4-6"
        else:
            agy_model = "gemini-3.8-flash-high"

    cmd = [
        AGY_EXE,
        "--dangerously-skip-permissions",
        "--output-format", "stream-json",
        "--model", agy_model,
        "--print", prompt,
    ]

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=work_dir,
        )

        has_streamed_text = False
        step_counter = 0

        while True:
            line_bytes = await proc.stdout.readline()
            if not line_bytes:
                break
            line_str = line_bytes.decode("utf-8", errors="replace").strip()
            if not line_str:
                continue

            try:
                event_data = json.loads(line_str)
                event_type = event_data.get("event")

                if event_type == "step_update":
                    update = event_data.get("step_update", {})
                    step_type = update.get("step_type")
                    state = update.get("state")

                    if step_type == "tool":
                        tool_name = update.get("tool_name", "tool")
                        tool_info = update.get("tool_info", {})

                        if state == "ACTIVE":
                            step_counter += 1
                            yield f"data: {json.dumps({'type': 'status', 'status': f'Step {step_counter}: Calling {tool_name}...'})}\n\n"
                            yield f"data: {json.dumps({'type': 'tool_call', 'step': step_counter, 'name': tool_name, 'args': tool_info.get('parameters', {})})}\n\n"

                        elif state == "DONE":
                            tool_out = tool_info.get("output", "") or tool_info.get("result", "") or "Completed"
                            duration = int(update.get("duration_seconds", 0) * 1000)
                            yield f"data: {json.dumps({'type': 'tool_result', 'step': step_counter, 'name': tool_name, 'result': tool_out, 'status': 'success', 'duration_ms': duration})}\n\n"

                    elif step_type == "agent_response":
                        text_delta = update.get("text_delta")
                        if text_delta:
                            has_streamed_text = True
                            yield f"data: {json.dumps({'type': 'text', 'text': text_delta})}\n\n"

                elif event_type == "result":
                    res = event_data.get("result", {})
                    final_resp = res.get("response", "")
                    if not has_streamed_text and final_resp:
                        yield f"data: {json.dumps({'type': 'text', 'text': final_resp})}\n\n"

            except Exception:
                continue

        await proc.wait()

    except Exception as e:
        yield f"data: {json.dumps({'type': 'text', 'text': f'\n\n❌ **Antigravity Execution Error:** {str(e)}'})}\n\n"

    yield f"data: {json.dumps({'type': 'done', 'done': True})}\n\n"


async def stream_demo_agent(last_user_message: str) -> AsyncGenerator[str, None]:
    """
    Reports that task execution is unavailable when no agent backend is configured.
    """
    yield f"data: {json.dumps({'type': 'status', 'status': 'Agent backend unavailable'})}\n\n"
    message = (
        "**Task not executed.** No AI backend is configured. Add a Gemini API key in Settings, "
        "or install Antigravity and set `ANTIGRAVITY_AGENTAPI_EXE`, then restart the app.\n\n"
        f"Your request was: {last_user_message}"
    )
    yield f"data: {json.dumps({'type': 'text', 'text': message})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'done': True})}\n\n"


async def run_agent_loop(
    messages: List[Dict[str, str]],
    model: str = "gemini-3.8-flash-high",
    api_key: Optional[str] = None,
    system_instruction: Optional[str] = None,
    temperature: float = 0.5,
    max_steps: int = 10,
) -> AsyncGenerator[str, None]:
    """
    Executes the autonomous agent reasoning & action loop.
    Prioritizes the local Antigravity engine (no API key needed),
    or uses the direct Google GenAI SDK if an API key is provided.
    """
    key = (api_key or os.environ.get("GEMINI_API_KEY", "")).strip()

    # 1. If Antigravity (You!) is available, use it directly!
    if os.path.exists(AGY_EXE) and not key:
        async for chunk in stream_antigravity_agent(
            messages=messages,
            model=model,
            system_instruction=system_instruction,
        ):
            yield chunk
        return

    # 2. If no API key and no Antigravity CLI, use interactive demo
    if not key:
        last_user_msg = messages[-1].get("content", "") if messages else "Hello"
        async for chunk in stream_demo_agent(last_user_msg):
            yield chunk
        return

    # 3. Use direct google-genai SDK if API key is provided
    try:
        client = genai.Client(api_key=key)
        tools = list(agent_tools.ALL_TOOLS.values())

        contents: List[types.Content] = []
        for msg in messages:
            role = "model" if msg.get("role") in ("model", "assistant") else "user"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=msg.get("content", ""))],
                )
            )

        full_system_instruction = AGENT_SYSTEM_INSTRUCTION
        if system_instruction:
            full_system_instruction += f"\n\nAdditional Instructions:\n{system_instruction}"

        # Clean model name for google-genai SDK
        sdk_model = model.replace("-high", "").replace("-medium", "").replace("-low", "")
        if "claude" in sdk_model or "gpt" in sdk_model:
            sdk_model = "gemini-3.8-flash"

        config = types.GenerateContentConfig(
            system_instruction=full_system_instruction,
            temperature=temperature,
            tools=tools,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        )

        step_count = 0

        while step_count < max_steps:
            step_count += 1
            yield f"data: {json.dumps({'type': 'status', 'status': f'Step {step_count}: Planning next action...'})}\n\n"

            response = await asyncio.to_thread(
                client.models.generate_content,
                model=sdk_model,
                contents=contents,
                config=config,
            )

            function_calls = response.function_calls

            if function_calls:
                if response.candidates and response.candidates[0].content:
                    contents.append(response.candidates[0].content)

                for call in function_calls:
                    call_name = call.name
                    call_args = call.args or {}

                    yield f"data: {json.dumps({'type': 'tool_call', 'step': step_count, 'name': call_name, 'args': call_args})}\n\n"

                    func = agent_tools.ALL_TOOLS.get(call_name)
                    if not func:
                        tool_result = {"status": "error", "error": f"Unknown tool: {call_name}"}
                    else:
                        try:
                            tool_result = await asyncio.to_thread(func, **call_args)
                        except Exception as ex:
                            tool_result = {"status": "error", "error": str(ex)}

                    duration = tool_result.get("duration_ms", 0) if isinstance(tool_result, dict) else 0
                    yield f"data: {json.dumps({'type': 'tool_result', 'step': step_count, 'name': call_name, 'result': tool_result, 'status': tool_result.get('status', 'success') if isinstance(tool_result, dict) else 'success', 'duration_ms': duration})}\n\n"

                    resp_part = types.Part.from_function_response(
                        name=call_name,
                        response={"result": tool_result},
                    )
                    contents.append(
                        types.Content(role="tool", parts=[resp_part])
                    )

                await asyncio.sleep(0.05)

            else:
                final_text = response.text or ""
                if final_text:
                    words = final_text.split(" ")
                    for i, w in enumerate(words):
                        suffix = " " if i < len(words) - 1 else ""
                        yield f"data: {json.dumps({'type': 'text', 'text': w + suffix})}\n\n"
                        await asyncio.sleep(0.008)
                break

        if step_count >= max_steps:
            yield f"data: {json.dumps({'type': 'text', 'text': '\n\n*(Reached maximum automated agent step limit)*'})}\n\n"

        yield f"data: {json.dumps({'type': 'done', 'done': True})}\n\n"

    except Exception as e:
        err_str = str(e)
        yield f"data: {json.dumps({'type': 'text', 'text': f'\n\n❌ **Agent Execution Error:** {err_str}'})}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'done': True, 'error': err_str})}\n\n"
