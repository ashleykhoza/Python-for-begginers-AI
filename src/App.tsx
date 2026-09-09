import React, { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { SocraticChat } from "./components/SocraticChat";
import { CodeWorkspace } from "./components/CodeWorkspace";
import { DashboardView } from "./components/DashboardView";
import { PracticeView } from "./components/PracticeView";
import { DebugArenaView } from "./components/DebugArenaView";
import { PredictorView } from "./components/PredictorView";
import { ProjectsView } from "./components/ProjectsView";
import { DataScienceView } from "./components/DataScienceView";
import { DiagnosticModal } from "./components/DiagnosticModal";
import { FeynmanModal } from "./components/FeynmanModal";

import { CORE_TOPICS, DATA_SCIENCE_TOPICS } from "./data/curriculum";
import {
  LearnerProfile,
  TeacherMode,
  ChatMessage,
  ExecutionResult,
  TopicItem,
  LearnerLevel,
} from "./types/mentor";
import {
  loadLearnerProfile,
  saveLearnerProfile,
  analyzeMisconceptions,
} from "./services/progressStore";
import { runPythonCode, initPyodide } from "./services/pyodideRunner";
import {
  askMentorChat,
  analyzeCodeRun,
  evaluateFeynmanExplanation,
  checkServerMentorStatus,
} from "./services/geminiMentor";

export default function App() {
  const [profile, setProfile] = useState<LearnerProfile>(loadLearnerProfile);
  const [currentMode, setCurrentMode] = useState<TeacherMode>("learn");
  const [mentorStatus, setMentorStatus] = useState<{ hasKey: boolean; mode: string }>({
    hasKey: true,
    mode: "gemini",
  });

  // Current active topic
  const allTopics = [...CORE_TOPICS, ...DATA_SCIENCE_TOPICS];
  const currentTopic =
    allTopics.find((t) => t.id === profile.currentTopicId) || CORE_TOPICS[0];

  const [code, setCode] = useState<string>(currentTopic.starterCode);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentHintLevel, setCurrentHintLevel] = useState<number>(0);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);

  // Modals
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);
  const [isFeynmanOpen, setIsFeynmanOpen] = useState<boolean>(false);

  // Socratic Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      sender: "ai",
      content: `Welcome to Python Mentor. I am your Socratic AI guide.\n\nMy purpose is NOT to write solutions for you, but to help you understand Python deeply so you can solve problems independently.\n\nRead the goal for "${currentTopic.title}" on the right. When you're ready, write your initial attempt and run it, or ask me any question!`,
      timestamp: "Just now",
    },
  ]);
  const [isMentorThinking, setIsMentorThinking] = useState<boolean>(false);

  // Check backend server status & preload Pyodide
  useEffect(() => {
    checkServerMentorStatus().then((status) => {
      setMentorStatus(status);
    });
    initPyodide().catch((err) => console.warn("Pyodide warmup:", err));
  }, []);

  // Sync starter code when topic changes
  useEffect(() => {
    setCode(currentTopic.starterCode);
    setExecutionResult(null);
    setCurrentHintLevel(0);
    setAttemptsCount(0);
  }, [currentTopic.id]);

  // Handle Code Execution
  const handleRunCode = async () => {
    setIsRunning(true);
    setAttemptsCount((prev) => prev + 1);

    try {
      const result = await runPythonCode(code);
      setExecutionResult(result);

      // Analyze misconceptions
      const { updatedProfile, detectedError } = analyzeMisconceptions(
        code,
        result,
        profile
      );
      setProfile(updatedProfile);

      // If an error occurred or misconception detected, AI Mentor steps in Socratically
      if (!result.success || detectedError) {
        setIsMentorThinking(true);
        const analysisResp = await analyzeCodeRun({
          code,
          executionResult: result,
          topicTitle: currentTopic.title,
          topicGoal: currentTopic.goal,
          attemptsCount: attemptsCount + 1,
          hintsUsed: currentHintLevel,
          learnerProfile: updatedProfile,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "ai",
            content:
              analysisResp.analysis ||
              `I noticed an issue during execution. Take a look at the traceback: what line caused the exception?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsMentorThinking(false);
      }
    } catch (err: any) {
      setExecutionResult({
        success: false,
        stdout: "",
        stderr: err.message,
        executionTime: "0ms",
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Handle Submission & Validation
  const handleSubmitForReview = async () => {
    setIsEvaluating(true);
    try {
      const result = await runPythonCode(code);
      setExecutionResult(result);

      const isValid = currentTopic.validationRule(code, result.stdout);

      if (isValid) {
        // Passed the code test! Prompt for Feynman explanation to verify true understanding
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "ai",
            content: `Your code produced the required output and passed unit checks!\n\nHowever, in Python Mentor, "Code Ran" != "Mastery". To earn verified mastery, click the "Feynman Check" button and explain in your own words why this solution works.`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsFeynmanOpen(true);
      } else {
        setIsMentorThinking(true);
        const feedback = await askMentorChat({
          studentMessage: "I submitted my code but it did not satisfy all requirements. What should I check?",
          code,
          executionResult: result,
          topicTitle: currentTopic.title,
          topicGoal: currentTopic.goal,
          mode: currentMode,
          learnerProfile: profile,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "ai",
            content: feedback.message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsMentorThinking(false);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Handle Socratic Chat message from user
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsMentorThinking(true);

    try {
      const response = await askMentorChat({
        studentMessage: text,
        code,
        executionResult,
        topicTitle: currentTopic.title,
        topicGoal: currentTopic.goal,
        mode: currentMode,
        learnerProfile: profile,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          content: response.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: "ai",
          content: "Let's pause and inspect the current code structure: what is the very first step your program executes?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsMentorThinking(false);
    }
  };

  // Progressive Hint Ladder (Levels 1 - 5)
  const handleSelectHintLevel = (level: number) => {
    setCurrentHintLevel(level);
    const hintText = currentTopic.hints[level - 1] || "Think about the expected data types and outputs.";

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-hint-${Date.now()}`,
        sender: "hint",
        hintLevel: level,
        content: hintText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Feynman Verification
  const handleVerifyFeynman = async (explanation: string) => {
    const evalResult = await evaluateFeynmanExplanation({
      code,
      studentExplanation: explanation,
      topicTitle: currentTopic.title,
      learnerProfile: profile,
    });

    if (evalResult.verified) {
      const updatedMastered = profile.masteredTopics.includes(currentTopic.id)
        ? profile.masteredTopics
        : [...profile.masteredTopics, currentTopic.id];

      const newProfile = {
        ...profile,
        masteredTopics: updatedMastered,
      };
      setProfile(newProfile);
      saveLearnerProfile(newProfile);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-feynman-${Date.now()}`,
          sender: "feynman",
          content: `Feynman Verification Passed!\n\nMentor evaluation: "${evalResult.feedback}"\n\nYou have officially mastered "${currentTopic.title}". Feel free to proceed to the next concept or practice workout.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }

    return evalResult;
  };

  // Diagnostic Results Application
  const handleApplyDiagnosticResults = (
    newLevel: LearnerLevel,
    weaknesses: string[],
    recommendedTopicId: string
  ) => {
    const newProfile: LearnerProfile = {
      ...profile,
      level: newLevel,
      weaknesses: weaknesses,
      currentTopicId: recommendedTopicId,
    };
    setProfile(newProfile);
    saveLearnerProfile(newProfile);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-diag-${Date.now()}`,
        sender: "ai",
        content: `Diagnostic assessment complete! I've calibrated your curriculum level to "${newLevel}".\n\nIdentified focus areas: ${weaknesses.join(", ") || "None (strong grasp of fundamentals)"}.\n\nLet's begin at "${recommendedTopicId}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSelectTopicFromDashboard = (topicId: string) => {
    const updated = { ...profile, currentTopicId: topicId };
    setProfile(updated);
    saveLearnerProfile(updated);
    setCurrentMode("learn");
  };

  const handleNextTopic = () => {
    const currentIndex = allTopics.findIndex((t) => t.id === currentTopic.id);
    if (currentIndex >= 0 && currentIndex < allTopics.length - 1) {
      const nextTopic = allTopics[currentIndex + 1];
      const updated = { ...profile, currentTopicId: nextTopic.id };
      setProfile(updated);
      saveLearnerProfile(updated);
    }
  };

  const isMastered = profile.masteredTopics.includes(currentTopic.id);
  const currentTopicIdx = allTopics.findIndex((t) => t.id === currentTopic.id);
  const hasNextTopic = currentTopicIdx >= 0 && currentTopicIdx < allTopics.length - 1;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0e14] text-slate-100 font-sans">
      {/* Top Application Bar */}
      <Navigation
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        profile={profile}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        mentorStatus={mentorStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {currentMode === "learn" && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 h-full overflow-hidden">
            {/* Left 5 Cols: Socratic Conversation & Pedagogy */}
            <div className="md:col-span-5 h-full overflow-hidden border-r border-slate-800">
              <SocraticChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isMentorThinking}
                currentTopic={currentTopic}
                onSelectHintLevel={handleSelectHintLevel}
                currentHintLevel={currentHintLevel}
              />
            </div>

            {/* Right 7 Cols: Python Workspace & Pyodide Terminal */}
            <div className="md:col-span-7 h-full overflow-hidden">
              <CodeWorkspace
                code={code}
                onChangeCode={(val) => setCode(val)}
                onRunCode={handleRunCode}
                onSubmitForReview={handleSubmitForReview}
                onOpenFeynman={() => setIsFeynmanOpen(true)}
                onResetCode={() => setCode(currentTopic.starterCode)}
                onNextTopic={handleNextTopic}
                isRunning={isRunning}
                isEvaluating={isEvaluating}
                currentTopic={currentTopic}
                executionResult={executionResult}
                isMastered={isMastered}
                hasNextTopic={hasNextTopic}
              />
            </div>
          </div>
        )}

        {currentMode === "practice" && (
          <PracticeView
            profile={profile}
            onSelectTopic={handleSelectTopicFromDashboard}
          />
        )}

        {currentMode === "debug" && <DebugArenaView />}

        {currentMode === "predict" && <PredictorView />}

        {currentMode === "project" && <ProjectsView />}

        {currentMode === "datascience" && (
          <DataScienceView
            profile={profile}
            onSelectTopic={handleSelectTopicFromDashboard}
          />
        )}

        {currentMode === "dashboard" && (
          <DashboardView
            profile={profile}
            onSelectTopic={handleSelectTopicFromDashboard}
            onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
          />
        )}
      </main>

      {/* Adaptive Diagnostic Assessment Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onApplyResults={handleApplyDiagnosticResults}
      />

      {/* Feynman Mastery Verification Modal */}
      <FeynmanModal
        isOpen={isFeynmanOpen}
        onClose={() => setIsFeynmanOpen(false)}
        topic={currentTopic}
        code={code}
        onVerifyMastery={handleVerifyFeynman}
      />
    </div>
  );
}
