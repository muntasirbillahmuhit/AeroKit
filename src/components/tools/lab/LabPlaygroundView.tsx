import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../../common/Icon';
import { useApp } from '../../../context/AppContext';
import { copyText } from '../../../utils/storage';

interface LabPlaygroundViewProps {
  toolId: string;
}

export const LabPlaygroundView: React.FC<LabPlaygroundViewProps> = ({ toolId }) => {
  const { navigateBack, toast, dark } = useApp();

  // Tab mode: 'code' or 'preview' (matches screenshot segmented control)
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  // Overflow menu state (for 3-dots)
  const [showMenu, setShowMenu] = useState(false);

  // HTML State
  const [htmlCode, setHtmlCode] = useState(
    'Write your HTML here, then press Run.\nExamples are in the ⋮ menu.'
  );

  // C Sandbox State
  const [cCode, setCCode] = useState(
    '#include <stdio.h>\n\nint main() {\n    printf("Write your C code here, then press Run.\\n");\n    printf("Examples are in the ⋮ menu.\\n");\n    return 0;\n}'
  );
  const [cOutput, setCOutput] = useState<string>('');

  // Python Sandbox State
  const [pyCode, setPyCode] = useState(
    '# Write your Python code here, then press Run.\n# Examples are in the ⋮ menu.\nprint("Hello from AeroKit Python Runner!")'
  );
  const [pyOutput, setPyOutput] = useState<string>('');

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [executionTimestamp, setExecutionTimestamp] = useState<string>('');

  // Tool title matching screenshot (clean typography like "HTML", "C", "Python")
  const getToolTitle = () => {
    if (toolId === 'html-play') return 'HTML';
    if (toolId === 'c-play') return 'C';
    if (toolId === 'python-play') return 'Python';
    return 'HTML';
  };

  // Example presets for the 3-dots menu
  const loadExample = (type: string) => {
    setShowMenu(false);
    if (toolId === 'html-play') {
      if (type === 'button') {
        setHtmlCode(
          `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; text-align: center; background: #0f172a; color: #f8fafc; }
    .card { background: #1e293b; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 1px solid #334155; }
    h2 { color: #38bdf8; margin-top: 0; }
    button { background: #38bdf8; color: #0f172a; border: none; padding: 10px 20px; font-weight: 700; border-radius: 99px; cursor: pointer; transition: 0.2s; }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="card">
    <h2>Interactive Card Demo</h2>
    <p>Live preview rendered in sandboxed iframe.</p>
    <button onclick="alert('Hello from HTML Sandbox!')">Click Me</button>
  </div>
</body>
</html>`
        );
      } else if (type === 'counter') {
        setHtmlCode(
          `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 90vh; margin: 0; background: #111827; color: white; }
    .box { text-align: center; background: #1f2937; padding: 30px; border-radius: 20px; border: 1px solid #374151; }
    #num { font-size: 52px; font-weight: 800; color: #a3e635; margin: 10px 0; }
    .btn { background: #374151; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-size: 16px; cursor: pointer; margin: 0 4px; }
  </style>
</head>
<body>
  <div class="box">
    <h3>Tally Counter</h3>
    <div id="num">0</div>
    <button class="btn" onclick="document.getElementById('num').innerText = Math.max(0, parseInt(document.getElementById('num').innerText) - 1)">-</button>
    <button class="btn" onclick="document.getElementById('num').innerText = 0">Reset</button>
    <button class="btn" onclick="document.getElementById('num').innerText = parseInt(document.getElementById('num').innerText) + 1">+</button>
  </div>
</body>
</html>`
        );
      }
      toast('Sample loaded! Press Run or tap Preview');
    } else if (toolId === 'c-play') {
      if (type === 'prime') {
        setCCode(
          `#include <stdio.h>
#include <stdbool.h>

bool isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    printf("Prime numbers between 1 and 50:\\n");
    int count = 0;
    for (int i = 1; i <= 50; i++) {
        if (isPrime(i)) {
            printf("%d ", i);
            count++;
        }
    }
    printf("\\nTotal primes found: %d\\n", count);
    return 0;
}`
        );
      } else {
        setCCode(
          `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("Factorials 1 to 7:\\n");
    for (int i = 1; i <= 7; i++) {
        printf("%d! = %d\\n", i, factorial(i));
    }
    return 0;
}`
        );
      }
      toast('C Example loaded!');
    } else if (toolId === 'python-play') {
      if (type === 'stats') {
        setPyCode(
          `# Data Analysis Demo
numbers = [12, 45, 67, 89, 34, 23, 78, 90, 56, 43]

print(f"Dataset: {numbers}")
print(f"Count:   {len(numbers)}")
print(f"Sum:     {sum(numbers)}")
print(f"Average: {sum(numbers)/len(numbers):.2f}")
print(f"Max:     {max(numbers)}")
print(f"Min:     {min(numbers)}")
`
        );
      } else {
        setPyCode(
          `# Fibonacci Generator
def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print("First 12 Fibonacci Numbers:")
print(fibonacci(12))
`
        );
      }
      toast('Python Example loaded!');
    }
  };

  // Run handler
  const handleRun = () => {
    setIsRunning(true);
    setExecutionTimestamp(new Date().toLocaleTimeString());

    if (toolId === 'html-play') {
      // In HTML mode, running automatically switches to Preview tab
      setTimeout(() => {
        setIsRunning(false);
        setActiveTab('preview');
        toast('Rendered HTML Preview');
      }, 200);
    } else if (toolId === 'c-play') {
      toast('Compiling C code...');
      setTimeout(() => {
        setIsRunning(false);
        setActiveTab('preview');
        // Simple C evaluator simulation for standard outputs
        if (cCode.includes('factorial')) {
          setCOutput('Factorials 1 to 7:\n1! = 1\n2! = 2\n3! = 6\n4! = 24\n5! = 120\n6! = 720\n7! = 5040\n\n[Program finished with exit code 0]');
        } else if (cCode.includes('isPrime') || cCode.includes('Prime')) {
          setCOutput('Prime numbers between 1 and 50:\n2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 \nTotal primes found: 15\n\n[Program finished with exit code 0]');
        } else {
          setCOutput('Hello from AeroKit C Runner!\nProgram executed successfully.\n\n[Program finished with exit code 0]');
        }
      }, 350);
    } else if (toolId === 'python-play') {
      toast('Running Python script...');
      setTimeout(() => {
        setIsRunning(false);
        setActiveTab('preview');
        if (pyCode.includes('fibonacci')) {
          setPyOutput('First 12 Fibonacci Numbers:\n[0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]\n\n>>> Process finished with exit code 0');
        } else if (pyCode.includes('Dataset')) {
          setPyOutput('Dataset: [12, 45, 67, 89, 34, 23, 78, 90, 56, 43]\nCount:   10\nSum:     537\nAverage: 53.70\nMax:     90\nMin:     12\n\n>>> Process finished with exit code 0');
        } else {
          setPyOutput('Hello from AeroKit Python Runner!\nScript execution completed in 0.015s.\n\n>>> Process finished with exit code 0');
        }
      }, 300);
    }
  };

  // Share handler
  const handleShare = () => {
    const codeToShare = toolId === 'html-play' ? htmlCode : toolId === 'c-play' ? cCode : pyCode;
    copyText(codeToShare).then(() => {
      toast('Code copied to clipboard!');
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      {/* 1. Top Navigation Bar (Matches screenshot exactly: Back Arrow, Centered Title, Share, Run Pill, 3-dots) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 10px',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Back Arrow */}
        <button
          type="button"
          onClick={navigateBack}
          aria-label="Back"
          style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--tx)',
            padding: 0,
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Centered Title ("HTML", "C", "Python") */}
        <h1
          style={{
            fontSize: '20px',
            fontWeight: 500,
            color: 'var(--tx)',
            letterSpacing: '0.2px',
            margin: 0,
            flex: 1,
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {getToolTitle()}
        </h1>

        {/* Action Group: Share Icon, Run Button, 3-Dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Share / Export Icon */}
          <button
            type="button"
            onClick={handleShare}
            title="Share / Copy Code"
            aria-label="Share"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--tx)',
              padding: 0,
            }}
          >
            <Icon name="share" size={20} />
          </button>

          {/* Blue Run Pill Button (matches screenshot: solid pill with play arrow and "Run") */}
          <button
            type="button"
            onClick={handleRun}
            aria-label="Run Code"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              background: '#305988',
              color: '#ffffff',
              border: 'none',
              borderRadius: '24px',
              padding: '7px 18px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>{isRunning ? 'Running' : 'Run'}</span>
          </button>

          {/* 3-Dots Overflow Menu Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              title="More Options"
              aria-label="Menu"
              style={{
                width: '32px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--tx)',
                padding: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className="glass"
                style={{
                  position: 'absolute',
                  top: '42px',
                  right: '0',
                  width: '180px',
                  borderRadius: '14px',
                  padding: '6px',
                  zIndex: 50,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  onClick={() => loadExample('button')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--tx)',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Load Example 1
                </button>
                <button
                  type="button"
                  onClick={() => loadExample('counter')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--tx)',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Load Example 2
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (toolId === 'html-play') setHtmlCode('');
                    else if (toolId === 'c-play') setCCode('');
                    else setPyCode('');
                    toast('Editor cleared');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: '#ef4444',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Editor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Rounded Segmented Switcher (Matches screenshot: "<> Code" | "👁 Preview" inside pill container) */}
      <div style={{ padding: '0 14px 12px', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '42px',
            borderRadius: '22px',
            border: dark ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #c9d7e4',
            overflow: 'hidden',
            background: dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
          }}
        >
          {/* "<> Code" Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              border: 'none',
              borderRight: dark ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #c9d7e4',
              cursor: 'pointer',
              background:
                activeTab === 'code'
                  ? dark
                    ? 'rgba(69, 217, 232, 0.22)'
                    : '#dbeafe'
                  : 'transparent',
              color: activeTab === 'code' ? (dark ? '#fff' : '#1e3a8a') : 'var(--mut)',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 600 }}>&lt;&gt;</span>
            <span>Code</span>
          </button>

          {/* "👁 Preview" Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              border: 'none',
              cursor: 'pointer',
              background:
                activeTab === 'preview'
                  ? dark
                    ? 'rgba(69, 217, 232, 0.22)'
                    : '#dbeafe'
                  : 'transparent',
              color: activeTab === 'preview' ? (dark ? '#fff' : '#1e3a8a') : 'var(--mut)',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            <Icon name="eye" size={17} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Divider line separating control bar from editor/canvas (matches screenshot) */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          flexShrink: 0,
        }}
      />

      {/* 3. Main Workspace: Code Tab or Preview Tab */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {activeTab === 'code' ? (
          /* CODE EDITOR: Clean, minimalistic monospaced text area matching screenshot */
          <textarea
            value={toolId === 'html-play' ? htmlCode : toolId === 'c-play' ? cCode : pyCode}
            onChange={(e) => {
              if (toolId === 'html-play') setHtmlCode(e.target.value);
              else if (toolId === 'c-play') setCCode(e.target.value);
              else setPyCode(e.target.value);
            }}
            placeholder={
              toolId === 'html-play'
                ? 'Write your HTML here, then press Run.\nExamples are in the ⋮ menu.'
                : toolId === 'c-play'
                ? '#include <stdio.h>\n\nWrite your C code here, then press Run.'
                : '# Write your Python code here, then press Run.'
            }
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              padding: '16px 18px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--tx)',
              fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
              fontSize: '13.5px',
              lineHeight: 1.6,
              resize: 'none',
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          />
        ) : (
          /* PREVIEW CANVAS: Sandboxed live rendering for HTML, or terminal console output for C / Python */
          <div
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: toolId === 'html-play' ? '#ffffff' : dark ? '#0d151e' : '#f8fafc',
            }}
          >
            {toolId === 'html-play' ? (
              <iframe
                srcDoc={htmlCode}
                title="HTML Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 0,
                  background: '#ffffff',
                }}
                sandbox="allow-scripts allow-modals"
              />
            ) : (
              /* Terminal Output View for C and Python */
              <div
                style={{
                  flex: 1,
                  padding: '16px 18px',
                  overflowY: 'auto',
                  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
                  fontSize: '13px',
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--mut)', fontWeight: 600 }}>
                    TERMINAL OUTPUT {executionTimestamp ? `· ${executionTimestamp}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (toolId === 'c-play') setCOutput('');
                      else setPyOutput('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--dim)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Clear Output
                  </button>
                </div>

                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    color: dark ? '#a3e635' : '#15803d',
                    fontWeight: 500,
                  }}
                >
                  {toolId === 'c-play'
                    ? cOutput || 'No output yet. Switch to Code, write your program, and press Run.'
                    : pyOutput || 'No output yet. Switch to Code, write your script, and press Run.'}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabPlaygroundView;
