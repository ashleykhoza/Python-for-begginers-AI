import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Brain,
  MessageSquare,
} from "lucide-react";
import { ChatMessage, TopicItem } from "../types/mentor";

interface SocraticChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  currentTopic: TopicItem;
  onSelectHintLevel: (level: number) => void;
  currentHintLevel: number;
}

export const SocraticChat: React.FC<SocraticChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  currentTopic,
  onSelectHintLevel,
  currentHintLevel,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const quickPrompts = [
    "What does this error mean?",
    "Why did my code fail?",
    "Can you give me a guiding hint?",
    "Explain this concept with an analogy",
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-slate-800/80">
      {/* Header with Topic Context */}
      <div className="p-3.5 border-b border-slate-800/80 bg-[#12161f] shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Socratic Python Mentor
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
            {currentTopic.level}
          </span>
        </div>
        <p className="text-xs text-slate-300 font-medium line-clamp-1">
          {currentTopic.title}
        </p>

        {/* Analogy Card */}
        {currentTopic.analogy && (
          <div className="mt-2 text-[11px] bg-sky-950/30 border border-sky-800/30 rounded-lg p-2 text-sky-200/90 leading-relaxed">
            <span className="font-semibold text-sky-400">Analogy: </span>
            {currentTopic.analogy}
          </div>
        )}
      </div>

      {/* Progressive Hint Assistance Ladder */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Assistance Ladder (Levels 1-5):
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {currentHintLevel > 0 ? `Level ${currentHintLevel} Active` : "No hints used"}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const isUnlocked = currentHintLevel >= lvl;
            return (
              <button
                key={lvl}
                onClick={() => onSelectHintLevel(lvl)}
                className={`py-1 text-[10px] font-mono font-medium rounded transition-all ${
                  isUnlocked
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 border border-slate-700/40"
                }`}
                title={`Level ${lvl} Hint`}
              >
                Lvl {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {messages.map((msg) => {
          const isAi = msg.sender === "ai" || msg.sender === "hint" || msg.sender === "feynman";
          const isHint = msg.sender === "hint";
          const isFeynman = msg.sender === "feynman";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {isAi ? (
                  <>
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span className="text-[10px] font-semibold text-sky-400 tracking-wide">
                      {isHint ? `Hint Level ${msg.hintLevel}` : isFeynman ? "Feynman Verifier" : "Python Mentor"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold text-slate-400">You</span>
                  </>
                )}
                <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
              </div>

              <div
                className={`p-3 rounded-xl text-xs leading-relaxed max-w-[92%] whitespace-pre-wrap ${
                  isAi
                    ? isHint
                      ? "bg-amber-950/20 text-amber-100 border border-amber-800/30 rounded-tl-none shadow-sm"
                      : isFeynman
                      ? "bg-emerald-950/20 text-emerald-100 border border-emerald-800/30 rounded-tl-none shadow-sm"
                      : "bg-[#161b26] text-slate-200 border border-slate-800 rounded-tl-none shadow-sm"
                    : "bg-sky-600 text-white rounded-tr-none shadow-sm shadow-sky-600/20 font-medium"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 w-fit animate-pulse">
            <Brain className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>Mentor is analyzing your logic...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 bg-slate-900/40 border-t border-slate-800/40 flex items-center gap-1.5 overflow-x-auto shrink-0">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="text-[10px] text-slate-400 hover:text-sky-300 bg-slate-800/50 hover:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/50 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-[#12161f] border-t border-slate-800/80 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question or explain your reasoning..."
          disabled={isLoading}
          className="flex-1 bg-slate-900/90 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700/60 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
          title="Send to Mentor"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
