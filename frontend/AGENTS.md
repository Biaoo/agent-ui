# Frontend AGENTS.md

## Quick Start

### Setup commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Development server runs on http://localhost:3000
```

## Project Overview

Frontend built with Next.js 16 and CopilotKit for AI agent interactions.

**Current Status**: Development stage with CopilotKit integration and AG-UI protocol support.

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with CopilotKit provider
│   ├── page.tsx                 # Main chat interface page
│   ├── globals.css              # Global styles
│   ├── style.css                # Component-specific styles
│   └── api/                     # API routes
│       └── copilotkit/          # CopilotKit runtime endpoint
│           └── route.ts         # AG-UI protocol integration
├── public/                      # Static assets
├── .next/                       # Next.js build output (gitignored)
├── node_modules/                # Dependencies (gitignored)
├── package.json                 # Dependencies and scripts
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint configuration
├── postcss.config.mjs          # PostCSS configuration
└── AGENTS.md                   # This file
```

## Tech Stack

- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type-safe JavaScript
- **Tailwind CSS 4**: Utility-first CSS framework
- **CopilotKit**: AI agent integration framework
  - `@copilotkit/react-core`: Core React integration
  - `@copilotkit/react-ui`: Pre-built UI components
  - `@copilotkit/runtime`: Runtime for agent communication
- **@ag-ui/agno**: AG-UI protocol adapter for Agno backend
- **ESLint**: Code linting
- **PostCSS**: CSS processing

## Dependencies

Current dependencies from `package.json`:

```json
{
  "dependencies": {
    "@ag-ui/agno": "^0.0.3",
    "@copilotkit/react-core": "^1.10.6",
    "@copilotkit/react-ui": "^1.10.6",
    "@copilotkit/runtime": "^1.10.6",
    "next": "16.0.3",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.3",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Note**: Use `npm install <package>` to add new dependencies.

## Code Style

### TypeScript

- TypeScript strict mode enabled
- Use functional React components
- Prefer Server Components by default
- Use Client Components (`"use client"`) when needed for:
  - Event handlers
  - State management (useState, useReducer)
  - Browser APIs
  - CopilotKit hooks

### React Patterns

- Functional components with hooks
- Server Components for static content
- Client Components for interactive UI
- Async Server Components for data fetching

### Styling

- Tailwind CSS 4 utility classes
- CSS modules for component-specific styles
- Global styles in `app/globals.css`
- Custom styles in `app/style.css`

### Typography & Fonts

The project uses a professional font system optimized for Chinese and English:

**Fonts**:

- **Inter** - English body text (modern, screen-optimized)
- **Noto Sans SC** - Chinese body text (Source Han Sans)
- **JetBrains Mono** - Code/monospace (supports ligatures)
- **Noto Serif SC** - Optional serif for emphasis (Source Han Serif)

**Usage**:

```tsx
// Default (inherits global fonts)
<div>Content uses Inter + Noto Sans SC automatically</div>

// Tailwind classes
<div className="font-sans">Body text</div>
<code className="font-mono">Code text</code>
<h1 className="font-serif">Serif heading</h1>

// Markdown content
<div className="prose">
  <h1>Auto-styled markdown</h1>
  <code>code blocks</code>
</div>
```

**Features**:

- Auto font subsetting and preloading via `next/font`
- Dark mode support
- `display: swap` for no text flash
- Responsive sizing and line-height
- Full fallback chain for reliability

**Configuration**: See `app/layout.tsx` for font imports and `app/globals.css` for styling variables.

### File Organization

- Pages in `app/` directory
- API routes in `app/api/`
- Shared components in `app/components/` (to be created)
- Utilities in `app/utils/` (to be created)

## Current Implementation

### 1. Root Layout

Main application layout with CopilotKit provider:

**File**: `app/layout.tsx`

```typescript
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="agent-ui-backend"
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

**Features**:

- Wraps entire app in CopilotKit context
- Connects to backend via `/api/copilotkit` endpoint

