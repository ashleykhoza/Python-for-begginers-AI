import { LearnerProfile, ExecutionResult } from "../types/mentor";

const STORAGE_KEY = "python_mentor_profile_v2";

export const defaultProfile: LearnerProfile = {
  level: "Beginner",
  careerTrack: "Core Python",
  currentTopicId: "vars-types",
  masteredTopics: [],
  topicScores: {},
  weaknesses: [],
  recurringMistakes: [],
  recentAttempts: 0,
  recentErrors: [],
  hintUsage: {},
  assessmentScores: {},
  projectProgress: {},
  learningGoal: "Become an independent Python problem-solver",
  streak: 3,
  lastActiveDate: new Date().toISOString().split("T")[0],
};

export function loadLearnerProfile(): LearnerProfile {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultProfile, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load profile:", e);
  }
  return defaultProfile;
}

export function saveLearnerProfile(profile: LearnerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile:", e);
  }
}

export function analyzeMisconceptions(
  code: string,
  result: ExecutionResult,
  profile: LearnerProfile
): { updatedProfile: LearnerProfile; detectedError?: string } {
  const updated = { ...profile };
  const errorsDetected: string[] = [];

  // Check 1: Single '=' in condition
  if (/if\s+[a-zA-Z0-9_]+\s*=\s*[^=]/.test(code)) {
    errorsDetected.push("Assignment in conditional (`=` instead of `==`)");
  }

  // Check 2: Mutable default argument
  if (/def\s+\w+\(.*=\s*(\[\]|\{\})\)/.test(code)) {
    errorsDetected.push("Mutable default argument (list/dict in def)");
  }

  // Check 3: Missing return statement in function
  if (/def\s+\w+\(/.test(code) && !/return\s+/.test(code) && !/print\(/.test(code)) {
    errorsDetected.push("Function without return or output");
  }

  // Check 4: IndexError from runtime
  if (result.stderr.includes("IndexError")) {
    errorsDetected.push("IndexError (0-based indexing boundary)");
  }

  // Check 5: IndentationError
  if (result.stderr.includes("IndentationError")) {
    errorsDetected.push("IndentationError (Inconsistent whitespace)");
  }

  // Check 6: TypeError
  if (result.stderr.includes("TypeError")) {
    errorsDetected.push("TypeError (Incompatible type operation)");
  }

  // Check 7: NameError
  if (result.stderr.includes("NameError")) {
    errorsDetected.push("NameError (Variable referenced before assignment)");
  }

  let lastDetected: string | undefined;

  errorsDetected.forEach((err) => {
    lastDetected = err;
    if (!updated.recurringMistakes.includes(err)) {
      updated.recurringMistakes = [err, ...updated.recurringMistakes.slice(0, 5)];
    }
  });

  if (!result.success && result.stderr) {
    const errorType = result.stderr.split(":")[0]?.trim() || "Runtime Error";
    if (!updated.recentErrors.includes(errorType)) {
      updated.recentErrors = [errorType, ...updated.recentErrors.slice(0, 4)];
    }
  }

  saveLearnerProfile(updated);
  return { updatedProfile: updated, detectedError: lastDetected };
}
