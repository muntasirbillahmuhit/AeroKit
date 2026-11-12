import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

export const TipCalculatorView: React.FC = () => {
  const { toast } = useApp();
  const [bill, setBill] = useState('65.00');
  const [tipPct, setTipPct] = useState('18');
  const [people, setPeople] = useState('2');

  const calc = React.useMemo(() => {
    const B = parseFloat(bill);
    const T = parseFloat(tipPct);
    const P = parseInt(people, 10);

    if (isNaN(B) || B <= 0 || isNaN(T) || T < 0 || isNaN(P) || P < 1) {
      return null;
    }

    const tipTotal = (B * T) / 100;
    const billTotal = B + tipTotal;
    const perPerson = billTotal / P;
    const tipPerPerson = tipTotal / P;

    return {
      tipTotal: tipTotal.toFixed(2),
      billTotal: billTotal.toFixed(2),
      perPerson: perPerson.toFixed(2),
      tipPerPerson: tipPerPerson.toFixed(2),
    };
  }, [bill, tipPct, people]);

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title="Tip &amp; Bill Splitter" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="lbl">Bill Amount ($)</div>
        <label className="fld">
          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            placeholder="0.00"
            step="any"
          />
        </label>

        <div className="lbl">Tip Percentage (%)</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['10', '15', '18', '20', '25'].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setTipPct(pct)}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: '10px',
                background: tipPct === pct ? 'var(--ac)' : 'var(--s2)',
                color: tipPct === pct ? 'var(--onac)' : 'var(--tx)',
                fontWeight: 700,
                fontSize: '12px',
                border: '1px solid var(--bd)',
              }}
            >
              {pct}%
            </button>
          ))}
        </div>

        <label className="fld" style={{ marginTop: '2px' }}>
          <input
            type="number"
            value={tipPct}
            onChange={(e) => setTipPct(e.target.value)}
            placeholder="Custom %"
            step="any"
          />
          <span style={{ color: 'var(--mut)', fontWeight: 700 }}>%</span>
        </label>

        <div className="lbl">Split Between People</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="ib glass"
            onClick={() => setPeople(String(Math.max(1, (parseInt(people, 10) || 1) - 1)))}
            style={{ width: '42px', height: '42px', fontSize: '18px', fontWeight: 800 }}
          >
            -
          </button>
          <label className="fld" style={{ flex: 1 }}>
            <input
              type="number"
              min="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              style={{ textAlign: 'center', fontWeight: 700 }}
            />
          </label>
          <button
            type="button"
            className="ib glass"
            onClick={() => setPeople(String((parseInt(people, 10) || 1) + 1))}
            style={{ width: '42px', height: '42px', fontSize: '18px', fontWeight: 800 }}
          >
            +
          </button>
        </div>

        {calc && (
          <>
            <div
              className="glass result-fade-in"
              onClick={() => copyText(`$${calc.perPerson}`).then(() => toast('Copied amount per person'))}
              style={{
                padding: '16px',
                borderRadius: '18px',
                textAlign: 'center',
                cursor: 'pointer',
                marginTop: '6px',
              }}
            >
              <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>
                Total per Person
              </small>
              <b style={{ fontSize: '36px', color: 'var(--ac)', display: 'block', margin: '4px 0' }}>
                ${calc.perPerson}
              </b>
              <span style={{ fontSize: '11px', color: 'var(--dim)' }}>
                Tip: ${calc.tipPerPerson} / person
              </span>
            </div>

            <div
              className="glass"
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <small style={{ color: 'var(--mut)', fontSize: '10.5px', display: 'block' }}>Total Tip</small>
                <b style={{ color: 'var(--cy)', fontSize: '14px' }}>${calc.tipTotal}</b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <small style={{ color: 'var(--mut)', fontSize: '10.5px', display: 'block' }}>Total Bill</small>
                <b style={{ color: 'var(--tx)', fontSize: '14px' }}>${calc.billTotal}</b>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TipCalculatorView;
