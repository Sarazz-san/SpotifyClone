import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {Catalog} from './catalogService';
import {demoCatalog, emptyCatalog, loadCatalog} from './catalogService';
import {isFirebaseConfigured} from '../../firebase/firebaseAvailability';

type CatalogContextValue = Catalog & {
  isLoading: boolean;
  refresh: () => Promise<void>;
  genres: string[];
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({children}: {children: React.ReactNode}) {
  const [catalog, setCatalog] = useState<Catalog>(
    isFirebaseConfigured() ? emptyCatalog : demoCatalog
  );
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setCatalog(await loadCatalog());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const genres = useMemo(() => {
    const set = new Set<string>();
    catalog.tracks.forEach(t => {
      if (t.genre) set.add(String(t.genre));
    });
    return Array.from(set);
  }, [catalog.tracks]);

  const value = useMemo(
    () => ({
      ...catalog,
      isLoading,
      refresh,
      genres,
    }),
    [catalog, isLoading, refresh, genres],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error('useCatalog must be used inside CatalogProvider');
  }

  return context;
}
