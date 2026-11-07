import React, { useState, useMemo } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { encodeQR, qrToSVG, qrToDataURL } from '../../../utils/qr';
import { copyText, download } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

export const QrGeneratorView: React.FC = () => {
  const { toast, navigate } = useApp();
  const [qrInput, setQrInput] = useState('https://aerokit.app');

  // QR Code encoding
  const qrSvg = useMemo(() => {
    try {
      const content = qrInput.trim() || 'AeroKit Toolkit';
      const qrData = encodeQR(content, 'M');
      return qrToSVG(qrData, { margin: 2, dark: '#0c1218', light: '#ffffff' });
    } catch {
      return '';
    }
  }, [qrInput]);

  const handleDownloadPNG = () => {
    try {
      const content = qrInput.trim() || 'AeroKit Toolkit';
      const qrData = encodeQR(content, 'M');
      const dataUrl = qrToDataURL(qrData, { margin: 2, width: 600, dark: '#0c1218', light: '#ffffff' });
      download(dataUrl, 'aerokit-qr-code.png');
      toast('PNG downloaded');
    } catch {
      toast('Error generating download');
    }
  };

  const handleDownloadSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    download(url, 'aerokit-qr-code.svg');
    toast('SVG downloaded');
  };

  return (
    <div className="body qr" style={{ overflowY: 'auto' }}>
      <Header
        title="QR Code Generator"
        rightAction={
          <button
            className="ib"
            onClick={() => navigate('qr-scan')}
            aria-label="Scan QR"
            type="button"
            title="Scan QR"
          >
            <Icon name="scan" size={18} color="var(--ac)" />
          </button>
        }
      />

      {/* QR Code Preview */}
      <div
        className="glass"
        style={{
          padding: '20px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '8px 0 16px',
          width: '100%',
        }}
      >
        <div
          style={{
            width: '180px',
            height: '180px',
            background: '#fff',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            type="button"
            className="btn"
            onClick={handleDownloadPNG}
            style={{ height: '34px', fontSize: '12px', padding: '0 14px' }}
          >
            <Icon name="arrow" size={13} /> PNG
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleDownloadSVG}
            style={{
              height: '34px',
              fontSize: '12px',
              padding: '0 14px',
              background: 'var(--s2)',
              color: 'var(--tx)',
              border: '1px solid var(--bd)',
              boxShadow: 'none',
            }}
          >
            <Icon name="arrow" size={13} /> SVG
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => copyText(qrInput.trim() || 'AeroKit Toolkit').then(() => toast('Copied QR content'))}
            style={{
              height: '34px',
              fontSize: '12px',
              padding: '0 14px',
              background: 'var(--s2)',
              color: 'var(--tx)',
              border: '1px solid var(--bd)',
              boxShadow: 'none',
            }}
          >
            <Icon name="copy" size={13} /> Copy
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="lbl">Content to Encode (Text, URL, Data)</div>
        <textarea
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
          rows={4}
          placeholder="Enter URL, text, or data..."
          style={{
            width: '100%',
            background: 'var(--s2)',
            border: '1px solid var(--bd)',
            borderRadius: '12px',
            padding: '12px',
            color: 'var(--tx)',
            fontSize: '13px',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Segments: Scan / Generate */}
      <div className="seg glass" style={{ marginTop: 'auto', paddingTop: '10px' }}>
        <button type="button" onClick={() => navigate('qr-scan')}>
          <Icon name="scan" size={16} />
          <span>Scanner</span>
        </button>
        <button type="button" className="on" onClick={() => navigate('qr-gen')}>
          <Icon name="gen" size={16} />
          <span>Generator</span>
        </button>
      </div>
    </div>
  );
};

export default QrGeneratorView;
