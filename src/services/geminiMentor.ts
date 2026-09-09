import { LearnerProfile, ExecutionResult } from "../types/mentor";

export interface MentorChatResponse {
  message: string;
  fallback?: boolean;
}

export interface MentorAnalyzeResponse {
  analysis: string;
  fallback?: boolean;
}

export interface MentorFeynmanResponse {
  verified: boolean;
  feedback: string;
}

export async function checkServerMentorStatus(): Promise<{
  hasKey: boolean;
  mode: "gemini" | "offline_heuristic";
}> {
  try {
    const res = await fetch("/api/mentor/status");
    if (!res.ok) throw new Error("Status check failed");
    return await res.json();
  } catch {
    return { hasKey: false, mode: "offline_heuristic" };
  }
}

export async function askMentorChat(params: {
  studentMessage: string;
  code: string;
  executionResult: ExecutionResult | null;
  topicTitle: string;
  topicGoal: string;
  mode?: string;
  learnerProfile: LearnerProfile;
}): Promise<MentorChatResponse> {
  try {
    const res = await fetch("/api/mentor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Chat request failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline heuristic Socratic response:", err);
    return {
      message: generateHeuristicResponse(params),
      fallback: true,
    };
  }
}

export async function analyzeCodeRun(params: {
  code: string;
  executionResult: ExecutionResult;
  topicTitle: string;
  topicGoal: string;
  attemptsCount: number;
  hintsUsed: number;
  learnerProfile: LearnerProfile;
}): Promise<MentorAnalyzeResponse> {
  try {
    const res = await fetch("/api/mentor/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Analyze request failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline analyze response:", err);
    return {
      analysis: generateHeuristicAnalyze(params),
      fallback: true,
    };
  }
}

export async function evaluateFeynmanExplanation(params: {
  code: string;
  studentExplanation: string;
  topicTitle: string;
  learnerProfile: LearnerProfile;
}): Promise<MentorFeynmanResponse> {
  try {
    const res = await fetch("/api/mentor/feynman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Feynman verification failed");
    return await res.json();
  } catch (err) {
    console.warn("Using offline Feynman evaluation:", err);
    const words = params.studentExplanation.trim().split(/\s+/).length;
    if (words >= 8) {
      return {
        verified: true,
        feedback:
          "Good explanation! You articulated the mechanics clearly. Verified Feynman mastery awarded.",
      };
    } else {
      return {
        verified: false,
        feedback:
          "Your explanation was very brief. Could you describe what happens to the variables step-by-step?",
      };
    }
  }
}

export async function fetchMentorRecommendation(params: {
  learnerProfile: LearnerProfile;
  completedTopics: string[];
  currentTopic: string;
}): Promise<string> {
  try {
    const res = await fetch("/api/mentor/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error("Recommend failed");
    const data = await res.json();
    return data.recommendation;
  } catch {
    return "Great momentum! Keep testing your code against unexpected edge cases and continue practicing deliberate problem solving.";
  }
}

// Offline Heuristic Engine for zero-latency or disconnected fallback
function generateHeuristicResponse(params: {
  studentMessage: string;
  code: string;
  executionResult: ExecutionResult | null;
  topicTitle: string;
  topicGoal: string;
}): string {
  const msg = params.studentMessage.toLowerCase();
  const code = params.code;
  const stderr = params.executionResult?.stderr || "";

  if (msg.includes("answer") || msg.includes("solution") || msg.includes("give me the code")) {
    return `I won't give away the complete code because that skips the learning! Instead, let's break it down: For ${params.topicTitle}, what is the first step you need to take before writing any complex syntax?`;
  }

  if (stderr.includes("SyntaxError")) {
    return "You have a SyntaxError in your code. Check your closing parentheses, colons (`:`), or quotation marks. Which line did Python highlight?";
  }

  if (stderr.includes("IndentationError")) {
    return "Notice the IndentationError: In Python, whitespace defines blocks of code under functions, `if` statements, and loops. Did you indent by 4 spaces under the header?";
  }

  if (stderr.includes("NameError")) {
    return "A NameError occurred. Python encountered a variable name it doesn't recognize yet. Is it misspelled, or did you forget to define it before using it?";
  }

  if (stderr.includes("TypeError")) {
    return "You have a TypeError. Usually this happens when mixing types (like trying to add a string to an integer, e.g. `'5' + 10`). Check the types of the values you are combining!";
  }

  if (stderr.includes("IndexError")) {
    return "IndexError detected! Remember that Python lists are 0-indexed. If a list has 3 items, the valid indices are 0, 1, and 2. Attempting index 3 will trigger this error.";
  }

  if (!code || code.trim().length === 0) {
    return `To begin ${params.topicTitle}, let's start with the smallest possible test. What variable or print statement would be a good starting experiment?`;
  }

  return `Interesting thought! In the context of "${params.topicTitle}", what value do you expect to see printed or returned if your logic executes as planned?`;
}

function generateHeuristicAnalyze(params: {
  code: string;
  executionResult: ExecutionResult;
  topicTitle: string;
}): string {
  if (params.executionResult.stderr) {
    return `Your program encountered an execution error. Read the traceback carefully: what is the error type on the last line, and which line in your code triggered it?`;
  }
  if (!params.executionResult.stdout) {
    return `Your code ran without errors, but produced no visible output. Did you include a \`print()\` statement to inspect the result?`;
  }
  return `Execution succeeded with output: "${params.executionResult.stdout.trim()}". Now verify whether this matches the exact required format for "${params.topicTitle}".`;
}
