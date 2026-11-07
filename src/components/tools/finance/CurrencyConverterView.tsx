import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText, store } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number;
}

const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.79 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 154.5 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', rate: 1.38 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rate: 1.52 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', rate: 0.91 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', rate: 7.23 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 83.4 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', rate: 1.35 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪', rate: 3.67 },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', rate: 5.15 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', rate: 17.1 },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', rate: 1370.0 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', flag: '🇸🇦', rate: 3.75 },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', rate: 4.72 },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', rate: 36.8 },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', rate: 16100 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', rate: 1.67 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', rate: 10.8 },
};

interface HistoryItem {
  id: string;
  amount: string;
  from: string;
  to: string;
  result: string;
  timestamp: string;
}

export const CurrencyConverterView: React.FC = () => {
  const { toast } = useApp();
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState(''); // Initial empty state per requirement 1
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Live Rates State & Source Info
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});
  const [rateSource, setRateSource] = useState<{
    isLive: boolean;
    lastUpdated: string;
    sourceName: string;
  }>({
    isLive: false,
    lastUpdated: 'Initializing market rates...',
    sourceName: 'Benchmark Cache',
  });
  const [isFetching, setIsFetching] = useState(false);

  // Saved Conversions History State
  const [history, setHistory] = useState<any[]>(() =>
    store.get('aerokit_cur_hist', [])
  );

  // Fetch Live Exchange Rates from public API with Benchmark Fallback
  const fetchExchangeRates = async () => {
    setIsFetching(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          setLiveRates(data.rates);
          const timeStr = data.time_last_update_utc
            ? new Date(data.time_last_update_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setRateSource({
            isLive: true,
            lastUpdated: `Updated today at ${timeStr} UTC`,
            sourceName: 'Open Exchange Rates (Live Market)',
          });
          setIsFetching(false);
          return;
        }
      }
    } catch {
      // Offline fallback
    }

    const fallback: Record<string, number> = {};
    Object.keys(CURRENCIES).forEach((code) => {
      fallback[code] = CURRENCIES[code].rate;
    });
    setLiveRates(fallback);
    setRateSource({
      isLive: false,
      lastUpdated: 'Offline Reference Cache',
      sourceName: 'Benchmark Market Rates',
    });
    setIsFetching(false);
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // Compute Current Rate & Conversion Result
  const rateFrom = liveRates[from] || CURRENCIES[from]?.rate || 1;
  const rateTo = liveRates[to] || CURRENCIES[to]?.rate || 1;

  const currentRateRatio = useMemo(() => {
    if (!rateFrom || !rateTo) return 1;
    return rateTo / rateFrom;
  }, [rateFrom, rateTo]);

  const hasValidInput = useMemo(() => {
    if (!amount || amount.trim() === '') return false;
    const val = parseFloat(amount);
    return !isNaN(val) && val > 0;
  }, [amount]);

  const converted = useMemo(() => {
    if (!hasValidInput) return '—';
    const val = parseFloat(amount);
    const res = val * currentRateRatio;
    return res.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }, [amount, currentRateRatio, hasValidInput]);

  const handleSwap = () => {
    setIsSwapping(true);
    const temp = from;
    setFrom(to);
    setTo(temp);
    setTimeout(() => setIsSwapping(false), 300);
    toast(`Swapped ${to} ⇄ ${temp}`);
  };

  // Standardized parsing for legacy string or object history items
  const parsedHistory = useMemo<HistoryItem[]>(() => {
    return history.map((item, idx) => {
      if (typeof item === 'string') {
        const match = item.match(/^([\d.]+)\s+([A-Z]+)\s+=\s+([\d.,—]+)\s+([A-Z]+)$/);
        if (match) {
          return {
            id: `hist_${idx}_${item}`,
            amount: match[1],
            from: match[2],
            result: match[3],
            to: match[4],
            timestamp: 'Saved previously',
          };
        }
        return {
          id: `hist_${idx}`,
          amount: '100',
          from: 'USD',
          result: item,
          to: 'EUR',
          timestamp: 'Saved previously',
        };
      }
      return item;
    });
  }, [history]);

  const handleSave = () => {
    if (!hasValidInput || converted === '—') return;
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Check for duplicate entry (same amount, from, to, result) to prevent accidental duplicate taps
    const isDuplicate = parsedHistory.some(
      (h) => h.amount === amount && h.from === from && h.to === to && h.result === converted
    );

    if (isDuplicate) {
      toast('Already saved in history');
      return;
    }

    const newItem: HistoryItem = {
      id: `cur_${Date.now()}`,
      amount,
      from,
      to,
      result: converted,
      timestamp: nowStr,
    };

    const updated = [newItem, ...history].slice(0, 30);
    setHistory(updated);
    store.set('aerokit_cur_hist', updated);
    toast('Saved to conversion history!');
  };

  const handleCopyResult = () => {
    if (converted !== '—' && hasValidInput) {
      const copyContent = `${amount} ${from} = ${converted} ${to}`;
      copyText(copyContent).then(() => {
        setCopied(true);
        toast(`Copied: ${converted} ${to}`);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    store.set('aerokit_cur_hist', []);
    toast('History cleared');
  };

  const handleDeleteHistoryItem = (idToDelete: string) => {
    const updated = parsedHistory.filter((h) => h.id !== idToDelete);
    setHistory(updated);
    store.set('aerokit_cur_hist', updated);
    toast('Removed entry from history');
  };

  const handleReuseHistoryItem = (item: HistoryItem) => {
    setAmount(item.amount);
    setFrom(item.from);
    setTo(item.to);
    setShowHistoryModal(false);
    toast(`Loaded ${item.amount} ${item.from} → ${item.to}`);
  };

  const fromCurr = CURRENCIES[from] || { code: from, name: from, symbol: '$', flag: '🌐' };
  const toCurr = CURRENCIES[to] || { code: to, name: to, symbol: '€', flag: '🌐' };

  return (
    <div className="body" style={{ overflowY: 'auto', paddingBottom: '32px' }}>
      {/* Header with Functional Top-Right History Clock Icon (Requirement 2) */}
      <Header
        title="Currency Converter"
        rightAction={
          <button
            className="ib"
            onClick={() => setShowHistoryModal(true)}
            aria-label="Open Conversion History"
            type="button"
            title="Conversion History"
            style={{ color: 'var(--ac)' }}
          >
            <Icon name="clock" size={20} />
          </button>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {/* 1. Visually Separated Amount Input Card */}
        <div
          className="glass"
          style={{
            padding: '16px 18px',
            borderRadius: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1.5px solid var(--glass-border, var(--bd))',
            boxShadow: 'var(--glass-glow)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.6px', color: 'var(--mut)', textTransform: 'uppercase' }}>
              Amount to Convert
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ac)' }}>
              {fromCurr.symbol} ({fromCurr.code})
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--s2)',
              border: '1px solid var(--bd2)',
              borderRadius: '16px',
              padding: '12px 14px',
              transition: 'border-color 0.2s ease',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ac)', minWidth: '24px' }}>
              {fromCurr.symbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              step="any"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--tx)',
                fontSize: '22px',
                fontWeight: 800,
                fontFamily: 'Manrope, sans-serif',
                width: '100%',
              }}
            />
            {amount !== '' && (
              <button
                type="button"
                onClick={() => setAmount('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--dim)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'grid',
                  placeItems: 'center',
                }}
                title="Clear amount"
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </div>

          {/* Quick Preset Amount Chips */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {['10', '50', '100', '500', '1000'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="glass-interactive"
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: amount === val ? 'var(--ac)' : 'var(--s2)',
                  color: amount === val ? 'var(--onac)' : 'var(--tx)',
                  border: amount === val ? 'none' : '1px solid var(--bd)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {fromCurr.symbol}{val}
              </button>
            ))}
          </div>
        </div>

        {/* 2. From & To Currency Selectors with Center Swap Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 1 }}>
          {/* From Selector Card */}
          <div
            className="glass"
            style={{
              padding: '12px 14px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              border: '1px solid var(--bd)',
              background: 'var(--glass-bg, var(--s1))',
            }}
          >
            <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--mut)', textTransform: 'uppercase' }}>
              From Currency
            </span>

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--s2)',
                borderRadius: '14px',
                padding: '10px 12px',
                border: '1px solid var(--bd2)',
              }}
            >
              <span style={{ fontSize: '24px', lineHeight: 1 }}>{fromCurr.flag}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tx)' }}>
                  {fromCurr.code}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--mut)', fontWeight: 500 }}>
                  {fromCurr.name}
                </span>
              </div>
              <Icon name="down" size={16} color="var(--dim)" />

              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c].flag} {c} - {CURRENCIES[c].name} ({CURRENCIES[c].symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Centered Swap Button */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0', zIndex: 5 }}>
            <button
              type="button"
              onClick={handleSwap}
              className="glass-interactive"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'var(--p)',
                border: '1.5px solid var(--ac)',
                color: 'var(--ac)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.4), 0 0 16px rgba(198, 255, 61, 0.28)',
                transform: isSwapping ? 'rotate(180deg) scale(0.92)' : 'rotate(0deg) scale(1)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              title="Swap From and To currencies"
            >
              <Icon name="swap" size={20} />
            </button>
          </div>

          {/* To Selector Card */}
          <div
            className="glass"
            style={{
              padding: '12px 14px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              border: '1px solid var(--bd)',
              background: 'var(--glass-bg, var(--s1))',
            }}
          >
            <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--mut)', textTransform: 'uppercase' }}>
              To Currency
            </span>

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--s2)',
                borderRadius: '14px',
                padding: '10px 12px',
                border: '1px solid var(--bd2)',
              }}
            >
              <span style={{ fontSize: '24px', lineHeight: 1 }}>{toCurr.flag}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--tx)' }}>
                  {toCurr.code}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--mut)', fontWeight: 500 }}>
                  {toCurr.name}
                </span>
              </div>
              <Icon name="down" size={16} color="var(--dim)" />

              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c].flag} {c} - {CURRENCIES[c].name} ({CURRENCIES[c].symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* REQUIREMENT 1: Only display conversion result, rate info, copy button & save button after user enters valid amount! */}
        {hasValidInput ? (
          <>
            {/* Conversion Result Display Card */}
            <div
              className="glass result-fade-in"
              style={{
                padding: '20px 18px',
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px',
                border: '1.5px solid var(--ac)',
                boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35), 0 0 20px rgba(198, 255, 61, 0.15)',
                position: 'relative',
                zIndex: 1,
                marginTop: '2px',
              }}
            >
              {/* Exchange Rate Formula + Live/Benchmark Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mut)', fontFamily: 'monospace' }}>
                  1 {from} = {currentRateRatio.toFixed(4)} {to}
                </span>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 800,
                    background: rateSource.isLive ? 'rgba(198, 255, 61, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                    color: rateSource.isLive ? 'var(--ac)' : 'var(--mut)',
                    border: `1px solid ${rateSource.isLive ? 'rgba(198, 255, 61, 0.3)' : 'var(--bd)'}`,
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: rateSource.isLive ? 'var(--ac)' : 'var(--dim)',
                    }}
                  />
                  {rateSource.isLive ? 'LIVE' : 'BENCHMARK'}
                </div>
              </div>

              {/* Main Converted Output Display */}
              <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--ac)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                {toCurr.symbol} {converted}
              </div>

              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--tx)', opacity: 0.85 }}>
                {amount} {fromCurr.name}s = {converted} {toCurr.name}s
              </span>

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopyResult}
                className="glass-interactive"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: copied ? 'var(--ac)' : 'var(--s2)',
                  color: copied ? 'var(--onac)' : 'var(--tx)',
                  border: '1px solid var(--bd)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Icon name="copy" size={14} />
                    <span>Copy Result</span>
                  </>
                )}
              </button>
            </div>

            {/* Save Conversion Button */}
            <button
              className="btn"
              type="button"
              onClick={handleSave}
              style={{
                height: '48px',
                borderRadius: '24px',
                fontSize: '14.5px',
                fontWeight: 800,
                marginTop: '2px',
              }}
            >
              <span>Save Conversion</span>
              <Icon name="arrow" size={16} />
            </button>

            {/* Exchange Rate Source Info */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--mut)', lineHeight: 1.3, marginTop: '2px' }}>
              <div>{rateSource.sourceName} • {rateSource.lastUpdated}</div>
            </div>
          </>
        ) : (
          /* Quiet Placeholder Hint for Empty Initial State */
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--mut)',
              fontSize: '13px',
              fontWeight: 500,
              opacity: 0.75,
              borderRadius: '18px',
              border: '1px dashed var(--bd2)',
              marginTop: '4px',
            }}
          >
            Enter an amount above to view currency conversion results.
          </div>
        )}
      </div>

      {/* DEDICATED CONVERSION HISTORY MODAL / PANEL (Requirements 2, 3, 4) */}
      {showHistoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(5, 12, 20, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="glass"
            style={{
              width: '100%',
              maxWidth: '380px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '26px',
              border: '1.5px solid var(--ac)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.65), 0 0 30px rgba(198, 255, 61, 0.2)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* History Panel Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--bd)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--glass-bg-sec)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="clock" size={20} color="var(--ac)" />
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--tx)' }}>
                  Conversion History
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {parsedHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#ff5252',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                    }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mut)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                  title="Close history"
                >
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>

            {/* History Items Container */}
            <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              {parsedHistory.length === 0 ? (
                /* Empty History State (Requirement 4) */
                <div
                  style={{
                    padding: '36px 16px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--dim)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: 'var(--s2)',
                      border: '1px solid var(--bd)',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'var(--ac)',
                    }}
                  >
                    <Icon name="clock" size={26} />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--tx)' }}>
                    No saved conversions yet.
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--mut)', maxWidth: '240px', lineHeight: 1.4 }}>
                    Tap "Save Conversion" on any calculation to store it here for quick access.
                  </span>
                </div>
              ) : (
                /* History List Items with Reuse & Delete Actions (Requirement 2 & 3) */
                parsedHistory.map((item) => {
                  const itemFromCurr = CURRENCIES[item.from] || { flag: '🌐', symbol: '$' };
                  const itemToCurr = CURRENCIES[item.to] || { flag: '🌐', symbol: '€' };

                  return (
                    <div
                      key={item.id}
                      className="glass-interactive"
                      style={{
                        padding: '12px 14px',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        border: '1px solid var(--bd)',
                        background: 'var(--s2)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{itemFromCurr.flag} → {itemToCurr.flag}</span>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--tx)' }}>
                            {item.amount} {item.from} = <span style={{ color: 'var(--ac)' }}>{item.result} {item.to}</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--dim)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                          title="Delete history entry"
                        >
                          <Icon name="x" size={15} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{ fontSize: '10.5px', color: 'var(--mut)', fontWeight: 500 }}>
                          {item.timestamp}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleReuseHistoryItem(item)}
                          style={{
                            background: 'rgba(198, 255, 61, 0.14)',
                            border: '1px solid rgba(198, 255, 61, 0.35)',
                            color: 'var(--ac)',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '99px',
                            cursor: 'pointer',
                          }}
                        >
                          Use Conversion ↺
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverterView;
