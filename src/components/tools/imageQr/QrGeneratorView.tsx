import React, { useState, useMemo } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { encodeQR, qrToSVG, qrToDataURL } from '../../../utils/qr';
import { copyText, download } from '../../../utils/storage';
import { useApp } from '../../../context/AppContext';

interface QrGeneratorViewProps {
  initialType?: 'text' | 'url' | 'wifi' | 'vcard';
}

export const QrGeneratorView: React.FC<QrGeneratorViewProps> = ({
  initialType = 'text',
}) => {
  const { toast, navigate } = useApp();
  const [tab, setTab] = useState<'text' | 'url' | 'wifi' | 'vcard'>(initialType);

  // Text / URL inputs
  const [text, setText] = useState('https://aerokit.app');
  const [url, setUrl] = useState('https://aerokit.app');

  // Wi-Fi inputs
  const [ssid, setSsid] = useState('MyHomeWiFi');
  const [encryption, setEncryption] = useState('WPA');
  const [wifiPass, setWifiPass] = useState('Secret1234');

  // vCard inputs
  const [vName, setVName] = useState('Alex Mercer');
  const [vPhone, setVPhone] = useState('+1 (555) 234-5678');
  const [vEmail, setVEmail] = useState('alex@example.com');

  // QR string resolution
  const qrString = useMemo(() => {
    switch (tab) {
      case 'url':
        return url.trim() || 'https://aerokit.app';
      case 'wifi':
        return `WIFI:T:${encryption};S:${ssid};P:${wifiPass};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vName}\nTEL:${vPhone}\nEMAIL:${vEmail}\nEND:VCARD`;
      case 'text':
      default:
        return text.trim() || 'AeroKit Toolkit';
    }
  }, [tab, text, url, ssid, encryption, wifiPass, vName, vPhone, vEmail]);

  // QR Code encoding
  const qrSvg = useMemo(() => {
    try {
      const qrData = encodeQR(qrString, 'M');
      return qrToSVG(qrData, { margin: 2, dark: '#0c1218', light: '#ffffff' });
    } catch {
      return '';
    }
  }, [qrString]);

  const handleDownloadPNG = () => {
    try {
      const qrData = encodeQR(qrString, 'M');
      const dataUrl = qrToDataURL(qrData, { margin: 2, width: 600, dark: '#0c1218', light: '#ffffff' });
      download(dataUrl, `aerokit-qr-${tab}.png`);
      toast('PNG downloaded');
    } catch {
      toast('Error generating download');
    }
  };

  const handleDownloadSVG = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    download(url, `aerokit-qr-${tab}.svg`);
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

      {/* Tabs */}
      <div className="tabs" style={{ width: '100%' }}>
        <button
          type="button"
          className={tab === 'text' ? 'on' : ''}
          onClick={() => setTab('text')}
        >
          Text
        </button>
        <button
          type="button"
          className={tab === 'url' ? 'on' : ''}
          onClick={() => setTab('url')}
        >
          URL
        </button>
        <button
          type="button"
          className={tab === 'wifi' ? 'on' : ''}
          onClick={() => setTab('wifi')}
        >
          Wi-Fi
        </button>
        <button
          type="button"
          className={tab === 'vcard' ? 'on' : ''}
          onClick={() => setTab('vcard')}
        >
          Contact
        </button>
      </div>

      {/* QR Code Preview */}
      <div
        className="glass"
        style={{
          padding: '16px',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '8px 0 12px',
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

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            className="btn"
            onClick={handleDownloadPNG}
            style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}
          >
            <Icon name="arrow" size={12} /> PNG
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleDownloadSVG}
            style={{
              height: '32px',
              fontSize: '11px',
              padding: '0 12px',
              background: 'var(--s2)',
              color: 'var(--tx)',
              border: '1px solid var(--bd)',
              boxShadow: 'none',
            }}
          >
            <Icon name="arrow" size={12} /> SVG
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => copyText(qrString).then(() => toast('Copied QR content'))}
            style={{
              height: '32px',
              fontSize: '11px',
              padding: '0 12px',
              background: 'var(--s2)',
              color: 'var(--tx)',
              border: '1px solid var(--bd)',
              boxShadow: 'none',
            }}
          >
            <Icon name="copy" size={12} /> Copy
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tab === 'text' && (
          <label className="fld">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or note..."
            />
          </label>
        )}

        {tab === 'url' && (
          <label className="fld">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </label>
        )}

        {tab === 'wifi' && (
          <>
            <label className="fld">
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="Wi-Fi SSID / Network Name"
              />
            </label>
            <label className="fld">
              <select value={encryption} onChange={(e) => setEncryption(e.target.value)}>
                <option value="WPA">WPA / WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
              <Icon name="down" size={16} />
            </label>
            {encryption !== 'nopass' && (
              <label className="fld">
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Password"
                />
              </label>
            )}
          </>
        )}

        {tab === 'vcard' && (
          <>
            <label className="fld">
              <input
                type="text"
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                placeholder="Full Name"
              />
            </label>
            <label className="fld">
              <input
                type="tel"
                value={vPhone}
                onChange={(e) => setVPhone(e.target.value)}
                placeholder="Phone Number"
              />
            </label>
            <label className="fld">
              <input
                type="email"
                value={vEmail}
                onChange={(e) => setVEmail(e.target.value)}
                placeholder="Email Address"
              />
            </label>
          </>
        )}
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
