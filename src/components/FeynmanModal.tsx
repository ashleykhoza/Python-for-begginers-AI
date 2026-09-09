import React, { useState } from "react";
import { X, Sparkles, Brain, CheckCircle2, MessageSquare } from "lucide-react";
import { TopicItem } from "../types/mentor";

interface FeynmanModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicItem;
  code: string;
  onVerifyMastery: (explanation: string) => Promise<{ verified: boolean; feedback: string }>;
}

export const FeynmanModal: React.FC<FeynmanModalProps> = ({
  isOpen,
  onClose,
  topic,
  code,
  onVerifyMastery,
}) => {
  const [explanation, setExplanation] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; feedback: string } | null>(null);

  if (!isOpen) return null;

  const handleEvaluate = async () => {
    if (!explanation.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await onVerifyMastery(explanation);
      setResult(res);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#161c28]">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Feynman Technique: Concept Verification
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-purple-950/20 border border-purple-800/30 rounded-xl text-xs text-purple-200 leading-relaxed">
            <span className="font-semibold text-purple-400">The Feynman Principle: </span>
            &quot;If you cannot explain something in simple words to a curious beginner, you do not truly understand it yet.&quot; Running code is not enough — explain your thought process!
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Conceptual Question for {topic.title}:
            </label>
            <div className="text-xs text-sky-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-medium">
              {topic.feynmanPrompt}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Plain-Language Explanation:
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              disabled={isEvaluating || result?.verified}
              placeholder="Explain how this works step-by-step as if teaching a friend..."
              rows={4}
              className="w-full bg-slate-900/90 text-slate-100 text-xs p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500 leading-relaxed"
            />
          </div>

          {result && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                result.verified
                  ? "bg-emerald-950/30 text-emerald-200 border-emerald-800/40"
                  : "bg-amber-950/30 text-amber-200 border-amber-800/40"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {result.verified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified Mastery Granted!</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Mentor Feedback:</span>
                  </>
                )}
              </div>
              <p className="whitespace-pre-wrap">{result.feedback}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            {!result?.verified ? (
              <button
                onClick={handleEvaluate}
                disabled={!explanation.trim() || isEvaluating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEvaluating ? "Verifying..." : "Verify Understanding"}</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
