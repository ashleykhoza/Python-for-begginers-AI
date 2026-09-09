import React from "react";
import { Database, CheckCircle2, ArrowRight, Table } from "lucide-react";
import { DATA_SCIENCE_TOPICS } from "../data/curriculum";
import { LearnerProfile } from "../types/mentor";

interface DataScienceViewProps {
  profile: LearnerProfile;
  onSelectTopic: (topicId: string) => void;
}

export const DataScienceView: React.FC<DataScienceViewProps> = ({
  profile,
  onSelectTopic,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14] text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-white">Data Science Career Track</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transition from general programming to numerical computing, data munging, and statistical validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA_SCIENCE_TOPICS.map((topic, idx) => {
            const isMastered = profile.masteredTopics.includes(topic.id);
            return (
              <div
                key={topic.id}
                className="bg-[#121722] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded">
                      Module #{idx + 1} • {topic.level}
                    </span>
                    {isMastered && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mastered
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1.5">{topic.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {topic.explanation}
                  </p>
                </div>

                <button
                  onClick={() => onSelectTopic(topic.id)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-slate-700/60 flex items-center justify-center gap-2"
                >
                  <span>{isMastered ? "Review Module" : "Launch Module"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
