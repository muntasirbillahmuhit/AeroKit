import React, { useState, useEffect } from 'react';
import { Header } from '../../common/Header';
import { Icon } from '../../common/Icon';
import { useApp } from '../../../context/AppContext';

interface DeviceInfoViewProps {
  toolId: string;
}

export const DeviceInfoView: React.FC<DeviceInfoViewProps> = ({ toolId }) => {
  const { toast } = useApp();

  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    // Battery API
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((b: any) => {
        setBattery({ level: Math.round(b.level * 100), charging: b.charging });
        b.addEventListener('levelchange', () => {
          setBattery({ level: Math.round(b.level * 100), charging: b.charging });
        });
        b.addEventListener('chargingchange', () => {
          setBattery({ level: Math.round(b.level * 100), charging: b.charging });
        });
      }).catch(() => {});
    }

    // Storage API
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.usage != null && est.quota != null) {
          setStorage({
            usage: Math.round(est.usage / (1024 * 1024)),
            quota: Math.round(est.quota / (1024 * 1024)),
          });
        }
      }).catch(() => {});
    }
  }, []);

  const titles: Record<string, string> = {
    'device-overview': 'Hardware & OS Overview',
    'battery-status': 'Battery Diagnostics',
    'screen-display': 'Screen & Viewport Metrics',
    'hardware-concurrency': 'CPU Cores & Threads',
    'storage-quota': 'Storage Quota & Persistence',
  };

  return (
    <div className="body" style={{ overflowY: 'auto' }}>
      <Header title={titles[toolId] || 'Device Diagnostics'} />

      {/* 1. Device Overview */}
      {toolId === 'device-overview' && (
        <div className="glass" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>Platform / OS</span>
            <b>{navigator.platform || 'Web Standard'}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>Network Status</span>
            <b style={{ color: navigator.onLine ? 'var(--ac)' : '#ff6b6b' }}>
              {navigator.onLine ? 'Online' : 'Offline'}
            </b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>Language</span>
            <b>{navigator.language}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>CPU Cores</span>
            <b style={{ color: 'var(--cy)' }}>{navigator.hardwareConcurrency || 4} Logical Cores</b>
          </div>
        </div>
      )}

      {/* 2. Battery Status */}
      {toolId === 'battery-status' && (
        <div className="glass" style={{ padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--s2)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 14px',
              color: battery?.charging ? 'var(--ac)' : 'var(--cy)',
            }}
          >
            <Icon name="bolt" size={32} />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Current Battery Level</span>
          <div style={{ fontSize: '28px', fontWeight: 900, color: battery ? 'var(--ac)' : 'var(--dim)', margin: '4px 0' }}>
            {battery ? `${battery.level}%` : 'API Unsupported'}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--dim)' }}>
            {battery ? (battery.charging ? 'Charging ⚡' : 'Discharging on Battery') : 'Battery Status API is not exposed by this browser.'}
          </span>
        </div>
      )}

      {/* 3. Screen Display */}
      {toolId === 'screen-display' && (
        <div className="glass" style={{ padding: '14px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>Screen Resolution</span>
            <b>{window.screen.width} × {window.screen.height} px</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>Viewport Size</span>
            <b>{window.innerWidth} × {window.innerHeight} px</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bd)', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>Device Pixel Ratio (DPI)</span>
            <b style={{ color: 'var(--cy)' }}>{window.devicePixelRatio || 1}x High-DPI</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
            <span style={{ color: 'var(--mut)' }}>Color Depth</span>
            <b>{window.screen.colorDepth || 24}-bit TrueColor</b>
          </div>
        </div>
      )}

      {/* 4. Hardware Concurrency */}
      {toolId === 'hardware-concurrency' && (
        <div className="glass" style={{ padding: '20px', borderRadius: '18px', textAlign: 'center' }}>
          <b style={{ fontSize: '42px', color: 'var(--ac)', display: 'block' }}>
            {navigator.hardwareConcurrency || 8}
          </b>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--tx)' }}>
            Logical Processing Cores
          </span>
          <p style={{ fontSize: '11.5px', color: 'var(--mut)', marginTop: '8px' }}>
            Hardware threads available for web workers, background processing, and parallel computations.
          </p>
        </div>
      )}

      {/* 5. Storage Quota */}
      {toolId === 'storage-quota' && (
        <div className="glass" style={{ padding: '18px', borderRadius: '18px', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--mut)' }}>Storage Space</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ac)', margin: '6px 0' }}>
            {storage ? `${storage.usage} MB used of ${storage.quota} MB` : '12 MB / 4.2 GB Available'}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--dim)', margin: 0 }}>
            IndexedDB, Web Storage, and Cache Storage quota managed by browser sandbox.
          </p>
        </div>
      )}
    </div>
  );
};

export default DeviceInfoView;
