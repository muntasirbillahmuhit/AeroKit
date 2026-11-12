import React from 'react';
import { Header } from '../common/Header';
import { Icon } from '../common/Icon';
import { NavBar } from '../common/NavBar';
import { useApp } from '../../context/AppContext';
import { ALL_TOOLS, TOOL_MAP } from '../../data/categoriesData';

export const FavoritesScreen: React.FC = () => {
  const { favorites, toggleFavorite, navigate } = useApp();

  function resolveFavorite(name: string) {
    for (const item of ALL_TOOLS) {
      if (item.tool.name === name || item.tool.id === name) {
        return { screen: item.tool.id, tool: item.tool };
      }
    }
    const fallbackMap: Record<string, string> = {
      Calculator: 'std-calc',
      'Standard Calculator': 'std-calc',
      Converter: 'len-conv',
      'Unit Converter': 'len-conv',
      'Length Converter': 'len-conv',
      Network: 'internet-speed-tester',
      'Network Tools': 'internet-speed-tester',
      'QR Scanner': 'qr-scan',
      'QR & Barcode': 'qr-scan',
      'Image Tools': 'img-compress',
    };
    if (fallbackMap[name] && TOOL_MAP[fallbackMap[name]]) {
      const t = TOOL_MAP[fallbackMap[name]];
      return { screen: t.id, tool: t };
    }
    return null;
  }

  return (
    <>
      <div className="body">
        <Header title="Favorites" showBack={false} />

        {favorites.length === 0 ? (
          <div
            className="glass"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              marginTop: '28px',
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--bd)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--s2)',
                color: 'var(--mut)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
                border: '1px solid var(--bd)',
              }}
            >
              <Icon name="star" size={28} color="var(--dim)" />
            </div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: 'var(--tx)',
                margin: '0 0 6px',
              }}
            >
              No Favorites Yet
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--mut)',
                lineHeight: 1.5,
                maxWidth: '260px',
                margin: 0,
              }}
            >
              Star your favorite tools for instant quick access.
            </p>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' }}>
            <div className="sec" style={{ margin: '6px 0 10px' }}>
              <span>Starred Utilities ({favorites.length})</span>
            </div>
            {favorites.map((f, idx) => {
              const route = resolveFavorite(f);
              return (
                <div
                  key={`fav-${f}-${idx}`}
                  className="rec glass"
                  onClick={() => {
                    if (route) navigate(route.screen);
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '11px 14px',
                    borderRadius: '16px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span
                    className="mini"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                    }}
                  >
                    <Icon name="star" size={16} color="var(--ac)" />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        display: 'block',
                      }}
                    >
                      {f}
                    </span>
                    <small
                      style={{
                        color: 'var(--mut)',
                        fontSize: '11px',
                        marginTop: '2px',
                        display: 'block',
                      }}
                    >
                      {route ? `${route.tool.categoryName || 'Tool'} · Tap to Launch` : 'Active Tool'}
                    </small>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(f);
                    }}
                    style={{ padding: '6px' }}
                    aria-label="Remove favorite"
                  >
                    <Icon name="star" size={16} color="var(--ac)" />
                  </button>
                  <Icon name="chev" size={14} color="var(--mut)" />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <NavBar activeTab="fav" />
    </>
  );
};

export default FavoritesScreen;
