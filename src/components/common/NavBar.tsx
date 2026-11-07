import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from './Icon';

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

  const tabs: ('home' | 'cats' | 'fav' | 'settings')[] = ['home', 'cats', 'fav', 'settings'];
  const activeIndex = Math.max(0, tabs.indexOf(current as any));

  return (
    <nav
      className="nav"
      aria-label="Main Navigation"
      style={{ '--active-index': activeIndex } as React.CSSProperties}
    >
      {/* Smooth animated active-tab glass indicator pill */}
      <div className="nav-active-pill" aria-hidden="true" />

      {/* 1. Home */}
      <button
        type="button"
        className={current === 'home' ? 'on' : ''}
        onClick={() => navigate('home')}
        aria-label="Home"
      >
        <div className="nav-glass-disc">
          <Icon name="home" size={21} />
        </div>
        <span className="nav-label">Home</span>
      </button>

      {/* 2. Tools Categories */}
      <button
        type="button"
        className={current === 'cats' ? 'on' : ''}
        onClick={() => navigate('cats')}
        aria-label="Tools"
      >
        <div className="nav-glass-disc">
          <Icon name="tools" size={20} />
        </div>
        <span className="nav-label">Tools</span>
      </button>

      {/* 3. Favorites */}
      <button
        type="button"
        className={current === 'fav' ? 'on' : ''}
        onClick={() => navigate('fav')}
        aria-label="Favorites"
      >
        <div className="nav-glass-disc">
          <Icon name="star" size={20} />
          {favorites.length > 0 && (
            <span className="nav-badge">{favorites.length}</span>
          )}
        </div>
        <span className="nav-label">Favorites</span>
      </button>

      {/* 4. Settings / More */}
      <button
        type="button"
        className={current === 'settings' ? 'on' : ''}
        onClick={() => navigate('settings')}
        aria-label="More"
      >
        <div className="nav-glass-disc">
          <Icon name="gear" size={20} />
        </div>
        <span className="nav-label">More</span>
      </button>
    </nav>
  );
};

export default NavBar;
