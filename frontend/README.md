# Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Typography

This project uses optimized fonts via [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts):

- **Inter** - English body text
- **Noto Sans SC** (Source Han Sans) - Chinese body text
- **JetBrains Mono** - Code/monospace with ligatures
- **Noto Serif SC** (Source Han Serif) - Serif emphasis

All fonts are auto-optimized with subsetting, preloading, and `display: swap` for optimal performance.

## Directory Organization

```
frontend/app/
├── api/
│   └── copilotkit/
│       └── route.ts              # CopilotKit runtime API endpoint
├── components/
│   └── Navigation.tsx            # Global navigation component
├── pages/
│   ├── search/
│   │   └── page.tsx             # Search Agent page
│   └── chat/
│       └── page.tsx             # Chat Agent page
├── layout.tsx                    # Root layout with navigation
├── page.tsx                      # Home/Landing page
├── globals.css                   # Global styles
└── style.css                     # Custom CopilotKit styles
```

## Routes

### Public Routes

- `/` - Home page (landing page with agent selection)
- `/pages/search` - Search Agent with web search capabilities
- `/pages/chat` - Chat Agent for general conversation

### API Routes

- `POST /api/copilotkit` - CopilotKit runtime endpoint for agent communication

## Pages Structure

### Home Page (`/`)

**File**: `app/page.tsx`

Landing page with:

- Agent selection cards
- Feature highlights
- Navigation to agent pages

**Features**:

- No CopilotKit provider (static page)
- Links to agent pages
- Responsive design

### Search Agent Page (`/pages/search`)

**File**: `app/pages/search/page.tsx`

**Agent**: SearchAgent
**Capabilities**:

- Web search via Tavily
- Real-time information retrieval
- Citations and sources

**Features**:

- CopilotKit provider with SearchAgent
- Frontend tool: `change_background`
- Custom suggestions for search queries

### Chat Agent Page (`/pages/chat`)

**File**: `app/pages/chat/page.tsx`

**Agent**: ChatAgent
**Capabilities**:

- General conversation
- Question answering
- Creative tasks

**Features**:

- CopilotKit provider with ChatAgent
- Simple chat interface
- Suggestions for common tasks

## Components

### Navigation (`app/components/Navigation.tsx`)

Global navigation bar with links to:

- Home
- Search Agent
- Chat Agent

**Features**:

- Active route highlighting
- Responsive design
- Fixed position at top

## Styling

### Global Styles (`app/globals.css`)

- Tailwind CSS base styles
- CSS variables
- Typography

### CopilotKit Styles (`app/style.css`)

- Custom CopilotKit component styles
- Chat interface customizations

## Adding a New Agent Page

1. Create directory: `app/pages/[agent-name]/`
2. Create page file: `app/pages/[agent-name]/page.tsx`
3. Add CopilotKit provider with agent name:

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

4. Update navigation: Add link to `app/components/Navigation.tsx`
5. Register agent in: `app/api/copilotkit/route.ts`

## Layout Structure

### Root Layout (`app/layout.tsx`)

Wraps all pages with:

- Navigation component
- Font configuration
- CopilotKit styles import

**Note**: CopilotKit provider is NOT in the layout. Each page manages its own CopilotKit provider to allow different agents per page.

## Best Practices

### Page Organization

1. **One agent per page**: Each page has its own CopilotKit provider
2. **Prefix routes**: Use `/pages/` prefix for agent pages
3. **Component separation**: Extract reusable components to `/components/`

### CopilotKit Usage

1. **Provider per page**: Don't put CopilotKit in layout
2. **Agent ID**: Must match backend registration
3. **Runtime URL**: Always `/api/copilotkit`

### Styling

1. **Tailwind first**: Use Tailwind utilities
2. **Component styles**: Only when needed
3. **Consistent spacing**: Follow Tailwind spacing scale

## Migration Notes

### From Previous Structure

Old structure:

```
app/
├── page.tsx          # Was SearchAgent
├── chat/
│   └── page.tsx     # ChatAgent
└── layout.tsx       # Had CopilotKit provider
```

New structure:

```
app/
├── page.tsx          # Landing page
├── pages/
│   ├── search/
│   │   └── page.tsx # SearchAgent (moved from root)
│   └── chat/
│       └── page.tsx # ChatAgent (moved from /chat)
└── layout.tsx       # No CopilotKit provider
```

### Key Changes

1. **Landing page**: New home page for agent selection
2. **Pages prefix**: All agent pages under `/pages/`
3. **Provider location**: Moved from layout to individual pages
4. **Navigation**: Updated links to new routes

## Development

### Running Locally

```bash
npm run dev
```

Server runs on <http://localhost:3000>

### Routes

- <http://localhost:3000> - Home
- <http://localhost:3000/pages/search> - Search Agent
- <http://localhost:3000/pages/chat> - Chat Agent

### Hot Reload

Next.js Fast Refresh enabled:

- Instant updates on file changes
- State preservation during edits
- Error overlay

## Production Build

```bash
npm run build
npm start
```

### Optimizations

- Automatic code splitting per route
- Image optimization
- Font optimization
- Server-side rendering
- Static generation where possible

## Project Documentation

For comprehensive project documentation:

- **[AGENTS.md](./AGENTS.md)** - Complete frontend documentation (architecture, setup, CopilotKit integration)
- **[CLAUDE.md](./CLAUDE.md)** - Project-wide development guidelines

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
