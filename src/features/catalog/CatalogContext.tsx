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

  const value = useMemo(
    () => ({
      ...catalog,
      isLoading,
      refresh,
    }),
    [catalog, isLoading, refresh],
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
