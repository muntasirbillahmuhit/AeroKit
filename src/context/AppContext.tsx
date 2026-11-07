import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { store } from '../utils/storage';
import { TOOL_MAP, CATEGORY_ALIASES } from '../data/categoriesData';

export interface RecentItem {
  id: string;
  name: string;
  icon: string;
  cat: string;
  timestamp: number;
  screen: string;
}

interface AppContextType {
  screen: string;
  previousScreen: string | null;
  favorites: string[];
  recents: RecentItem[];
  dark: boolean;
  language: string;
  notifications: boolean;
  selectedCategory: string;
  categoryFrom: string;
  qrMode: 'scan' | 'gen';
  toastMessage: string | null;
  toast: (msg: string) => void;
  navigate: (screenId: string, qrMode?: 'scan' | 'gen') => void;
  navigateBack: () => void;
  navigateCategory: (catId: string, from?: string) => void;
  toggleFavorite: (name: string) => void;
  setTheme: (dark: boolean) => void;
  setLanguage: (lang: string) => void;
  setNotifications: (val: boolean) => void;
  clearHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const NO_RECENT: Record<string, boolean> = {
  splash: true,
  home: true,
  cats: true,
  'cat-detail': true,
  fav: true,
  settings: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<string>(() => {
    try {
      return sessionStorage.getItem('aerokit_seen_splash') ? 'home' : 'splash';
    } catch {
      return 'splash';
    }
  });

  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() =>
    store.get('aerokit_favorites', [])
  );
  const [recents, setRecents] = useState<RecentItem[]>(() => {
    try {
      const raw = store.get<any[]>('aerokit_recent_tools', []);
      if (!Array.isArray(raw) || raw.length === 0) return [];
      // Clean and validate existing items
      const valid: RecentItem[] = [];
      const seen = new Set<string>();

      for (const r of raw) {
        if (!r || typeof r !== 'object') continue;
        const screenId = r.screen || r.id;
        if (!screenId || typeof screenId !== 'string' || NO_RECENT[screenId] || seen.has(screenId)) continue;
        seen.add(screenId);

        const meta = TOOL_MAP[screenId] || {};
        valid.push({
          id: screenId,
          name: r.name || meta.name || screenId,
          icon: r.icon || meta.icon || 'tools',
          cat: r.cat || meta.categoryName || 'Tool',
          timestamp: typeof r.timestamp === 'number' ? r.timestamp : Date.now(),
          screen: screenId,
        });
        if (valid.length >= 6) break;
      }
      return valid;
    } catch {
      return [];
    }
  });
  const [dark, setDarkState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aerokit_theme') !== 'light';
    } catch {
      return true;
    }
  });
  const [language, setLanguage] = useState<string>('English');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('calculators-math');
  const [categoryFrom, setCategoryFrom] = useState<string>('home');
  const [qrMode, setQrMode] = useState<'scan' | 'gen'>('scan');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', dark ? '#111820' : '#F3F6F8');
    try {
      localStorage.setItem('aerokit_theme', dark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [dark]);

  const toast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useCallback(
    (screenId: string, mode?: 'scan' | 'gen') => {
      if (mode) setQrMode(mode);
      if (screenId === 'home') {
        try {
          sessionStorage.setItem('aerokit_seen_splash', 'true');
        } catch {
          // ignore
        }
      }

      // Record recent tools automatically upon user opening
      if (!NO_RECENT[screenId]) {
        const meta = TOOL_MAP[screenId] || {};
        const name = meta.name || screenId;
        const iconName = meta.icon || 'tools';
        const catName = meta.categoryName || 'Tool';

        setRecents((prev) => {
          // Remove any existing entry for this tool to prevent duplicates
          const filtered = prev.filter((r) => r.screen !== screenId && r.id !== screenId);
          // Prepend newest first and cap at 6 items
          const updated: RecentItem[] = [
            {
              id: screenId,
              name,
              icon: iconName,
              cat: catName,
              timestamp: Date.now(),
              screen: screenId,
            },
            ...filtered,
          ].slice(0, 6);
          store.set('aerokit_recent_tools', updated);
          return updated;
        });
      }

      setHistoryStack((prev) => [...prev, screen]);
      setScreen(screenId);
    },
    [screen]
  );

  const navigateBack = useCallback(() => {
    if (historyStack.length > 0) {
      const prev = historyStack[historyStack.length - 1];
      setHistoryStack((stack) => stack.slice(0, -1));
      setScreen(prev);
    } else {
      setScreen('home');
    }
  }, [historyStack]);

  const navigateCategory = useCallback(
    (catId: string, from?: string) => {
      const resolved = CATEGORY_ALIASES[catId] || catId;
      setSelectedCategory(resolved);
      if (from) setCategoryFrom(from);
      navigate('cat-detail');
    },
    [navigate]
  );

  const toggleFavorite = useCallback(
    (name: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(name);
        const next = exists ? prev.filter((n) => n !== name) : [...prev, name];
        store.set('aerokit_favorites', next);
        toast(exists ? `Removed ${name} from favorites` : `Added ${name} to favorites`);
        return next;
      });
    },
    [toast]
  );

  const setTheme = useCallback((isDark: boolean) => {
    setDarkState(isDark);
  }, []);

  const clearHistory = useCallback(() => {
    setRecents([]);
    store.set('aerokit_recent_tools', []);
    try {
      localStorage.removeItem('aerokit_recent_tools');
    } catch {}
    toast('History cleared');
  }, [toast]);

  return (
    <AppContext.Provider
      value={{
        screen,
        previousScreen: historyStack[historyStack.length - 1] || null,
        favorites,
        recents,
        dark,
        language,
        notifications,
        selectedCategory,
        categoryFrom,
        qrMode,
        toastMessage,
        toast,
        navigate,
        navigateBack,
        navigateCategory,
        toggleFavorite,
        setTheme,
        setLanguage,
        setNotifications,
        clearHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
