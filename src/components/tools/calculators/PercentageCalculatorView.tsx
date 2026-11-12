import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

export const PercentageCalculatorView: React.FC = () => {
  const { toast } = useApp();
  const [tab, setTab] = useState<'of' | 'is' | 'change'>('of');

  // Mode 1: What is X% of Y?
  const [percent1, setPercent1] = useState('15');
  const [total1, setTotal1] = useState('200');

  // Mode 2: X is what percent of Y?
  const [val2, setVal2] = useState('45');
  const [total2, setTotal2] = useState('180');

  // Mode 3: Percentage change from X to Y
  const [from3, setFrom3] = useState('50');
  const [to3, setTo3] = useState('75');

  const result1 = React.useMemo(() => {
    const p = parseFloat(percent1);
    const t = parseFloat(total1);
    if (isNaN(p) || isNaN(t)) return '—';
    return ((p / 100) * t).toLocaleString('en-US', { maximumFractionDigits: 4 });
  }, [percent1, total1]);

  const result2 = React.useMemo(() => {
    const v = parseFloat(val2);
    const t = parseFloat(total2);
    if (isNaN(v) || isNaN(t) || t === 0) return '—';
    return `${((v / t) * 100).toLocaleString('en-US', { maximumFractionDigits: 4 })}%`;
  }, [val2, total2]);

  const result3 = React.useMemo(() => {
    const f = parseFloat(from3);
    const t = parseFloat(to3);
    if (isNaN(f) || isNaN(t) || f === 0) return { pct: '—', type: '' };
    const diff = t - f;
    const pct = (diff / Math.abs(f)) * 100;
    return {
      pct: `${Math.abs(pct).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`,
      type: diff >= 0 ? 'Increase (+)' : 'Decrease (-)',
      diff: diff.toLocaleString('en-US', { maximumFractionDigits: 2 }),
    };
  }, [from3, to3]);

  const handleCopy = (val: string) => {
    if (val && val !== '—') {
      copyText(val).then(() => toast(`Copied ${val}`));
    }
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title="Percentage Calculator" />

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={tab === 'of' ? 'on' : ''}
          onClick={() => setTab('of')}
        >
          % of Value
        </button>
        <button
          type="button"
          className={tab === 'is' ? 'on' : ''}
          onClick={() => setTab('is')}
        >
          What % is
        </button>
        <button
          type="button"
          className={tab === 'change' ? 'on' : ''}
          onClick={() => setTab('change')}
        >
          % Change
        </button>
      </div>

      {tab === 'of' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="lbl">Percentage (%)</div>
          <label className="fld">
            <input
              type="number"
              value={percent1}
              onChange={(e) => setPercent1(e.target.value)}
              placeholder="e.g. 15"
              step="any"
            />
            <span style={{ color: 'var(--mut)', fontWeight: 700 }}>%</span>
          </label>

          <div className="lbl">Of Number</div>
          <label className="fld">
            <input
              type="number"
              value={total1}
              onChange={(e) => setTotal1(e.target.value)}
              placeholder="e.g. 200"
              step="any"
            />
          </label>

          <div
            className="glass result-fade-in"
            onClick={() => handleCopy(result1)}
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginTop: '10px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>
              {percent1}% of {total1} is
            </small>
            <b style={{ fontSize: '32px', color: 'var(--ac)', display: 'block', margin: '4px 0' }}>
              {result1}
            </b>
            <span style={{ fontSize: '11px', color: 'var(--dim)' }}>Tap to copy result</span>
          </div>
        </div>
      )}

      {tab === 'is' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="lbl">Value</div>
          <label className="fld">
            <input
              type="number"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
              placeholder="e.g. 45"
              step="any"
            />
          </label>

          <div className="lbl">Total / Base</div>
          <label className="fld">
            <input
              type="number"
              value={total2}
              onChange={(e) => setTotal2(e.target.value)}
              placeholder="e.g. 180"
              step="any"
            />
          </label>

          <div
            className="glass result-fade-in"
            onClick={() => handleCopy(result2)}
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginTop: '10px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>
              {val2} out of {total2} is
            </small>
            <b style={{ fontSize: '32px', color: 'var(--ac)', display: 'block', margin: '4px 0' }}>
              {result2}
            </b>
            <span style={{ fontSize: '11px', color: 'var(--dim)' }}>Tap to copy percentage</span>
          </div>
        </div>
      )}

      {tab === 'change' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="lbl">Initial Value (From)</div>
          <label className="fld">
            <input
              type="number"
              value={from3}
              onChange={(e) => setFrom3(e.target.value)}
              placeholder="e.g. 50"
              step="any"
            />
          </label>

          <div className="lbl">Final Value (To)</div>
          <label className="fld">
            <input
              type="number"
              value={to3}
              onChange={(e) => setTo3(e.target.value)}
              placeholder="e.g. 75"
              step="any"
            />
          </label>

          <div
            className="glass result-fade-in"
            onClick={() => handleCopy(result3.pct)}
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginTop: '10px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: result3.type.includes('Increase') ? 'var(--ac)' : '#ff6b6b',
                display: 'block',
              }}
            >
              {result3.type} ({result3.diff})
            </span>
            <b style={{ fontSize: '32px', color: 'var(--tx)', display: 'block', margin: '4px 0' }}>
              {result3.pct}
            </b>
            <span style={{ fontSize: '11px', color: 'var(--dim)' }}>Tap to copy percentage change</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PercentageCalculatorView;
