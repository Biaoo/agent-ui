# Tool Protocol Components

Frontend components for rendering backend agent tool executions using the AG-UI protocol.

## Overview

This directory contains a self-contained module implementing the AG-UI tool protocol, providing a standardized two-panel architecture for displaying tool execution results:

- **Summary Cards**: Show tool execution status in the chat area
- **Detail Panels**: Display full results in a side canvas with rich interactions

## Directory Structure

```
tool-protocol/
├── README.md                           # This file - tool overview
├── AGENTS.md                           # AI development guide
├── utils.ts                            # Utilities (Unicode-safe encoding, ID generation)
├── ActionDetailContext.tsx             # Global state management
├── ActionSummaryCard.tsx               # Summary card component
├── ActionDetailPanel.tsx               # Detail panel component
├── AskUserQuestionPanel/               # Human-in-the-Loop questionnaire
│   ├── index.tsx
│   └── AskUserQuestionDetailRenderer.tsx
└── TavilySearchPanel/                  # Web search tool
    ├── index.tsx
    └── TavilyDetailRenderer.tsx
```

## Available Tools

### 1. AskUserQuestionPanel (HITL)

**Backend Action**: `ask_user_question`

Human-in-the-Loop component for collecting user input during agent execution.

**Features**:

- Interactive questionnaire with single/multi-select options
- Real-time progress tracking (X/Y questions answered)
- Auto-opens canvas when questions arrive
- Read-only submitted view with green checkmarks
- Blocks agent execution until user responds

**Usage Example**:

```tsx
import { useAskUserQuestionAction } from "@/app/components/tool-protocol/AskUserQuestionPanel";

function MyPage() {
  useAskUserQuestionAction();
  return <CopilotChat />;
}
```

### 2. TavilySearchPanel

**Backend Action**: `web_search_using_tavily`

Displays web search results from Tavily API.

**Features**:

- AI-generated answer summary
- Search result cards with titles, URLs, content, scores
- Image results gallery
- Pagination for results
- Search depth indicator (basic/advanced)

**Data Structure**:

```typescript
{
  query: "search term",
  search_depth: "basic" | "advanced",
  results: [
    {
      title: "Result title",
      url: "https://...",
      content: "Preview text...",
      score: 0.95
    }
  ],
  answer: "AI-generated summary...",
  images: ["url1", "url2"]
}
```

## Core Infrastructure

### ActionDetailContext

Provides global state management for action selection:

```tsx
const { selectedAction, selectAction, clearAction, isSelected, actionHistory } = useActionDetail();
```

**State**:

- `selectedAction`: Currently displayed action in canvas
- `actionHistory`: Array of all executed actions (latest first)

**Methods**:

- `selectAction(action)`: Select an action to display
- `clearAction()`: Close the detail panel
- `isSelected(id)`: Check if action is currently selected

### ActionSummaryCard

Unified card component for chat display:

**Props**:

- `action`: ActionDetail object
- `displayName`: Human-readable name
- `icon`: Emoji or icon
- `description`: Brief description
- `parameterSummary`: Summary of key parameters (ReactNode)
- `resultSummary`: Summary of results for completed actions (ReactNode)

**Features**:

- Status badge (Preparing/Executing/Complete)
- Action ID badge (short form)
- Click to view details
- Visual feedback when selected

### ActionDetailPanel

Canvas panel for detailed results:

**Props**:

- `renderers`: Map of action names to detail renderer components
- `className`: Optional custom styling

**Features**:

- Fixed positioning (top-16 bottom-0 right-0)
- Dropdown switcher for multiple actions
- Scrollable content area
- Mobile responsive with backdrop
- Z-index layered correctly (z-40, below navigation z-50)

## Utilities

### generateActionId()

Safe ID generation with Unicode support:

```tsx
import { generateActionId } from "@/app/components/tool-protocol/utils";

const id = generateActionId("mytool", uniqueId, args, status);
// Returns: "mytool-:r1:-abc12345"
```

**Why**: Native `btoa()` only supports Latin1 and throws errors with Chinese text or emojis. This utility uses `TextEncoder` for proper UTF-8 handling.

### safeParse()

Type-safe JSON parsing:

```tsx
const payload = safeParse<MyToolResponsePayload>(result);
if (!payload) {
  return <ErrorView />;
}
```

## Integration

### In Page Components

```tsx
import { TwoPanelLayout } from "@/app/components/TwoPanelLayout";
import {
  useAskUserQuestionAction,
  AskUserQuestionDetailRenderer
} from "@/app/components/tool-protocol/AskUserQuestionPanel";
import {
  useTavilySearchAction,
  TavilyDetailRenderer
} from "@/app/components/tool-protocol/TavilySearchPanel";

export default function MyPage() {
  return (
    <TwoPanelLayout
      actionRenderers={{
        ask_user_question: AskUserQuestionDetailRenderer,
        web_search_using_tavily: TavilyDetailRenderer,
      }}
    >
      <MyPageContent />
    </TwoPanelLayout>
  );
}

function MyPageContent() {
  // Must be inside TwoPanelLayout to access context
  useAskUserQuestionAction();
  useTavilySearchAction();

  return <CopilotChat />;
}
```

## Styling Guidelines

### Color Palette

- **Primary**: Blue (`blue-50`, `blue-600`, `blue-700`)
- **Success**: Green (`green-50`, `green-600`, `green-700`)
- **Warning**: Yellow (`yellow-50`, `yellow-600`, `yellow-700`)
- **Error**: Red (`red-50`, `red-600`, `red-800`)
- **Info**: Purple (`purple-50`, `purple-600`, `purple-800`)
- **Neutral**: Slate (`slate-50` to `slate-900`)

### Status Colors

