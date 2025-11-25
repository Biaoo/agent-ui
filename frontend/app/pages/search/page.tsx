"use client";
import "@copilotkit/react-ui/styles.css";
import "../../style.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
// import { useRawResponseLogger } from "@/app/components/RawResponseLogger";
import { useMarkdownRenderers } from "@/app/components/markdown";
import { useTavilySearchAction, TavilyDetailRenderer } from "@/app/components/tool-protocol/TavilySearchPanel";
import { useAskUserQuestionAction, AskUserQuestionDetailRenderer } from "@/app/components/tool-protocol/AskUserQuestionPanel";
import { TwoPanelLayout } from "@/app/components/TwoPanelLayout";

export default function SearchPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="SearchAgent">
      <SearchAgentPage />
    </CopilotKit>
  );
}

function SearchAgentPage() {
  // useRawResponseLogger();

  // Get custom markdown renderers from the modular hook
  // Supports source: prefix, footnotes, citations, and more
  const markdownTagRenderers = useMarkdownRenderers();

  return (
    <TwoPanelLayout
      actionRenderers={{
        web_search_using_tavily: TavilyDetailRenderer,
        ask_user_question: AskUserQuestionDetailRenderer,
      }}
    >
      <SearchAgentContent markdownTagRenderers={markdownTagRenderers} />
    </TwoPanelLayout>
  );
}

function SearchAgentContent({ markdownTagRenderers }: { markdownTagRenderers: any }) {
  // Register Tavily search action for rendering search results
  // This must be called inside TwoPanelLayout (after ActionDetailProvider)
  useTavilySearchAction();
  useAskUserQuestionAction();

  return (
    <div
      className="flex justify-center items-center h-full w-full"
      data-testid="background-container"
    >
      <div className="h-full w-full md:w-8/10 md:h-8/10 rounded-lg">
        <CopilotChat
          className="h-full rounded-2xl max-w-6xl mx-auto"
          markdownTagRenderers={markdownTagRenderers}
          labels={{
            initial:
              "Hi, I'm a search agent with web search capabilities. How can I help you?",
          }}
          suggestions={[
            {
              title: "Search news",
              message: "What are the latest developments in AI?",
            },
            {
              title: "Research topic",
              message:
                "Find information about renewable energy trends in 2024.",
            },
            {
              title: "Compare products",
              message:
                "Compare the features of the latest iPhone and Samsung Galaxy.",
            },
          ]}
        />
      </div>
    </div>
  );
}
