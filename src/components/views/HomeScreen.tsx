import React, { useState, useMemo } from 'react';
import { Logo } from '../common/Logo';
import { Icon } from '../common/Icon';
import { NavBar } from '../common/NavBar';
import { useApp } from '../../context/AppContext';
import { ALL_TOOLS } from '../../data/categoriesData';

interface HomeShortcut {
  id: string;
  name: string;
  icon: string;
  colorScheme: 'cyan' | 'lime';
}

const HOME_SHORTCUTS: HomeShortcut[] = [
  { id: 'calculators-math', name: 'Calculator & Math', icon: 'calc', colorScheme: 'cyan' },
  { id: 'converters-data', name: 'Converter & Data', icon: 'conv', colorScheme: 'lime' },
  { id: 'developer-code', name: 'Developer & Code', icon: 'code', colorScheme: 'cyan' },
  { id: 'text-typing', name: 'Text & Typing', icon: 'text', colorScheme: 'cyan' },
  { id: 'time-productivity', name: 'Time & Focus', icon: 'clock', colorScheme: 'lime' },
  { id: 'security-finance', name: 'Security & Finance', icon: 'shield', colorScheme: 'lime' },
  { id: 'image-media', name: 'Image & Media', icon: 'img', colorScheme: 'cyan' },
  { id: 'device-network-sensors', name: 'Device & Sensors', icon: 'dev', colorScheme: 'cyan' },
];

export const HomeScreen: React.FC = () => {
  const {
    navigate,
    navigateCategory,
    favorites,
    toggleFavorite,
  } = useApp();
  const [search, setSearch] = useState('');

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return ALL_TOOLS.filter(
      (item) =>
        item.tool.name.toLowerCase().includes(q) ||
        item.tool.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="body" style={{ overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="hd" style={{ padding: '2px 0 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo width={28} id="hd-lg" />
            <span
              style={{
                fontSize: '25px',
                fontWeight: 800,
                letterSpacing: '-0.6px',
                lineHeight: 1,
                color: '#ffffff',
              }}
            >
              Aero<span style={{ color: '#ffffff' }}>Kit</span>
            </span>
          </div>
          <span className="sp" />
          <button
            className="ib"
            onClick={() => navigate('settings')}
            title="Settings"
            aria-label="Settings"
            type="button"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#C6FF3D',
              color: '#081a03',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 0 16px rgba(198,255,61,0.65)',
              display: 'grid',
              placeItems: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            AK
          </button>
        </div>

        {/* Search Bar with Frosted Glass & Cyan Glow */}
        <div className="srch">
          <Icon name="search" size={19} color="#00f0ff" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all tools &amp; utilities..."
            aria-label="Search utilities"
            autoComplete="off"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#F3F6F8',
                display: 'grid',
                placeItems: 'center',
                fontSize: '11px',
                lineHeight: 1,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          ) : (
            <Icon name="sliders" size={18} color="#00f0ff" />
          )}
        </div>

        {/* Search Results or Dashboard */}
        {search.trim() ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="sec">
              <span>Matching Utilities ({searchResults.length})</span>
            </div>
            {searchResults.length === 0 ? (
              <div
                className="glass"
                style={{
                  padding: '36px 18px',
                  textAlign: 'center',
                  borderRadius: '20px',
                  color: 'var(--mut)',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--s2)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 12px',
                    color: 'var(--dim)',
                  }}
                >
                  <Icon name="search" size={20} />
                </div>
                <b
                  style={{
                    fontSize: '15px',
                    color: 'var(--tx)',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  No tools found
                </b>
                <p style={{ fontSize: '12px', margin: 0, color: 'var(--mut)' }}>
                  No matching utilities for &quot;{search.trim()}&quot;.
                </p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSearch('')}
                  style={{
                    margin: '16px auto 0',
                    height: '34px',
                    fontSize: '12px',
                    padding: '0 18px',
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              searchResults.map((item, idx) => {
                const isFav = favorites.includes(item.tool.name);
                return (
                  <div
                    key={`search-${item.tool.id || idx}-${idx}`}
                    className="rec glass"
                    onClick={() => navigate(item.tool.id)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      className="mini"
                      style={{ width: '34px', height: '34px', borderRadius: '10px' }}
                    >
                      <Icon name={item.tool.icon} size={18} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          display: 'block',
                        }}
                      >
                        {item.tool.name}
                      </span>
                      <small
                        style={{
                          color: 'var(--mut)',
                          fontSize: '11px',
                          marginTop: '2px',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.categoryName} · {item.tool.description}
                      </small>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.tool.name);
                      }}
                      style={{
                        padding: '6px',
                        color: isFav ? 'var(--ac)' : 'var(--dim)',
                      }}
                      aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                    >
                      <Icon
                        name="star"
                        size={16}
                        color={isFav ? 'var(--ac)' : 'var(--dim)'}
                      />
                    </button>
                    <Icon name="chev" size={14} color="var(--mut)" />
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <>
            {/* Hero Banner with Green-Blue Wave Gradients */}
            <div className="hero">
              <h3>
                Your All-in-One
                <br />
                Utility Toolkit
              </h3>
              <p>Simple tools. Powerful results.</p>
              <button
                className="go"
                onClick={() => navigate('cats')}
                aria-label="Explore All Tools"
                type="button"
              >
                <Icon name="arrow" size={18} color="#111820" />
              </button>
            </div>

            {/* Quick Categories Header */}
            <div className="sec" style={{ marginTop: '16px' }}>
              <span>Tools &amp; Categories</span>
              <a
                onClick={() => navigate('cats')}
                role="link"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                View All Tools ›
              </a>
            </div>

            {/* Premium 3D Circular Glass-Neumorphic Category Buttons */}
            <div className="neo-category-grid">
              {HOME_SHORTCUTS.map((c) => {
                const isLime = c.colorScheme === 'lime';
                const accentColor = isLime ? '#C6FF3D' : '#00f0ff';
                return (
                  <button
                    key={c.id}
                    className={`neo-category-btn ${isLime ? 'lime' : 'cyan'}`}
                    type="button"
                    onClick={() => navigateCategory(c.id, 'home')}
                    title={`${c.name} Tools`}
                  >
                    <div className="neo-orb">
                      <div className="neo-orb-specular" />
                      <div className="neo-orb-inner-shadow" />
                      <div className="neo-orb-icon">
                        <Icon name={c.icon} size={24} color={accentColor} />
                      </div>
                    </div>
                    <span className="neo-category-label">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating Glass-Neumorphic Bottom Navigation */}
      <NavBar activeTab="home" />
    </div>
  );
};

export default HomeScreen;
