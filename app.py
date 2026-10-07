import os
import json
import asyncio
from typing import List, Optional, Dict, Any
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from google import genai
from google.genai import types

import agent_tools
import agent

load_dotenv()

app = FastAPI(title="Gemini AI Studio & Automated Agent", version="2.5.0")

# Available Models powered by Antigravity
AVAILABLE_MODELS = [
    {
        "id": "gemini-3.8-flash-high",
        "name": "Gemini 3.8 Flash (High Reasoning)",
        "badge": "Antigravity Default",
        "description": "Fastest and best balanced model with deep reasoning and full system tool automation.",
    },
    {
        "id": "gemini-3.7-flash-high",
        "name": "Gemini 3.7 Flash (High)",
        "badge": "Antigravity",
        "description": "High performance multimodal reasoning and coding agent.",
    },
    {
        "id": "gemini-3.1-pro-high",
        "name": "Gemini 3.1 Pro (Deep Reasoning)",
        "badge": "Deep Thinking",
        "description": "Complex architectural design, deep analysis, and multi-step tasks.",
    },
    {
        "id": "claude-sonnet-4-6",
        "name": "Claude Sonnet 4.6 (Thinking)",
        "badge": "Anthropic",
        "description": "Advanced coding, nuanced logic, and comprehensive agent execution.",
    },
]


class ChatMessage(BaseModel):
    role: str = Field(..., description="user or assistant / model")
    content: str = Field(..., description="The message text content")


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model: str = "gemini-3.8-flash-high"
    mode: str = "agent"  # 'agent' or 'chat'
    system_instruction: Optional[str] = None
    temperature: float = 0.5
    max_steps: int = 10
    api_key: Optional[str] = None


@app.get("/api/models")
async def get_models():
    return {"models": AVAILABLE_MODELS}


@app.get("/api/status")
async def get_status():
    server_key = os.environ.get("GEMINI_API_KEY", "").strip()
    has_agy = os.path.exists(agent.AGY_EXE)
    return {
        "status": "online",
        "engine": "antigravity" if has_agy else ("gemini_api" if server_key else "unavailable"),
        "has_server_api_key": bool(server_key),
        "has_antigravity": has_agy,
        "connected": bool(has_agy or server_key),
        "default_model": "gemini-3.8-flash-high",
        "agent_ready": True,
        "tools_count": len(agent_tools.ALL_TOOLS),
    }


@app.get("/api/agent/tools")
async def get_agent_tools():
    """Returns the list and descriptions of all registered system automation tools."""
    return {"tools": agent_tools.TOOL_METADATA}


@app.get("/api/system/status")
async def get_system_status():
    """Returns real-time host system metrics (OS, CPU, memory, disks)."""
    return agent_tools.system_info()


@app.post("/api/chat/stream")
async def chat_stream(req: ChatRequest):
    api_key = (req.api_key or os.environ.get("GEMINI_API_KEY", "")).strip()
    messages_dicts = [{"role": m.role, "content": m.content} for m in req.messages]

    # Route to Agent Mode (default)
    if req.mode == "agent":
        return StreamingResponse(
            agent.run_agent_loop(
                messages=messages_dicts,
                model=req.model,
                api_key=api_key,
                system_instruction=req.system_instruction,
                temperature=req.temperature,
                max_steps=req.max_steps,
            ),
            media_type="text/event-stream",
        )

    # Pure Chat Mode: If Antigravity is available, use it without needing API key!
    if os.path.exists(agent.AGY_EXE) and not api_key:
        return StreamingResponse(
            agent.stream_antigravity_agent(
                messages=messages_dicts,
                model=req.model,
                system_instruction=req.system_instruction,
            ),
            media_type="text/event-stream",
        )

    # If external API key provided
    if api_key:
        async def chat_event_generator():
            try:
                client = genai.Client(api_key=api_key)
                contents = [
                    types.Content(
                        role="model" if m.role in ("model", "assistant") else "user",
                        parts=[types.Part.from_text(text=m.content)],
                    )
                    for m in req.messages
                ]
                sdk_model = req.model.replace("-high", "").replace("-medium", "").replace("-low", "")
                if "claude" in sdk_model or "gpt" in sdk_model:
                    sdk_model = "gemini-3.8-flash"

                response_stream = client.models.generate_content_stream(
                    model=sdk_model,
                    contents=contents,
                )
                for chunk in response_stream:
                    if chunk.text:
                        yield f"data: {json.dumps({'type': 'text', 'text': chunk.text})}\n\n"
                        await asyncio.sleep(0.005)
                yield f"data: {json.dumps({'type': 'done', 'done': True})}\n\n"
            except Exception as e:
                err_msg = f"\n\n**Error from Gemini API:** {str(e)}"
                yield f"data: {json.dumps({'type': 'text', 'text': err_msg})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'done': True, 'error': str(e)})}\n\n"

        return StreamingResponse(
            chat_event_generator(),
            media_type="text/event-stream",
        )

    # Otherwise safe fallback demo
    return StreamingResponse(
        agent.stream_demo_agent(req.messages[-1].content if req.messages else "Hello"),
        media_type="text/event-stream",
    )


# Mount static directory for frontend
static_dir = Path(__file__).parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
