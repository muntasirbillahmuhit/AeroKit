import React, { useState, useEffect } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { CONVERTERS, ConverterConfig } from '../../../data/convertersData';
import { copyText, store } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface UnitConverterViewProps {
  toolId?: string;
}

export const UnitConverterView: React.FC<UnitConverterViewProps> = ({
  toolId = 'len-conv',
}) => {
  const { toast } = useApp();
  const [activeTool, setActiveTool] = useState(toolId);

  const cfg: ConverterConfig =
    CONVERTERS[activeTool] || CONVERTERS['len-conv'];

  const [from, setFrom] = useState(cfg.defFrom);
  const [to, setTo] = useState(cfg.defTo);
  const [val, setVal] = useState('1');

  const historyKey = `aerokit_conv_hist_${cfg.title.replace(/\W+/g, '_').toLowerCase()}`;
  const [history, setHistory] = useState<string[]>(() =>
    store.get(historyKey, [])
  );

  useEffect(() => {
    setActiveTool(toolId);
    const newCfg = CONVERTERS[toolId] || CONVERTERS['len-conv'];
    setFrom(newCfg.defFrom);
    setTo(newCfg.defTo);
    setHistory(
      store.get(
        `aerokit_conv_hist_${newCfg.title.replace(/\W+/g, '_').toLowerCase()}`,
        []
      )
    );
  }, [toolId]);

  const compute = (): string => {
    const v = parseFloat(val);
    if (isNaN(v)) return '—';

    if (cfg.isTemp) {
      let c = v;
      if (from === '°F') c = ((v - 32) * 5) / 9;
      else if (from === 'K') c = v - 273.15;

      let out = c;
      if (to === '°F') out = (c * 9) / 5 + 32;
      else if (to === 'K') out = c + 273.15;
      return String(+out.toPrecision(8));
    }

    const f = cfg.units[from];
    const t = cfg.units[to];
    if (!f || !t) return '—';
    return String(+((v * f) / t).toPrecision(8));
  };

  const result = compute();

  const handleSwap = () => {
    const prevFrom = from;
    setFrom(to);
    setTo(prevFrom);
  };

  const handleSave = () => {
    if (result === '—') {
      toast('Enter a valid number to convert');
      return;
    }
    const item = `${val} ${from} = ${result} ${to}`;
    const nextHist = [item, ...history.filter((x) => x !== item)].slice(0, 5);
    setHistory(nextHist);
    store.set(historyKey, nextHist);
    toast('Conversion saved');
  };

  const handleCopy = () => {
    if (result !== '—') {
      copyText(result).then(() => toast(`Copied ${result}`));
    }
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header
        title={cfg.title}
        rightAction={
          <button
            className="ib"
            onClick={handleSwap}
            aria-label="Swap units"
            type="button"
            title="Swap units"
          >
            <Icon name="swap" size={18} color="var(--ac)" />
          </button>
        }
      />

      {/* Switch between categories if unit-calc */}
      {toolId === 'unit-calc' && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '6px',
            marginBottom: '8px',
          }}
        >
          {Object.keys(CONVERTERS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTool(key);
                const c = CONVERTERS[key];
                setFrom(c.defFrom);
                setTo(c.defTo);
              }}
              style={{
                flex: 'none',
                padding: '4px 10px',
                borderRadius: '8px',
                background: activeTool === key ? 'var(--ac)' : 'var(--s2)',
                color: activeTool === key ? 'var(--onac)' : 'var(--tx)',
                fontWeight: 700,
                fontSize: '11px',
                border: '1px solid var(--bd)',
              }}
            >
              {CONVERTERS[key].title.replace(' Converter', '')}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <div className="lbl" style={{ margin: 0 }}>From</div>
        <button
          type="button"
          onClick={handleSwap}
          style={{ fontSize: '11.5px', color: 'var(--act)', fontWeight: 700 }}
        >
          Swap ⇄
        </button>
      </div>

      <label className="fld">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          aria-label="From unit"
        >
          {Object.keys(cfg.units).map((u) => (
            <option key={u} value={u}>
              {cfg.names[u] || u}
            </option>
          ))}
        </select>
        <Icon name="down" size={16} />
      </label>

      <label className="fld v">
        <input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          inputMode="decimal"
          step="any"
          placeholder="Enter value..."
          aria-label="Value to convert"
        />
      </label>

      <div className="lbl">To</div>

      <label
        className="fld"
        onClick={handleCopy}
        style={{ gap: '10px', cursor: 'pointer' }}
        title="Click to copy conversion"
      >
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          style={{ width: 'auto' }}
          aria-label="To unit"
        >
          {Object.keys(cfg.units).map((u) => (
            <option key={u} value={u}>
              {cfg.names[u] || u}
            </option>
          ))}
        </select>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: 'auto',
          }}
          className="result-fade-in"
        >
          <b style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ac)' }}>
            {result}
          </b>
          <Icon name="copy" size={14} color="var(--dim)" />
        </div>
      </label>

      <button
        className="btn cv"
        onClick={handleSave}
        type="button"
        style={{ marginTop: '12px' }}
      >
        <span>Convert &amp; Save</span>
        <Icon name="arrow" size={16} />
      </button>

      {/* History */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '14px',
        }}
      >
        <div className="lbl" style={{ margin: 0 }}>
          Recent Conversions
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setHistory([]);
              store.set(historyKey, []);
              toast('History cleared');
            }}
            style={{
              fontSize: '11px',
              color: 'var(--mut)',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Icon name="trash" size={12} /> Clear
          </button>
        )}
      </div>

      <div className="cvl" style={{ marginTop: '6px' }}>
        {history.length === 0 ? (
          <div
            style={{
              padding: '12px',
              textAlign: 'center',
              color: 'var(--dim)',
              fontSize: '11px',
              borderRadius: '12px',
            }}
          >
            No conversions saved yet.
          </div>
        ) : (
          history.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 12px',
                borderBottom: '1px solid var(--bd)',
              }}
            >
              <span>{r}</span>
              <button
                type="button"
                onClick={() => copyText(r).then(() => toast('Copied to clipboard'))}
                style={{ color: 'var(--dim)', padding: '2px 4px' }}
                aria-label="Copy conversion"
              >
                <Icon name="copy" size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UnitConverterView;
