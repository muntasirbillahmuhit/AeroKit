import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText, store } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

// Standard public market benchmark rates relative to USD (1.0)
const CURRENCIES: Record<string, { name: string; symbol: string; rate: number }> = {
  USD: { name: 'US Dollar', symbol: '$', rate: 1.0 },
  EUR: { name: 'Euro', symbol: '€', rate: 0.92 },
  GBP: { name: 'British Pound', symbol: '£', rate: 0.79 },
  JPY: { name: 'Japanese Yen', symbol: '¥', rate: 154.5 },
  CAD: { name: 'Canadian Dollar', symbol: 'CA$', rate: 1.38 },
  AUD: { name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
  CHF: { name: 'Swiss Franc', symbol: 'CHF', rate: 0.91 },
  CNY: { name: 'Chinese Yuan', symbol: '¥', rate: 7.23 },
  INR: { name: 'Indian Rupee', symbol: '₹', rate: 83.4 },
  SGD: { name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 },
  AED: { name: 'UAE Dirham', symbol: 'AED', rate: 3.67 },
  BRL: { name: 'Brazilian Real', symbol: 'R$', rate: 5.15 },
  MXN: { name: 'Mexican Peso', symbol: 'Mex$', rate: 17.1 },
  KRW: { name: 'South Korean Won', symbol: '₩', rate: 1370.0 },
};

export const CurrencyConverterView: React.FC = () => {
  const { toast } = useApp();
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [history, setHistory] = useState<string[]>(() =>
    store.get('aerokit_cur_hist', ['100 USD = 92.00 EUR', '50 EUR = 54.35 USD'])
  );

  const converted = React.useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) return '—';
    const rateFrom = CURRENCIES[from]?.rate || 1;
    const rateTo = CURRENCIES[to]?.rate || 1;
    const inUsd = val / rateFrom;
    const res = inUsd * rateTo;
    return res.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }, [amount, from, to]);

  const exchangeRate = React.useMemo(() => {
    const rateFrom = CURRENCIES[from]?.rate || 1;
    const rateTo = CURRENCIES[to]?.rate || 1;
    return (rateTo / rateFrom).toFixed(4);
  }, [from, to]);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSave = () => {
    if (converted === '—') return;
    const item = `${amount} ${from} = ${converted} ${to}`;
    const updated = [item, ...history.filter((h) => h !== item)].slice(0, 5);
    setHistory(updated);
    store.set('aerokit_cur_hist', updated);
    toast('Saved to conversion history');
  };

  const handleCopy = () => {
    if (converted !== '—') {
      copyText(converted).then(() => toast(`Copied ${converted}`));
    }
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header
        title="Currency Converter"
        rightAction={
          <button
            className="ib"
            onClick={handleSwap}
            aria-label="Swap currencies"
            type="button"
            title="Swap"
          >
            <Icon name="swap" size={18} color="var(--ac)" />
          </button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="lbl" style={{ margin: 0 }}>From Currency</div>
          <button type="button" onClick={handleSwap} style={{ fontSize: '11px', color: 'var(--act)', fontWeight: 700 }}>
            Swap ⇄
          </button>
        </div>

        <label className="fld">
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>
                {c} - {CURRENCIES[c].name} ({CURRENCIES[c].symbol})
              </option>
            ))}
          </select>
          <Icon name="down" size={16} />
        </label>

        <label className="fld v">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            step="any"
          />
        </label>

        <div className="lbl" style={{ marginTop: '6px' }}>To Currency</div>

        <label className="fld">
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {Object.keys(CURRENCIES).map((c) => (
              <option key={c} value={c}>
                {c} - {CURRENCIES[c].name} ({CURRENCIES[c].symbol})
              </option>
            ))}
          </select>
          <Icon name="down" size={16} />
        </label>

        {/* Result display */}
        <div
          className="glass result-fade-in"
          onClick={handleCopy}
          style={{
            padding: '16px',
            borderRadius: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>
            1 {from} = {exchangeRate} {to}
          </small>
          <b style={{ fontSize: '32px', color: 'var(--ac)', display: 'block', margin: '4px 0' }}>
            {CURRENCIES[to]?.symbol} {converted}
          </b>
          <span style={{ fontSize: '11px', color: 'var(--dim)' }}>Tap to copy conversion</span>
        </div>

        <button className="btn cv" type="button" onClick={handleSave}>
          <span>Save Conversion</span>
          <Icon name="arrow" size={16} />
        </button>

        {/* History */}
        <div className="sec" style={{ marginTop: '10px' }}>
          <span>Recent Conversions</span>
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setHistory([]);
                store.set('aerokit_cur_hist', []);
                toast('History cleared');
              }}
              style={{ fontSize: '11px', color: 'var(--mut)' }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="cvl">
          {history.length === 0 ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--dim)', fontSize: '11px' }}>
              No conversions saved yet.
            </div>
          ) : (
            history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{h}</span>
                <button
                  type="button"
                  onClick={() => copyText(h).then(() => toast('Copied'))}
                  aria-label="Copy"
                  style={{ color: 'var(--dim)', padding: '2px 4px' }}
                >
                  <Icon name="copy" size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverterView;
