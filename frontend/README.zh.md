# 前端项目

这是一个使用 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 创建的 [Next.js](https://nextjs.org) 项目。

## 快速开始

首先，启动开发服务器：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

您可以通过修改 `app/page.tsx` 来编辑页面。文件修改后页面会自动更新。

## 字体排版

本项目通过 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 使用了优化的字体：

- **Inter** - 英文正文
- **Noto Sans SC**（思源黑体）- 中文正文
- **JetBrains Mono** - 代码/等宽字体，支持连字
- **Noto Serif SC**（思源宋体）- 衬线强调文本

所有字体都经过自动优化，包括字体子集化、预加载和 `display: swap` 以获得最佳性能。

## 目录结构

```
frontend/app/
├── api/
│   └── copilotkit/
│       └── route.ts              # CopilotKit 运行时 API 端点
├── components/
│   └── Navigation.tsx            # 全局导航组件
├── pages/
│   ├── search/
│   │   └── page.tsx             # 搜索 Agent 页面
│   └── chat/
│       └── page.tsx             # 聊天 Agent 页面
├── layout.tsx                    # 根布局（包含导航）
├── page.tsx                      # 首页/落地页
├── globals.css                   # 全局样式
└── style.css                     # 自定义 CopilotKit 样式
```

## 路由

### 公共路由

- `/` - 首页（包含 Agent 选择的落地页）
- `/pages/search` - 搜索 Agent，具备网页搜索能力
- `/pages/chat` - 聊天 Agent，用于常规对话

### API 路由

- `POST /api/copilotkit` - CopilotKit 运行时端点，用于 Agent 通信

## 页面结构

### 首页 (`/`)

**文件**：`app/page.tsx`

落地页包含：

- Agent 选择卡片
- 功能亮点
- 导航到各 Agent 页面

**特性**：

- 无 CopilotKit provider（静态页面）
- 链接到各 Agent 页面
- 响应式设计

### 搜索 Agent 页面 (`/pages/search`)

**文件**：`app/pages/search/page.tsx`

**Agent**：SearchAgent
**能力**：

- 通过 Tavily 进行网页搜索
- 实时信息检索
- 引用和来源

**特性**：

- 包含 SearchAgent 的 CopilotKit provider
- 前端工具：`change_background`
- 搜索查询的自定义建议

### 聊天 Agent 页面 (`/pages/chat`)

**文件**：`app/pages/chat/page.tsx`

**Agent**：ChatAgent
**能力**：

- 常规对话
- 问答
- 创意任务

**特性**：

- 包含 ChatAgent 的 CopilotKit provider
- 简洁的聊天界面
- 常见任务的建议

## 组件

### 导航 (`app/components/Navigation.tsx`)

全局导航栏，包含以下链接：

- 首页
- 搜索 Agent
- 聊天 Agent

**特性**：

- 当前路由高亮
- 响应式设计
- 固定在顶部

## 样式

### 全局样式 (`app/globals.css`)

- Tailwind CSS 基础样式
- CSS 变量
- 排版

### CopilotKit 样式 (`app/style.css`)

- 自定义 CopilotKit 组件样式
- 聊天界面自定义

## 添加新的 Agent 页面

1. 创建目录：`app/pages/[agent-name]/`
2. 创建页面文件：`app/pages/[agent-name]/page.tsx`
3. 添加 CopilotKit provider 并指定 agent 名称：

```typescript
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";

export default function MyAgentPage() {
  return (
    <CopilotKit
      runtimeUrl="/api/copilotkit"
      agent="MyAgent"
    >
      <div className="h-screen">
        <CopilotChat />
      </div>
    </CopilotKit>
  );
}
```

4. 更新导航：在 `app/components/Navigation.tsx` 中添加链接
5. 注册 Agent：在 `app/api/copilotkit/route.ts` 中注册

## 布局结构

### 根布局 (`app/layout.tsx`)

包裹所有页面，提供：

- 导航组件
- 字体配置
- CopilotKit 样式导入

**注意**：CopilotKit provider **不在**布局中。每个页面管理自己的 CopilotKit provider，以允许每个页面使用不同的 Agent。

## 最佳实践

### 页面组织

1. **每个页面一个 Agent**：每个页面都有自己的 CopilotKit provider
2. **路由前缀**：Agent 页面使用 `/pages/` 前缀
3. **组件分离**：将可复用组件提取到 `/components/`

### CopilotKit 使用

1. **每页一个 Provider**：不要在布局中放置 CopilotKit
2. **Agent ID**：必须与后端注册的名称匹配
3. **Runtime URL**：始终使用 `/api/copilotkit`

### 样式

1. **优先使用 Tailwind**：使用 Tailwind 工具类
2. **组件样式**：仅在必要时使用
3. **统一间距**：遵循 Tailwind 间距规范

## 迁移说明

### 从旧结构迁移

旧结构：

```
app/
├── page.tsx          # 曾是 SearchAgent
├── chat/
│   └── page.tsx     # ChatAgent
└── layout.tsx       # 包含 CopilotKit provider
```

新结构：

```
app/
├── page.tsx          # 落地页
├── pages/
│   ├── search/
│   │   └── page.tsx # SearchAgent（从根目录移动）
│   └── chat/
│       └── page.tsx # ChatAgent（从 /chat 移动）
└── layout.tsx       # 无 CopilotKit provider
```

### 主要变更

1. **落地页**：新增首页用于 Agent 选择
2. **Pages 前缀**：所有 Agent 页面都在 `/pages/` 下
3. **Provider 位置**：从布局移动到各个页面
4. **导航**：更新链接到新路由

## 开发

### 本地运行

```bash
npm run dev
```

服务器运行在 <http://localhost:3000>

### 路由

- <http://localhost:3000> - 首页
- <http://localhost:3000/pages/search> - 搜索 Agent
- <http://localhost:3000/pages/chat> - 聊天 Agent

### 热重载

启用了 Next.js Fast Refresh：

- 文件更改时即时更新
- 编辑期间保留状态
- 错误覆盖层

## 生产构建

```bash
npm run build
npm start
```

### 优化

- 每个路由自动代码分割
- 图片优化
- 字体优化
- 服务端渲染
- 尽可能静态生成

## 项目文档

完整的项目文档：

- **[AGENTS.md](./AGENTS.md)** - 完整的前端文档（架构、设置、CopilotKit 集成）
- **[CLAUDE.md](./CLAUDE.md)** - 项目范围的开发指南

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 功能和 API
- [学习 Next.js](https://nextjs.org/learn) - Next.js 交互式教程

您也可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js) - 欢迎您的反馈和贡献！

## 部署到 Vercel

部署 Next.js 应用最简单的方式是使用 Next.js 创作者提供的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多详情。
