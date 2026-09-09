export type LearnerLevel = 'Complete Beginner' | 'Beginner' | 'Intermediate' | 'Advanced';

export type CareerTrack = 'Core Python' | 'Data Science' | 'Software Engineering';

export type TeacherMode =
  | 'learn'
  | 'practice'
  | 'debug'
  | 'predict'
  | 'explain'
  | 'challenge'
  | 'project'
  | 'assessment'
  | 'dashboard'
  | 'datascience';

export interface LearnerProfile {
  level: LearnerLevel;
  careerTrack: CareerTrack;
  currentTopicId: string;
  masteredTopics: string[];
  topicScores: Record<string, number>;
  weaknesses: string[];
  recurringMistakes: string[];
  recentAttempts: number;
  recentErrors: string[];
  hintUsage: Record<string, number>;
  assessmentScores: Record<string, number>;
  projectProgress: Record<string, number>;
  learningGoal: string;
  streak: number;
  lastActiveDate: string;
}

export interface TopicItem {
  id: string;
  track: 'core' | 'datascience';
  title: string;
  level: string;
  analogy: string;
  explanation: string;
  starterCode: string;
  goal: string;
  validationRule: (code: string, stdout: string) => boolean;
  hints: string[];
  feynmanPrompt: string;
}

export interface DebugChallenge {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  brokenCode: string;
  bugExplanation: string;
  validationRule: (code: string, stdout: string) => boolean;
}

export interface PredictChallenge {
  id: string;
  code: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ProjectStage {
  stageNumber: number;
  title: string;
  task: string;
  starterCode: string;
  validationRule: (code: string, stdout: string) => boolean;
}

export interface StagedProject {
  id: string;
  title: string;
  level: string;
  description: string;
  stages: ProjectStage[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system' | 'hint' | 'feynman';
  content: string;
  hintLevel?: number;
  timestamp: string;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTime: number | string;
}

export interface DiagnosticQuestion {
  id: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
}
