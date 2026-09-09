import React, { useState } from "react";
import { Bug, Play, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { DEBUG_CHALLENGES } from "../data/curriculum";
import { runPythonCode } from "../services/pyodideRunner";
import { ExecutionResult } from "../types/mentor";

export const DebugArenaView: React.FC = () => {
  const [selectedBugIndex, setSelectedBugIndex] = useState(0);
  const challenge = DEBUG_CHALLENGES[selectedBugIndex];
  const [code, setCode] = useState(challenge.brokenCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  const handleSelectBug = (idx: number) => {
    setSelectedBugIndex(idx);
    setCode(DEBUG_CHALLENGES[idx].brokenCode);
    setResult(null);
    setIsResolved(false);
  };

  const handleRunAndVerify = async () => {
    setIsRunning(true);
    try {
      const res = await runPythonCode(code);
      setResult(res);
      const passed = challenge.validationRule(code, res.stdout);
      if (passed) {
        setIsResolved(true);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(challenge.brokenCode);
    setResult(null);
    setIsResolved(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14] text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-400" />
            <h1 className="text-lg font-bold text-white">Debug Arena & Bug Lab</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real programmers spend 70% of their time debugging. Learn to read tracebacks, trace execution state, and squash bugs.
          </p>
        </div>

        {/* Bug Selector Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {DEBUG_CHALLENGES.map((ch, idx) => (
            <button
              key={ch.id}
              onClick={() => handleSelectBug(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedBugIndex === idx
                  ? "bg-rose-600/20 text-rose-300 border border-rose-500/40"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              Bug #{idx + 1}: {ch.title}
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Code Editor */}
          <div className="bg-[#121722] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[460px]">
            <div className="px-4 py-2.5 bg-[#161c28] border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">buggy_script.py</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                  title="Reset buggy code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRunAndVerify}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? "Testing..." : "Test Fix"}</span>
                </button>
              </div>
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

          {/* Right: Diagnosis & Output */}
          <div className="space-y-4">
            {/* Bug Brief */}
            <div className="bg-[#121722] border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{challenge.title}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-800/40">
                  {challenge.difficulty}
                </span>
              </div>
              <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-xs text-rose-200 mb-3">
                <span className="font-semibold text-rose-400">Diagnosis: </span>
                {challenge.bugExplanation}
              </div>

              {isResolved && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bug squashed! The solution satisfies the expected behavior.</span>
                </div>
              )}
            </div>

            {/* Terminal Output */}
            <div className="bg-[#090c10] border border-slate-800 rounded-2xl p-4 font-mono text-xs h-[230px] flex flex-col">
              <span className="text-[11px] font-semibold text-slate-400 uppercase mb-2 block">
                Execution Output:
              </span>
              <div className="flex-1 overflow-y-auto space-y-2">
                {!result ? (
                  <span className="text-slate-600 italic">Click &quot;Test Fix&quot; to run Python...</span>
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
