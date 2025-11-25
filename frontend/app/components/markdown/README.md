# Custom Markdown Components for CopilotKit

This directory contains custom React components for rendering markdown in CopilotKit chat interfaces. These components are specifically designed to work with the search agent's markdown output format and provide rich, interactive displays of search results and citations.

## 📁 File Structure

```
markdown/
├── index.tsx                 # Main export and useMarkdownRenderers hook
├── SourceReference.tsx       # Component for source/citation links
├── FootnoteReference.tsx     # Component for footnote markers
├── CitationBlock.tsx         # Component for blockquote citations
├── SearchResultCard.tsx      # Component for rich search result display
├── styles.css               # All component styles with dark mode support
└── README.md                # This file
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { useMarkdownRenderers } from '@/app/components/markdown';
import { CopilotChat } from '@copilotkit/react-ui';

function SearchPage() {
  const markdownRenderers = useMarkdownRenderers();

  return (
    <CopilotChat
      markdownTagRenderers={markdownRenderers}
      // ... other props
    />
  );
}
```

### Using Individual Components

```tsx
import { SourceReference, FootnoteReference, CitationBlock } from '@/app/components/markdown';

function MyComponent() {
  return (
    <div>
      <SourceReference href="source:https://example.com">
        Example Source
      </SourceReference>

      <FootnoteReference id="ref-1">1</FootnoteReference>

      <CitationBlock source="John Doe, 2024">
        This is a quoted passage from a source.
      </CitationBlock>
    </div>
  );
}
```

## 📦 Components

### 1. SourceReference

Renders clickable source links with a paperclip icon.

**Props:**

- `children` (ReactNode): The link text
- `href` (string): The URL (with or without "source:" prefix)
- `className` (string): Additional CSS classes

**Markdown Format:**

```markdown
[Source Title](source:https://example.com)
```

**Features:**

- Automatic "source:" prefix handling
- Paperclip icon for visual identification
- Opens in new tab with security attributes
- Hover and active states
- Accessibility support with ARIA labels
- URL validation indicator

**Example:**

```tsx
<SourceReference href="source:https://example.com">
  Example Article
</SourceReference>
```

---

### 2. FootnoteReference

Renders superscript footnote markers.

**Props:**

- `children` (ReactNode): The footnote number/text
- `id` (string): Optional ID for anchor linking
- `className` (string): Additional CSS classes

**Markdown Format:**

```markdown
Some text[1](ref:footnote-1)
```

**Features:**

- Superscript badge styling
- Hover effects
- Semantic HTML with role="doc-noteref"
- Accessibility support
- ID-based anchor linking

**Example:**

```tsx
<FootnoteReference id="ref-1">1</FootnoteReference>
```

---

### 3. CitationBlock

Renders blockquote citations with styling.

**Props:**

- `children` (ReactNode): The citation content
- `source` (string): Optional source attribution
- `className` (string): Additional CSS classes

**Markdown Format:**

```markdown
> This is a quoted passage from a source
```

**Features:**

- Left border accent
- Decorative quote mark
- Optional source attribution
- Italic text styling
- Hover effects
- Dark mode support

**Example:**

```tsx
<CitationBlock source="Research Paper, 2024">
  This is an important finding from the research.
</CitationBlock>
```

---

### 4. SearchResultCard

Renders rich search result cards with metadata.

**Props:**

- `title` (string): Result title
- `url` (string): Source URL
- `snippet` (string): Content preview
- `score` (number): Relevance score (0-1)
- `className` (string): Additional CSS classes

**Features:**

- Card-based layout
- Title, URL, and snippet display
- Domain extraction from URL
- Relevance score badge
- Text truncation with ellipsis
- Hover effects
- Accessible semantic HTML

**Example:**

```tsx
<SearchResultCard
  title="Example Article"
  url="https://example.com/article"
  snippet="This is a brief description of the article content..."
  score={0.95}
/>
```

---

### 5. useMarkdownRenderers Hook

Returns memoized custom markdown renderers for CopilotKit.

**Returns:**

- Object with custom renderer functions for markdown tags

**Supported Tags:**

- `a` (links): Handles source:, ref:, and HTTP(S) links
- `blockquote`: Citation blocks
- `code`: Inline and block code
- `pre`: Code block wrapper
- `h1`, `h2`, `h3`: Headings
- `ul`, `ol`: Lists
- `table`: Responsive tables

**Example:**

```tsx
const markdownRenderers = useMarkdownRenderers();

<CopilotChat markdownTagRenderers={markdownRenderers} />
```

## 🎨 Styling

All components use CSS from `styles.css` with:

### Features

- **Gradient backgrounds** for visual depth
- **Hover effects** with smooth transitions
- **Dark mode support** via media queries
- **Responsive design** for mobile devices
- **Print-friendly styles** for documentation
- **Accessibility focus states**
- **Animation utilities**

### CSS Classes

