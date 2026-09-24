import Storage from "expo-sqlite/kv-store";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  CurrencyOption,
  FALLBACK_CRYPTO_CURRENCIES,
  FALLBACK_FIAT_CURRENCIES,
  INITIAL_CURRENCIES,
} from "@/constants/currencies";
import { CurrencyCatalog, fetchCurrencyCatalog } from "@/services/currency-api";

type CurrencyContextValue = {
  selectedCurrencies: CurrencyOption[];
  fiatCurrencies: CurrencyOption[];
  cryptoCurrencies: CurrencyOption[];
  isRefreshing: boolean;
  keypadSoundEnabled: boolean;
  liveStatus: string | null;
  lastUpdated: number | null;
  replaceCurrency: (slot: number, currency: CurrencyOption) => void;
  refreshRates: (force?: boolean) => Promise<void>;
  setKeypadSoundEnabled: (enabled: boolean) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const keypadSoundStorageKey = "vibe-converter:keypad-sound-enabled";

const fallbackCatalog: CurrencyCatalog = {
  fiat: FALLBACK_FIAT_CURRENCIES,
  crypto: FALLBACK_CRYPTO_CURRENCIES,
  updatedAt: null,
  hasLiveFiat: false,
  hasLiveCrypto: false,
  hasCachedRates: false,
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrencies, setSelectedCurrencies] = useState(INITIAL_CURRENCIES);
  const [catalog, setCatalog] = useState(fallbackCatalog);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [keypadSoundEnabled, setKeypadSoundEnabledState] = useState(true);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  const setKeypadSoundEnabled = useCallback((enabled: boolean) => {
    setKeypadSoundEnabledState(enabled);
    void Storage.setItem(keypadSoundStorageKey, String(enabled)).catch(() => undefined);
  }, []);

  useEffect(() => {
    void Storage.getItem(keypadSoundStorageKey)
      .then((savedValue) => {
        if (savedValue === "true" || savedValue === "false") {
          setKeypadSoundEnabledState(savedValue === "true");
        }
      })
      .catch(() => undefined);
  }, []);

  const refreshRates = useCallback(async (force = false) => {
    setIsRefreshing(true);
    try {
      const nextCatalog = await fetchCurrencyCatalog(force);
      setCatalog(nextCatalog);
      const liveCurrencies = new Map(
        [...nextCatalog.fiat, ...nextCatalog.crypto].map((currency) => [currency.id, currency]),
      );
      const liveCurrenciesByCode = new Map(
        [...nextCatalog.fiat, ...nextCatalog.crypto].map((currency) => [
          `${currency.kind}:${currency.code}`,
          currency,
        ]),
      );
      setSelectedCurrencies((current) =>
        current.map(
          (currency) =>
            liveCurrencies.get(currency.id) ??
            liveCurrenciesByCode.get(`${currency.kind}:${currency.code}`) ??
            currency,
        ),
      );

      if (!nextCatalog.hasLiveFiat && !nextCatalog.hasLiveCrypto && nextCatalog.hasCachedRates) {
        setLiveStatus("Offline. Showing saved rates.");
      } else if (!nextCatalog.hasLiveFiat && !nextCatalog.hasLiveCrypto) {
        setLiveStatus("Live rates unavailable. Showing fallback data.");
      } else if (!nextCatalog.hasLiveFiat) {
        setLiveStatus("Fiat rates unavailable. Crypto prices are live.");
      } else if (!nextCatalog.hasLiveCrypto) {
        setLiveStatus("Crypto prices unavailable. Fiat rates are live.");
      } else {
        setLiveStatus(null);
      }
    } catch {
      setLiveStatus("Live rates unavailable. Showing fallback data.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => refreshRates());
  }, [refreshRates]);

  const replaceCurrency = useCallback((slot: number, currency: CurrencyOption) => {
    setSelectedCurrencies((current) =>
      current.map((item, index) => (index === slot ? currency : item)),
    );
  }, []);

  const value = useMemo(
    () => ({
      selectedCurrencies,
      fiatCurrencies: catalog.fiat,
      cryptoCurrencies: catalog.crypto,
      isRefreshing,
      keypadSoundEnabled,
      liveStatus,
      lastUpdated: catalog.updatedAt,
      replaceCurrency,
      refreshRates,
      setKeypadSoundEnabled,
    }),
    [
      catalog,
      isRefreshing,
      keypadSoundEnabled,
      liveStatus,
      refreshRates,
      replaceCurrency,
      selectedCurrencies,
      setKeypadSoundEnabled,
    ],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrencies() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrencies must be used inside CurrencyProvider");
  return context;
}
