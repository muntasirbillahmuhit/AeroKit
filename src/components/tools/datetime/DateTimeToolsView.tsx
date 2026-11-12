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
  const [cdSeconds, setCdSeconds] = useState(300); // 5 min
  const [cdRemaining, setCdRemaining] = useState(300);
  const [cdRunning, setCdRunning] = useState(false);

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

  // Timezone list
  const timezones = [
    { city: 'New York (EDT)', tz: 'America/New_York' },
    { city: 'London (BST)', tz: 'Europe/London' },
    { city: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
    { city: 'Paris (CEST)', tz: 'Europe/Paris' },
    { city: 'Sydney (AEST)', tz: 'Australia/Sydney' },
    { city: 'Dubai (GST)', tz: 'Asia/Dubai' },
  ];

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

      {/* 3. Time Zone Converter */}
      {toolId === 'tz-conv' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {timezones.map((tz) => {
            const timeStr = now.toLocaleTimeString('en-US', { timeZone: tz.tz, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return (
              <div
                key={tz.city}
                className="rec glass"
                style={{ padding: '12px 14px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <b style={{ fontSize: '13px', display: 'block' }}>{tz.city}</b>
                  <small style={{ color: 'var(--mut)', fontSize: '11px' }}>{tz.tz}</small>
                </div>
                <b style={{ fontSize: '16px', color: 'var(--ac)', fontFamily: 'monospace' }}>{timeStr}</b>
              </div>
            );
          })}
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

      {/* 6. Countdown Timer */}
      {toolId === 'timer' && (
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
            <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--ac)', fontFamily: 'monospace' }}>
              {formatTimer(cdRemaining)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
            {[1, 5, 10, 15].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setCdSeconds(m * 60);
                  setCdRemaining(m * 60);
                  setCdRunning(false);
                }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '8px',
                  background: cdSeconds === m * 60 ? 'var(--ac)' : 'var(--s2)',
                  color: cdSeconds === m * 60 ? 'var(--onac)' : 'var(--tx)',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                {m}m
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setCdRunning(!cdRunning)}
              style={{ flex: 1, height: '42px', fontSize: '13px' }}
            >
              {cdRunning ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setCdRunning(false);
                setCdRemaining(cdSeconds);
              }}
              style={{ flex: 1, height: '42px', fontSize: '13px', background: 'var(--s2)', color: 'var(--tx)', boxShadow: 'none' }}
            >
              Reset
            </button>
          </div>
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
