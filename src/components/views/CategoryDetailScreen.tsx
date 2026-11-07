import React from 'react';
import { Header } from '../common/Header';
import { Icon } from '../common/Icon';
import { NavBar } from '../common/NavBar';
import { useApp } from '../../context/AppContext';
import { CATEGORIES_DATA } from '../../data/categoriesData';

export const CategoryDetailScreen: React.FC = () => {
  const {
    selectedCategory,
    categoryFrom,
    navigate,
    navigateCategory,
    favorites,
    toggleFavorite,
  } = useApp();

  const cat = CATEGORIES_DATA[selectedCategory] || CATEGORIES_DATA.calculator;
  const hasSubs = cat.subcategories && cat.subcategories.length > 0;
  const countBadge = hasSubs
    ? `${cat.subcategories!.length} Categories`
    : `${cat.tools.length} Tools`;
  const secTitle = hasSubs ? 'Category Listing' : 'Tools Listing';

  const handleBack = () => {
    if (cat.id === 'programming') {
      navigateCategory('lab', 'cats');
    } else {
      navigate(categoryFrom === 'cats' ? 'cats' : 'home');
    }
  };

  return (
    <>
      <div className="body" style={{ overflowY: 'auto' }}>
        <Header title={cat.name} onBack={handleBack} />

        {/* Hero banner */}
        <div
          className="hero glass"
          style={{
            padding: '16px',
            marginBottom: '14px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            border: '1px solid var(--bd)',
            height: 'auto',
          }}
        >
          <span
            className={`ci ${cat.gradientClass}`}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            }}
          >
            <Icon name={cat.icon} size={24} color="#fff" />
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
              {cat.name}
            </h2>
            <p
              style={{
                fontSize: '11.5px',
                color: 'var(--mut)',
                lineHeight: 1.4,
                margin: '4px 0 0',
              }}
            >
              {cat.description}
            </p>
          </div>
        </div>

        <div className="sec" style={{ marginBottom: '10px' }}>
          <span>{secTitle}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            paddingBottom: '24px',
          }}
        >
          {hasSubs
            ? cat.subcategories!.map((sub, idx) => (
                <div
                  key={`sub-${sub.id || idx}-${idx}`}
                  className="glass-interactive"
                  onClick={() => navigateCategory(sub.id, 'lab')}
                  style={{
                    cursor: 'pointer',
                    padding: '16px 6px 12px',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '8px',
                    border: '1px solid var(--bd)',
                    background: 'var(--glass-bg)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    minHeight: '106px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: 'var(--s2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ac)',
                      border: '1px solid var(--bd2)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={sub.icon} size={22} />
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--tx)',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      maxWidth: '100%',
                      padding: '0 2px',
                    }}
                  >
                    {sub.name}
                  </span>
                </div>
              ))
            : cat.tools.map((tool, idx) => (
                <div
                  key={`tool-${tool.id || idx}-${idx}`}
                  className="glass-interactive"
                  onClick={() => navigate(tool.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px 6px 12px',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '8px',
                    border: '1px solid var(--bd)',
                    background: 'var(--glass-bg)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                    minHeight: '106px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: 'var(--s2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ac)',
                      border: '1px solid var(--bd2)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={tool.icon} size={22} />
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--tx)',
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      maxWidth: '100%',
                      padding: '0 2px',
                    }}
                  >
                    {tool.name}
                  </span>
                </div>
              ))}
        </div>
      </div>
      <NavBar activeTab="cats" />
    </>
  );
};

export default CategoryDetailScreen;
