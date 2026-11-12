import React from 'react';
import { Icon } from './Icon';
import { useApp } from '../../context/AppContext';

interface NavBarProps {
  activeTab?: 'home' | 'cats' | 'fav' | 'settings';
}

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

  return (
    <nav className="nav" aria-label="Main Navigation">
      <button
        type="button"
        className={current === 'home' ? 'on' : ''}
        onClick={() => navigate('home')}
        aria-label="Home"
      >
        {current === 'home' && <span className="nav-indicator" />}
        <span className="nav-icon-wrapper">
          <Icon name="home" size={18} />
        </span>
        <span>Home</span>
      </button>

      <button
        type="button"
        className={current === 'fav' ? 'on' : ''}
        onClick={() => navigate('fav')}
        aria-label="Favorites"
      >
        {current === 'fav' && <span className="nav-indicator" />}
        <span className="nav-icon-wrapper">
          <Icon name="star" size={18} />
          {favorites.length > 0 && (
            <span className="nav-badge">{favorites.length}</span>
          )}
        </span>
        <span>Favorites</span>
      </button>

      <button
        type="button"
        className={current === 'cats' ? 'on' : ''}
        onClick={() => navigate('cats')}
        aria-label="Tools"
      >
        {current === 'cats' && <span className="nav-indicator" />}
        <span className="nav-icon-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
          </svg>
        </span>
        <span>Tools</span>
      </button>

      <button
        type="button"
        className={current === 'settings' ? 'on' : ''}
        onClick={() => navigate('settings')}
        aria-label="More"
      >
        {current === 'settings' && <span className="nav-indicator" />}
        <span className="nav-icon-wrapper">
          <Icon name="menu" size={18} />
        </span>
        <span>More</span>
      </button>
    </nav>
  );
};

export default NavBar;
