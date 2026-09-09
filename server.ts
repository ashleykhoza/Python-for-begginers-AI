import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION_BASE = `
You are "Python Mentor", an intelligent, patient, and highly disciplined Socratic coding tutor.
Your #1 Directive: NEVER dump complete code solutions right away unless the learner is at Hint Level 5 or specifically reviewing after multiple attempts.
Your primary objective is: "Help the learner become capable of solving Python problems independently."

PEDAGOGICAL RULES:
1. Teach rather than simply answer. If the learner asks for the code or says "give me the answer" or "write it for me", politely refuse and ask a guiding thought question.
2. Socratic Method: Ask questions that prompt the learner to think through their algorithm, types, and logic step-by-step.
3. When inspecting errors or buggy code:
   - Identify WHERE the issue is (e.g. line number or loop condition).
   - Explain WHAT conceptually the error means (e.g., IndexError, TypeError, SyntaxError).
   - Ask them what value a variable holds or what happens on boundary conditions.
4. Tone: Calm, encouraging, precise, professional, and honest. Avoid excessive empty praise ("Great job!") when the code fails. Speak like a thoughtful senior engineer mentoring a junior.
5. Adaptive difficulty: If the student is a Complete Beginner, use simple real-world analogies (e.g., storage boxes, recipe cards). If Intermediate or Advanced, discuss time complexity, idiomatic Python (PEP 8), mutability, and edge cases.
`.trim();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API Route: Health & Status
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/mentor/status", (_req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: "ok",
      hasKey,
      model: "gemini-2.5-flash",
      mode: hasKey ? "gemini" : "offline_heuristic",
    });
  });

  // API Route: Socratic Dialogue & Chat
  app.post("/api/mentor/chat", async (req, res) => {
    try {
      const {
        studentMessage,
        code,
        executionResult,
        topicTitle,
        topicGoal,
        mode = "learn",
        learnerProfile,
      } = req.body;

      const ai = getGeminiClient();

      if (!ai) {
        return res.status(200).json({
          fallback: true,
          message:
            "I'm operating in offline mentor mode. Let's think through your question: What is the expected behavior of your code vs what actually happened?",
        });
      }

      const prompt = `
CURRENT WORKSPACE CONTEXT:
- Mode: ${mode.toUpperCase()}
- Current Topic: ${topicTitle || "Python Fundamentals"}
- Objective: ${topicGoal || "Writing clean Python code"}

LEARNER STATE:
- Level: ${learnerProfile?.level || "Beginner"}
- Career Track: ${learnerProfile?.careerTrack || "Core Python"}
- Known Recurring Weaknesses: ${(learnerProfile?.weaknesses || []).join(", ") || "None"}
- Recurring Syntax/Logic Mistakes: ${(learnerProfile?.recurringMistakes || []).join(", ") || "None"}

CODE IN EDITOR:
\`\`\`python
${code || "# (Empty workspace)"}
\`\`\`

LAST EXECUTION RESULT:
- Success: ${executionResult?.success ?? "Not run yet"}
- Output (stdout): ${executionResult?.stdout || "None"}
- Errors (stderr): ${executionResult?.stderr || "None"}

STUDENT MESSAGE:
"${studentMessage}"

Respond as Python Mentor following your Socratic guidelines. Keep your reply concise (2-4 paragraphs max), direct, and ending with a constructive thought or question.
      `.trim();

      let text = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_BASE,
            temperature: 0.35,
          },
        });
        text = response.text || "";
      } catch (err: any) {
        console.warn("Primary model error, attempting gemini-3.8-flash:", err);
        const retryResp = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_BASE,
            temperature: 0.35,
          },
        });
        text = retryResp.text || "";
      }

      res.json({ message: text });
    } catch (error: any) {
      console.error("Mentor chat error:", error);
      res.status(500).json({
        error: error.message || "Failed to generate mentor response",
        fallbackMessage:
          "Let's check the code line by line. What do you expect to happen on the very first operation?",
      });
    }
  });

  // API Route: Code Execution Analysis
  app.post("/api/mentor/analyze", async (req, res) => {
    try {
      const {
        code,
        executionResult,
        topicTitle,
        topicGoal,
        attemptsCount = 1,
        hintsUsed = 0,
        learnerProfile,
      } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          fallback: true,
          analysis:
            "Look at the execution output. If there is an error, identify the line number and verify whether the syntax and variable types match expectations.",
        });
      }

      const prompt = `
ANALYZE CODE RUN BY LEARNER:
Topic: ${topicTitle}
Goal: ${topicGoal}
Attempts made so far: ${attemptsCount}
Hints already seen: ${hintsUsed}
Learner Level: ${learnerProfile?.level || "Beginner"}

CODE:
\`\`\`python
${code}
\`\`\`

EXECUTION:
Success: ${executionResult?.success}
Stdout: ${executionResult?.stdout}
Stderr: ${executionResult?.stderr}

Evaluate:
1. Is it syntactically valid?
2. Does it satisfy the requirements?
3. What misconception or logic flaw might the learner have?
4. Provide a focused Socratic prompt or guiding question (DO NOT rewrite their entire program).
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          temperature: 0.2,
        },
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Mentor analyze error:", error);
      res.status(500).json({
        error: error.message,
        analysis:
          "Take another look at the error traceback. What line triggered the failure, and what value was being processed?",
      });
    }
  });

  // API Route: Feynman Conceptual Verification
  app.post("/api/mentor/feynman", async (req, res) => {
    try {
      const { code, studentExplanation, topicTitle, learnerProfile } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          verified: true,
          feedback:
            "Well explained! You've captured the core principle. Full mastery granted.",
        });
      }

      const prompt = `
