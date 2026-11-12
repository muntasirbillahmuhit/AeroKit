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
            gap: '10px',
            paddingBottom: '24px',
          }}
        >
          {hasSubs
            ? cat.subcategories!.map((sub, idx) => (
                <div
                  key={`sub-${sub.id || idx}-${idx}`}
                  className="rec glass"
                  onClick={() => navigateCategory(sub.id, 'lab')}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid var(--bd)',
                  }}
                >
                  <span
                    className={`ci ${sub.gradientClass}`}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '13px',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    <Icon name={sub.icon} size={22} color="#fff" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        display: 'block',
                        color: 'var(--tx)',
                      }}
                    >
                      {sub.name}
                    </span>
                    <small
                      style={{
                        color: 'var(--mut)',
                        fontSize: '11.5px',
                        marginTop: '2px',
                        display: 'block',
                      }}
                    >
                      {sub.description}
                    </small>
                  </div>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
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
            : cat.tools.map((tool, idx) => {
                const isFav = favorites.includes(tool.name);
                return (
                  <div
                    key={`tool-${tool.id || idx}-${idx}`}
                    className="rec glass"
                    onClick={() => navigate(tool.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      border: '1px solid var(--bd)',
                    }}
                  >
                    <span
                      className="mini"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: 'var(--s2)',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={tool.icon} size={20} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          display: 'block',
                          color: 'var(--tx)',
                        }}
                      >
                        {tool.name}
                      </span>
                      <small
                        style={{
                          color: 'var(--mut)',
                          fontSize: '11.5px',
                          marginTop: '2px',
                          display: 'block',
                        }}
                      >
                        {tool.description}
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(tool.name);
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
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
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
              })}
        </div>
      </div>
      <NavBar activeTab="cats" />
    </>
  );
};

export default CategoryDetailScreen;
