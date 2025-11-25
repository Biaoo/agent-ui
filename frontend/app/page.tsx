"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";

// Simple store for mount state to avoid useEffect warning
const mountStore = {
  mounted: false,
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    // Set mounted on first subscription (client-side only)
    if (!this.mounted) {
      this.mounted = true;
      this.listeners.forEach((l) => l());
    }
    return () => this.listeners.delete(listener);
  },
  getSnapshot() {
    return this.mounted;
  },
  getServerSnapshot() {
    return false;
  },
};

interface AgentItem {
  href: string;
  icon: string;
  name: string;
  description: string;
  tags: { label: string; color: string }[];
  gradient: string;
}

const agents: AgentItem[] = [
  {
    href: "/pages/search",
    icon: "🔍",
    name: "Search Agent",
    description: "Web search powered by Tavily with real-time information",
    tags: [
      { label: "Web Search", color: "bg-blue-100 text-blue-700" },
      { label: "Real-time", color: "bg-green-100 text-green-700" },
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    href: "/pages/chat",
    icon: "💬",
    name: "Chat Agent",
    description: "General-purpose conversational AI for Q&A and creative tasks",
    tags: [
      { label: "Conversation", color: "bg-green-100 text-green-700" },
      { label: "Q&A", color: "bg-yellow-100 text-yellow-700" },
    ],
    gradient: "from-green-500 to-emerald-500",
  },
];

const demoPages: { href: string; name: string; description: string }[] = [
  {
    href: "/pages/font-demo",
    name: "Font Demo",
    description: "Typography and font configuration showcase",
  },
  {
    href: "/pages/test-markdown",
    name: "Markdown Test",
    description: "Markdown rendering test page",
  },
];

export default function HomePage() {
  const mounted = useSyncExternalStore(
    mountStore.subscribe.bind(mountStore),
    mountStore.getSnapshot.bind(mountStore),
    mountStore.getServerSnapshot.bind(mountStore)
  );

  return (
    <div className="h-full bg-linear-to-br from-slate-50 via-white to-slate-100 flex flex-col overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 overflow-auto relative z-10">
        {/* Header */}
        <div
          className={`mb-6 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-size-[200%_auto]">
              AG-UI Demo
            </span>
          </h1>
          <p className="text-slate-500">
            A demonstration of AI Agent user interfaces with AG-UI protocol
          </p>
        </div>

        {/* Agent List */}
        <section
          className={`mb-4 transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Agents
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
            {agents.map((agent, index) => (
              <Link key={agent.href} href={agent.href}>
                <div
                  className={`group flex items-center gap-3 px-4 py-3 hover:bg-linear-to-r hover:from-slate-50 hover:to-white transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${150 + index * 75}ms` }}
                >
                  {/* Hover gradient bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b ${agent.gradient} transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top`} />

                  {/* Icon with animation */}
                  <div className="text-2xl shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    {agent.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {agent.description}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${tag.color} transform group-hover:scale-105 transition-transform duration-300`}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  {/* Arrow with animation */}
                  <svg
                    className="w-5 h-5 text-slate-400 shrink-0 transform group-hover:translate-x-1 group-hover:text-slate-600 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Demo Pages */}
        <section
          className={`transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Demo Pages
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
            {demoPages.map((page, index) => (
              <Link key={page.href} href={page.href}>
                <div
                  className={`group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all duration-300 cursor-pointer ${
                    mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${400 + index * 75}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors">
                      {page.name}
                    </h3>
                    <p className="text-sm text-slate-500">{page.description}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-400 shrink-0 transform group-hover:translate-x-1 group-hover:text-slate-600 transition-all duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer
        className={`text-center text-xs text-slate-500 py-3 relative z-10 transition-all duration-700 delay-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p>
          Powered by Next.js · CopilotKit · Agno · AG-UI Protocol
        </p>
      </footer>
    </div>
  );
}
