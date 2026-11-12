import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

export const LoanEmiCalculatorView: React.FC = () => {
  const { toast } = useApp();
  const [principal, setPrincipal] = useState('25000');
  const [rate, setRate] = useState('7.5');
  const [tenureYears, setTenureYears] = useState('5');

  const calculation = React.useMemo(() => {
    const P = parseFloat(principal);
    const annualRate = parseFloat(rate);
    const years = parseFloat(tenureYears);

    if (isNaN(P) || isNaN(annualRate) || isNaN(years) || P <= 0 || annualRate <= 0 || years <= 0) {
      return null;
    }

    const N = years * 12; // months
    const R = annualRate / (12 * 100); // monthly interest rate

    // EMI formula: P * R * (1+R)^N / ((1+R)^N - 1)
    const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;
    const principalPct = Math.round((P / totalPayment) * 100);
    const interestPct = 100 - principalPct;

    return {
      emi: emi.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
      principalPct,
      interestPct,
    };
  }, [principal, rate, tenureYears]);

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title="Loan &amp; EMI Estimator" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="lbl">Principal Loan Amount ($)</div>
        <label className="fld">
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 25000"
            step="any"
          />
        </label>

        <div className="lbl">Annual Interest Rate (%)</div>
        <label className="fld">
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 7.5"
            step="any"
          />
          <span style={{ color: 'var(--mut)', fontWeight: 700 }}>%</span>
        </label>

        <div className="lbl">Loan Tenure (Years)</div>
        <label className="fld">
          <input
            type="number"
            value={tenureYears}
            onChange={(e) => setTenureYears(e.target.value)}
            placeholder="e.g. 5"
            step="any"
          />
          <span style={{ color: 'var(--mut)', fontWeight: 600 }}>Years</span>
        </label>

        {calculation ? (
          <>
            <div
              className="glass result-fade-in"
              onClick={() => {
                copyText(`$${calculation.emi}/mo`).then(() => toast('Copied EMI'));
              }}
              style={{
                padding: '16px',
                borderRadius: '18px',
                textAlign: 'center',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>
                Estimated Monthly Installment (EMI)
              </small>
              <b style={{ fontSize: '34px', color: 'var(--ac)', display: 'block', margin: '4px 0' }}>
                ${calculation.emi}
                <span style={{ fontSize: '14px', color: 'var(--tx)', fontWeight: 600 }}>/mo</span>
              </b>
              <span style={{ fontSize: '10.5px', color: 'var(--dim)' }}>Tap to copy monthly payment</span>
            </div>

            {/* Breakdown summary */}
            <div
              className="glass"
              style={{
                padding: '14px',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <small style={{ color: 'var(--mut)', fontSize: '10.5px', display: 'block' }}>Total Interest</small>
                <b style={{ color: 'var(--cy)', fontSize: '14px' }}>${calculation.totalInterest}</b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <small style={{ color: 'var(--mut)', fontSize: '10.5px', display: 'block' }}>Total Repayment</small>
                <b style={{ color: 'var(--tx)', fontSize: '14px' }}>${calculation.totalPayment}</b>
              </div>
            </div>

            {/* Visual ratio bar */}
            <div style={{ marginTop: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--mut)', marginBottom: '4px' }}>
                <span>Principal ({calculation.principalPct}%)</span>
                <span>Interest ({calculation.interestPct}%)</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', display: 'flex', overflow: 'hidden', background: 'var(--s2)' }}>
                <div style={{ width: `${calculation.principalPct}%`, background: 'var(--ac)' }} />
                <div style={{ width: `${calculation.interestPct}%`, background: 'var(--cy)' }} />
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--dim)', fontSize: '12px' }}>
            Enter loan amount, rate, and tenure to calculate EMI.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanEmiCalculatorView;
