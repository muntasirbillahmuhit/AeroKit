import React, { useState } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { useApp } from '../../../context/AppContext';

export const BmiCalculatorView: React.FC = () => {
  const { toast } = useApp();

  // Inputs
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');

  // Results
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [bmiValue, setBmiValue] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<{
    label: string;
    color: string;
    bgColor: string;
    description: string;
  } | null>(null);
  const [healthyWeightRange, setHealthyWeightRange] = useState<{
    minKg: number;
    maxKg: number;
  } | null>(null);
  const [weightDifference, setWeightDifference] = useState<string | null>(null);

  const calculateBmi = () => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);

    if (isNaN(h) || h <= 0) {
      toast('Please enter a valid height in cm (e.g. 175)');
      return;
    }
    if (h < 50 || h > 300) {
      toast('Height must be between 50 cm and 300 cm');
      return;
    }
    if (isNaN(w) || w <= 0) {
      toast('Please enter a valid weight in kg (e.g. 70)');
      return;
    }
    if (w < 10 || w > 500) {
      toast('Weight must be between 10 kg and 500 kg');
      return;
    }

    const heightM = h / 100;
    const rawBmi = w / (heightM * heightM);
    const roundedBmi = parseFloat(rawBmi.toFixed(1));
    setBmiValue(roundedBmi);

    // Standard Adult BMI Categories (Gender does not change adult formula/thresholds)
    let cat;
    if (roundedBmi < 18.5) {
      cat = {
        label: 'Underweight',
        color: 'var(--cy)',
        bgColor: 'rgba(69, 217, 232, 0.15)',
        description: 'Your BMI indicates you may be below the standard healthy weight range.',
      };
    } else if (roundedBmi <= 24.9) {
      cat = {
        label: 'Normal weight',
        color: 'var(--ac)',
        bgColor: 'rgba(198, 255, 61, 0.15)',
        description: 'Great! Your BMI falls within the standard healthy weight range for adults.',
      };
    } else if (roundedBmi <= 29.9) {
      cat = {
        label: 'Overweight',
        color: '#fbbf24',
        bgColor: 'rgba(251, 191, 36, 0.15)',
        description: 'Your BMI is slightly above the standard healthy weight range.',
      };
    } else {
      cat = {
        label: 'Obesity',
        color: '#f87171',
        bgColor: 'rgba(248, 113, 113, 0.15)',
        description: 'Your BMI is significantly above the standard healthy weight range.',
      };
    }
    setBmiCategory(cat);

    // Healthy weight range corresponding to standard healthy BMI 18.5 – 24.9
    const minHealthyWeight = parseFloat((18.5 * heightM * heightM).toFixed(1));
    const maxHealthyWeight = parseFloat((24.9 * heightM * heightM).toFixed(1));
    setHealthyWeightRange({ minKg: minHealthyWeight, maxKg: maxHealthyWeight });

    // Difference analysis
    if (w < minHealthyWeight) {
      const diff = (minHealthyWeight - w).toFixed(1);
      setWeightDifference(`${diff} kg below healthy range`);
    } else if (w > maxHealthyWeight) {
      const diff = (w - maxHealthyWeight).toFixed(1);
      setWeightDifference(`${diff} kg above healthy range`);
    } else {
      setWeightDifference('Within healthy target range');
    }

    setHasCalculated(true);
    toast('BMI calculation complete!');
  };

  const resetCalculator = () => {
    setHasCalculated(false);
    setBmiValue(null);
    setBmiCategory(null);
  };

  // Compute marker position on the visual indicator bar (range 15 to 35 BMI)
  const getMarkerPercentage = (bmi: number): number => {
    const minBmi = 14;
    const maxBmi = 36;
    const clamped = Math.max(minBmi, Math.min(maxBmi, bmi));
    return ((clamped - minBmi) / (maxBmi - minBmi)) * 100;
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title="BMI Calculator" />

      {!hasCalculated ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Select Gender */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)', paddingLeft: '2px' }}>
              Select Gender
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Male Card */}
              <button
                type="button"
                onClick={() => setGender('male')}
                style={{
                  background: gender === 'male' ? 'rgba(198, 255, 61, 0.12)' : 'var(--s2)',
                  border: gender === 'male' ? '1.5px solid var(--ac)' : '1px solid var(--bd)',
                  borderRadius: '18px',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: gender === 'male' ? '0 0 16px rgba(198, 255, 61, 0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    color: gender === 'male' ? 'var(--ac)' : 'var(--tx)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  <Icon name="male" size={32} />
                </div>
                <span
                  style={{
                    fontSize: '14.5px',
                    fontWeight: gender === 'male' ? 800 : 600,
                    color: gender === 'male' ? 'var(--ac)' : 'var(--tx)',
                  }}
                >
                  Male
                </span>
              </button>

              {/* Female Card */}
              <button
                type="button"
                onClick={() => setGender('female')}
                style={{
                  background: gender === 'female' ? 'rgba(69, 217, 232, 0.12)' : 'var(--s2)',
                  border: gender === 'female' ? '1.5px solid var(--cy)' : '1px solid var(--bd)',
                  borderRadius: '18px',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: gender === 'female' ? '0 0 16px rgba(69, 217, 232, 0.2)' : 'none',
                }}
              >
                <div
                  style={{
                    color: gender === 'female' ? 'var(--cy)' : 'var(--tx)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  <Icon name="female" size={32} />
                </div>
                <span
                  style={{
                    fontSize: '14.5px',
                    fontWeight: gender === 'female' ? 800 : 600,
                    color: gender === 'female' ? 'var(--cy)' : 'var(--tx)',
                  }}
                >
                  Female
                </span>
              </button>
            </div>
          </div>

          {/* 2. Height (cm) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)', paddingLeft: '2px' }}>
              Height (cm)
            </span>

            <div
              style={{
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '14px',
                padding: '4px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Enter height in cm"
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--tx)',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                min="50"
                max="300"
              />
              {heightCm && (
                <button
                  type="button"
                  onClick={() => setHeightCm('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mut)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 3. Weight (kg) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)', paddingLeft: '2px' }}>
              Weight (kg)
            </span>

            <div
              style={{
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                borderRadius: '14px',
                padding: '4px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Enter weight in kg"
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--tx)',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                min="10"
                max="500"
                step="0.1"
              />
              {weightKg && (
                <button
                  type="button"
                  onClick={() => setWeightKg('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mut)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 4. Calculate Button */}
          <button
            type="button"
            className="btn"
            onClick={calculateBmi}
            style={{
              height: '50px',
              borderRadius: '25px',
              fontSize: '15px',
              fontWeight: 800,
              marginTop: '8px',
            }}
          >
            Calculate BMI
          </button>

          {/* Informational Guidance Note */}
          <div
            className="glass"
            style={{
              padding: '14px 16px',
              borderRadius: '18px',
              marginTop: '4px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--tx)', display: 'block', marginBottom: '6px' }}>
              Standard Adult Thresholds
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: 'var(--mut)' }}>
              <div>• Underweight: Below 18.5</div>
              <div>• Normal weight: 18.5 – 24.9</div>
              <div>• Overweight: 25.0 – 29.9</div>
              <div>• Obesity: 30.0 or above</div>
            </div>
          </div>
        </div>
      ) : (
        /* Results Screen */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Result Card */}
          <div
            className="glass"
            style={{
              padding: '24px 20px',
              borderRadius: '24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              border: `1.5px solid ${bmiCategory?.color || 'var(--ac)'}`,
              boxShadow: `0 8px 32px ${bmiCategory?.bgColor || 'rgba(198, 255, 61, 0.15)'}`,
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--mut)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Your Body Mass Index (BMI)
            </span>

            <div
              style={{
                fontSize: '54px',
                fontWeight: 900,
                color: bmiCategory?.color || 'var(--ac)',
                lineHeight: 1,
                fontFamily: 'monospace',
                letterSpacing: '-1px',
                margin: '4px 0',
              }}
            >
              {bmiValue?.toFixed(1)}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '20px',
                background: bmiCategory?.bgColor || 'var(--s2)',
                color: bmiCategory?.color || 'var(--tx)',
                fontWeight: 800,
                fontSize: '14.5px',
              }}
            >
              <span>{bmiCategory?.label}</span>
            </div>

            {/* Visual Multi-Segment BMI Indicator Gauge */}
            <div style={{ width: '100%', marginTop: '16px' }}>
              {/* Indicator Needle Marker */}
              <div
                style={{
                  width: '100%',
                  position: 'relative',
                  height: '14px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${getMarkerPercentage(bmiValue || 22)}%`,
                    transform: 'translateX(-50%)',
                    transition: 'left 0.4s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '0',
                      height: '0',
                      borderLeft: '5px solid transparent',
                      borderRight: '5px solid transparent',
                      borderTop: `7px solid ${bmiCategory?.color || 'var(--tx)'}`,
                    }}
                  />
                </div>
              </div>

              {/* Segmented Bar */}
              <div
                style={{
                  display: 'flex',
                  height: '10px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  gap: '2px',
                }}
              >
                {/* Underweight: < 18.5 */}
                <div style={{ flex: 18.5 - 14, background: '#38bdf8', opacity: 0.9 }} title="Underweight (< 18.5)" />
                {/* Normal: 18.5 - 24.9 */}
                <div style={{ flex: 24.9 - 18.5, background: '#C6FF3D', opacity: 0.95 }} title="Normal (18.5 - 24.9)" />
                {/* Overweight: 25.0 - 29.9 */}
                <div style={{ flex: 29.9 - 24.9, background: '#fbbf24', opacity: 0.9 }} title="Overweight (25 - 29.9)" />
                {/* Obesity: >= 30 */}
                <div style={{ flex: 36 - 29.9, background: '#f87171', opacity: 0.9 }} title="Obesity (>= 30)" />
              </div>

              {/* Ticks & Labels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '9.5px',
                  color: 'var(--mut)',
                  marginTop: '6px',
                  fontWeight: 600,
                  padding: '0 2px',
                }}
              >
                <span>&lt;18.5</span>
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0+</span>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--mut)', margin: '8px 0 0', lineHeight: 1.5 }}>
              {bmiCategory?.description}
            </p>
          </div>

          {/* Healthy Weight Analysis Card */}
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
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--tx)' }}>
              Target Metrics for {heightCm} cm
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--mut)', display: 'block', marginBottom: '4px' }}>
                  Healthy BMI Range
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ac)' }}>
                  18.5 – 24.9
                </span>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'var(--s2)',
                  border: '1px solid var(--bd)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--mut)', display: 'block', marginBottom: '4px' }}>
                  Ideal Weight Range
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--cy)' }}>
                  {healthyWeightRange?.minKg} – {healthyWeightRange?.maxKg} kg
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'var(--s2)',
                border: '1px solid var(--bd)',
                fontSize: '12.5px',
              }}
            >
              <span style={{ color: 'var(--mut)' }}>Status vs Healthy Target:</span>
              <span style={{ fontWeight: 700, color: 'var(--tx)' }}>{weightDifference}</span>
            </div>
          </div>

          {/* Disclaimer Card */}
          <div
            className="glass"
            style={{
              padding: '14px 16px',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ color: 'var(--mut)', marginTop: '2px' }}>
                <Icon name="info" size={16} />
              </span>
              <p style={{ fontSize: '11.5px', color: 'var(--mut)', lineHeight: 1.5, margin: 0 }}>
                <b>Medical Disclaimer:</b> BMI is an approximate screening indicator, not a diagnostic medical evaluation. It does not directly assess body fat percentage, bone density, or muscle mass. Standard adult BMI categories are not appropriate for children, teenagers, or pregnant individuals.
              </p>
            </div>
          </div>

          {/* Action Button: Calculate Again */}
          <button
            type="button"
            className="btn"
            onClick={resetCalculator}
            style={{
              height: '48px',
              borderRadius: '24px',
              fontSize: '14.5px',
              fontWeight: 800,
            }}
          >
            Calculate Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BmiCalculatorView;
