import React, { useState, useEffect } from "react";
import {
  Award,
  Flame,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Brain,
  Layers,
  FileCode2,
} from "lucide-react";
import { LearnerProfile, TopicItem } from "../types/mentor";
import { CORE_TOPICS, DATA_SCIENCE_TOPICS } from "../data/curriculum";
import { fetchMentorRecommendation } from "../services/geminiMentor";

interface DashboardViewProps {
  profile: LearnerProfile;
  onSelectTopic: (topicId: string) => void;
  onOpenDiagnostic: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  onSelectTopic,
  onOpenDiagnostic,
}) => {
  const [recommendation, setRecommendation] = useState<string>("Analyzing your coding profile...");
  const [isLoadingRec, setIsLoadingRec] = useState<boolean>(false);

  const allTopics = [...CORE_TOPICS, ...DATA_SCIENCE_TOPICS];
  const masteredCount = profile.masteredTopics.length;
  const totalCount = allTopics.length;
  const progressPercent = Math.round((masteredCount / totalCount) * 100);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingRec(true);
    fetchMentorRecommendation({
      learnerProfile: profile,
      completedTopics: profile.masteredTopics,
      currentTopic: profile.currentTopicId,
    }).then((rec) => {
      if (isMounted) {
        setRecommendation(rec);
        setIsLoadingRec(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [profile.masteredTopics.length, profile.currentTopicId, profile.level]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14] text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#121722] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-950/50">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Learner Mastery Profile</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {profile.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Active Track: <span className="text-slate-200 font-medium">{profile.careerTrack}</span> • Goal: {profile.learningGoal}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase text-slate-500 font-mono block">Day Streak</span>
              <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {profile.streak} Days
              </span>
            </div>

            <button
              onClick={onOpenDiagnostic}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              Retake Diagnostic
            </button>
          </div>
        </div>

        {/* AI Mentor Recommendation Card */}
        <div className="bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-[#121722] border border-sky-800/40 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-600/20 rounded-lg text-sky-400 shrink-0 mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Your Mentor&apos;s Tailored Recommendation
                </h2>
                {isLoadingRec && <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Grid for Metrics & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Track Mastery Progress */}
          <div className="bg-[#121722] border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Curriculum Mastery ({masteredCount}/{totalCount})
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="space-y-2">
              {allTopics.map((topic) => {
                const isMastered = profile.masteredTopics.includes(topic.id);
                return (
                  <div
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      {isMastered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                      )}
                      <span className={isMastered ? "text-slate-200 font-medium" : "text-slate-400"}>
                        {topic.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {topic.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pitfalls & Misconception Log */}
          <div className="bg-[#121722] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Detected Learning Pitfalls
              </h2>
              <p className="text-xs text-slate-400 mb-3">
                The AI monitors your syntax patterns, runtime tracebacks, and logic errors to target reinforcement exercises.
              </p>

              {profile.recurringMistakes.length > 0 ? (
                <div className="space-y-2">
                  {profile.recurringMistakes.map((err, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200 flex items-start gap-2"
                    >
                      <span className="font-mono text-amber-400 font-bold">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
                  No recurring misconceptions logged yet. Run more exercises or debug challenges to calibrate your diagnostics!
                </div>
              )}
            </div>

            {/* Recent Errors */}
            {profile.recentErrors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800/60">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Recent Runtime Exceptions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.recentErrors.map((err, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono bg-rose-950/30 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded"
                    >
                      {err}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
