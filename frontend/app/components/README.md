# Frontend Components

This directory contains the frontend component library for the AG-UI application.

## Directory Structure

```
components/
├── tool-protocol/              # Tool protocol system (high cohesion)
│   ├── AGENTS.md              # Tool protocol documentation
│   ├── ActionDetailContext.tsx
│   ├── ActionSummaryCard.tsx
│   ├── ActionDetailPanel.tsx
│   ├── TavilySearchPanel/
│   └── AskUserQuestionPanel/  # HITL inline questionnaire
├── markdown/                   # Markdown rendering components
├── TwoPanelLayout.tsx         # General layout component
├── Navigation.tsx             # Navigation component
├── AguiMessageRegistry.tsx    # Debugging tools
└── RawResponseLogger.tsx      # Debugging tools
```

## Tool Protocol Components

See [tool-protocol/AGENTS.md](./tool-protocol/AGENTS.md) for detailed documentation on the tool protocol system.

The `tool-protocol/` directory is a self-contained, highly cohesive module that implements the AG-UI protocol for tool rendering. It includes:

- Core infrastructure (Context, Cards, Panels)
- Tool implementations (Tavily Search, Ask User Question)
- Comprehensive documentation

## General Components

### TwoPanelLayout

General-purpose two-panel layout component that provides chat and canvas areas. Used by tool protocol components but not limited to them.

### Markdown Components

Modular markdown rendering components supporting citations, footnotes, and custom elements.

## Debugging Tools

### AskUserQuestionPanel

Frontend implementation of Human-in-the-Loop (HITL) for the `ask_user_question` tool. See [tool-protocol/AGENTS.md](./tool-protocol/AGENTS.md) for details.

### AguiMessageRegistry

### How It Works

This component uses CopilotKit's `renderAndWaitForResponse` to:

1. Register an `ask_user_question` action via `useCopilotAction`
2. Render a custom questionnaire UI when the backend calls this tool
3. Collect user responses and send them back via the `respond()` callback

**Flow:**

1. **Backend Agent calls tool**: Agent decides to call `ask_user_question(questions_json="[...]")`
2. **Frontend intercepts**: `useAskUserQuestionAction()` listens for the tool invocation
3. **Render custom UI**: Displays questions with options from the `args` parameter
4. **User interacts**: User selects answers from the rendered UI
5. **Submit response**: Uses `respond(result)` to send the tool response
6. **Conversation continues**: The response is sent back to the backend, and the agent continues

### Key Technical Details

**Response Mechanism:**

- `renderAndWaitForResponse` receives `args` (parsed arguments) and `respond()` callback
- The UI collects answers and sends them back through `respond(result)`
- CopilotKit automatically emits the tool response message

**Note**: A local patch (`patches/@copilotkit+runtime-client-gql+1.10.6.patch`) fixes a JSON parsing issue in CopilotKit. See `docs/copilotkit-untruncatejson-bug.md` for details.

### Usage

```typescript
import { useAskUserQuestionAction } from "@/app/components/AskUserQuestionAction";

function YourPage() {
  useAskUserQuestionAction();
  return <CopilotChat />;
}
```

### Architecture

```
Backend (ask_user_question_tool)
  ↓ (tool call via AG-UI protocol)
CopilotKit Runtime (streaming response)
  ↓ (parses arguments into args object)
renderAndWaitForResponse({ args, respond })
  ↓ (renders custom UI with questions)
User Interaction
  ↓ (submits answers)
respond(result)
  ↓ (sent back via AG-UI protocol)
Backend Agent (continues with tool result)
```

### Expected JSON Format

**Input (from backend)**:

```json
{
  "questions_json": "[{\"question\":\"Which type?\",\"header\":\"Type\",\"options\":[{\"label\":\"A\",\"description\":\"Option A\"},{\"label\":\"B\",\"description\":\"Option B\"}],\"multiSelect\":false}]"
}
```

**Output (to backend)**:

```json
{
  "answers": {
    "Type": ["A"]
  },
  "questions_asked": 1,
  "status": "completed"
}
```

This matches the format expected by the backend's `ask_user_question` core implementation.

### Styling

The component uses Tailwind CSS classes for styling:

- Blue theme for selected options
- Gray theme for unselected options
- Responsive design
- Checkbox for multi-select, radio for single-select

### Future Enhancements

- [ ] Add validation messages
- [ ] Add loading states
- [ ] Add animation transitions
- [ ] Support for "Other" option with text input
- [ ] Dark mode support
- [ ] Accessibility improvements (ARIA labels)

---

## Debugging Tools

### AguiMessageRegistry

A debugging and monitoring utility that records all AG-UI protocol messages for inspection and troubleshooting.

**Use cases:**

- Debugging data flow issues between backend and frontend
- Monitoring message structure during development
- Troubleshooting when components don't receive expected data
- Understanding the AG-UI protocol message format

**Usage:**

```typescript
import { useAguiMessageRegistry, getLatestActionExecution, getActionArguments } from "@/app/components/AguiMessageRegistry";

function DebugComponent() {
  useAguiMessageRegistry();

  const message = getLatestActionExecution("ask_user_question");
  const args = getActionArguments(message);
  console.log("Args:", args);
}
```

See `AguiMessageRegistry.README.md` for detailed API documentation.

### RawResponseLogger

A debugging utility that intercepts and logs raw HTTP responses from CopilotKit API endpoints.

**Use cases:**

- Debugging GraphQL streaming responses
- Inspecting raw AG-UI protocol data
- Troubleshooting network-level issues
- Understanding the incremental delivery format

**Usage:**

```typescript
import { useRawResponseLogger } from "@/app/components/RawResponseLogger";

function DebugComponent() {
  useRawResponseLogger();
  // Check browser console for [RAW-STREAM] logs
}
```

See `docs/raw-response-stream.md` for response format documentation.

**Note:** These tools are for debugging purposes only. For normal application use, prefer CopilotKit's built-in `useCopilotAction` with `renderAndWaitForResponse`.
