# Dev Utils

> 工具开发辅助脚本集合

## 脚本列表

### create-tool-readme.sh

自动生成工具的 README.md 模板。

**用法**：

```bash
./dev-utils/create-tool-readme.sh <tool_name> [output_path]
```

**参数**：

- `tool_name`: 工具名称（必需），如 `my_awesome_tool`
- `output_path`: 输出路径（可选），默认为 `./README.md`

**示例**：

```bash
# 生成到指定目录
./dev-utils/create-tool-readme.sh my_tool ./my_tool/README.md

# 生成到当前目录
./dev-utils/create-tool-readme.sh my_tool

# 生成到临时目录查看
./dev-utils/create-tool-readme.sh my_tool /tmp/README.md
```

**生成的模板包含**：

- 功能特性说明
- 安装和配置指南
- 基础和高级使用示例
- API 参考文档
- 测试指南
- 错误处理说明
- 故障排除
- 架构说明
- 开发指南

**后续步骤**：

1. 根据实际工具填写内容
2. 删除不需要的章节
3. 添加工具特定的说明

## 添加新脚本

如果要添加新的开发辅助脚本：

1. 在此目录创建脚本文件
2. 添加执行权限：`chmod +x script_name.sh`
3. 更新本 README 文档
4. 在 `AGENTS.md` 中添加说明（如果需要）

## 资源

- [工具开发规范](../AGENTS.md)
- [工具概览](../README.md)
