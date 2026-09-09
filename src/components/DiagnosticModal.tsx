import React, { useState } from "react";
import { X, CheckCircle, AlertCircle, ArrowRight, Award, Sparkles, BookOpen } from "lucide-react";
import { DIAGNOSTIC_QUESTIONS } from "../data/assessmentQuestions";
import { LearnerLevel, LearnerProfile } from "../types/mentor";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResults: (
    level: LearnerLevel,
    weaknesses: string[],
    recommendedTopicId: string
  ) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  onApplyResults,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIndex];
  const totalQ = DIAGNOSTIC_QUESTIONS.length;

  const handleSelectOption = (optIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optIndex });
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    const weakTopics: string[] = [];

    DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected !== undefined && q.options[selected]?.correct) {
        correctCount++;
      } else {
        if (!weakTopics.includes(q.topic)) {
          weakTopics.push(q.topic);
        }
      }
    });

    const scorePct = Math.round((correctCount / totalQ) * 100);
    let level: LearnerLevel = "Complete Beginner";
    let startTopic = "vars-types";

    if (scorePct >= 85) {
      level = "Advanced";
      startTopic = "functions-scope";
    } else if (scorePct >= 60) {
      level = "Intermediate";
      startTopic = "functions-scope";
    } else if (scorePct >= 35) {
      level = "Beginner";
      startTopic = "conditionals-logic";
    } else {
      level = "Complete Beginner";
      startTopic = "vars-types";
    }

    return { scorePct, correctCount, level, weakTopics, startTopic };
  };

  const results = isFinished ? calculateResults() : null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#161c28]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Adaptive Python Diagnostic Assessment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isFinished ? (
            <div>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Question {currentIndex + 1} of {totalQ}</span>
                  <span className="font-mono text-sky-400">{currentQ.topic}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-200 whitespace-pre-line leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIndex] === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-sky-600/20 border-sky-500 text-sky-200 font-semibold"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                      }`}
                    >
                      <span>{opt.text}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-sky-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentIndex] === undefined}
                  className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-40"
                >
                  <span>{currentIndex === totalQ - 1 ? "Finish & View Analysis" : "Next Question"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            results && (
              <div className="space-y-5">
                <div className="text-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                  <Award className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-white mb-1">
                    Diagnostic Analysis Complete
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated Level:{" "}
                    <span className="text-sky-400 font-bold font-mono text-sm">
                      {results.level}
                    </span>{" "}
                    ({results.correctCount}/{totalQ} correct - {results.scorePct}%)
                  </p>
                </div>

                {/* Weaknesses Detected */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">
                    Identified Areas for Mentorship:
                  </h4>
                  {results.weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {results.weakTopics.map((topic, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-rose-950/40 text-rose-300 border border-rose-800/40 px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400">
                      Exceptional performance! No fundamental weak areas detected.
                    </p>
                  )}
                </div>

                {/* Recommendation */}
                <div className="p-3.5 bg-sky-950/20 border border-sky-800/30 rounded-xl text-xs text-sky-200">
                  <span className="font-semibold text-sky-400">Tailored Starting Point: </span>
                  Based on your diagnostic score, your curriculum path has been calibrated to begin with{" "}
                  <span className="font-mono font-bold text-white">{results.startTopic}</span> to maximize efficiency without redundant beginner steps.
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => {
                    onApplyResults(results.level, results.weakTopics, results.startTopic);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Calibrate My Profile & Start Tailored Curriculum</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
