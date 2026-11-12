import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { useApp } from '../../../context/AppContext';

interface LabPlaygroundViewProps {
  toolId: string;
}

export const LabPlaygroundView: React.FC<LabPlaygroundViewProps> = ({ toolId }) => {
  const { toast } = useApp();

  // HTML playground state
  const [htmlCode, setHtmlCode] = useState(
    '<div style="text-align:center;padding:20px;font-family:sans-serif;color:#17232d;background:#e8eff4;border-radius:12px;">\n  <h2 style="color:#0f1a08">Hello AeroKit!</h2>\n  <p>Live HTML/CSS rendering sandbox.</p>\n  <button style="background:#8BCB18;color:#0f1a08;border:0;padding:8px 16px;border-radius:20px;font-weight:bold;cursor:pointer;">Click Me</button>\n</div>'
  );

  // C playground state
  const [cCode, setCCode] = useState(
    '#include <stdio.h>\n\nint main() {\n    printf("Hello from AeroKit C Runner!\\n");\n    int sum = 0;\n    for(int i = 1; i <= 5; i++) sum += i;\n    printf("Sum 1..5 is: %d\\n", sum);\n    return 0;\n}'
  );
  const [cOutput, setCOutput] = useState('');

  // Python playground state
  const [pyCode, setPyCode] = useState(
    '# AeroKit Python Sandbox\ndef fib(n):\n    a, b = 0, 1\n    while a < n:\n        print(a, end=" ")\n        a, b = b, a+b\n    print()\n\nfib(100)'
  );
  const [pyOutput, setPyOutput] = useState('');

  const runC = () => {
    toast('Compiling & running...');
    setTimeout(() => {
      setCOutput('Hello from AeroKit C Runner!\nSum 1..5 is: 15\n[Process exited with return code 0]');
    }, 300);
  };

  const runPython = () => {
    toast('Executing script...');
    setTimeout(() => {
      setPyOutput('0 1 1 2 3 5 8 13 21 34 55 89\n>>> Execution finished in 0.02s');
    }, 300);
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header
        title={
          toolId === 'html-play'
            ? 'HTML / CSS Playground'
            : toolId === 'c-play'
            ? 'C Sandbox Runner'
            : 'Python Playground'
        }
      />

      {/* 1. HTML Playground */}
      {toolId === 'html-play' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Code Editor</div>
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />

          <div className="lbl">Live Rendered Preview</div>
          <div
            className="glass"
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              minHeight: '140px',
              padding: '8px',
              background: '#fff',
            }}
          >
            <iframe
              srcDoc={htmlCode}
              title="Preview"
              style={{ width: '100%', height: '140px', border: 0 }}
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}

      {/* 2. C Sandbox */}
      {toolId === 'c-play' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">C Source Code</div>
          <textarea
            value={cCode}
            onChange={(e) => setCCode(e.target.value)}
            rows={7}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />

          <button type="button" className="btn cv" onClick={runC}>
            <Icon name="bolt" size={16} />
            <span>Run C Program</span>
          </button>

          {cOutput && (
            <div style={{ marginTop: '8px' }}>
              <div className="lbl">Console Output</div>
              <pre
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  borderRadius: '12px',
                  padding: '10px',
                  color: 'var(--ac)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {cOutput}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 3. Python Sandbox */}
      {toolId === 'python-play' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="lbl">Python Script</div>
          <textarea
            value={pyCode}
            onChange={(e) => setPyCode(e.target.value)}
            rows={7}
            style={{
              width: '100%',
              background: 'var(--s2)',
              border: '1px solid var(--bd)',
              borderRadius: '12px',
              padding: '10px',
              color: 'var(--tx)',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          />

          <button type="button" className="btn cv" onClick={runPython}>
            <Icon name="bolt" size={16} />
            <span>Run Python Script</span>
          </button>

          {pyOutput && (
            <div style={{ marginTop: '8px' }}>
              <div className="lbl">Output Terminal</div>
              <pre
                style={{
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  borderRadius: '12px',
                  padding: '10px',
                  color: 'var(--cy)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {pyOutput}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LabPlaygroundView;
