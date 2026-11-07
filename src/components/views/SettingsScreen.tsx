import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { NavBar } from '../common/NavBar';
import { Icon } from '../common/Icon';
import { useApp } from '../../context/AppContext';
import { relTime } from '../../utils/storage';

export const SettingsScreen: React.FC = () => {
  const {
    dark,
    setTheme,
    language,
    setLanguage,
    clearHistory,
    favorites,
    toggleFavorite,
    navigate,
    navigateBack,
    recents,
    toast,
  } = useApp();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showWipeModal, setShowWipeModal] = useState(false);

  const languages = [
    { code: 'English', label: 'English', native: 'English' },
    { code: 'Bangla', label: 'Bangla', native: 'বাংলা' },
    { code: 'Deutsch', label: 'German', native: 'Deutsch' },
    { code: 'Latin', label: 'Latin', native: 'Lingua Latina' },
    { code: 'Español', label: 'Spanish', native: 'Español' },
    { code: 'العربية', label: 'Arabic (Arbi)', native: 'العربية' },
  ];

  return (
    <>
      <div
        className="body"
        style={{
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
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
            Settings
          </h1>
        </div>

        {/* 1. AeroKit Hero App Card */}
        <div
          className="glass"
          style={{
            borderRadius: '20px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          {/* AeroKit Tile Logo */}
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(140deg, #18B8CC 0%, #0d547d 55%, #102636 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Logo width={38} id="settings-brand-logo" />
          </div>

          <div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--tx)',
                lineHeight: 1.2,
              }}
            >
              AeroKit
            </div>
            <div
              style={{
                fontSize: '13.5px',
                color: 'var(--mut)',
                marginTop: '3px',
                fontWeight: 500,
              }}
            >
              Version 1.0.0
            </div>
          </div>
        </div>

        {/* 2. First Section - 3 Separate Pill Cards */}

        {/* Theme Pill Card */}
        <button
          type="button"
          className="glass-interactive"
          onClick={() => {
            const next = !dark;
            setTheme(next);
            toast(next ? 'Dark theme enabled' : 'Light theme enabled');
          }}
          style={{
            width: '100%',
            height: '58px',
            borderRadius: '18px',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--tx)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Glowing Lime/Neon Sun Icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4.5" fill="#C6FF3D" stroke="#C6FF3D" strokeWidth="1" />
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
                stroke="#C6FF3D"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: '15.5px', fontWeight: 600 }}>Theme</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mut)' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 500 }}>Light / Dark</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* Language Pill Card */}
        <button
          type="button"
          className="glass-interactive"
          onClick={() => setShowLanguageModal(true)}
          style={{
            width: '100%',
            height: '58px',
            borderRadius: '18px',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--tx)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Globe Wireframe Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span style={{ fontSize: '15.5px', fontWeight: 600 }}>Language</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mut)' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 500 }}>{language || 'English'}</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* History Section */}
        {recents && recents.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--mut)',
                marginBottom: '10px',
                paddingLeft: '4px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              History
            </div>
            <div className="glass" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              {recents.map((r, idx) => {
                const isFav = favorites.includes(r.name);
                return (
                  <div
                    key={`recent-${r.id}-${idx}`}
                    onClick={() => navigate(r.screen || r.id)}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      borderBottom: idx < recents.length - 1 ? (dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9') : 'none',
                    }}
                  >
                    <span
                      className="mini"
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'var(--s2)',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--ac)',
                      }}
                    >
                      <Icon name={r.icon || 'tools'} size={18} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--tx)' }}>{r.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--mut)' }}>{r.cat} · {relTime(r.timestamp)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(r.name);
                      }}
                      style={{ padding: '6px', color: isFav ? 'var(--ac)' : 'var(--dim)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Icon name="star" size={15} color={isFav ? 'var(--ac)' : 'var(--dim)'} />
                    </button>
                    <Icon name="chev" size={12} color="var(--mut)" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wipe Data Pill Card */}
        <button
          type="button"
          className="glass-interactive"
          onClick={() => setShowWipeModal(true)}
          style={{
            width: '100%',
            height: '58px',
            borderRadius: '18px',
            padding: '0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            cursor: 'pointer',
            textAlign: 'left',
            color: 'var(--tx)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Trash / Data Wipe Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
            </svg>
            <span style={{ fontSize: '15.5px', fontWeight: 600 }}>Wipe Data</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mut)' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>

        {/* 3. Second Section - Grouped Card with 3 Rows */}
        <div
          className="glass"
          style={{
            width: '100%',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          {/* Row 1: Privacy Policy */}
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            style={{
              width: '100%',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              borderBottom: dark
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid #E2E8F0',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--tx)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="2" width="16" height="20" rx="4" />
                <circle cx="12" cy="8.5" r="1" fill="currentColor" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="15.5" r="1" fill="currentColor" />
              </svg>
              <span style={{ fontSize: '15.5px', fontWeight: 600 }}>Privacy Policy</span>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mut)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Row 2: Help & Support */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            style={{
              width: '100%',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              borderBottom: dark
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid #E2E8F0',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--tx)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
              <span style={{ fontSize: '15.5px', fontWeight: 600 }}>Help &amp; Support</span>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mut)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Row 3: About */}
          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            style={{
              width: '100%',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--tx)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <circle cx="12" cy="8" r="1" fill="currentColor" />
              </svg>
              <span style={{ fontSize: '15.5px', fontWeight: 600 }}>About</span>
            </div>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--mut)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showLanguageModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 15, 25, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowLanguageModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '300px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--tx)',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Select Language</span>
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mut)',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLanguageModal(false);
                    toast(`Language set to ${l.label}`);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    background:
                      language === l.code
                        ? 'rgba(198, 255, 61, 0.16)'
                        : dark
                        ? 'rgba(255, 255, 255, 0.04)'
                        : '#f1f5f9',
                    color: language === l.code ? 'var(--ac)' : 'var(--tx)',
                    fontWeight: language === l.code ? 700 : 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <span>{l.label}</span>
                  <small style={{ color: 'var(--mut)', fontSize: '12px' }}>{l.native}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 15, 25, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              borderRadius: '24px',
              padding: '22px',
              width: '100%',
              maxWidth: '310px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--tx)',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Privacy Policy</span>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mut)',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--mut)',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div>
                <b style={{ color: 'var(--tx)', display: 'block' }}>100% Client-Side Processing</b>
                All calculations, conversions, image edits, and sensor measurements happen locally on
                your device. No personal data or files are sent to external servers.
              </div>
              <div>
                <b style={{ color: 'var(--tx)', display: 'block' }}>Zero Tracking &amp; Analytics</b>
                AeroKit collects zero telemetry, cookies, or user behavioral logs.
              </div>
              <div>
                <b style={{ color: 'var(--tx)', display: 'block' }}>Offline First</b>
                Your settings and favorites are securely stored in your browser's local storage.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                background: '#0060df',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 15, 25, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowHelpModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              borderRadius: '24px',
              padding: '22px',
              width: '100%',
              maxWidth: '310px',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--tx)',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Help &amp; Support</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mut)',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--mut)',
                lineHeight: 1.6,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div>
                <b style={{ color: 'var(--tx)', display: 'block' }}>Search &amp; Fast Navigation</b>
                Use the search bar on the Home tab to quickly jump to any of the 40+ built-in utility
                tools.
              </div>
              <div>
                <b style={{ color: 'var(--tx)', display: 'block' }}>Sensor Calibration</b>
                For Spirit Level and Metal Detector, ensure device motion and orientation
                permissions are granted when prompted by your browser.
              </div>
              <div>
                <b style={{ color: 'var(--tx)', display: 'block' }}>Favorites</b>
                Tap the star icon on any tool banner to pin your most frequently used utilities.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              style={{
                marginTop: '18px',
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                background: '#0060df',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 15, 25, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowAboutModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              borderRadius: '24px',
              padding: '24px 22px',
              width: '100%',
              maxWidth: '310px',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(140deg, #18B8CC 0%, #0d547d 55%, #102636 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              >
                <Logo width={44} id="settings-about-logo" />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--tx)', margin: '0 0 4px' }}>
              AeroKit
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--ac)', fontWeight: 700, marginBottom: '10px' }}>
              Version 1.0.0
            </div>
            <p style={{ fontSize: '13px', color: 'var(--mut)', lineHeight: 1.5, margin: '0 0 16px' }}>
              Smart, modern all-in-one utility toolkit featuring interactive calculator, unit converter,
              internet speed test, metal detector, and offline developer utilities.
            </p>
            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '12px',
                background: '#0060df',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Wipe Data Confirmation Modal */}
      {showWipeModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 15, 25, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowWipeModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass"
            style={{
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '310px',
              textAlign: 'center',
              border: dark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" />
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--tx)', margin: '0 0 8px' }}>
              Wipe All Data?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--mut)', lineHeight: 1.5, margin: '0 0 20px' }}>
              This will permanently clear your recently used tools, saved favorites, and reset cached preferences on this device.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '12px',
                  background: dark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                  color: 'var(--tx)',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  clearHistory();
                  favorites.forEach((f) => toggleFavorite(f));
                  try {
                    localStorage.removeItem('aerokit_recent_tools');
                    localStorage.removeItem('aerokit_favorites');
                  } catch {}
                  setShowWipeModal(false);
                  toast('All app data wiped successfully');
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '12px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                }}
              >
                Wipe Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <NavBar activeTab="settings" />
    </>
  );
};

export default SettingsScreen;
