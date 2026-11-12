import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { useApp } from '../../../context/AppContext';

export const DateAgeCalculatorView: React.FC = () => {
  const { toast } = useApp();
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [targetDate, setTargetDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );

  const stats = React.useMemo(() => {
    const b = new Date(birthDate);
    const t = new Date(targetDate);
    if (isNaN(b.getTime()) || isNaN(t.getTime())) return null;

    let years = t.getFullYear() - b.getFullYear();
    let months = t.getMonth() - b.getMonth();
    let days = t.getDate() - b.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(t.getFullYear(), t.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = t.getTime() - b.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

    // Next birthday
    const thisYearBday = new Date(t.getFullYear(), b.getMonth(), b.getDate());
    let nextBday = thisYearBday;
    if (thisYearBday.getTime() < t.getTime()) {
      nextBday = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
    }
    const daysToNext = Math.ceil(
      (nextBday.getTime() - t.getTime()) / (1000 * 60 * 60 * 24)
    );

    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const bornDay = weekdays[b.getDay()];

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      daysToNext,
      bornDay,
    };
  }, [birthDate, targetDate]);

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title="Date &amp; Age Calculator" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="lbl">Date of Birth</div>
        <label className="fld">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </label>

        <div className="lbl">Target / Comparison Date</div>
        <label className="fld">
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </label>

        {stats && (
          <>
            <div
              className="glass result-fade-in"
              style={{
                padding: '18px',
                borderRadius: '18px',
                textAlign: 'center',
                marginTop: '6px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--mut)', fontWeight: 600 }}>
                Exact Age
              </span>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--ac)',
                  margin: '6px 0',
                }}
              >
                {stats.years} <span style={{ fontSize: '16px', color: 'var(--tx)' }}>years</span>{' '}
                {stats.months} <span style={{ fontSize: '16px', color: 'var(--tx)' }}>months</span>{' '}
                {stats.days} <span style={{ fontSize: '16px', color: 'var(--tx)' }}>days</span>
              </div>
              <small style={{ fontSize: '11px', color: 'var(--dim)' }}>
                Born on a {stats.bornDay}
              </small>
            </div>

            <div className="sec" style={{ marginTop: '10px' }}>
              <span>Lifetime Totals</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}
            >
              <div
                className="glass"
                style={{ padding: '10px', borderRadius: '12px', textAlign: 'center' }}
              >
                <b style={{ display: 'block', fontSize: '16px', color: 'var(--cy)' }}>
                  {stats.totalDays.toLocaleString()}
                </b>
                <small style={{ fontSize: '10px', color: 'var(--mut)' }}>Total Days</small>
              </div>

              <div
                className="glass"
                style={{ padding: '10px', borderRadius: '12px', textAlign: 'center' }}
              >
                <b style={{ display: 'block', fontSize: '16px', color: 'var(--bl)' }}>
                  {stats.totalWeeks.toLocaleString()}
                </b>
                <small style={{ fontSize: '10px', color: 'var(--mut)' }}>Total Weeks</small>
              </div>

              <div
                className="glass"
                style={{ padding: '10px', borderRadius: '12px', textAlign: 'center' }}
              >
                <b style={{ display: 'block', fontSize: '16px', color: 'var(--ac)' }}>
                  {stats.daysToNext}
                </b>
                <small style={{ fontSize: '10px', color: 'var(--mut)' }}>Days to B-Day</small>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DateAgeCalculatorView;
