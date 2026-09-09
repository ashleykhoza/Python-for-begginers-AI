import React, { useState } from "react";
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { PREDICT_CHALLENGES } from "../data/curriculum";

export const PredictorView: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const challenge = PREDICT_CHALLENGES[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentIndex((prev) => (prev + 1) % PREDICT_CHALLENGES.length);
  };

  const isCorrect = selectedOption === challenge.correct;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14] text-slate-100">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold text-white">Mental Execution & Predictor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mentally trace variable state, references, and control flow before looking at the console.
          </p>
        </div>

        <div className="bg-[#121722] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <span>Challenge {currentIndex + 1} of {PREDICT_CHALLENGES.length}</span>
            <span className="font-mono text-indigo-400">Memory & Reference Tracing</span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase mb-2 tracking-wider">
              Python Snippet:
            </h3>
            <pre className="bg-[#090c10] border border-slate-800/80 p-4 rounded-xl font-mono text-sm text-sky-300 overflow-x-auto leading-relaxed">
              {challenge.code}
            </pre>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase mb-2.5 tracking-wider">
              What does this code print?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {challenge.options.map((opt, idx) => {
                const isChosen = selectedOption === idx;
                const isTheCorrectOne = idx === challenge.correct;

                let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800";
                if (isAnswered) {
                  if (isTheCorrectOne) {
                    btnStyle = "bg-emerald-950/40 border-emerald-600 text-emerald-300 font-bold";
                  } else if (isChosen && !isCorrect) {
                    btnStyle = "bg-rose-950/40 border-rose-600 text-rose-300";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={`p-3.5 rounded-xl border text-left font-mono text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isTheCorrectOne && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-2 shrink-0" />
                    )}
                    {isAnswered && isChosen && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 ml-2 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {isAnswered && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                isCorrect
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                  : "bg-amber-950/20 border-amber-800/40 text-amber-200"
              }`}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{isCorrect ? "Correct deduction!" : "Common pitfall:"}</span>
              </div>
              <p>{challenge.explanation}</p>
            </div>
          )}

          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
