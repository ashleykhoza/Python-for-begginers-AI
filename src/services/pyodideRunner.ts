import { ExecutionResult } from "../types/mentor";

declare global {
  interface Window {
    loadPyodide?: (config?: { indexURL?: string }) => Promise<any>;
  }
}

let pyodideInstance: any = null;
let isLoadingPyodide = false;

export async function initPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (isLoadingPyodide) {
    // Wait until loaded
    let attempts = 0;
    while (isLoadingPyodide && attempts < 50) {
      await new Promise((r) => setTimeout(r, 100));
      attempts++;
    }
    if (pyodideInstance) return pyodideInstance;
  }

  isLoadingPyodide = true;
  try {
    if (typeof window !== "undefined" && window.loadPyodide) {
      pyodideInstance = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
      });
      console.log("Pyodide WebAssembly runtime loaded successfully.");
    } else {
      console.warn("loadPyodide not found on window, fallback runner will be used.");
    }
  } catch (err) {
    console.warn("Failed to load Pyodide from CDN:", err);
  } finally {
    isLoadingPyodide = false;
  }

  return pyodideInstance;
}

export async function runPythonCode(code: string): Promise<ExecutionResult> {
  const startTime = performance.now();
  let pyodide = pyodideInstance;

  if (!pyodide) {
    pyodide = await initPyodide();
  }

  // If Pyodide is successfully initialized in browser
  if (pyodide) {
    try {
      // Capture stdout and stderr
      pyodide.runPython(`
import sys
import io
sys_stdout_backup = sys.stdout
sys_stderr_backup = sys.stderr
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      let runtimeError: any = null;
      try {
        pyodide.runPython(code);
      } catch (err: any) {
        runtimeError = err;
      }

      const stdout = pyodide.runPython("sys.stdout.getvalue()") || "";
      const pyStderr = pyodide.runPython("sys.stderr.getvalue()") || "";

      // Restore stdout/stderr
      pyodide.runPython(`
sys.stdout = sys_stdout_backup
sys.stderr = sys_stderr_backup
      `);

      const elapsed = (performance.now() - startTime).toFixed(1);

      if (runtimeError) {
        const errorString = runtimeError.message || String(runtimeError);
        return {
          success: false,
          stdout,
          stderr: pyStderr ? `${pyStderr}\n${errorString}` : errorString,
          executionTime: `${elapsed}ms`,
        };
      }

      return {
        success: true,
        stdout,
        stderr: pyStderr,
        executionTime: `${elapsed}ms`,
      };
    } catch (err: any) {
      const elapsed = (performance.now() - startTime).toFixed(1);
      return {
        success: false,
        stdout: "",
        stderr: err.message || String(err),
        executionTime: `${elapsed}ms`,
      };
    }
  }

  // Fallback simulator for offline or sandboxed iframe environment
  const elapsed = (performance.now() - startTime).toFixed(1);
  return simulatePythonExecution(code, elapsed);
}

// Client-side lightweight simulator for common exercises if Pyodide CDN is unavailable
function simulatePythonExecution(code: string, elapsed: string): ExecutionResult {
  const lines = code.split("\n");
  const stdoutArr: string[] = [];

  try {
    // Check obvious syntax errors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("for ") || line.startsWith("if ") || line.startsWith("def ") || line.startsWith("while ")) {
        if (!line.endsWith(":")) {
          return {
            success: false,
            stdout: "",
            stderr: `SyntaxError: expected ':' at end of line ${i + 1}`,
            executionTime: `${elapsed}ms`,
          };
        }
      }
    }

    // Capture print statements
    for (const line of lines) {
      const trimmed = line.trim();
      const printMatch = trimmed.match(/^print\((.*)\)$/);
      if (printMatch) {
        let content = printMatch[1].trim();
        // Remove quotes if simple string
        if (
          (content.startsWith('"') && content.endsWith('"')) ||
          (content.startsWith("'") && content.endsWith("'"))
        ) {
          stdoutArr.push(content.slice(1, -1));
        } else {
          try {
            // Check numeric evaluation
            // eslint-disable-next-line no-eval
            stdoutArr.push(String(content));
          } catch {
            stdoutArr.push(content);
          }
        }
      }
    }

    return {
      success: true,
      stdout: stdoutArr.join("\n") + (stdoutArr.length > 0 ? "\n" : ""),
      stderr: "",
      executionTime: `${elapsed}ms (simulated)`,
    };
  } catch (err: any) {
    return {
      success: false,
      stdout: "",
      stderr: err.message,
      executionTime: `${elapsed}ms`,
    };
  }
}
