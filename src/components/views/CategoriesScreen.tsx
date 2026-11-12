import React, { useState, useMemo, useRef } from 'react';
import { Header } from '../common/Header';
import { Icon } from '../common/Icon';
import { NavBar } from '../common/NavBar';
import { useApp } from '../../context/AppContext';
import { CATEGORIES_LIST, CATEGORIES_DATA, ALL_TOOLS } from '../../data/categoriesData';

export const CategoriesScreen: React.FC = () => {
  const { navigate, navigateCategory } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Helper to dynamically calculate current visible tool count per category
  const getCategoryToolCount = (catId: string): number => {
    const d = CATEGORIES_DATA[catId];
    if (!d) return 0;
    if (d.tools && Array.isArray(d.tools)) {
      return d.tools.length;
    }
    if (d.subcategories && Array.isArray(d.subcategories)) {
      return d.subcategories.reduce(
        (acc, sub) => acc + (sub.tools ? sub.tools.length : 0),
        0
      );
    }
    return 0;
  };

  // Instant tool search across all categories
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_TOOLS.filter(
      (item) =>
        item.tool.name.toLowerCase().includes(q) ||
        item.tool.description.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSearchToggle = () => {
    setShowSearch((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery('');
      }
      return next;
    });
  };

  return (
    <>
      <div className="body" style={{ overflowY: 'auto', width: '100%' }}>
        {/* Header with Functional Search Icon */}
        <Header
          title="Tools"
          showBack={false}
          rightAction={
            <button
              className="ib"
              onClick={handleSearchToggle}
              aria-label="Search tools"
              type="button"
              title="Search tools"
              style={{
                background: showSearch ? 'rgba(69, 217, 232, 0.18)' : undefined,
                color: showSearch ? 'var(--cy)' : 'var(--tx)',
              }}
            >
              <Icon name="search" size={19} />
            </button>
          }
        />

        {/* Functional Search Bar */}
        {(showSearch || searchQuery) && (
          <div
            style={{
              paddingBottom: '14px',
              width: '100%',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--s2)',
                border: '1.5px solid var(--bd)',
                borderRadius: '16px',
                padding: '10px 14px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Icon name="search" size={18} color="var(--cy)" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tools across all categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--tx)',
                  fontSize: '14px',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mut)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category List or Search Results */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingBottom: '24px',
            width: '100%',
          }}
        >
          {searchQuery.trim() !== '' ? (
            /* Search Results Listing */
            searchResults.length > 0 ? (
              searchResults.map(({ tool, categoryName }) => (
                <div
                  key={tool.id}
                  className="rec glass"
                  onClick={() => navigate(tool.targetScreen || tool.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(tool.targetScreen || tool.id);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    border: '1px solid var(--bd)',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    className="ci g4"
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '13px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    <Icon name={tool.icon || 'tools'} size={20} color="#fff" />
                  </span>

                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 800,
                          margin: 0,
                          color: 'var(--tx)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {tool.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--cy)',
                          background: 'rgba(69,217,232,0.12)',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {categoryName}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--mut)',
                        margin: '3px 0 0',
                        lineHeight: 1.35,
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {tool.description}
                    </p>
                  </div>

                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--s2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--mut)',
                    }}
                  >
                    <Icon name="chev" size={14} />
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  color: 'var(--mut)',
                  fontSize: '14px',
                }}
              >
                No tools found matching &quot;{searchQuery}&quot;
              </div>
            )
          ) : (
            /* Default Categories List with Name • Tool Count */
            CATEGORIES_LIST.map((c) => {
              const d = CATEGORIES_DATA[c.id];
              const count = getCategoryToolCount(c.id);
              return (
                <div
                  key={c.id}
                  className="rec glass"
                  onClick={() => navigateCategory(c.id, 'cats')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigateCategory(c.id, 'cats');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    border: '1px solid var(--bd)',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    className={`ci ${c.gradientClass}`}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '13px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    <Icon name={c.icon} size={22} color="#fff" />
                  </span>

                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 800,
                          margin: 0,
                          color: 'var(--tx)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.name}
                      </h3>
                    </div>

                    <p
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--mut)',
                        margin: '3px 0 0',
                        lineHeight: 1.35,
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {(d && d.description) || 'Explore available utility modules'}
                    </p>
                  </div>

                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--s2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--mut)',
                    }}
                  >
                    <Icon name="chev" size={14} />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
      <NavBar activeTab="cats" />
    </>
  );
};

export default CategoriesScreen;
