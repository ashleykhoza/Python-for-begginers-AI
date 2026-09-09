import React, { useState } from "react";
import { FolderGit2, Play, CheckCircle2, ChevronRight, Layers, Award } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { STAGED_PROJECTS } from "../data/curriculum";
import { runPythonCode } from "../services/pyodideRunner";
import { ExecutionResult } from "../types/mentor";

export const ProjectsView: React.FC = () => {
  const project = STAGED_PROJECTS[0];
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const stage = project.stages[currentStageIdx];
  const [code, setCode] = useState(stage.starterCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [stageCompleted, setStageCompleted] = useState(false);

  const handleSelectStage = (idx: number) => {
    setCurrentStageIdx(idx);
    setCode(project.stages[idx].starterCode);
    setResult(null);
    setStageCompleted(false);
  };

  const handleRunAndValidate = async () => {
    setIsRunning(true);
    try {
      const res = await runPythonCode(code);
      setResult(res);
      const ok = stage.validationRule(code, res.stdout);
      if (ok) {
        setStageCompleted(true);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14] text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold text-white">Project Mentor: Staged Architecture</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Build real software incrementally: Planning &rarr; Data Models &rarr; Core Business Logic &rarr; Validation.
          </p>
        </div>

        {/* Project Header */}
        <div className="bg-[#121722] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-white">{project.title}</h2>
            <span className="text-xs font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              {project.level}
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-4">{project.description}</p>

          {/* Stage Pills */}
          <div className="flex gap-2 overflow-x-auto">
            {project.stages.map((st, i) => (
              <button
                key={st.stageNumber}
                onClick={() => handleSelectStage(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                  currentStageIdx === i
                    ? "bg-amber-600 text-white font-semibold shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span>Stage {st.stageNumber}</span>
                {stageCompleted && currentStageIdx === i && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor & Test Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-[#121722] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[460px]">
            <div className="px-4 py-2.5 bg-[#161c28] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">
                project_stage_{stage.stageNumber}.py
              </span>
              <button
                onClick={handleRunAndValidate}
                disabled={isRunning}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? "Verifying..." : "Validate Stage"}</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden font-mono text-sm">
              <CodeMirror
                value={code}
                height="100%"
                theme={oneDark}
                extensions={[python()]}
                onChange={(val) => setCode(val)}
                className="h-full text-[13px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#121722] border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-white mb-2">{stage.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{stage.task}</p>

              {stageCompleted && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Stage {stage.stageNumber} successfully validated!</span>
                  </div>
                  {currentStageIdx < project.stages.length - 1 && (
                    <button
                      onClick={() => handleSelectStage(currentStageIdx + 1)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                    >
                      Next Stage
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Terminal Output */}
            <div className="bg-[#090c10] border border-slate-800 rounded-2xl p-4 font-mono text-xs h-[230px] flex flex-col">
              <span className="text-[11px] font-semibold text-slate-400 uppercase mb-2 block">
                Stage Test Console:
              </span>
              <div className="flex-1 overflow-y-auto space-y-2">
                {!result ? (
                  <span className="text-slate-600 italic">Run code to test stage output...</span>
                ) : (
                  <>
                    {result.stdout && (
                      <div className="text-emerald-300 whitespace-pre-wrap">{result.stdout}</div>
                    )}
                    {result.stderr && (
                      <div className="text-rose-400 bg-rose-950/30 p-2.5 rounded border border-rose-800/40 whitespace-pre-wrap">
                        {result.stderr}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
