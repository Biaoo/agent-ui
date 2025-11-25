# Agno Tools Development Guide

> 本文档定义了在本项目中开发 Agno 工具的标准规范和最佳实践。

## 目录

- [工具目录结构](#工具目录结构)
- [工具开发规范](#工具开发规范)
- [开发流程](#开发流程)
- [最佳实践](#最佳实践)
- [Human-in-the-Loop 工具](#human-in-the-loop-工具)
- [性能优化](#性能优化)

## 工具目录结构

### 标准结构

每个工具应该创建独立的文件夹，包含以下文件：

```
src/tools/
├── your_tool_name/
│   ├── __init__.py          # 工具导出和 @tool 装饰器包装
│   ├── core.py              # 核心实现逻辑（主函数）
│   ├── README.md            # 工具文档
│   ├── example.py           # 使用示例（可选）
│   └── other_modules.py     # 其他辅助模块（可选）
├── README.md                # 所有工具的概览
└── AGENTS.md               # 本文档：工具开发规范
```

### 文件职责说明

#### `__init__.py` - 工具接口层

- 导入核心实现函数
- 使用 `@tool` 装饰器包装主函数
- 导出所有公共 API
- 最小化业务逻辑

**示例**：

```python
from agno.tools import tool
from .core import your_function

@tool(name="your_tool", description="...")
def your_tool(param: str) -> str:
    """Tool wrapper that delegates to core implementation."""
    return your_function(param)

# Export for direct use
__all__ = ["your_tool", "your_function"]
```

#### `core.py` - 核心实现层

- 包含主要业务逻辑
- 可以直接调用，不依赖 `@tool` 装饰器
- 便于测试和复用
- 包含完整的类型提示和文档字符串

**示例**：

```python
from typing import Any, Dict

def your_function(param: str) -> str:
    """
    Core implementation that can be called directly.

    Args:
        param: Description

    Returns:
        Result description
    """
    # Business logic here
    return result
```

## 工具开发规范

### 1. 命名规范

- **文件夹名**: 使用小写字母和下划线，如 `ask_user_question`
- **主函数名**: 使用描述性名称，如 `ask_user_question`
- **工具函数名**: 在主函数名后加上后缀 `_tool`，如 `ask_user_question_tool`
- **类名**: 使用 PascalCase，如 `QuestionOption`

### 2. 代码分层原则

#### 核心层（core.py）

```python
# ✅ 正确：核心实现可以独立调用
def process_data(data: str) -> Dict[str, Any]:
    """Pure business logic."""
    result = {"processed": data.upper()}
    return result
```

#### 工具层（**init**.py）

```python
# ✅ 正确：工具层只是简单包装
from agno.tools import tool
from .core import process_data

@tool(name="process_data")
def process_data_tool(data: str) -> str:
    """Tool wrapper."""
    result = process_data(data)
    return json.dumps(result)
```

### 3. 类型提示要求

所有函数必须包含完整的类型提示：

```python
from typing import List, Dict, Any, Optional

def my_function(
    required_param: str,
    optional_param: Optional[int] = None,
    list_param: List[str] = None
) -> Dict[str, Any]:
    """Function with complete type hints."""
    pass
```

### 4. 文档字符串规范

使用 Google 风格的文档字符串：

```python
def function_name(param1: str, param2: int) -> str:
    """
    Brief description of what the function does.

    Longer description with more details if needed.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value

    Raises:
        ValueError: When validation fails

    Example:
        >>> result = function_name("test", 42)
        >>> print(result)
        'processed: test'
    """
    pass
```

### 5. 测试规范

测试文件应该：

- 放在 `tests/` 目录
- 命名为 `test_<tool_name>.py`
- **直接调用核心实现函数**，而不是 `.entrypoint`
- 包含正常和异常情况的测试

**示例**：

```python
# ✅ 正确：直接调用核心函数
from src.tools.your_tool import your_function

def test_function():
    result = your_function("input")
    assert result == "expected"

# ❌ 错误：不要使用 .entrypoint
from src.tools.your_tool import your_tool

def test_function():
    result = your_tool.entrypoint("input")  # 不推荐
```

### 6. 错误处理

所有工具应该：

- 验证输入参数
- 使用 try-except 捕获异常
- 返回结构化的错误信息
- 使用 loguru 记录错误

**示例**：

```python
from loguru import logger
import json

def my_function(param: str) -> str:
    try:
        # Validate input
        if not param:
            raise ValueError("param is required")

        # Business logic
        result = process(param)

        return json.dumps({"status": "success", "data": result})

    except Exception as e:
        logger.error(f"Function failed: {e}", exc_info=True)
        return json.dumps({"status": "failed", "error": str(e)})
```

### 7. @tool 装饰器使用

常用参数：

```python
@tool(
    name="tool_name",                    # 工具名称（可选，默认使用函数名）
    description="What this tool does",   # 简短描述
    instructions="Detailed usage...",    # 详细使用说明（给 LLM 的指导）
    requires_user_input=True,            # 需要用户输入（HITL）
    user_input_fields=["field_name"],    # 指定需要用户输入的字段
    requires_confirmation=True,          # 需要用户确认
    external_execution=True,             # 外部执行
    show_result=True,                    # 显示结果（默认 True）
    stop_after_tool_call=True,          # 工具调用后停止
    cache_results=True,                  # 缓存结果
    cache_ttl=3600                       # 缓存过期时间（秒）
)
def my_tool(param: str) -> str:
    """Tool implementation."""
    pass
```

**重要参数说明**：

- `name`: 工具名称，Agent 调用时使用
- `description`: 简短描述（1-2 句话），帮助 LLM 理解工具用途
- `instructions`: **详细的使用说明**（给 LLM 的指导），包括：
  - 何时使用此工具
  - 参数说明和使用示例
  - 注意事项和最佳实践
  - 常见错误和避免方法
- `requires_user_input`: 启用 Human-in-the-Loop，工具会暂停等待用户输入
- `user_input_fields`: 指定哪些字段需要用户提供

> 💡 **提示**: `instructions` 参数非常重要，它直接影响 LLM 如何使用工具。参考 `tavily.py` 中的详细示例。

## 开发流程

### Step 1: 规划工具

- 明确工具的功能和用途
- 设计输入输出接口
- 确定是否需要 Human-in-the-Loop

### Step 2: 创建目录结构

```bash
# 进入 tools 目录
cd src/tools

# 创建工具目录
mkdir -p your_tool_name

# 创建基础文件
touch your_tool_name/__init__.py
touch your_tool_name/core.py

# 使用脚本生成 README 模板
./dev-utils/create-tool-readme.sh your_tool_name ./your_tool_name/README.md

# 根据需要创建其他文件
touch your_tool_name/example.py    # 示例代码（可选）
touch your_tool_name/helpers.py    # 辅助函数（可选）
touch your_tool_name/config.py     # 配置文件（可选）
```

### Step 3: 实现核心逻辑（core.py）

```python
from typing import Any, Dict

def your_function(param: str) -> str:
    """
    Core implementation with full documentation.

    Args:
        param: Description

    Returns:
        Result description
    """
    # Implementation here
    return result
```

### Step 4: 创建工具包装（**init**.py）

```python
from agno.tools import tool
from .core import your_function

@tool(name="your_tool", description="...")
def your_tool(param: str) -> str:
    """Tool wrapper."""
    return your_function(param)

__all__ = ["your_tool", "your_function"]
```

### Step 5: 编写测试

```python
# tests/test_your_tool.py
from src.tools.your_tool import your_function

def test_basic_functionality():
    result = your_function("input")
    assert result == "expected"

def test_error_handling():
    result = your_function("")
    # Check error handling
```

### Step 6: 编写文档

在 `README.md` 中包含：

- 工具概述
- 功能特性
- API 参考
- 使用示例
- 故障排除

### Step 7: 更新工具列表

在 `src/tools/README.md` 中添加新工具的说明。

## 最佳实践

### ✅ DO（推荐做法）

1. **分离关注点**

   ```python
   # core.py - 业务逻辑
   def process(data: str) -> Dict:
       return {"result": data}

   # __init__.py - 工具包装
   @tool()
   def process_tool(data: str) -> str:
       return json.dumps(process(data))
   ```

2. **完整的类型提示**

   ```python
   from typing import List, Dict, Optional

   def func(a: str, b: Optional[int] = None) -> Dict[str, Any]:
       pass
   ```

3. **详细的文档字符串**

   ```python
   def func(param: str) -> str:
       """
       Complete docstring with:
       - Brief description
       - Args section
       - Returns section
       - Example section
       """
       pass
   ```

4. **结构化的错误处理**

   ```python
   try:
       result = process(data)
       return {"status": "success", "data": result}
   except ValueError as e:
       return {"status": "failed", "error": str(e)}
   ```

5. **直接测试核心函数**

   ```python
   from src.tools.my_tool import your_function

   def test():
       result = your_function("input")
       assert result == "expected"
   ```

### ❌ DON'T（避免做法）

1. **不要在 **init**.py 中写业务逻辑**

   ```python
   # ❌ 错误
   @tool()
   def my_tool(data: str) -> str:
       # 不要在这里写复杂的业务逻辑
       result = complex_processing(data)
       return result
   ```

2. **不要在测试中使用 .entrypoint**

   ```python
   # ❌ 错误
   from src.tools.my_tool import my_tool

   def test():
       result = my_tool.entrypoint("input")  # 不推荐
   ```

3. **不要跳过类型提示**

   ```python
   # ❌ 错误
   def func(a, b):  # 缺少类型提示
       pass
   ```

4. **不要忽略错误处理**

   ```python
   # ❌ 错误
   def func(data):
       return process(data)  # 没有 try-except
   ```

5. **不要将所有代码放在单个文件**

   ```python
   # ❌ 错误：对于复杂工具
   # single_file.py
   @tool()
   def complex_tool():
       # 几百行代码...
   ```

## Human-in-the-Loop 工具

对于需要用户交互的工具：

### 基本模式

```python
# core.py
def interactive_function(input_data: str, user_input: Optional[str] = None) -> str:
    """
    Function that may require user input.

    Args:
        input_data: Initial input
        user_input: User's response (None on first call)
    """
    if user_input is None:
        # Return structure indicating what input is needed
        return json.dumps({"status": "awaiting_input", "prompt": "..."})

    # Process with user input
    return json.dumps({"status": "completed", "result": "..."})

# __init__.py
@tool(requires_user_input=True, user_input_fields=["user_input"])
def interactive_tool(input_data: str, user_input: Optional[str] = None) -> str:
    return interactive_function(input_data, user_input)
```

### HITL 类型

1. **User Confirmation**: 需要用户确认
2. **User Input**: 需要用户输入特定信息
3. **Dynamic User Input**: Agent 主动收集用户输入
4. **External Tool Execution**: 外部执行工具

详见：[Human-in-the-Loop 文档](../../../docs/guides/agno-develop/Human-in-the-loop.md)

## 性能优化

### 缓存结果

```python
@tool(cache_results=True, cache_ttl=3600)
def expensive_tool(query: str) -> str:
    """Tool with 1-hour cache."""
    return expensive_operation(query)
```

### 异步工具

```python
from agno.tools import tool

@tool()
async def async_tool(param: str) -> str:
    """Async tool for I/O operations."""
    result = await async_operation(param)
    return result
```

## 调试技巧

### 启用日志

```python
from loguru import logger

logger.info(f"Processing input: {param}")
logger.debug(f"Intermediate result: {result}")
logger.error(f"Error occurred: {error}", exc_info=True)
```

### 测试工具

```bash
# 运行特定工具的测试
python -m pytest tests/test_your_tool.py -v

# 运行所有工具测试
python -m pytest tests/ -k "tool" -v
```

## 文档模板

创建新工具时，使用脚本自动生成 README.md 模板：

```bash
# 进入 tools 目录
cd src/tools

# 生成模板到指定位置
./dev-utils/create-tool-readme.sh my_tool_name ./my_tool_name/README.md

# 或者生成到当前目录
./dev-utils/create-tool-readme.sh my_tool_name
```

脚本会自动创建包含以下部分的完整文档模板：

- 功能特性说明
- 安装和配置
- 使用示例（基础和高级）
- API 参考
- 测试指南
- 故障排除
- 架构说明

**模板位置**: `dev-utils/create-tool-readme.sh`

## 资源链接

- [Agno 官方文档](https://docs.agno.ai/)
- [Creating Custom Tools](../../../docs/guides/agno-develop/Creating%20your%20own%20tools.md)
- [Human-in-the-Loop Guide](../../../docs/guides/agno-develop/Human-in-the-loop.md)
- [现有工具列表](./README.md)

---

**最后更新**: 2025-11-19