### 2. Main Page

Chat interface with CopilotKit UI:

**File**: `app/page.tsx`

```typescript
"use client";
import { CopilotChat } from "@copilotkit/react-ui";
import { useFrontendTool } from "@copilotkit/react-core";

const Chat = () => {
  // Frontend tool example
  useFrontendTool({
    name: "change_background",
    description: "Change the background color...",
    parameters: [{ name: "background", type: "string" }],
    handler: ({ background }) => {
      // Implementation
    },
  });

  return (
    <div className="flex justify-center items-center h-full w-full">
      <CopilotChat
        className="h-full rounded-2xl max-w-6xl mx-auto"
        labels={{ initial: "Hi, I'm an agent. Want to chat?" }}
        suggestions={[...]}
      />
    </div>
  );
};
```

**Features**:

- Client Component for interactivity
- CopilotChat component for chat UI
- Frontend tool integration example
- Customizable suggestions

### 3. CopilotKit API Route

Backend integration via AG-UI protocol:

**File**: `app/api/copilotkit/route.ts`

```typescript
import { CopilotRuntime, ExperimentalEmptyAdapter } from "@copilotkit/runtime";
import { AgnoAgent } from "@ag-ui/agno";
import { copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";

const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    "agent-ui-backend": new AgnoAgent({
      url: "http://localhost:7777/agui"
    }),
  }
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  return handleRequest(req);
};
```

**Features**:

- Creates CopilotKit runtime
- Connects to Agno backend via AG-UI protocol
- Handles POST requests for agent communication
- Uses `AgnoAgent` adapter for protocol translation

### 4. Styling

**Global Styles** (`app/globals.css`):

- Tailwind CSS directives
- CSS variable definitions
- Base styles

**Custom Styles** (`app/style.css`):

- CopilotKit component customizations
- Component-specific styles

## CopilotKit Integration

### How it Works

1. **Provider Setup**: `CopilotKit` component wraps the app in `layout.tsx`
2. **Runtime Endpoint**: API route at `/api/copilotkit` handles agent communication
3. **AG-UI Adapter**: `AgnoAgent` translates between CopilotKit and AG-UI protocol
4. **UI Components**: `CopilotChat` provides chat interface
5. **Frontend Tools**: `useFrontendTool` hook allows client-side actions

### Key Concepts

**CopilotKit Provider**:

- Provides context for all CopilotKit hooks
- Configures runtime URL and default agent
- Must wrap all components using CopilotKit features

**CopilotChat**:

- Pre-built chat interface component
- Handles message display and input
- Supports custom labels and suggestions
- Manages conversation state automatically

**Frontend Tools**:

- Functions callable by the agent from the frontend
- Defined using `useFrontendTool` hook
- Can manipulate UI state or trigger actions
- Examples: change theme, show notifications, update UI

**Runtime**:

- Handles communication with backend agents
- Uses AG-UI protocol via `AgnoAgent` adapter
- Supports multiple agents
- Manages conversation context

### Backend Connection

The frontend connects to the backend through:

1. CopilotKit runtime URL: `/api/copilotkit`
2. AG-UI adapter: `AgnoAgent` with backend URL `http://localhost:7777/agui`
3. Agent specification: `agent="agent-ui-backend"`

Backend must expose AG-UI protocol endpoint at `/agui`.

## Development Workflow

### Adding a New Page

1. Create file in `app/` directory
2. Export default React component
3. Use Server Component by default
4. Add `"use client"` if interactivity needed

Example:

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <p>This is a server component by default.</p>
    </div>
  );
}
```

### Adding an API Route

1. Create file in `app/api/` directory
2. Export named functions for HTTP methods
3. Use Next.js request/response types

Example:

```typescript
// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}
```

### Adding a Frontend Tool

1. Use `useFrontendTool` hook in client component
2. Define name, description, parameters
3. Implement handler function

Example:

```typescript
"use client";
import { useFrontendTool } from "@copilotkit/react-core";

