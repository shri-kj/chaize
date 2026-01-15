"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ModelInfo {
  id: string;
  name: string;
  category: string;
}

const GEMINI_MODELS: ModelInfo[] = [
  { id: "gemini-2.5-pro", name: "2.5 Pro", category: "Gemini 2.5" },
  { id: "gemini-2.5-flash", name: "2.5 Flash", category: "Gemini 2.5" },
  { id: "gemini-2.5-flash-lite", name: "2.5 Flash Lite", category: "Gemini 2.5" },
  { id: "gemini-2.0-flash", name: "2.0 Flash", category: "Gemini 2.0" },
  { id: "gemini-2.0-flash-lite", name: "2.0 Flash Lite", category: "Gemini 2.0" },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState("");
  const [lightMode, setLightMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '56px';
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini-api-key");
    const savedModel = localStorage.getItem("gemini-model");
    const savedTheme = localStorage.getItem("chaize-theme");
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setModel(savedModel);
    if (savedTheme === "light") {
      setLightMode(true);
      document.documentElement.classList.add("light");
    }
    if (!savedApiKey) setShowSettings(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleTheme = () => {
    const newMode = !lightMode;
    setLightMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("light");
      localStorage.setItem("chaize-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("chaize-theme", "dark");
    }
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini-api-key", key);
    setError("");
  };

  const selectModel = (modelId: string) => {
    setModel(modelId);
    localStorage.setItem("gemini-model", modelId);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setError("Please add your API key first");
      setShowSettings(true);
      return;
    }

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, apiKey, model }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setMessages([...newMessages, { role: "assistant", content: data.text }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const currentModel = GEMINI_MODELS.find(m => m.id === model);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="pointer-events-auto">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-[var(--text-secondary)]">
                {currentModel?.name || model}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setError(""); }}
                className="px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] font-mono transition-all"
              >
                Clear
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-[var(--border-strong)] flex items-center justify-center transition-all"
              title={lightMode ? "Switch to dark" : "Switch to light"}
            >
              {lightMode ? (
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 animate-slide-up">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl mb-6">Settings</h2>

            {/* API Key */}
            <div className="mb-6">
              <label className="block font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                API Key
              </label>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => saveApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] transition-colors"
                />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-[var(--accent)] text-[var(--bg)] font-mono text-sm rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Get Key
                </a>
              </div>
              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
                Stored locally. Never sent to our servers.
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Model
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GEMINI_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectModel(m.id)}
                    className={`px-4 py-3 rounded-lg text-left transition-all ${
                      model === m.id
                        ? 'bg-[var(--accent)] text-[var(--bg)]'
                        : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="font-mono text-sm">{m.name}</div>
                    <div className={`text-xs mt-0.5 ${model === m.id ? 'opacity-70' : 'text-[var(--text-muted)]'}`}>
                      {m.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 pb-32">
        <div className="flex-1 max-w-3xl mx-auto w-full px-4">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-full border border-[var(--border)] flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl mb-4 font-medium">
                What&apos;s on your mind?
              </h1>
              <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto">
                Start a conversation with Gemini.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="py-8 space-y-8 stagger-children">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="animate-slide-up"
                >
                  <div className={`font-mono text-xs uppercase tracking-wider mb-2 ${msg.role === 'user' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                    {msg.role === 'user' ? 'You' : currentModel?.name}
                  </div>
                  <div className="text-lg leading-relaxed text-[var(--text)]">
                    {msg.role === 'assistant' ? (
                      <div className="prose-custom">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="animate-slide-up">
                  <div className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    {currentModel?.name}
                  </div>
                  <div className="text-lg loading-shimmer typing-cursor">
                    Thinking
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-[var(--error)] text-white font-mono text-sm">
            <span>{error}</span>
            <button onClick={() => setError("")} className="hover:opacity-70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent pt-12">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl px-5 py-4 pr-14 text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none focus:border-[var(--border-strong)] transition-colors"
              style={{ height: '56px', maxHeight: '200px', overflow: 'hidden' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              )}
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="font-mono text-xs text-[var(--text-muted)]">
              ↵ to send · shift + ↵ for new line
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
