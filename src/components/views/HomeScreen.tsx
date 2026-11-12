import React, { useState, useMemo } from 'react';
import { Logo } from '../common/Logo';
import { Icon } from '../common/Icon';
import { NavBar } from '../common/NavBar';
import { useApp } from '../../context/AppContext';
import { ALL_TOOLS, TOOL_MAP } from '../../data/categoriesData';
import { relTime } from '../../utils/storage';

const HOME_SHORTCUTS = [
  { id: 'calculator', name: 'Calculator', icon: 'calc', g: 'g4' },
  { id: 'finance', name: 'Finance', icon: 'finance', g: 'g2' },
  { id: 'converter', name: 'Converter', icon: 'conv', g: 'g2' },
  { id: 'network', name: 'Network', icon: 'wifi', g: 'g2' },
  { id: 'text', name: 'Text Tools', icon: 'text', g: 'g3' },
  { id: 'image', name: 'Image Tools', icon: 'img', g: 'g3' },
  { id: 'qr', name: 'QR & Barcode', icon: 'qr', g: 'g4' },
  { id: 'developer', name: 'Developer', icon: 'code', g: 'g4' },
  { id: 'security', name: 'Security', icon: 'shield', g: 'g4' },
  { id: 'device', name: 'Device Info', icon: 'dev', g: 'g3' },
  { id: 'datetime', name: 'Date & Time', icon: 'clock', g: 'g2' },
  { id: 'measurement', name: 'Measurement', icon: 'ruler', g: 'g3' },
];

export const HomeScreen: React.FC = () => {
  const {
    navigate,
    navigateCategory,
    recents,
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

  const defaultRecents = useMemo(() => {
    if (recents && recents.length > 0) {
      return recents.map((r, i) => {
        const screenId = r.screen || (r as any).targetScreen || r.id || 'std-calc';
        return {
          id: r.id || screenId,
          name: r.name || screenId,
          icon: r.icon || 'tools',
          cat: r.cat || 'Tool',
          timestamp: r.timestamp || Date.now() - i * 1000,
          screen: screenId,
          uniqueKey: `recent-${screenId}-${r.timestamp || i}-${i}`,
        };
      });
    }
    return [];
  }, [recents]);

  return (
    <>
      <div className="body" style={{ overflowY: 'auto' }}>
        {/* Header */}
        <div className="hd" style={{ padding: '2px 0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo width={26} id="hd-lg" />
            <span
              style={{
                fontSize: '24px',
                fontWeight: 900,
                letterSpacing: '-0.8px',
                lineHeight: 1,
              }}
            >
              Aero<span style={{ color: 'var(--act)' }}>Kit</span>
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
              borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--ac),var(--cy))',
              color: 'var(--onac)',
              fontSize: '11px',
              fontWeight: 800,
              boxShadow: '0 0 14px rgba(198,255,61,0.35)',
            }}
          >
            AK
          </button>
        </div>

        {/* Search */}
        <div className="srch glass">
          <Icon name="search" size={18} color="var(--dim)" />
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
                background: 'var(--s3)',
                color: 'var(--tx)',
                display: 'grid',
                placeItems: 'center',
                fontSize: '11px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          ) : (
            <Icon name="sliders" size={17} color="var(--dim)" />
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
            {/* Hero Card */}
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
                <Icon name="arrow" size={17} color="#222" />
              </button>
            </div>

            {/* Quick Categories */}
            <div className="sec" style={{ marginTop: '14px' }}>
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

            <div className="tiles">
              {HOME_SHORTCUTS.map((c) => (
                <button
                  key={c.id}
                  className="tile glass"
                  type="button"
                  onClick={() => navigateCategory(c.id, 'home')}
                  title={`${c.name} Tools`}
                >
                  <span
                    className={`ci ${c.g}`}
                    style={{ width: '32px', height: '32px', borderRadius: '10px' }}
                  >
                    <Icon name={c.icon} size={18} color="#fff" />
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--tx)',
                      textAlign: 'center',
                    }}
                  >
                    {c.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Recently Used (Hidden by default when no tools have been used) */}
            {defaultRecents.length > 0 && (
              <>
                <div className="sec" style={{ marginTop: '10px' }}>
                  <span>Recently Used</span>
                  <a
                    onClick={() => navigate('cats')}
                    role="link"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                  >
                    See all ›
                  </a>
                </div>

                {defaultRecents.map((r, idx) => {
                  const isFav = favorites.includes(r.name);
                  return (
                    <div
                      key={r.uniqueKey || `recent-${r.id || r.screen || idx}-${idx}`}
                      className="rec glass"
                      onClick={() => navigate(r.screen || r.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '14px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        className="mini"
                        style={{ width: '32px', height: '32px', borderRadius: '10px' }}
                      >
                        <Icon name={r.icon || 'tools'} size={17} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            display: 'block',
                          }}
                        >
                          {r.name}
                        </span>
                        <small style={{ color: 'var(--mut)', fontSize: '10.5px' }}>
                          {r.cat} · {relTime(r.timestamp)}
                        </small>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(r.name);
                        }}
                        style={{
                          padding: '4px',
                          color: isFav ? 'var(--ac)' : 'var(--dim)',
                        }}
                        aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                      >
                        <Icon
                          name="star"
                          size={15}
                          color={isFav ? 'var(--ac)' : 'var(--dim)'}
                        />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
      <NavBar activeTab="home" />
    </>
  );
};

export default HomeScreen;
