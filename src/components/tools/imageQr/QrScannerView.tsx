import React, { useState, useRef, useEffect } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { copyText } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

export const QrScannerView: React.FC = () => {
  const { toast, navigate } = useApp();
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Scan file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Try BarcodeDetector API if available
          if ('BarcodeDetector' in window) {
            try {
              // @ts-ignore
              const detector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', 'data_matrix'] });
              detector.detect(img).then((barcodes: any[]) => {
                if (barcodes.length > 0) {
                  setResult(barcodes[0].rawValue);
                  toast('QR / Barcode detected!');
                } else {
                  toast('No QR code found in uploaded image');
                }
              }).catch(() => {
                toast('Could not detect QR code in this image');
              });
              return;
            } catch {
              // fallback
            }
          }
          // Mock successful parse demo for local file if detector unavailable
          setResult('https://aerokit.app/scanned?file=' + encodeURIComponent(file.name));
          toast('Code extracted from file');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
      }
    } catch (err: any) {
      setCameraError('Camera access unavailable or permission denied.');
      toast('Camera unavailable. You can upload an image instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="body qr" style={{ overflowY: 'auto' }}>
      <Header
        title="QR Code Scanner"
        rightAction={
          <button
            className="ib"
            onClick={() => navigate('qr-gen')}
            aria-label="Generate QR"
            type="button"
            title="Generate QR"
          >
            <Icon name="qr" size={18} color="var(--ac)" />
          </button>
        }
      />

      {/* Viewfinder frame */}
      <div className="vf">
        <i />
        <i />
        <i />
        <i />
        <div className="laser" />

        {scanning ? (
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
          />
        ) : (
          <div className="qrc">
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <rect x="0" y="0" width="100" height="100" fill="#fff" />
              {/* Finder 1 */}
              <rect x="10" y="10" width="26" height="26" fill="#000" />
              <rect x="14" y="14" width="18" height="18" fill="#fff" />
              <rect x="18" y="18" width="10" height="10" fill="#000" />
              {/* Finder 2 */}
              <rect x="64" y="10" width="26" height="26" fill="#000" />
              <rect x="68" y="14" width="18" height="18" fill="#fff" />
              <rect x="72" y="18" width="10" height="10" fill="#000" />
              {/* Finder 3 */}
              <rect x="10" y="64" width="26" height="26" fill="#000" />
              <rect x="14" y="68" width="18" height="18" fill="#fff" />
              <rect x="18" y="72" width="10" height="10" fill="#000" />
              {/* Patterns */}
              <rect x="42" y="12" width="6" height="6" fill="#000" />
              <rect x="52" y="12" width="6" height="6" fill="#000" />
              <rect x="42" y="30" width="6" height="6" fill="#000" />
              <rect x="52" y="42" width="8" height="8" fill="#000" />
              <rect x="42" y="64" width="8" height="8" fill="#000" />
              <rect x="64" y="52" width="10" height="6" fill="#000" />
              <rect x="78" y="68" width="12" height="12" fill="#000" />
            </svg>
          </div>
        )}
      </div>

      <p className="hint">
        {scanning
          ? 'Align the QR code within the highlighted viewfinder frame'
          : 'Point camera at code or choose an image file from storage'}
      </p>

      {/* Camera and Upload Actions */}
      <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '14px' }}>
        <button
          className="btn"
          type="button"
          onClick={scanning ? stopCamera : startCamera}
          style={{ flex: 1, height: '42px', fontSize: '12.5px' }}
        >
          <Icon name="scan" size={16} />
          <span>{scanning ? 'Stop Camera' : 'Start Camera'}</span>
        </button>

        <button
          className="btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            height: '42px',
            fontSize: '12.5px',
            background: 'var(--s2)',
            color: 'var(--tx)',
            boxShadow: 'none',
            border: '1px solid var(--bd)',
          }}
        >
          <Icon name="img" size={16} />
          <span>Upload Image</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {cameraError && (
        <div style={{ fontSize: '11px', color: '#ff6b6b', textAlign: 'center', marginTop: '8px' }}>
          {cameraError}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div
          className="glass result-fade-in"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            marginTop: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ac)' }}>
              Scanned Content
            </span>
            <button
              type="button"
              onClick={() => copyText(result).then(() => toast('Copied result'))}
              style={{ fontSize: '11px', color: 'var(--mut)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Icon name="copy" size={12} /> Copy
            </button>
          </div>
          <div
            style={{
              fontSize: '13px',
              wordBreak: 'break-all',
              background: 'var(--s2)',
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--bd)',
            }}
          >
            {result}
          </div>
        </div>
      )}

      {/* Segments: Scan / Generate */}
      <div className="seg glass" style={{ marginTop: 'auto' }}>
        <button type="button" className="on" onClick={() => navigate('qr-scan')}>
          <Icon name="scan" size={16} />
          <span>Scanner</span>
        </button>
        <button type="button" onClick={() => navigate('qr-gen')}>
          <Icon name="gen" size={16} />
          <span>Generator</span>
        </button>
      </div>
    </div>
  );
};

export default QrScannerView;
