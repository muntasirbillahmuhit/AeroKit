import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { useApp } from '../../../context/AppContext';

interface DateTimeToolsViewProps {
  toolId: string;
}

export const DateTimeToolsView: React.FC<DateTimeToolsViewProps> = ({ toolId }) => {
  const { toast } = useApp();
  const [now, setNow] = useState(new Date());

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch state
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (swRunning) {
      interval = setInterval(() => setSwTime((t) => t + 10), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  // Countdown timer state
  const [cdInputDigits, setCdInputDigits] = useState('0500'); // Default 5 mins ("0500" = 00h 05m 00s)
  const [cdRemaining, setCdRemaining] = useState(300);
  const [cdTotalSeconds, setCdTotalSeconds] = useState(300);
  const [cdRunning, setCdRunning] = useState(false);
  const [cdActiveView, setCdActiveView] = useState<'setup' | 'active'>('setup');

  // Format timer duration label (e.g. "10s timer", "5m timer")
  const getTimerLabel = (totalSecs: number) => {
    if (totalSecs < 60) return `${totalSecs}s timer`;
    if (totalSecs % 3600 === 0) return `${totalSecs / 3600}h timer`;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return secs > 0 ? `${mins}m ${secs}s timer` : `${mins}m timer`;
  };

  // Parse input digits into total seconds
  const parseDigitsToSeconds = (digits: string) => {
    const padded = digits.padStart(6, '0');
    const hh = parseInt(padded.slice(0, 2), 10);
    const mm = parseInt(padded.slice(2, 4), 10);
    const ss = parseInt(padded.slice(4, 6), 10);
    return hh * 3600 + mm * 60 + ss;
  };

  const formatDigitsDisplay = (digits: string, remainingSecs: number, isRunning: boolean) => {
    if (isRunning || (remainingSecs > 0 && digits === '')) {
      const hh = String(Math.floor(remainingSecs / 3600)).padStart(2, '0');
      const mm = String(Math.floor((remainingSecs % 3600) / 60)).padStart(2, '0');
      const ss = String(remainingSecs % 60).padStart(2, '0');
      return { hh, mm, ss };
    } else {
      const padded = digits.padStart(6, '0');
      const hh = padded.slice(0, 2);
      const mm = padded.slice(2, 4);
      const ss = padded.slice(4, 6);
      return { hh, mm, ss };
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (cdRunning && cdRemaining > 0) {
      interval = setInterval(() => setCdRemaining((s) => s - 1), 1000);
    } else if (cdRemaining === 0 && cdRunning) {
      setCdRunning(false);
      toast('Timer completed! 🔔');
    }
    return () => clearInterval(interval);
  }, [cdRunning, cdRemaining]);

  const handleNumpadKey = (key: string) => {
    if (cdRunning) return;

    if (key === 'backspace') {
      const nextDigits = cdInputDigits.slice(0, -1);
      setCdInputDigits(nextDigits);
      const secs = parseDigitsToSeconds(nextDigits);
      setCdRemaining(secs);
      setCdTotalSeconds(secs);
    } else if (key === '00') {
      if (cdInputDigits === '' || cdInputDigits === '0') return;
      if (cdInputDigits.length >= 5) return;
      const nextDigits = (cdInputDigits + '00').slice(0, 6);
      setCdInputDigits(nextDigits);
      const secs = parseDigitsToSeconds(nextDigits);
      setCdRemaining(secs);
      setCdTotalSeconds(secs);
    } else {
      if (cdInputDigits.length >= 6) return;
      if (cdInputDigits === '0' && key === '0') return;
      const nextDigits = (cdInputDigits + key).replace(/^0+/, '').slice(0, 6);
      setCdInputDigits(nextDigits);
      const secs = parseDigitsToSeconds(nextDigits);
      setCdRemaining(secs);
      setCdTotalSeconds(secs);
    }
  };

  const handlePresetTimer = (mins: number) => {
    const minsStr = String(mins).padStart(2, '0');
    const digits = `${minsStr}00`;
    setCdInputDigits(digits);
    const secs = mins * 60;
    setCdRemaining(secs);
    setCdTotalSeconds(secs);
    setCdRunning(false);
  };

  const handleStartTimer = () => {
    if (cdRunning) {
      setCdRunning(false);
    } else {
      let secsToRun = cdRemaining;
      if (secsToRun === 0 && cdInputDigits !== '') {
        secsToRun = parseDigitsToSeconds(cdInputDigits);
        setCdRemaining(secsToRun);
        setCdTotalSeconds(secsToRun);
      } else if (cdTotalSeconds === 0 || cdTotalSeconds !== secsToRun) {
        setCdTotalSeconds(secsToRun);
      }
      if (secsToRun > 0) {
        setCdRunning(true);
        setCdActiveView('active');
      } else {
        toast('Please enter a time for the timer');
      }
    }
  };

  const handleAddOneMinute = () => {
    setCdRemaining((prev) => prev + 60);
    setCdTotalSeconds((prev) => prev + 60);
    toast('+1:00 added');
  };

  const handleResetTimer = () => {
    setCdRunning(false);
    const initialSecs = cdTotalSeconds > 0 ? cdTotalSeconds : parseDigitsToSeconds(cdInputDigits);
    setCdRemaining(initialSecs);
  };

  const handleCloseActiveTimer = () => {
    setCdRunning(false);
    setCdActiveView('setup');
  };

  // Pomodoro state
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');
  const [pomoSecs, setPomoSecs] = useState(25 * 60);
  const [pomoRunning, setPomoRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (pomoRunning && pomoSecs > 0) {
      interval = setInterval(() => setPomoSecs((s) => s - 1), 1000);
    } else if (pomoSecs === 0 && pomoRunning) {
      setPomoRunning(false);
      if (pomoMode === 'work') {
        setPomoMode('break');
        setPomoSecs(5 * 60);
        toast('Work session done! Take a 5-minute break.');
      } else {
        setPomoMode('work');
        setPomoSecs(25 * 60);
        toast('Break over! Back to focus.');
      }
    }
    return () => clearInterval(interval);
  }, [pomoRunning, pomoSecs, pomoMode]);

  // Tally counter state
  const [tally, setTally] = useState(0);

  // Timezone Converter State (Matching Reference Screenshot)
  interface TzLocation {
    key: string;
    country: string;
    city: string;
    flag: string;
    tz: string;
  }

  const tzLocations: TzLocation[] = [
    { key: 'BD', country: 'Bangladesh', city: 'Dhaka', flag: '🇧🇩', tz: 'Asia/Dhaka' },
    { key: 'US_NY', country: 'USA (New York)', city: 'New York', flag: '🇺🇸', tz: 'America/New_York' },
    { key: 'US_LA', country: 'USA (Los Angeles)', city: 'Los Angeles', flag: '🇺🇸', tz: 'America/Los_Angeles' },
    { key: 'GB', country: 'United Kingdom', city: 'London', flag: '🇬🇧', tz: 'Europe/London' },
    { key: 'JP', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', tz: 'Asia/Tokyo' },
    { key: 'AU', country: 'Australia', city: 'Sydney', flag: '🇦🇺', tz: 'Australia/Sydney' },
    { key: 'IN', country: 'India', city: 'Kolkata', flag: '🇮🇳', tz: 'Asia/Kolkata' },
    { key: 'DE', country: 'Germany', city: 'Berlin', flag: '🇩🇪', tz: 'Europe/Berlin' },
    { key: 'FR', country: 'France', city: 'Paris', flag: '🇫🇷', tz: 'Europe/Paris' },
    { key: 'AE', country: 'UAE', city: 'Dubai', flag: '🇦🇪', tz: 'Asia/Dubai' },
    { key: 'SG', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', tz: 'Asia/Singapore' },
    { key: 'CA', country: 'Canada', city: 'Toronto', flag: '🇨🇦', tz: 'America/Toronto' },
    { key: 'BR', country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', tz: 'America/Sao_Paulo' },
    { key: 'SA', country: 'Saudi Arabia', city: 'Riyadh', flag: '🇸🇦', tz: 'Asia/Riyadh' },
    { key: 'ES', country: 'Spain', city: 'Madrid', flag: '🇪🇸', tz: 'Europe/Madrid' },
    { key: 'CN', country: 'China', city: 'Shanghai', flag: '🇨🇳', tz: 'Asia/Shanghai' },
    { key: 'KR', country: 'South Korea', city: 'Seoul', flag: '🇰🇷', tz: 'Asia/Seoul' },
  ];

  const getTodayDateStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getNowTimeStr = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const [tzSelectedDate, setTzSelectedDate] = useState(getTodayDateStr());
  const [tzSelectedTime, setTzSelectedTime] = useState(getNowTimeStr());
  const [tzFromKey, setTzFromKey] = useState('BD');
  const [tzToKey, setTzToKey] = useState('US_NY');
  const [tzResult, setTzResult] = useState<{
    timeStr: string;
    dateStr: string;
    offsetDiffStr: string;
  } | null>(null);

  const currentFromLoc = tzLocations.find((l) => l.key === tzFromKey) || tzLocations[0];
  const currentToLoc = tzLocations.find((l) => l.key === tzToKey) || tzLocations[1];

  const handleSwapTz = () => {
    const prevFrom = tzFromKey;
    setTzFromKey(tzToKey);
    setTzToKey(prevFrom);
    toast('Swapped time zones');
  };

  const calculateTzConversion = () => {
    try {
      const fromLoc = tzLocations.find((l) => l.key === tzFromKey) || tzLocations[0];
      const toLoc = tzLocations.find((l) => l.key === tzToKey) || tzLocations[1];

      if (!tzSelectedDate || !tzSelectedTime) {
        toast('Please select date and time');
        return;
      }

      const [year, month, day] = tzSelectedDate.split('-').map(Number);
      const [hours, minutes] = tzSelectedTime.split(':').map(Number);

      const dt = new Date(Date.UTC(year, month - 1, day, hours, minutes));

      const timeStr = dt.toLocaleTimeString('en-US', {
        timeZone: toLoc.tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const dateStr = dt.toLocaleDateString('en-US', {
        timeZone: toLoc.tz,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const refDate = new Date();
      const fromTimeString = refDate.toLocaleString('en-US', { timeZone: fromLoc.tz });
      const toTimeString = refDate.toLocaleString('en-US', { timeZone: toLoc.tz });
      const diffMs = new Date(toTimeString).getTime() - new Date(fromTimeString).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const offsetDiffStr =
        diffHours === 0
          ? 'Same time zone'
          : `${diffHours > 0 ? '+' : ''}${diffHours} hrs difference`;

      setTzResult({
        timeStr,
        dateStr,
        offsetDiffStr,
      });
    } catch {
      toast('Error converting time zone');
    }
  };

  // Calendar state
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay();

  const titles: Record<string, string> = {
    'analog-clock': 'Analog Clock',
    'digital-clock': 'Digital Clock',
    'tz-conv': 'Time Zone Converter',
    calendar: 'Interactive Calendar',
    stopwatch: 'Precision Stopwatch',
    timer: 'Countdown Timer',
    pomodoro: 'Pomodoro Focus Timer',
    'tally-counter': 'Tally Counter',
  };

  // Clock calculations
  const sec = now.getSeconds();
  const min = now.getMinutes();
  const hr = now.getHours() % 12;
  const secDeg = (sec / 60) * 360;
  const minDeg = ((min + sec / 60) / 60) * 360;
  const hrDeg = ((hr + min / 60) / 12) * 360;

  const formatStopwatch = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const c = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${c.toString().padStart(2, '0')}`;
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Date & Time'} />

      {/* 1. Analog Clock */}
      {toolId === 'analog-clock' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            className="glass"
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              position: 'relative',
              boxShadow: '0 0 32px rgba(198, 255, 61, 0.25)',
              margin: '10px 0',
            }}
          >
            {/* Center dot */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--ac)',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
            />
            {/* Hour hand */}
            <div
              style={{
                position: 'absolute',
                bottom: '50%',
                left: 'calc(50% - 2.5px)',
                width: '5px',
                height: '52px',
                background: 'var(--tx)',
                borderRadius: '3px',
                transformOrigin: 'bottom center',
                transform: `rotate(${hrDeg}deg)`,
              }}
            />
            {/* Minute hand */}
            <div
              style={{
                position: 'absolute',
                bottom: '50%',
                left: 'calc(50% - 1.5px)',
                width: '3px',
                height: '75px',
                background: 'var(--cy)',
                borderRadius: '2px',
                transformOrigin: 'bottom center',
                transform: `rotate(${minDeg}deg)`,
              }}
            />
            {/* Second hand */}
            <div
              style={{
                position: 'absolute',
                bottom: '50%',
                left: 'calc(50% - 1px)',
                width: '2px',
                height: '85px',
                background: 'var(--ac)',
                transformOrigin: 'bottom center',
                transform: `rotate(${secDeg}deg)`,
              }}
            />
          </div>

          <b style={{ fontSize: '24px', letterSpacing: '1px' }}>{now.toLocaleTimeString()}</b>
          <span style={{ fontSize: '12px', color: 'var(--mut)' }}>{now.toDateString()}</span>
        </div>
      )}

      {/* 2. Digital Clock */}
      {toolId === 'digital-clock' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            className="glass"
            style={{
              padding: '28px 20px',
              borderRadius: '22px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: 'var(--ac)',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                lineHeight: 1,
              }}
            >
              {now.toLocaleTimeString()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--mut)', marginTop: '8px' }}>
              {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Time Zone Converter (Redesigned matching uploaded screenshot) */}
      {toolId === 'tz-conv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Select Date & Time */}
          <div
            className="glass"
            style={{
              padding: '18px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
              Select Date & Time
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Date Input Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  borderRadius: '14px',
                  padding: '10px 12px',
                }}
              >
                <Icon name="calendar" size={18} color="var(--dim)" />
                <input
                  type="date"
                  value={tzSelectedDate}
                  onChange={(e) => setTzSelectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--tx)',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Time Input Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                  borderRadius: '14px',
                  padding: '10px 12px',
                }}
              >
                <Icon name="clock" size={18} color="var(--dim)" />
                <input
                  type="time"
                  value={tzSelectedTime}
                  onChange={(e) => setTzSelectedTime(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--tx)',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* From Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx)', paddingLeft: '4px' }}>
              From
            </span>
            <div
              className="glass"
              style={{
                position: 'relative',
                borderRadius: '16px',
                border: '1px solid var(--bd)',
                background: 'var(--s2)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '26px', lineHeight: 1 }}>{currentFromLoc.flag}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--tx)' }}>
                  {currentFromLoc.country}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--mut)' }}>
                  {currentFromLoc.city}
                </span>
              </div>
              <select
                value={tzFromKey}
                onChange={(e) => setTzFromKey(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              >
                {tzLocations.map((loc) => (
                  <option key={loc.key} value={loc.key}>
                    {loc.flag} {loc.country} ({loc.city})
                  </option>
                ))}
              </select>
              <Icon name="down" size={18} color="var(--dim)" />
            </div>
          </div>

          {/* Centered Swap Button */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0' }}>
            <button
              type="button"
              onClick={handleSwapTz}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                color: 'var(--ac)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease',
              }}
              title="Swap From and To time zones"
            >
              <Icon name="swap" size={18} />
            </button>
          </div>

          {/* To Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tx)', paddingLeft: '4px' }}>
              To
            </span>
            <div
              className="glass"
              style={{
                position: 'relative',
                borderRadius: '16px',
                border: '1px solid var(--bd)',
                background: 'var(--s2)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '26px', lineHeight: 1 }}>{currentToLoc.flag}</span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--tx)' }}>
                  {currentToLoc.country}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--mut)' }}>
                  {currentToLoc.city}
                </span>
              </div>
              <select
                value={tzToKey}
                onChange={(e) => setTzToKey(e.target.value)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              >
                {tzLocations.map((loc) => (
                  <option key={loc.key} value={loc.key}>
                    {loc.flag} {loc.country} ({loc.city})
                  </option>
                ))}
              </select>
              <Icon name="down" size={18} color="var(--dim)" />
            </div>
          </div>

          {/* Primary Convert Button */}
          <button
            type="button"
            className="btn"
            onClick={calculateTzConversion}
            style={{
              height: '46px',
              borderRadius: '23px',
              fontSize: '15px',
              fontWeight: 700,
              marginTop: '4px',
            }}
          >
            Convert
          </button>

          {/* Conversion Output Result Card */}
          {tzResult && (
            <div
              className="glass result-fade-in"
              style={{
                padding: '18px',
                borderRadius: '20px',
                border: '1.5px solid var(--ac)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <span style={{ fontSize: '11.5px', color: 'var(--mut)', fontWeight: 600 }}>
                Converted Time in {currentToLoc.country}
              </span>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--ac)', fontFamily: 'monospace' }}>
                {tzResult.timeStr}
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--tx)' }}>
                {tzResult.dateStr}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--cy)', marginTop: '2px' }}>
                {tzResult.offsetDiffStr}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Calendar */}
      {toolId === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="ib"
              onClick={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else setCalMonth((m) => m - 1);
              }}
            >
              <Icon name="back" size={16} />
            </button>
            <b style={{ fontSize: '15px' }}>
              {new Date(calYear, calMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </b>
            <button
              type="button"
              className="ib"
              onClick={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else setCalMonth((m) => m + 1);
              }}
            >
              <Icon name="chev" size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--mut)', padding: '4px 0' }}>
                {d}
              </span>
            ))}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday =
                day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
              return (
                <div
                  key={day}
                  style={{
                    padding: '8px 0',
                    fontSize: '12px',
                    fontWeight: isToday ? 800 : 500,
                    borderRadius: '8px',
                    background: isToday ? 'var(--ac)' : 'var(--s2)',
                    color: isToday ? 'var(--onac)' : 'var(--tx)',
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Stopwatch */}
      {toolId === 'stopwatch' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            className="glass"
            style={{
              padding: '24px',
              borderRadius: '20px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: 'var(--ac)',
                fontFamily: 'monospace',
                letterSpacing: '1px',
              }}
            >
              {formatStopwatch(swTime)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setSwRunning(!swRunning)}
              style={{ flex: 1, height: '42px', fontSize: '13px' }}
            >
              {swRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (swRunning) {
                  setLaps((l) => [swTime, ...l]);
                } else {
                  setSwTime(0);
                  setLaps([]);
                }
              }}
              style={{ flex: 1, height: '42px', fontSize: '13px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              {swRunning ? 'Lap' : 'Reset'}
            </button>
          </div>

          {laps.length > 0 && (
            <div className="glass" style={{ width: '100%', padding: '10px', borderRadius: '14px', maxHeight: '140px', overflowY: 'auto' }}>
              {laps.map((lap, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--mut)' }}>Lap #{laps.length - i}</span>
                  <b style={{ fontFamily: 'monospace' }}>{formatStopwatch(lap)}</b>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Countdown Timer (Redesigned matching uploaded screenshots) */}
      {toolId === 'timer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', padding: '4px 0 16px' }}>
          {cdActiveView === 'active' ? (
            /* ACTIVE RUNNING TIMER VIEW (Matching Screenshot #2) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {/* Active Timer Glass Card */}
              <div
                className="glass"
                style={{
                  padding: '20px 18px 24px',
                  borderRadius: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  border: '1.5px solid var(--glass-border, var(--bd))',
                  boxShadow: 'var(--glass-glow)',
                  position: 'relative',
                }}
              >
                {/* Card Header: Label e.g. "10s timer" + Close X Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--tx)', opacity: 0.9 }}>
                    {getTimerLabel(cdTotalSeconds)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCloseActiveTimer}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--mut)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                    title="Close / Delete timer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Circular SVG Progress Ring with Center Time & Pause/Play Button */}
                <div style={{ position: 'relative', width: '220px', height: '220px', display: 'grid', placeItems: 'center', margin: '4px 0' }}>
                  <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Outer track circle */}
                    <circle
                      cx="110"
                      cy="110"
                      r="92"
                      fill="none"
                      stroke="var(--s3)"
                      strokeWidth="7"
                      opacity="0.35"
                    />
                    {/* Animated active progress stroke ring */}
                    <circle
                      cx="110"
                      cy="110"
                      r="92"
                      fill="none"
                      stroke="var(--ac)"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 92}
                      strokeDashoffset={2 * Math.PI * 92 * (1 - (cdTotalSeconds > 0 ? cdRemaining / cdTotalSeconds : 0))}
                      style={{
                        transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
                        filter: 'drop-shadow(0 0 10px rgba(198, 255, 61, 0.55))',
                      }}
                    />
                  </svg>

                  {/* Center Overlay: Remaining Time + Pause/Play Icon */}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '44px',
                        fontWeight: 800,
                        fontFamily: 'Manrope, monospace',
                        letterSpacing: '-1px',
                        color: 'var(--tx)',
                        lineHeight: 1,
                      }}
                    >
                      {formatTimer(cdRemaining)}
                    </span>

                    {/* Center Pause / Resume Toggle */}
                    <button
                      type="button"
                      onClick={() => setCdRunning(!cdRunning)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--ac)',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        padding: '6px',
                        transition: 'transform 0.15s ease',
                      }}
                      title={cdRunning ? 'Pause' : 'Resume'}
                    >
                      {cdRunning ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1.5" />
                          <rect x="14" y="4" width="4" height="16" rx="1.5" />
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Controls below Progress Ring: +1:00 Pill + Reset Button */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
                  {/* +1:00 Button */}
                  <button
                    type="button"
                    onClick={handleAddOneMinute}
                    className="glass-interactive"
                    style={{
                      padding: '12px 28px',
                      borderRadius: '24px',
                      background: 'var(--s2)',
                      border: '1px solid var(--glass-border-subtle, var(--bd))',
                      color: 'var(--tx)',
                      fontWeight: 700,
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    +1:00
                  </button>

                  {/* Reset ↺ Button */}
                  <button
                    type="button"
                    onClick={handleResetTimer}
                    className="glass-interactive"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--s2)',
                      border: '1px solid var(--glass-border-subtle, var(--bd))',
                      color: 'var(--tx)',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                    title="Reset timer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Floating + FAB to add another timer / open setup keypad */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setCdActiveView('setup')}
                  className="glass-interactive"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '20px',
                    background: 'var(--s2)',
                    border: '1.5px solid var(--ac)',
                    color: 'var(--ac)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4), 0 0 16px rgba(198, 255, 61, 0.25)',
                  }}
                  title="Setup new timer"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            /* SETUP / NUMPAD KEYPAD VIEW (Matching Screenshot #1) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
              {/* 1. Large 3-Column Display: Hours, Minutes, Seconds */}
              {(() => {
                const { hh, mm, ss } = formatDigitsDisplay(cdInputDigits, cdRemaining, cdRunning);
                return (
                  <div
                    className="glass"
                    style={{
                      padding: '24px 12px',
                      borderRadius: '24px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      textAlign: 'center',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: cdRunning
                        ? '0 0 28px rgba(198, 255, 61, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : 'var(--glass-glow)',
                      border: cdRunning ? '1.5px solid var(--ac)' : '1px solid var(--glass-border, var(--bd))',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {/* Hours Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '44px',
                          fontWeight: 800,
                          lineHeight: 1,
                          letterSpacing: '-1px',
                          color: hh !== '00' || cdRunning ? 'var(--ac)' : 'var(--tx)',
                          fontFamily: 'Manrope, monospace',
                          opacity: hh === '00' && !cdRunning ? 0.45 : 1,
                          transition: 'color 0.2s ease, opacity 0.2s ease',
                        }}
                      >
                        {hh}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mut)', marginTop: '8px' }}>
                        Hours
                      </span>
                    </div>

                    {/* Minutes Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '44px',
                          fontWeight: 800,
                          lineHeight: 1,
                          letterSpacing: '-1px',
                          color: mm !== '00' || cdRunning ? 'var(--ac)' : 'var(--tx)',
                          fontFamily: 'Manrope, monospace',
                          opacity: mm === '00' && hh === '00' && !cdRunning ? 0.45 : 1,
                          transition: 'color 0.2s ease, opacity 0.2s ease',
                        }}
                      >
                        {mm}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mut)', marginTop: '8px' }}>
                        Minutes
                      </span>
                    </div>

                    {/* Seconds Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '44px',
                          fontWeight: 800,
                          lineHeight: 1,
                          letterSpacing: '-1px',
                          color: ss !== '00' || cdRunning ? 'var(--ac)' : 'var(--tx)',
                          fontFamily: 'Manrope, monospace',
                          opacity: ss === '00' && mm === '00' && hh === '00' && !cdRunning ? 0.45 : 1,
                          transition: 'color 0.2s ease, opacity 0.2s ease',
                        }}
                      >
                        {ss}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mut)', marginTop: '8px' }}>
                        Seconds
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Preset Buttons Row: 1m, 5m, 10m, 15m */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
                {[1, 5, 10, 15].map((m) => {
                  const isSelected = parseDigitsToSeconds(cdInputDigits) === m * 60 && !cdRunning;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handlePresetTimer(m)}
                      className="glass-interactive"
                      style={{
                        height: '42px',
                        borderRadius: '21px',
                        background: isSelected ? 'var(--ac)' : 'var(--s2)',
                        color: isSelected ? 'var(--onac)' : 'var(--tx)',
                        fontWeight: 700,
                        fontSize: '13.5px',
                        border: isSelected ? 'none' : '1px solid var(--bd)',
                        boxShadow: isSelected ? '0 0 16px rgba(198, 255, 61, 0.4)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {m}m
                    </button>
                  );
                })}
              </div>

              {/* 3. Primary Action Button Bar (Start / Pause + Reset) */}
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={handleStartTimer}
                  style={{
                    flex: 1,
                    height: '52px',
                    borderRadius: '26px',
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '0.2px',
                    background: cdRunning
                      ? 'linear-gradient(135deg, #ff5252, #e04040)'
                      : 'linear-gradient(100deg, var(--ac) 35%, var(--cy))',
                    color: cdRunning ? '#ffffff' : 'var(--onac)',
                    boxShadow: cdRunning
                      ? '0 0 20px rgba(255, 82, 82, 0.4)'
                      : '0 0 22px rgba(198, 255, 61, 0.35)',
                  }}
                >
                  {cdRunning ? 'Pause' : 'Start'}
                </button>

                {(cdRemaining > 0 || cdInputDigits !== '') && (
                  <button
                    type="button"
                    className="glass-interactive"
                    onClick={handleResetTimer}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--s2)',
                      border: '1px solid var(--bd)',
                      color: 'var(--tx)',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title="Reset timer"
                  >
                    <Icon name="refresh" size={20} />
                  </button>
                )}
              </div>

              {/* 4. Numeric Keypad Grid (3 Columns x 4 Rows: 1-9, 00, 0, Backspace) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px 14px',
                  width: '100%',
                  marginTop: '2px',
                  opacity: cdRunning ? 0.4 : 1,
                  pointerEvents: cdRunning ? 'none' : 'auto',
                  transition: 'opacity 0.2s ease',
                }}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'backspace'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNumpadKey(key)}
                    className="glass-interactive"
                    style={{
                      height: '46px',
                      borderRadius: '16px',
                      background: 'var(--s2)',
                      border: '1px solid var(--glass-border-subtle, var(--bd))',
                      color: 'var(--tx)',
                      fontSize: key === '00' ? '18px' : '22px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: key === 'backspace' ? 'inherit' : 'Manrope, monospace',
                      cursor: 'pointer',
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {key === 'backspace' ? (
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                        <line x1="18" y1="9" x2="12" y2="15" />
                        <line x1="12" y1="9" x2="18" y2="15" />
                      </svg>
                    ) : (
                      key
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. Pomodoro */}
      {toolId === 'pomodoro' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div className="tabs" style={{ width: '100%' }}>
            <button
              type="button"
              className={pomoMode === 'work' ? 'on' : ''}
              onClick={() => {
                setPomoMode('work');
                setPomoSecs(25 * 60);
                setPomoRunning(false);
              }}
            >
              Focus Session (25m)
            </button>
            <button
              type="button"
              className={pomoMode === 'break' ? 'on' : ''}
              onClick={() => {
                setPomoMode('break');
                setPomoSecs(5 * 60);
                setPomoRunning(false);
              }}
            >
              Short Break (5m)
            </button>
          </div>

          <div
            className="glass"
            style={{
              padding: '28px',
              borderRadius: '24px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <b
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: pomoMode === 'work' ? 'var(--ac)' : 'var(--cy)',
                fontFamily: 'monospace',
                display: 'block',
              }}
            >
              {formatTimer(pomoSecs)}
            </b>
            <span style={{ fontSize: '12px', color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {pomoMode === 'work' ? 'Stay Focused' : 'Relax & Hydrate'}
            </span>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => setPomoRunning(!pomoRunning)}
            style={{ width: '100%', height: '44px', fontSize: '14px' }}
          >
            {pomoRunning ? 'Pause Session' : 'Start Focus Session'}
          </button>
        </div>
      )}

      {/* 8. Tally Counter */}
      {toolId === 'tally-counter' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            className="glass"
            style={{
              padding: '24px',
              borderRadius: '20px',
              textAlign: 'center',
              width: '100%',
            }}
          >
            <b style={{ fontSize: '64px', fontWeight: 900, color: 'var(--ac)', lineHeight: 1 }}>
              {tally}
            </b>
          </div>

          <button
            type="button"
            onClick={() => {
              setTally((t) => t + 1);
              if ('vibrate' in navigator) navigator.vibrate(20);
            }}
            className="btn"
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              fontSize: '48px',
              fontWeight: 900,
              boxShadow: '0 0 32px rgba(198, 255, 61, 0.4)',
            }}
          >
            +
          </button>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setTally((t) => Math.max(0, t - 1));
                if ('vibrate' in navigator) navigator.vibrate(15);
              }}
              style={{ flex: 1, height: '40px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Decrement (-1)
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setTally(0);
                toast('Counter reset');
              }}
              style={{ flex: 1, height: '40px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Reset (0)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeToolsView;
