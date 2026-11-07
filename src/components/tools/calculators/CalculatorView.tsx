import React, { useState, useEffect } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { evaluateCalc, formatNumber } from '../../../utils/calc';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface CalculatorViewProps {
  initialMode?: 'std' | 'sci';
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  initialMode = 'std',
}) => {
  const { toast } = useApp();
  const [mode, setMode] = useState<'std' | 'sci'>(initialMode);
  const [expr, setExpr] = useState('');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Live evaluation
  const liveResult = React.useMemo(() => {
    if (!expr) return '0';
    const evalRes = evaluateCalc(expr, angleMode);
    if (evalRes.error) return evalRes.error;
    if (evalRes.value !== null) return formatNumber(evalRes.value);
    return '0';
  }, [expr, angleMode]);

  const handleKey = (key: string) => {
    if (key === 'AC' || key === 'C') {
      setExpr('');
      return;
    }
    if (key === 'DEL' || key === '⌫') {
      setExpr((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '=') {
      const evalRes = evaluateCalc(expr, angleMode);
      if (evalRes.value !== null) {
        const formatted = formatNumber(evalRes.value);
        setHistory((prev) => [`${expr} = ${formatted}`, ...prev.slice(0, 9)]);
        setExpr(String(evalRes.value));
      } else if (evalRes.error) {
        toast(evalRes.error);
      }
      return;
    }
    if (key === '±') {
      if (!expr) return;
      if (expr.startsWith('-')) setExpr((prev) => prev.slice(1));
      else setExpr((prev) => `-${prev}`);
      return;
    }
    if (key === 'MC') {
      setMemory(0);
      toast('Memory cleared');
      return;
    }
    if (key === 'MR') {
      setExpr((prev) => prev + String(memory));
      return;
    }
    if (key === 'M+') {
      const evalRes = evaluateCalc(expr, angleMode);
      if (evalRes.value !== null) {
        setMemory((prev) => prev + evalRes.value!);
        toast('Added to memory');
      }
      return;
    }
    if (key === 'M-') {
      const evalRes = evaluateCalc(expr, angleMode);
      if (evalRes.value !== null) {
        setMemory((prev) => prev - evalRes.value!);
        toast('Subtracted from memory');
      }
      return;
    }

    // Append regular char or function
    if (['sin', 'cos', 'tan', 'log', 'ln'].includes(key)) {
      setExpr((prev) => `${prev}${key}(`);
    } else {
      setExpr((prev) => prev + key);
    }
  };

  const copyResult = () => {
    if (liveResult && liveResult !== '0' && liveResult !== 'Error') {
      copyText(liveResult).then(() => toast(`Copied ${liveResult}`));
    }
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header
        title={mode === 'sci' ? 'Scientific Calculator' : 'Standard Calculator'}
        rightAction={
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="ib"
              onClick={() => setShowHistory(!showHistory)}
              aria-label="History"
              type="button"
              title="Calculation History"
            >
              <Icon name="clock" size={17} color={showHistory ? 'var(--ac)' : 'var(--tx)'} />
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={mode === 'std' ? 'on' : ''}
          onClick={() => setMode('std')}
        >
          Standard
        </button>
        <button
          type="button"
          className={mode === 'sci' ? 'on' : ''}
          onClick={() => setMode('sci')}
        >
          Scientific
        </button>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div
          className="glass"
          style={{
            padding: '12px',
            borderRadius: '16px',
            marginBottom: '10px',
            maxHeight: '140px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--mut)',
            }}
          >
            <span>History</span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                style={{ color: 'var(--mut)' }}
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--dim)', textAlign: 'center', padding: '10px' }}>
              No history yet
            </div>
          ) : (
            history.map((h, i) => (
              <div
                key={i}
                onClick={() => {
                  const parts = h.split('=');
                  if (parts[1]) setExpr(parts[1].trim());
                  setShowHistory(false);
                }}
                style={{
                  fontSize: '12px',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--bd)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{h}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Screen Display */}
      <div className="disp glass" onClick={copyResult} style={{ cursor: 'pointer' }} title="Click to copy result">
        <small>{expr || ' '}</small>
        <b>{liveResult}</b>
      </div>

      {/* Scientific Functions Keypad */}
      {mode === 'sci' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <button
              type="button"
              onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--act)',
                background: 'var(--s2)',
                padding: '3px 10px',
                borderRadius: '8px',
                border: '1px solid var(--bd)',
              }}
            >
              {angleMode}
            </button>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['MC', 'MR', 'M+', 'M-'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleKey(m)}
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--mut)',
                    background: 'var(--s2)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="sci on">
            {['sin', 'cos', 'tan', 'π'].map((k) => (
              <button key={k} className="k" type="button" onClick={() => handleKey(k)}>
                {k}
              </button>
            ))}
            {['log', 'ln', '√', 'e'].map((k) => (
              <button key={k} className="k" type="button" onClick={() => handleKey(k)}>
                {k}
              </button>
            ))}
            {['^', '²', '!', '('].map((k) => (
              <button key={k} className="k" type="button" onClick={() => handleKey(k)}>
                {k}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Primary Keypad */}
      <div className="keys">
        <button className="k" type="button" onClick={() => handleKey('C')} style={{ color: 'var(--ac)' }}>
          C
        </button>
        <button className="k" type="button" onClick={() => handleKey('(')}>
          (
        </button>
        <button className="k" type="button" onClick={() => handleKey(')')}>
          )
        </button>
        <button className="k o" type="button" onClick={() => handleKey('÷')}>
          ÷
        </button>

        <button className="k" type="button" onClick={() => handleKey('7')}>
          7
        </button>
        <button className="k" type="button" onClick={() => handleKey('8')}>
          8
        </button>
        <button className="k" type="button" onClick={() => handleKey('9')}>
          9
        </button>
        <button className="k o" type="button" onClick={() => handleKey('×')}>
          ×
        </button>

        <button className="k" type="button" onClick={() => handleKey('4')}>
          4
        </button>
        <button className="k" type="button" onClick={() => handleKey('5')}>
          5
        </button>
        <button className="k" type="button" onClick={() => handleKey('6')}>
          6
        </button>
        <button className="k o" type="button" onClick={() => handleKey('-')}>
          −
        </button>

        <button className="k" type="button" onClick={() => handleKey('1')}>
          1
        </button>
        <button className="k" type="button" onClick={() => handleKey('2')}>
          2
        </button>
        <button className="k" type="button" onClick={() => handleKey('3')}>
          3
        </button>
        <button className="k o" type="button" onClick={() => handleKey('+')}>
          +
        </button>

        <button className="k" type="button" onClick={() => handleKey('0')}>
          0
        </button>
        <button className="k" type="button" onClick={() => handleKey('.')}>
          .
        </button>
        <button className="k" type="button" onClick={() => handleKey('⌫')} title="Backspace">
          ⌫
        </button>
        <button className="k o" type="button" onClick={() => handleKey('=')}>
          =
        </button>
      </div>
    </div>
  );
};

export default CalculatorView;
