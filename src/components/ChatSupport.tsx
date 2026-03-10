"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/api";

const SUGGESTIONS = [
  "How do I add items?",
  "How to create a request?",
  "Where to see approvals?",
];

export default function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getUserRole = () => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          return user.role || "guest";
        } catch (e) {
          return "guest";
        }
      }
    }
    return "guest";
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history, isLoading]);

  const handleSend = async (forcedQuery?: string) => {
    const textToSend = forcedQuery || query;
    if (!textToSend.trim() || isLoading) return;

    const currentRole = getUserRole();

    const userMessage = { role: "user", content: textToSend };
    setHistory((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await api.chat.response({
        query: userMessage.content,
        context: { userRole: currentRole }, 
        chatHistory: history,
      });

      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[550px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 origin-bottom-right">
          {/* HEADER */}
          <div className="bg-gray-900 p-5 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-black text-xs">
                AI
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">System Guide</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* CHAT BODY */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#F8F9FA]"
          >
            {history.length === 0 && (
              <div className="space-y-4 pt-4">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                  <p className="text-gray-800 text-sm font-medium mb-1">
                    Welcome! 👋
                  </p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    I'm your procurement assistant. How can I help you navigate
                    the system today?
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="text-left text-[11px] font-semibold text-gray-600 bg-white border border-gray-200 py-2 px-3 rounded-xl hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gray-900 text-white rounded-tr-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <div className="prose prose-sm prose-orange max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium uppercase italic">
                  {msg.role === "user" ? "You" : "Assistant"}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-1.5 p-2 items-center bg-gray-100 w-16 justify-center rounded-full">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a question..."
                className="w-full text-sm pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-black"
              />
              <button
                onClick={() => handleSend()}
                disabled={!query.trim() || isLoading}
                className="absolute right-2 p-2 bg-gray-900 text-white rounded-xl hover:bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400 transition-colors shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 7-7 7 7" />
                  <path d="M12 19V5" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">
              Powered by Procurement RAG Engine
            </p>
          </div>
        </div>
      )}

      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 border-4 border-white ${
          isOpen ? "bg-gray-900 rotate-90" : "bg-orange-500 hover:scale-110"
        }`}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            className="group-hover:animate-bounce"
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