| Component | Main Class | Modifiers |
|-----------|-----------|-----------|
| SourceReference | `.source-reference` | `.source-icon`, `.source-text` |
| FootnoteReference | `.footnote-reference` | - |
| CitationBlock | `.citation-block` | `.citation-content`, `.citation-source` |
| SearchResultCard | `.search-result-card` | `.search-result-header`, `.search-result-title`, etc. |

### Dark Mode

All components automatically adapt to dark mode using:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

### Customization

To customize styles, you can:

1. **Override CSS variables** (if using CSS custom properties)
2. **Add custom classes** via the `className` prop
3. **Modify `styles.css`** for global changes

Example:

```tsx
<SourceReference className="my-custom-source" href="...">
  Custom Styled Source
</SourceReference>
```

```css
.my-custom-source {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

## 🔧 Configuration

### Adding New Custom Renderers

To add a new markdown renderer, edit `index.tsx`:

```tsx
export function useMarkdownRenderers() {
  const markdownTagRenderers = useMemo(
    () => ({
      // ... existing renderers

      // Add new custom renderer
      yourTag: ({ children, ...props }: MarkdownComponentProps) => (
        <YourCustomComponent {...props}>
          {children}
        </YourCustomComponent>
      ),
    }),
    []
  );

  return markdownTagRenderers;
}
```

### TypeScript Support

All components have full TypeScript support with exported interfaces:

```tsx
import type {
  SourceReferenceProps,
  FootnoteReferenceProps,
  CitationBlockProps,
} from '@/app/components/markdown';
```

## 📋 Markdown Format Reference

### Agent Output Format

When the search agent generates markdown, use these formats:

**Source Links:**

```markdown
According to [Google](source:https://google.com), ...
```

**Footnotes:**

```markdown
This is a fact[1](ref:footnote-1).
```

**Citations:**

```markdown
> "This is a direct quote from a source"
```

**Auto-conversion:**

- Any `http://` or `https://` link is automatically converted to a SourceReference
- No need to add "source:" prefix for HTTP(S) URLs

### Backend Agent Configuration

In your agent's instructions (e.g., `backend/src/agents/search_agent/agent.py`):

```python
instructions="""你是搜索助手。使用 Tavily 搜索网络并回答问题。

链接格式规则（必须遵守）：
- 每个链接必须写成: [标题](source:URL)
- URL 从 Tavily 结果的 url 字段复制
- 标题简洁清晰，描述来源内容

引用格式：
- 使用 > 符号创建引用块
- 脚注使用 [数字](ref:id) 格式
"""
```

## 🧪 Testing

### Visual Testing

1. Start the dev server: `npm run dev`
2. Navigate to the search page
3. Test various markdown formats:
   - Links with `source:` prefix
   - HTTP(S) URLs
   - Footnote references
   - Blockquotes

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { SourceReference } from '@/app/components/markdown';

test('renders source reference with icon', () => {
  render(
    <SourceReference href="source:https://example.com">
      Example
    </SourceReference>
  );

  expect(screen.getByText('Example')).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
});
```

## 🔍 Debugging

### Console Logging

The old implementation had console.log statements. These have been removed in the new modular version for cleaner code. To debug:

1. **Check component props** in React DevTools
2. **Inspect DOM elements** for correct classes
3. **Verify CSS loading** in Network tab
4. **Test markdown parsing** in browser console

### Common Issues

**Issue: Styles not applying**

- ✅ Ensure `styles.css` is imported in `style.css`
- ✅ Check for CSS specificity conflicts
- ✅ Verify class names match between TSX and CSS

**Issue: Links not working**

- ✅ Check `href` format (with/without "source:" prefix)
- ✅ Verify URL is valid
- ✅ Test with `data-valid-url` attribute

**Issue: Dark mode not working**

- ✅ Check `prefers-color-scheme` media query
- ✅ Verify browser/OS dark mode settings
- ✅ Test with browser DevTools device emulation

## 📚 Additional Resources

- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [CopilotKit Markdown Rendering](https://docs.copilotkit.ai/custom-look-and-feel/markdown-rendering)
- [React Markdown Components](https://github.com/remarkjs/react-markdown)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

When adding new components:

1. **Create separate component file** in this directory
2. **Add TypeScript interfaces** for props
3. **Export from `index.tsx`**
4. **Add styles to `styles.css`**
5. **Update this README** with documentation
6. **Test thoroughly** with various inputs

## 📝 Changelog

### v2.0.0 (Current)

- ✨ Modular component architecture
- ✨ Full TypeScript support
- ✨ Enhanced accessibility (ARIA labels, semantic HTML)
- ✨ Improved dark mode support
- ✨ New SearchResultCard component
- ✨ Responsive design improvements
- ✨ Print-friendly styles
- ✨ Animation utilities
- 🔧 Comprehensive documentation
- 🔧 Better CSS organization

### v1.0.0 (Legacy)

- Basic SourceReference and FootnoteReference
- Inline component definitions
- Basic CSS styles

## 📄 License

This code is part of the agent-ui-project and follows the project's license.

---

**Last Updated:** 2025-01-24
**Maintained By:** agent-ui-project team
