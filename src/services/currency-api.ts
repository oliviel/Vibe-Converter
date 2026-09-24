import {
  CurrencyOption,
  FALLBACK_CRYPTO_CURRENCIES,
  FALLBACK_FIAT_CURRENCIES,
  getCryptoIcon,
  getCurrencyFlag,
  getCurrencyName,
  POPULAR_FIAT_CODES,
} from "@/constants/currencies";
import Storage from "expo-sqlite/kv-store";

const FIAT_RATES_URL = "https://open.er-api.com/v6/latest/USD";
const CRYPTO_RATES_URL = "https://api.coinlore.net/api/tickers/?start=0&limit=100";

type FiatResponse = {
  result: string;
  time_last_update_unix: number;
  rates: Record<string, number>;
};

type CryptoTicker = {
  id: string;
  name: string;
  symbol: string;
  rank: number | string;
  price_usd: string;
};

type CryptoResponse = { data: CryptoTicker[] };

export type CurrencyCatalog = {
  fiat: CurrencyOption[];
  crypto: CurrencyOption[];
  updatedAt: number | null;
  hasLiveFiat: boolean;
  hasLiveCrypto: boolean;
  hasCachedRates: boolean;
};

let cachedCatalog: CurrencyCatalog | null = null;
let pendingRequest: Promise<CurrencyCatalog> | null = null;
let cachedCatalogLoad: Promise<CurrencyCatalog | null> | null = null;

const currencyCatalogStorageKey = "vibe-converter:currency-catalog";

type StoredCurrencyCatalog = Pick<CurrencyCatalog, "fiat" | "crypto" | "updatedAt">;

function isCurrencyOption(value: unknown): value is CurrencyOption {
  if (!value || typeof value !== "object") return false;
  const currency = value as Record<string, unknown>;
  return (
    typeof currency.id === "string" &&
    typeof currency.code === "string" &&
    typeof currency.name === "string" &&
    typeof currency.icon === "string" &&
    (currency.kind === "fiat" || currency.kind === "crypto") &&
    typeof currency.usdRate === "number" &&
    Number.isFinite(currency.usdRate) &&
    currency.usdRate > 0 &&
    (currency.rank === undefined || (typeof currency.rank === "number" && Number.isFinite(currency.rank)))
  );
}

async function loadStoredCatalog(): Promise<CurrencyCatalog | null> {
  if (cachedCatalogLoad) return cachedCatalogLoad;

  cachedCatalogLoad = Storage.getItem(currencyCatalogStorageKey)
    .then((storedValue) => {
      if (!storedValue) return null;
      const parsedValue: unknown = JSON.parse(storedValue);
      if (!parsedValue || typeof parsedValue !== "object") return null;
      const catalog = parsedValue as Partial<StoredCurrencyCatalog>;
      if (
        !Array.isArray(catalog.fiat) ||
        !Array.isArray(catalog.crypto) ||
        !catalog.fiat.every(isCurrencyOption) ||
        !catalog.crypto.every(isCurrencyOption) ||
        (catalog.updatedAt !== null && (typeof catalog.updatedAt !== "number" || !Number.isFinite(catalog.updatedAt)))
      ) {
        return null;
      }

      return {
        fiat: catalog.fiat,
        crypto: catalog.crypto,
        updatedAt: catalog.updatedAt ?? null,
        hasLiveFiat: false,
        hasLiveCrypto: false,
        hasCachedRates: true,
      };
    })
    .catch(() => null);

  return cachedCatalogLoad;
}

function saveCatalog(catalog: CurrencyCatalog) {
  const storedCatalog: StoredCurrencyCatalog = {
    fiat: catalog.fiat,
    crypto: catalog.crypto,
    updatedAt: catalog.updatedAt,
  };
  return Storage.setItem(currencyCatalogStorageKey, JSON.stringify(storedCatalog));
}

function sortFiatCurrencies(a: CurrencyOption, b: CurrencyOption) {
  const aIndex = POPULAR_FIAT_CODES.indexOf(a.code);
  const bIndex = POPULAR_FIAT_CODES.indexOf(b.code);
  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }
  return a.name.localeCompare(b.name);
}

async function fetchFiatCurrencies() {
  const response = await fetch(FIAT_RATES_URL);
  if (!response.ok) throw new Error(`Fiat rates request failed (${response.status})`);
  const data = (await response.json()) as FiatResponse;
  if (data.result !== "success" || !data.rates) throw new Error("Invalid fiat rates response");

  return {
    currencies: Object.entries(data.rates)
      .filter(([, rate]) => Number.isFinite(rate) && rate > 0)
      .map(([code, unitsPerUsd]) => ({
        id: `fiat:${code}`,
        code,
        name: getCurrencyName(code),
        icon: getCurrencyFlag(code),
        kind: "fiat" as const,
        usdRate: 1 / unitsPerUsd,
      }))
      .sort(sortFiatCurrencies),
    updatedAt: data.time_last_update_unix * 1000,
  };
}

async function fetchCryptoCurrencies() {
  const response = await fetch(CRYPTO_RATES_URL);
  if (!response.ok) throw new Error(`Crypto rates request failed (${response.status})`);
  const responseData = (await response.json()) as CryptoResponse;
  if (!Array.isArray(responseData.data)) throw new Error("Invalid crypto rates response");

  return responseData.data
    .filter((ticker) => Number(ticker.rank) > 0 && Number(ticker.rank) <= 100 && Number(ticker.price_usd) > 0)
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .map((ticker) => ({
      id: `crypto:coinlore:${ticker.id}`,
      code: ticker.symbol.toUpperCase(),
      name: ticker.name,
      icon: getCryptoIcon(ticker.symbol.toUpperCase()),
      kind: "crypto" as const,
      usdRate: Number(ticker.price_usd),
      rank: Number(ticker.rank),
    }));
}

export async function fetchCurrencyCatalog(force = false): Promise<CurrencyCatalog> {
  if (!force && cachedCatalog) return cachedCatalog;
  if (!force && pendingRequest) return pendingRequest;

  pendingRequest = (async () => {
    const storedCatalog = cachedCatalog ?? (await loadStoredCatalog());
    const [fiatResult, cryptoResult] = await Promise.allSettled([
      fetchFiatCurrencies(),
      fetchCryptoCurrencies(),
    ]);

    const catalog: CurrencyCatalog = {
      fiat: fiatResult.status === "fulfilled" ? fiatResult.value.currencies : (storedCatalog?.fiat ?? FALLBACK_FIAT_CURRENCIES),
      crypto: cryptoResult.status === "fulfilled" ? cryptoResult.value : (storedCatalog?.crypto ?? FALLBACK_CRYPTO_CURRENCIES),
      updatedAt: fiatResult.status === "fulfilled" ? fiatResult.value.updatedAt : (storedCatalog?.updatedAt ?? null),
      hasLiveFiat: fiatResult.status === "fulfilled",
      hasLiveCrypto: cryptoResult.status === "fulfilled",
      hasCachedRates: Boolean(storedCatalog),
    };
    cachedCatalog = catalog;
    if (catalog.hasLiveFiat || catalog.hasLiveCrypto) {
      void saveCatalog(catalog).catch(() => undefined);
    }
    return catalog;
  })();

  try {
    return await pendingRequest;
  } finally {
    pendingRequest = null;
  }
}
