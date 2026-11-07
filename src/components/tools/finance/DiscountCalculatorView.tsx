import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

export const DiscountCalculatorView: React.FC = () => {
  const { toast } = useApp();
  const [originalPrice, setOriginalPrice] = useState('80');
  const [discountPercent, setDiscountPercent] = useState('25');
  const [taxPercent, setTaxPercent] = useState('8');

  const calc = React.useMemo(() => {
    const P = parseFloat(originalPrice);
    const D = parseFloat(discountPercent) || 0;
    const T = parseFloat(taxPercent) || 0;

    if (isNaN(P) || P <= 0) return null;

    const discountAmount = (P * D) / 100;
    const discountedPrice = P - discountAmount;
    const taxAmount = (discountedPrice * T) / 100;
    const finalPrice = discountedPrice + taxAmount;
    const netSavings = discountAmount;

    return {
      finalPrice: finalPrice.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      netSavings: netSavings.toFixed(2),
    };
  }, [originalPrice, discountPercent, taxPercent]);

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title="Discount &amp; Sale Price" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="lbl">Original Price ($)</div>
        <label className="fld">
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="e.g. 80"
            step="any"
          />
        </label>

        <div className="lbl">Discount (%)</div>
        <label className="fld">
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="e.g. 25"
            step="any"
          />
          <span style={{ color: 'var(--mut)', fontWeight: 700 }}>%</span>
        </label>

        {/* Quick discount pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['10', '15', '20', '25', '30', '50'].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setDiscountPercent(pct)}
              style={{
                flex: 1,
                padding: '5px 0',
                borderRadius: '8px',
                background: discountPercent === pct ? 'var(--ac)' : 'var(--s2)',
                color: discountPercent === pct ? 'var(--onac)' : 'var(--tx)',
                fontWeight: 700,
                fontSize: '11px',
                border: '1px solid var(--bd)',
              }}
            >
              {pct}%
            </button>
          ))}
        </div>

        <div className="lbl" style={{ marginTop: '4px' }}>Sales Tax (%) (Optional)</div>
        <label className="fld">
          <input
            type="number"
            value={taxPercent}
            onChange={(e) => setTaxPercent(e.target.value)}
            placeholder="e.g. 8"
            step="any"
          />
          <span style={{ color: 'var(--mut)', fontWeight: 700 }}>%</span>
        </label>

        {calc && (
          <>
            <div
              className="glass result-fade-in"
              onClick={() => copyText(`$${calc.finalPrice}`).then(() => toast('Copied final price'))}
              style={{
                padding: '16px',
                borderRadius: '18px',
                textAlign: 'center',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              <small style={{ color: 'var(--mut)', fontSize: '11px', display: 'block' }}>
                Final Price to Pay
              </small>
              <b style={{ fontSize: '36px', color: 'var(--ac)', display: 'block', margin: '4px 0' }}>
                ${calc.finalPrice}
              </b>
              <span style={{ fontSize: '11px', color: 'var(--cy)', fontWeight: 700 }}>
                You Save: ${calc.netSavings}
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
                <small style={{ color: 'var(--mut)', fontSize: '10px', display: 'block' }}>Discount Savings</small>
                <b style={{ color: 'var(--ac)', fontSize: '13px' }}>-${calc.discountAmount}</b>
              </div>
              <div style={{ textAlign: 'right' }}>
                <small style={{ color: 'var(--mut)', fontSize: '10px', display: 'block' }}>Estimated Tax</small>
                <b style={{ color: 'var(--tx)', fontSize: '13px' }}>+${calc.taxAmount}</b>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiscountCalculatorView;
