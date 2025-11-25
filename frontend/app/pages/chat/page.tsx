"use client";
import "@copilotkit/react-ui/styles.css";
import "../../style.css";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { useMarkdownRenderers } from "@/app/components/markdown";
import { useRawResponseLogger } from "@/app/components/RawResponseLogger";
import { TwoPanelLayout } from "@/app/components/TwoPanelLayout";

export default function ChatPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="ChatAgent">
      <ChatAgentPage />
    </CopilotKit>
  );
}

function ChatAgentPage() {
  useRawResponseLogger();
  const markdownTagRenderers = useMarkdownRenderers();

  return (
    <TwoPanelLayout actionRenderers={{}}>
      <ChatAgentContent markdownTagRenderers={markdownTagRenderers} />
    </TwoPanelLayout>
  );
}

function ChatAgentContent({
  markdownTagRenderers,
}: {
  markdownTagRenderers: any;
}) {
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
            initial: "Hi, I'm a chat agent. How can I help you?",
          }}
          suggestions={[
            {
              title: "Tell me a joke",
              message: "Tell me a funny programming joke.",
            },
            {
              title: "Explain a concept",
              message: "Explain what is a REST API.",
            },
          ]}
        />
      </div>
    </div>
  );
}
