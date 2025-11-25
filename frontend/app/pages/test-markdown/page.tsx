"use client";
import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import "../../style.css";
import { useMarkdownRenderers } from "@/app/components/markdown";

export default function TestMarkdownPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="SearchAgent">
      <TestContent />
    </CopilotKit>
  );
}

function TestContent() {
  const markdownRenderers = useMarkdownRenderers();

  // Test markdown content
  const testMarkdown = `
# Testing Markdown Link Rendering

## Test 1: Standard HTTPS Links
This is a standard link: [Google](https://google.com)

## Test 2: HTTP Links
This is an HTTP link: [Example](http://example.com)

## Test 3: source: Prefix (Original)
This is a link with source prefix: [OpenAI](source:https://openai.com)

## Test 3b: Testing with # Prefix
This is a link with # prefix: [OpenAI](#source:https://openai.com)

## Test 4: Footnote References (Original)
AI development is rapid[1](ref:1), with widespread applications[2](ref:2)

## Test 4b: Testing with # Prefix
AI development is rapid[1](#ref:1), with widespread applications[2](#ref:2)

## Test 5: Blockquotes
> "This is a quoted content"

## References (Footnote Definitions - Using #source Format)

1. [Source 1 - Example Source 1](#source:1:https://example.com/source1)
2. [Source 2 - Example Source 2](#source:2:https://example.com/source2)

`;


  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Markdown Rendering Test</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test Markdown Content:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {testMarkdown}
        </pre>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Rendering Result (Using CopilotChat):</h2>
        <div className="border rounded-lg" style={{ height: "600px" }}>
          <CopilotChat
            className="h-full"
            markdownTagRenderers={markdownRenderers}
            labels={{
              initial: testMarkdown,
            }}
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Open browser console (F12) to view debug logs</li>
          <li>Check the href attribute of each link</li>
          <li>Click links to test if they open normally</li>
          <li>View <code>[Markdown Link Renderer]</code> logs</li>
        </ul>
      </div>
    </div>
  );
}
