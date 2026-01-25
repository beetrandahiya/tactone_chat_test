"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      onError: (err) => {
        console.error("useChat error:", err);
        console.error("Error message:", err.message);
      },
      onResponse: (response) => {
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      },
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main
      className="flex flex-col h-[calc(100vh-64px)] max-w-2xl mx-auto"
      role="main"
      aria-label="Chat with Building Concierge"
    >
      {/* Messages Area */}
      <section
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-label="Chat messages"
        aria-live="polite"
        aria-atomic="false"
      >
        {/* Welcome message when no messages */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary-600" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome to Building Concierge
            </h2>
            <p className="text-gray-600 max-w-md">
              I&apos;m here to help you with information about building
              amenities, rules, navigation, and any other questions you may
              have. How can I assist you today?
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                "What are the gym hours?",
                "Tell me about parking",
                "Building rules",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (inputRef.current) {
                      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        "value"
                      )?.set;
                      nativeInputValueSetter?.call(inputRef.current, suggestion);
                      const event = new Event("input", { bubbles: true });
                      inputRef.current.dispatchEvent(event);
                      inputRef.current.focus();
                    }
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((message) => (
          <article
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
            aria-label={`${message.role === "user" ? "You" : "Assistant"} said`}
          >
            <div
              className={`flex items-start gap-3 max-w-[85%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-primary-600"
                    : "bg-gray-200"
                }`}
                aria-hidden="true"
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`px-4 py-3 rounded-2xl shadow-soft ${
                  message.role === "user"
                    ? "bg-primary-600 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {message.role === "user" ? (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                ) : (
                  <div className="prose prose-sm prose-gray max-w-none">
                    <ReactMarkdown
                      components={{
                        // Custom styling for markdown elements
                        p: ({ children }) => (
                          <p className="text-sm leading-relaxed mb-2 last:mb-0">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="text-sm list-disc list-inside mb-2 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="text-sm list-decimal list-inside mb-2 space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-base font-bold mb-2">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-sm font-bold mb-2">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-semibold mb-1">{children}</h3>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start" aria-live="polite">
            <div className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                aria-hidden="true"
              >
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-gray-100 shadow-soft">
                <div className="flex items-center gap-2">
                  <Loader2
                    className="w-4 h-4 text-gray-500 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="flex justify-center"
            role="alert"
            aria-live="assertive"
          >
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <p>
                Sorry, something went wrong. Please try again or contact
                building management if the issue persists.
              </p>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />
      </section>

      {/* Input Area */}
      <section
        className="border-t border-gray-200 bg-white p-4"
        aria-label="Message input"
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3"
          aria-label="Send a message"
        >
          <label htmlFor="chat-input" className="sr-only">
            Type your message to the building concierge
          </label>
          <input
            ref={inputRef}
            id="chat-input"
            name="message"
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about amenities, rules, or directions..."
            disabled={isLoading}
            autoComplete="off"
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            aria-describedby="input-hint"
          />
          <span id="input-hint" className="sr-only">
            Press Enter to send your message or click the send button
          </span>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="flex-shrink-0 w-11 h-11 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 
                       text-white rounded-xl flex items-center justify-center
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500 text-center">
          For emergencies, please call 911 or building security at (555)
          123-4567
        </p>
      </section>
    </main>
  );
}