```tsx
// In Progress
className="bg-yellow-50 border-yellow-200 text-yellow-700"

// Executing
className="bg-blue-50 border-blue-200 text-blue-700"

// Complete
className="bg-green-50 border-green-200 text-green-700"
```

### Component Spacing

- **Summary Card**: `max-w-2xl`, `rounded-2xl`, `p-4`
- **Detail Panel**: `p-6`, `space-y-6`
- **Sections**: `space-y-4` for major sections
- **Items**: `space-y-2` or `space-y-3` for lists

## Architecture Principles

### High Cohesion, Low Coupling

**High Cohesion**: All tool protocol components are co-located in this directory

- Shared infrastructure (Context, SummaryCard, DetailPanel)
- Tool implementations (AskUserQuestion, Tavily)
- Common utilities (encoding, parsing)
- Comprehensive documentation

**Low Coupling**: General components remain in parent directory

- `TwoPanelLayout.tsx`: General-purpose layout wrapper
- `Navigation.tsx`: Application navigation
- `markdown/`: Markdown rendering components

### Two-Panel Pattern

**Chat Panel (Left)**:

- Shows `ActionSummaryCard` for each tool execution
- Displays essential information: status, parameters, brief results
- Clickable to open detailed view
- Multiple cards stack vertically in chat history

**Canvas Panel (Right)**:

- Opens when user clicks a summary card
- Renders tool-specific detail component
- Supports switching between multiple action executions
- Fixed positioning, stays visible while scrolling chat

### State Management

**Local State**: Each tool component manages its own UI state (pagination, expansion, etc.)

**Global State**: ActionDetailContext manages:

- Currently selected action
- Action history (all executions)
- Selection/deselection methods

### Data Flow

```
Backend Agent
    ↓
AG-UI Protocol Message
    ↓
CopilotKit Runtime
    ↓
useCopilotAction Hook
    ↓
Tool Renderer (index.tsx)
    ├─→ ActionSummaryCard (displays in chat)
    └─→ ActionDetail object (stored in context)
         ↓
    User clicks card
         ↓
    selectAction(actionDetail)
         ↓
    ActionDetailPanel opens
         ↓
    DetailRenderer displays full results
```

## Best Practices

### 1. Stable IDs

Always use `generateActionId()` for consistent, unique IDs:

```tsx
const uniqueId = useId();
const actionDetail = useMemo(() => ({
  id: generateActionId("mytool", uniqueId, args, status),
  // ...
}), [status, args, result, uniqueId]);
```

### 2. Auto-Selection

Auto-select completed actions to show results immediately:

```tsx
React.useEffect(() => {
  if (status === "complete" && payload) {
    selectAction(actionDetail);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [status]); // Only depend on status!
```

### 3. Type Safety

Define interfaces for all data structures:

```tsx
interface MyToolRequestArguments {
  query?: string;
}

interface MyToolResponsePayload {
  results?: MyResult[];
}
```

### 4. Error Handling

Always handle loading and error states:

```tsx
if (status !== "complete" || !result) {
  return <LoadingView status={status} args={args} />;
}

const payload = safeParse<MyToolResponsePayload>(result);
if (!payload) {
  return <ErrorView />;
}
```

### 5. Pagination

Implement pagination for large datasets:

```tsx
const MAX_ITEMS_PER_PAGE = 5;
const [currentPage, setCurrentPage] = useState(0);
const totalPages = Math.ceil(items.length / MAX_ITEMS_PER_PAGE);
const visibleItems = items.slice(
  currentPage * MAX_ITEMS_PER_PAGE,
  (currentPage + 1) * MAX_ITEMS_PER_PAGE
);
```

## Development Workflow

### Adding a New Tool

1. Create directory: `tool-protocol/MyToolPanel/`
2. Implement `index.tsx` (action registration + summary)
3. Implement `MyToolDetailRenderer.tsx` (canvas renderer)
4. Export detail renderer from `index.tsx`
5. Register in page's `TwoPanelLayout`
6. Update this README with tool documentation

### Testing Checklist

- [ ] Action name matches backend exactly
- [ ] Summary card displays correctly in chat
- [ ] Detail panel opens on click
- [ ] Loading state shows during execution
- [ ] Error state handles failures gracefully
- [ ] Result data parses correctly
- [ ] Pagination works (if applicable)
- [ ] Mobile responsive design
- [ ] Multiple executions tracked in history
- [ ] Switching between actions works
- [ ] Unicode characters in parameters work correctly

## Debugging

### Common Issues

**"useActionDetail must be used within an ActionDetailProvider"**

Solution: Ensure hook is called inside `TwoPanelLayout`:

```tsx
// ✅ Correct
<TwoPanelLayout>
  <MyPageContent />  {/* Hook called here */}
</TwoPanelLayout>

// ❌ Wrong
useMyToolAction();  // Called outside TwoPanelLayout
return <TwoPanelLayout>...</TwoPanelLayout>;
```

**InvalidCharacterError with btoa()**

Solution: Use `generateActionId()` instead of direct `btoa()` calls.

**Action not showing in history**

Solution: Ensure stable ID generation with `useId()` and `useMemo()`.

## Resources

- **AGENTS.md**: AI development guide with step-by-step instructions
- **AG-UI Protocol**: <https://github.com/agentstation/ag-ui-protocol>
- **CopilotKit Docs**: <https://docs.copilotkit.ai>
- **Tailwind CSS**: <https://tailwindcss.com/docs>

## Contributing

When adding new tools or features:

1. Follow the established two-panel pattern
2. Use the shared infrastructure components
3. Maintain type safety with TypeScript interfaces
4. Document the tool in this README
5. Update AGENTS.md if adding new patterns or utilities
6. Test across mobile and desktop
7. Ensure Unicode support in all string operations

## License

Part of the agent-ui-project. See main project LICENSE for details.
