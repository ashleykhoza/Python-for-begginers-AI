import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  Play,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Terminal as TerminalIcon,
  ChevronRight,
  AlertCircle,
  Clock,
  BookCheck,
} from "lucide-react";
import { TopicItem, ExecutionResult } from "../types/mentor";

interface CodeWorkspaceProps {
  code: string;
  onChangeCode: (val: string) => void;
  onRunCode: () => void;
  onSubmitForReview: () => void;
  onOpenFeynman: () => void;
  onResetCode: () => void;
  onNextTopic: () => void;
  isRunning: boolean;
  isEvaluating: boolean;
  currentTopic: TopicItem;
  executionResult: ExecutionResult | null;
  isMastered: boolean;
  hasNextTopic: boolean;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  code,
  onChangeCode,
  onRunCode,
  onSubmitForReview,
  onOpenFeynman,
  onResetCode,
  onNextTopic,
  isRunning,
  isEvaluating,
  currentTopic,
  executionResult,
  isMastered,
  hasNextTopic,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#0b0e14]">
      {/* Exercise Goal & Objective Bar */}
      <div className="px-4 py-2.5 bg-[#111622] border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Goal:</span>
          <span className="text-xs text-sky-300 font-medium">{currentTopic.goal}</span>
        </div>
        {isMastered && (
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded text-xs font-mono font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mastered</span>
          </div>
        )}
      </div>

      {/* Editor Header Bar */}
      <div className="px-4 py-2 bg-[#0d1119] border-b border-slate-800/60 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span>main.py</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetCode}
            disabled={isRunning}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md text-xs font-medium shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? "Running..." : "Run Code"}</span>
          </button>

          <button
            onClick={onSubmitForReview}
            disabled={isRunning || isEvaluating}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 rounded-md text-xs font-medium shadow-sm transition-all disabled:opacity-50"
          >
            <BookCheck className="w-3.5 h-3.5" />
            <span>{isEvaluating ? "Evaluating..." : "Submit & Test"}</span>
          </button>

          {isMastered && (
            <button
              onClick={onOpenFeynman}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded-md text-xs font-medium transition-all"
              title="Verify conceptual understanding"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feynman Check</span>
            </button>
          )}

          {hasNextTopic && (
            <button
              onClick={onNextTopic}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CodeMirror Python Editor */}
      <div className="flex-1 overflow-hidden relative font-mono text-sm">
        <CodeMirror
          value={code}
          height="100%"
          theme={oneDark}
          extensions={[python()]}
          onChange={onChangeCode}
          className="h-full text-[13px]"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
          }}
        />
      </div>

      {/* Terminal / Output Console */}
      <div className="h-44 border-t border-slate-800/80 bg-[#090c10] flex flex-col shrink-0">
        <div className="px-3 py-1.5 bg-[#0e1218] border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-slate-300">Terminal Output</span>
            {executionResult && (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {executionResult.executionTime}
              </span>
            )}
          </div>
          {executionResult && (
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                executionResult.success
                  ? "text-emerald-400 bg-emerald-950/30"
                  : "text-rose-400 bg-rose-950/30"
              }`}
            >
              {executionResult.success ? "Exit Code 0" : "Execution Failed"}
            </span>
          )}
        </div>

        <div className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-1">
          {!executionResult ? (
            <span className="text-slate-600 italic">
              Click &quot;Run Code&quot; to execute in the in-browser WebAssembly Python runtime...
            </span>
          ) : (
            <>
              {executionResult.stdout && (
                <div className="text-emerald-300 whitespace-pre-wrap">
                  {executionResult.stdout}
                </div>
              )}
              {executionResult.stderr && (
                <div className="text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/30 whitespace-pre-wrap flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{executionResult.stderr}</div>
                </div>
              )}
              {!executionResult.stdout && !executionResult.stderr && (
                <span className="text-slate-500">
                  (Program finished with no output. Did you forget print()?)
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
