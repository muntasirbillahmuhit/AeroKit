import React from 'react';
import { useApp } from '../../context/AppContext';

interface NavBarProps {
  activeTab?: 'home' | 'cats' | 'fav' | 'settings';
}

/* 1. Home: Solid filled house with curved apex and arched doorway cutout */
const HomeNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 23, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5a1.6 1.6 0 0 0-1.02.37L3.72 8.78A1.6 1.6 0 0 0 3.2 10v9.5A2.5 2.5 0 0 0 5.7 22h3.5a1.2 1.2 0 0 0 1.2-1.2v-4.1a1.6 1.6 0 0 1 3.2 0v4.1a1.2 1.2 0 0 0 1.2 1.2h3.5a2.5 2.5 0 0 0 2.5-2.5V10a1.6 1.6 0 0 0-.52-1.22l-7.26-5.91A1.6 1.6 0 0 0 12 2.5z" />
  </svg>
);

/* 2. Tool: Crossed wrench and screwdriver matching reference image */
const ToolNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 23, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Screwdriver rotated -45° (blade top-left, contoured handle bottom-right) */}
    <g transform="rotate(-45 12 12)">
      {/* Screwdriver flat blade */}
      <rect x="10.2" y="1.5" width="3.6" height="2.2" rx="0.5" />
      {/* Screwdriver shaft */}
      <rect x="10.8" y="3.2" width="2.4" height="7.8" />
      {/* Ergonomic handle with grip contour */}
      <path d="M9.8 11h4.4a1 1 0 0 1 1 1v2.5a1.2 1.2 0 0 1-.6 1 1.2 1.2 0 0 1 .6 1V19a2.4 2.4 0 0 1-2.4 2.4h-1.6A2.4 2.4 0 0 1 9.8 19v-2.5a1.2 1.2 0 0 1 .6-1 1.2 1.2 0 0 1-.6-1V12a1 1 0 0 1 1-1z" />
    </g>
    {/* Wrench rotated 45° (open U-jaw top-right, rounded handle bottom-left) */}
    <g transform="rotate(45 12 12)">
      <path d="M8.2 5.4a3.8 3.8 0 0 1 2.4-3.5v3.4a1.4 1.4 0 0 0 2.8 0V1.9a3.8 3.8 0 0 1 2.4 3.5c0 1.6-.9 2.9-2.2 3.5v11.7a1.6 1.6 0 0 1-3.2 0V8.9A3.8 3.8 0 0 1 8.2 5.4z" />
    </g>
  </svg>
);

/* 3. Favourite: Crisp outline heart matching reference image */
const FavouriteNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 23, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
  </svg>
);

/* 4. Setting: 8-tooth gear/cog with round center cutout */
const SettingNavIcon: React.FC<{ size?: number; className?: string }> = ({ size = 23, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const NavBar: React.FC<NavBarProps> = ({ activeTab }) => {
  const { screen, navigate, favorites } = useApp();

  const current =
    activeTab ||
    (screen === 'home'
      ? 'home'
      : screen === 'cats' || screen === 'cat-detail'
      ? 'cats'
      : screen === 'fav'
      ? 'fav'
      : screen === 'settings'
      ? 'settings'
      : 'home');

  const tabs: ('home' | 'cats' | 'fav' | 'settings')[] = ['home', 'cats', 'fav', 'settings'];
  const activeIndex = Math.max(0, tabs.indexOf(current as any));

  return (
    <nav
      className="nav"
      aria-label="Main Navigation"
      style={{ '--active-index': activeIndex } as React.CSSProperties}
    >
      {/* Translucent illuminated glowing active pill with ambient ground flare */}
      <div className="nav-active-pill" aria-hidden="true" />

      {/* 1. Home */}
      <button
        type="button"
        className={`nav-item ${current === 'home' ? 'on' : ''}`}
        onClick={() => navigate('home')}
        aria-label="Home"
      >
        <span className="nav-icon-wrap">
          <HomeNavIcon size={23} />
        </span>
        <span className="nav-label">Home</span>
      </button>

      {/* 2. Tool */}
      <button
        type="button"
        className={`nav-item ${current === 'cats' ? 'on' : ''}`}
        onClick={() => navigate('cats')}
        aria-label="Tool"
      >
        <span className="nav-icon-wrap">
          <ToolNavIcon size={23} />
        </span>
        <span className="nav-label">Tool</span>
      </button>

      {/* 3. Favourite */}
      <button
        type="button"
        className={`nav-item ${current === 'fav' ? 'on' : ''}`}
        onClick={() => navigate('fav')}
        aria-label="Favourite"
      >
        <span className="nav-icon-wrap">
          <FavouriteNavIcon size={23} />
          {favorites.length > 0 && (
            <span className="nav-badge" aria-label={`${favorites.length} favorites`}>
              {favorites.length}
            </span>
          )}
        </span>
        <span className="nav-label">Favourite</span>
      </button>

      {/* 4. Setting */}
      <button
        type="button"
        className={`nav-item ${current === 'settings' ? 'on' : ''}`}
        onClick={() => navigate('settings')}
        aria-label="Setting"
      >
        <span className="nav-icon-wrap">
          <SettingNavIcon size={23} />
        </span>
        <span className="nav-label">Setting</span>
      </button>
    </nav>
  );
};

export default NavBar;