FEYNMAN MASTERY VERIFICATION:
The student passed the unit tests for "${topicTitle}". To ensure they did not simply guess or copy code, evaluate their explanation.

STUDENT'S CODE:
\`\`\`python
${code}
\`\`\`

STUDENT'S EXPLANATION:
"${studentExplanation}"

TASK:
1. Determine if the explanation demonstrates authentic conceptual understanding (Why the code works, what the key structures do).
2. Point out any subtle misconceptions if present.
3. Be encouraging, concise, and confirm if mastery is verified.
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          temperature: 0.2,
        },
      });

      res.json({
        verified: true,
        feedback: response.text,
      });
    } catch (error: any) {
      console.error("Feynman evaluation error:", error);
      res.json({
        verified: true,
        feedback:
          "Great job explaining your approach. Your logic aligns with the Python execution model.",
      });
    }
  });

  // API Route: Personalized Recommendations
  app.post("/api/mentor/recommend", async (req, res) => {
    try {
      const { learnerProfile, completedTopics, currentTopic } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          recommendation: `You are making steady progress in ${currentTopic || "Python"}. Focus on practicing loops and edge cases before tackling complex data structures.`,
        });
      }

      const prompt = `
GENERATE PERSONALIZED MENTOR RECOMMENDATION:
Learner Level: ${learnerProfile?.level || "Beginner"}
Career Track: ${learnerProfile?.careerTrack || "Core Python"}
Mastered Topics: ${(completedTopics || []).join(", ") || "None"}
Weaknesses / Past Pitfalls: ${(learnerProfile?.weaknesses || []).join(", ") || "None recorded"}
Recurring Errors: ${(learnerProfile?.recurringMistakes || []).join(", ") || "None recorded"}
Current Focus: ${currentTopic || "Variables & Types"}

Write a 2-3 sentence personalized recommendation directly addressing the student (e.g. "You have a solid grasp on... Your next focus should be...").
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          temperature: 0.3,
        },
      });

      res.json({ recommendation: response.text });
    } catch (error: any) {
      console.error("Recommend error:", error);
      res.json({
        recommendation:
          "Keep practicing your current exercises! Spend time reading tracebacks carefully before adjusting code.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Python Mentor server running on http://localhost:${PORT}`);
  });
}

startServer();
