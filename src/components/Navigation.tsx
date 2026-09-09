import React from "react";
import {
  BookOpen,
  Terminal,
  Bug,
  HelpCircle,
  FolderGit2,
  Database,
  BarChart2,
  Flame,
  Cpu,
  Award,
  Sparkles,
} from "lucide-react";
import { TeacherMode, LearnerProfile } from "../types/mentor";

interface NavigationProps {
  currentMode: TeacherMode;
  onSelectMode: (mode: TeacherMode) => void;
  profile: LearnerProfile;
  onOpenDiagnostic: () => void;
  mentorStatus: { hasKey: boolean; mode: string };
}

export const Navigation: React.FC<NavigationProps> = ({
  currentMode,
  onSelectMode,
  profile,
  onOpenDiagnostic,
  mentorStatus,
}) => {
  const navItems: { mode: TeacherMode; label: string; icon: any }[] = [
    { mode: "learn", label: "Learn", icon: BookOpen },
    { mode: "practice", label: "Practice", icon: Terminal },
    { mode: "debug", label: "Debug Arena", icon: Bug },
    { mode: "predict", label: "Code Predictor", icon: HelpCircle },
    { mode: "project", label: "Projects", icon: FolderGit2 },
    { mode: "datascience", label: "Data Science", icon: Database },
    { mode: "dashboard", label: "Progress", icon: BarChart2 },
  ];

  return (
    <header className="bg-[#121721] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between select-none shrink-0 z-30">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-sky-500 flex items-center justify-center shadow-md shadow-sky-950/40">
            <span className="text-slate-950 font-black text-base font-mono tracking-tighter">Py</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm tracking-tight">Python Mentor</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                Socratic AI
              </span>
            </div>
          </div>
        </div>

        {/* Level Tag */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium text-slate-300">{profile.level}</span>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 max-w-2xl overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              onClick={() => onSelectMode(item.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-sky-600 text-white shadow-sm shadow-sky-600/30 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Streak */}
        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-mono font-medium">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{profile.streak}d</span>
        </div>

        {/* Diagnostic Assessment Trigger */}
        <button
          onClick={onOpenDiagnostic}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
          title="Take Adaptive Diagnostic Test"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Diagnostic</span>
        </button>

        {/* AI Engine Status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono border ${
            mentorStatus.hasKey
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
              : "bg-amber-950/40 text-amber-400 border-amber-800/40"
          }`}
          title={
            mentorStatus.hasKey
              ? "Connected to Gemini 2.5 Flash Socratic Mentor"
              : "Operating in Offline Heuristic Mentor Mode"
          }
        >
          <Cpu className="w-3 h-3" />
          <span className="hidden lg:inline">
            {mentorStatus.hasKey ? "Gemini 2.5 Flash" : "Offline Socratic"}
          </span>
        </div>
      </div>
    </header>
  );
};