export default function MyComponent() {
  useFrontendTool({
    name: "show_notification",
    description: "Show a notification to the user",
    parameters: [
      { name: "message", type: "string", description: "Notification message" }
    ],
    handler: ({ message }) => {
      alert(message);
      return { status: "success" };
    },
  });

  // Component JSX...
}
```

### Adding a New Agent

To add a new agent to the frontend:

1. Register in `app/api/copilotkit/route.ts`:

```typescript
const runtime = new CopilotRuntime({
  agents: {
    "agent-ui-backend": new AgnoAgent({url: "http://localhost:7777/agui"}),
    "new-agent": new AgnoAgent({url: "http://localhost:7777/agui"}),
  }
});
```

2. Specify agent in CopilotKit provider or component:

```typescript
<CopilotKit agent="new-agent">
  {children}
</CopilotKit>
```

## Environment Variables

Currently, the frontend doesn't require environment variables. Backend URL is hardcoded for development.

For production, consider creating `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

Then use in code:

```typescript
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7777";
```

**Note**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Building and Deployment

### Development

```bash
npm run dev
```

Runs Next.js in development mode with:

- Fast Refresh for instant updates
- Detailed error messages
- Source maps

### Production Build

```bash
npm run build
npm start
```

Creates optimized production build with:

- Minified JavaScript and CSS
- Optimized images and fonts
- Server-side rendering
- Static generation where possible

### Deployment Options

Next.js apps can be deployed to:

- **Vercel** (recommended, zero-config)
- **Netlify**
- **AWS** (Amplify, EC2, ECS)
- **Docker** (self-hosted)
- **Node.js server** (self-hosted)

## Testing

Testing framework is not yet configured. Consider adding:

- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright** or **Cypress**: E2E testing

Example setup:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

## Common Issues

### 1. CopilotKit not connecting to backend

**Check**:

- Backend is running on `http://localhost:7777`
- Backend exposes `/agui` endpoint
- No CORS errors in browser console

**Solution**:

```typescript
// Verify backend URL in route.ts
"agent-ui-backend": new AgnoAgent({url: "http://localhost:7777/agui"})
```

### 2. "use client" directive required

**Error**: Hooks or event handlers in Server Component

**Solution**: Add `"use client"` at top of file:

```typescript
"use client";
import { useState } from "react";
```

### 3. Styles not applying

**Check**:

- Tailwind CSS imported in `globals.css`
- PostCSS configured correctly
- Class names are valid Tailwind utilities

### 4. Type errors

**Solution**:

```bash
# Check types
npx tsc --noEmit

# Clear Next.js cache
rm -rf .next
npm run dev
```

## Next Steps (Roadmap)

**Current Status**:

- [x] Next.js 16 setup with App Router
- [x] CopilotKit integration
- [x] AG-UI protocol connection
- [x] Basic chat interface

**Planned Features**:

- [ ] Testing setup (Jest + React Testing Library)
- [ ] Component library structure
- [ ] Environment variables configuration
- [ ] Production deployment setup
- [ ] Multi-agent support in UI
- [ ] Conversation history persistence
- [ ] User authentication
- [ ] Custom CopilotKit themes
- [ ] File upload support
- [ ] Voice input/output

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [AG-UI Protocol](https://github.com/agentstation/ag-ui-protocol)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## Notes

This frontend has been refactored from Vite to Next.js for better server-side rendering, improved developer experience, and native CopilotKit support with the App Router architecture.

Key changes from previous Vite implementation:

- **Framework**: Vite → Next.js 16
- **React**: 18 → 19
- **Tailwind**: 3 → 4
- **Architecture**: SPA → Server/Client Component hybrid
- **Routing**: Client-side → App Router
- **API Integration**: Direct fetch → CopilotKit runtime

The new architecture provides better performance, SEO capabilities, and a more structured approach to building AI agent interfaces.
