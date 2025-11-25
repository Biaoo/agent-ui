# Agno Agents Development Guide

> 本文档定义了在本项目中开发 Agno Agent 的标准规范和最佳实践。

## 目录

- [Agent 目录结构](#agent-目录结构)
- [Agent 开发规范](#agent-开发规范)
- [开发流程](#开发流程)
- [最佳实践](#最佳实践)
- [Agent 配置模式](#agent-配置模式)
- [测试规范](#测试规范)

## Agent 目录结构

### 标准结构

每个 Agent 应该创建独立的文件夹，包含以下文件：

```
src/agents/
├── chat_agent/
│   ├── __init__.py          # Agent 导出
│   ├── agent.py             # Agent 核心配置
│   ├── README.md            # Agent 文档
│   └── prompts.py           # 提示词和指令（可选）
├── search_agent/
│   ├── __init__.py
│   ├── agent.py
│   └── README.md
├── README.md                # 所有 Agent 的概览
└── AGENTS.md               # 本文档：Agent 开发规范
```

### 文件职责说明

#### `__init__.py` - Agent 导出层

- 导出 Agent 实例
- 提供简单的使用接口
- 最小化配置逻辑

**示例**：

```python
"""Chat Agent - Simple conversational agent."""

from .agent import chat_agent

__all__ = ["chat_agent"]
```

#### `agent.py` - Agent 核心配置层

- 模型初始化
- Agent 实例创建
- 工具集成
- 核心配置

**示例**：

```python
"""Chat Agent core configuration."""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ...config.model_config import qwen_model_config

# Initialize model
model = OpenAIChat(
    id=qwen_model_config.model_name,
    api_key=qwen_model_config.api_key,
    base_url=qwen_model_config.base_url,
)

# Fix role mapping
model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

# Create agent
chat_agent = Agent(
    name="ChatAgent",
    model=model,
    instructions="You are a helpful AI assistant.",
    markdown=True,
)
```

#### `prompts.py` - 提示词管理层（可选）

- 存储系统指令
- 管理提示词模板
- 便于维护和版本控制

**示例**：

```python
"""Prompts and instructions for Search Agent."""

SYSTEM_INSTRUCTIONS = """You are a helpful search assistant.

Your responsibilities:
1. Search for relevant information
2. Use appropriate tools
3. Provide accurate and well-sourced answers

Guidelines:
- Always verify data sources
- Explain technical terms
- Cite sources properly
"""

HITL_INSTRUCTIONS = """HUMAN-IN-THE-LOOP STRATEGY:

Use ask_user_question when:
- Query is ambiguous
- Multiple valid options exist
- Need to narrow down results
"""

# Combined instructions
FULL_INSTRUCTIONS = f"{SYSTEM_INSTRUCTIONS}\n\n{HITL_INSTRUCTIONS}"
```

### 命名规范

- **文件夹名**: 使用小写字母和下划线，如 `chat_agent`, `search_agent`
- **Agent 实例名**: 使用描述性名称，如 `chat_agent`, `search_agent`
- **类名**: 如果需要自定义类，使用 PascalCase，如 `ChatAgent`

## Agent 开发规范

### 1. 基本结构模板

每个 Agent 文件应包含以下部分：

```python
"""
{Agent Name} - Brief description.

Detailed explanation of what this agent does and its main capabilities.
"""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ..config.model_config import qwen_model_config, qwen_max_config
from ..tools.your_tool import your_tool
from agno.utils.log import agent_logger

# Initialize model
model = OpenAIChat(
    id=qwen_model_config.model_name,
    api_key=qwen_model_config.api_key,
    base_url=qwen_model_config.base_url,
)

# Fix role mapping for Qwen API
model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

# Create agent instance
your_agent = Agent(
    name="YourAgent",
    model=model,
    tools=[your_tool],
    instructions="""Your agent's system instructions here.

    Be specific about:
    - Agent's role and expertise
    - How to use available tools
    - Response format and style
    - Any domain-specific guidelines
    """,
    markdown=True,
    stream_events=True,
    store_events=True,
    events_to_skip=[],
)
```

### 2. 模型配置

#### 选择合适的模型

根据 Agent 的复杂度和需求选择模型：

```python
# 基础对话 - 使用 qwen_model_config (qwen-plus)
from ..config.model_config import qwen_model_config

model = OpenAIChat(
    id=qwen_model_config.model_name,
    api_key=qwen_model_config.api_key,
    base_url=qwen_model_config.base_url,
)
```

```python
# 复杂推理 - 使用 qwen_max_config (qwen-max)
from ..config.model_config import qwen_max_config

model = OpenAIChat(
    id=qwen_max_config.model_name,
    api_key=qwen_max_config.api_key,
    base_url=qwen_max_config.base_url,
    extra_body={"enable_thinking": True}  # 启用思考链
)
```

#### 必需的角色映射

所有使用 Qwen API 的 Agent 都必须包含角色映射：

```python
model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}
```

### 3. Agent 参数配置

#### 核心参数

```python
Agent(
    name="AgentName",              # Agent 名称（必需）
    model=model,                    # 模型实例（必需）
    tools=[tool1, tool2],          # 工具列表（可选）
    instructions="...",             # 系统指令（强烈推荐）
    markdown=True,                  # 启用 Markdown 格式
    stream_events=True,            # 启用事件流
    store_events=True,             # 存储事件
    events_to_skip=[],             # 不跳过任何事件
)
```

#### Instructions 编写指南

`instructions` 是 Agent 行为的核心，应该：

1. **明确角色定位**

   ```python
   instructions="""You are a helpful search assistant.
   Your task is to help users find accurate information.
   """
   ```

2. **说明工具使用**

   ```python
   instructions="""You have access to:
   - web_search: For searching the web
   - ask_user_question: For clarifying user intent

   Use ask_user_question when the query is ambiguous.
   """
   ```

3. **定义响应风格**

   ```python
   instructions="""Response Guidelines:
   - Be professional and precise
   - Provide data sources
   - Explain technical terms
   - Use markdown formatting
   """
   ```

4. **包含领域知识**

   ```python
   instructions="""Search Guidelines:
   - Always verify data sources
   - Cite sources properly
   - Provide multiple perspectives when relevant
   """
   ```

### 4. 工具集成

#### 单个工具

```python
from ..tools.tavily import tavily_tool

agent = Agent(
    tools=[tavily_tool],
    instructions="Use web search when you need current information."
)
```

#### 多个工具

```python
from ..tools.tavily import tavily_tool
from ..tools.ask_user_question import ask_user_question_tool

agent = Agent(
    tools=[
        tavily_tool,
        ask_user_question_tool,
    ],
    instructions="""Use tavily_tool for web searches.
    Use ask_user_question when user intent is unclear.
    """
)
```

#### Human-in-the-Loop (HITL) Agent

如果 Agent 需要用户交互：

```python
from ..tools.ask_user_question import ask_user_question_tool
from ..tools.user_control_flow import collect_user_feedback_tool

agent = Agent(
    tools=[
        your_main_tool,
        ask_user_question_tool,      # 结构化问题
        collect_user_feedback_tool,   # 开放式反馈
    ],
    instructions="""HUMAN-IN-THE-LOOP STRATEGY:

    Use ask_user_question when:
    - User query is ambiguous
    - Multiple valid options exist
    - Need to narrow down results

    Use collect_user_feedback when:
    - Need specific details
    - Require custom parameters
    - Follow-up questions

    CRITICAL: Always include ALL required fields when using ask_user_question:
    - question: The question text
    - header: Short label (max 12 chars)
    - options: Array of {label, description}
    - multiSelect: true/false
    """
)
```

### 5. 文档字符串规范

```python
"""
{Agent Name} - {One-line description}.

{Detailed description explaining:
- What this agent does
- Main capabilities
- Use cases
- Any special requirements or limitations
}

Example:
    >>> from src.agents.your_agent import your_agent
    >>> response = your_agent.run("Your query here")
    >>> print(response.content)

Tools Used:
    - tool_name: Brief description

Configuration:
    - Model: qwen-plus / qwen-max
    - Streaming: Enabled
    - Event storage: Enabled
"""
```

### 6. 导入顺序

遵循 PEP 8 导入顺序：

```python
# 1. Agno 框架
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.utils.log import agent_logger

# 2. 项目内部模块
from ..config.model_config import qwen_model_config
from ..tools.your_tool import your_tool

# 3. 可选的标准库（如果需要）
import json
from typing import Optional
```

## 开发流程

### Step 1: 规划 Agent

回答以下问题：

- Agent 的主要用途是什么？
- 需要哪些工具？
- 是否需要 Human-in-the-Loop？
- 使用哪个模型？（qwen-plus vs qwen-max）
- 需要什么领域知识？
- 指令是否复杂？（决定是否需要 prompts.py）

### Step 2: 创建目录结构

```bash
# 进入 agents 目录
cd src/agents

# 创建 Agent 目录
mkdir -p your_agent

# 创建基础文件
touch your_agent/__init__.py
touch your_agent/agent.py
touch your_agent/README.md

# 如果需要管理复杂提示词
touch your_agent/prompts.py
```

### Step 3: 实现 agent.py

```python
"""Your Agent core configuration."""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ...config.model_config import qwen_model_config
from ...tools.your_tool import your_tool

# Initialize model
model = OpenAIChat(
    id=qwen_model_config.model_name,
    api_key=qwen_model_config.api_key,
    base_url=qwen_model_config.base_url,
)

# Fix role mapping for Qwen API
model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

# Create agent instance
your_agent = Agent(
    name="YourAgent",
    model=model,
    tools=[your_tool],
    instructions="Your detailed instructions here.",
    markdown=True,
    stream_events=True,
    store_events=True,
)
```

### Step 4: 创建 **init**.py

```python
"""Your Agent - Brief description."""

from .agent import your_agent

__all__ = ["your_agent"]
```

### Step 5: 编写 README.md

使用以下模板：

```markdown
# Your Agent

> Brief description of what this agent does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

### Basic Example

\```python
from src.agents.your_agent import your_agent

response = your_agent.run("Your query here")
print(response.content)
\```

### With Streaming

\```python
for chunk in your_agent.run("Your query", stream=True):
    print(chunk.content, end="")
\```

## Configuration

- **Model**: qwen-plus / qwen-max
- **Tools**: tool1, tool2
- **Streaming**: Enabled

## Examples

[Add specific examples here]

## Architecture

\```
your_agent/
├── __init__.py    # Agent export
├── agent.py       # Agent configuration
├── prompts.py     # Instructions (optional)
└── README.md      # This file
\```
```

### Step 6: 测试 Agent

```python
# 直接测试
from src.agents.your_agent import your_agent

response = your_agent.run("Test query")
print(response.content)

# 或创建测试文件
# tests/test_your_agent.py
def test_agent_basic():
    from src.agents.your_agent import your_agent
    response = your_agent.run("Hello")
    assert response is not None
```

### Step 7: 集成到服务器

在 `server.py` 中注册 Agent（如果需要）：

```python
from src.agents.your_agent import your_agent

agent_os.add_agent(your_agent)
```

### Step 8: 更新文档

在 `src/agents/README.md` 中添加 Agent 说明。

## 最佳实践

### ✅ DO（推荐做法）

1. **使用独立文件夹**

   ```
   # ✅ 正确：每个 Agent 有独立文件夹
   src/agents/
   ├── chat_agent/
   │   ├── __init__.py
   │   ├── agent.py
   │   └── README.md
   └── search_agent/
       ├── __init__.py
       ├── agent.py
       └── README.md
   ```

2. **分离关注点**

   ```python
   # ✅ 正确：agent.py 专注配置
   # agent.py
   from .prompts import FULL_INSTRUCTIONS

   your_agent = Agent(
       model=model,
       instructions=FULL_INSTRUCTIONS,
   )

   # prompts.py 管理指令
   FULL_INSTRUCTIONS = """Detailed instructions here..."""
   ```

3. **明确的系统指令**

   ```python
   # ✅ 正确：详细的系统指令
   instructions="""You are an expert in X.
   Your responsibilities:
   1. Analyze user queries
   2. Use appropriate tools
   3. Provide accurate responses

   Guidelines:
   - Always verify data sources
   - Explain technical terms
   - Use markdown formatting
   """
   ```

4. **合适的模型选择**

   ```python
   # ✅ 正确：简单任务用 qwen-plus
   from ..config.model_config import qwen_model_config

   # ✅ 正确：复杂推理用 qwen-max
   from ..config.model_config import qwen_max_config
   model = OpenAIChat(
       id=qwen_max_config.model_name,
       extra_body={"enable_thinking": True}
   )
   ```

5. **工具使用指导**

   ```python
   # ✅ 正确：明确说明何时使用工具
   instructions="""Use tavily_tool when:
   - User asks about current events
   - Need to search the web

   Use ask_user_question when:
   - Query is ambiguous
   - Multiple valid interpretations exist
   """
   ```

6. **完整的文档字符串**

   ```python
   # ✅ 正确：包含用途、工具、示例
   """
   Search Agent - Web search capabilities.

   This agent can search the web for current information
   using the Tavily search tool.

   Example:
       >>> response = search_agent.run("Latest AI news")
   """
   ```

7. **事件流配置**

   ```python
   # ✅ 正确：启用事件流用于调试和监控
   Agent(
       stream_events=True,
       store_events=True,
       events_to_skip=[],
   )
   ```

### ❌ DON'T（避免做法）

1. **单文件 Agent（不要）**

   ```python
   # ❌ 错误：所有代码在单个文件
   # src/agents/my_agent.py (不推荐)
   from agno.agent.agent import Agent
   ...
   ```

2. **空的或模糊的指令**

   ```python
   # ❌ 错误：指令太简单
   instructions="You are helpful."

   # ❌ 错误：没有指令
   Agent(name="Agent", model=model)
   ```

3. **忘记角色映射**

   ```python
   # ❌ 错误：Qwen API 必须设置角色映射
   model = OpenAIChat(id="qwen-plus", ...)
   agent = Agent(model=model)  # 会导致角色映射错误
   ```

4. **工具使用缺乏指导**

   ```python
   # ❌ 错误：有工具但没说明如何使用
   Agent(
       tools=[tool1, tool2, tool3],
       instructions="You are an assistant."  # 太简单
   )
   ```

5. **过度使用高级模型**

   ```python
   # ❌ 错误：简单聊天用 qwen-max（浪费成本）
   from ..config.model_config import qwen_max_config

   chat_agent = Agent(
       model=OpenAIChat(id=qwen_max_config.model_name, ...),
       instructions="Simple chat"
   )
   ```

6. **缺少文档**

   ```python
   # ❌ 错误：没有文档字符串
   from agno.agent.agent import Agent

   model = OpenAIChat(...)
   agent = Agent(name="Agent", model=model)
   ```

## Agent 配置模式

### 模式 1: 简单对话 Agent

适用于基础聊天、问答等简单任务。

```python
"""Simple Chat Agent."""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ..config.model_config import qwen_model_config

model = OpenAIChat(
    id=qwen_model_config.model_name,
    api_key=qwen_model_config.api_key,
    base_url=qwen_model_config.base_url,
)

model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

chat_agent = Agent(
    name="ChatAgent",
    model=model,
    instructions="You are a helpful AI assistant.",
    markdown=True,
)
```

### 模式 2: 工具增强 Agent

适用于需要外部工具的场景（搜索、API 调用等）。

```python
"""Search Agent with Tool Integration."""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ..config.model_config import qwen_model_config
from ..tools.tavily import tavily_tool

model = OpenAIChat(
    id=qwen_model_config.model_name,
    api_key=qwen_model_config.api_key,
    base_url=qwen_model_config.base_url,
)

model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

search_agent = Agent(
    name="SearchAgent",
    model=model,
    tools=[tavily_tool],
    instructions="""Use Tavily search tool to answer questions requiring current information.

    Guidelines:
    - Search when user asks about recent events or news
    - Provide source citations
    - Summarize search results clearly
    """,
    markdown=True,
    stream_events=True,
    store_events=True,
)
```

### 模式 3: 领域专家 Agent

适用于需要领域知识和复杂推理的场景。

```python
"""Domain Expert Agent with Advanced Reasoning."""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ..config.model_config import qwen_max_config
from ..tools.domain_tool import domain_tool

model = OpenAIChat(
    id=qwen_max_config.model_name,
    api_key=qwen_max_config.api_key,
    base_url=qwen_max_config.base_url,
    extra_body={"enable_thinking": True}  # 启用思考链
)

model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

expert_agent = Agent(
    name="ExpertAgent",
    model=model,
    tools=[domain_tool],
    instructions="""You are an expert in [Domain].

    Your expertise includes:
    - Deep knowledge of [topic 1]
    - Understanding of [topic 2]
    - Best practices for [topic 3]

    When answering:
    1. Analyze the question thoroughly
    2. Use domain_tool when needed
    3. Provide detailed explanations
    4. Cite relevant standards or research
    """,
    markdown=True,
    stream_events=True,
    store_events=True,
)
```

### 模式 4: Human-in-the-Loop Agent

适用于需要用户交互和澄清的场景。

```python
"""Interactive Agent with Human-in-the-Loop."""

from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from ..config.model_config import qwen_max_config
from ..tools.main_tool import main_tool
from ..tools.ask_user_question import ask_user_question_tool
from ..tools.user_control_flow import collect_user_feedback_tool

model = OpenAIChat(
    id=qwen_max_config.model_name,
    api_key=qwen_max_config.api_key,
    base_url=qwen_max_config.base_url,
    extra_body={"enable_thinking": True}
)

model.default_role_map = {
    "system": "system",
    "user": "user",
    "assistant": "assistant",
    "tool": "tool",
    "model": "assistant",
}

interactive_agent = Agent(
    name="InteractiveAgent",
    model=model,
    tools=[
        main_tool,
        ask_user_question_tool,
        collect_user_feedback_tool,
    ],
    instructions="""You are an interactive assistant that clarifies user intent.

    HUMAN-IN-THE-LOOP STRATEGY:

    1. ask_user_question - For structured choices:
       - Query is ambiguous
       - Multiple valid options
       - Need to narrow results

    2. collect_user_feedback - For open-ended input:
       - Need specific details
       - Custom parameters required
       - Follow-up clarification

    WHEN TO ASK:
    - Before: If query is too generic
    - During: If results are too broad
    - After: If quality concerns exist

    CRITICAL: When using ask_user_question, include ALL fields:
    - question (required)
    - header (required, max 12 chars)
    - options (required, array of {label, description})
    - multiSelect (required, true/false)
    """,
    markdown=True,
    stream_events=True,
    store_events=True,
)
```

## 测试规范

### 基础测试

```python
# tests/test_your_agent.py
from src.agents.your_agent import your_agent

def test_agent_basic_response():
    """Test basic agent functionality."""
    response = your_agent.run("Test query")
    assert response is not None
    assert hasattr(response, 'content')
    assert len(response.content) > 0

def test_agent_with_tool():
    """Test agent tool usage."""
    response = your_agent.run("Query that requires tool")
    # Verify tool was used
    assert "expected_tool_output" in response.content
```

### 交互测试

对于 HITL Agent，需要模拟用户输入：

```python
def test_hitl_agent():
    """Test Human-in-the-Loop agent."""
    # First call - should ask for clarification
    response1 = interactive_agent.run("Ambiguous query")
    # Check that ask_user_question was called

    # Simulate user answer and continue
    # (Specific implementation depends on Agno HITL mechanism)
```

## 常见问题

### Q: 何时使用 qwen-plus vs qwen-max？

**A:**

- **qwen-plus**: 简单对话、信息检索、基础推理
- **qwen-max**: 复杂推理、多步骤任务、需要思考链的场景

### Q: 如何调试 Agent？

**A:**

1. 启用事件流：`stream_events=True, store_events=True`
2. 使用 loguru 记录：`from agno.utils.log import agent_logger`
3. 查看工具调用：检查 `response.messages` 中的 tool calls
4. 测试单个工具：先单独测试工具，再集成到 Agent

### Q: Agent 不使用工具怎么办？

**A:**

1. 检查 `instructions` 是否明确说明何时使用工具
2. 确认工具的 `description` 和 `instructions` 清晰
3. 查看是否工具参数与 Agent 预期不匹配
4. 尝试在 instructions 中给出使用示例

### Q: 如何处理多语言？

**A:**
Qwen 模型原生支持中英文，在 instructions 中可以：

```python
instructions="""You are a bilingual assistant (中英文助手).
- Respond in the same language as the user
- 使用用户的语言回复
"""
```

## 资源链接

- [Agno 官方文档](https://docs.agno.ai/)
- [Agno Agent API](https://docs.agno.ai/agents)
- [Tool Development Guide](../tools/AGENTS.md)
- [Human-in-the-Loop Guide](../../../docs/guides/agno-develop/Human-in-the-loop.md)

---

**最后更新**: 2025-11-19
