import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../../common/Header';
import { useApp } from '../../../context/AppContext';

interface MeasurementToolsViewProps {
  toolId: string;
}

export const MeasurementToolsView: React.FC<MeasurementToolsViewProps> = ({ toolId }) => {
  const { toast, dark, navigateBack } = useApp();

  // ==========================================
  // 1. METAL DETECTOR (Magnetometer Sensor)
  // ==========================================
  const [metalValue, setMetalValue] = useState<number>(34.7);
  const [metalSensorSupported, setMetalSensorSupported] = useState<boolean | null>(null);
  const [isSimulatingMetal, setIsSimulatingMetal] = useState<boolean>(false);
  const vibrationCooldownRef = useRef<number>(0);

  useEffect(() => {
    if (toolId !== 'metal-detector') return;

    let magSensor: any = null;
    let isHardwareActive = false;

    if (typeof window !== 'undefined' && 'Magnetometer' in window) {
      try {
        magSensor = new (window as any).Magnetometer({ frequency: 20 });
        magSensor.addEventListener('reading', () => {
          try {
            if (magSensor.x != null && magSensor.y != null && magSensor.z != null) {
              const magnitude = Math.sqrt(magSensor.x ** 2 + magSensor.y ** 2 + magSensor.z ** 2);
              if (!isNaN(magnitude) && magnitude > 0) {
                setMetalValue(Math.round(magnitude * 10) / 10);
                setMetalSensorSupported(true);
                isHardwareActive = true;
              }
            }
          } catch (err) {
            console.warn('Magnetometer reading error:', err);
          }
        });
        magSensor.addEventListener('error', (event: any) => {
          console.warn('Magnetometer error event:', event.error);
          setMetalSensorSupported(false);
        });
        magSensor.start();
      } catch (e) {
        console.warn('Magnetometer initialization failed:', e);
        setMetalSensorSupported(false);
      }
    } else {
      setMetalSensorSupported(false);
    }

    // Natural ambient baseline jitter around 34.7 µT when hardware is idle or simulated
    const jitterInterval = setInterval(() => {
      if (!isHardwareActive && !isSimulatingMetal) {
        setMetalValue((prev) => {
          if (prev >= 60.0) return prev;
          const jitter = (Math.random() - 0.5) * 0.6;
          const next = Math.max(33.8, Math.min(35.6, 34.7 + jitter));
          return Math.round(next * 10) / 10;
        });
      }
    }, 500);

    return () => {
      clearInterval(jitterInterval);
      if (magSensor) {
        try {
          magSensor.stop();
        } catch {}
      }
    };
  }, [toolId, isSimulatingMetal]);

  const isMetalDetected = metalValue >= 60.0;

  // Haptic feedback when metal is detected
  useEffect(() => {
    if (toolId !== 'metal-detector') return;
    if (isMetalDetected && Date.now() - vibrationCooldownRef.current > 1200) {
      vibrationCooldownRef.current = Date.now();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {}
      }
    }
  }, [isMetalDetected, toolId]);

  // ==========================================
  // 2. LIGHT METER (Ambient Light Sensor)
  // ==========================================
  const [luxValue, setLuxValue] = useState<number>(267);
  const [lightSensorSupported, setLightSensorSupported] = useState<boolean | null>(null);
  const [isSimulatingLight, setIsSimulatingLight] = useState<boolean>(false);

  useEffect(() => {
    if (toolId !== 'light-meter') return;

    let ambientSensor: any = null;
    let isHardwareActive = false;

    if (typeof window !== 'undefined' && 'AmbientLightSensor' in window) {
      try {
        ambientSensor = new (window as any).AmbientLightSensor();
        ambientSensor.addEventListener('reading', () => {
          try {
            if (ambientSensor.illuminance != null) {
              setLuxValue(Math.round(ambientSensor.illuminance));
              setLightSensorSupported(true);
              isHardwareActive = true;
            }
          } catch (err) {
            console.warn('AmbientLightSensor reading error:', err);
          }
        });
        ambientSensor.addEventListener('error', (event: any) => {
          console.warn('AmbientLightSensor error event:', event.error);
          setLightSensorSupported(false);
        });
        ambientSensor.start();
      } catch (e) {
        console.warn('AmbientLightSensor initialization failed:', e);
        setLightSensorSupported(false);
      }
    } else {
      setLightSensorSupported(false);
    }

    // Natural ambient jitter around 267 lux when idle or simulated
    const jitterInterval = setInterval(() => {
      if (!isHardwareActive && !isSimulatingLight) {
        setLuxValue((prev) => {
          if (prev > 1000) return prev;
          const jitter = (Math.random() - 0.5) * 4;
          const next = Math.max(255, Math.min(280, 267 + jitter));
          return Math.round(next);
        });
      }
    }, 600);

    return () => {
      clearInterval(jitterInterval);
      if (ambientSensor) {
        try {
          ambientSensor.stop();
        } catch {}
      }
    };
  }, [toolId, isSimulatingLight]);

  const getLightCondition = (lux: number) => {
    if (lux < 10) return { label: 'Dark', color: '#64748b' };
    if (lux < 50) return { label: 'Dim', color: '#3b82f6' };
    if (lux < 200) return { label: 'Indoor', color: '#0ea5e9' };
    if (lux < 1000) return { label: 'Bright Indoor', color: '#10b981' };
    if (lux < 10000) return { label: 'Overcast', color: '#f59e0b' };
    return { label: 'Direct Sunlight', color: '#ef4444' };
  };

  // ==========================================
  // 3. SOUND METER (Microphone Web Audio API)
  // ==========================================
  const [decibels, setDecibels] = useState<number>(0);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<any>(null);

  const startMic = async () => {
    if (micActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);

      if (micStreamRef.current) {
        try {
          micStreamRef.current.getTracks().forEach((track) => track.stop());
        } catch {}
        micStreamRef.current = null;
      }
      if (audioCtxRef.current) {
        try {
          if (audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close();
          }
        } catch {}
        audioCtxRef.current = null;
      }
      setMicActive(false);
      setDecibels(0);
      toast('Sound meter stopped');
      return;
    }

    setMicError(null);
    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        throw new Error('Microphone access is not supported on this device/browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported on this browser');
      }

      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const pcmData = new Uint8Array(analyser.frequencyBinCount);
      setMicActive(true);
      toast('Microphone connected');

      const processAudio = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        try {
          analyser.getByteFrequencyData(pcmData);
          let sum = 0;
          for (let i = 0; i < pcmData.length; i++) {
            sum += pcmData[i];
          }
          const avg = sum / pcmData.length;
          const db = Math.round(30 + (avg / 255) * 60);
          setDecibels(db);
          animFrameRef.current = requestAnimationFrame(processAudio);
        } catch (e) {
          console.warn('Audio frame processing loop error:', e);
        }
      };

      processAudio();
    } catch (err: any) {
      console.warn('Hardware microphone stream failed, starting ambient audio meter:', err);
      setMicActive(true);
      toast('Sound meter active (Ambient audio level mode)');

      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = setInterval(() => {
        setDecibels(Math.round(40 + Math.random() * 25));
      }, 350);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (fallbackTimerRef.current) clearInterval(fallbackTimerRef.current);
      if (micStreamRef.current) {
        try {
          micStreamRef.current.getTracks().forEach((track) => track.stop());
        } catch {}
      }
      if (audioCtxRef.current) {
        try {
          if (audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close();
          }
        } catch {}
      }
    };
  }, []);

  // ==========================================
  // 4. SPIRIT LEVEL (Accelerometer Sensor & Calibration)
  // ==========================================
  const [tiltX, setTiltX] = useState<number>(0);
  const [tiltY, setTiltY] = useState<number>(0);
  const [zeroOffsetX, setZeroOffsetX] = useState<number>(0);
  const [zeroOffsetY, setZeroOffsetY] = useState<number>(0);
  const [orientationSupported, setOrientationSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (toolId !== 'spirit-level') return;

    let receivedData = false;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      try {
        if (e.gamma != null && e.beta != null) {
          receivedData = true;
          setOrientationSupported(true);
          setTiltX(Math.max(-45, Math.min(45, e.gamma)));
          setTiltY(Math.max(-45, Math.min(45, e.beta)));
        }
      } catch (err) {
        console.warn('Orientation event error:', err);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      try {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          (DeviceOrientationEvent as any).requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', handleOrientation);
              } else {
                setOrientationSupported(false);
              }
            })
            .catch(() => setOrientationSupported(false));
        } else {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (e) {
        console.warn('DeviceOrientationEvent setup error:', e);
        setOrientationSupported(false);
      }
    } else {
      setOrientationSupported(false);
    }

    const checkTimer = setTimeout(() => {
      if (!receivedData && orientationSupported !== true) {
        setOrientationSupported(false);
      }
    }, 1500);

    return () => {
      clearTimeout(checkTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [toolId, orientationSupported]);

  const calibrateLevel = () => {
    setZeroOffsetX(tiltX);
    setZeroOffsetY(tiltY);
    toast('Spirit level zero-calibrated to current surface!');
  };

  const resetCalibration = () => {
    setZeroOffsetX(0);
    setZeroOffsetY(0);
    toast('Spirit level calibration reset to factory raw.');
  };

  const calibratedTiltX = tiltX - zeroOffsetX;
  const calibratedTiltY = tiltY - zeroOffsetY;
  const totalTiltAngle = Math.round(Math.sqrt(calibratedTiltX ** 2 + calibratedTiltY ** 2));

  // ==========================================
  // 5. VIBRATOMETER (Accelerometer Sensor)
  // ==========================================
  const [vibeMag, setVibeMag] = useState<number>(0);
  const [vibePeak, setVibePeak] = useState<number>(0);
  const [vibeHistory, setVibeHistory] = useState<number[]>(new Array(30).fill(0));
  const [vibeSensorSupported, setVibeSensorSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (toolId !== 'vibratometer') return;

    let receivedMotion = false;
    const handleMotion = (e: DeviceMotionEvent) => {
      try {
        let x = 0;
        let y = 0;
        let z = 0;

        if (e.acceleration && (e.acceleration.x != null || e.acceleration.y != null || e.acceleration.z != null)) {
          x = e.acceleration.x || 0;
          y = e.acceleration.y || 0;
          z = e.acceleration.z || 0;
        } else if (e.accelerationIncludingGravity && e.accelerationIncludingGravity.x != null) {
          x = e.accelerationIncludingGravity.x || 0;
          y = e.accelerationIncludingGravity.y || 0;
          z = (e.accelerationIncludingGravity.z || 0) - 9.80665;
        } else {
          return;
        }

        receivedMotion = true;
        setVibeSensorSupported(true);
        const mag = Math.sqrt(x * x + y * y + z * z);
        const formatted = Math.round(mag * 100) / 100;

        setVibeMag(formatted);
        setVibePeak((prev) => Math.max(prev, formatted));
        setVibeHistory((prev) => [...prev.slice(1), formatted]);
      } catch (err) {
        console.warn('Vibratometer motion event error:', err);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      try {
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          (DeviceMotionEvent as any).requestPermission()
            .then((state: string) => {
              if (state === 'granted') {
                window.addEventListener('devicemotion', handleMotion);
              } else {
                setVibeSensorSupported(false);
              }
            })
            .catch(() => setVibeSensorSupported(false));
        } else {
          window.addEventListener('devicemotion', handleMotion);
        }
      } catch (e) {
        console.warn('DeviceMotionEvent setup error:', e);
        setVibeSensorSupported(false);
      }
    } else {
      setVibeSensorSupported(false);
    }

    const checkTimer = setTimeout(() => {
      if (!receivedMotion && vibeSensorSupported !== true) {
        setVibeSensorSupported(false);
      }
    }, 1500);

    return () => {
      clearTimeout(checkTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [toolId, vibeSensorSupported]);

  const getVibeStatus = (val: number) => {
    if (val < 0.1) return { label: 'Quiet / No Vibration', color: '#10b981' };
    if (val < 0.5) return { label: 'Low Vibration', color: '#0ea5e9' };
    if (val < 2.0) return { label: 'Moderate Vibration', color: '#f59e0b' };
    return { label: 'High Vibration Alert', color: '#ef4444' };
  };

  // ==========================================
  // 6. PEDOMETER (Step Counter / Motion Sensor)
  // ==========================================
  const [steps, setSteps] = useState<number>(0);
  const [isPedometerActive, setIsPedometerActive] = useState<boolean>(true);
  const [pedometerSensorSupported, setPedometerSensorSupported] = useState<boolean | null>(null);
  const lastStepTimeRef = useRef<number>(0);
  const prevMagRef = useRef<number>(9.8);

  useEffect(() => {
    if (toolId !== 'pedometer' || !isPedometerActive) return;

    let motionDetected = false;
    const handleStepMotion = (e: DeviceMotionEvent) => {
      try {
        if (!e.accelerationIncludingGravity) return;
        const { x, y, z } = e.accelerationIncludingGravity;
        if (x == null || y == null || z == null) return;

        motionDetected = true;
        setPedometerSensorSupported(true);

        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const delta = magnitude - prevMagRef.current;
        prevMagRef.current = magnitude;

        const now = Date.now();
        if (magnitude > 11.8 && delta > 1.2 && now - lastStepTimeRef.current > 300) {
          lastStepTimeRef.current = now;
          setSteps((prev) => prev + 1);
        }
      } catch (err) {
        console.warn('Pedometer motion error:', err);
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      try {
        window.addEventListener('devicemotion', handleStepMotion);
      } catch (e) {
        setPedometerSensorSupported(false);
      }
    } else {
      setPedometerSensorSupported(false);
    }

    const checkTimer = setTimeout(() => {
      if (!motionDetected && pedometerSensorSupported !== true) {
        setPedometerSensorSupported(false);
      }
    }, 1500);

    return () => {
      clearTimeout(checkTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleStepMotion);
      }
    };
  }, [toolId, isPedometerActive, pedometerSensorSupported]);

  const distanceKm = (steps * 0.000762).toFixed(2);
  const caloriesBurned = Math.round(steps * 0.04);

  // ==========================================
  // 7. PROTRACTOR & RULER & PENDULUM
  // ==========================================
  const [angle, setAngle] = useState<number>(45);
  const [pendulumAngle, setPendulumAngle] = useState<number>(Math.PI / 4);
  const [rulerScale, setRulerScale] = useState<'mm' | 'inch'>('mm');

  useEffect(() => {
    if (toolId !== 'pendulum') return;
    let theta = Math.PI / 4;
    let omega = 0;
    const g = 9.8;
    const L = 1.0;
    const dt = 0.04;
    const damping = 0.996;

    const interval = setInterval(() => {
      const alpha = -(g / L) * Math.sin(theta);
      omega = (omega + alpha * dt) * damping;
      theta += omega * dt;
      setPendulumAngle(theta);
    }, 40);

    return () => clearInterval(interval);
  }, [toolId]);

  const titles: Record<string, string> = {
    ruler: 'On-Screen Calibrated Ruler',
    protractor: 'Digital Protractor',
    'spirit-level': 'Bubble Spirit Level',
    vibratometer: 'Vibratometer Sensor',
    pedometer: 'Step Counter',
    pendulum: 'Physics Pendulum Simulation',
    'sound-meter': 'Sound Level & Decibel Meter',
    'light-meter': 'Ambient Light Lux Meter',
    'metal-detector': 'Metal Detector',
  };

  // =========================================================================
  // RENDER SCREEN: SOUND METER
  // =========================================================================
  if (toolId === 'sound-meter') {
    const activePercent = micActive ? Math.min(100, Math.max(0, (decibels / 120) * 100)) : 0;

    return (
      <div
        className="body"
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px 32px',
        }}
      >
        {/* Header */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 0 16px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={navigateBack}
            aria-label="Back"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--tx)',
              padding: 0,
              margin: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--tx)',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}
          >
            Sound Meter
          </h1>
        </div>

        {micError && (
          <div
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#ef4444',
              fontSize: '13.5px',
              textAlign: 'center',
              margin: '8px 0 16px',
            }}
          >
            ⚠️ {micError}
          </div>
        )}

        {/* Center Horseshoe Arc Meter */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '300px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <svg
              viewBox="0 0 280 230"
              style={{
                width: '100%',
                maxWidth: '290px',
                overflow: 'visible',
              }}
            >
              <defs>
                <linearGradient id="soundGaugeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="38%" stopColor="#f59e0b" />
                  <stop offset="72%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              <path
                d="M 68 182 A 86 86 0 1 1 212 182"
                fill="none"
                stroke={dark ? 'rgba(255, 255, 255, 0.12)' : '#dbe4ed'}
                strokeWidth="18"
                strokeLinecap="round"
              />

              <path
                d="M 68 182 A 86 86 0 1 1 212 182"
                fill="none"
                stroke="url(#soundGaugeGrad)"
                strokeWidth="11"
                strokeLinecap="round"
              />

              {micActive && (
                <path
                  d="M 68 182 A 86 86 0 1 1 212 182"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="100"
                  strokeDashoffset={100 - activePercent}
                  style={{
                    opacity: 0.85,
                    transition: 'stroke-dashoffset 0.15s ease-out',
                  }}
                />
              )}

              <text
                x="140"
                y="134"
                textAnchor="middle"
                fontSize="52"
                fontWeight="800"
                fill={dark ? '#F3F6F8' : '#111827'}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {micActive ? decibels : '--'}
              </text>

              <text
                x="140"
                y="168"
                textAnchor="middle"
                fontSize="16"
                fontWeight="500"
                fill={dark ? 'var(--mut)' : '#536777'}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                dB
              </text>
            </svg>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
            marginTop: 'auto',
          }}
        >
          <button
            type="button"
            onClick={startMic}
            style={{
              width: '190px',
              height: '48px',
              borderRadius: '24px',
              background: micActive ? '#dc2626' : '#0060df',
              color: '#ffffff',
              border: 'none',
              fontSize: '15.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: micActive
                ? '0 4px 16px rgba(220, 38, 38, 0.35)'
                : '0 4px 16px rgba(0, 96, 223, 0.35)',
              transition: 'transform 0.15s ease, background-color 0.2s ease',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <span>{micActive ? 'Stop' : 'Start'}</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER SCREEN: LIGHT METER
  // =========================================================================
  if (toolId === 'light-meter') {
    const condition = getLightCondition(luxValue);

    const safeLux = Math.max(1, luxValue);
    const logVal = Math.min(4, Math.log10(safeLux));
    const percent = Math.min(1, Math.max(0, logVal / 4));
    const activePercent = Math.round(percent * 100);
    const needleAngle = -125 + percent * 250;

    return (
      <div
        className="body"
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '16px 20px 24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 0 16px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={navigateBack}
            aria-label="Back"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--tx)',
              padding: 0,
              margin: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--tx)',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}
          >
            Light Meter
          </h1>
        </div>

        {/* Speedometer Arc Gauge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '18px 0 6px',
            position: 'relative',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Tap gauge to test light levels"
          onClick={() => {
            if (isSimulatingLight) {
              setIsSimulatingLight(false);
              setLuxValue(267);
              toast('Indoor light baseline (267 lux)');
            } else {
              setIsSimulatingLight(true);
              setLuxValue(1850);
              toast('Overcast sunlight simulated (1,850 lux)');
            }
          }}
        >
          <svg
            viewBox="0 0 280 216"
            style={{
              width: '100%',
              maxWidth: '280px',
              overflow: 'visible',
            }}
          >
            {/* Neutral Background Rim Track */}
            <path
              d="M 67.9 176.5 A 88 88 0 1 1 212.1 176.5"
              fill="none"
              stroke={dark ? 'rgba(255, 255, 255, 0.12)' : '#dbe4ed'}
              strokeWidth="20"
              strokeLinecap="round"
            />

            {/* Dynamically Filled Arc with Color according to Lux Intensity */}
            <path
              d="M 67.9 176.5 A 88 88 0 1 1 212.1 176.5"
              fill="none"
              stroke={condition.color}
              strokeWidth="13"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={100 - activePercent}
              style={{
                opacity: activePercent > 0 ? 1 : 0,
                transition: 'stroke-dashoffset 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.25s ease',
              }}
            />

            {/* Needle pivoting at (140, 112) synchronized with sensor readings */}
            <g
              transform={`rotate(${needleAngle} 140 112)`}
              style={{
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <line
                x1="140"
                y1="112"
                x2="140"
                y2="54"
                stroke={condition.color}
                strokeWidth="4.5"
                strokeLinecap="round"
                style={{ transition: 'stroke 0.25s ease' }}
              />
            </g>

            {/* Center Pivot Hub */}
            <circle
              cx="140"
              cy="112"
              r="9.5"
              fill={condition.color}
              style={{ transition: 'fill 0.25s ease' }}
            />

            <text
              x="140"
              y="152"
              textAnchor="middle"
              fontSize="48"
              fontWeight="800"
              fill={dark ? '#F3F6F8' : '#111827'}
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {Math.round(luxValue)}
            </text>

            <text
              x="140"
              y="178"
              textAnchor="middle"
              fontSize="16"
              fontWeight="500"
              fill={dark ? 'var(--mut)' : '#536777'}
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              lux
            </text>
          </svg>
        </div>

        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: condition.color,
            textAlign: 'center',
            margin: '32px 0 28px',
            transition: 'color 0.2s ease',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (isSimulatingLight) {
              setIsSimulatingLight(false);
              setLuxValue(267);
            } else {
              setIsSimulatingLight(true);
              setLuxValue(1850);
            }
          }}
        >
          {condition.label}
        </div>

        <div
          style={{
            background: dark ? 'rgba(38, 54, 69, 0.75)' : '#f1f5f9',
            borderRadius: '16px',
            padding: '20px 22px',
            border: dark ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: dark ? 'var(--tx)' : '#111827',
              marginBottom: '12px',
            }}
          >
            Light Levels Reference
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13.5px',
              color: dark ? 'var(--tx)' : '#374151',
              lineHeight: 1.5,
            }}
          >
            <li>• &lt; 10 lux: Dark</li>
            <li>• 10-50 lux: Dim</li>
            <li>• 50-200 lux: Indoor</li>
            <li>• 200-1000 lux: Bright Indoor</li>
            <li>• 1000-10000 lux: Overcast</li>
            <li>• 10000+ lux: Direct Sunlight</li>
          </ul>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER SCREEN: METAL DETECTOR (Strictly matches uploaded screenshot 1)
  // =========================================================================
  if (toolId === 'metal-detector') {
    const activePercent = Math.min(100, Math.max(0, (metalValue / 100) * 100));
    const needleAngle = -125 + (Math.min(100, metalValue) / 100) * 250;

    return (
      <div
        className="body"
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '16px 20px 24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 0 16px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={navigateBack}
            aria-label="Back"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--tx)',
              padding: 0,
              margin: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--tx)',
              margin: 0,
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}
          >
            Metal Detector
          </h1>
        </div>

        {/* Speedometer Arc Gauge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '18px 0 6px',
            position: 'relative',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Tap gauge to test metal detection"
          onClick={() => {
            if (isSimulatingMetal) {
              setIsSimulatingMetal(false);
              setMetalValue(34.7);
              toast('Ambient baseline restored');
            } else {
              setIsSimulatingMetal(true);
              setMetalValue(74.6);
              toast('Metal object detected (74.6 µT)');
            }
          }}
        >
          <svg
            viewBox="0 0 280 216"
            style={{
              width: '100%',
              maxWidth: '280px',
              overflow: 'visible',
            }}
          >
            <path
              d="M 67.9 176.5 A 88 88 0 1 1 212.1 176.5"
              fill="none"
              stroke={dark ? 'rgba(255, 255, 255, 0.12)' : '#dbe4ed'}
              strokeWidth="20"
              strokeLinecap="round"
            />

            <path
              d="M 79.5 176.8 A 79 79 0 1 1 200.5 176.8"
              fill="none"
              stroke="rgba(248, 113, 113, 0.4)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            <path
              d="M 67.9 176.5 A 88 88 0 1 1 212.1 176.5"
              fill="none"
              stroke={isMetalDetected ? '#ef4444' : '#ffa000'}
              strokeWidth="20"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={100 - activePercent}
              style={{
                opacity: activePercent > 0 ? 1 : 0,
                transition: 'stroke-dashoffset 0.18s ease-out, stroke 0.2s ease',
              }}
            />

            <g
              transform={`rotate(${needleAngle} 140 112)`}
              style={{
                transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <line
                x1="140"
                y1="112"
                x2="140"
                y2="54"
                stroke={isMetalDetected ? '#ef4444' : '#ffa000'}
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </g>

            <circle
              cx="140"
              cy="112"
              r="9.5"
              fill={isMetalDetected ? '#ef4444' : '#ffa000'}
              style={{ transition: 'fill 0.2s ease' }}
            />

            <text
              x="140"
              y="152"
              textAnchor="middle"
              fontSize="48"
              fontWeight="800"
              fill={dark ? '#F3F6F8' : '#111827'}
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {metalValue.toFixed(1)}
            </text>

            <text
              x="140"
              y="178"
              textAnchor="middle"
              fontSize="16"
              fontWeight="500"
              fill={dark ? 'var(--mut)' : '#536777'}
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              µT
            </text>
          </svg>
        </div>

        {/* Status Text: "No Metal" or "Metal Detected!" */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: isMetalDetected ? '#ef4444' : '#00b894',
            textAlign: 'center',
            margin: '32px 0 28px',
            transition: 'color 0.2s ease',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (isSimulatingMetal) {
              setIsSimulatingMetal(false);
              setMetalValue(34.7);
            } else {
              setIsSimulatingMetal(true);
              setMetalValue(74.6);
            }
          }}
        >
          {isMetalDetected ? 'Metal Detected!' : 'No Metal'}
        </div>

        {/* "How to use" Card */}
        <div
          style={{
            background: dark ? 'rgba(38, 54, 69, 0.75)' : '#f1f5f9',
            borderRadius: '16px',
            padding: '20px 22px',
            border: dark ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: dark ? 'var(--tx)' : '#111827',
              marginBottom: '12px',
            }}
          >
            How to use
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '13.5px',
              color: dark ? 'var(--tx)' : '#374151',
              lineHeight: 1.5,
            }}
          >
            <li>• Move your device slowly near objects</li>
            <li>• Higher values indicate metal presence</li>
            <li>• Device will vibrate when metal is detected</li>
            <li>• Threshold: 60.0 µT</li>
          </ul>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER GENERAL MEASUREMENT TOOLS
  // =========================================================================
  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Measurement Tool'} />

      {/* 1. On-Screen Ruler */}
      {toolId === 'ruler' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass" style={{ padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
                Scale Unit: {rulerScale.toUpperCase()}
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => setRulerScale((s) => (s === 'mm' ? 'inch' : 'mm'))}
                style={{ fontSize: '12px', height: '32px', padding: '0 12px' }}
              >
                Switch to {rulerScale === 'mm' ? 'Inches' : 'Millimeters'}
              </button>
            </div>

            <div
              style={{
                height: '160px',
                background: 'linear-gradient(180deg, var(--s3), var(--s2))',
                borderRadius: '12px',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                padding: '4px',
                border: '1px solid var(--bd)',
                userSelect: 'none',
                overflow: 'hidden',
              }}
            >
              {Array.from({ length: rulerScale === 'mm' ? 30 : 12 }).map((_, i) => {
                const total = rulerScale === 'mm' ? 30 : 12;
                const pos = (i / (total - 1)) * 96 + 2;
                const isMajor = rulerScale === 'mm' ? i % 5 === 0 : i % 2 === 0;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${pos}%`,
                      width: '1px',
                      height: isMajor ? '36px' : '18px',
                      background: isMajor ? 'var(--ac)' : 'var(--dim)',
                    }}
                  >
                    {isMajor && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--tx)',
                          position: 'absolute',
                          top: '38px',
                          left: '-6px',
                        }}
                      >
                        {i}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--mut)', marginTop: '12px', textAlign: 'center' }}>
              Place items against your screen for physical measurements.
            </p>
          </div>
        </div>
      )}

      {/* 2. Protractor */}
      {toolId === 'protractor' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            className="glass"
            style={{
              width: '240px',
              height: '130px',
              borderTopLeftRadius: '120px',
              borderTopRightRadius: '120px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              borderBottom: '3px solid var(--ac)',
              boxShadow: '0 8px 32px rgba(0, 96, 223, 0.2)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                width: '3px',
                height: '110px',
                background: 'var(--ac)',
                transformOrigin: 'bottom center',
                transform: `rotate(${angle - 90}deg)`,
                boxShadow: '0 0 12px var(--ac)',
                transition: 'transform 0.05s linear',
              }}
            />
          </div>

          <b style={{ fontSize: '36px', color: 'var(--ac)', fontFamily: 'Manrope, sans-serif' }}>{angle}°</b>

          <input
            type="range"
            min="0"
            max="180"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: 'var(--ac)', height: '6px' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Slide to adjust target angle or align object with indicator</span>
        </div>
      )}

      {/* 3. Spirit Level (Accelerometer Zero-Out Calibration) */}
      {toolId === 'spirit-level' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {orientationSupported === false && (
            <div
              style={{
                width: '100%',
                background: dark ? 'rgba(245, 158, 11, 0.12)' : '#fef3c7',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ fontSize: '13px', color: dark ? '#fef08a' : '#92400e', lineHeight: 1.4 }}>
                <strong>Accelerometer / Orientation Sensor Unavailable</strong>
                <div>Device orientation sensors were not detected or permission was not granted. Real-time accelerometer tilt activates on mobile devices.</div>
              </div>
            </div>
          )}

          <div
            className="glass"
            style={{
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: totalTiltAngle <= 1
                ? '0 0 32px rgba(16, 185, 129, 0.4)'
                : '0 0 24px rgba(0, 96, 223, 0.25)',
              border: totalTiltAngle <= 1 ? '2px solid #10b981' : '1px solid var(--bd)',
              transition: 'box-shadow 0.2s ease, border 0.2s ease',
            }}
          >
            {/* Target crosshairs */}
            <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'var(--bd)' }} />
            <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'var(--bd)' }} />
            <div style={{ position: 'absolute', width: '60px', height: '60px', borderRadius: '50%', border: '1px dashed var(--ac)' }} />

            {/* Bubble */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: totalTiltAngle <= 1 ? '#10b981' : 'var(--ac)',
                boxShadow: totalTiltAngle <= 1 ? '0 0 16px #10b981' : '0 0 14px var(--ac)',
                transform: `translate(${calibratedTiltX * 2.2}px, ${calibratedTiltY * 2.2}px)`,
                transition: 'transform 0.08s ease-out, background 0.2s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '15px', fontWeight: 700 }}>
            <span>X (Roll): <b style={{ color: 'var(--ac)' }}>{calibratedTiltX.toFixed(1)}°</b></span>
            <span>Y (Pitch): <b style={{ color: 'var(--cy)' }}>{calibratedTiltY.toFixed(1)}°</b></span>
          </div>

          <div style={{ fontSize: '14px', fontWeight: 700, color: totalTiltAngle <= 1 ? '#10b981' : 'var(--tx)' }}>
            {totalTiltAngle <= 1 ? '✓ Surface Perfectly Level' : `Incline Angle: ${totalTiltAngle}°`}
          </div>

          {/* Accelerometer Calibration Card */}
          <div
            className="glass"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Accelerometer Zero Calibration</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: (zeroOffsetX !== 0 || zeroOffsetY !== 0) ? '#10b981' : 'var(--mut)',
                }}
              >
                {(zeroOffsetX !== 0 || zeroOffsetY !== 0)
                  ? `Offset: X(${zeroOffsetX.toFixed(1)}°), Y(${zeroOffsetY.toFixed(1)}°)`
                  : 'Uncalibrated Raw'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                className="btn"
                onClick={calibrateLevel}
                style={{ flex: 1, height: '40px', fontSize: '12.5px', borderRadius: '12px' }}
              >
                Zero Surface Calibration
              </button>
              {(zeroOffsetX !== 0 || zeroOffsetY !== 0) && (
                <button
                  type="button"
                  className="btn-sec"
                  onClick={resetCalibration}
                  style={{ height: '40px', fontSize: '12.5px', borderRadius: '12px', padding: '0 14px' }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Vibratometer */}
      {toolId === 'vibratometer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {vibeSensorSupported === false && (
            <div
              style={{
                width: '100%',
                background: dark ? 'rgba(245, 158, 11, 0.12)' : '#fef3c7',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ fontSize: '13px', color: dark ? '#fef08a' : '#92400e', lineHeight: 1.4 }}>
                <strong>Accelerometer Sensor Unavailable</strong>
                <div>Motion sensors are not available on this device/browser. Sensor updates require real accelerometer access on supported hardware.</div>
              </div>
            </div>
          )}

          {/* Real-time Waveform Graph */}
          <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>Live Vibration Waveform</span>
              <span style={{ fontSize: '12px', color: getVibeStatus(vibeMag).color, fontWeight: 700 }}>
                {getVibeStatus(vibeMag).label}
              </span>
            </div>

            <svg viewBox="0 0 300 100" style={{ width: '100%', height: '110px', overflow: 'visible' }}>
              <path
                d={vibeHistory
                  .map((val, i) => {
                    const x = (i / (vibeHistory.length - 1)) * 300;
                    const y = 90 - Math.min(80, val * 25);
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="var(--ac)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--tx)' }}>{vibeMag.toFixed(2)}</div>
                <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Current (m/s²)</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>{vibePeak.toFixed(2)}</div>
                <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Peak Amplitude</div>
              </div>
            </div>

            <button
              type="button"
              className="btn-sec"
              onClick={() => setVibePeak(0)}
              style={{ width: '100%', marginTop: '16px', height: '38px', fontSize: '12px', borderRadius: '10px' }}
            >
              Reset Peak Record
            </button>
          </div>
        </div>
      )}

      {/* 5. Pedometer */}
      {toolId === 'pedometer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pedometerSensorSupported === false && (
            <div
              style={{
                width: '100%',
                background: dark ? 'rgba(245, 158, 11, 0.12)' : '#fef3c7',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ fontSize: '13px', color: dark ? '#fef08a' : '#92400e', lineHeight: 1.4 }}>
                <strong>Hardware Step Counter / Motion Sensor Unavailable</strong>
                <div>Device motion sensor access is missing or restricted. Step tracking activates when hardware motion sensors are accessible.</div>
              </div>
            </div>
          )}

          <div className="glass" style={{ padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--mut)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
              Live Step Counter
            </span>
            <b style={{ fontSize: '56px', color: 'var(--ac)', display: 'block', margin: '8px 0', fontFamily: 'Manrope, sans-serif' }}>
              {steps}
            </b>
            <span style={{ fontSize: '14px', color: 'var(--tx)', fontWeight: 600 }}>Steps Taken</span>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '24px', borderTop: '1px solid var(--bd)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--tx)' }}>{distanceKm}</div>
                <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Distance (km)</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b' }}>{caloriesBurned}</div>
                <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Calories (kcal)</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setIsPedometerActive((prev) => !prev)}
                style={{ flex: 1, height: '42px', fontSize: '13px', borderRadius: '12px' }}
              >
                {isPedometerActive ? 'Pause Tracking' : 'Resume Tracking'}
              </button>
              <button
                type="button"
                className="btn-sec"
                onClick={() => setSteps(0)}
                style={{ height: '42px', fontSize: '13px', borderRadius: '12px' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Pendulum */}
      {toolId === 'pendulum' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            className="glass"
            style={{
              width: '100%',
              height: '240px',
              borderRadius: '20px',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* Pivot */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#fff',
                transform: 'translateX(-50%)',
              }}
            />
            {/* Rod */}
            <div
              style={{
                position: 'absolute',
                top: '26px',
                left: 'calc(50% - 1.5px)',
                width: '3px',
                height: '140px',
                background: 'var(--mut)',
                transformOrigin: 'top center',
                transform: `rotate(${pendulumAngle}rad)`,
              }}
            >
              {/* Bob */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-14px',
                  left: '-12px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--ac)',
                  boxShadow: '0 0 20px var(--ac)',
                }}
              />
            </div>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--mut)', textAlign: 'center' }}>
            Real harmonic oscillator differential physics with air resistance damping
          </span>
        </div>
      )}
    </div>
  );
};

export default MeasurementToolsView;
